
-- Enable pg_net extension for HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the PostgreSQL function that the auth hook calls
CREATE OR REPLACE FUNCTION public."send-auth-email"(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  edge_function_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Build the Edge Function URL
  edge_function_url := 'https://omhhudldrmhxkyvrxekq.supabase.co/functions/v1/send-auth-email';
  
  -- Get the service role key from vault or use direct
  service_role_key := current_setting('supabase.service_role_key', true);

  -- Make async HTTP POST to the Edge Function
  SELECT net.http_post(
    url := edge_function_url,
    body := event,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(service_role_key, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9taGh1ZGxkcm1oeGt5dnJ4ZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTQ2NzcsImV4cCI6MjA4MjU3MDY3N30.IhGnSD8IC8QCRZ1zQe60Fz8--vZvyqPU6iQ8W-cuNsg')
    )
  ) INTO request_id;

  -- Return the expected format for the auth hook
  RETURN jsonb_build_object();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public."send-auth-email"(jsonb) TO supabase_auth_admin;

-- Revoke from public for security
REVOKE EXECUTE ON FUNCTION public."send-auth-email"(jsonb) FROM public;
REVOKE EXECUTE ON FUNCTION public."send-auth-email"(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public."send-auth-email"(jsonb) FROM authenticated;
