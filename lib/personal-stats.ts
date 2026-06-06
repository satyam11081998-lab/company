/**
 * Personal-first stats for the dashboard hero.
 *
 * Design intent (post-shrinkage reconsideration): we don't show an "average"
 * anywhere on the dashboard. Strava / Peloton / Apple Fitness / Duolingo all
 * skip the average and surface three honest, comparable-to-self numbers:
 *   - LATEST     -- your most recent attempt
 *   - PERSONAL BEST -- your highest ever (only goes up; never feels punishing)
 *   - STREAK     -- days active in a row
 * Each is internally consistent and immune to the small-sample unfairness
 * problem (a 1-case newbie's "best ever" is honest; a veteran's "best ever"
 * stays high; neither is comparable to the other in a misleading way).
 *
 * Also exports a "skill tree" view of per-case-type progression -- the four
 * MECE case domains as nodes with a status badge each. Replaces "you are X%
 * better than cohort" with "you've explored Y of 4 domains".
 */

import { CASE_TYPES, CASE_TYPE_LABELS, type CaseType } from './constants';
import type { ReadinessSubmission } from './readiness';

export interface HeroStats {
  latest: number | null;          // 0..100; null if no scored submissions yet
  latestAt: string | null;        // ISO timestamp of latest
  personalBest: number | null;    // 0..100; max across first-attempt scored cases
  personalBestAt: string | null;
  streak: number;                 // pass-through from users.streak_count
  totalCases: number;             // count of scored submissions (any rubric)
  caseCases: number;              // count of scored CASE submissions (excluding guesstimates)
  guesstimateCases: number;
}

export function computeHeroStats(
  submissions: ReadinessSubmission[],
  streak: number,
): HeroStats {
  const scored = submissions.filter((s) => s.score != null);
  // The dashboard's "score" is consulting cases, but a guesstimate still counts
  // as a "case completed" for the totalCases counter (used in the n>=5 gate).
  const caseScored = scored.filter((s) => s.case_type !== 'guesstimate');
  const gstScored = scored.filter((s) => s.case_type === 'guesstimate');

  // Latest = most recent CASE attempt (we score cases on 0-100; guesstimates use a
  // different scale, so we don't mix them in the hero "Latest" tile).
  const sortedDesc = [...caseScored].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const latestRow = sortedDesc[0] ?? null;

  // Personal best = max FIRST-ATTEMPT score (matches the leaderboard / points rule).
  const firstOnly = caseScored.filter((s) => s.is_first_attempt ?? true);
  const bestRow = firstOnly.reduce<ReadinessSubmission | null>(
    (acc, s) => (acc == null || (s.score ?? -1) > (acc.score ?? -1) ? s : acc),
    null,
  );

  return {
    latest: latestRow?.score ?? null,
    latestAt: latestRow?.created_at ?? null,
    personalBest: bestRow?.score ?? null,
    personalBestAt: bestRow?.created_at ?? null,
    streak,
    totalCases: scored.length,
    caseCases: caseScored.length,
    guesstimateCases: gstScored.length,
  };
}

export type SkillNodeStatus = 'mastered' | 'building' | 'untouched';

export interface SkillNode {
  caseType: CaseType;
  label: string;
  attempts: number;
  best: number | null;
  status: SkillNodeStatus;
}

export const MASTERY_SCORE_THRESHOLD = 75; // best score that qualifies for "mastered"
export const MASTERY_REPS_THRESHOLD = 2;   // need at least N attempts to claim mastery

/**
 * Per-case-type progression for the SkillTree component.
 * For each of the 4 case types, returns attempts/best/status.
 * - mastered  : best >= 75 AND attempts >= 2  (proven, not lucky once)
 * - building  : attempts >= 1                 (started, working on it)
 * - untouched : attempts == 0                 (yet to explore)
 */
export function buildSkillTree(submissions: ReadinessSubmission[]): SkillNode[] {
  return CASE_TYPES.map((t) => {
    const ofType = submissions.filter((s) => s.case_type === t && s.score != null);
    const attempts = ofType.length;
    const best = attempts ? Math.max(...ofType.map((s) => s.score as number)) : null;
    let status: SkillNodeStatus = 'untouched';
    if (attempts > 0) status = 'building';
    if (best != null && best >= MASTERY_SCORE_THRESHOLD && attempts >= MASTERY_REPS_THRESHOLD) {
      status = 'mastered';
    }
    return {
      caseType: t,
      label: CASE_TYPE_LABELS[t] || t,
      attempts,
      best,
      status,
    };
  });
}

/**
 * Hard gate threshold: how many CASE attempts before the heavy analytics
 * (readiness composite, dimension bullets, cohort comparison, coverage map)
 * become visible. Below this we deliberately show only the hero + skill tree.
 * Mirrors the Khan-Academy / Brilliant.org progressive-disclosure pattern.
 */
export const ANALYTICS_UNLOCK_N = 5;
