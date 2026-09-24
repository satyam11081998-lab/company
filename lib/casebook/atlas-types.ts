/* ============================================================================
   lib/casebook/atlas-types.ts

   Types for the Data Atlas block. Kept in their own tiny module so
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
  | 'official'    // a government or UN estimate, including provisional ones
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

/**
 * CHART RULES these shapes exist to enforce (see components/casebook/blocks/
 * data-atlas.tsx for the render side):
 *
 * • One axis of meaning per chart. Never two scales on one plot.
 * • Categorical hues (--viz-1..5) ONLY where the series are distinct
 *   identities, taken in fixed order and never cycled.
 * • Ordered things — age bands, funnel stages, nested definitions, tiers —
 *   take the sequential ramp (--viz-seq-*), not categorical hues.
 * • --primary is reserved for EMPHASIS: the one mark that is the point.
 * • No text ever sits on a chart fill; the ramps invert between themes.
 */

/** Horizontal bars. `emphasis` paints that row in --primary. */
export interface BarsVisual {
  kind: 'bars';
  title?: string;
  note?: string;
  /** true = ordered stages (sequential ramp); false = one hue for all */
  ordered?: boolean;
  /** a labelled rule across the plot, e.g. 100% = one connection per person */
  reference?: { at: number; label: string };
  items: { label: string; value: number; display: string; emphasis?: boolean; muted?: boolean }[];
}

/** A single 100% strip — composition of a whole. */
export interface StackVisual {
  kind: 'stack';
  title?: string;
  note?: string;
  segments: { label: string; pct: number; display?: string }[];
}

/** 100 cells, an ordered set of bands. "If India were 100 people". */
export interface WaffleVisual {
  kind: 'waffle';
  title?: string;
  note?: string;
  bands: { label: string; count: number; display: string }[];
}

/** A value on a track against a named threshold rule. */
export interface MeterVisual {
  kind: 'meter';
  title?: string;
  note?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  threshold: { at: number; label: string };
}

/** Two measures per item, joined — shows the GAP, which is usually the story. */
export interface DumbbellVisual {
  kind: 'dumbbell';
  title?: string;
  note?: string;
  /** axis domain, e.g. 60 for "0–60%" */
  max: number;
  unit: string;
  seriesA: string;
  seriesB: string;
  rows: { label: string; a: number; b: number; gap: string }[];
}

/** Descending stages — SIMs down to humans, people down to workers. */
export interface FunnelVisual {
  kind: 'funnel';
  title?: string;
  note?: string;
  stages: { label: string; value: number; display: string; emphasis?: boolean }[];
}

/** a × b = c, checked against an independent figure. */
export interface EquationVisual {
  kind: 'equation';
  title?: string;
  note?: string;
  rows: {
    goal: string;
    /** operator printed between terms. Defaults to ×; births − deaths is not a product. */
    op?: '\u00d7' | '\u2212' | '\u00f7' | '+';
    terms: { label: string; value: string }[];
    result: string;
    check: string;
    verdict: 'holds' | 'watch';
  }[];
}

/** Powers of ten, as a ladder. */
export interface LadderVisual {
  kind: 'ladder';
  title?: string;
  note?: string;
  rungs: { exp: string; label: string; alt: string; emphasis?: boolean }[];
}

/** Compact number chips — dense, no prose. */
export interface TilesVisual {
  kind: 'tiles';
  title?: string;
  note?: string;
  tiles: { value: string; label: string; unit?: string }[];
}

/** Two quantities side by side, sized to their ratio. */
export interface RatioVisual {
  kind: 'ratio';
  title?: string;
  note?: string;
  aLabel: string; aValue: number; aDisplay: string;
  bLabel: string; bValue: number; bDisplay: string;
}

export type AtlasVisual =
  | BarsVisual | StackVisual | WaffleVisual | MeterVisual | DumbbellVisual
  | FunnelVisual | EquationVisual | LadderVisual | TilesVisual | RatioVisual;

/* --------------------------------------------------------------- sections */

export interface AtlasSection {
  id: string;
  /** short label used in the jump bar */
  nav: string;
  title: string;
  /** why this slide exists, in one line */
  kicker: string;
  /** the punchline a candidate should carry away — the slide's "so what" */
  aha?: string;
  /** source chips shown in the slide header */
  sources?: string[];
  /** the big-number wall at the top of the slide */
  headline?: Datum[];
  /** charts, in render order — supplied by atlas-visuals.ts, keyed on `id` */
  visuals?: AtlasVisual[];
  /** everything else — rendered as compact chips on the slide, in full in search */
  facts: Datum[];
  /** datum ids a chart already shows; hidden from the chip strip, still searchable */
  covers?: string[];
}

export interface AtlasData {
  /** shown under the search box */
  updated: string;
  sections: AtlasSection[];
}
