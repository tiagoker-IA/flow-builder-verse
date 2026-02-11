import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MembroGrupo, PapelMembro, Presenca } from "@/types/grupos";
import { useToast } from "@/hooks/use-toast";

export function useMembros(grupoId: string | undefined) {
  const [membros, setMembros] = useState<MembroGrupo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembros = useCallback(async () => {
    if (!grupoId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("membros_grupo")
      .select("*")
      .eq("grupo_id", grupoId)
      .eq("ativo", true)
      .order("data_entrada", { ascending: true });

    if (error) {
      console.error("Erro ao buscar membros:", error);
    } else {
      // Fetch profile names for each member
      const membrosData = data as MembroGrupo[];
      const userIds = membrosData.map(m => m.user_id);
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, avatar_url")
          .in("id", userIds);

        if (profiles) {
          const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
          membrosData.forEach(m => {
            const profile = profileMap.get(m.user_id);
            if (profile) {
              m.nome = profile.nome;
              m.avatar_url = profile.avatar_url;
            }
          });
        }
      }

      setMembros(membrosData);
    }
    setLoading(false);
  }, [grupoId]);

  const adicionarMembro = useCallback(async (email: string) => {
    // We need to find user by email - this requires an edge function or admin access
    // For now, we'll add by user_id directly
    toast({ title: "Info", description: "Funcionalidade de convite por email será implementada em breve." });
    return null;
  }, [toast]);

  const removerMembro = useCallback(async (membroId: string) => {
    const { error } = await supabase
      .from("membros_grupo")
      .update({ ativo: false })
      .eq("id", membroId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível remover o membro.", variant: "destructive" });
      return;
    }

    setMembros(prev => prev.filter(m => m.id !== membroId));
  }, [toast]);

  const atualizarPapel = useCallback(async (membroId: string, papel: PapelMembro) => {
    const { error } = await supabase
      .from("membros_grupo")
      .update({ papel })
      .eq("id", membroId);

    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar o papel.", variant: "destructive" });
      return;
    }

    setMembros(prev => prev.map(m => m.id === membroId ? { ...m, papel } : m));
  }, [toast]);

  // Presença
  const registrarPresenca = useCallback(async (reuniaoId: string, membroId: string, presente: boolean) => {
    const { error } = await supabase
      .from("presencas")
      .upsert({ reuniao_id: reuniaoId, membro_id: membroId, presente }, { onConflict: "reuniao_id,membro_id" });

    if (error) {
      console.error("Erro ao registrar presença:", error);
    }
  }, []);

  const fetchPresencas = useCallback(async (reuniaoId: string): Promise<Presenca[]> => {
    const { data, error } = await supabase
      .from("presencas")
      .select("*")
      .eq("reuniao_id", reuniaoId);

    if (error) return [];
    return (data || []) as Presenca[];
  }, []);

  useEffect(() => {
    fetchMembros();
  }, [fetchMembros]);

  return {
    membros,
    loading,
    adicionarMembro,
    removerMembro,
    atualizarPapel,
    registrarPresenca,
    fetchPresencas,
    refetch: fetchMembros,
  };
}
