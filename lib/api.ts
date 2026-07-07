import type { SubmissionRow, NewsHeadline, GeneratedBriefData } from '@/lib/types';

export interface DailyContentResponse {
  date: string;
  case: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  } | null;
  // The daily guesstimate is now a real attemptable case (type='guesstimate').
  guesstimate: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  } | null;
  guesstimate_code: string | null; // back-compat; carries the same id
  guesstimate_title?: string | null;
  brief: {
    id: string;
    title: string;
    source_name: string;
    thumbnail_url: string | null;
  } | null;
}

export interface DailyLeaderboardResponse {
  date: string;
  case_id: string | null;
  case_title: string | null;
  entries: {
    user_id: string;
    name: string | null;
    avatar_url: string | null;
    score: number;
    submission_id: string;
    submitted_at: string;
    rank: number;
  }[];
  total_attempts: number;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  // Fail loud instead of silently calling localhost in prod (every dynamic
  // feature — submit, solve, news, daily, transcribe — would break).
  console.error('[MECE] NEXT_PUBLIC_API_URL is not set in production; backend calls will fail.');
}

/**
 * Submit a case answer to the external AI scoring backend.
 * The backend should accept { user_id, case_id, answer_text } and return
 * the saved submission (including its id) so we can redirect to /results/[id].
 */
export async function submitCaseAnswer(payload: {
  user_id: string;
  case_id: string;
  answer_text: string;
  token?: string;
}): Promise<{ submission_id: string }>
{
  const { token, ...body } = payload;
  const res = await fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Submission failed (${res.status}): ${text || res.statusText}`);
  }
  const json: { submission_id?: string; id?: string; submission?: SubmissionRow } = await res.json();
  const submissionId = json.submission_id || json.id || json.submission?.id;
  if (!submissionId) {
    throw new Error('Server did not return a submission id');
  }
  return { submission_id: submissionId };
}

/**
 * Fetch today's curated GD-worthy news headlines.
 * Returns the full list (star first, then by GD-worthiness score).
 */
export async function fetchHeadlines(token?: string): Promise<NewsHeadline[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/news/headlines`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
      signal: AbortSignal.timeout(45000),
    });
  } catch (e: any) {
    throw new Error(
      e?.name === 'TimeoutError'
        ? 'The briefs service is waking up — please retry in a few seconds.'
        : (e?.message || 'Could not reach the briefs service.'),
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch headlines (${res.status}): ${text || res.statusText}`);
  }
  const json: { headlines: NewsHeadline[]; count: number } = await res.json();
  return json.headlines || [];
}

/**
 * Generate a GD brief for a specific headline.
 * If a brief already exists, returns the cached one (no AI call, fast).
 * Otherwise triggers OpenAI generation (~5-10 seconds first time).
 */
export async function generateBrief(headlineId: string, token?: string): Promise<GeneratedBriefData> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/news/briefs/${headlineId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      // Generation is a slower OpenAI call; allow more headroom but still cap it
      // so a cold/stuck backend errors retriably instead of spinning forever.
      signal: AbortSignal.timeout(90000),
    });
  } catch (e: any) {
    throw new Error(
      e?.name === 'TimeoutError'
        ? 'Generating the brief is taking longer than usual — please retry.'
        : (e?.message || 'Could not reach the briefs service.'),
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to generate brief (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch an existing brief by headline ID. Does NOT generate.
 * Returns 404 error if no brief exists yet.
 */
export async function fetchBrief(headlineId: string, token?: string): Promise<GeneratedBriefData> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/news/briefs/${headlineId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      cache: 'no-store',
      signal: AbortSignal.timeout(45000),
    });
  } catch (e: any) {
    throw new Error(
      e?.name === 'TimeoutError'
        ? 'The briefs service is waking up — please retry in a few seconds.'
        : (e?.message || 'Could not reach the briefs service.'),
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch brief (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch today's daily content (case, guesstimate, brief headline).
 * Always returns a response, never 404s — if no daily is scheduled, fields are null.
 */
export async function fetchDailyToday(): Promise<DailyContentResponse> {
  const res = await fetch(`${API_URL}/daily/today`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch daily content (${res.status})`);
  }
  return res.json();
}

/**
 * Fetch the leaderboard for today's daily case.
 * Top 20 scorers, ranked by score desc, then submitted_at asc.
 */
