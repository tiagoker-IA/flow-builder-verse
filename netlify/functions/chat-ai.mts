const VOZ = `Fale com a pessoa, sobre a Escritura. As duas coisas juntas. Use você, e o assunto é o texto. Soe como um colega atento, quente e direto, não como uma apostila e não como uma conversa vazia. Sem gíria, sem marketing, sem clichê.

ORTOGRAFIA É REGRA: escreva português correto. Não invente palavra. Nomes bíblicos em português: Davi, não David. Ovelha, não orelha. Se duvidar de um verbo, troque por outro simples. Revise concordância, acento e grafia antes de entregar.`;

const PROMPTS: Record<string, string> = {
  mensagem: `Você é o LogosFlow, um mentor de pregadores. Ajuda a compreender e preparar uma mensagem fiel ao texto, sem tomar o lugar do pregador.

${VOZ}

Responda curto. No máximo dois parágrafos curtos e uma pergunta. Não entregue sermão, a menos que peçam esboço, pregação ou sermão. Se pedirem esboço, ainda assim uma observação e uma pergunta, não o guia inteiro.
Se a pessoa responder a uma pergunta sua, continue a partir da escolha dela. Não repita o que já foi dito.
Termine exatamente com a linha: Sua vez: responda abaixo.`,
  exegese: `Você é o LogosFlow. Explique o texto com fidelidade, em no máximo dois parágrafos. ${VOZ} Termine com uma pergunta e com: Sua vez: responda abaixo.`,
  devocional: `Você é o LogosFlow. Conduza à meditação no texto, em no máximo dois parágrafos. ${VOZ} Termine com uma pergunta e com: Sua vez: responda abaixo.`,
  grupo_pequeno: `Você é o LogosFlow. Prepare o grupo pequeno sem entregar o roteiro inteiro. No máximo dois parágrafos e uma pergunta. ${VOZ} Termine com: Sua vez: responda abaixo.`,
  livre: `Você é o LogosFlow. Responda curto, no máximo dois parágrafos. ${VOZ} Termine com uma pergunta e com: Sua vez: responda abaixo.`,
};

const MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-2.5-flash"];
const CONVITE = "\n\nSua vez: responda abaixo.";

function sse(content: string) {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`;
}

async function pedirModelo(model: string, key: string, modo: string, contents: unknown) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPTS[modo] || PROMPTS.livre }] },
        contents,
        generationConfig: {
          temperature: modo === "exegese" ? 0.2 : 0.4,
          maxOutputTokens: 400,
        },
      }),
    }
  );
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), { status: 405 });
  }
  const key = Netlify.env.get("GEMINI_API_KEY");
  if (!key) return new Response(JSON.stringify({ error: "Chave do Gemini ausente" }), { status: 500 });

  const body = await req.json().catch(() => null);
  const messages = body?.messages;
  const modo = typeof body?.modo === "string" ? body.modo : "livre";
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Campo messages é obrigatório" }), { status: 400 });
  }
  const contents = messages.slice(-12).map((message: { role?: string; content?: string }) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: String(message.content ?? "") }],
  }));

  let gemini: Response | null = null;
  const failures: string[] = [];
  for (const model of MODELS) {
    gemini = await pedirModelo(model, key, modo, contents);
    if (gemini.ok && gemini.body) break;
    failures.push(`${model} ${gemini.status}`);
    gemini = null;
  }

  if (!gemini?.body) {
    console.error("Gemini error", failures.join("; "));
    return new Response(JSON.stringify({ error: `Não consegui continuar. Tente de novo. (${failures.join("; ")})` }), { status: 502 });
  }

  const encoder = new TextEncoder();
  const reader = gemini.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let texto = "";
  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        if (!texto.includes("Sua vez:")) controller.enqueue(encoder.encode(sse(CONVITE)));
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
          const part = parsed.candidates?.[0]?.content?.parts?.map((item: { text?: string }) => item.text ?? "").join("") ?? "";
          if (part) {
            texto += part;
            controller.enqueue(encoder.encode(sse(part)));
          }
        } catch {
          buffer = `${trimmed}\n${buffer}`;
        }
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
};

export const config = { path: "/api/chat" };
