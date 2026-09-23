/* ============================================================================
   lib/casebook/atlas-types.ts

   Types for the searchable Data Atlas block. Kept in their own tiny module so
   `lib/casebook/types.ts` (imported by every content file) never pulls the
   dataset itself into the bundle.

   The organising idea: a guesstimate number is useless without its VINTAGE.
   Every datum therefore carries value + asOf + source + grade, and — the part
   that actually wins interviews — what it UNLOCKS and what it CROSS-CHECKS
   against.
   ============================================================================ */

/** How the number came to exist. Drives the badge shown next to it. */
export type Grade =
  | 'measured'    // a census/survey/administrative count: highest confidence
  | 'official'    // a government estimate or provisional estimate
  | 'derived'     // arithmetic on two measured numbers (ours, shown openly)
  | 'industry';   // widely-quoted trade estimate; no primary count exists

/** One number on the sheet. */
export interface Datum {
  /** stable id, used for anchors + dedupe */
  id: string;
  /** what it is, in the words a candidate would say out loud */
  label: string;
  /** the headline value, already rounded to what you can defend */
  value: string;
  /** the same number in the other unit system a panel might expect */
  alt?: string;
  /** one line of nuance — the thing that stops a wrong answer */
  detail?: string;
  /** period the number refers to, e.g. "FY2025-26" or "Apr 2026" */
  asOf: string;
  /** primary source, named the way you would cite it aloud */
  source: string;
  grade: Grade;
  /** what this number lets you size */
  unlocks?: string;
  /** the independent number that should agree with it */
  crossCheck?: string;
  /** extra search terms beyond label/value/detail */
  keywords?: string[];
}

/* ---------------------------------------------------------------- visuals */

/** Horizontal bars, one series, magnitude read off the length. */
export interface BarsVisual {
  kind: 'bars';
  unitNote?: string;
  items: { label: string; value: number; display: string; muted?: boolean }[];
}

/** A single 100% strip — composition of a whole. */
export interface StackVisual {
  kind: 'stack';
  unitNote?: string;
  segments: { label: string; pct: number; display?: string }[];
}

/** Income/consumption pyramid — tiers from top to bottom. */
export interface PyramidVisual {
  kind: 'pyramid';
  unitNote?: string;
  tiers: { label: string; band: string; pct: number }[];
}

/** The cross-check chain: a × b × c ≈ result, checked against a known figure. */
export interface ChainVisual {
  kind: 'chain';
  unitNote?: string;
  chains: {
    goal: string;
    steps: { md: string; value: string }[];
    result: string;
    check: string;
    verdict: 'holds' | 'watch';
  }[];
}

/** Two quantities side by side, sized to their ratio. */
export interface RatioVisual {
  kind: 'ratio';
  unitNote?: string;
  pairs: { aLabel: string; aValue: number; aDisplay: string; bLabel: string; bValue: number; bDisplay: string; note?: string }[];
}

export type AtlasVisual = BarsVisual | StackVisual | PyramidVisual | ChainVisual | RatioVisual;

/* --------------------------------------------------------------- sections */

export interface AtlasSection {
  id: string;
  /** short label used in the jump bar */
  nav: string;
  title: string;
  /** why this slide exists, in one line */
  kicker: string;
  /** the punchline a candidate should carry away */
  aha?: string;
  /** the big-number wall at the top of the slide */
  headline?: Datum[];
  visual?: AtlasVisual;
  /** everything else, searchable */
  facts: Datum[];
}

export interface AtlasData {
  /** shown under the search box */
  updated: string;
  sections: AtlasSection[];
}
