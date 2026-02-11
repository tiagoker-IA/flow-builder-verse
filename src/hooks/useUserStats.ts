import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ChatMode } from "@/types/chat";
import { startOfDay, subDays, format } from "date-fns";

interface ConversaRow {
  id: string;
  titulo: string;
  modo: string;
  data_criacao: string;
  updated_at: string;
}

interface MensagemCount {
  conversa_pai: string;
  count: number;
}

export type PeriodoFiltro = "7d" | "30d" | "90d" | "all";

export function useUserStats(periodo: PeriodoFiltro = "30d", statusFilter: string = "all", busca: string = "") {
  const { user } = useAuth();
  const [conversas, setConversas] = useState<ConversaRow[]>([]);
  const [mensagensCounts, setMensagensCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const dataInicio = useMemo(() => {
    if (periodo === "all") return null;
    const dias = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
    return startOfDay(subDays(new Date(), dias)).toISOString();
  }, [periodo]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, dataInicio]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("conversas")
      .select("*")
      .eq("usuario_criador", user.id)
      .order("updated_at", { ascending: false });

    if (dataInicio) {
      query = query.gte("data_criacao", dataInicio);
    }

    const { data: convData } = await query;
    const convs = (convData || []) as ConversaRow[];
    setConversas(convs);

    // Get message counts per conversation
    if (convs.length > 0) {
      const ids = convs.map(c => c.id);
      const { data: msgs } = await supabase
        .from("mensagens")
        .select("conversa_pai")
        .in("conversa_pai", ids);

      const counts: Record<string, number> = {};
      (msgs || []).forEach((m: { conversa_pai: string }) => {
        counts[m.conversa_pai] = (counts[m.conversa_pai] || 0) + 1;
      });
      setMensagensCounts(counts);
    } else {
      setMensagensCounts({});
    }

    setLoading(false);
  };

  const stats = useMemo(() => {
    const total = conversas.length;
    const totalMensagens = Object.values(mensagensCounts).reduce((a, b) => a + b, 0);
    const ultimaAtividade = conversas[0]?.updated_at || null;

    // Conversations by mode
    const porModo: Record<string, number> = {};
    conversas.forEach(c => {
      porModo[c.modo] = (porModo[c.modo] || 0) + 1;
    });

    // Activity over time (last N days grouped by day)
    const atividadePorDia: { data: string; conversas: number }[] = [];
    const dias = conversas.reduce((acc, c) => {
      const dia = format(new Date(c.data_criacao), "dd/MM");
      acc[dia] = (acc[dia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(dias).forEach(([data, count]) => {
      atividadePorDia.push({ data, conversas: count });
    });
    atividadePorDia.reverse();

    return { total, totalMensagens, ultimaAtividade, porModo, atividadePorDia };
  }, [conversas, mensagensCounts]);

  const conversasFiltradas = useMemo(() => {
    let filtered = conversas;
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.modo === statusFilter);
    }
    if (busca.trim()) {
      const term = busca.toLowerCase();
      filtered = filtered.filter(c => c.titulo.toLowerCase().includes(term));
    }
    return filtered.map(c => ({
      ...c,
      mensagens_count: mensagensCounts[c.id] || 0,
    }));
  }, [conversas, statusFilter, busca, mensagensCounts]);

  return { stats, conversasFiltradas, loading, refetch: fetchData };
}
