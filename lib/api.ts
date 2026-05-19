import type { SubmissionRow } from '@/lib/types';

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
