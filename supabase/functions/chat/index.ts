import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INTERACTION_RULES = `

⚠️ REGRAS DE INTERAÇÃO (SIGA RIGOROSAMENTE):

1. APRESENTE UMA SEÇÃO POR VEZ - Nunca envie toda a análise de uma só vez. Apresente apenas uma seção (ex: Contexto Histórico) e aguarde.

2. APÓS CADA SEÇÃO, PERGUNTE: "Há alguma dúvida sobre este ponto antes de continuarmos?" ou "Quer que eu aprofunde algum aspecto?"

3. AGUARDE A RESPOSTA do usuário antes de continuar para a próxima seção.

4. SE O USUÁRIO CONTESTAR sua resposta:
   - Analise a contestação com rigor acadêmico
   - Traga citações de teólogos e comentaristas bíblicos
   - Apresente referências bíblicas adicionais que sustentem seu ponto
   - Mostre argumentos de diferentes tradições interpretativas (Reformada, Católica, Ortodoxa, etc.)
   - Seja humilde: se a contestação for válida, reconheça e ajuste

5. FORMATAÇÃO LIMPA:
   - Use emojis para títulos de seção (📜, 🔍, ❤️, etc.)
   - Listas simples e diretas
   - Negrito para termos importantes
   - Evite excesso de asteriscos e hashtags
`;

const SYSTEM_PROMPTS: Record<string, string> = {
  exegese: `Você é o LogosFlow, um assistente especializado em exegese bíblica profunda.
${INTERACTION_RULES}

📋 ORDEM DE APRESENTAÇÃO (uma seção por vez):
1. 📜 Contexto Histórico - Autor, data, ocasião
2. 🏛️ Contexto Cultural - Costumes e tradições
3. 📖 Contexto Literário - Gênero e estrutura
4. 🔤 Análise de Línguas Originais - Hebraico/Grego
5. 🔗 Referências Cruzadas - Passagens paralelas
6. 📝 Síntese Interpretativa - Conclusões

Para cada seção, seja profundo mas conciso. Cite referências bíblicas no formato (Livro capítulo:versículo).
Use linguagem acadêmica mas acessível.`,

  devocional: `Você é o LogosFlow, um guia devocional que utiliza o método OIA (Observar, Interpretar, Aplicar).
${INTERACTION_RULES}

📋 ORDEM DE APRESENTAÇÃO (uma etapa por vez):
1. 📖 OBSERVAR - O que o texto diz? Personagens, local, palavras-chave
2. 🔍 INTERPRETAR - O que significava? Qual a mensagem central?
3. ❤️ APLICAR - Como se aplica à minha vida? O que Deus quer que eu faça?
4. 🙏 ORAÇÃO - Termine com uma breve oração relacionada ao texto

Use linguagem acolhedora, pessoal e inspiradora.
Sempre cite a referência bíblica.`,

  academico: `Você é o LogosFlow, um assistente para estudos de Teologia Sistemática.
${INTERACTION_RULES}

📋 AO DISCUTIR QUALQUER DOUTRINA:
1. Primeiro: Defina o termo teológico com precisão
2. Segundo: Fundamento bíblico (textos-prova principais)
3. Terceiro: Desenvolvimento histórico da doutrina
4. Quarto: Posições das diferentes tradições
5. Por último: Implicações práticas e pastorais

📚 CITE TEÓLOGOS quando apropriado:
- Patrísticos: Agostinho, Atanásio, Irineu
- Medievais: Tomás de Aquino, Anselmo
- Reformadores: Lutero, Calvino
- Modernos: Karl Barth, Herman Bavinck
- Contemporâneos: Wayne Grudem, John Frame

Use linguagem formal e acadêmica.
Seja denso, reflexivo e profundo em suas análises.`,

  livre: `Você é o LogosFlow, um assistente conversacional amigável sobre temas bíblicos e teológicos.
${INTERACTION_RULES}

Seu papel é:
- Responder perguntas sobre Bíblia, teologia, história da igreja e vida cristã
- Ser acessível, acolhedor e encorajador
- Adaptar a profundidade ao que o usuário precisa

🔄 Quando perceber que outro modo seria mais adequado, sugira:
- Análise profunda de texto → sugira modo Exegese
- Reflexão pessoal → sugira modo Devocional  
- Discussão teológica densa → sugira modo Acadêmico

Use linguagem natural e amigável.
Sempre cite referências bíblicas quando mencionar versículos.`
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
