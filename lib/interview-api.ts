/**
 * Client SDK for the new conversational case-interview endpoints.
 * Mirrors backend/routes/attempts.py.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  console.error('[MECE] NEXT_PUBLIC_API_URL is not set in production; backend calls will fail.');
}

export interface AttemptSummary {
  attempt_id: string;
  case_id: string;
  tier: 'free' | 'lite' | 'pro';
  clarification_quota: number;
  clarification_used: number;
  clarification_remaining: number;
  status: 'active' | 'submitted' | 'abandoned';
}

export type MessageKind = 'text' | 'voice' | 'image' | 'file' | 'recommendation' | 'system_note';

export interface AttemptMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  kind: MessageKind;
  content: string | null;
  file_id?: string | null;
  is_clarification: boolean;
  created_at: string;
}

export interface CaseDetail {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  content: string;
  hint?: string | null;
}

export interface AttemptDetail {
  attempt: AttemptSummary;
  case: CaseDetail;
  messages: AttemptMessage[];
}

export interface UploadResponse {
  message: AttemptMessage;
  file: {
    id: string;
    storage_path: string;
    mime_type: string;
    file_name: string;
    size_bytes: number;
    signed_url: string | null;
  };
}

export interface SubmitResponse {
  submission_id: string;
  attempt_id: string;
  score: number;
  breakdown: Record<string, number>;
  strengths: string[];
  improvements: string[];
  summary: string;
  rubric: string;
}

function authHeaders(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * FastAPI errors come back as `{"detail": "..."}`. Surfacing the raw body meant
 * users saw `post message failed (400): {"detail":"Message limit reached for
 * this attempt"}` in a toast — JSON braces and all. Pull the human sentence out
 * and fall back to something readable rather than a status dump.
 */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  let body = '';
  try {
    body = await res.text();
  } catch {
    return fallback;
  }
  try {
    const parsed = JSON.parse(body);
    const detail = parsed?.detail;
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg;
  } catch {
    /* not JSON — fall through */
  }
  const trimmed = body.trim();
  return trimmed && trimmed.length < 200 && !trimmed.startsWith('<') ? trimmed : fallback;
}

export async function startAttempt(caseId: string, token: string): Promise<AttemptSummary> {
  const res = await fetch(`${API_URL}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ case_id: caseId }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't start this session. Please refresh and try again."));
  return res.json();
}

export async function getAttempt(attemptId: string, token: string): Promise<AttemptDetail> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}`, {
    headers: { ...authHeaders(token) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't load this session. Please refresh and try again."));
  return res.json();
}

/**
 * Posts a user message and streams the interviewer's reply token-by-token.
 *
 * Returns the final assembled assistant text and metadata. The `onToken`
 * callback fires for every streamed chunk so callers can render live.
 */
export async function postMessageStream(
  attemptId: string,
  token: string,
  payload: { content: string; kind: MessageKind },
  callbacks: {
    onMeta?: (meta: {
      clarification_remaining: number;
      is_clarification: boolean;
      /** True when THIS turn's question was declined because the quota is spent. */
      clarifications_spent?: boolean;
    }) => void;
    onToken?: (text: string) => void;
    onDone?: (info: { message_id: string | null }) => void;
    onError?: (err: string) => void;
  } = {},
): Promise<{ assistantText: string; quotaRemaining: number | null; clarificationsSpent: boolean }> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't send that message. Please try again."));

  const ct = res.headers.get('content-type') || '';
  // Legacy quota-exhausted path: older backends returned plain JSON with no
  // assistant reply at all. The current backend always streams (the
  // interviewer declines the clarification in-character instead of going
  // silent) — this branch stays only so a stale backend degrades gracefully.
  if (ct.includes('application/json')) {
    const json = await res.json();
    return {
      assistantText: '',
      quotaRemaining: json.clarification_remaining ?? 0,
      clarificationsSpent: Boolean(json.quota_exhausted),
    };
  }

  if (!res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assistantText = '';
  let quotaRemaining: number | null = null;
  let clarificationsSpent = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const raw of events) {
      const lines = raw.split('\n');
      const event = lines.find((l) => l.startsWith('event: '))?.slice(7) || 'message';
      const data = lines.find((l) => l.startsWith('data: '))?.slice(6) || '';
      if (event === 'meta') {
        try {
          const meta = JSON.parse(data);
          quotaRemaining = meta.clarification_remaining ?? null;
          clarificationsSpent = Boolean(meta.clarifications_spent);
          callbacks.onMeta?.(meta);
        } catch {
          /* ignore */
        }
      } else if (event === 'token') {
        const tok = data.replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
        assistantText += tok;
        callbacks.onToken?.(tok);
      } else if (event === 'done') {
        try {
          callbacks.onDone?.(JSON.parse(data));
        } catch {
          callbacks.onDone?.({ message_id: null });
        }
      } else if (event === 'error') {
        callbacks.onError?.(data);
      }
    }
  }
  return { assistantText, quotaRemaining, clarificationsSpent };
}

/**
 * Persist ONE turn from a realtime voice session.
 *
 * Realtime runs the conversation at the far end, so unlike postMessageStream
 * this does not produce a reply — it only lands the same `attempt_messages`
 * row the typed path writes, so scoring reads one format for every transport.
 * `usage` carries the audio-token counts from `response.done`; without it,
 * realtime spend is invisible to the daily-budget guard.
 */
export async function postRealtimeTurn(
  attemptId: string,
  token: string,
  turn: {
    role: 'user' | 'assistant';
    content: string;
    audio_input_tokens?: number;
    audio_output_tokens?: number;
  },
): Promise<{ message_id: string | null }> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/realtime-turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(turn),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't save that turn."));
  return res.json();
}

