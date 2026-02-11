export interface GrupoPequeno {
  id: string;
  nome: string;
  lider_id: string;
  dia_semana: string | null;
  horario: string | null;
  local: string | null;
  created_at: string;
}

export type PapelMembro = "lider" | "vice_lider" | "membro";
export type StatusReuniao = "planejada" | "em_andamento" | "concluida";
export type TipoPergunta = "reflexiva" | "testemunhal" | "aplicacao" | "comunitaria";
export type TipoDesafio = "individual" | "coletivo" | "ambos";
export type TipoPartilha = "testemunho" | "luta" | "oracao";

export interface MembroGrupo {
  id: string;
  grupo_id: string;
  user_id: string;
  papel: PapelMembro;
  data_entrada: string;
  ativo: boolean;
  // joined from profiles
  nome?: string | null;
  avatar_url?: string | null;
}

export interface Reuniao {
  id: string;
  grupo_id: string;
  data_reuniao: string;
  tema_geral: string | null;
  status: StatusReuniao;
  created_at: string;
}

export interface Encontro {
  id: string;
  reuniao_id: string;
  titulo: string | null;
  instrucoes: string | null;
  duracao_minutos: number;
  relacionado_tema: boolean;
}

export interface Exaltacao {
  id: string;
  reuniao_id: string;
  duracao_minutos: number;
  notas_lider: string | null;
}

export interface MusicaExaltacao {
  id: string;
  exaltacao_id: string;
  titulo: string;
  artista: string | null;
  link_video: string | null;
  executada: boolean;
}

export interface Edificacao {
  id: string;
  reuniao_id: string;
  referencia_biblica: string | null;
  texto_completo: string | null;
  contexto_historico: string | null;
  tema_principal: string | null;
}

export interface PerguntaEdificacao {
  id: string;
  edificacao_id: string;
  ordem: number;
  texto_pergunta: string;
  tipo: TipoPergunta;
}

export interface RespostaPergunta {
  id: string;
  pergunta_id: string;
  membro_id: string;
  resposta_texto: string | null;
  tipo_partilha: TipoPartilha | null;
}

export interface Envio {
  id: string;
  reuniao_id: string;
  desafio_texto: string | null;
  tipo: TipoDesafio;
}

export interface CompromissoEnvio {
  id: string;
  envio_id: string;
  membro_id: string;
  comprometeu: boolean;
  cumprido: boolean;
  testemunho_resultado: string | null;
}

export interface Presenca {
  id: string;
  reuniao_id: string;
  membro_id: string;
  presente: boolean;
}

export interface QuebraGeloFavorito {
  id: string;
  user_id: string;
  titulo: string;
  instrucoes: string | null;
  tags: string[] | null;
  created_at: string;
}

// Reunião completa com dados dos 4Es
export interface ReuniaoCompleta extends Reuniao {
  encontro?: Encontro;
  exaltacao?: Exaltacao & { musicas?: MusicaExaltacao[] };
  edificacao?: Edificacao & { perguntas?: PerguntaEdificacao[] };
  envio?: Envio;
}

export type ModoVisualizacao = "preparacao" | "conducao" | "revisao";
