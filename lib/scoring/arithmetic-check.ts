// DELIVERABLE — the arithmetic backstop. Runs deterministic checks over a CalcChain and:
//   (1) flags recompute mismatches + base inconsistencies (the Goa-beers class of error),
//   (2) applies an order-of-magnitude guard against an author-provided plausible band,
//   (3) returns a CORRECTED arithmetic-dimension (D4) score + a total-score cap,
//   (4) is HONEST about scope: it does NOT judge assumption realism (the bullets class of
//       error — 30k rounds/recruit is self-consistent arithmetic but unrealistic). That stays
//       with the LLM + rubric D3. A checker that overclaims is worse than none.
import { type CalcChain, resolveChain, type ResolvedStep } from './calc-chain';

export type FindingKind =
  | 'recompute_mismatch' // a step's claimed value != recomputed value
  | 'base_inconsistency' // a percent_of step's claimed value doesn't match pct × resolved base
  | 'magnitude_implausible' // final answer off the author-provided band by orders of magnitude
  | 'final_mismatch'; // stated final != recomputed final

export interface Finding {
  kind: FindingKind;
  stepId?: string;
  label: string;
  message: string;
  claimed: number;
  computed: number;
}

export interface PlausibleBand {
  /** inclusive plausible range for the FINAL answer, in the final unit. Author-provided per case. */
  low: number;
  high: number;
}

export interface BackstopResult {
  findings: Finding[];
  /** corrected D4 (arithmetic & unit discipline) score, 1..5 — REPLACES the LLM's D4. */
  arithmeticScore: number;
  /** multiplicative cap on the TOTAL (0..1); 1 = no cap. Egregious magnitude error caps hard. */
  totalCapFactor: number;
  /** human-readable summary for the feedback panel. */
  summary: string;
  /** explicit scope note — what this did NOT check. */
  notChecked: string;
}

const TOLERANCE = 0.02; // 2% — generous; guesstimates round freely

/** Orders of magnitude between a value and the nearest edge of a band (0 if inside). */
function ordersOutside(value: number, band: PlausibleBand): number {
  if (value >= band.low && value <= band.high) return 0;
  const edge = value < band.low ? band.low : band.high;
  if (value <= 0 || edge <= 0) return Infinity;
  return Math.abs(Math.log10(value) - Math.log10(edge));
}

export function runBackstop(chain: CalcChain, band?: PlausibleBand): BackstopResult {
  const resolved = resolveChain(chain, TOLERANCE);
  const byId = new Map(chain.steps.map((s) => [s.id, s]));
  const findings: Finding[] = [];

  for (const r of resolved) {
    if (r.ok) continue;
    const step = byId.get(r.id)!;
    if (step.op === 'percent_of') {
      findings.push({
        kind: 'base_inconsistency',
        stepId: r.id,
        label: r.label,
        message: `"${r.label}" claims ${fmt(r.claimedValue)} but the stated percentage of its base recomputes to ${fmt(r.computedValue)}. The base or the result is wrong.`,
        claimed: r.claimedValue,
        computed: r.computedValue,
      });
    } else {
      findings.push({
        kind: 'recompute_mismatch',
        stepId: r.id,
        label: r.label,
        message: `"${r.label}" claims ${fmt(r.claimedValue)} but its inputs recompute to ${fmt(r.computedValue)} (off by ${(r.relError * 100).toFixed(0)}%).`,
        claimed: r.claimedValue,
        computed: r.computedValue,
      });
    }
  }

  // final-value check
  const finalStep = chain.finalRef
    ? resolved.find((r) => r.id === chain.finalRef)
    : resolved[resolved.length - 1];
  if (finalStep) {
    const relErr = Math.abs(finalStep.computedValue - chain.finalValue) / Math.max(Math.abs(chain.finalValue), 1e-9);
    if (relErr > TOLERANCE) {
      findings.push({
        kind: 'final_mismatch',
        label: 'final answer',
        message: `Stated final answer ${fmt(chain.finalValue)} doesn't match the chain, which recomputes to ${fmt(finalStep.computedValue)}.`,
        claimed: chain.finalValue,
        computed: finalStep.computedValue,
      });
    }
  }

  // magnitude guard (only if the author provided a plausible band)
  let totalCapFactor = 1;
  if (band) {
    const oom = ordersOutside(chain.finalValue, band);
    if (oom >= 2) {
      findings.push({
        kind: 'magnitude_implausible',
        label: 'order of magnitude',
        message: `Final answer ${fmt(chain.finalValue)} is ~${oom.toFixed(1)} orders of magnitude outside the plausible range [${fmt(band.low)}–${fmt(band.high)}]. A clean-looking method does not rescue an answer this far off.`,
        claimed: chain.finalValue,
        computed: band.low,
      });
      // cap hard: 2 OOM off → total capped at 50%, 3+ → 35%
      totalCapFactor = oom >= 3 ? 0.35 : 0.5;
    }
  }

  // corrected D4 from the count/severity of arithmetic findings
  const arithFindings = findings.filter((f) => f.kind !== 'magnitude_implausible');
  const arithmeticScore =
    arithFindings.length === 0 ? 5 : arithFindings.length === 1 ? 3 : arithFindings.length === 2 ? 2 : 1;

  const summary =
    findings.length === 0
      ? 'Arithmetic verified: every step recomputes within tolerance and the final value is consistent.'
      : `${findings.length} arithmetic issue(s) found by independent recomputation — these are deterministic, not opinion.`;

  return {
    findings,
    arithmeticScore,
    totalCapFactor,
    summary,
    notChecked:
      'This backstop verifies internal arithmetic consistency only. It does NOT judge whether the ASSUMPTIONS are realistic (e.g. a self-consistent but implausible per-unit rate) — that is scored by the LLM under the segmentation & assumptions dimension.',
  };
}

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(2)} cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}
