// DELIVERABLE — single source of truth for the career ladder.
// Fixes the SSOT bug (PROJECT_BRAIN §13/§19): thresholds were duplicated in
// components/career-ladder.tsx AND components/dashboard-client.tsx
// (deriveTierName / deriveNextTierPts). Both must now import from here.
//
// Copy verbatim from career-ladder.tsx so names/taglines/thresholds match
// what already ships. Order = ascending by threshold.

export interface CareerTier {
  threshold: number; // min points to hold this tier
  name: string;
  tagline: string;
}

// Thresholds follow `100 * n²` for n = 0..9. Owner directive (2026-06-07):
// stretch the ladder so progression is meaningfully exponential and ten rungs
// cover real prep effort, not toy point counts.
// 0, 100, 400, 900, 1600, 2500, 3600, 4900, 6400, 8100.
export const CAREER_TIERS: CareerTier[] = [
  { threshold: 0,    name: 'Day 0 Dreamer',       tagline: 'Just showed up. Bold move.' },
  { threshold: 100,  name: 'Casebook Collector',  tagline: 'Downloaded 12 casebooks, read 1' },
  { threshold: 400,  name: 'MECE Believer',       tagline: 'Uses MECE in casual conversation' },
  { threshold: 900,  name: 'Deck Polisher',       tagline: 'Pixel-perfect slides at 2am' },
  { threshold: 1600, name: 'Fundae Machine',      tagline: 'You know your frameworks' },
  { threshold: 2500, name: 'PPO Chaser',          tagline: 'Deep prep, real results' },
  { threshold: 3600, name: 'Summer Legend',       tagline: 'Top 1% of MECE users' },
  { threshold: 4900, name: 'Shortlist Maker',     tagline: 'CVs glow in the dark' },
  { threshold: 6400, name: 'Final Round Regular', tagline: 'They know you by name' },
  { threshold: 8100, name: 'Day 1 Hero',          tagline: 'Partner material' },
];

export function currentTier(points: number): CareerTier {
  let tier = CAREER_TIERS[0];
  for (const t of CAREER_TIERS) if (points >= t.threshold) tier = t;
  return tier;
}

export function nextTier(points: number): CareerTier | null {
  return CAREER_TIERS.find((t) => t.threshold > points) ?? null;
}

/** 0..1 progress from the current tier's floor to the next tier's floor. */
export function tierProgress(points: number): number {
  const cur = currentTier(points);
  const nxt = nextTier(points);
  if (!nxt) return 1;
  const span = nxt.threshold - cur.threshold;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (points - cur.threshold) / span));
}

/** Points remaining to the next tier, or 0 at the top. */
export function pointsToNextTier(points: number): number {
  const nxt = nextTier(points);
  return nxt ? Math.max(0, nxt.threshold - points) : 0;
}

// Back-compat shims so the old call sites can be swapped with a one-line import
// change instead of a refactor (then deleted once both components are updated):
export const deriveTierName = (points: number): string => currentTier(points).name;
export const deriveNextTierPts = (points: number): number => pointsToNextTier(points);
