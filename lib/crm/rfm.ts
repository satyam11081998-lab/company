/**
 * RFM segmentation (Recency, Frequency, Monetary), Zoho-style: each metric is
 * scored 1–5 by percentile (automatic) or by admin thresholds (manual), and
 * the R/F pattern maps to a named segment. Pure.
 *
 * Recency is "days since" — LOWER is better, so it is scored in reverse.
 * Ties share a score (rank by value, not by position), so 400 users with
 * zero revenue all get M = 1 instead of being split arbitrarily.
 */

export interface RfmInput {
  id: string;
  recencyDays: number | null;
  frequency: number | null;
  monetary: number | null;
}

export interface RfmScore {
  id: string;
  r: number;
  f: number;
  m: number;
  label: string;
}

export interface ManualThresholds {
  /** ascending cut points, 4 numbers → 5 bands */
  r?: number[];
  f?: number[];
  m?: number[];
}

/** Percentile score 1..5 for each value; `reverse` → smaller values score higher. */
export function quintileScores(values: Array<number | null>, reverse = false): number[] {
  const present = values.filter((v): v is number => v !== null && Number.isFinite(v)).sort((a, b) => a - b);
  const n = present.length;
  return values.map((v) => {
    if (v === null || !Number.isFinite(v) || !n) return 1;
    // share of values strictly below v + half the ties → mid-rank percentile in [0,1)
    let lo = 0;
    let hi = n;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (present[mid] < v) lo = mid + 1; else hi = mid; }
    const below = lo;
    let eq = 0;
    for (let i = below; i < n && present[i] === v; i++) eq++;
    const pct = (below + eq / 2) / n;
    const score = Math.min(5, Math.floor(pct * 5) + 1);
    return reverse ? 6 - score : score;
  });
}

function bandScore(v: number | null, cuts: number[], reverse: boolean): number {
  if (v === null || !Number.isFinite(v)) return reverse ? 1 : 1;
  let s = 1;
  for (const c of cuts.slice(0, 4)) if (v >= c) s++;
  return reverse ? 6 - s : s;
}

/** Standard segment names from the R and F scores (the F/M average for "value"). */
export function rfmLabel(r: number, f: number, m: number): string {
  const fm = Math.round((f + m) / 2);
  if (r >= 4 && fm >= 4) return 'Champions';
  if (r >= 3 && fm >= 4) return 'Loyal';
  if (r >= 4 && fm === 3) return 'Potential loyalists';
  if (r === 5 && fm <= 2) return 'New';
  if (r === 4 && fm <= 2) return 'Promising';
  if (r === 3 && fm === 3) return 'Need attention';
  if (r === 3 && fm <= 2) return 'About to sleep';
  if (r <= 2 && fm >= 4) return "Can't lose them";
  if (r <= 2 && fm === 3) return 'At risk';
  if (r === 2 && fm <= 2) return 'Hibernating';
  return 'Lost';
}

export const RFM_LABELS = ['Champions', 'Loyal', 'Potential loyalists', 'New', 'Promising', 'Need attention', 'About to sleep', "Can't lose them", 'At risk', 'Hibernating', 'Lost'];

export function scoreRfm(rows: RfmInput[], manual?: ManualThresholds): RfmScore[] {
  const r = manual?.r?.length ? rows.map((x) => bandScore(x.recencyDays, manual.r!, true)) : quintileScores(rows.map((x) => x.recencyDays), true);
  const f = manual?.f?.length ? rows.map((x) => bandScore(x.frequency, manual.f!, false)) : quintileScores(rows.map((x) => x.frequency));
  const m = manual?.m?.length ? rows.map((x) => bandScore(x.monetary, manual.m!, false)) : quintileScores(rows.map((x) => x.monetary));
  return rows.map((x, i) => ({ id: x.id, r: r[i], f: f[i], m: m[i], label: rfmLabel(r[i], f[i], m[i]) }));
}
