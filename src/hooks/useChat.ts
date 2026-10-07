import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface UseChatProps {
  conversaId: string;
  modo: ChatMode;
  mensagens: Mensagem[];
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>;
}

async function lerResposta(response: Response, onTexto: (texto: string) => void) {
  if (!response.body) throw new Error("Resposta vazia");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let respostaCompleta = "";
  let textBuffer = "";
  let encerrado = false;

  while (!encerrado) {
    const leitura = await Promise.race([
      reader.read().then((item) => ({ ...item, timeout: false })),
      new Promise<{ done: boolean; value?: Uint8Array; timeout: boolean }>((resolve) =>
        setTimeout(() => resolve({ done: true, timeout: true }), 20000)
      ),
    ]);
    if (leitura.done || leitura.timeout) break;

    textBuffer += decoder.decode(leitura.value, { stream: true });
    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        encerrado = true;
        break;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          respostaCompleta += content;
          onTexto(respostaCompleta);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  try { await reader.cancel(); } catch { /* a leitura já acabou */ }
  return respostaCompleta;
}

export function useChat({ conversaId, modo, mensagens, setMensagens }: UseChatProps) {
  const { toast } = useToast();

  const enviarMensagem = useCallback(async (conteudo: string, conversaIdOverride?: string) => {
    const idConversa = conversaIdOverride || conversaId;
    if (!conteudo.trim() || !idConversa) return;

    const novaOrdem = mensagens.length + 1;
    const { data: mensagemUsuario, error: errUser } = await supabase
      .from("mensagens")
      .insert({
        conteudo: conteudo.trim(),
        conversa_pai: idConversa,
        remetente_ia: false,
        ordem: novaOrdem,
      })
      .select()
      .single();

    if (errUser || !mensagemUsuario) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setMensagens((prev) => [...prev, mensagemUsuario as Mensagem]);
    const historicoMensagens = [
      ...mensagens.map((m) => ({
        role: m.remetente_ia ? "assistant" : "user",
        content: m.conteudo,
      })),
      { role: "user", content: conteudo.trim() },
    ];
    const placeholderId = crypto.randomUUID();
    setMensagens((prev) => [
      ...prev,
      {
        id: placeholderId,
        conteudo: "",
        conversa_pai: idConversa,
        remetente_ia: true,
        ordem: novaOrdem + 1,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historicoMensagens, modo }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao conectar com a IA");
      }

      const respostaCompleta = await lerResposta(response, (texto) => {
        setMensagens((prev) => prev.map((m) => (m.id === placeholderId ? { ...m, conteudo: texto } : m)));
      });

      const { data: mensagemIA } = await supabase
        .from("mensagens")
        .insert({
          conteudo: respostaCompleta,
          conversa_pai: idConversa,
          remetente_ia: true,
          ordem: novaOrdem + 1,
        })
        .select()
        .single();

      if (mensagemIA) {
        setMensagens((prev) => prev.map((m) => (m.id === placeholderId ? (mensagemIA as Mensagem) : m)));
      }
    } catch (error) {
      console.error("Erro no chat:", error);
      setMensagens((prev) => prev.filter((m) => m.id !== placeholderId));
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao obter resposta da IA",
        variant: "destructive",
      });
    }
  }, [conversaId, modo, mensagens, setMensagens, toast]);

  return { enviarMensagem };
}
