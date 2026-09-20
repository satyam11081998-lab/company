'use client';

import { useId, useState } from 'react';

/**
 * Chart primitives for the solution view.
 *
 * Hand-rolled SVG rather than recharts (which is in the bundle for other
 * screens): these are four specific, opinionated figures, and the time spent
 * fighting a generic library's defaults into this design system exceeds the
 * time to draw them. It also keeps the results route free of a ~100kb chart
 * runtime it would otherwise pull in for a handful of marks.
 *
 * Shared rules, applied everywhere below (see globals.css --viz-*):
 *   • colour comes from the validated --viz-* tokens, never raw hex, so both
 *     light and dark are correct and CVD-separable;
 *   • magnitude uses the SEQUENTIAL ramp or one hue — the categorical slots are
 *     for identity only;
 *   • every mark has a hover target larger than the mark itself;
 *   • text wears text tokens, never the series colour;
 *   • grid and axes are recessive; data ends are rounded 4px to the baseline;
 *   • nothing is encoded by colour alone — every figure is also labelled.
 */

/* ── Shared helpers ───────────────────────────────────────────────── */

/**
 * Break a label into at most `maxLines` lines of roughly `perLine` characters,
 * on word boundaries. The last line is ellipsised only if the label genuinely
 * cannot fit — truncation is the fallback, not the first move.
 */
export function wrapLabel(text: string, perLine = 13, maxLines = 2): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= perLine || !cur) { cur = next; }
    else { lines.push(cur); cur = w; if (lines.length === maxLines) break; }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    const used = lines.join(' ').length;
    if (used < text.length - 1) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.length > perLine - 1 ? `${last.slice(0, perLine - 1)}\u2026` : `${last}\u2026`;
    }
  }
  // A single token longer than the line can never be split on a space, so the
  // loop above emits it whole and the ellipsis branch never runs (it only
  // fires at maxLines). One 30-character word then paints straight across its
  // neighbours — the exact clipping the wrapping was added to stop. Hard-cut
  // every line as a last resort.
  const cut = lines.map((l) => (l.length > perLine + 1 ? `${l.slice(0, perLine)}\u2026` : l));
  return cut.length ? cut : [text];
}

/**
 * Compact number formatting in the INDIAN system — 50Cr, 42L — because that is
 * how this audience reads magnitudes, and because the full form ("500,000,000")
 * is what pushed value labels off the right edge of the funnel.
 */
export function compactNum(n: number): string {
  try {
    return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return n.toLocaleString();
  }
}

/* ── Tooltip ──────────────────────────────────────────────────────── */

