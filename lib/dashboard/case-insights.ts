import { type CaseVisual } from '@/lib/results/visuals';
import { getCaseFiguresBulk, getCasesWithFigures } from '@/lib/dashboard/case-figures';
import { canSeeCaseFigures } from '@/lib/tier';
import type { UserRow } from '@/lib/types';

/**
 * Per-case study data for the dashboard's solution panel.
 *
 * Three things are joined here, because on their own none of them is worth a
 * panel: what the case IS, how the cohort actually did on it, and whether this
 * user may attempt it right now.
 *
 * ── Two independent locks on the figures ─────────────────────────────
 * `visuals` describe the CASE — its profit bridge, its driver tree, the
 * quadrant the answer lands in. TWO separate conditions must BOTH hold before
 * they are attached, and they exist for different reasons:
 *
 *   1. ENTITLEMENT. Case figures are a Pro feature (lib/tier.ts,
 *      `caseFigures`). Everything about the user's OWN attempt stays free.
 *   2. NO SPOILERS. Even on Pro, showing the worked figures for a case the
 *      user has not yet attempted hands them the answer before they try —
 *      which is the one thing that would make the practice worthless. Pro
 *      buys the worked answer to cases you have SOLVED, not a way to skip
 *      solving them.
 *
 * Conflating the two produces the two bad states: a paying user told to
 * "solve it first" when they already did, and a free user shown the answer
 * because they attempted it. `visualsLockReason` says which lock is holding,
 * so the UI can say something true.
 *
 * Flip SHOW_VISUALS_BEFORE_ATTEMPT to true to drop lock 2 (lock 1 still
 * applies); it is a single constant precisely so that product call can be
 * changed without touching the logic around it.
 */

/** When true, case figures are shown even for cases the user has never tried. */
export const SHOW_VISUALS_BEFORE_ATTEMPT = false;

export interface CaseInsight {
  caseId: string;
  title: string;
  type: string | null;
  difficulty: string | null;
  /** Cohort stats — null when nobody has been scored on this case yet. */
  attempts: number;
  avgScore: number | null;
  topScore: number | null;
  /** This user's own best score on the case, if they have one. */
  yourBest: number | null;
  attemptedByUser: boolean;
  /** Case figures. Empty unless BOTH locks above are satisfied. */
  visuals: CaseVisual[];
  visualsLocked: boolean;
  /** Which lock is holding: 'tier' (needs Pro) or 'unattempted' (solve it
   *  first). null when nothing is locked, or when there are no figures yet. */
  visualsLockReason: 'tier' | 'unattempted' | null;
}

interface SubmissionLite {
  case_id: string;
  user_id: string;
  score: number | null;
}

/**
 * @param svc      service-role client — cohort aggregates read across users, so
 *                 RLS must be bypassed. Only aggregate numbers and case-level
 *                 figures leave this function; no other user's text ever does.
 * @param caseIds  the cases to describe (keep this to what is on screen).
 */
