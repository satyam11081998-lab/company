// DELIVERABLE — Readiness Score v1 engine.
// Pure functions. Computes one honest 0..100 number + its four components +
// the coverage grid + a verdict, entirely from data the CURRENT schema already has
// (submissions.score, feedback_json.breakdown, created_at, joined case type/difficulty).
//
// Design notes (PROJECT_BRAIN §0 dashboard-rebuild entry):
//  - No SM-2, no timing telemetry, no cohort table required. Recency-weighting is the
//    honest stand-in for the "forgetting curve"; easy-vs-hard drop is the honest
//    stand-in for the research's "Pressure Degradation Index".
//  - The score is NEVER surfaced bare: callers must render it WITH `components` and the
//    next action (see lib/next-action.ts) so a dip reads as "do this", not "you're failing".
//  - SEAM for Scope A+/v2: pass `weights` to shift emphasis by placement-timeline phase
//    (PHASE_WEIGHTS presets below, unused by default).

import {
  SCORE_DIMENSIONS,
  SCORE_DIMENSION_MAX,
  CASE_TYPES,
  DIFFICULTIES,
  type ScoreDimension,
  type CaseType,
  type Difficulty,
} from './constants';
import type { SubmissionRow } from './types';

// The engine's input: the real SubmissionRow PLUS the join-supplied fields that
// page.tsx maps in from the `cases` + `case_attempts` joins. Keeping this here
// (rather than on SubmissionRow) means ZERO change to lib/types.ts.
export type ReadinessSubmission = SubmissionRow & {
  case_type?: CaseType | null;
  case_difficulty?: Difficulty | null;
  is_first_attempt?: boolean | null;
};

// ---- tunables (kept in one place so they're easy to calibrate later) ----
const HALF_LIFE_DAYS = 14; // a score from 14 days ago counts half as much
const DIFFICULTY_WEIGHT: Record<Difficulty, number> = { easy: 0.8, medium: 1.0, hard: 1.25 };
const COVERAGE_PASS = 60; // a cell counts as "covered" at >= this best score
const COVERAGE_PARTIAL = 0.4; // credit for an attempted-but-below-pass cell
const MIN_CALIBRATION_SUBS = 3;
const MIN_CALIBRATION_TYPES = 2;
const STALE_DAYS = 5;
const ROBUSTNESS_MIN_HARD = 2; // need >=2 hard reps before robustness can exceed the cap
const ROBUSTNESS_UNPROVEN_CAP = 75; // can't be "proven robust" without hard reps

export interface ReadinessWeights {
  mastery: number;
  coverage: number;
  consistency: number;
  robustness: number;
}
export const DEFAULT_WEIGHTS: ReadinessWeights = {
  mastery: 0.45,
  coverage: 0.2,
  consistency: 0.15,
  robustness: 0.2,
};
// SEAM (Scope A+): swap weights by days-to-placement phase. Unused until a date input exists.
export const PHASE_WEIGHTS: Record<'foundation' | 'synthesis' | 'lockdown', ReadinessWeights> = {
  foundation: { mastery: 0.4, coverage: 0.35, consistency: 0.15, robustness: 0.1 },
  synthesis: { mastery: 0.4, coverage: 0.2, consistency: 0.2, robustness: 0.2 },
  lockdown: { mastery: 0.4, coverage: 0.1, consistency: 0.15, robustness: 0.35 },
};

export type CoverageState = 'covered' | 'attempted' | 'empty';
export interface CoverageCell {
  caseType: CaseType;
  difficulty: Difficulty;
  bestScore: number | null;
  attempts: number;
  state: CoverageState;
}

export interface DimensionStat {
  dimension: ScoreDimension;
  max: number;
  earned: number; // recency-weighted avg points earned (0..max)
  ratio: number; // earned / max (0..1)
}

export interface ReadinessComponents {
  mastery: number;
  coverage: number;
  consistency: number;
  robustness: number;
}

export type ReadinessVerdict = 'early' | 'building' | 'on-track' | 'interview-ready' | 'elite';

export interface ReadinessResult {
  status: 'calibrating' | 'scored';
  // calibrating:
  subsDone: number;
  subsNeeded: number;
  typesDone: number;
  typesNeeded: number;
  // scored:
  score: number; // 0..100 int
  verdict: ReadinessVerdict;
  components: ReadinessComponents;
  dimensions: DimensionStat[]; // recency-weighted, for the bullet charts
  coverage: CoverageCell[]; // 12 cells for the heatmap
  weakestDimension: ScoreDimension | null;
  stalestType: CaseType | null;
  fragileOnHard: boolean;
  lastActiveDays: number | null; // days since most recent scored submission
}

