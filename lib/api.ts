import type { SubmissionRow, NewsHeadline, GeneratedBriefData } from '@/lib/types';

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
import type { NewsHeadline, GeneratedBriefData } from '@/lib/types';

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