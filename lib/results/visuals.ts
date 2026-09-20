/**
 * The `visuals` contract — case-specific figures the scorer may attach to a
 * submission's `feedback_json`.
 *
 * ── Why a typed contract and not free-form ──────────────────────────────
 * The score dimensions are the same for every case, so the scorecard figures
 * (radar, points bridge) can be drawn from data that always exists. The
 * figures people actually ask for — a profit bridge, a market-entry quadrant,
 * a driver tree — are about the CASE, and nothing in the current scoring
 * output describes a case's economics in a machine-readable way.
 *
 * Rather than have the model emit chart code or an image (unreviewable,
 * unstyleable, and a prompt-injection surface that renders), it emits DATA
 * against these six shapes. The app owns every pixel: our palette, our dark
 * mode, our accessibility rules. A model that hallucinates simply produces a
 * wrong number in a correct chart, which a reader can see and argue with —
 * not a broken page.
 *
 * Every field is optional and every consumer must tolerate absence: the whole
 * point is that submissions scored before this existed keep rendering exactly
 * as they did. `parseVisuals` below is the only way in, and it drops anything
 * malformed rather than throwing — a bad figure must never take down a
 * results page the user is entitled to see.
 */

export type VisualKind = 'quadrant' | 'waterfall' | 'bar' | 'line' | 'funnel' | 'tree';

export interface QuadrantPoint {
  label: string;
  /** 0..1 along each axis. */
  x: number;
  y: number;
  /** Marks the option the case actually points to. */
  recommended?: boolean;
  note?: string;
}

