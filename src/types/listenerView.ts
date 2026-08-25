export interface ListenerViewInput {
  passage: string;
  outline: string;
  audience?: string;
  objective?: string;
  duration?: string;
}

export interface ClarificationResponse {
  sessionId: string;
  understanding: string;
  questions: string[];
}

export interface ListenerViewAnalysis {
  analysis: string;
  requiresSignup: boolean;
}

export type ListenerViewStep = "form" | "questions" | "analysis";
