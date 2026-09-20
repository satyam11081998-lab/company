'use client';

import { useState } from 'react';
import { ChartTooltip, compactNum, wrapLabel, type TipState } from './primitives';
import type {
  CaseVisual, QuadrantVisual, WaterfallVisual, BarVisual, LineVisual, FunnelVisual, TreeVisual, TreeNode,
} from '@/lib/results/visuals';

/**
 * Renderers for the six case-specific figure shapes (lib/results/visuals.ts).
 *
 * The model supplies DATA; every pixel is ours. Same rules as primitives.tsx:
 * --viz-* tokens only, one hue for magnitude, hit targets larger than marks,
 * nothing encoded by colour alone, recessive grid.
 */

const W = 640;

function Frame({ v, children, aspect = 0.58 }: { v: CaseVisual; children: React.ReactNode; aspect?: number }) {
  return (
    <figure className="relative m-0 rounded-xl border border-border bg-card p-5">
      <figcaption className="mb-3">
        <h4 className="text-body font-semibold text-foreground">{v.title}</h4>
        {v.caption && <p className="mt-0.5 text-small leading-relaxed text-muted-foreground">{v.caption}</p>}
      </figcaption>
      <div className="relative" style={{ aspectRatio: `1 / ${aspect}` }}>{children}</div>
      {v.unit && <p className="mt-2 text-[11px] text-muted-foreground">Figures in {v.unit}.</p>}
    </figure>
  );
}

/* ── Quadrant ─────────────────────────────────────────────────────── */

