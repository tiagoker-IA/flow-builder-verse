
-- Create admin_recovery table
CREATE TABLE public.admin_recovery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  recovery_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_recovery ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their own recovery email
CREATE POLICY "Admins can view own recovery"
ON public.admin_recovery
FOR SELECT
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can insert own recovery"
ON public.admin_recovery
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can update own recovery"
ON public.admin_recovery
FOR UPDATE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can delete own recovery"
ON public.admin_recovery
FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);
