
-- Enums for roles, status, question types, challenge types, share types
CREATE TYPE public.papel_membro AS ENUM ('lider', 'vice_lider', 'membro');
CREATE TYPE public.status_reuniao AS ENUM ('planejada', 'em_andamento', 'concluida');
CREATE TYPE public.tipo_pergunta AS ENUM ('reflexiva', 'testemunhal', 'aplicacao', 'comunitaria');
CREATE TYPE public.tipo_desafio AS ENUM ('individual', 'coletivo', 'ambos');
CREATE TYPE public.tipo_partilha AS ENUM ('testemunho', 'luta', 'oracao');

-- 1. grupos_pequenos
CREATE TABLE public.grupos_pequenos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  lider_id UUID NOT NULL,
  dia_semana TEXT,
  horario TEXT,
  local TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grupos_pequenos ENABLE ROW LEVEL SECURITY;

-- 2. membros_grupo
CREATE TABLE public.membros_grupo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.grupos_pequenos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  papel public.papel_membro NOT NULL DEFAULT 'membro',
  data_entrada TIMESTAMPTZ NOT NULL DEFAULT now(),
  ativo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(grupo_id, user_id)
);
ALTER TABLE public.membros_grupo ENABLE ROW LEVEL SECURITY;

-- 3. reunioes
CREATE TABLE public.reunioes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES public.grupos_pequenos(id) ON DELETE CASCADE,
  data_reuniao TIMESTAMPTZ NOT NULL,
  tema_geral TEXT,
  status public.status_reuniao NOT NULL DEFAULT 'planejada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reunioes ENABLE ROW LEVEL SECURITY;

-- 4. encontro
CREATE TABLE public.encontro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
  titulo TEXT,
  instrucoes TEXT,
  duracao_minutos INTEGER DEFAULT 10,
  relacionado_tema BOOLEAN DEFAULT true
);
ALTER TABLE public.encontro ENABLE ROW LEVEL SECURITY;

-- 5. exaltacao
CREATE TABLE public.exaltacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
  duracao_minutos INTEGER DEFAULT 20,
  notas_lider TEXT
);
ALTER TABLE public.exaltacao ENABLE ROW LEVEL SECURITY;

-- 6. musicas_exaltacao
CREATE TABLE public.musicas_exaltacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exaltacao_id UUID NOT NULL REFERENCES public.exaltacao(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  artista TEXT,
  link_video TEXT,
  executada BOOLEAN NOT NULL DEFAULT false
);
ALTER TABLE public.musicas_exaltacao ENABLE ROW LEVEL SECURITY;

-- 7. edificacao
CREATE TABLE public.edificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
  referencia_biblica TEXT,
  texto_completo TEXT,
  contexto_historico TEXT,
  tema_principal TEXT
);
ALTER TABLE public.edificacao ENABLE ROW LEVEL SECURITY;

-- 8. perguntas_edificacao
CREATE TABLE public.perguntas_edificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edificacao_id UUID NOT NULL REFERENCES public.edificacao(id) ON DELETE CASCADE,
  ordem INTEGER NOT NULL DEFAULT 1,
  texto_pergunta TEXT NOT NULL,
  tipo public.tipo_pergunta NOT NULL DEFAULT 'reflexiva'
);
ALTER TABLE public.perguntas_edificacao ENABLE ROW LEVEL SECURITY;

-- 9. respostas_perguntas
CREATE TABLE public.respostas_perguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta_id UUID NOT NULL REFERENCES public.perguntas_edificacao(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros_grupo(id) ON DELETE CASCADE,
  resposta_texto TEXT,
  tipo_partilha public.tipo_partilha
);
ALTER TABLE public.respostas_perguntas ENABLE ROW LEVEL SECURITY;

-- 10. envio
CREATE TABLE public.envio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
  desafio_texto TEXT,
  tipo public.tipo_desafio NOT NULL DEFAULT 'individual'
);
ALTER TABLE public.envio ENABLE ROW LEVEL SECURITY;

-- 11. compromissos_envio
CREATE TABLE public.compromissos_envio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envio_id UUID NOT NULL REFERENCES public.envio(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros_grupo(id) ON DELETE CASCADE,
  comprometeu BOOLEAN NOT NULL DEFAULT false,
  cumprido BOOLEAN NOT NULL DEFAULT false,
  testemunho_resultado TEXT
);
ALTER TABLE public.compromissos_envio ENABLE ROW LEVEL SECURITY;

