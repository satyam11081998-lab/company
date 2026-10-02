/**
 * Browser client for the INDEPENDENT Interview Intelligence service.
 *
 * Auth: a short-lived signed assertion minted by this app's own server route
 * (/api/interview-intelligence/token, same origin, cookie-authenticated). II verifies
 * it and decides access itself — nothing here (or in the UI) grants access.
 * The Supabase session token is never sent to II.
 */

import type {
  AccessGrantRow, AdminOverview, IIDocument, IIMe, IIMessage, IIProgressHistory, IISession,
  InterviewConfigInput, ReportResponse, TurnResponse,
} from './types';

const BASE = (process.env.NEXT_PUBLIC_II_API_URL || '').replace(/\/$/, '');

export class IIError extends Error {
  code: string;
  status: number;
  extra: Record<string, unknown>;
  constructor(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export function isConfigured(): boolean {
  return BASE.length > 0;
}

/* ---------------------------------------------------------------- token cache */
let cached: { token: string; exp: number } | null = null;
let inflight: Promise<string> | null = null;

async function mintToken(): Promise<string> {
  const r = await fetch('/api/interview-intelligence/token', { cache: 'no-store', credentials: 'same-origin' });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new IIError(r.status, body?.error || 'token_failed',
      body?.message || 'Could not start a secure Interview Intelligence session.');
  }
  cached = { token: body.token as string, exp: Number(body.expires_at) };
  return cached.token;
}

async function token(force = false): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (!force && cached && cached.exp - now > 60) return cached.token;
  if (!inflight) inflight = mintToken().finally(() => { inflight = null; });
  return inflight;
}

/* ---------------------------------------------------------------- core fetch */
type Opts = { method?: string; json?: unknown; form?: FormData; raw?: boolean; accept202?: boolean };

async function call<T>(path: string, opts: Opts = {}, retried = false): Promise<T> {
  if (!BASE) throw new IIError(503, 'not_configured', 'Interview Intelligence is not available yet.');
  const headers: Record<string, string> = { Authorization: `Bearer ${await token(retried)}` };
  let body: BodyInit | undefined;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    body = opts.form;
  }
  let r: Response;
  try {
    r = await fetch(`${BASE}${path}`, { method: opts.method || 'GET', headers, body, cache: 'no-store' });
  } catch {
    throw new IIError(0, 'network', 'We could not reach Interview Intelligence. Check your connection and try again.');
  }
  if (r.status === 401 && !retried) {
    // Assertion expired or rotated: mint a fresh one once.
    cached = null;
    return call<T>(path, opts, true);
  }
  if (opts.raw) {
    if (!r.ok) throw await asError(r);
    return r as unknown as T;
  }
  if (r.status === 204) return undefined as T;
  if (r.status === 202 && opts.accept202) return (await r.json()) as T;
  if (!r.ok) throw await asError(r);
  return (await r.json()) as T;
}

async function asError(r: Response): Promise<IIError> {
  const body = await r.json().catch(() => null);
  const e = body?.error;
  if (e && typeof e === 'object') {
    const { code, message, ...extra } = e as { code: string; message: string };
    return new IIError(r.status, code || 'error', message || 'Something went wrong.', extra);
  }
  return new IIError(r.status, 'error', r.status >= 500 ? 'The service had a problem. Please try again.' : 'Request failed.');
}