export async function getCaseInsights(
  svc: {
    from: (t: string) => any;
  },
  caseIds: string[],
  userId: string | null,
  user: UserRow | null,
): Promise<CaseInsight[]> {
  if (!caseIds.length) return [];

  // ── Pass 1: aggregates. SCORES ONLY — no feedback_json ─────────────
  // This deliberately does NOT select feedback_json. An earlier version pulled
  // 600 rows WITH it on every single dashboard render; feedback_json carries
  // the whole scoring blob (the three approaches, per-dimension evidence, the
  // model answer) and runs several KB per row, so that one query was moving
  // megabytes to compute three integers. Scores alone are a few bytes a row.
  const [casesRes, subsRes, mineRes] = await Promise.all([
    svc.from('cases').select('id, title, type, difficulty').in('id', caseIds),
    svc.from('submissions')
      .select('case_id, user_id, score')
      .in('case_id', caseIds)
      .not('score', 'is', null)
      .order('score', { ascending: false })
      .limit(600),
    // THIS USER'S own rows, queried separately and exactly.
    //
    // An earlier version derived "has this user attempted it?" from the
    // top-600-by-score slice above. That slice is global across every case on
    // screen and biased toward high scorers, so a user who scored 31 on a
    // popular case simply would not appear in it — and a PAYING user was then
    // told "solve it first" for a case they had solved, with `yourBest` blank.
    // It degrades silently as the cohort grows, which is the worst kind of
    // bug to own. Their own rows are a tiny, exact, indexed query.
    userId
      ? svc.from('submissions')
          .select('case_id, score')
          .eq('user_id', userId)
          .in('case_id', caseIds)
          .not('score', 'is', null)
      : Promise.resolve({ data: [] }),
  ]);

  const cases = (casesRes.data ?? []) as Array<{ id: string; title: string; type: string | null; difficulty: string | null }>;
  const subs = (subsRes.data ?? []) as SubmissionLite[];
  const mineRows = ((mineRes as { data?: unknown } | null)?.data ?? []) as Array<{ case_id: string; score: number | null }>;

  const entitled = canSeeCaseFigures(user);

  const byCase = new Map<string, SubmissionLite[]>();
  for (const s of subs) {
    const list = byCase.get(s.case_id);
    if (list) list.push(s); else byCase.set(s.case_id, [s]);
  }

  // Exact, from the user's own rows.
  const attemptedByUser = new Map<string, boolean>();
  const myBestByCase = new Map<string, number>();
  for (const r of mineRows) {
    attemptedByUser.set(r.case_id, true);
    const v = Number(r.score ?? 0);
    if (Number.isFinite(v)) myBestByCase.set(r.case_id, Math.max(myBestByCase.get(r.case_id) ?? -Infinity, v));
  }

  // ── Pass 2: figures, ONLY for cases this user may actually see ─────
  // Defence in depth as much as performance: for a case the user is not
  // entitled to, or has not attempted, the figures are never read out of the
  // database at all — so there is no code path, present or future, that could
  // accidentally pass them on. A free user's dashboard skips this entirely.
  const unlockedIds = entitled
    ? cases.map((c) => c.id).filter((id) => SHOW_VISUALS_BEFORE_ATTEMPT || attemptedByUser.get(id))
    : [];

  // ONE query, against the figures table — not one per case against
  // submissions. `case_figures` (migration 0069) has RLS on and no policy, so
  // this read is only possible with the service role and only from the server.
  const figuresByCase = await getCaseFiguresBulk(svc, unlockedIds);

  // ── Whether a LOCKED case has figures at all ───────────────────────
  // Ids only — no figure data crosses. This used to count SCORED SUBMISSIONS
  // instead, which meant any case scored before figures existed reported
  // "figures available": a free user saw the Pro upsell, paid, and found an
  // empty panel. Asking the figures table is both exact and cheaper.
  const lockedIds = cases.map((c) => c.id).filter((id) => !figuresByCase.has(id));
  const casesWithFigures = await getCasesWithFigures(svc, lockedIds);

  return cases.map((c) => {
    const list = byCase.get(c.id) ?? [];
    const scores = list.map((s) => Number(s.score ?? 0)).filter((n) => Number.isFinite(n));
    const yourBest = myBestByCase.get(c.id) ?? null;
    const attempted = attemptedByUser.get(c.id) ?? false;

    const visuals = figuresByCase.get(c.id) ?? [];
    const unlocked = figuresByCase.has(c.id);
    // Entitlement is checked FIRST, so a free user who HAS attempted the case
    // is still locked and the reason reported is the one they can act on.
    const mightHaveFigures = unlocked ? visuals.length > 0 : casesWithFigures.has(c.id);
    const lockReason: 'tier' | 'unattempted' | null =
      unlocked || !mightHaveFigures ? null : (!entitled ? 'tier' : 'unattempted');

    return {
      caseId: c.id,
      title: c.title,
      type: c.type,
      difficulty: c.difficulty,
      attempts: scores.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      topScore: scores.length ? Math.max(...scores) : null,
      yourBest,
      attemptedByUser: attempted,
      visuals,
      visualsLocked: lockReason !== null,
      visualsLockReason: lockReason,
    };
  });
}
