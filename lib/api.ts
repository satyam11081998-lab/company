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
/**
 * GET a sleep-prone backend endpoint, transparently absorbing Render free-tier
 * cold starts. A cold start runs ~50-60s — longer than a single 45s timeout —
 * so we retry on timeout/network errors across up to 3 attempts (~30s each,
 * ~90s total) before surfacing a retriable message. A warm backend returns on
 * the first attempt in well under a second, so this adds no cost in the common
 * case and stops the "waking up" loop on a cold one.
 */
async function getWithWake(url: string, token?: string): Promise<Response> {
  const ATTEMPTS = 3;
  const PER_ATTEMPT_MS = 30000;
  let lastErr: unknown = null;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      return await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: 'no-store',
        signal: AbortSignal.timeout(PER_ATTEMPT_MS),
      });
    } catch (e: any) {
      lastErr = e;
      const retriable = e?.name === 'TimeoutError' || e?.name === 'TypeError'; // timeout or network
      if (!retriable || i === ATTEMPTS - 1) break;
      await new Promise((r) => setTimeout(r, 1500)); // let a waking instance breathe
    }
  }
  const err = lastErr as { name?: string; message?: string } | null;
  throw new Error(
    err?.name === 'TimeoutError'
      ? 'The briefs service is waking up — please retry in a few seconds.'
      : (err?.message || 'Could not reach the briefs service.'),
  );
}

export async function fetchHeadlines(token?: string): Promise<NewsHeadline[]> {
  const res = await getWithWake(`${API_URL}/news/headlines`, token);
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
  const res = await getWithWake(`${API_URL}/news/briefs/${headlineId}`, token);
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
 * Send an audio blob to the backend for Whisper transcription.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');

  const res = await fetch(`${API_URL}/transcribe`, {
    method: 'POST',
    // Do NOT set Content-Type header when sending FormData, the browser will set it with the correct boundary
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to transcribe audio: ${errText}`);
  }

  return res.json();
}

/**
 * Send a base64 encoded image to the backend for handwriting OCR.
 */
export async function extractTextFromImage(base64Image: string): Promise<{ text: string }> {
  const res = await fetch(`${API_URL}/extract-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64_image: base64Image }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to extract text from image: ${errText}`);
  }

  return res.json();
}