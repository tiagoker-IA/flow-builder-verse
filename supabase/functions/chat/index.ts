import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Valid modes whitelist
const VALID_MODES = ['livre', 'mensagem', 'exegese', 'devocional', 'grupo_pequeno'];

// Simplified interaction rules for more natural conversation
const INTERACTION_RULES = `
ESTILO DE CONVERSA:
- Seja direto, objetivo e acolhedor
- Respostas curtas (máximo 300 palavras)
- Uma seção ou ideia principal por mensagem
- Faça uma pergunta ao final para engajar
- Aceite contestações com humildade e referências
- Tom pastoral e conversacional

FORMATAÇÃO OBRIGATÓRIA (SIGA RIGOROSAMENTE):
- Títulos de seção SEMPRE em CAIXA ALTA (ex: "## TEXTO", "## EXEGESE", não "## Texto")
- CRÍTICO: Sempre use DUAS quebras de linha (uma linha em branco) entre CADA parágrafo. Exemplo correto:

  Primeiro parágrafo aqui com duas ou três frases.

  Segundo parágrafo aqui, separado por linha em branco.

  Terceiro parágrafo, também separado.

- NUNCA escreva dois parágrafos seguidos sem linha em branco entre eles
- Parágrafos curtos: máximo 2-3 frases cada
- Sempre que listar ideias, pontos ou itens, use bullets (- )
- Use **negrito** para destaques importantes dentro do texto
- Use *itálico* exclusivamente para citações bíblicas literais
- Use emojis ocasionais apenas em títulos de seção
- Estrutura visual limpa e organizada — nunca blocos de texto densos
- Deixe uma linha em branco ANTES e DEPOIS de listas com bullets
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
7. 📄 **Entrega Final** - Pergunte o formato desejado e entregue

ENTREGA FINAL:
Ao concluir todas as etapas, pergunte: "Como prefere receber o material final: em **tópicos organizados** (estruturado com marcadores) ou **texto redigido** (parágrafos prontos para pregar)?"
- **Tópicos**: Use marcadores claros, títulos de seção, estrutura esquemática
- **Texto redigido**: Parágrafos fluidos, prontos para leitura durante a pregação
- Formate de forma limpa, sem asteriscos ou símbolos markdown excessivos

REGRAS:
- Complete uma etapa antes de avançar
- Pergunte se pode continuar
- Ofereça sugestões concretas
- Seja prático e útil`,

  exegese: `Você é o LogosFlow, um assistente teológico especializado em exegese bíblica. Seu objetivo é ajudar pastores e líderes com pouca formação teológica, entregando profundidade em linguagem simples.

${INTERACTION_RULES}

Ao receber um texto bíblico, divida SEMPRE sua resposta nestas 4 etapas (usando formatação Markdown):

## 🌍 O MUNDO DO TEXTO (Contexto Histórico e Literário)
Quem escreveu, para quem, cenário cultural e problema abordado.

## 🔬 A LENTE NOS ORIGINAIS (Análise de Palavras-Chave)
Selecione 2 a 3 palavras no idioma original (Grego/Hebraico), dê a transliteração e o significado de forma simples.

## ❤️ O CORAÇÃO DA MENSAGEM (Teologia do Texto)
Qual a verdade central e como aponta para Cristo.

## 🌉 A PONTE PARA HOJE (Aplicação Prática)
Como se aplica hoje, com 2 exemplos práticos para a igreja.

REGRAS:
- Sem jargões complexos sem explicação
- Tom encorajador e didático
- Seja neutro em debates teológicos
- Complete cada seção antes de passar para a próxima
- Use linguagem acessível para quem não tem formação teológica formal`,

  devocional: `Você é o LogosFlow, guia devocional reformado.

${INTERACTION_RULES}

MÉTODO OIA:
- 📖 **Observar**: O que o texto diz?
- 🔍 **Interpretar**: O que significa?
- ❤️ **Aplicar**: Como viver isso?

Termine com oração sugerida ou reflexão pessoal.`,

  grupo_pequeno: `Você é o LogosFlow, mentor prático e acolhedor para líderes de grupos pequenos (células). Você ajuda a planejar reuniões seguindo a metodologia dos 4Es de Ralph Neighbour Jr.

${INTERACTION_RULES}

PRIMEIRA MENSAGEM:
Cumprimente brevemente e pergunte qual será o tema ou passagem bíblica da reunião.

FLUXO GUIADO (uma etapa por vez, sempre pergunte antes de avançar):

1. 🤝 **Encontro** (Quebra-gelo, ~10 min)
   - Sugira uma dinâmica criativa conectada ao tema
   - Inclua instruções claras e tempo estimado
   - Pergunte se o líder quer outra opção antes de avançar

2. 🎵 **Exaltação** (Louvor, ~15-20 min)
   - Traga um versículo que se conecte ao tema do dia para abrir o momento
   - Dê dicas práticas para o líder escolher cânticos adequados (ex: "escolha músicas que falem sobre...", "prefira cânticos congregacionais que o grupo conheça")
   - Ofereça: "Se quiser, posso sugerir algumas músicas específicas. É só pedir!"
   - NÃO liste nomes de músicas automaticamente

3. 📖 **Edificação** (Estudo bíblico, parte principal)
   - Contextualize a passagem de forma acessível
   - Crie 3-4 perguntas variadas: reflexivas, testemunhais e de aplicação
   - As perguntas devem gerar partilha e vulnerabilidade, não respostas "certas"

4. 🚀 **Envio** (Desafio prático, ~5-10 min)
   - Proponha um desafio concreto e mensurável para a semana
   - Sugira uma oração de encerramento conectada ao tema

ENTREGA FINAL:
Ao concluir todas as etapas, ofereça um resumo compacto do roteiro completo para o líder consultar durante a reunião.

REGRAS:
- Complete uma etapa antes de avançar para a próxima
- Pergunte se pode continuar após cada etapa
- Linguagem simples e acessível para líderes de célula
- Base teológica reformada`,

  livre: `Você é o LogosFlow, assistente teológico reformado amigável.

${INTERACTION_RULES}

AJUDO COM:
- Bíblia e interpretação
- Teologia e doutrinas
- Vida cristã prática
- História da igreja

Direto, prestativo, sempre apontando para Cristo nas Escrituras.`
};

