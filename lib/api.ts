import type { SubmissionRow, NewsHeadline, GeneratedBriefData } from '@/lib/types';

export interface DailyContentResponse {
  date: string;
  case: {
    id: string;
    title: string;
    type: string;
    difficulty: string;
  } | null;
  guesstimate_code: string | null;
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

/**
 * Submit a case answer to the external AI scoring backend.
 * The backend should accept { user_id, case_id, answer_text } and return
 * the saved submission (including its id) so we can redirect to /results/[id].
 */
export async function submitCaseAnswer(payload: {
  user_id: string;
  case_id: string;
  answer_text: string;
}): Promise<{ submission_id: string }>
{
  const res = await fetch(`${API_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
export async function fetchHeadlines(): Promise<NewsHeadline[]> {
  const res = await fetch(`${API_URL}/news/headlines`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
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
export async function generateBrief(headlineId: string): Promise<GeneratedBriefData> {
  const res = await fetch(`${API_URL}/news/briefs/${headlineId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
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
export async function fetchBrief(headlineId: string): Promise<GeneratedBriefData> {
  const res = await fetch(`${API_URL}/news/briefs/${headlineId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
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