/**
 * MECE Interviewer V11's decision for one FINAL candidate turn of a realtime
 * voice session. The realtime model is only the voice: it speaks `say` verbatim,
 * or nothing when `lane` is SILENCE. Turns are still landed via postRealtimeTurn.
 */
export interface VoiceDecision {
  lane: 'SILENCE' | 'PRESENCE' | 'SUBSTANTIVE';
  mode: string | null;
  reason: string | null;
  say: string | null;
  event: { event_type: string; data: { mode: string; code: string; text: string } } | null;
}

export async function postVoiceDecision(
  attemptId: string,
  token: string,
  content: string,
  opts: {
    /** Client id of this turn (needed for an early decision). */
    turnId?: string;
    /** Early decision: its learner-state fold waits for postVoiceFold. */
    deferFold?: boolean;
    /** Early decisions the client has voided: drop their folds first. */
    discardTurnIds?: string[];
  } = {},
): Promise<VoiceDecision> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/voice-decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({
      content,
      is_partial: false,
      ...(opts.turnId ? { turn_id: opts.turnId } : {}),
      ...(opts.deferFold ? { defer_fold: true } : {}),
      ...(opts.discardTurnIds && opts.discardTurnIds.length ? { discard_turn_ids: opts.discardTurnIds.slice(0, 8) } : {}),
    }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "The interviewer couldn't respond to that."));
  return res.json();
}

/**
 * Confirm (commit=true: the candidate's words did not change) or void an EARLY
 * voice decision's learner-state fold. Sent in the background.
 */
export async function postVoiceFold(
  attemptId: string,
  token: string,
  turnId: string,
  commit: boolean,
): Promise<void> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/voice-fold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ turn_id: turnId, commit }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't update the interviewer state."));
}

/**
 * Model-led realtime voice (backend VOICE_INTERVIEWER): after each saved
 * candidate turn, ask the server's coach for refreshed instructions. `changed`
 * is false (and `instructions` null) when nothing needs to change.
 */
export interface VoiceCoachResponse {
  changed: boolean;
  notes: string[];
  instructions: string | null;
}

export async function postVoiceCoach(attemptId: string, token: string): Promise<VoiceCoachResponse> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/voice-coach`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't refresh the interviewer."));
  return res.json();
}

/** Model-led realtime voice: run a tool the speech model called (get_hint, answer_request). */
export interface VoiceToolResponse {
  output: string;
  answer_given: boolean;
  answer_allowed: boolean;
}

export async function postVoiceTool(
  attemptId: string,
  token: string,
  name: string,
  args: string,
): Promise<VoiceToolResponse> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/voice-tool`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, arguments: args }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "The interviewer's hint service didn't respond."));
  return res.json();
}

export async function uploadAttemptFile(
  attemptId: string,
  token: string,
  file: File,
  caption?: string,
): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  const res = await fetch(`${API_URL}/attempts/${attemptId}/uploads`, {
    method: 'POST',
    headers: { ...authHeaders(token) },
    body: form,
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't upload that file. Please try again."));
  return res.json();
}

export async function submitAttempt(
  attemptId: string,
  token: string,
  finalRecommendation: string,
): Promise<SubmitResponse> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ final_recommendation: finalRecommendation }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "Couldn't submit your recommendation. Please try again."));
  return res.json();
}
