import { useState, useCallback, useEffect } from "react";
import { Conversa, Mensagem, ChatMode } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "logosflow_guest_conversas";
// No conversation limit for guests

interface GuestData {
  conversas: Conversa[];
  mensagens: Record<string, Mensagem[]>;
}

function loadFromStorage(): GuestData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { conversas: [], mensagens: {} };
}

function saveToStorage(data: GuestData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full, ignore
  }
}

export function useGuestConversas() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load on mount
  useEffect(() => {
    const data = loadFromStorage();
    setConversas(data.conversas);
    setLoading(false);
  }, []);

  // Persist whenever conversas or mensagens change
  const persistMensagens = useCallback((conversaId: string, msgs: Mensagem[]) => {
    const data = loadFromStorage();
    data.mensagens[conversaId] = msgs;
    saveToStorage(data);
  }, []);

  const persistConversas = useCallback((convs: Conversa[]) => {
    const data = loadFromStorage();
    data.conversas = convs;
    saveToStorage(data);
  }, []);

  const criarConversa = useCallback(async (modo: ChatMode = "livre") => {
    const novaConversa: Conversa = {
      id: crypto.randomUUID(),
      titulo: "Nova Conversa",
      usuario_criador: "guest",
      modo,
      data_criacao: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const novasConversas = [novaConversa, ...conversas];
    setConversas(novasConversas);
    setConversaAtual(novaConversa);
    setMensagens([]);
    persistConversas(novasConversas);

    return novaConversa;
  }, [conversas, persistConversas]);

  const selecionarConversa = useCallback(async (conversa: Conversa) => {
    setConversaAtual(conversa);
    const data = loadFromStorage();
    const msgs = data.mensagens[conversa.id] || [];
    setMensagens(msgs);
  }, []);

  const deletarConversa = useCallback(async (conversaId: string) => {
    const novasConversas = conversas.filter((c) => c.id !== conversaId);
    setConversas(novasConversas);

    const data = loadFromStorage();
    delete data.mensagens[conversaId];
    data.conversas = novasConversas;
    saveToStorage(data);

    if (conversaAtual?.id === conversaId) {
      setConversaAtual(null);
      setMensagens([]);
    }
  }, [conversas, conversaAtual]);

  const atualizarTitulo = useCallback(async (conversaId: string, novoTitulo: string) => {
    const novasConversas = conversas.map((c) =>
      c.id === conversaId ? { ...c, titulo: novoTitulo } : c
    );
    setConversas(novasConversas);
    persistConversas(novasConversas);

    if (conversaAtual?.id === conversaId) {
      setConversaAtual((prev) => (prev ? { ...prev, titulo: novoTitulo } : null));
    }
  }, [conversas, conversaAtual, persistConversas]);

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
    persistMensagens,
  };
}
