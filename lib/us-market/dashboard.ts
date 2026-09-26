/**
 * US dashboard model (2026-09-26) — PURE functions over the user's own rows.
 *
 * Everything the US dashboard shows is derived here from real submissions,
 * attempts and today's schedule. Nothing is invented: a module with no data
 * gets an explicit empty state, and the "what to do next" recommendation is
 * only produced once there is enough scored practice to justify one.
 *
 * Kept free of Supabase/React so it can be unit-tested with fixtures
 * (scripts/test-us-dashboard.mjs) and reused by any US surface.
 */

import { US_CASE_TYPES, US_CASE_TYPE_LABEL, usTypeLabel } from './labels';
import type { UsCase } from './types';

/* ── Inputs ─────────────────────────────────────────────────────────────── */

export interface UsSubmissionRow {
  id: string;
  case_id: string | null;
  score: number | null;
  created_at: string;
  /** cases.type / title / difficulty via the join; null when the case was deleted. */
  type: string | null;
  title: string | null;
  difficulty: string | null;
  /** feedback_json->breakdown (case dims 0..max; sizing dims 0..100 or legacy 1..5) */
  breakdown: Record<string, number> | null;
  /** feedback_json->>rubric ('guesstimate' for market sizing) */
  rubric: string | null;
}

export interface UsActiveAttemptRow {
  id: string;
  case_id: string;
  created_at: string;
  title: string | null;
  type: string | null;
  messages: number | null;
}

export interface UsTodayInput {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  interview_meta?: { est_minutes?: number; points_reward?: number; industry?: string } | null;
}

/* ── Outputs ────────────────────────────────────────────────────────────── */

export interface UsTodayItem {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  difficulty: string;
  minutes: number | null;
  points: number | null;
  industry: string | null;
  done: { score: number | null; submissionId: string | null } | null;
}

export interface UsTypeStat {
  type: string;
  label: string;
  count: number;
  avg: number | null;
  lastAt: string | null;
}

export interface UsNextAction {
  kind: 'weak-type' | 'weak-dimension' | 'untried-type' | 'sizing';
  eyebrow: string;
  title: string;
  reason: string;
  cta: string;
  href: string;
  focusType: string | null;
}

export interface UsWeek {
  start: string; // YYYY-MM-DD (Monday, UTC)
  label: string; // "Sep 22"
  cases: number;
  sizing: number;
}

export interface UsDashboardModel {
  metrics: {
    casesPracticed: number;
    sizingPracticed: number;
    scoredCases: number;
    avgCaseScore: number | null;
    avgSizingScore: number | null;
    /** avg of the last 5 scored cases minus the 5 before; null under 10 scored cases. */
    recentDelta: number | null;
  };
  weeks: UsWeek[];
  byType: UsTypeStat[];
  sizing: UsTypeStat;
  weakestDimension: { key: string; label: string; ratio: number } | null;
  nextAction: UsNextAction | null;
  /** How many more scored sessions before a recommendation is made (0 once there is one). */
  sessionsUntilAdvice: number;
  inProgress: { attemptId: string; caseId: string; title: string; typeLabel: string; startedAt: string }[];
  activity: { id: string; kind: 'case' | 'sizing'; title: string; typeLabel: string; score: number | null; at: string }[];
  /** Submission timestamps (last 14 days) — the client buckets them into ITS local days. */
  recentTimestamps: string[];
}

/* ── Constants ──────────────────────────────────────────────────────────── */

const CASE_DIM: Record<string, { label: string; max: number }> = {
  structure: { label: 'Structure', max: 25 },
  quantitative: { label: 'Quantitative skills', max: 20 },
  synthesis: { label: 'Synthesis & communication', max: 20 },
  business_judgment: { label: 'Business judgment', max: 15 },
  creativity: { label: 'Creativity', max: 10 },
  presence: { label: 'Presence', max: 10 },
};

/** Core types an interviewer is most likely to give; used for the "untried" nudge. */
const CORE_TYPES: UsCase['type'][] = ['profitability', 'market entry', 'm&a', 'pricing', 'growth'];

export const ADVICE_MIN_SESSIONS = 3;
const MIN_TYPE_SAMPLE = 2;
const WEAK_GAP = 5;

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Lower-case a label for mid-sentence use, keeping acronyms ("M&A") intact. */
export function lowerLabel(label: string): string {
  return label
    .split(' ')
    .map((w) => (/[A-Z]{2,}|&/.test(w) ? w : w.toLowerCase()))
    .join(' ');
}

