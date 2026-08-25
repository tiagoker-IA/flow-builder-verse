import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type ListenerInput = {
  passage: string;
  outline: string;
  audience?: string;
  objective?: string;
  duration?: string;
};

const DEFAULT_ALLOWED_ORIGINS = [
  "https://flow-builder-verse.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

const JSON_HEADERS = { "Content-Type": "application/json" };

function allowedOrigins() {
  const configured = Deno.env.get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = allowedOrigins().includes(origin) ? origin : allowedOrigins()[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), ...JSON_HEADERS },
  });
}

function normalizedText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateInput(raw: unknown): ListenerInput {
  if (!raw || typeof raw !== "object") throw new Error("Dados do esboço ausentes.");
  const data = raw as Record<string, unknown>;
  const input = {
    passage: normalizedText(data.passage, 200),
    outline: normalizedText(data.outline, 20000),
    audience: normalizedText(data.audience, 500),
    objective: normalizedText(data.objective, 500),
    duration: normalizedText(data.duration, 120),
  };

  if (input.passage.length < 3) throw new Error("Informe a passagem bíblica principal.");
  if (input.outline.length < 120) throw new Error("O esboço precisa ter ao menos 120 caracteres.");
  return input;
}

function validateVisitorId(value: unknown) {
  const visitorId = typeof value === "string" ? value : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) {
    throw new Error("Identificador de visitante inválido.");
  }
  return visitorId;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request) {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function resolveUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  if (!token || token === anonKey) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return error ? null : user;
}

function inputContext(input: ListenerInput) {
  return [
    `PASSAGEM PRINCIPAL:\n${input.passage}`,
    `ESBOÇO:\n${input.outline}`,
    input.audience ? `PÚBLICO INFORMADO:\n${input.audience}` : "PÚBLICO INFORMADO: não informado",
    input.objective ? `OBJETIVO INFORMADO:\n${input.objective}` : "OBJETIVO INFORMADO: não informado",
    input.duration ? `DURAÇÃO PREVISTA:\n${input.duration}` : "DURAÇÃO PREVISTA: não informada",
  ].join("\n\n");
}

async function callAi(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number,
) {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("Serviço de IA não configurado.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("LOVABLE_AI_MODEL") || "google/gemini-3-flash-preview",
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("listener-view AI error", response.status, detail.slice(0, 500));
    if (response.status === 429) throw new Error("O serviço está ocupado. Aguarde alguns minutos e tente novamente.");
    throw new Error("Não foi possível gerar a leitura neste momento.");
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") throw new Error("A IA devolveu uma resposta vazia.");
  return content.trim();
}

function parseClarification(content: string) {
  const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned);
  const understanding = normalizedText(parsed.understanding, 1800);
  const questions = Array.isArray(parsed.questions)
    ? parsed.questions.map((question: unknown) => normalizedText(question, 500)).filter(Boolean).slice(0, 2)
    : [];

  if (!understanding || questions.length < 1) throw new Error("Resposta de compreensão inválida.");
  return { understanding, questions };
}

const CLARIFICATION_PROMPT = `Você é o LogosFlow. Nesta etapa, não avalie, corrija, elogie nem reescreva o esboço. Primeiro demonstre que compreendeu a intenção particular do pregador e faça uma ou duas perguntas realmente necessárias antes da Visão do Ouvinte.

Princípios:
- Fale diretamente com o pregador usando "você", com tom pessoal, respeitoso e sóbrio.
- Não se apresente como mentor, pastor, autoridade espiritual ou voz de Deus.
- Não use elogios automáticos.
- Identifique a ideia central, o movimento da mensagem e a intenção provável.
- Pergunte somente o que mudaria materialmente a leitura do esboço.
- Não pergunte a tradição denominacional.
- Considere uma leitura cristocêntrica, histórico-gramatical e reformada, mas não use diferenças doutrinárias como veredito escondido.

Responda APENAS com JSON válido, sem markdown, neste formato:
{"understanding":"texto em 1 ou 2 parágrafos curtos","questions":["pergunta específica","segunda pergunta, somente se necessária"]}`;

