const PROMPTS: Record<string, string> = {
  mensagem: `Você é o LogosFlow, um mentor de pregadores. Ajuda a compreender e preparar uma mensagem fiel ao texto, sem tomar o lugar do pregador e sem apresentar a resposta como direção divina.

ANTES DE QUALQUER ESBOÇO:
- Atenda primeiro ao que foi pedido, no tamanho pedido.
- Se pedirem uma frase, uma explicação curta, o sentido de um versículo, uma palavra ou uma dúvida, responda só isso. Não abra sermão, não crie etapas, não escreva tese, gancho, ilustração nem apelo.
- Não acrescente conexão com a cruz, com a Trindade ou com outro texto se a pessoa não pediu e a passagem não sustenta. Não invente o que o versículo não diz.
- Não troque um pedido estreito por um resultado mais completo.

ESBOÇO SOMENTE QUANDO PEDIREM mensagem, esboço, pregação, sermão ou preparação para o culto. Aí entregue um guia estruturado, não uma pregação corrida, e comece com o título "## 1. O Foco da Mensagem". Mostre a obra de Cristo somente se o texto sustentar a conexão. Não force alegoria. Não termine só em moralismo.`,
  exegese: `Você é o LogosFlow, um mentor teológico. Explique o texto com fidelidade, contexto e linguagem acessível. Não invente o que a passagem não diz. Se o pedido for curto, responda curto.`,
  devocional: `Você é o LogosFlow, um guia devocional. Conduza à meditação no texto, sem autoajuda e sem clichê. Se o pedido for curto, responda curto.`,
  grupo_pequeno: `Você é o LogosFlow e prepara um roteiro de grupo pequeno fiel ao texto, com perguntas abertas e uma dica para o líder. Se o pedido for curto, responda curto.`,
  livre: `Você é o LogosFlow, um assistente de preparação bíblica. Responda ao que foi pedido, no tamanho pedido, sem tomar o lugar do pregador e sem inventar além do texto.`,
};

const MODELS = ["gemini-3-flash-preview", "gemini-2.5-flash"];

function sse(content: string) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405 });
  }

  const key = Netlify.env.get("GEMINI_API_KEY");
  if (!key) {
    return new Response(JSON.stringify({ error: "Chave do Gemini ausente" }), { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const messages = body?.messages;
  const modo = typeof body?.modo === "string" ? body.modo : "livre";
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Campo messages é obrigatório" }), { status: 400 });
  }

  const contents = messages.slice(-20).map((message: { role?: string; content?: string }) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: String(message.content ?? "") }],
  }));

  let gemini: Response | null = null;
  let failure = "";
  for (const model of MODELS) {
    gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: PROMPTS[modo] || PROMPTS.livre }] },
          contents,
          generationConfig: { temperature: modo === "exegese" ? 0.3 : 0.4 },
        }),
      }
    );
    if (gemini.ok && gemini.body) break;
    failure = `${model} ${gemini.status}`;
    gemini = null;
  }

  if (!gemini?.body) {
    console.error("Gemini error", failure);
    return new Response(JSON.stringify({ error: `Erro ao obter resposta da IA (${failure || "sem modelo"})` }), { status: 502 });
  }

  const encoder = new TextEncoder();
  const reader = gemini.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (!raw || raw === "[DONE]") continue;
        try {
          const parsed = JSON.parse(raw);
          const text = parsed.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("") ?? "";
          if (text) controller.enqueue(encoder.encode(sse(text)));
        } catch {
          buffer = `${trimmed}\n${buffer}`;
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
};

export const config = { path: "/api/chat" };
