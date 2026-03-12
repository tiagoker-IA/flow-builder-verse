import { useCallback } from "react";
import { Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface UseGuestChatProps {
  conversaId: string;
  modo: ChatMode;
  mensagens: Mensagem[];
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>;
  persistMensagens: (conversaId: string, msgs: Mensagem[]) => void;
}

export function useGuestChat({ conversaId, modo, mensagens, setMensagens, persistMensagens }: UseGuestChatProps) {
  const { toast } = useToast();

  const enviarMensagem = useCallback(async (conteudo: string, conversaIdOverride?: string) => {
    const idConversa = conversaIdOverride || conversaId;
    if (!conteudo.trim() || !idConversa) return;

    const novaOrdem = mensagens.length + 1;

    // Add user message locally
    const mensagemUsuario: Mensagem = {
      id: crypto.randomUUID(),
      conteudo: conteudo.trim(),
      conversa_pai: idConversa,
      remetente_ia: false,
      ordem: novaOrdem,
      created_at: new Date().toISOString(),
    };

    const msgsComUsuario = [...mensagens, mensagemUsuario];
    setMensagens(msgsComUsuario);
    persistMensagens(idConversa, msgsComUsuario);

    // Prepare history for AI
    const historicoMensagens = [
      ...mensagens.map((m) => ({
        role: m.remetente_ia ? "assistant" : "user",
        content: m.conteudo,
      })),
      { role: "user", content: conteudo.trim() },
    ];

    // Placeholder for AI response
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
      // Use anon key for guest requests
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify({ messages: historicoMensagens, modo }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao conectar com a IA");
      }

      if (!response.body) throw new Error("Resposta vazia");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let respostaCompleta = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              respostaCompleta += content;
              setMensagens((prev) =>
                prev.map((m) =>
                  m.id === placeholderId ? { ...m, conteudo: respostaCompleta } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Replace placeholder with final message and persist
      const mensagemFinal: Mensagem = {
        id: crypto.randomUUID(),
        conteudo: respostaCompleta,
        conversa_pai: idConversa,
        remetente_ia: true,
        ordem: novaOrdem + 1,
        created_at: new Date().toISOString(),
      };

      setMensagens((prev) => {
        const updated = prev.map((m) => (m.id === placeholderId ? mensagemFinal : m));
        persistMensagens(idConversa, updated);
        return updated;
      });
    } catch (error) {
      console.error("Erro no chat (guest):", error);
      setMensagens((prev) => {
        const cleaned = prev.filter((m) => m.id !== placeholderId);
        persistMensagens(idConversa, cleaned);
        return cleaned;
      });
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao obter resposta da IA",
        variant: "destructive",
      });
    }
  }, [conversaId, modo, mensagens, setMensagens, persistMensagens, toast]);

  return { enviarMensagem };
}