const isSizing = (s: { type: string | null; rubric?: string | null }) => s.type === 'guesstimate' || s.rubric === 'guesstimate';
const round = (n: number) => Math.round(n);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function mondayUtc(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (x.getUTCDay() + 6) % 7; // Mon=0
  x.setUTCDate(x.getUTCDate() - dow);
  return x;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDay = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

/* ── Today ──────────────────────────────────────────────────────────────── */

export function buildToday(item: UsTodayInput | null, subs: UsSubmissionRow[]): UsTodayItem | null {
  if (!item) return null;
  const mine = subs.filter((s) => s.case_id === item.id);
  const scored = mine.filter((s) => s.score != null);
  const best = scored.length ? scored.reduce((a, b) => ((b.score as number) >= (a.score as number) ? b : a)) : null;
  const meta = item.interview_meta ?? null;
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    typeLabel: usTypeLabel(item.type),
    difficulty: item.difficulty,
    minutes: typeof meta?.est_minutes === 'number' ? meta.est_minutes : null,
    points: typeof meta?.points_reward === 'number' ? meta.points_reward : null,
    industry: typeof meta?.industry === 'string' ? meta.industry : null,
    done: mine.length
      ? { score: best ? round(best.score as number) : null, submissionId: (best ?? mine[0]).id }
      : null,
  };
}

/* ── The model ──────────────────────────────────────────────────────────── */

