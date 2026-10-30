import { useCallback } from "react";
import { Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { lerResposta } from "@/lib/chat-response";

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
      const aviso = error instanceof Error ? error.message : "Não consegui continuar. Tente de novo.";
      setMensagens((prev) => {
        // Não transformar uma falha de transmissão em mensagem salva da IA.
        const updated = prev.filter((m) => m.id !== placeholderId);
        persistMensagens(idConversa, updated);
        return updated;
      });
      toast({
        title: "Erro",
        description: aviso,
        variant: "destructive",
      });
    }
  }, [conversaId, modo, mensagens, setMensagens, persistMensagens, toast]);

  return { enviarMensagem };
}
