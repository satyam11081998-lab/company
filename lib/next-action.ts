// DELIVERABLE — the "Do this next" engine.
// One prescribed action (kills the choice-paralysis churn vector), chosen from the
// readiness result. Also computes the contextual paywall flag and the free-quota meter.
// Pure functions; deep-links into the existing /practice?focus=&type= surface.

import {
  SCORE_DIMENSION_LABELS,
  CASE_TYPE_LABELS,
  CASE_TYPES,
  DIFFICULTIES,
  type CaseType,
  type Difficulty,
} from './constants';
import type { SubscriptionTier } from './types';
import type { ReadinessResult, ReadinessSubmission } from './readiness';

const FREE_DAILY_LIMIT = 3; // PROJECT_BRAIN §1.5 — free tier: 3 practices/day

export type ActionKind =
  | 'calibrate'
  | 'fix-dimension'
  | 'cover-gap'
  | 'refresh-stale'
  | 'prove-hard'
  | 'keep-going';

export interface NextAction {
  kind: ActionKind;
  label: string; // imperative, <= ~6 words
  reason: string; // why this, in one plain line
  cta: string; // button text
  href: string; // deep link
  /** true when the most useful move is a re-attempt and the user is on free (re-attempts locked). */
  paywalled: boolean;
}

export interface FreeQuota {
  tier: SubscriptionTier;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
}

function isToday(iso: string, now: Date): boolean {
  // IST day boundary (UTC+5:30). PROJECT_BRAIN: daily resets midnight IST.
  const IST = 5.5 * 3600_000;
  const d = new Date(new Date(iso).getTime() + IST);
  const n = new Date(now.getTime() + IST);
  return (
    d.getUTCFullYear() === n.getUTCFullYear() &&
    d.getUTCMonth() === n.getUTCMonth() &&
    d.getUTCDate() === n.getUTCDate()
  );
}

export function computeFreeQuota(
  tier: SubscriptionTier,
  submissions: ReadinessSubmission[],
  now: Date = new Date()
): FreeQuota {
  const unlimited = tier !== 'free';
  // count today's FIRST attempts (the thing the free limit gates)
  const usedToday = submissions.filter(
    (s) => (s.is_first_attempt ?? true) && isToday(s.created_at, now)
  ).length;
  const used = Math.min(usedToday, FREE_DAILY_LIMIT);
  return {
    tier,
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: unlimited ? Infinity : Math.max(0, FREE_DAILY_LIMIT - usedToday),
    unlimited,
  };
}

function firstEmptyCell(r: ReadinessResult): { caseType: CaseType; difficulty: Difficulty } | null {
  // prefer an entirely-untouched TYPE at medium difficulty; else any empty cell
  for (const t of CASE_TYPES) {
    const cells = r.coverage.filter((c) => c.caseType === t);
    if (cells.every((c) => c.state === 'empty')) {
      return { caseType: t, difficulty: 'medium' };
    }
  }
  const empty = r.coverage.find((c) => c.state === 'empty');
  return empty ? { caseType: empty.caseType, difficulty: empty.difficulty } : null;
}

export function nextAction(
  r: ReadinessResult,
  tier: SubscriptionTier,
  now: Date = new Date()
): NextAction {
  // 1) cold start
  if (r.status === 'calibrating') {
    const needTypes = r.typesNeeded - r.typesDone;
    return {
      kind: 'calibrate',
      label: r.subsDone === 0 ? 'Solve your first case' : 'Finish calibrating',
      reason:
        needTypes > 0
          ? `Do ${Math.max(r.subsNeeded - r.subsDone, needTypes)} more across ${needTypes} new case type${needTypes > 1 ? 's' : ''} to unlock your readiness score.`
          : `${r.subsNeeded - r.subsDone} more case${r.subsNeeded - r.subsDone > 1 ? 's' : ''} to unlock your readiness score.`,
      cta: 'Start a case',
      href: '/practice?tab=cases',
      paywalled: false,
    };
  }

  // candidate scoring: bigger lever wins
  type Cand = NextAction & { impact: number };
  const cands: Cand[] = [];

  // 2) biggest coverage gap (an untouched type is a structural hole)
  const gap = firstEmptyCell(r);
  if (gap) {
    const emptyCount = r.coverage.filter((c) => c.state === 'empty').length;
    cands.push({
      kind: 'cover-gap',
      label: `Try a ${CASE_TYPE_LABELS[gap.caseType]} case`,
      reason: `You haven't been tested on ${CASE_TYPE_LABELS[gap.caseType].toLowerCase()} yet — interviewers will. Close the gap.`,
      cta: 'Open case',
      href: `/practice?type=${gap.caseType}&difficulty=${gap.difficulty}`,
      paywalled: false,
      impact: 0.5 + 0.04 * emptyCount,
    });
  }

  // 3) weakest dimension (weight by rubric max → structure beats presence)
  if (r.weakestDimension) {
    const d = r.dimensions.find((x) => x.dimension === r.weakestDimension)!;
    cands.push({
      kind: 'fix-dimension',
      label: `Sharpen ${SCORE_DIMENSION_LABELS[d.dimension].toLowerCase()}`,
      reason: `${SCORE_DIMENSION_LABELS[d.dimension]} is your lowest dimension (${Math.round(d.ratio * 100)}% of max) — and worth ${d.max} points per case.`,
      cta: 'Targeted drill',
      href: `/practice?focus=${d.dimension}`,
      // re-attempt-style fix is gated for free users (re-attempts locked, §1.5)
      paywalled: tier === 'free',
      impact: (1 - d.ratio) * (d.max / 25), // 0..~1, scaled by lever size
    });
  }

  // 4) robustness — strong but fragile on hard
  if (r.fragileOnHard && r.components.mastery >= 65) {
    cands.push({
      kind: 'prove-hard',
      label: 'Prove it on a hard case',
      reason: 'Your scores dip on hard cases — that gap is exactly where interviews live.',
      cta: 'Hard case',
      href: '/practice?difficulty=hard',
      paywalled: false,
      impact: 0.55,
    });
  }

  // 5) staleness
  if (r.stalestType) {
    cands.push({
      kind: 'refresh-stale',
      label: `Refresh ${CASE_TYPE_LABELS[r.stalestType].toLowerCase()}`,
      reason: `You haven't touched ${CASE_TYPE_LABELS[r.stalestType].toLowerCase()} in a while — skills fade fast this close to placements.`,
      cta: 'Refresh now',
      href: `/practice?type=${r.stalestType}`,
      paywalled: false,
      impact: 0.45,
    });
  }

  if (!cands.length) {
    return {
      kind: 'keep-going',
      label: "Keep your streak alive",
      reason: 'Coverage and dimensions look balanced — bank another rep to hold the line.',
      cta: 'Daily pick',
      href: '/home',
      paywalled: false,
    };
  }

  cands.sort((a, b) => b.impact - a.impact);
  const { impact, ...best } = cands[0];
  return best;
}
