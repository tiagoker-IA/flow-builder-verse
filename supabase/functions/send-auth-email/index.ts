import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: SendEmailPayload = await req.json();
    const { user, email_data } = payload;

    const email = user.email;
    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    // Build confirmation URL
    const confirmUrl = `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to || site_url)}`;

    let subject = "";
    let htmlContent = "";

    switch (email_action_type) {
      case "recovery":
        subject = "Recuperação de senha";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Recuperação de senha</h2>
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Redefinir senha
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se você não solicitou a redefinição de senha, ignore este email.</p>
            <p style="color: #666; font-size: 12px;">Ou copie e cole este link no seu navegador: ${confirmUrl}</p>
          </div>
        `;
        break;

      case "signup":
        subject = "Confirme seu email";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Bem-vindo!</h2>
            <p>Olá,</p>
            <p>Obrigado por se cadastrar. Clique no botão abaixo para confirmar seu email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Se você não criou esta conta, ignore este email.</p>
            <p style="color: #666; font-size: 12px;">Ou copie e cole este link no seu navegador: ${confirmUrl}</p>
          </div>
        `;
        break;

      case "magiclink":
        subject = "Seu link de acesso";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Link de acesso</h2>
            <p>Olá,</p>
            <p>Clique no botão abaixo para acessar sua conta:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar conta
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">Ou copie e cole este link no seu navegador: ${confirmUrl}</p>
          </div>
        `;
        break;

      case "email_change":
        subject = "Confirme a alteração de email";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Alteração de email</h2>
            <p>Olá,</p>
            <p>Clique no botão abaixo para confirmar a alteração do seu email:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar alteração
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">Ou copie e cole este link no seu navegador: ${confirmUrl}</p>
          </div>
        `;
        break;

      default:
        subject = "Notificação";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Notificação</h2>
            <p>Olá,</p>
            <p>Clique no link abaixo:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" 
                 style="background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Clique aqui
              </a>
            </div>
          </div>
        `;
    }

    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    if (!resendRes.ok) {
      const errorBody = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errorBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendData = await resendRes.json();
    console.log("Email sent successfully:", resendData.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Send auth email error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