export interface WaterfallStep {
  label: string;
  /** Signed: positive builds, negative erodes. The final bar may be a total. */
  value: number;
  /** True for a subtotal/total bar drawn from the baseline. */
  total?: boolean;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface TreeNode {
  label: string;
  value?: string;
  children?: TreeNode[];
}

export interface BaseVisual {
  kind: VisualKind;
  title: string;
  /** One sentence saying what the figure shows — rendered as the caption. */
  caption?: string;
  /** Units for the value axis, e.g. "₹ crore", "%", "users". */
  unit?: string;
}

export interface QuadrantVisual extends BaseVisual {
  kind: 'quadrant';
  xLabel: string;
  yLabel: string;
  /** Optional corner names, clockwise from top-left. */
  quadrantLabels?: [string, string, string, string];
  points: QuadrantPoint[];
}

export interface WaterfallVisual extends BaseVisual { kind: 'waterfall'; steps: WaterfallStep[]; }
export interface BarVisual extends BaseVisual { kind: 'bar'; points: SeriesPoint[]; }
export interface LineVisual extends BaseVisual { kind: 'line'; points: SeriesPoint[]; }
export interface FunnelVisual extends BaseVisual { kind: 'funnel'; points: SeriesPoint[]; }
export interface TreeVisual extends BaseVisual { kind: 'tree'; root: TreeNode; }

export type CaseVisual =
  | QuadrantVisual | WaterfallVisual | BarVisual | LineVisual | FunnelVisual | TreeVisual;

/* ── Parsing ──────────────────────────────────────────────────────── */

/**
 * Largest magnitude a figure value may carry. Rupee market sizes reach ~1e14
 * (lakh crore in rupees); beyond 1e15 the number is not a business figure, it
 * is a model that has lost the plot, and it renders as exponent notation in a
 * chart captioned "Rs crore".
 */
const MAX_MAGNITUDE = 1e15;

const num = (v: unknown): number | null => {
  // `typeof true === 'boolean'`, but Number(true) === 1 — so a boolean would
  // otherwise slip through as a data point worth 1.
  if (typeof v === 'boolean') return null;
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  if (!Number.isFinite(n)) return null;
  return Math.abs(n) <= MAX_MAGNITUDE ? n : null;
};
const str = (v: unknown, max = 120): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

function parseSeries(raw: unknown, max = 12): SeriesPoint[] {
  if (!Array.isArray(raw)) return [];
  const out: SeriesPoint[] = [];
  for (const r of raw) {
    const label = str((r as any)?.label ?? (r as any)?.name, 40);
    const value = num((r as any)?.value);
    if (label && value !== null) out.push({ label, value });
    if (out.length >= max) break;
  }
  return out;
}

function parseTree(raw: unknown, depth = 0): TreeNode | null {
  if (!raw || typeof raw !== 'object' || depth > 3) return null;
  const label = str((raw as any).label ?? (raw as any).name, 60);
  if (!label) return null;
  const kids = Array.isArray((raw as any).children)
    ? ((raw as any).children as unknown[])
        .slice(0, 5)
        .map((c) => parseTree(c, depth + 1))
        .filter((c): c is TreeNode => !!c)
    : undefined;
  return { label, value: str((raw as any).value, 30) ?? undefined, children: kids?.length ? kids : undefined };
}

/**
 * Turn whatever is on `feedback_json.visuals` into figures we are willing to
 * draw. Anything unrecognised, empty or malformed is DROPPED, not repaired
 * and not thrown on: a results page must render for a user whose score is
 * real even if the optional garnish is broken.
 */
export function parseVisuals(raw: unknown): CaseVisual[] {
  if (!Array.isArray(raw)) return [];
  const out: CaseVisual[] = [];

  for (const item of raw.slice(0, 6)) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const kind = str(o.kind, 20) as VisualKind | null;
    const title = str(o.title, 90);
    if (!kind || !title) continue;
    const base = { title, caption: str(o.caption, 200) ?? undefined, unit: str(o.unit, 20) ?? undefined };

    if (kind === 'quadrant') {
      const pts: QuadrantPoint[] = [];
      for (const p of Array.isArray(o.points) ? o.points.slice(0, 8) : []) {
        const label = str((p as any)?.label, 40);
        const x = num((p as any)?.x);
        const y = num((p as any)?.y);
        if (label && x !== null && y !== null) {
          pts.push({
            label, x: clamp01(x), y: clamp01(y),
            recommended: (p as any)?.recommended === true,
            note: str((p as any)?.note, 90) ?? undefined,
          });
        }
      }
      const xLabel = str(o.xLabel ?? o.x_label, 40);
      const yLabel = str(o.yLabel ?? o.y_label, 40);
      if (pts.length >= 2 && xLabel && yLabel) {
        const ql = Array.isArray(o.quadrantLabels ?? o.quadrant_labels)
          ? ((o.quadrantLabels ?? o.quadrant_labels) as unknown[]).map((q) => str(q, 28) ?? '')
          : null;
        out.push({
          ...base, kind: 'quadrant', xLabel, yLabel, points: pts,
          quadrantLabels: ql && ql.length === 4 ? (ql as [string, string, string, string]) : undefined,
        });
      }
      continue;
    }

    if (kind === 'waterfall') {
      const steps: WaterfallStep[] = [];
      for (const st of Array.isArray(o.steps) ? o.steps.slice(0, 10) : []) {
        const label = str((st as any)?.label, 30);
        const value = num((st as any)?.value);
        if (label && value !== null) steps.push({ label, value, total: (st as any)?.total === true });
      }
      if (steps.length >= 2) out.push({ ...base, kind: 'waterfall', steps });
      continue;
    }

    if (kind === 'bar' || kind === 'line' || kind === 'funnel') {
      const points = parseSeries(o.points ?? o.data);
      const min = kind === 'funnel' ? 2 : 2;
      if (points.length >= min) out.push({ ...base, kind, points } as CaseVisual);
      continue;
    }

    if (kind === 'tree') {
      const root = parseTree(o.root ?? o.tree);
      if (root?.children?.length) out.push({ ...base, kind: 'tree', root });
      continue;
    }
  }

  return out;
}