export async function fetchDailyLeaderboard(): Promise<DailyLeaderboardResponse> {
  const res = await fetch(`${API_URL}/daily/leaderboard`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch daily leaderboard (${res.status})`);
  }
  return res.json();
}

/**
 * Per-user daily AI-input quota (voice minutes + OCR images), by tier.
 * Returned by the transcribe/extract endpoints and by GET /usage/ai-quota so the UI
 * can show "≈X min voice · Y scans left" and disable inputs gracefully at 0.
 */
export interface AiQuota {
  tier: 'free' | 'lite' | 'pro' | string;
  voice: { used_min: number; limit_min: number; remaining_min: number };
  images: { used: number; limit: number; remaining: number };
}

/** Pull a JSON `detail` (FastAPI error body) so users see the friendly reason, not raw JSON. */
async function _detail(res: Response): Promise<string> {
  try {
    const j = await res.json();
    if (j && typeof j.detail === 'string') return j.detail;
  } catch {
    /* not JSON */
  }
  return `${res.status} ${res.statusText}`;
}

function authHeader(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Fetch the caller's remaining voice minutes + OCR images for today. */
export async function fetchAiQuota(token?: string): Promise<AiQuota | null> {
  try {
    const res = await fetch(`${API_URL}/usage/ai-quota`, {
      method: 'GET',
      headers: authHeader(token),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return (await res.json()) as AiQuota;
  } catch {
    return null; // never let a quota-display fetch break the page
  }
}

/**
 * Send an audio blob to the backend for Whisper transcription.
 * Requires a signed-in session token; returns the text plus the updated quota.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  token?: string,
): Promise<{ text: string; quota?: AiQuota }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const res = await fetch(`${API_URL}/transcribe`, {
    method: 'POST',
    // Do NOT set Content-Type for FormData — the browser sets the boundary. Auth only.
    headers: authHeader(token),
    body: formData,
  });

  if (!res.ok) {
    throw new Error(await _detail(res));
  }

  return res.json();
}

/**
 * Send a base64 encoded image to the backend for handwriting OCR.
 * Requires a signed-in session token; returns the text plus the updated quota.
 */
export async function extractTextFromImage(
  base64Image: string,
  token?: string,
): Promise<{ text: string; quota?: AiQuota }> {
  const res = await fetch(`${API_URL}/extract-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify({ base64_image: base64Image }),
  });

  if (!res.ok) {
    throw new Error(await _detail(res));
  }

  return res.json();
}


/**
 * Generate an Abstract GD brief for any abstract topic (word/phrase/proverb).
 * Lite/Pro gated server-side. ~5-15s OpenAI call.
 */
export async function generateAbstractBrief(
  topic: string,
  token?: string,
): Promise<import('@/lib/abstract-gd').AbstractBrief> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/news/abstract-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ topic }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (e: any) {
    throw new Error(
      e?.name === 'TimeoutError'
        ? 'Generating the brief is taking longer than usual — please retry.'
        : (e?.message || 'Could not reach the briefs service.'),
    );
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to generate brief (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}


// ── Resume Lab AI (Pro-gated, server-side) ───────────────────────────────
export interface ResumeBulletOption { text: string; chars: number; rationale: string }

async function resumeAi(path: string, body: unknown, token?: string): Promise<ResumeBulletOption[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/resume/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  } catch (e: any) {
    throw new Error(e?.name === 'TimeoutError' ? 'The AI is taking longer than usual — please retry.' : (e?.message || 'Could not reach the AI service.'));
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI request failed (${res.status}): ${text || res.statusText}`);
  }
  const json = await res.json();
  return (json.options || []) as ResumeBulletOption[];
}

export const refineBullet = (bullet: string, domain: string, maxChars: number, token?: string) =>
  resumeAi('refine-bullet', { bullet, domain, max_chars: maxChars }, token);

export const generateBullets = (
  input: { role: string; task: string; result: string; domain: string; count?: number; maxChars: number },
  token?: string,
) => resumeAi('generate-bullets', { ...input, max_chars: input.maxChars }, token);

export const fitBullet = (bullet: string, maxChars: number, token?: string) =>
  resumeAi('fit-bullet', { bullet, max_chars: maxChars }, token);

export interface PointResult { options: ResumeBulletOption[]; clarify?: string }

/** Achievement (+ optional instructions) -> strict-fit bullets, or a clarifying question. */
export async function generatePoints(
  achievement: string, domain: string, maxChars: number, instructions = '', count = 3, token?: string,
): Promise<PointResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/resume/point`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ achievement, domain, max_chars: maxChars, count, instructions }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (e: any) {
    throw new Error(e?.name === 'TimeoutError' ? 'The AI is taking longer than usual — please retry.' : (e?.message || 'Could not reach the AI service.'));
  }
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Generation failed (${res.status}): ${t || res.statusText}`);
  }
  const json = await res.json();
  return { options: (json.options || []) as ResumeBulletOption[], clarify: json.clarify || undefined };
}
