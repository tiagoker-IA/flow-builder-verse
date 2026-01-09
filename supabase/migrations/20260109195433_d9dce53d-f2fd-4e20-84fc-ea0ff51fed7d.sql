-- Tabela para armazenar feedback dos testadores
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('bug', 'sugestao', 'elogio', 'outro')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  pagina TEXT,
  modo_chat TEXT,
  nota_geral INTEGER CHECK (nota_geral >= 1 AND nota_geral <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem criar feedback
CREATE POLICY "Usuários autenticados podem criar feedback"
ON public.feedbacks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuários podem ver seus próprios feedbacks
CREATE POLICY "Usuários podem ver seus próprios feedbacks"
ON public.feedbacks
FOR SELECT
USING (auth.uid() = usuario_id);

-- Comentário na tabela
COMMENT ON TABLE public.feedbacks IS 'Feedbacks dos testadores do LogosFlow';