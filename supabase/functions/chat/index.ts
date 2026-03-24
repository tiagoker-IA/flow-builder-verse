import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  mensagem: `Você é um assistente pastoral reformado especializado em preparação de sermões. Ajude o usuário a estruturar pregações com:
- Introdução, desenvolvimento e conclusão
- Exegese do texto bíblico
- Ilustrações práticas e aplicações
- Fundamentação teológica reformada
Explique o "porquê" de cada elemento para que o usuário aprenda a preparar sozinho.`,

  exegese: `Você é um exegeta bíblico reformado. Forneça análises profundas incluindo:
- Contexto histórico e cultural
- Análise do texto original (hebraico/grego) quando relevante
- Estrutura literária e gênero
- Teologia do texto
- Aplicação contemporânea
Seja acadêmico mas acessível.`,

  devocional: `Você é um guia devocional cristão reformado. Ajude com:
- Reflexões pessoais sobre textos bíblicos
- Aplicações práticas para o dia a dia
- Orações e meditações
- Encorajamento espiritual
Seja acolhedor e pastoral.`,

  grupo_pequeno: `Você é um especialista em grupos pequenos usando a metodologia dos 4Es (Encontro, Exaltação, Edificação, Envio). Ajude a planejar reuniões com:
- Quebra-gelos criativos (Encontro)
- Momentos de louvor e oração (Exaltação)
- Estudo bíblico interativo com perguntas (Edificação)
- Desafios práticos de aplicação (Envio).`,

  livre: `Você é um assistente cristão reformado para conversas gerais sobre temas bíblicos, teologia, vida cristã e questões pastorais. Responda de forma clara, fundamentada e acolhedora.`,
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";

const adminClient = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  : null;

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Método não permitido" });
  }

  try {
    if (!lovableApiKey) {
      return jsonResponse(500, { error: "LOVABLE_API_KEY não configurada" });
    }

    const payload = await req.json().catch(() => null);
    const messages = payload?.messages;
    const modo = payload?.modo;

    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse(400, { error: "Mensagens são obrigatórias" });
    }

    const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const isGuest = !token || (anonKey && token === anonKey);

    if (!isGuest) {
      if (!adminClient) {
        return jsonResponse(500, { error: "Cliente de autenticação indisponível" });
      }

      const { data, error } = await adminClient.auth.getUser(token);
      if (error || !data?.user) {
        return jsonResponse(401, { error: "Não autorizado" });
      }
    }

    const boundedMessages = isGuest ? messages.slice(-20) : messages;
    const systemPrompt = SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS.livre;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...boundedMessages],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return jsonResponse(429, {
          error: "Limite de requisições excedido. Tente novamente em alguns instantes.",
        });
      }

      if (aiResponse.status === 402) {
        return jsonResponse(402, { error: "Créditos de IA esgotados." });
      }

      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      return jsonResponse(500, { error: "Erro no serviço de IA" });
    }

    if (!aiResponse.body) {
      return jsonResponse(500, { error: "Resposta vazia da IA" });
    }

    return new Response(aiResponse.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("chat error:", error);
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});