-- 12. presencas
CREATE TABLE public.presencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reuniao_id UUID NOT NULL REFERENCES public.reunioes(id) ON DELETE CASCADE,
  membro_id UUID NOT NULL REFERENCES public.membros_grupo(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(reuniao_id, membro_id)
);
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- 13. quebragelos_favoritos
CREATE TABLE public.quebragelos_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  instrucoes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quebragelos_favoritos ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _grupo_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.membros_grupo
    WHERE user_id = _user_id AND grupo_id = _grupo_id AND ativo = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_leader(_user_id UUID, _grupo_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.membros_grupo
    WHERE user_id = _user_id AND grupo_id = _grupo_id AND ativo = true AND papel IN ('lider', 'vice_lider')
  )
$$;

-- Helper to get grupo_id from reuniao
CREATE OR REPLACE FUNCTION public.get_grupo_from_reuniao(_reuniao_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT grupo_id FROM public.reunioes WHERE id = _reuniao_id
$$;

-- Helper to get grupo_id from edificacao
CREATE OR REPLACE FUNCTION public.get_grupo_from_edificacao(_edificacao_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.grupo_id FROM public.reunioes r
  JOIN public.edificacao e ON e.reuniao_id = r.id
  WHERE e.id = _edificacao_id
$$;

-- Helper to get grupo_id from exaltacao
CREATE OR REPLACE FUNCTION public.get_grupo_from_exaltacao(_exaltacao_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.grupo_id FROM public.reunioes r
  JOIN public.exaltacao ex ON ex.reuniao_id = r.id
  WHERE ex.id = _exaltacao_id
$$;

-- Helper to get grupo_id from envio
CREATE OR REPLACE FUNCTION public.get_grupo_from_envio(_envio_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.grupo_id FROM public.reunioes r
  JOIN public.envio en ON en.reuniao_id = r.id
  WHERE en.id = _envio_id
$$;

-- Helper to get grupo_id from pergunta
CREATE OR REPLACE FUNCTION public.get_grupo_from_pergunta(_pergunta_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.grupo_id FROM public.reunioes r
  JOIN public.edificacao e ON e.reuniao_id = r.id
  JOIN public.perguntas_edificacao p ON p.edificacao_id = e.id
  WHERE p.id = _pergunta_id
$$;

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

-- grupos_pequenos: creator (lider_id) or members can see
CREATE POLICY "Members can view their group" ON public.grupos_pequenos
FOR SELECT USING (public.is_group_member(auth.uid(), id) OR lider_id = auth.uid());

CREATE POLICY "Authenticated users can create groups" ON public.grupos_pequenos
FOR INSERT WITH CHECK (auth.uid() = lider_id);

CREATE POLICY "Leaders can update their group" ON public.grupos_pequenos
FOR UPDATE USING (public.is_group_leader(auth.uid(), id));

CREATE POLICY "Leaders can delete their group" ON public.grupos_pequenos
FOR DELETE USING (lider_id = auth.uid());

-- membros_grupo
CREATE POLICY "Members can view group members" ON public.membros_grupo
FOR SELECT USING (public.is_group_member(auth.uid(), grupo_id) OR user_id = auth.uid());

CREATE POLICY "Leaders can manage members" ON public.membros_grupo
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), grupo_id));

CREATE POLICY "Leaders can update members" ON public.membros_grupo
FOR UPDATE USING (public.is_group_leader(auth.uid(), grupo_id));

CREATE POLICY "Leaders can remove members" ON public.membros_grupo
FOR DELETE USING (public.is_group_leader(auth.uid(), grupo_id));

-- reunioes
CREATE POLICY "Members can view reunioes" ON public.reunioes
FOR SELECT USING (public.is_group_member(auth.uid(), grupo_id));

CREATE POLICY "Leaders can create reunioes" ON public.reunioes
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), grupo_id));

CREATE POLICY "Leaders can update reunioes" ON public.reunioes
FOR UPDATE USING (public.is_group_leader(auth.uid(), grupo_id));