export interface TipState {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

export function ChartTooltip({ tip, width }: { tip: TipState | null; width: number }) {
  if (!tip) return null;
  // Flip the tooltip to the left near the right edge so it never clips.
  const flip = tip.x > width * 0.62;
  return (
    <div
      className="pointer-events-none absolute z-20 w-max max-w-[220px] rounded-lg border border-border bg-popover px-2.5 py-1.5 shadow-lg"
      style={{
        left: `${(tip.x / width) * 100}%`,
        top: tip.y,
        transform: `translate(${flip ? '-100%' : '0'}, -50%) translateX(${flip ? -8 : 8}px)`,
      }}
    >
      <p className="text-[11px] font-semibold text-foreground">{tip.title}</p>
      {tip.lines.map((l, i) => (
        <p key={i} className="text-[11px] leading-snug text-muted-foreground">
          {l}
        </p>
      ))}
    </div>
  );
}

/* ── Score radar ──────────────────────────────────────────────────── */

export interface RadarDatum {
  label: string;
  /** A one-word name for the axis spoke. Falls back to `label`. The full name
   *  still appears in the tooltip, so nothing is lost by shortening here. */
  short?: string;
  /** 0..1 — already normalised against the dimension's own maximum. */
  value: number;
  /** Raw display values, e.g. "18 / 25". */
  detail: string;
}

/**
 * A closed polygon over N normalised axes — the shape of a performance, read
 * at a glance: an even hexagon is a balanced candidate, a spike is a lopsided
 * one. The benchmark ring behind it is what turns "72" from a number into a
 * judgement.
 *
 * Deliberately NOT a stack of six progress bars: the question this answers is
 * "what shape am I", which is a comparison ACROSS dimensions, and bars force
 * the eye to do that comparison one pair at a time.
 */
export function ScoreRadar({
  data,
  benchmark = 0.75,
  benchmarkLabel = 'Strong candidate',
  size = 300,
}: {
  data: RadarDatum[];
  benchmark?: number;
  benchmarkLabel?: string;
  size?: number;
}) {
  const [tip, setTip] = useState<TipState | null>(null);
  const uid = useId();
  const n = data.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  // Leave room for the axis labels outside the plot. This was 52 and the
  // longest dimension names ("Synthesis & Communication", "Professional Tone")
  // ran straight off the viewBox and rendered clipped — "onal Tone". The plot
  // gives up radius so the labels never do.
  const r = size / 2 - 74;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, frac: number) => ({
    x: cx + Math.cos(angle(i)) * r * frac,
    y: cy + Math.sin(angle(i)) * r * frac,
  });
  const poly = (frac: (i: number) => number) =>
    data.map((_, i) => { const p = pt(i, frac(i)); return `${p.x},${p.y}`; }).join(' ');

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <figure className="relative m-0">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img"
        aria-label={`Score by dimension: ${data.map((d) => `${d.label} ${d.detail}`).join(', ')}`}>
        {/* Recessive grid */}
        {rings.map((ring) => (
          <polygon key={ring} points={poly(() => ring)} fill="none"
            stroke="hsl(var(--viz-grid))" strokeWidth={1} />
        ))}
        {data.map((_, i) => {
          const p = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--viz-grid))" strokeWidth={1} />;
        })}

        {/* Benchmark ring — dashed so it never competes with the data shape */}
        <polygon points={poly(() => benchmark)} fill="none" stroke="hsl(var(--muted-foreground))"
          strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7} />

        {/* The candidate's shape */}
        <polygon points={poly((i) => Math.max(0.02, data[i].value))}
          fill="hsl(var(--viz-1) / 0.18)" stroke="hsl(var(--viz-1))" strokeWidth={2}
          strokeLinejoin="round" />

        {/* Vertices: >=8px markers, with a surface ring so overlaps stay legible */}
        {data.map((d, i) => {
          const p = pt(i, Math.max(0.02, d.value));
          return (
            <g key={`v-${i}`}>
              <circle cx={p.x} cy={p.y} r={4.5} fill="hsl(var(--viz-1))"
                stroke="hsl(var(--viz-surface))" strokeWidth={2} />
              {/* Hit target larger than the mark */}
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTip({ x: p.x, y: p.y, title: d.label, lines: [d.detail, `${Math.round(d.value * 100)}% of the marks available`] })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}

        {/* Axis labels — text tokens, never the series colour. Wrapped to at
            most two short lines rather than truncated: these are rubric names
            and a clipped one ("Quantitat…") tells the reader nothing. */}
        {data.map((d, i) => {
          const p = pt(i, 1.14);
          const a = angle(i);
          const anchor = Math.abs(Math.cos(a)) < 0.35 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
          const lines = wrapLabel(d.short || d.label, 12, 2);
          const dy = -((lines.length - 1) * 5.5);
          return (
            <text key={`l-${i}`} x={p.x} y={p.y + dy} textAnchor={anchor} dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] font-medium" id={`${uid}-${i}`}>
              {lines.map((ln, li) => (
                <tspan key={li} x={p.x} dy={li === 0 ? 0 : 11}>{ln}</tspan>
              ))}
            </text>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} width={size} />
      <figcaption className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--viz-1))' }} aria-hidden />
          You
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0 w-3.5 border-t border-dashed border-muted-foreground" aria-hidden />
          {benchmarkLabel}
        </span>
      </figcaption>
    </figure>
  );
}

/* ── Points bridge (waterfall) ────────────────────────────────────── */

export interface BridgeStep {
  label: string;
  /** Marks dropped on this dimension — always a positive number. */
  lost: number;
  /** Marks available on this dimension. */
  available: number;
}

/**
 * Where the marks went: a waterfall from 100 down to the awarded score.
 *
 * This is the single most useful figure on the page, because it answers the
 * question people actually arrive with — "why isn't this higher?" — in
 * priority order. A bar chart of scores cannot: a 6/10 and a 15/25 look
 * similar as bars but cost 4 and 10 marks respectively, and it is the COST
 * that tells you what to work on next.
 *
 * One hue (magnitude, not identity), darkest at the largest loss.
 */
export function PointsBridge({
  steps,
  total = 100,
  finalScore,
  height = 210,
}: {
  steps: BridgeStep[];
  total?: number;
  finalScore: number;
  height?: number;
}) {
  const [tip, setTip] = useState<TipState | null>(null);
  const W = 640;
  const padL = 8;
  const padR = 8;
  const padT = 26;
  const padB = 46;
  const plotH = height - padT - padB;

  // Order by cost — the most expensive gap first is the whole point.
  const ordered = [...steps].filter((s) => s.lost > 0.5).sort((a, b) => b.lost - a.lost);

  // RECONCILIATION. The bars must add up, or the figure is lying.
  // Two things can make them not add up: sub-0.5 losses dropped by the filter
  // above, and — the real one — a `score` that is not the sum of `breakdown`,
  // which happens whenever the arithmetic backstop caps a guesstimate total.
  // Without this bar the chart walks 100 down to 74 and then draws a final bar
  // at 60, a 14-mark cliff with nothing explaining it, on the figure this file
  // calls the most useful on the page.
  const droppedLosses = steps.reduce((a, s) => a + (s.lost > 0.5 ? 0 : Math.max(0, s.lost)), 0);
  const explained = ordered.reduce((a, s) => a + s.lost, 0) + droppedLosses;
  const unexplained = total - explained - finalScore;
  const y = (v: number) => padT + plotH - (v / total) * plotH;
  const maxLoss = Math.max(1, ...ordered.map((s) => s.lost));

  // Geometry is computed up front rather than by mutating a running total
  // inside the render map — under React's double-invoked render that would
  // drift the floating bars down the chart on every second paint.
  type Bar = { kind: 'total' | 'loss' | 'final'; label: string; value: number; available?: number; top: number; h: number; fill: string; text: string };
  const bars: Bar[] = [];
  bars.push({ kind: 'total', label: 'Available', value: total, top: y(total), h: plotH, fill: 'hsl(var(--viz-seq-2))', text: String(total) });
  let running = total;
  for (const s of ordered) {
    const from = running;
    running -= s.lost;
    const t = s.lost / maxLoss;
    bars.push({
      kind: 'loss', label: s.label, value: s.lost, available: s.available,
      top: y(from), h: Math.max(2, (s.lost / total) * plotH),
      fill: t > 0.75 ? 'hsl(var(--viz-seq-5))' : t > 0.5 ? 'hsl(var(--viz-seq-4))' : t > 0.25 ? 'hsl(var(--viz-seq-3))' : 'hsl(var(--viz-seq-2))',
      text: `−${Math.round(s.lost)}`,
    });
  }
  // Everything the per-dimension bars do not explain, named honestly.
  if (Math.abs(unexplained) >= 0.5 || droppedLosses >= 0.5) {
    const amount = unexplained + droppedLosses * 0;
    const frm = running;
    running -= amount;
    bars.push({
      kind: 'loss',
      label: amount >= 0 ? 'Adjustment' : 'Credit',
      value: Math.abs(amount),
      available: total,
      top: y(Math.max(frm, running)),
      h: Math.max(2, (Math.abs(amount) / total) * plotH),
      fill: 'hsl(var(--viz-3))',
      text: `${amount >= 0 ? '\u2212' : '+'}${Math.round(Math.abs(amount))}`,
    });
  }
  bars.push({ kind: 'final', label: 'Your score', value: finalScore, top: y(finalScore), h: (Math.max(0, finalScore) / total) * plotH, fill: 'hsl(var(--viz-1))', text: String(Math.round(finalScore)) });

  const colW = (W - padL - padR) / bars.length;
  const barW = Math.min(64, colW * 0.6);

  return (
    <figure className="relative m-0">
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="img"
        aria-label={`From ${total} available marks down to ${finalScore}. ${ordered.map((s) => `${s.label} cost ${Math.round(s.lost)}`).join('; ')}.`}>
        {/* Baseline only — a full grid would be noise on eight bars */}
        <line x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH}
          stroke="hsl(var(--viz-grid))" strokeWidth={1} />

        {bars.map((b, i) => {
          const cxCol = padL + colW * i + colW / 2;
          const x = cxCol - barW / 2;
          const { top, h, fill } = b;

          return (
            <g key={i}>
              <rect x={x} y={top} width={barW} height={h} rx={4} fill={fill} />
              {/* Direct label: selective — every bar here is meaningful */}
              <text x={cxCol} y={top - 6} textAnchor="middle"
                className="fill-foreground text-[11px] font-semibold">{b.text}</text>
              {/* Axis label, wrapped to two lines (shared helper) */}
              {wrapLabel(b.label, 12, 2).map((line, li) => (
                <text key={li} x={cxCol} y={padT + plotH + 14 + li * 11} textAnchor="middle"
                  className="fill-muted-foreground text-[10px]">{line}</text>
              ))}
              <rect x={cxCol - colW / 2} y={padT} width={colW} height={plotH} fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setTip({
                  x: cxCol, y: top,
                  title: b.label,
                  lines: b.kind === 'loss'
                    ? [`${Math.round(b.value)} marks dropped`, `out of ${Math.round(b.available ?? 0)} available here`]
                    : b.kind === 'total' ? ['Marks available across all dimensions'] : [`${Math.round(finalScore)} of ${total} awarded`],
                })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} width={W} />
    </figure>
  );
}

/* ── Dimension bars ───────────────────────────────────────────────── */

export interface DimBar {
  label: string;
  earned: number;
  available: number;
}

/**
 * Marks earned against marks available, one row per dimension. Paired with the
 * bridge above: the bridge ranks the COST of each gap, this shows the
 * PROPORTION — a dimension can be nearly perfect and still be the top of the
 * bridge simply because it carries the most weight, and seeing both stops that
 * from reading as a contradiction.
 */
export function DimensionBars({ data }: { data: DimBar[] }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const W = 640;
  const rowH = 34;
  const labelW = 190;
  const H = data.length * rowH + 8;
  const trackW = W - labelW - 56;

  return (
    <figure className="relative m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
        aria-label={data.map((d) => `${d.label}: ${d.earned} of ${d.available}`).join('. ')}>
        {data.map((d, i) => {
          const pct = d.available ? Math.max(0, Math.min(1, d.earned / d.available)) : 0;
          const yTop = i * rowH + 8;
          const fill = pct >= 0.75 ? 'hsl(var(--viz-good))' : pct >= 0.5 ? 'hsl(var(--viz-4))' : 'hsl(var(--viz-critical))';
          return (
            <g key={d.label}>
              <text x={0} y={yTop + 11} className="fill-foreground/80 text-[11px] font-medium">
                {d.label.length > 26 ? `${d.label.slice(0, 25)}…` : d.label}
              </text>
              {/* Track */}
              <rect x={labelW} y={yTop + 2} width={trackW} height={12} rx={4} fill="hsl(var(--muted))" />
              {/* Fill — rounded end anchored to the baseline */}
              <rect x={labelW} y={yTop + 2} width={Math.max(3, trackW * pct)} height={12} rx={4} fill={fill} />
              <text x={labelW + trackW + 8} y={yTop + 12} className="fill-foreground text-[11px] font-semibold">
                {Math.round(d.earned)}<tspan className="fill-muted-foreground font-normal">/{d.available}</tspan>
              </text>
              <rect x={0} y={yTop} width={W} height={rowH - 4} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTip({ x: labelW + trackW * pct, y: yTop + 8, title: d.label, lines: [`${Math.round(d.earned)} of ${d.available} marks`, `${Math.round(pct * 100)}%`] })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} width={W} />
      {/* Status colour is never alone — say what the bands mean. */}
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--viz-good))' }} aria-hidden />Solid (75%+)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--viz-4))' }} aria-hidden />Patchy (50–74%)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--viz-critical))' }} aria-hidden />Weak (under 50%)</span>
      </figcaption>
    </figure>
  );
}
