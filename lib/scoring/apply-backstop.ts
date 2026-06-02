// DELIVERABLE — merge the LLM's rubric dimension scores with the deterministic backstop.
// The LLM proposes all five dimensions; the backstop OVERRIDES the arithmetic dimension (D4)
// with its recomputed verdict and applies a magnitude cap to the total. This extends the
// existing "server recomputes the total, never trusts the model" principle from arithmetic of
// the WEIGHTS to arithmetic of the ANSWER itself.
import { type CalcChain } from './calc-chain';
import { runBackstop, type PlausibleBand, type BackstopResult } from './arithmetic-check';

// guesstimate rubric weights (must match guesstimate-rubric-v0.1.md)
export const GUESSTIMATE_WEIGHTS = {
  scoping: 0.1,
  structure: 0.3,
  segmentation: 0.25,
  arithmetic: 0.15,
  sanity: 0.2,
} as const;

export interface LlmDimensionScores {
  scoping: number; // 1..5
  structure: number;
  segmentation: number;
  arithmetic: number; // the LLM's (untrusted) arithmetic score — will be REPLACED
  sanity: number;
}

export interface FinalScore {
  dimensions: LlmDimensionScores & { arithmetic: number }; // arithmetic now backstop-corrected
  rawTotal: number; // before magnitude cap
  total: number; // after magnitude cap (0..100)
  backstop: BackstopResult;
  arithmeticOverridden: boolean;
}

function weightedTotal(d: LlmDimensionScores): number {
  const t =
    d.scoping * GUESSTIMATE_WEIGHTS.scoping +
    d.structure * GUESSTIMATE_WEIGHTS.structure +
    d.segmentation * GUESSTIMATE_WEIGHTS.segmentation +
    d.arithmetic * GUESSTIMATE_WEIGHTS.arithmetic +
    d.sanity * GUESSTIMATE_WEIGHTS.sanity;
  return (t / 5) * 100;
}

/** Combine LLM rubric scores + the candidate's calc chain into the final, backstop-corrected score. */
export function applyBackstop(
  llm: LlmDimensionScores,
  chain: CalcChain,
  band?: PlausibleBand,
): FinalScore {
  const backstop = runBackstop(chain, band);

  const corrected: LlmDimensionScores = { ...llm, arithmetic: backstop.arithmeticScore };
  const arithmeticOverridden = backstop.arithmeticScore !== llm.arithmetic;

  const rawTotal = weightedTotal(corrected);
  const total = Math.round(rawTotal * backstop.totalCapFactor);

  return { dimensions: corrected, rawTotal: Math.round(rawTotal), total, backstop, arithmeticOverridden };
}