function Quadrant({ v }: { v: QuadrantVisual }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const H = 380;
  const pad = 54;
  const plot = { x: pad, y: 20, w: W - pad - 24, h: H - pad - 20 };
  const px = (x: number) => plot.x + x * plot.w;
  const py = (y: number) => plot.y + (1 - y) * plot.h;

  const corners = v.quadrantLabels;

  return (
    <Frame v={v} aspect={H / W}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
        aria-label={`${v.title}. ${v.points.map((p) => `${p.label} — ${p.recommended ? 'recommended' : 'considered'}`).join('; ')}`}>
        <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} fill="hsl(var(--muted)/0.35)" rx={6} />
        {/* Dividing lines — recessive */}
        <line x1={plot.x + plot.w / 2} y1={plot.y} x2={plot.x + plot.w / 2} y2={plot.y + plot.h}
          stroke="hsl(var(--viz-grid))" strokeWidth={1} />
        <line x1={plot.x} y1={plot.y + plot.h / 2} x2={plot.x + plot.w} y2={plot.y + plot.h / 2}
          stroke="hsl(var(--viz-grid))" strokeWidth={1} />

        {corners && (
          <>
            <text x={plot.x + 10} y={plot.y + 18} className="fill-muted-foreground/70 text-[10px] font-semibold uppercase tracking-wide">{corners[0]}</text>
            <text x={plot.x + plot.w - 10} y={plot.y + 18} textAnchor="end" className="fill-muted-foreground/70 text-[10px] font-semibold uppercase tracking-wide">{corners[1]}</text>
            <text x={plot.x + plot.w - 10} y={plot.y + plot.h - 8} textAnchor="end" className="fill-muted-foreground/70 text-[10px] font-semibold uppercase tracking-wide">{corners[2]}</text>
            <text x={plot.x + 10} y={plot.y + plot.h - 8} className="fill-muted-foreground/70 text-[10px] font-semibold uppercase tracking-wide">{corners[3]}</text>
          </>
        )}

        {v.points.map((p, i) => {
          const cx = px(p.x); const cy = py(p.y);
          return (
            <g key={i}>
              {/* The recommendation is marked by a ring AND a label suffix, never
                  by colour alone. */}
              {p.recommended && <circle cx={cx} cy={cy} r={13} fill="none" stroke="hsl(var(--viz-2))" strokeWidth={1.5} strokeDasharray="3 3" />}
              <circle cx={cx} cy={cy} r={6} fill={p.recommended ? 'hsl(var(--viz-2))' : 'hsl(var(--viz-1))'}
                stroke="hsl(var(--viz-surface))" strokeWidth={2} />
              <text x={cx} y={cy - 16} textAnchor="middle" className="fill-foreground text-[11px] font-medium">
                {p.label}{p.recommended ? ' ★' : ''}
              </text>
              <circle cx={cx} cy={cy} r={20} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTip({ x: cx, y: cy, title: p.label, lines: [p.note ?? '', p.recommended ? 'Where the case points' : ''].filter(Boolean) })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}

        {/* Axes */}
        <text x={plot.x + plot.w / 2} y={H - 14} textAnchor="middle" className="fill-foreground/70 text-[11px] font-medium">{v.xLabel} →</text>
        <text x={16} y={plot.y + plot.h / 2} textAnchor="middle" className="fill-foreground/70 text-[11px] font-medium"
          transform={`rotate(-90 16 ${plot.y + plot.h / 2})`}>{v.yLabel} →</text>
      </svg>
      <ChartTooltip tip={tip} width={W} />
    </Frame>
  );
}

/* ── Waterfall (profit bridge) ────────────────────────────────────── */

function Waterfall({ v }: { v: WaterfallVisual }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const H = 320;
  const padT = 28, padB = 60, padL = 46, padR = 12;  // padB fits a two-line x label
  const plotH = H - padT - padB;

  // Running geometry, computed up front.
  let run = 0;
  const bars = v.steps.map((s) => {
    const from = s.total ? 0 : run;
    const to = s.total ? s.value : run + s.value;
    if (!s.total) run += s.value; else run = s.value;
    return { ...s, from, to, lo: Math.min(from, to), hi: Math.max(from, to) };
  });
  const maxV = Math.max(...bars.map((b) => b.hi), 0);
  const minV = Math.min(...bars.map((b) => b.lo), 0);
  const span = maxV - minV || 1;
  const y = (val: number) => padT + plotH - ((val - minV) / span) * plotH;

  const colW = (W - padL - padR) / bars.length;
  const barW = Math.min(58, colW * 0.62);

  return (
    <Frame v={v} aspect={H / W}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
        aria-label={`${v.title}. ${bars.map((b) => `${b.label} ${b.value > 0 ? '+' : ''}${b.value}`).join(', ')}`}>
        <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="hsl(var(--viz-grid))" strokeWidth={1} />
        {bars.map((b, i) => {
          const cx = padL + colW * i + colW / 2;
          const top = y(b.hi);
          const h = Math.max(2, y(b.lo) - y(b.hi));
          // Totals get the brand slot; builds and erosions use the reserved
          // status pair, which is legible under every CVD type AND labelled.
          //
          // `>= 0` painted an exactly-zero step green and labelled it "−0".
          // A zero step is neither a build nor an erosion: neutral tone,
          // unsigned label.
          const zero = !b.total && b.value === 0;
          const fill = b.total
            ? 'hsl(var(--viz-1))'
            : zero
              ? 'hsl(var(--viz-grid))'
              : b.value > 0 ? 'hsl(var(--viz-good))' : 'hsl(var(--viz-critical))';
          return (
            <g key={i}>
              {/* 2px surface gap between adjacent fills */}
              <rect x={cx - barW / 2} y={top} width={barW} height={h} rx={4} fill={fill} />
              {i > 0 && !b.total && (
                <line x1={cx - colW / 2 - 0} y1={y(b.from)} x2={cx - barW / 2} y2={y(b.from)}
                  stroke="hsl(var(--viz-grid))" strokeWidth={1} strokeDasharray="2 2" />
              )}
              <text x={cx} y={top - 6} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                {b.total ? Math.round(b.value) : zero ? '0' : `${b.value > 0 ? '+' : '−'}${Math.abs(Math.round(b.value))}`}
              </text>
              <text x={cx} y={padT + plotH + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {wrapLabel(b.label, 12, 2).map((ln, li) => (
                  <tspan key={li} x={cx} dy={li === 0 ? 0 : 11}>{ln}</tspan>
                ))}
              </text>
              <rect x={cx - colW / 2} y={padT} width={colW} height={plotH} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTip({ x: cx, y: top, title: b.label, lines: [`${b.value > 0 ? '+' : ''}${b.value}${v.unit ? ` ${v.unit}` : ''}`, b.total ? 'Total' : `Running: ${Math.round(b.to)}`] })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} width={W} />
    </Frame>
  );
}

/* ── Bar / Funnel ─────────────────────────────────────────────────── */

function BarLike({ v }: { v: BarVisual | FunnelVisual }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const isFunnel = v.kind === 'funnel';
  const rowH = 36;
  const H = v.points.length * rowH + 16;
  const labelW = 170;
  const trackW = W - labelW - 70;
  const max = Math.max(...v.points.map((p) => Math.abs(p.value)), 1);

  return (
    <Frame v={v} aspect={H / W}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
        aria-label={`${v.title}. ${v.points.map((p) => `${p.label}: ${p.value}`).join(', ')}`}>
        {v.points.map((p, i) => {
          const w = Math.max(3, (Math.abs(p.value) / max) * trackW);
          const yTop = i * rowH + 12;
          // Funnel: one hue, darkening down the steps (magnitude). Bar: single
          // brand hue — these are one series, so no categorical assignment.
          const fill = isFunnel
            ? ['hsl(var(--viz-seq-5))', 'hsl(var(--viz-seq-4))', 'hsl(var(--viz-seq-3))', 'hsl(var(--viz-seq-2))', 'hsl(var(--viz-seq-2))'][Math.min(i, 4)]
            : 'hsl(var(--viz-1))';
          const prev = i > 0 ? v.points[i - 1].value : null;
          const drop = prev && prev !== 0 ? Math.round((p.value / prev) * 100) : null;
          // Compact (50Cr / 42L), because the full form ran past the right edge
          // on the top funnel step — which is always the biggest number and so
          // always the one that got clipped.
          const valueText = `${compactNum(p.value)}${isFunnel && drop !== null ? ` (${drop}%)` : ''}`;
          // ~6px per character at 11px. When the label cannot fit in the gutter,
          // put it INSIDE the bar rather than letting it overflow.
          const needed = valueText.length * 6 + 10;
          const inside = labelW + w + needed > W;
          return (
            <g key={i}>
              <text x={0} y={yTop + 12} className="fill-foreground/80 text-[11px] font-medium">
                {p.label.length > 24 ? `${p.label.slice(0, 23)}…` : p.label}
              </text>
              <rect x={labelW} y={yTop + 2} width={w} height={14} rx={4} fill={fill} />
              <text x={inside ? labelW + w - 8 : labelW + w + 8} y={yTop + 13}
                textAnchor={inside ? 'end' : 'start'}
                className={`text-[11px] font-semibold ${inside ? 'fill-white' : 'fill-foreground'}`}>
                {compactNum(p.value)}
                {isFunnel && drop !== null && (
                  <tspan className={inside ? 'fill-white/80 font-normal' : 'fill-muted-foreground font-normal'}> ({drop}%)</tspan>
                )}
              </text>
              <rect x={0} y={yTop} width={W} height={rowH - 4} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTip({ x: labelW + w, y: yTop + 9, title: p.label, lines: [`${p.value.toLocaleString()}${v.unit ? ` ${v.unit}` : ''}`, isFunnel && drop !== null ? `${drop}% of the previous step` : ''].filter(Boolean) })}
                onMouseLeave={() => setTip(null)} />
            </g>
          );
        })}
      </svg>
      <ChartTooltip tip={tip} width={W} />
    </Frame>
  );
}

/* ── Line ─────────────────────────────────────────────────────────── */

function LineChart({ v }: { v: LineVisual }) {
  const [tip, setTip] = useState<TipState | null>(null);
  const H = 280;
  const padL = 52, padR = 18, padT = 20, padB = 42;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const vals = v.points.map((p) => p.value);
  // The floor includes 0 so a revenue-style series is read against zero, but
  // the ceiling must include it too — otherwise an all-NEGATIVE series puts the
  // baseline outside the plotted range. And when every value is identical
  // (a flat series, or all zeroes) max === min, both axis labels land on the
  // same pixel and the line sits on the frame; nudge the ceiling so the series
  // is drawn inside the plot.
  const rawMax = Math.max(...vals, 0);
  const min = Math.min(...vals, 0);
  const max = rawMax === min ? min + 1 : rawMax;
  const span = max - min || 1;
  const x = (i: number) => padL + (v.points.length === 1 ? plotW / 2 : (i / (v.points.length - 1)) * plotW);
  const y = (val: number) => padT + plotH - ((val - min) / span) * plotH;
  const d = v.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');

  return (
    <Frame v={v} aspect={H / W}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
        aria-label={`${v.title}. ${v.points.map((p) => `${p.label}: ${p.value}`).join(', ')}`}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={padL} y1={padT + plotH * t} x2={W - padR} y2={padT + plotH * t}
            stroke="hsl(var(--viz-grid))" strokeWidth={1} />
        ))}
        <path d={d} fill="none" stroke="hsl(var(--viz-1))" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {v.points.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.value)} r={4.5} fill="hsl(var(--viz-1))" stroke="hsl(var(--viz-surface))" strokeWidth={2} />
            <text x={x(i)} y={H - 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {p.label.length > 10 ? `${p.label.slice(0, 9)}…` : p.label}
            </text>
            <circle cx={x(i)} cy={y(p.value)} r={18} fill="transparent" className="cursor-pointer"
              onMouseEnter={() => setTip({ x: x(i), y: y(p.value), title: p.label, lines: [`${p.value.toLocaleString()}${v.unit ? ` ${v.unit}` : ''}`] })}
              onMouseLeave={() => setTip(null)} />
          </g>
        ))}
        {/* Only the extremes are labelled — a number on every point is noise. */}
        <text x={padL - 8} y={y(max) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{compactNum(Math.round(max))}</text>
        <text x={padL - 8} y={y(min) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{compactNum(Math.round(min))}</text>
      </svg>
      <ChartTooltip tip={tip} width={W} />
    </Frame>
  );
}

/* ── Driver tree ──────────────────────────────────────────────────── */

function TreeBranch({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <li className="relative">
      <div className={`inline-flex items-baseline gap-2 rounded-lg border px-3 py-1.5 ${
        depth === 0 ? 'border-viz-1/40 bg-viz-1/5' : 'border-border bg-card'
      }`}>
        <span className={`text-small ${depth === 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground/85'}`}>{node.label}</span>
        {node.value && <span className="text-[11px] tabular-nums text-muted-foreground">{node.value}</span>}
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="mt-2 space-y-2 border-l border-border pl-4">
          {node.children.map((c, i) => <TreeBranch key={i} node={c} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );
}

function DriverTree({ v }: { v: TreeVisual }) {
  return (
    <figure className="relative m-0 rounded-xl border border-border bg-card p-5">
      <figcaption className="mb-3">
        <h4 className="text-body font-semibold text-foreground">{v.title}</h4>
        {v.caption && <p className="mt-0.5 text-small leading-relaxed text-muted-foreground">{v.caption}</p>}
      </figcaption>
      {/* A tree is structure, not magnitude — boxes and rules read better than
          any plotted encoding, and they stay legible on a phone. */}
      <ul className="space-y-2"><TreeBranch node={v.root} /></ul>
    </figure>
  );
}

/* ── Entry point ──────────────────────────────────────────────────── */

export default function CaseVisuals({ visuals }: { visuals: CaseVisual[] }) {
  if (!visuals.length) return null;
  return (
    <div className="space-y-5">
      {visuals.map((v, i) => {
        switch (v.kind) {
          case 'quadrant': return <Quadrant key={i} v={v} />;
          case 'waterfall': return <Waterfall key={i} v={v} />;
          case 'bar':
          case 'funnel': return <BarLike key={i} v={v} />;
          case 'line': return <LineChart key={i} v={v} />;
          case 'tree': return <DriverTree key={i} v={v} />;
          default: return null;
        }
      })}
    </div>
  );
}
