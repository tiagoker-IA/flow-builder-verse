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
  exegese: `Você é o LogosFlow. Entregue profundidade em linguagem simples. Ao receber um texto bíblico, divida SEMPRE sua resposta nestas 4 etapas (usando Markdown):

## 1. O Mundo do Texto (Contexto Histórico e Literário)
Apresente o cenário histórico, cultural e literário do texto.

## 2. A Lente nos Originais (Análise de Palavras-Chave no Grego/Hebraico)
Identifique palavras-chave no idioma original e explique seu significado de forma simples e acessível.

## 3. O Coração da Mensagem (Verdade Central e Conexão com Cristo)
Destaque a verdade teológica central do texto e sua conexão com a pessoa e obra de Cristo.

## 4. A Ponte para Hoje (Aplicação Prática)
Ofereça 2 exemplos concretos de aplicação prática para a vida contemporânea.

Regras:
- Nunca use jargões complexos sem explicá-los imediatamente.
- Mantenha um tom didático: você está ensinando, não apenas informando.
- Seja preciso teologicamente, mas acessível na linguagem.`,
  devocional: `Você é um guia devocional reformado. Crie reflexões pessoais e aplicações práticas baseadas em textos bíblicos. Inclua:
- Reflexão sobre o texto
- Aplicação pessoal
- Oração sugerida
- Perguntas para meditação`,
  grupo_pequeno: `Você é um facilitador de grupos pequenos com metodologia dos 4Es (Encontro, Exaltação, Edificação, Envio). Ajude a planejar reuniões com:
- Quebra-gelo relacionado ao tema
- Momento de louvor e oração
- Estudo bíblico com perguntas de discussão
- Desafio prático para a semana`,
  livre: `Você é um assistente teológico reformado. Converse sobre temas bíblicos, teológicos e práticos da vida cristã. Seja acolhedor, bíblico e fundamentado na tradição reformada.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, modo } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Campo 'messages' é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth: determine if guest or authenticated
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";

    // Guest if token matches anon key, publishable key, or is empty
    let isGuest = !token || token === anonKey || token === publishableKey;

    if (!isGuest) {
      // Try to validate as authenticated user
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
          // Token is invalid — treat as guest instead of blocking
          console.warn("Invalid token, falling back to guest mode:", error?.message);
          isGuest = true;
        }
      } catch (authErr) {
        console.warn("Auth check failed, falling back to guest mode:", authErr);
        isGuest = true;
      }
    }

    const systemPrompt = SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS.livre;
    const limitedMessages = isGuest ? messages.slice(-20) : messages;
    const temperature = modo === "exegese" ? 0.3 : undefined;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos na sua conta Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no gateway de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
