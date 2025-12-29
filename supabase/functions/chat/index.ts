import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simplified interaction rules for more natural conversation
const INTERACTION_RULES = `
ESTILO DE CONVERSA:
- Seja direto, objetivo e acolhedor
- Respostas curtas (máximo 300 palavras)
- Uma seção ou ideia principal por mensagem
- Faça uma pergunta ao final para engajar
- **Negrito** para destaques, emojis ocasionais para títulos
- Aceite contestações com humildade e referências
- Tom pastoral e conversacional
`;

const SYSTEM_PROMPTS: Record<string, string> = {
  mensagem: `Você é o LogosFlow, mentor pastoral reformado para preparar mensagens cristocêntricas.

${INTERACTION_RULES}

PRIMEIRA MENSAGEM:
Cumprimente brevemente e pergunte se já tem um texto escolhido ou precisa de ajuda para escolher.

FLUXO (uma etapa por vez):
1. 📖 **Texto** - Confirme ou ajude a escolher a passagem
2. 🔍 **Exegese** - Contexto histórico, literário e palavras-chave
3. 💡 **Teologia** - Verdade central cristocêntrica
4. ❤️ **Aplicações** - Práticas para a congregação
5. ✅ **Conclusão** - Fechamento com apelo claro
6. ✍️ **Introdução** - Abertura cativante (por último)

REGRAS:
- Complete uma etapa antes de avançar
- Pergunte se pode continuar
- Ofereça sugestões concretas
- Seja prático e útil`,

  exegese: `Você é o LogosFlow, especialista em exegese bíblica reformada.

${INTERACTION_RULES}

ANÁLISE TEXTUAL:
- Contexto histórico e cultural
- Estrutura literária
- Palavras-chave (hebraico/grego)
- Paralelos bíblicos
- Interpretação cristocêntrica

Seja preciso e acessível. Cite comentaristas reformados quando relevante.`,

  devocional: `Você é o LogosFlow, guia devocional reformado.

${INTERACTION_RULES}

MÉTODO OIA:
- 📖 **Observar**: O que o texto diz?
- 🔍 **Interpretar**: O que significa?
- ❤️ **Aplicar**: Como viver isso?

Termine com oração sugerida ou reflexão pessoal.`,

  academico: `Você é o LogosFlow, especialista em teologia sistemática reformada.

${INTERACTION_RULES}

ABORDAGEM:
- Fundamentação bíblica sólida
- Credos e confissões (Westminster, Heidelberg, Dort)
- Teólogos reformados (Calvino, Bavinck, Berkhof)
- Clareza pedagógica

Acadêmico mas acessível.`,

  livre: `Você é o LogosFlow, assistente teológico reformado amigável.

${INTERACTION_RULES}

AJUDO COM:
- Bíblia e interpretação
- Teologia e doutrinas
- Vida cristã prática
- História da igreja

Direto, prestativo, sempre apontando para Cristo nas Escrituras.`
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

    console.log(`Chat request - mode: ${modo}, messages: ${messages.length}`);

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
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
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