const ANALYSIS_PROMPT = `Você é o LogosFlow e oferece uma "Visão do Ouvinte": uma segunda perspectiva sobre como um esboço pode ser recebido pela igreja. Você não julga a inspiração, não dá nota, não entrega veredito e não substitui a responsabilidade pastoral.

Orientação teológica: centralidade de Cristo, fidelidade às Escrituras, leitura histórico-gramatical e tradição reformada. Receba pregadores de diferentes tradições. Quando houver divergência doutrinária legítima, identifique-a como divergência e apresente a perspectiva adotada pelo LogosFlow com transparência; não a trate automaticamente como erro textual.

Escreva de forma pessoal, usando "você", e relacione cada observação a trechos concretos do esboço. Evite elogios genéricos, clichês e linguagem de relatório burocrático. Não invente intenção, reação de ouvintes, dados históricos, hebraico, grego, autores ou fontes. Use expressões probabilísticas: "um ouvinte pode", "é possível que", "este trecho tende a".

Entregue em Markdown com estas seções:
## O que ouvi como mensagem central
Resuma com precisão o que chega ao ouvinte, considerando a intenção esclarecida pelo pregador.

## O que chega com força e clareza
Mostre aspectos concretos que provavelmente serão compreendidos e lembrados.

## Onde alguns ouvintes podem se perder
Identifique lacunas, pressupostos não explicados, transições bruscas, excesso de conteúdo, ambiguidades ou possíveis leituras indesejadas. Explique por quê.

## Perguntas que podem surgir enquanto ouvem
Liste dúvidas honestas de perfis diferentes de ouvintes, sem caricaturá-los.

## Texto bíblico, Cristo e desenvolvimento
Examine fidelidade à passagem, estrutura e progressão, centralidade legítima de Cristo e eventuais conexões forçadas. Diferencie problema textual de escolha homilética.

## Aplicações e realidade da igreja
Examine se as aplicações são concretas, coerentes com o texto, alcançam realidades diferentes e evitam moralismo.

## Perguntas para você levar adiante
Faça de 3 a 5 perguntas que ajudem o pregador a amadurecer o próprio trabalho. Não reescreva o sermão automaticamente.

Finalize em uma frase curta lembrando que o pregador decide o que aproveitar.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Método não permitido." }, 405);

  const origin = req.headers.get("origin");
  if (origin && !allowedOrigins().includes(origin)) return json(req, { error: "Origem não autorizada." }, 403);

  const service = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let sessionId: string | null = null;

  try {
    const body = await req.json();
    const phase = body.phase;
    const input = validateInput(body.input);
    const visitorId = validateVisitorId(body.visitorId);
    const salt = Deno.env.get("RATE_LIMIT_SALT");
    if (!salt || salt.length < 24) throw new Error("Proteção de uso não configurada.");

    const user = await resolveUser(req);
    const visitorHash = await sha256(`${salt}:visitor:${visitorId}`);
    const ipHash = await sha256(`${salt}:ip:${clientIp(req)}`);

    if (phase === "clarify") {
      if (!user) {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const { count: visitorCount, error: visitorError } = await service
          .from("listener_view_sessions")
          .select("id", { count: "exact", head: true })
          .eq("visitor_hash", visitorHash)
          .in("status", ["processing_clarification", "awaiting_answers", "processing_analysis", "completed"])
          .gte("created_at", since);
        if (visitorError) throw visitorError;

        if ((visitorCount || 0) >= 1) {
          return json(req, { error: "Sua leitura gratuita já foi utilizada.", code: "GUEST_LIMIT_REACHED" }, 429);
        }

        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: ipCount, error: ipError } = await service
          .from("listener_view_sessions")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("created_at", dayAgo);
        if (ipError) throw ipError;
        if ((ipCount || 0) >= 3) {
          return json(req, { error: "O limite de leituras desta rede foi atingido. Tente novamente amanhã.", code: "NETWORK_LIMIT_REACHED" }, 429);
        }
      } else {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count, error } = await service
          .from("listener_view_sessions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", dayAgo);
        if (error) throw error;
        if ((count || 0) >= 20) {
          return json(req, { error: "Seu limite diário de leituras foi atingido.", code: "USER_LIMIT_REACHED" }, 429);
        }
      }

      const { data: created, error: createError } = await service
        .from("listener_view_sessions")
        .insert({ visitor_hash: visitorHash, ip_hash: ipHash, user_id: user?.id || null })
        .select("id")
        .single();
      if (createError || !created) throw createError || new Error("Não foi possível iniciar a sessão.");
      sessionId = created.id;

      const content = await callAi([
        { role: "system", content: CLARIFICATION_PROMPT },
        { role: "user", content: inputContext(input) },
      ], 0.25, 800);
      const clarification = parseClarification(content);

      await service.from("listener_view_sessions").update({ status: "awaiting_answers", updated_at: new Date().toISOString() }).eq("id", sessionId);
      return json(req, { sessionId, ...clarification });
    }

    if (phase === "analyze") {
      sessionId = normalizedText(body.sessionId, 80);
      const answers = Array.isArray(body.answers)
        ? body.answers.map((answer: unknown) => normalizedText(answer, 1000)).filter(Boolean).slice(0, 2)
        : [];
      if (!sessionId || answers.length < 1) return json(req, { error: "Responda às perguntas antes de continuar." }, 400);

      const { data: session, error: sessionError } = await service
        .from("listener_view_sessions")
        .select("id, visitor_hash, user_id, status, expires_at")
        .eq("id", sessionId)
        .single();
      if (sessionError || !session) return json(req, { error: "Esta leitura não foi encontrada." }, 404);
      if (session.visitor_hash !== visitorHash && session.user_id !== user?.id) return json(req, { error: "Esta leitura não pertence a você." }, 403);
      if (session.status === "completed") return json(req, { error: "Esta leitura já foi concluída." }, 409);
      if (session.status !== "awaiting_answers" && session.status !== "failed") return json(req, { error: "Esta leitura ainda não pode ser concluída." }, 409);
      if (new Date(session.expires_at).getTime() < Date.now()) return json(req, { error: "Esta leitura expirou. Inicie novamente." }, 410);

      await service.from("listener_view_sessions").update({ status: "processing_analysis", updated_at: new Date().toISOString() }).eq("id", sessionId);

      const answerContext = answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n");
      const content = await callAi([
        { role: "system", content: ANALYSIS_PROMPT },
        { role: "user", content: `${inputContext(input)}\n\nRESPOSTAS DO PREGADOR ÀS PERGUNTAS DE ESCLARECIMENTO:\n${answerContext}` },
      ], 0.3, 3500);

      await service.from("listener_view_sessions").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", sessionId);
      return json(req, { analysis: content, requiresSignup: !user });
    }

    return json(req, { error: "Etapa inválida." }, 400);
  } catch (error) {
    console.error("listener-view error", error);
    if (sessionId) {
      await service.from("listener_view_sessions").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", sessionId);
    }
    const message = error instanceof Error ? error.message : "Erro inesperado.";
    const errorCode = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (errorCode === "23505") {
      return json(req, { error: "Sua leitura gratuita já foi utilizada.", code: "GUEST_LIMIT_REACHED" }, 429);
    }
    const validationError = /passagem|esboço|identificador|dados/i.test(message);
    const operationalError = /serviço está ocupado|não foi possível gerar|resposta vazia/i.test(message);
    return json(
      req,
      { error: validationError || operationalError ? message : "Não foi possível concluir esta etapa." },
      validationError ? 400 : 500,
    );
  }
});
