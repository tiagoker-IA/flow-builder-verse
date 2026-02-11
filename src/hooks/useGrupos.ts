import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GrupoPequeno } from "@/types/grupos";
import { useToast } from "@/hooks/use-toast";

export function useGrupos(userId: string | undefined) {
  const [grupos, setGrupos] = useState<GrupoPequeno[]>([]);
  const [grupoAtual, setGrupoAtual] = useState<GrupoPequeno | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGrupos = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Get groups where user is a member
    const { data: memberships, error: memErr } = await supabase
      .from("membros_grupo")
      .select("grupo_id")
      .eq("user_id", userId)
      .eq("ativo", true);

    if (memErr) {
      console.error("Erro ao buscar membros:", memErr);
      setLoading(false);
      return;
    }

    const grupoIds = memberships?.map((m: any) => m.grupo_id) || [];
    
    // Also get groups where user is lider (covers the case before trigger runs)
    const { data, error } = await supabase
      .from("grupos_pequenos")
      .select("*")
      .or(`lider_id.eq.${userId},id.in.(${grupoIds.join(",") || "00000000-0000-0000-0000-000000000000"})`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar grupos:", error);
      toast({ title: "Erro", description: "Não foi possível carregar os grupos.", variant: "destructive" });
    } else {
      setGrupos(data as GrupoPequeno[]);
      if (!grupoAtual && data && data.length > 0) {
        setGrupoAtual(data[0] as GrupoPequeno);
      }
    }
    setLoading(false);
  }, [userId, toast, grupoAtual]);

  const criarGrupo = useCallback(async (dados: { nome: string; dia_semana?: string; horario?: string; local?: string }) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("grupos_pequenos")
      .insert({ ...dados, lider_id: userId })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar grupo:", error);
      toast({ title: "Erro", description: "Não foi possível criar o grupo.", variant: "destructive" });
      return null;
    }

    const novoGrupo = data as GrupoPequeno;
    setGrupos(prev => [novoGrupo, ...prev]);
    setGrupoAtual(novoGrupo);
    return novoGrupo;
  }, [userId, toast]);

  const atualizarGrupo = useCallback(async (id: string, dados: Partial<GrupoPequeno>) => {
    const { error } = await supabase
      .from("grupos_pequenos")
      .update(dados)
      .eq("id", id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o grupo.", variant: "destructive" });
      return;
    }

    setGrupos(prev => prev.map(g => g.id === id ? { ...g, ...dados } : g));
    if (grupoAtual?.id === id) setGrupoAtual(prev => prev ? { ...prev, ...dados } : null);
  }, [grupoAtual, toast]);

  const deletarGrupo = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("grupos_pequenos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível deletar o grupo.", variant: "destructive" });
      return;
    }

    setGrupos(prev => prev.filter(g => g.id !== id));
    if (grupoAtual?.id === id) {
      setGrupoAtual(null);
    }
  }, [grupoAtual, toast]);

  useEffect(() => {
    fetchGrupos();
  }, [fetchGrupos]);

  return {
    grupos,
    grupoAtual,
    setGrupoAtual,
    loading,
    criarGrupo,
    atualizarGrupo,
    deletarGrupo,
    refetch: fetchGrupos,
  };
}
