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

    // Verify user with anon key
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

    // Use service role to check admin and fetch data
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check admin role
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

    // Fetch all stats in parallel
    const [
      usersRes,
      conversasRes,
      mensagensRes,
      feedbacksRes,
      conversasPorModoRes,
      conversasPorDiaRes,
    ] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
      supabaseAdmin.from("conversas").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("feedbacks").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("conversas").select("modo"),
      supabaseAdmin.from("conversas").select("data_criacao").order("data_criacao", { ascending: true }),
    ]);

    // Process users with roles
    const users = usersRes.data?.users || [];
    const totalUsuarios = users.length;

    // Fetch all admin roles
    const { data: adminRoles } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");
    const adminUserIds = new Set((adminRoles || []).map((r: any) => r.user_id));

    const usersList = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_admin: adminUserIds.has(u.id),
    }));

    // Process conversas por modo
    const modoCount: Record<string, number> = {};
    (conversasPorModoRes.data || []).forEach((c: any) => {
      modoCount[c.modo] = (modoCount[c.modo] || 0) + 1;
    });

    // Process conversas por dia (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const conversasPorDia: Record<string, number> = {};
    (conversasPorDiaRes.data || []).forEach((c: any) => {
      const date = new Date(c.data_criacao);
      if (date >= thirtyDaysAgo) {
        const day = date.toISOString().split("T")[0];
        conversasPorDia[day] = (conversasPorDia[day] || 0) + 1;
      }
    });

    const stats = {
      totalUsuarios,
      totalConversas: conversasRes.count || 0,
      totalMensagens: mensagensRes.count || 0,
      totalFeedbacks: (feedbacksRes.data || []).length,
      conversasPorModo: modoCount,
      conversasPorDia,
      feedbacks: feedbacksRes.data || [],
      usuarios: usersList,
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
