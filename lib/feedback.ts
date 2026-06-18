import type { SupabaseClient } from '@supabase/supabase-js';
import type { FeedbackReportRow, FeedbackCategory, FeedbackStatus } from '@/lib/types';

/** Display metadata for each feedback category (used by panel + admin). */
export const FEEDBACK_CATEGORIES: { id: FeedbackCategory; label: string; hint: string }[] = [
  { id: 'data_discrepancy', label: 'Data looks wrong',  hint: 'A number / fact seems incorrect' },
  { id: 'stale_data',       label: 'Out of date',       hint: 'This data is old / no longer true' },
  { id: 'content_error',    label: 'Content / typo',    hint: 'Wrong wording, broken example, typo' },
  { id: 'bug',              label: 'Something is broken', hint: 'A feature is not working' },
  { id: 'suggestion',       label: 'Suggestion',         hint: 'An idea or improvement' },
  { id: 'other',            label: 'Other',              hint: 'Anything else' },
];

export const FEEDBACK_CATEGORY_IDS = FEEDBACK_CATEGORIES.map((c) => c.id);

export const FEEDBACK_STATUSES: FeedbackStatus[] = [
  'new', 'triaged', 'in_progress', 'resolved', 'dismissed',
];

export function categoryLabel(id: string): string {
  return FEEDBACK_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/** Admin read. Caller must already be admin (RLS select policy enforces it). */
export async function listFeedback(
  supabase: SupabaseClient,
  opts: { status?: FeedbackStatus | 'all'; category?: FeedbackCategory | 'all'; limit?: number } = {},
): Promise<FeedbackReportRow[]> {
  let q = supabase
    .from('feedback_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 200);

  if (opts.status && opts.status !== 'all') q = q.eq('status', opts.status);
  if (opts.category && opts.category !== 'all') q = q.eq('category', opts.category);

  const { data } = await q;
  return (data as FeedbackReportRow[] | null) ?? [];
}
