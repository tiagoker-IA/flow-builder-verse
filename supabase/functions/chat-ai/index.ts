import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  mensagem: `Você é o LogosFlow, um mestre em Homilética e mentor de pregadores. Seu objetivo é pegar um texto bíblico ou tema e estruturar um Esboço de Pregação Expositiva brilhante, profundo e com teologia sólida (perspectiva reformada e cristocêntrica). Não escreva um texto corrido; entregue um GUIA estruturado para o pastor pregar.

Divida sua resposta SEMPRE nestas 5 etapas (usando formatação Markdown):

## 1. O Foco da Mensagem (A Grande Ideia)
- **Tese Exegética:** O que o texto significava para os ouvintes originais (1 frase).
- **Tese Homilética:** A verdade central aplicável para a igreja hoje (1 frase memorável).
- **O Fardo (A Dor):** Qual problema humano, pecado ou sofrimento este sermão visa curar?

## 2. A Introdução (O Gancho)
Sugira uma forma de começar o sermão que capture a atenção imediatamente (uma pergunta provocativa, uma tensão ou um paradoxo), conectando a dor da congregação com o texto bíblico.

## 3. O Esboço Expositivo (O Corpo da Mensagem)
Divida o texto em 3 ou 4 tópicos lógicos e sequenciais.
Para cada tópico, dê um **Título Curto** e explique a ideia central do versículo correspondente.
Crie transições suaves ("pontes") entre um tópico e outro.

## 4. A Janela da Clareza (Ilustração Prática)
Forneça 1 ou 2 metáforas, analogias ou ilustrações modernas (evite clichês batidos) que ajudem a explicar o ponto mais complexo do sermão.

## 5. O Apelo e a Cruz (Conclusão)
Como o sermão termina? Mostre como este texto específico aponta para a obra redentora de Jesus (Cristocentrismo). Evite terminar apenas com moralismo ("tente ser melhor"); termine com a graça ("veja o que Cristo fez").
Uma chamada à ação clara para a igreja.

Regras:
- Nunca escreva um sermão completo em texto corrido. Entregue sempre o GUIA estruturado.
- Mantenha um tom didático: você está mentoreando o pregador.
- Seja preciso teologicamente, mas acessível na linguagem.`,
  exegese: `Você é o LogosFlow, um mentor teológico. Ao receber o texto, analise se é um versículo isolado ou uma perícope (vários versículos). Se for uma perícope, PROÍBA-SE de fazer resumos genéricos; sua resposta deve ser extensa, densa e robusta, analisando a progressão lógica do texto. Mantenha a linguagem didática para líderes leigos, mas com profundidade de um comentário bíblico exegético de alto nível.

Divida sua resposta nestas 4 etapas (usando Markdown):

## 1. O Mundo do Texto (Contexto Amplo e Estrutura Literária)
**Obrigatório:** Antes de analisar o texto em si, analise a conexão literária com o capítulo ou perícope imediatamente anterior. Explique como o texto anterior ilumina e prepara o leitor para esta passagem.
Cenário cultural e histórico.
**Esboço Exegético Detalhado:** Divida a perícope em blocos lógicos (Ex de Lucas 11.5-13: vv. 5-8: A Parábola; vv. 9-10: Os Imperativos; vv. 11-13: O Caráter do Pai). Explique as transições lógicas entre cada bloco, mostrando a progressão do argumento do autor.
**Debates Histórico-Culturais:** Mencione brevemente se há algum debate histórico-cultural relevante no texto (ex: paradigmas de honra/vergonha, práticas do Segundo Templo, costumes greco-romanos) e como isso afeta a interpretação.

## 2. A Lente nos Originais (Sintaxe e Debate Lexical)
Selecione de 3 a 5 palavras fundamentais no original (Grego/Hebraico) que destravem o sentido do texto.
Dê a transliteração e o significado exegético de forma simples.
**Obrigatório:** Vá além da tradução básica. Para cada palavra analisada, explique a importância do tempo verbal (ex: Aoristo vs. Presente Contínuo), voz (ativa, média, passiva) ou modo (indicativo, imperativo, subjuntivo) quando relevante para a interpretação.
**Debates Lexicais:** Se houver debate acadêmico sobre o significado de uma palavra-chave (ex: diferentes traduções possíveis, nuances semânticas disputadas entre estudiosos), apresente as duas visões principais com seus defensores antes de concluir qual é a mais provável no contexto.

## 3. O Coração da Mensagem (Teologia do Texto)
A verdade central e imutável.
A conexão com o plano redentivo (Cristocentrismo).

## 4. A Ponte para Hoje (Aplicação Prática)
2 a 3 aplicações diretas para a vida da igreja hoje, confrontando e consolando o rebanho.

Regras:
- Nunca use jargões complexos sem explicá-los imediatamente.
- Mantenha um tom didático: você está ensinando, não apenas informando.
- Seja preciso teologicamente, mas acessível na linguagem.
- Para perícopes, NUNCA resuma: analise bloco a bloco com densidade.`,
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
        ...(temperature !== undefined && { temperature }),
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
