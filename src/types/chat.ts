import { BookOpen, Heart, Users, MessageCircle, FileText, LucideIcon } from "lucide-react";

export type ChatMode = "mensagem" | "exegese" | "devocional" | "grupo_pequeno" | "livre";

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

export interface ModoInfo {
  value: ChatMode;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const MODOS_CHAT: ModoInfo[] = [
  { 
    value: "mensagem", 
    label: "Mensagem", 
    description: "Preparação de sermões reformados",
    icon: FileText,
    color: "text-amber-600 dark:text-amber-400"
  },
  { 
    value: "exegese", 
    label: "Exegese", 
    description: "Análise profunda de textos bíblicos",
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400"
  },
  { 
    value: "devocional", 
    label: "Devocional", 
    description: "Reflexões pessoais e aplicações",
    icon: Heart,
    color: "text-rose-600 dark:text-rose-400"
  },
  { 
    value: "grupo_pequeno", 
    label: "Grupo Pequeno", 
    description: "Planeje reuniões com os 4Es",
    icon: Users,
    color: "text-purple-600 dark:text-purple-400"
  },
  { 
    value: "livre", 
    label: "Livre", 
    description: "Conversa geral sobre temas bíblicos",
    icon: MessageCircle,
    color: "text-emerald-600 dark:text-emerald-400"
  },
];