/* ---------------------------------------------------------------- candidate API */
export const ii = {
  me: () => call<IIMe>('/v1/me'),

  documents: (kind?: 'cv' | 'jd') => call<{ documents: IIDocument[] }>(`/v1/documents${kind ? `?kind=${kind}` : ''}`),
  document: (id: string) => call<IIDocument>(`/v1/documents/${id}`),
  upload: (kind: 'cv' | 'jd', file: File) => {
    const f = new FormData();
    f.append('kind', kind);
    f.append('file', file);
    return call<IIDocument>('/v1/documents', { method: 'POST', form: f });
  },
  pasteJD: (text: string) => call<IIDocument>('/v1/documents/text', { method: 'POST', json: { kind: 'jd', text } }),
  deleteDocument: (id: string) => call<void>(`/v1/documents/${id}`, { method: 'DELETE' }),

  sessions: () => call<{ sessions: IISession[] }>('/v1/sessions'),
  session: (id: string) => call<IISession>(`/v1/sessions/${id}`),
  createSession: (cvId: string, jdId: string, config: InterviewConfigInput) =>
    call<IISession>('/v1/sessions', { method: 'POST', json: { cv_document_id: cvId, jd_document_id: jdId, config } }),
  room: (id: string) => call<{ session: IISession; progress: TurnResponse['session']; messages: IIMessage[] }>(
    `/v1/sessions/${id}/room`),
  start: (id: string) => call<TurnResponse>(`/v1/sessions/${id}/start`, { method: 'POST' }),
  turn: (id: string, body: { client_turn_id: string; content: string; kind?: 'text' | 'voice';
                              answer_ms?: number; skip?: boolean }) =>
    call<TurnResponse>(`/v1/sessions/${id}/turns`, { method: 'POST', json: body }),
  pause: (id: string) => call<{ session: TurnResponse['session'] }>(`/v1/sessions/${id}/pause`, { method: 'POST' }),
  resume: (id: string) => call<TurnResponse>(`/v1/sessions/${id}/resume`, { method: 'POST' }),
  end: (id: string) => call<{ session: TurnResponse['session'] }>(`/v1/sessions/${id}/end`, { method: 'POST' }),
  abandon: (id: string) => call<{ session: TurnResponse['session'] }>(`/v1/sessions/${id}/abandon`, { method: 'POST' }),
  transcript: (id: string) => call<{ messages: IIMessage[] }>(`/v1/sessions/${id}/transcript`),
  report: (id: string) => call<ReportResponse>(`/v1/sessions/${id}/report`, { accept202: true }),
  reattempt: (id: string, target_competencies: string[], duration_minutes?: number) =>
    call<IISession>(`/v1/sessions/${id}/reattempt`, { method: 'POST', json: { target_competencies, duration_minutes } }),
  progress: () => call<IIProgressHistory>('/v1/progress'),

  transcribe: (audio: Blob) => {
    const f = new FormData();
    f.append('audio', audio, 'answer.webm');
    return call<{ text: string }>('/v1/voice/transcribe', { method: 'POST', form: f });
  },
  speak: async (text: string): Promise<Blob> => {
    const r = await call<Response>('/v1/voice/speak', { method: 'POST', json: { text }, raw: true });
    return r.blob();
  },
};

/* ---------------------------------------------------------------- admin API */
export const iiAdmin = {
  grants: () => call<{ grants: AccessGrantRow[] }>('/v1/admin/access-grants'),
  addGrant: (email: string, note = '') => call<AccessGrantRow>('/v1/admin/access-grants', { method: 'POST', json: { email, note } }),
  setGrant: (id: string, status: 'enabled' | 'disabled') =>
    call<AccessGrantRow>(`/v1/admin/access-grants/${id}`, { method: 'PATCH', json: { status } }),
  deleteGrant: (id: string) => call<void>(`/v1/admin/access-grants/${id}`, { method: 'DELETE' }),
  config: () => call<{ flags: Record<string, unknown>; defaults: Record<string, unknown> }>('/v1/admin/config'),
  setConfig: (values: Record<string, unknown>) =>
    call<{ flags: Record<string, unknown> }>('/v1/admin/config', { method: 'PATCH', json: { values } }),
  overview: () => call<AdminOverview>('/v1/admin/overview'),
  sessions: (status?: string) => call<{ sessions: Record<string, any>[] }>(
    `/v1/admin/sessions${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  session: (id: string) => call<Record<string, any>>(`/v1/admin/sessions/${id}`),
  modelRuns: (stage?: string) => call<{ runs: Record<string, any>[] }>(
    `/v1/admin/model-runs${stage ? `?stage=${encodeURIComponent(stage)}` : ''}`),
  evaluationRuns: () => call<{ runs: Record<string, any>[] }>('/v1/admin/evaluation-runs'),
  audit: () => call<{ entries: Record<string, any>[] }>('/v1/admin/audit'),
  driveRetry: () => call<{ requeued: number }>('/v1/admin/drive/retry-failed', { method: 'POST' }),
};

export function newTurnId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `t-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
