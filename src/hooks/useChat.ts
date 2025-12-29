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

export function useChat({ conversaId, modo, mensagens, setMensagens }: UseChatProps) {
  const { toast } = useToast();

  const enviarMensagem = useCallback(async (conteudo: string) => {
    if (!conteudo.trim() || !conversaId) return;

    const novaOrdem = mensagens.length + 1;

    // Salvar mensagem do usuário
    const { data: mensagemUsuario, error: errUser } = await supabase
      .from("mensagens")
      .insert({
        conteudo: conteudo.trim(),
        conversa_pai: conversaId,
        remetente_ia: false,
        ordem: novaOrdem,
      })
      .select()
      .single();

    if (errUser || !mensagemUsuario) {
      console.error("Erro ao salvar mensagem:", errUser);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setMensagens((prev) => [...prev, mensagemUsuario as Mensagem]);

    // Preparar mensagens para a IA
    const historicoMensagens = [
      ...mensagens.map((m) => ({
        role: m.remetente_ia ? "assistant" : "user",
        content: m.conteudo,
      })),
      { role: "user", content: conteudo.trim() },
    ];

    // Criar placeholder para resposta da IA
    const placeholderId = crypto.randomUUID();
    setMensagens((prev) => [
      ...prev,
      {
        id: placeholderId,
        conteudo: "",
        conversa_pai: conversaId,
        remetente_ia: true,
        ordem: novaOrdem + 1,
        created_at: new Date().toISOString(),
      },
    ]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

      // Salvar resposta da IA no banco
      const { data: mensagemIA, error: errIA } = await supabase
        .from("mensagens")
        .insert({
          conteudo: respostaCompleta,
          conversa_pai: conversaId,
          remetente_ia: true,
          ordem: novaOrdem + 1,
        })
        .select()
        .single();

      if (mensagemIA) {
        setMensagens((prev) =>
          prev.map((m) => (m.id === placeholderId ? (mensagemIA as Mensagem) : m))
        );
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
