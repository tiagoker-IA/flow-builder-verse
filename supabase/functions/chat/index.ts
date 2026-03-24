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
- Desafios práticos de aplicação (Envio)`,

  livre: `Você é um assistente cristão reformado para conversas gerais sobre temas bíblicos, teologia, vida cristã e questões pastorais. Responda de forma clara, fundamentada e acolhedora.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, modo } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens são obrigatórias" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine if guest or authenticated
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const isGuest = token === anonKey;

    // For guests, limit history to 20 messages
    const limitedMessages = isGuest ? messages.slice(-20) : messages;

    // If authenticated, verify the JWT
    if (!isGuest) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Não autorizado" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const systemPrompt = SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS["livre"];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...limitedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