CREATE POLICY "Leaders can delete reunioes" ON public.reunioes
FOR DELETE USING (public.is_group_leader(auth.uid(), grupo_id));

-- encontro
CREATE POLICY "Members can view encontro" ON public.encontro
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can manage encontro" ON public.encontro
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can update encontro" ON public.encontro
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can delete encontro" ON public.encontro
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

-- exaltacao
CREATE POLICY "Members can view exaltacao" ON public.exaltacao
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can manage exaltacao" ON public.exaltacao
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can update exaltacao" ON public.exaltacao
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can delete exaltacao" ON public.exaltacao
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

-- musicas_exaltacao
CREATE POLICY "Members can view musicas" ON public.musicas_exaltacao
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_exaltacao(exaltacao_id)));

CREATE POLICY "Leaders can manage musicas" ON public.musicas_exaltacao
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_exaltacao(exaltacao_id)));

CREATE POLICY "Leaders can update musicas" ON public.musicas_exaltacao
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_exaltacao(exaltacao_id)));

CREATE POLICY "Leaders can delete musicas" ON public.musicas_exaltacao
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_exaltacao(exaltacao_id)));

-- edificacao
CREATE POLICY "Members can view edificacao" ON public.edificacao
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can manage edificacao" ON public.edificacao
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can update edificacao" ON public.edificacao
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can delete edificacao" ON public.edificacao
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

-- perguntas_edificacao
CREATE POLICY "Members can view perguntas" ON public.perguntas_edificacao
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_edificacao(edificacao_id)));

CREATE POLICY "Leaders can manage perguntas" ON public.perguntas_edificacao
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_edificacao(edificacao_id)));

CREATE POLICY "Leaders can update perguntas" ON public.perguntas_edificacao
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_edificacao(edificacao_id)));

CREATE POLICY "Leaders can delete perguntas" ON public.perguntas_edificacao
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_edificacao(edificacao_id)));

-- respostas_perguntas
CREATE POLICY "Members can view respostas" ON public.respostas_perguntas
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_pergunta(pergunta_id)));

CREATE POLICY "Members can add respostas" ON public.respostas_perguntas
FOR INSERT WITH CHECK (public.is_group_member(auth.uid(), public.get_grupo_from_pergunta(pergunta_id)));

CREATE POLICY "Members can update own respostas" ON public.respostas_perguntas
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.membros_grupo WHERE id = membro_id AND user_id = auth.uid())
);

-- envio
CREATE POLICY "Members can view envio" ON public.envio
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can manage envio" ON public.envio
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can update envio" ON public.envio
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can delete envio" ON public.envio
FOR DELETE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

-- compromissos_envio
CREATE POLICY "Members can view compromissos" ON public.compromissos_envio
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.membros_grupo WHERE id = membro_id AND user_id = auth.uid())
  OR public.is_group_leader(auth.uid(), public.get_grupo_from_envio(envio_id))
);

CREATE POLICY "Leaders can create compromissos" ON public.compromissos_envio
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_envio(envio_id)));

CREATE POLICY "Members can update own compromissos" ON public.compromissos_envio
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.membros_grupo WHERE id = membro_id AND user_id = auth.uid())
);

-- presencas
CREATE POLICY "Members can view presencas" ON public.presencas
FOR SELECT USING (public.is_group_member(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can manage presencas" ON public.presencas
FOR INSERT WITH CHECK (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

CREATE POLICY "Leaders can update presencas" ON public.presencas
FOR UPDATE USING (public.is_group_leader(auth.uid(), public.get_grupo_from_reuniao(reuniao_id)));

-- quebragelos_favoritos
CREATE POLICY "Users can view own quebragelos" ON public.quebragelos_favoritos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create quebragelos" ON public.quebragelos_favoritos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quebragelos" ON public.quebragelos_favoritos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quebragelos" ON public.quebragelos_favoritos
FOR DELETE USING (auth.uid() = user_id);

-- Auto-add creator as leader member when group is created
CREATE OR REPLACE FUNCTION public.auto_add_leader_to_group()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.membros_grupo (grupo_id, user_id, papel)
  VALUES (NEW.id, NEW.lider_id, 'lider');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_add_leader
AFTER INSERT ON public.grupos_pequenos
FOR EACH ROW
EXECUTE FUNCTION public.auto_add_leader_to_group();
