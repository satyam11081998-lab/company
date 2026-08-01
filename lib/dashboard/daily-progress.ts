/**
 * Daily progress — has the user already done today's daily case / guesstimate?
 *
 * WHY THIS EXISTS
 * The dashboard used to show "Start the case" / "Start the guesstimate"
 * unconditionally, so a user who had already solved today's daily was invited
 * to start it again — and on free tier that CTA leads straight into a locked
 * screen (one attempt per case, services/access_guard.py). This derives the
 * done-state so the cards can show a tick, the score, and a sensible next step.
 *
 * Derived entirely from the `submissions` rows the dashboard already fetches —
 * NO extra database round-trip.
 */

export interface DailyItemProgress {
  /** True once at least one scored submission exists for this case id. */
  attempted: boolean;
  /** Best score across attempts, rounded. null when attempted but unscored. */
  score: number | null;
  /** Submission id to deep-link to results — the best-scoring attempt. */
  submissionId: string | null;
  /** How many times they've attempted it (re-attempts included). */
  attempts: number;
}

export interface DailyProgress {
  case: DailyItemProgress;
  guesstimate: DailyItemProgress;
}

const EMPTY: DailyItemProgress = {
  attempted: false,
  score: null,
  submissionId: null,
  attempts: 0,
};

type SubmissionLike = {
  id: string;
  case_id: string | null;
  score: number | null;
  created_at?: string | null;
};

/**
 * Best-scoring submission for `caseId`. Ties break toward the most recent, so
 * the CTA opens the attempt the user most likely wants to re-read.
 */
export function getItemProgress(
  submissions: SubmissionLike[],
  caseId: string | null | undefined,
): DailyItemProgress {
  if (!caseId) return { ...EMPTY };

  const mine = submissions.filter((s) => s.case_id === caseId);
  if (mine.length === 0) return { ...EMPTY };

  const scored = mine.filter((s) => s.score != null);
  if (scored.length === 0) {
    // Attempted but never scored (abandoned mid-session, or scoring failed).
    // Still counts as attempted — do NOT invite them to "start" it again.
    return { attempted: true, score: null, submissionId: mine[mine.length - 1].id, attempts: mine.length };
  }

  const best = scored.reduce((a, b) => ((b.score as number) >= (a.score as number) ? b : a));
  return {
    attempted: true,
    score: Math.round(best.score as number),
    submissionId: best.id,
    attempts: mine.length,
  };
}

export function getDailyProgress(
  submissions: SubmissionLike[],
  dailyCaseId: string | null | undefined,
  dailyGuesstimateId: string | null | undefined,
): DailyProgress {
  return {
    case: getItemProgress(submissions, dailyCaseId),
    guesstimate: getItemProgress(submissions, dailyGuesstimateId),
  };
}
