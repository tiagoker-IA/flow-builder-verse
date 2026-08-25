import { supabase } from "@/integrations/supabase/client";
import type {
  ClarificationResponse,
  ListenerViewAnalysis,
  ListenerViewInput,
} from "@/types/listenerView";

const VISITOR_ID_KEY = "logosflow_listener_visitor_id";

function getVisitorId() {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  localStorage.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

async function invokeListenerView<T>(body: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const publicKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/listener-view`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken || publicKey}`,
      },
      body: JSON.stringify({ ...body, visitorId: getVisitorId() }),
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.error || "Não foi possível concluir esta etapa.");
    Object.assign(error, { status: response.status, code: payload.code });
    throw error;
  }

  return payload as T;
}

export function requestClarification(input: ListenerViewInput) {
  return invokeListenerView<ClarificationResponse>({ phase: "clarify", input });
}

export function requestListenerAnalysis(
  sessionId: string,
  input: ListenerViewInput,
  answers: string[],
) {
  return invokeListenerView<ListenerViewAnalysis>({
    phase: "analyze",
    sessionId,
    input,
    answers,
  });
}