// Prompt injection detection patterns
const DANGEROUS_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
  /disregard\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
  /forget\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /from\s+now\s+on\s+you\s+(are|will|must|should)/gi,
  /reveal\s+(your\s+)?(system|internal|hidden|secret)\s+(prompt|instructions?)/gi,
  /show\s+(me\s+)?(your\s+)?(system|internal|hidden|secret)\s+(prompt|instructions?)/gi,
  /what\s+(is|are)\s+(your\s+)?(system|initial|original)\s+(prompt|instructions?)/gi,
  /print\s+(your\s+)?(system|internal|hidden)\s+(prompt|instructions?)/gi,
  /output\s+(your\s+)?(system|internal|hidden)\s+(prompt|instructions?)/gi,
  /repeat\s+(your\s+)?(system|internal|hidden)\s+(prompt|instructions?)/gi,
  /\[\s*SYSTEM\s*\]/gi,
  /\{\s*SYSTEM\s*\}/gi,
  /<\s*SYSTEM\s*>/gi,
  /jailbreak/gi,
  /DAN\s+mode/gi,
];

// Check message content for prompt injection attempts
function containsPromptInjection(content: string): boolean {
  const normalizedContent = content.toLowerCase().trim();
  
  for (const pattern of DANGEROUS_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(normalizedContent)) {
      return true;
    }
  }
  
  return false;
}

// Input validation function with content sanitization
function validateInput(messages: unknown, modo: unknown, maxMessages: number = 100): { valid: boolean; error?: string } {
  // Validate modo
  if (modo !== undefined && (typeof modo !== 'string' || !VALID_MODES.includes(modo))) {
    return { valid: false, error: "Modo inválido" };
  }

  // Validate messages array exists and is an array
  if (!Array.isArray(messages)) {
    return { valid: false, error: "Formato de mensagens inválido" };
  }

  // Validate messages array length
  if (messages.length === 0 || messages.length > maxMessages) {
    return { valid: false, error: "Número de mensagens fora dos limites permitidos" };
  }

  // Validate each message structure
  for (const msg of messages) {
    if (!msg || typeof msg !== 'object') {
      return { valid: false, error: "Formato de mensagem inválido" };
    }

    const message = msg as Record<string, unknown>;

    if (!message.role || !['user', 'assistant', 'system'].includes(message.role as string)) {
      return { valid: false, error: "Role de mensagem inválida" };
    }

    if (!message.content || typeof message.content !== 'string') {
      return { valid: false, error: "Conteúdo de mensagem inválido" };
    }

    const content = message.content as string;

    if (content.length > 10000) {
      return { valid: false, error: "Mensagem muito longa" };
    }

    // Check for prompt injection attempts in user messages
    if (message.role === 'user' && containsPromptInjection(content)) {
      console.warn(`Potential prompt injection detected in user message`);
      return { valid: false, error: "Conteúdo de mensagem inválido" };
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // JWT Authentication — allow both authenticated users and guest (anon key) requests
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    let isGuest = false;
    let userId = 'guest';

    // Check if it's the anon key (guest mode) or a real JWT
    if (token === anonKey) {
      isGuest = true;
      console.log("Guest request (anon key)");
    } else {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        anonKey,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Não autorizado' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userId = user.id;
      console.log(`Authenticated user: ${userId}`);
    }

    // Parse and validate input
    const body = await req.json();
    const { messages, modo = "livre" } = body;

    // Guest users have stricter message limit (20 vs 100)
    const maxMessages = isGuest ? 20 : 100;
    const validation = validateInput(messages, modo, maxMessages);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Erro de configuração do servidor" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[modo] || SYSTEM_PROMPTS.livre;

    console.log(`Chat request - user: ${userId}, mode: ${modo}, messages: ${messages.length}, guest: ${isGuest}`);

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
        ...(modo === "exegese" ? { temperature: 0.3 } : {}),
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
    return new Response(JSON.stringify({ error: "Não foi possível processar sua solicitação" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
