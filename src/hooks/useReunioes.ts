import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reuniao, ReuniaoCompleta, Encontro, Exaltacao, MusicaExaltacao, Edificacao, PerguntaEdificacao, Envio, StatusReuniao, TipoPergunta, TipoDesafio } from "@/types/grupos";
import { useToast } from "@/hooks/use-toast";

export function useReunioes(grupoId: string | undefined) {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [reuniaoAtual, setReuniaoAtual] = useState<ReuniaoCompleta | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReunioes = useCallback(async () => {
    if (!grupoId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("reunioes")
      .select("*")
      .eq("grupo_id", grupoId)
      .order("data_reuniao", { ascending: false });

    if (error) {
      console.error("Erro ao buscar reuniões:", error);
    } else {
      setReunioes((data || []) as Reuniao[]);
    }
    setLoading(false);
  }, [grupoId]);

  const fetchReuniaoCompleta = useCallback(async (reuniaoId: string) => {
    const { data: reuniao, error } = await supabase
      .from("reunioes")
      .select("*")
      .eq("id", reuniaoId)
      .maybeSingle();

    if (error || !reuniao) return null;

    // Fetch all 4Es in parallel
    const [encontroRes, exaltacaoRes, edificacaoRes, envioRes] = await Promise.all([
      supabase.from("encontro").select("*").eq("reuniao_id", reuniaoId).maybeSingle(),
      supabase.from("exaltacao").select("*").eq("reuniao_id", reuniaoId).maybeSingle(),
      supabase.from("edificacao").select("*").eq("reuniao_id", reuniaoId).maybeSingle(),
      supabase.from("envio").select("*").eq("reuniao_id", reuniaoId).maybeSingle(),
    ]);

    let musicas: MusicaExaltacao[] = [];
    if (exaltacaoRes.data) {
      const { data: musicasData } = await supabase
        .from("musicas_exaltacao")
        .select("*")
        .eq("exaltacao_id", exaltacaoRes.data.id);
      musicas = (musicasData || []) as MusicaExaltacao[];
    }

    let perguntas: PerguntaEdificacao[] = [];
    if (edificacaoRes.data) {
      const { data: perguntasData } = await supabase
        .from("perguntas_edificacao")
        .select("*")
        .eq("edificacao_id", edificacaoRes.data.id)
        .order("ordem", { ascending: true });
      perguntas = (perguntasData || []) as PerguntaEdificacao[];
    }

    const completa: ReuniaoCompleta = {
      ...(reuniao as Reuniao),
      encontro: encontroRes.data as Encontro | undefined,
      exaltacao: exaltacaoRes.data ? { ...(exaltacaoRes.data as Exaltacao), musicas } : undefined,
      edificacao: edificacaoRes.data ? { ...(edificacaoRes.data as Edificacao), perguntas } : undefined,
      envio: envioRes.data as Envio | undefined,
    };

    setReuniaoAtual(completa);
    return completa;
  }, []);

  const criarReuniao = useCallback(async (dados: { data_reuniao: string; tema_geral?: string }) => {
    if (!grupoId) return null;

    const { data: reuniao, error } = await supabase
      .from("reunioes")
      .insert({ grupo_id: grupoId, ...dados })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro", description: "Não foi possível criar a reunião.", variant: "destructive" });
      return null;
    }

    const reuniaoData = reuniao as Reuniao;

    // Create empty 4Es sections
    await Promise.all([
      supabase.from("encontro").insert({ reuniao_id: reuniaoData.id }),
      supabase.from("exaltacao").insert({ reuniao_id: reuniaoData.id }),
      supabase.from("edificacao").insert({ reuniao_id: reuniaoData.id }),
      supabase.from("envio").insert({ reuniao_id: reuniaoData.id }),
    ]);

    setReunioes(prev => [reuniaoData, ...prev]);
    await fetchReuniaoCompleta(reuniaoData.id);
    return reuniaoData;
  }, [grupoId, toast, fetchReuniaoCompleta]);

  const atualizarReuniao = useCallback(async (id: string, dados: Partial<Reuniao>) => {
    const { error } = await supabase.from("reunioes").update(dados).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível atualizar a reunião.", variant: "destructive" });
      return;
    }
    setReunioes(prev => prev.map(r => r.id === id ? { ...r, ...dados } : r));
    if (reuniaoAtual?.id === id) setReuniaoAtual(prev => prev ? { ...prev, ...dados } : null);
  }, [reuniaoAtual, toast]);

  const deletarReuniao = useCallback(async (id: string) => {
    const { error } = await supabase.from("reunioes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: "Não foi possível deletar a reunião.", variant: "destructive" });
      return;
    }
    setReunioes(prev => prev.filter(r => r.id !== id));
    if (reuniaoAtual?.id === id) setReuniaoAtual(null);
  }, [reuniaoAtual, toast]);

  // Save section data
  const salvarEncontro = useCallback(async (encontroId: string, dados: Partial<Encontro>) => {
    await supabase.from("encontro").update(dados).eq("id", encontroId);
  }, []);

  const salvarExaltacao = useCallback(async (exaltacaoId: string, dados: Partial<Exaltacao>) => {
    await supabase.from("exaltacao").update(dados).eq("id", exaltacaoId);
  }, []);

  const salvarEdificacao = useCallback(async (edificacaoId: string, dados: Partial<Edificacao>) => {
    await supabase.from("edificacao").update(dados).eq("id", edificacaoId);
  }, []);

  const salvarEnvio = useCallback(async (envioId: string, dados: Partial<Envio>) => {
    await supabase.from("envio").update(dados).eq("id", envioId);
  }, []);

  // Musicas
  const adicionarMusica = useCallback(async (exaltacaoId: string, musica: { titulo: string; artista?: string; link_video?: string }) => {
    const { data, error } = await supabase
      .from("musicas_exaltacao")
      .insert({ exaltacao_id: exaltacaoId, ...musica })
      .select()
      .single();
    if (error) return null;
    return data as MusicaExaltacao;
  }, []);

  const removerMusica = useCallback(async (musicaId: string) => {
    await supabase.from("musicas_exaltacao").delete().eq("id", musicaId);
  }, []);

  const toggleMusicaExecutada = useCallback(async (musicaId: string, executada: boolean) => {
    await supabase.from("musicas_exaltacao").update({ executada }).eq("id", musicaId);
  }, []);

  // Perguntas
  const adicionarPergunta = useCallback(async (edificacaoId: string, pergunta: { texto_pergunta: string; tipo?: TipoPergunta; ordem?: number }) => {
    const { data, error } = await supabase
      .from("perguntas_edificacao")
      .insert({ edificacao_id: edificacaoId, ...pergunta })
      .select()
      .single();
    if (error) return null;
    return data as PerguntaEdificacao;
  }, []);

  const removerPergunta = useCallback(async (perguntaId: string) => {
    await supabase.from("perguntas_edificacao").delete().eq("id", perguntaId);
  }, []);

  useEffect(() => {
    fetchReunioes();
  }, [fetchReunioes]);

  return {
    reunioes,
    reuniaoAtual,
    setReuniaoAtual,
    loading,
    criarReuniao,
    atualizarReuniao,
    deletarReuniao,
    fetchReuniaoCompleta,
    salvarEncontro,
    salvarExaltacao,
    salvarEdificacao,
    salvarEnvio,
    adicionarMusica,
    removerMusica,
    toggleMusicaExecutada,
    adicionarPergunta,
    removerPergunta,
    refetch: fetchReunioes,
  };
}
