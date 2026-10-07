import type { CaseRow } from '@/lib/types';

/**
 * The case fields the practice list reads (components/practice-hub.tsx) —
 * nothing else is selected or sent to the browser by app/(app)/practice.
 * Keep the two in step: the type is what makes TypeScript reject a practice
 * card that starts reading a field the page no longer fetches. (2026-10-07:
 * the page used to select('*'), which shipped every case's solution, hints,
 * MCQs and interviewer notes to the browser on each visit.)
 *
 * Lives here, not in practice-hub.tsx: that file is 'use client', and a plain
 * value exported from a client module reaches server code as a client
 * reference, not as the string.
 */
export type PracticeCase = Pick<CaseRow, 'id' | 'title' | 'type' | 'difficulty' | 'content' | 'code'>;
export const PRACTICE_CASE_COLUMNS = 'id, title, type, difficulty, content, code';
