/**
 * Client SDK for the new conversational case-interview endpoints.
 * Mirrors backend/routes/attempts.py.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export async function startAttempt(caseId: string, token: string): Promise<AttemptSummary> {
  const res = await fetch(`${API_URL}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ case_id: caseId }),
  });
  if (!res.ok) throw new Error(`start attempt failed (${res.status}): ${await res.text()}`);
  return res.json();
}

export async function getAttempt(attemptId: string, token: string): Promise<AttemptDetail> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}`, {
    headers: { ...authHeaders(token) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`get attempt failed (${res.status}): ${await res.text()}`);
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
    onMeta?: (meta: { clarification_remaining: number; is_clarification: boolean }) => void;
    onToken?: (text: string) => void;
    onDone?: (info: { message_id: string | null }) => void;
    onError?: (err: string) => void;
  } = {},
): Promise<{ assistantText: string; quotaRemaining: number | null }> {
  const res = await fetch(`${API_URL}/attempts/${attemptId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`post message failed (${res.status}): ${await res.text()}`);

  const ct = res.headers.get('content-type') || '';
  // Quota-exhausted path returns plain JSON instead of SSE.
  if (ct.includes('application/json')) {
    const json = await res.json();
    return { assistantText: '', quotaRemaining: json.clarification_remaining ?? 0 };
  }

  if (!res.body) throw new Error('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assistantText = '';
  let quotaRemaining: number | null = null;

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
  return { assistantText, quotaRemaining };
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
  if (!res.ok) throw new Error(`upload failed (${res.status}): ${await res.text()}`);
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
  if (!res.ok) throw new Error(`submit failed (${res.status}): ${await res.text()}`);
  return res.json();
}