interface Scored {
  score: number;
  breakdown: Record<ScoreDimension, number> | null;
  ageDays: number;
  type: CaseType | null;
  difficulty: Difficulty | null;
  firstAttempt: boolean;
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, n));
}

function normalize(rows: ReadinessSubmission[], now: Date): Scored[] {
  const out: Scored[] = [];
  for (const r of rows) {
    if (r.score == null) continue; // unscored / pending
    // Guesstimates are scored on a SEPARATE 5-dim rubric and tracked in their own
    // dashboard chart — they are fully excluded from the case readiness number,
    // coverage grid, and 6-dim dimensions (owner decision, G3). Filtering here is the
    // single chokepoint that keeps them out of mastery/coverage/consistency/robustness.
    if (r.case_type === 'guesstimate') continue;
    const ageMs = now.getTime() - new Date(r.created_at).getTime();
    const ageDays = Math.max(0, ageMs / 86_400_000);
    out.push({
      score: clamp(r.score),
      breakdown: r.feedback_json?.breakdown ?? null,
      ageDays,
      type: (r.case_type ?? null) as CaseType | null,
      difficulty: (r.case_difficulty ?? null) as Difficulty | null,
      // default missing first-attempt flag to true so single-attempt users aren't penalised
      firstAttempt: r.is_first_attempt ?? true,
    });
  }
  return out;
}

function recencyWeight(ageDays: number): number {
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS);
}

function computeMastery(subs: Scored[]): number {
  const first = subs.filter((s) => s.firstAttempt);
  const pool = first.length ? first : subs;
  let num = 0;
  let den = 0;
  for (const s of pool) {
    const dw = s.difficulty ? DIFFICULTY_WEIGHT[s.difficulty] : 1.0;
    const w = recencyWeight(s.ageDays) * dw;
    num += w * s.score;
    den += w;
  }
  return den > 0 ? clamp(num / den) : 0;
}

function computeDimensions(subs: Scored[]): DimensionStat[] {
  return SCORE_DIMENSIONS.map((dim) => {
    let num = 0;
    let den = 0;
    for (const s of subs) {
      if (!s.breakdown || s.breakdown[dim] == null) continue;
      const w = recencyWeight(s.ageDays);
      num += w * s.breakdown[dim];
      den += w;
    }
    const max = SCORE_DIMENSION_MAX[dim];
    const earned = den > 0 ? num / den : 0;
    return { dimension: dim, max, earned, ratio: max > 0 ? earned / max : 0 };
  });
}

function buildCoverage(subs: Scored[]): CoverageCell[] {
  const cells: CoverageCell[] = [];
  for (const caseType of CASE_TYPES) {
    for (const difficulty of DIFFICULTIES) {
      const matching = subs.filter((s) => s.type === caseType && s.difficulty === difficulty);
      const best = matching.length ? Math.max(...matching.map((s) => s.score)) : null;
      let state: CoverageState = 'empty';
      if (best != null) state = best >= COVERAGE_PASS ? 'covered' : 'attempted';
      cells.push({ caseType, difficulty, bestScore: best, attempts: matching.length, state });
    }
  }
  return cells;
}

function computeCoverage(cells: CoverageCell[]): number {
  let credit = 0;
  for (const c of cells) {
    if (c.state === 'covered') credit += 1;
    else if (c.state === 'attempted') credit += COVERAGE_PARTIAL;
  }
  return clamp((credit / cells.length) * 100);
}

function computeConsistency(subs: Scored[], streak: number): number {
  const last7 = subs.filter((s) => s.ageDays <= 7);
  const last28 = subs.filter((s) => s.ageDays <= 28);
  const activeDays7 = new Set(last7.map((s) => Math.floor(s.ageDays))).size;
  const activeWeeks = new Set(last28.map((s) => Math.floor(s.ageDays / 7))).size; // 0..4
  const weeksPart = (activeWeeks / 4) * 100;
  const daysPart = (Math.min(activeDays7, 4) / 4) * 100;
  const streakPart = (Math.min(streak, 7) / 7) * 100;
  return clamp(0.5 * weeksPart + 0.3 * daysPart + 0.2 * streakPart);
}

