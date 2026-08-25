-- Stores only technical usage metadata. Sermon passages, outlines, answers and AI
-- responses are intentionally not persisted in this table.
CREATE TABLE public.listener_view_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'processing_clarification'
    CHECK (status IN ('processing_clarification', 'awaiting_answers', 'processing_analysis', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);

CREATE INDEX listener_view_sessions_visitor_created_idx
  ON public.listener_view_sessions (visitor_hash, created_at DESC);

CREATE INDEX listener_view_sessions_ip_created_idx
  ON public.listener_view_sessions (ip_hash, created_at DESC);

CREATE INDEX listener_view_sessions_user_created_idx
  ON public.listener_view_sessions (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Prevents concurrent requests from opening more than one free session for the
-- same browser. Failed attempts remain retryable.
CREATE UNIQUE INDEX listener_view_guest_once_idx
  ON public.listener_view_sessions (visitor_hash)
  WHERE user_id IS NULL AND status <> 'failed';

ALTER TABLE public.listener_view_sessions ENABLE ROW LEVEL SECURITY;

-- No client policies are created. Only the Edge Function, using the service role,
-- can read or write usage metadata.
