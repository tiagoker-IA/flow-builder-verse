export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_recovery: {
        Row: {
          created_at: string
          id: string
          recovery_email: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recovery_email: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recovery_email?: string
          user_id?: string
        }
        Relationships: []
      }
      compromissos_envio: {
        Row: {
          comprometeu: boolean
          cumprido: boolean
          envio_id: string
          id: string
          membro_id: string
          testemunho_resultado: string | null
        }
        Insert: {
          comprometeu?: boolean
          cumprido?: boolean
          envio_id: string
          id?: string
          membro_id: string
          testemunho_resultado?: string | null
        }
        Update: {
          comprometeu?: boolean
          cumprido?: boolean
          envio_id?: string
          id?: string
          membro_id?: string
          testemunho_resultado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_envio_envio_id_fkey"
            columns: ["envio_id"]
            isOneToOne: false
            referencedRelation: "envio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_envio_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros_grupo"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          data_criacao: string
          id: string
          modo: string
          titulo: string
          updated_at: string
          usuario_criador: string
        }
        Insert: {
          data_criacao?: string
          id?: string
          modo?: string
          titulo?: string
          updated_at?: string
          usuario_criador: string
        }
        Update: {
          data_criacao?: string
          id?: string
          modo?: string
          titulo?: string
          updated_at?: string
          usuario_criador?: string
        }
        Relationships: []
      }
      edificacao: {
        Row: {
          contexto_historico: string | null
          id: string
          referencia_biblica: string | null
          reuniao_id: string
          tema_principal: string | null
          texto_completo: string | null
        }
        Insert: {
          contexto_historico?: string | null
          id?: string
          referencia_biblica?: string | null
          reuniao_id: string
          tema_principal?: string | null
          texto_completo?: string | null
        }
        Update: {
          contexto_historico?: string | null
          id?: string
          referencia_biblica?: string | null
          reuniao_id?: string
          tema_principal?: string | null
          texto_completo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "edificacao_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          assunto: string
          conteudo_html: string
          created_at: string
          created_by: string | null
          enviados_count: number | null
          id: string
          sent_at: string | null
          status: string
          titulo: string
          total_destinatarios: number | null
        }
        Insert: {
          assunto: string
          conteudo_html: string
          created_at?: string
          created_by?: string | null
          enviados_count?: number | null
          id?: string
          sent_at?: string | null
          status?: string
          titulo: string
          total_destinatarios?: number | null
        }
        Update: {
          assunto?: string
          conteudo_html?: string
          created_at?: string
          created_by?: string | null
          enviados_count?: number | null
          id?: string
          sent_at?: string | null
          status?: string
          titulo?: string
          total_destinatarios?: number | null
        }
        Relationships: []
      }
      encontro: {
        Row: {
          duracao_minutos: number | null
          id: string
          instrucoes: string | null
          relacionado_tema: boolean | null
          reuniao_id: string
          titulo: string | null
        }
        Insert: {
          duracao_minutos?: number | null
          id?: string
          instrucoes?: string | null
          relacionado_tema?: boolean | null
          reuniao_id: string
          titulo?: string | null
        }
        Update: {
          duracao_minutos?: number | null
          id?: string
          instrucoes?: string | null
          relacionado_tema?: boolean | null
          reuniao_id?: string
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encontro_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      envio: {
        Row: {
          desafio_texto: string | null
          id: string
          reuniao_id: string
          tipo: Database["public"]["Enums"]["tipo_desafio"]
        }
        Insert: {
          desafio_texto?: string | null
          id?: string
          reuniao_id: string
          tipo?: Database["public"]["Enums"]["tipo_desafio"]
        }
        Update: {
          desafio_texto?: string | null
          id?: string
          reuniao_id?: string
          tipo?: Database["public"]["Enums"]["tipo_desafio"]
        }
        Relationships: [
          {
            foreignKeyName: "envio_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      exaltacao: {
        Row: {
          duracao_minutos: number | null
          id: string
          notas_lider: string | null
          reuniao_id: string
        }
        Insert: {
          duracao_minutos?: number | null
          id?: string
          notas_lider?: string | null
          reuniao_id: string
        }
        Update: {
          duracao_minutos?: number | null
          id?: string
          notas_lider?: string | null
          reuniao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exaltacao_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      feedbacks: {
        Row: {
          created_at: string
          descricao: string
          id: string
          modo_chat: string | null
          nota_geral: number | null
          pagina: string | null
          tipo: string
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          modo_chat?: string | null
          nota_geral?: number | null
          pagina?: string | null
          tipo: string
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          modo_chat?: string | null
          nota_geral?: number | null
          pagina?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      grupos_pequenos: {
        Row: {
          created_at: string
          dia_semana: string | null
          horario: string | null
          id: string
          lider_id: string
          local: string | null
          nome: string
        }
        Insert: {
          created_at?: string
          dia_semana?: string | null
          horario?: string | null
          id?: string
          lider_id: string
          local?: string | null
          nome: string
        }
        Update: {
          created_at?: string
          dia_semana?: string | null
          horario?: string | null
          id?: string
          lider_id?: string
          local?: string | null
          nome?: string
        }
        Relationships: []
      }
      membros_grupo: {
        Row: {
          ativo: boolean
          data_entrada: string
          grupo_id: string
          id: string
          papel: Database["public"]["Enums"]["papel_membro"]
          user_id: string
        }
        Insert: {
          ativo?: boolean
          data_entrada?: string
          grupo_id: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_membro"]
          user_id: string
        }
        Update: {
          ativo?: boolean
          data_entrada?: string
          grupo_id?: string
          id?: string
          papel?: Database["public"]["Enums"]["papel_membro"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_grupo_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_pequenos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          conteudo: string
          conversa_pai: string
          created_at: string
          id: string
          ordem: number
          remetente_ia: boolean
        }
        Insert: {
          conteudo: string
          conversa_pai: string
          created_at?: string
          id?: string
          ordem?: number
          remetente_ia?: boolean
        }
        Update: {
          conteudo?: string
          conversa_pai?: string
          created_at?: string
          id?: string
          ordem?: number
          remetente_ia?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_pai_fkey"
            columns: ["conversa_pai"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      musicas_exaltacao: {
        Row: {
          artista: string | null
          exaltacao_id: string
          executada: boolean
          id: string
          link_video: string | null
          titulo: string
        }
        Insert: {
          artista?: string | null
          exaltacao_id: string
          executada?: boolean
          id?: string
          link_video?: string | null
          titulo: string
        }
        Update: {
          artista?: string | null
          exaltacao_id?: string
          executada?: boolean
          id?: string
          link_video?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "musicas_exaltacao_exaltacao_id_fkey"
            columns: ["exaltacao_id"]
            isOneToOne: false
            referencedRelation: "exaltacao"
            referencedColumns: ["id"]
          },
        ]
      }
      perguntas_edificacao: {
        Row: {
          edificacao_id: string
          id: string
          ordem: number
          texto_pergunta: string
          tipo: Database["public"]["Enums"]["tipo_pergunta"]
        }
        Insert: {
          edificacao_id: string
          id?: string
          ordem?: number
          texto_pergunta: string
          tipo?: Database["public"]["Enums"]["tipo_pergunta"]
        }
        Update: {
          edificacao_id?: string
          id?: string
          ordem?: number
          texto_pergunta?: string
          tipo?: Database["public"]["Enums"]["tipo_pergunta"]
        }
        Relationships: [
          {
            foreignKeyName: "perguntas_edificacao_edificacao_id_fkey"
            columns: ["edificacao_id"]
            isOneToOne: false
            referencedRelation: "edificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          id: string
          membro_id: string
          presente: boolean
          reuniao_id: string
        }
        Insert: {
          id?: string
          membro_id: string
          presente?: boolean
          reuniao_id: string
        }
        Update: {
          id?: string
          membro_id?: string
          presente?: boolean
          reuniao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_reuniao_id_fkey"
            columns: ["reuniao_id"]
            isOneToOne: false
            referencedRelation: "reunioes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nome: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nome?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quebragelos_favoritos: {
        Row: {
          created_at: string
          id: string
          instrucoes: string | null
          tags: string[] | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          instrucoes?: string | null
          tags?: string[] | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          instrucoes?: string | null
          tags?: string[] | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      respostas_perguntas: {
        Row: {
          id: string
          membro_id: string
          pergunta_id: string
          resposta_texto: string | null
          tipo_partilha: Database["public"]["Enums"]["tipo_partilha"] | null
        }
        Insert: {
          id?: string
          membro_id: string
          pergunta_id: string
          resposta_texto?: string | null
          tipo_partilha?: Database["public"]["Enums"]["tipo_partilha"] | null
        }
        Update: {
          id?: string
          membro_id?: string
          pergunta_id?: string
          resposta_texto?: string | null
          tipo_partilha?: Database["public"]["Enums"]["tipo_partilha"] | null
        }
        Relationships: [
          {
            foreignKeyName: "respostas_perguntas_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros_grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_perguntas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "perguntas_edificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      reunioes: {
        Row: {
          created_at: string
          data_reuniao: string
          grupo_id: string
          id: string
          status: Database["public"]["Enums"]["status_reuniao"]
          tema_geral: string | null
        }
        Insert: {
          created_at?: string
          data_reuniao: string
          grupo_id: string
          id?: string
          status?: Database["public"]["Enums"]["status_reuniao"]
          tema_geral?: string | null
        }
        Update: {
          created_at?: string
          data_reuniao?: string
          grupo_id?: string
          id?: string
          status?: Database["public"]["Enums"]["status_reuniao"]
          tema_geral?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reunioes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos_pequenos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_grupo_from_edificacao: {
        Args: { _edificacao_id: string }
        Returns: string
      }
      get_grupo_from_envio: { Args: { _envio_id: string }; Returns: string }
      get_grupo_from_exaltacao: {
        Args: { _exaltacao_id: string }
        Returns: string
      }
      get_grupo_from_pergunta: {
        Args: { _pergunta_id: string }
        Returns: string
      }
      get_grupo_from_reuniao: { Args: { _reuniao_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_leader: {
        Args: { _grupo_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _grupo_id: string; _user_id: string }
        Returns: boolean
      }
      "send-auth-email": { Args: { event: Json }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
      papel_membro: "lider" | "vice_lider" | "membro"
      status_reuniao: "planejada" | "em_andamento" | "concluida"
      tipo_desafio: "individual" | "coletivo" | "ambos"
      tipo_partilha: "testemunho" | "luta" | "oracao"
      tipo_pergunta: "reflexiva" | "testemunhal" | "aplicacao" | "comunitaria"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      papel_membro: ["lider", "vice_lider", "membro"],
      status_reuniao: ["planejada", "em_andamento", "concluida"],
      tipo_desafio: ["individual", "coletivo", "ambos"],
      tipo_partilha: ["testemunho", "luta", "oracao"],
      tipo_pergunta: ["reflexiva", "testemunhal", "aplicacao", "comunitaria"],
    },
  },
} as const
