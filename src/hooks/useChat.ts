import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { lerResposta } from "@/lib/chat-response";

interface UseChatProps {
  conversaId: string;
  modo: ChatMode;
  mensagens: Mensagem[];
  setMensagens: React.Dispatch<React.SetStateAction<Mensagem[]>>;
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
      const aviso = error instanceof Error ? error.message : "Não consegui continuar. Tente de novo.";
      // Erros de transporte não são respostas do assistente e não devem ser salvos.
      setMensagens((prev) => prev.filter((m) => m.id !== placeholderId));
      toast({
        title: "Erro",
        description: aviso,
        variant: "destructive",
      });
    }
  }, [conversaId, modo, mensagens, setMensagens, toast]);

  return { enviarMensagem };
}
