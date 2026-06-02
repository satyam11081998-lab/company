// DELIVERABLE — the structured calculation chain the evaluator extracts from a transcript,
// and the deterministic resolver that RE-COMPUTES it (never trusting the candidate's or the
// LLM's stated results). Separation of concerns: the LLM TRANSCRIBES the candidate's stated
// math into this structure (LLMs are OK at transcription); CODE VERIFIES it (LLMs are bad at
// arithmetic). This is the arithmetic backstop's foundation.

export type CalcOp =
  | 'literal' // a stated input value (assumption)
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'percent_of'; // inputs: [percent(0..1 or "60%"), baseRef] — explicit so we can check the BASE

/** One step in the candidate's stated calculation. `claimedValue` is what the candidate SAID
 *  the result was; the resolver recomputes from `inputs` and compares. */
export interface CalcStep {
  id: string;
  label: string; // e.g. "adult population", "alcohol consumers"
  op: CalcOp;
  /** literals as numbers, or "#stepId" references, or for percent_of: [pct, "#baseId"]. */
  inputs: (number | string)[];
  /** what the candidate claimed this step equals (the number they wrote down). */
  claimedValue: number;
  /** optional unit label as the candidate stated it (e.g. "people", "Mn", "INR/yr"). */
  unit?: string;
}

export interface CalcChain {
  steps: CalcStep[];
  /** the candidate's final stated answer + unit. */
  finalValue: number;
  finalUnit?: string;
  /** optional: which step id is the final result (defaults to last step). */
  finalRef?: string;
}

export interface ResolvedStep {
  id: string;
  label: string;
  claimedValue: number;
  computedValue: number;
  /** |computed-claimed| / max(|claimed|,eps) */
  relError: number;
  ok: boolean; // within tolerance
}

const EPS = 1e-9;

function pctToFraction(v: number | string): number {
  if (typeof v === 'number') return v > 1 ? v / 100 : v; // 60 -> 0.6, 0.6 -> 0.6
  const s = v.trim();
  if (s.endsWith('%')) return parseFloat(s) / 100;
  const n = parseFloat(s);
  return n > 1 ? n / 100 : n;
}

/** Recompute every step from its inputs, resolving #refs to their COMPUTED (not claimed) value.
 *  Returns resolved steps with rel-error vs the claimed value. Pure + deterministic. */
export function resolveChain(chain: CalcChain, tolerance = 0.02): ResolvedStep[] {
  const byId = new Map(chain.steps.map((s) => [s.id, s]));
  const computed = new Map<string, number>();
  const out: ResolvedStep[] = [];

  const resolveInput = (inp: number | string): number => {
    if (typeof inp === 'number') return inp;
    const s = inp.trim();
    if (s.startsWith('#')) {
      const ref = s.slice(1);
      if (!computed.has(ref)) {
        // ensure dependency computed first (single forward pass assumes topological order;
        // if out of order, compute on demand)
        const dep = byId.get(ref);
        if (dep) computeStep(dep);
      }
      return computed.get(ref) ?? NaN;
    }
    return parseFloat(s);
  };

  function computeStep(step: CalcStep): number {
    if (computed.has(step.id)) return computed.get(step.id)!;
    let val: number;
    switch (step.op) {
      case 'literal':
        val = typeof step.inputs[0] === 'number' ? (step.inputs[0] as number) : parseFloat(String(step.inputs[0]));
        break;
      case 'add':
        val = step.inputs.reduce<number>((a, x) => a + resolveInput(x), 0);
        break;
      case 'subtract':
        val = step.inputs.slice(1).reduce<number>((a, x) => a - resolveInput(x), resolveInput(step.inputs[0]));
        break;
      case 'multiply':
        val = step.inputs.reduce<number>((a, x) => a * resolveInput(x), 1);
        break;
      case 'divide':
        val = step.inputs.slice(1).reduce<number>((a, x) => a / resolveInput(x), resolveInput(step.inputs[0]));
        break;
      case 'percent_of': {
        const pct = pctToFraction(step.inputs[0]);
        const base = resolveInput(step.inputs[1]);
        val = pct * base;
        break;
      }
    }
    computed.set(step.id, val);
    return val;
  }

  for (const step of chain.steps) {
    const computedValue = computeStep(step);
    const relError = Math.abs(computedValue - step.claimedValue) / Math.max(Math.abs(step.claimedValue), EPS);
    out.push({
      id: step.id,
      label: step.label,
      claimedValue: step.claimedValue,
      computedValue,
      relError,
      ok: relError <= tolerance,
    });
  }
  return out;
}
