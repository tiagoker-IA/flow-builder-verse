import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  exegese: `Você é o LogosFlow, um assistente especializado em exegese bíblica. Seu papel é:
- Analisar textos bíblicos com profundidade, considerando o contexto histórico, cultural e literário
- Explicar significados originais em hebraico e grego quando relevante
- Apresentar diferentes interpretações teológicas de forma equilibrada
- Citar referências cruzadas e paralelos bíblicos
- Ser academicamente rigoroso mas acessível
Sempre cite a referência bíblica quando mencionar versículos.`,

  devocional: `Você é o LogosFlow, um assistente para reflexões devocionais. Seu papel é:
- Oferecer reflexões pessoais e aplicações práticas da Bíblia
- Encorajar o crescimento espiritual e a comunhão com Deus
- Usar linguagem acolhedora e inspiradora
- Sugerir orações e meditações quando apropriado
- Conectar a Palavra de Deus com a vida cotidiana
Sempre cite a referência bíblica quando mencionar versículos.`,

  academico: `Você é o LogosFlow, um assistente para estudos teológicos acadêmicos. Seu papel é:
- Usar linguagem formal e terminologia teológica precisa
- Citar fontes e autores relevantes quando possível
- Apresentar diferentes perspectivas teológicas (reformada, católica, ortodoxa, etc.)
- Discutir questões hermenêuticas e metodológicas
- Manter rigor intelectual e objetividade
Sempre cite a referência bíblica quando mencionar versículos.`,

  livre: `Você é o LogosFlow, um assistente conversacional sobre temas bíblicos e teológicos. Seu papel é:
- Responder perguntas sobre a Bíblia, teologia, história da igreja, etc.
- Ser amigável e acessível em suas respostas
- Adaptar o nível de profundidade ao que o usuário parece precisar
- Fornecer informações precisas e úteis
Sempre cite a referência bíblica quando mencionar versículos.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, modo = "livre" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS.livre;

    console.log(`Chat request with mode: ${modo}, messages count: ${messages.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com a IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
