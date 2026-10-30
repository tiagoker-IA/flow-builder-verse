/** Lê o protocolo SSE de /api/chat. Nunca trata EOF ou texto parcial como sucesso. */
export async function lerResposta(response: Response, onTexto: (texto: string) => void): Promise<string> {
  if (!response.body || !response.headers.get("content-type")?.toLowerCase().includes("text/event-stream")) {
    throw new Error("A resposta do servidor não veio no formato esperado.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = "";
  let texto = "";
  let confirmouFim = false;
  let linhas = 0;
  try {
    while (!confirmouFim) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let next: ReadableStreamReadResult<Uint8Array>;
      try {
        next = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error("A resposta demorou demais e pode estar incompleta.")), 45000);
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
      if (next.done) break;
      buffer += decoder.decode(next.value, { stream: true });
      if (buffer.length > 256 * 1024) throw new Error("A resposta excedeu o limite de leitura.");
      let newline = buffer.indexOf("\n");
      while (newline >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf("\n");
        if (!line.startsWith("data:")) continue;
        linhas += 1;
        if (linhas > 4096) throw new Error("A transmissão excedeu o limite seguro.");
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") { confirmouFim = true; break; }
        if (!payload) continue;
        let parsed: any;
        try { parsed = JSON.parse(payload); }
        catch { throw new Error("A transmissão contém dados inválidos."); }
        if (parsed?.error) {
          const code = typeof parsed.error.code === "string" ? parsed.error.code : "";
          if (code === "response_truncated") throw new Error("A geração atingiu o limite e a resposta está incompleta. Ela não foi salva como concluída.");
          if (code === "response_blocked") throw new Error("A resposta foi bloqueada e não foi concluída.");
          throw new Error("A transmissão foi interrompida antes de concluir a resposta.");
        }
        const part = parsed?.choices?.[0]?.delta?.content;
        if (typeof part !== "string") throw new Error("A transmissão contém dados inesperados.");
        if (part) {
          texto += part;
          if (texto.length > 2 * 1024 * 1024) throw new Error("A resposta ultrapassou o limite seguro.");
          onTexto(texto);
        }
      }
    }
    if (!confirmouFim) throw new Error("A conexão terminou antes da confirmação da resposta completa.");
    if (!texto.trim()) throw new Error("A resposta veio vazia. Tente novamente.");
    return texto;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Falha ao receber a resposta.");
  } finally {
    try { await reader.cancel(); } catch { /* encerrado */ }
    try { reader.releaseLock(); } catch { /* encerrado */ }
  }
}
