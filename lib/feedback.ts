import type { FeedbackCategory, FeedbackStatus } from '@/lib/types';

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

// Triage of these reports lives in the CRM (Cases → “In-app feedback & flags”).