function computeRobustness(subs: Scored[], mastery: number): { value: number; fragile: boolean } {
  const hard = subs.filter((s) => s.difficulty === 'hard');
  const easyMed = subs.filter((s) => s.difficulty === 'easy' || s.difficulty === 'medium');
  if (hard.length < ROBUSTNESS_MIN_HARD || easyMed.length === 0) {
    // unproven: cannot certify robustness without hard reps
    return { value: clamp(Math.min(mastery, ROBUSTNESS_UNPROVEN_CAP)), fragile: false };
  }
  const avg = (a: Scored[]) => a.reduce((s, x) => s + x.score, 0) / a.length;
  const drop = avg(easyMed) - avg(hard); // positive = collapses on hard
  // Map a 0..40-point drop onto a 0..60-point penalty; clamp.
  const penalty = clamp((Math.max(0, drop) / 40) * 60, 0, 60);
  const fragile = drop >= 12;
  return { value: clamp(100 - penalty), fragile };
}

export interface ReadinessInput {
  submissions: ReadinessSubmission[];
  streak: number;
  now?: Date;
  weights?: ReadinessWeights;
}

function verdictFor(score: number): ReadinessVerdict {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'interview-ready';
  if (score >= 60) return 'on-track';
  if (score >= 40) return 'building';
  return 'early';
}

export function computeReadiness(input: ReadinessInput): ReadinessResult {
  const now = input.now ?? new Date();
  const weights = input.weights ?? DEFAULT_WEIGHTS;
  const subs = normalize(input.submissions, now);

  const distinctTypes = new Set(subs.map((s) => s.type).filter(Boolean));
  const coverageCells = buildCoverage(subs);
  const lastActiveDays = subs.length ? Math.min(...subs.map((s) => s.ageDays)) : null;

  // ---- cold start ----
  if (subs.length < MIN_CALIBRATION_SUBS || distinctTypes.size < MIN_CALIBRATION_TYPES) {
    return {
      status: 'calibrating',
      subsDone: subs.length,
      subsNeeded: MIN_CALIBRATION_SUBS,
      typesDone: distinctTypes.size,
      typesNeeded: MIN_CALIBRATION_TYPES,
      score: 0,
      verdict: 'early',
      components: { mastery: 0, coverage: 0, consistency: 0, robustness: 0 },
      dimensions: computeDimensions(subs),
      coverage: coverageCells,
      weakestDimension: null,
      stalestType: null,
      fragileOnHard: false,
      lastActiveDays: lastActiveDays == null ? null : Math.floor(lastActiveDays),
    };
  }

  const mastery = computeMastery(subs);
  const coverage = computeCoverage(coverageCells);
  const consistency = computeConsistency(subs, input.streak);
  const { value: robustness, fragile } = computeRobustness(subs, mastery);
  const dimensions = computeDimensions(subs);

  const composite =
    weights.mastery * mastery +
    weights.coverage * coverage +
    weights.consistency * consistency +
    weights.robustness * robustness;
  const score = Math.round(clamp(composite));

  // weakest dimension (by ratio; tie-break toward higher rubric weight → bigger lever)
  let weakest: DimensionStat | null = null;
  for (const d of dimensions) {
    if (d.earned === 0 && d.ratio === 0) continue; // no data for this dim yet
    if (
      !weakest ||
      d.ratio < weakest.ratio ||
      (d.ratio === weakest.ratio && d.max > weakest.max)
    )
      weakest = d;
  }

  // stalest practised type (max age of most-recent rep per type)
  let stalest: CaseType | null = null;
  let stalestAge = -1;
  for (const t of CASE_TYPES) {
    const ofType = subs.filter((s) => s.type === t);
    if (!ofType.length) continue;
    const freshest = Math.min(...ofType.map((s) => s.ageDays));
    if (freshest > stalestAge) {
      stalestAge = freshest;
      stalest = t;
    }
  }

  return {
    status: 'scored',
    subsDone: subs.length,
    subsNeeded: MIN_CALIBRATION_SUBS,
    typesDone: distinctTypes.size,
    typesNeeded: MIN_CALIBRATION_TYPES,
    score,
    verdict: verdictFor(score),
    components: { mastery, coverage, consistency, robustness },
    dimensions,
    coverage: coverageCells,
    weakestDimension: weakest?.dimension ?? null,
    stalestType: stalestAge >= STALE_DAYS ? stalest : null,
    fragileOnHard: fragile,
    lastActiveDays: lastActiveDays == null ? null : Math.floor(lastActiveDays),
  };
}

export const VERDICT_LABEL: Record<ReadinessVerdict, string> = {
  early: 'Early days',
  building: 'Building',
  'on-track': 'On track',
  'interview-ready': 'Interview-ready',
  elite: 'Elite',
};