export function buildUsDashboard(
  subsNewestFirst: UsSubmissionRow[],
  active: UsActiveAttemptRow[],
  now: Date = new Date(),
): UsDashboardModel {
  const subs = subsNewestFirst;
  const caseSubs = subs.filter((s) => !isSizing(s));
  const sizingSubs = subs.filter((s) => isSizing(s));
  const scoredCases = caseSubs.filter((s) => s.score != null);
  const scoredSizing = sizingSubs.filter((s) => s.score != null);

  // Distinct cases practiced (re-attempts don't inflate the count).
  const distinct = (xs: UsSubmissionRow[]) => new Set(xs.map((s) => s.case_id ?? s.id)).size;

  const avgCase = mean(scoredCases.map((s) => s.score as number));
  const avgSizing = mean(scoredSizing.map((s) => s.score as number));
  let recentDelta: number | null = null;
  if (scoredCases.length >= 10) {
    const last5 = mean(scoredCases.slice(0, 5).map((s) => s.score as number)) as number;
    const prev5 = mean(scoredCases.slice(5, 10).map((s) => s.score as number)) as number;
    recentDelta = round(last5 - prev5);
  }

  // Weekly practice, last 8 weeks (Monday-start, UTC).
  const thisMonday = mondayUtc(now);
  const weeks: UsWeek[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = new Date(thisMonday);
    start.setUTCDate(start.getUTCDate() - i * 7);
    weeks.push({ start: start.toISOString().slice(0, 10), label: fmtDay(start), cases: 0, sizing: 0 });
  }
  const firstStart = new Date(weeks[0].start + 'T00:00:00Z').getTime();
  for (const s of subs) {
    const t = new Date(s.created_at).getTime();
    if (Number.isNaN(t) || t < firstStart) continue;
    const idx = Math.min(7, Math.floor((t - firstStart) / (7 * 86400000)));
    if (idx < 0) continue;
    if (isSizing(s)) weeks[idx].sizing++;
    else weeks[idx].cases++;
  }

  // Per-type stats (all nine types, tried or not).
  const byType: UsTypeStat[] = US_CASE_TYPES.map((type) => {
    const mine = caseSubs.filter((s) => s.type === type);
    const scored = mine.filter((s) => s.score != null).map((s) => s.score as number);
    const a = mean(scored);
    return { type, label: US_CASE_TYPE_LABEL[type], count: distinct(mine), avg: a == null ? null : round(a), lastAt: mine[0]?.created_at ?? null };
  });
  const sizing: UsTypeStat = {
    type: 'guesstimate',
    label: 'Market sizing',
    count: distinct(sizingSubs),
    avg: avgSizing == null ? null : round(avgSizing),
    lastAt: sizingSubs[0]?.created_at ?? null,
  };

  // Weakest case dimension (share of the marks available), over the last 10 scored cases.
  const dimAgg: Record<string, { got: number; max: number }> = {};
  for (const s of scoredCases.slice(0, 10)) {
    if (!s.breakdown) continue;
    for (const [k, v] of Object.entries(s.breakdown)) {
      const d = CASE_DIM[k];
      if (!d || typeof v !== 'number' || !Number.isFinite(v)) continue;
      dimAgg[k] = dimAgg[k] ?? { got: 0, max: 0 };
      dimAgg[k].got += Math.max(0, Math.min(v, d.max));
      dimAgg[k].max += d.max;
    }
  }
  let weakestDimension: UsDashboardModel['weakestDimension'] = null;
  for (const [k, { got, max }] of Object.entries(dimAgg)) {
    if (!max) continue;
    const ratio = got / max;
    if (!weakestDimension || ratio < weakestDimension.ratio) weakestDimension = { key: k, label: CASE_DIM[k].label, ratio };
  }

  // What to do next — only with enough scored practice to mean something.
  const scoredSessions = scoredCases.length + scoredSizing.length;
  let nextAction: UsNextAction | null = null;
  if (scoredSessions >= ADVICE_MIN_SESSIONS) {
    const cands: (UsNextAction & { weight: number })[] = [];
    if (avgCase != null) {
      const weak = byType
        .filter((t) => t.count >= MIN_TYPE_SAMPLE && t.avg != null && t.avg <= avgCase - WEAK_GAP)
        .sort((a, b) => (a.avg as number) - (b.avg as number))[0];
      if (weak) {
        cands.push({
          kind: 'weak-type',
          eyebrow: weak.label,
          title: `Practice ${lowerLabel(weak.label)}`,
          reason: `You've practiced ${weak.count} ${lowerLabel(weak.label)} cases, and your average there (${weak.avg}) is below your overall case average (${round(avgCase)}).`,
          cta: `Practice ${lowerLabel(weak.label)}`,
          href: `/practice?tab=scored&focus=${encodeURIComponent(weak.type)}`,
          focusType: weak.type,
          weight: 3 + (avgCase - (weak.avg as number)) / 10,
        });
      }
    }
    if (weakestDimension && weakestDimension.ratio < 0.6 && scoredCases.length >= ADVICE_MIN_SESSIONS) {
      const pct = round(weakestDimension.ratio * 100);
      cands.push({
        kind: 'weak-dimension',
        eyebrow: weakestDimension.label,
        title: `Sharpen your ${lowerLabel(weakestDimension.label)}`,
        reason: `${weakestDimension.label} is your weakest dimension: you're earning ${pct}% of the marks available across your recent scored cases.`,
        cta: 'Practice a case',
        href: '/practice?tab=scored',
        focusType: null,
        weight: 2 + (0.6 - weakestDimension.ratio) * 5,
      });
    }
    const untried = CORE_TYPES.find((t) => (byType.find((b) => b.type === t)?.count ?? 0) === 0);
    if (untried && scoredCases.length >= ADVICE_MIN_SESSIONS) {
      const label = US_CASE_TYPE_LABEL[untried];
      cands.push({
        kind: 'untried-type',
        eyebrow: label,
        title: `Try your first ${lowerLabel(label)} case`,
        reason: `You haven't practiced ${lowerLabel(label)} yet, and it's one of the case types interviewers use most.`,
        cta: `Start ${lowerLabel(label)}`,
        href: `/practice?tab=scored&focus=${encodeURIComponent(untried)}`,
        focusType: untried,
        weight: 1.5,
      });
    }
    if (avgSizing != null && avgCase != null && scoredSizing.length >= MIN_TYPE_SAMPLE && avgSizing <= avgCase - 10) {
      cands.push({
        kind: 'sizing',
        eyebrow: 'Market sizing',
        title: 'Practice market sizing',
        reason: `Your market sizing average (${round(avgSizing)}) trails your case average (${round(avgCase)}) across ${scoredSizing.length} scored questions.`,
        cta: 'Practice market sizing',
        href: '/practice?tab=guesstimates',
        focusType: 'guesstimate',
        weight: 2.5,
      });
    }
    cands.sort((a, b) => b.weight - a.weight);
    if (cands[0]) {
      const { weight: _w, ...best } = cands[0];
      void _w;
      nextAction = best;
    }
  }

  // Sessions left open (not submitted), newest first, one per case, last 21 days.
  const cutoff = now.getTime() - 21 * 86400000;
  const seen = new Set<string>();
  const inProgress = active
    .filter((a) => new Date(a.created_at).getTime() >= cutoff && (a.messages == null || a.messages >= 2))
    .filter((a) => {
      if (seen.has(a.case_id)) return false;
      seen.add(a.case_id);
      // A case submitted after this session opened is done, whatever the row says.
      const opened = new Date(a.created_at).getTime();
      return !subs.some((s) => s.case_id === a.case_id && new Date(s.created_at).getTime() >= opened);
    })
    .slice(0, 3)
    .map((a) => ({ attemptId: a.id, caseId: a.case_id, title: a.title ?? 'Untitled case', typeLabel: usTypeLabel(a.type), startedAt: a.created_at }));

  const activity = subs.slice(0, 6).map((s) => ({
    id: s.id,
    kind: (isSizing(s) ? 'sizing' : 'case') as 'case' | 'sizing',
    title: s.title ?? 'Untitled case',
    typeLabel: usTypeLabel(s.type),
    score: s.score == null ? null : round(s.score),
    at: s.created_at,
  }));

  const recentCutoff = now.getTime() - 14 * 86400000;
  const recentTimestamps = subs.filter((s) => new Date(s.created_at).getTime() >= recentCutoff).map((s) => s.created_at);

  return {
    metrics: {
      casesPracticed: distinct(caseSubs),
      sizingPracticed: distinct(sizingSubs),
      scoredCases: scoredCases.length,
      avgCaseScore: avgCase == null ? null : round(avgCase),
      avgSizingScore: avgSizing == null ? null : round(avgSizing),
      recentDelta,
    },
    weeks,
    byType,
    sizing,
    weakestDimension,
    nextAction,
    sessionsUntilAdvice: Math.max(0, ADVICE_MIN_SESSIONS - scoredSessions),
    inProgress,
    activity,
    recentTimestamps,
  };
}
