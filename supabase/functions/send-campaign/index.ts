import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: authError } = await supabaseAuth.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaignId } = await req.json();
    if (!campaignId) {
      return new Response(JSON.stringify({ error: "ID da campanha é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get campaign
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("email_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(JSON.stringify({ error: "Campanha não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if Resend is configured
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Serviço de email não configurado",
          message: "Para enviar emails, configure a API key do Resend. Acesse resend.com, crie uma conta, verifique seu domínio e forneça a API key.",
          needsConfig: true,
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check cooldown: prevent sending more than 1 campaign per hour
    const { data: recentCampaigns } = await supabaseAdmin
      .from("email_campaigns")
      .select("id")
      .eq("status", "enviada")
      .gte("sent_at", new Date(Date.now() - 3600000).toISOString());

    if (recentCampaigns && recentCampaigns.length > 0) {
      return new Response(
        JSON.stringify({ error: "Aguarde pelo menos 1 hora entre envios de campanhas." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all users
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emails = (usersData?.users || []).map((u: any) => u.email).filter(Boolean);

    // Update campaign status
    await supabaseAdmin
      .from("email_campaigns")
      .update({ status: "enviando", total_destinatarios: emails.length })
      .eq("id", campaignId);

    // Send emails via Resend in batches with rate limiting
    const BATCH_SIZE = 50;
    const DELAY_MS = 2000;
    let enviados = 0;
    try {
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);

        await Promise.all(batch.map(async (email: string) => {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: Deno.env.get("RESEND_FROM_EMAIL") || "noreply@example.com",
              to: [email],
              subject: campaign.assunto,
              html: campaign.conteudo_html,
            }),
          });

          if (res.ok) {
            enviados++;
          } else {
            const errorText = await res.text();
            console.error(`Failed to send to ${email}:`, errorText);
          }
        }));

        // Update progress after each batch
        await supabaseAdmin
          .from("email_campaigns")
          .update({ enviados_count: enviados })
          .eq("id", campaignId);

        // Rate limit between batches
        if (i + BATCH_SIZE < emails.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }
      }

      await supabaseAdmin
        .from("email_campaigns")
        .update({
          status: "enviada",
          enviados_count: enviados,
          sent_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      return new Response(
        JSON.stringify({ success: true, enviados, total: emails.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (sendError) {
      console.error("Send error:", sendError);
      await supabaseAdmin
        .from("email_campaigns")
        .update({ status: "erro" })
        .eq("id", campaignId);

      return new Response(JSON.stringify({ error: "Erro ao enviar emails" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Send campaign error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
