export type ChatMode = "exegese" | "devocional" | "academico" | "livre";

export interface Conversa {
  id: string;
  titulo: string;
  usuario_criador: string;
  modo: ChatMode;
  data_criacao: string;
  updated_at: string;
}

export interface Mensagem {
  id: string;
  conteudo: string;
  conversa_pai: string;
  remetente_ia: boolean;
  ordem: number;
  created_at: string;
}

export const MODOS_CHAT: { value: ChatMode; label: string; description: string }[] = [
  { value: "exegese", label: "Exegese", description: "Análise profunda de textos bíblicos" },
  { value: "devocional", label: "Devocional", description: "Reflexões pessoais e aplicações" },
  { value: "academico", label: "Acadêmico", description: "Estudos teológicos formais" },
  { value: "livre", label: "Livre", description: "Conversa geral sobre temas bíblicos" },
];
