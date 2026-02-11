import type { User, Session } from "@supabase/supabase-js";
import type { Conversa, Mensagem } from "@/types/chat";

export const mockUser: Partial<User> = {
  id: "user-123-abc",
  email: "teste@exemplo.com",
  created_at: "2025-01-01T00:00:00Z",
  app_metadata: {},
  user_metadata: { nome: "Usuário Teste" },
  aud: "authenticated",
};

export const mockSession: Partial<Session> = {
  user: mockUser as User,
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
};

export const mockProfile = {
  id: "user-123-abc",
  nome: "Usuário Teste",
  avatar_url: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const mockConversas: Conversa[] = [
  {
    id: "conv-1",
    titulo: "Estudo de Romanos 8",
    usuario_criador: "user-123-abc",
    modo: "exegese",
    data_criacao: "2025-06-01T10:00:00Z",
    updated_at: "2025-06-01T12:00:00Z",
  },
  {
    id: "conv-2",
    titulo: "Sermão sobre Graça",
    usuario_criador: "user-123-abc",
    modo: "mensagem",
    data_criacao: "2025-06-02T08:00:00Z",
    updated_at: "2025-06-02T09:30:00Z",
  },
];

export const mockMensagens: Mensagem[] = [
  {
    id: "msg-1",
    conteudo: "Analise Romanos 8:28",
    conversa_pai: "conv-1",
    remetente_ia: false,
    ordem: 1,
    created_at: "2025-06-01T10:00:00Z",
  },
  {
    id: "msg-2",
    conteudo: "Romanos 8:28 diz que todas as coisas cooperam...",
    conversa_pai: "conv-1",
    remetente_ia: true,
    ordem: 2,
    created_at: "2025-06-01T10:01:00Z",
  },
];
