import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversa, Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export function useConversas(userId: string | undefined) {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConversas = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("conversas")
      .select("*")
      .eq("usuario_criador", userId)
      .order("data_criacao", { ascending: false });

    if (error) {
      console.error("Erro ao buscar conversas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } else {
      setConversas(data as Conversa[]);
    }
    setLoading(false);
  }, [userId, toast]);

  const fetchMensagens = useCallback(async (conversaId: string) => {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("conversa_pai", conversaId)
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Erro ao buscar mensagens:", error);
    } else {
      setMensagens(data as Mensagem[]);
    }
  }, []);

  const criarConversa = useCallback(async (modo: ChatMode = "livre") => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("conversas")
      .insert({
        titulo: "Nova Conversa",
        usuario_criador: userId,
        modo,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conversa.",
        variant: "destructive",
      });
      return null;
    }

    const novaConversa = data as Conversa;
    setConversas((prev) => [novaConversa, ...prev]);
    setConversaAtual(novaConversa);
    setMensagens([]);
    return novaConversa;
  }, [userId, toast]);

  const selecionarConversa = useCallback(async (conversa: Conversa) => {
    setConversaAtual(conversa);
    await fetchMensagens(conversa.id);
  }, [fetchMensagens]);

  // Realtime subscription para mensagens da conversa atual
  useEffect(() => {
    if (!conversaAtual?.id) return;

    const channel = supabase
      .channel(`mensagens-${conversaAtual.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens',
          filter: `conversa_pai=eq.${conversaAtual.id}`,
        },
        (payload) => {
          const novaMensagem = payload.new as Mensagem;
          setMensagens((prev) => {
            // Evitar duplicatas
            if (prev.some((m) => m.id === novaMensagem.id)) return prev;
            return [...prev, novaMensagem];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversaAtual?.id]);

  const deletarConversa = useCallback(async (conversaId: string) => {
    const { error } = await supabase
      .from("conversas")
      .delete()
      .eq("id", conversaId);

    if (error) {
      console.error("Erro ao deletar conversa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conversa.",
        variant: "destructive",
      });
      return;
    }

    setConversas((prev) => prev.filter((c) => c.id !== conversaId));
    if (conversaAtual?.id === conversaId) {
      setConversaAtual(null);
      setMensagens([]);
    }
  }, [conversaAtual, toast]);

  const atualizarTitulo = useCallback(async (conversaId: string, novoTitulo: string) => {
    const { error } = await supabase
      .from("conversas")
      .update({ titulo: novoTitulo })
      .eq("id", conversaId);

    if (error) {
      console.error("Erro ao atualizar título:", error);
      return;
    }

    setConversas((prev) =>
      prev.map((c) => (c.id === conversaId ? { ...c, titulo: novoTitulo } : c))
    );
    if (conversaAtual?.id === conversaId) {
      setConversaAtual((prev) => (prev ? { ...prev, titulo: novoTitulo } : null));
    }
  }, [conversaAtual]);

  useEffect(() => {
    fetchConversas();
  }, [fetchConversas]);

  return {
    conversas,
    conversaAtual,
    mensagens,
    setMensagens,
    loading,
    criarConversa,
    selecionarConversa,
    deletarConversa,
    atualizarTitulo,
  };
}
