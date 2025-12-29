-- Tabela: Conversas
CREATE TABLE public.conversas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL DEFAULT 'Nova Conversa',
    usuario_criador UUID NOT NULL,
    modo TEXT NOT NULL DEFAULT 'livre',
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela: Mensagens
CREATE TABLE public.mensagens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    conteudo TEXT NOT NULL,
    conversa_pai UUID NOT NULL REFERENCES public.conversas(id) ON DELETE CASCADE,
    remetente_ia BOOLEAN NOT NULL DEFAULT false,
    ordem INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas para Conversas
CREATE POLICY "Usuários podem ver suas próprias conversas"
ON public.conversas
FOR SELECT
USING (auth.uid() = usuario_criador);

CREATE POLICY "Usuários podem criar suas próprias conversas"
ON public.conversas
FOR INSERT
WITH CHECK (auth.uid() = usuario_criador);

CREATE POLICY "Usuários podem atualizar suas próprias conversas"
ON public.conversas
FOR UPDATE
USING (auth.uid() = usuario_criador);

CREATE POLICY "Usuários podem deletar suas próprias conversas"
ON public.conversas
FOR DELETE
USING (auth.uid() = usuario_criador);

-- Políticas para Mensagens (usuário pode ver mensagens das suas conversas)
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
ON public.mensagens
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversas
        WHERE conversas.id = mensagens.conversa_pai
        AND conversas.usuario_criador = auth.uid()
    )
);

CREATE POLICY "Usuários podem criar mensagens em suas conversas"
ON public.mensagens
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.conversas
        WHERE conversas.id = mensagens.conversa_pai
        AND conversas.usuario_criador = auth.uid()
    )
);

CREATE POLICY "Usuários podem deletar mensagens de suas conversas"
ON public.mensagens
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.conversas
        WHERE conversas.id = mensagens.conversa_pai
        AND conversas.usuario_criador = auth.uid()
    )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_conversas_updated_at
BEFORE UPDATE ON public.conversas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();