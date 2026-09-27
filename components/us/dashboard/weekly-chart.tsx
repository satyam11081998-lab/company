'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { US_CARD } from '@/components/us/ui';
import type { UsWeek } from '@/lib/us-market/dashboard';

/**
 * "Your progress" — sessions per week, as a line with a value axis. The
 * viewer picks the window (4, 8 or 12 weeks); hovering a week shows its
 * count, otherwise the callout sits on this week. The same numbers are in a
 * visually hidden table for screen readers.
 */

const RANGES = [4, 8, 12] as const;
type Range = (typeof RANGES)[number];

function niceStep(max: number): number {
  const raw = Math.max(1, max) / 3;
  for (const s of [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]) if (s >= raw) return s;
  return Math.ceil(raw / 100) * 100;
}

export default function WeeklyChart({
  weeks,
  defaultRange = 8,
  selectable = true,
  className = '',
}: {
  weeks: UsWeek[];
  defaultRange?: Range;
  selectable?: boolean;
  className?: string;
}) {
  const [range, setRange] = useState<Range>(defaultRange);
  const [hover, setHover] = useState<number | null>(null);
  const uid = useId().replace(/:/g, '');
  const shown = weeks.slice(-range);
  const totals = shown.map((w) => w.cases + w.sizing);
  const all = weeks.reduce((a, w) => a + w.cases + w.sizing, 0);

  const step = niceStep(Math.max(...totals, 3));
  const top = step * 3;
  const W = 560;
  const H = 210;
  const L = 34; // y-axis gutter
  const T = 16;
  const B = 30; // x-axis gutter
  const R = 12;
  const plotW = W - L - R;
  const plotH = H - T - B;
  const x = (i: number) => L + (shown.length === 1 ? plotW / 2 : (i * plotW) / (shown.length - 1));
  const y = (v: number) => T + plotH * (1 - v / top);
  const pts = totals.map((t, i) => [x(i), y(t)] as const);
  const line = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const area = `${line} L${x(shown.length - 1).toFixed(1)},${T + plotH} L${L},${T + plotH} Z`;
  const active = hover ?? shown.length - 1;
  const [ax, ay] = pts[active];
  const activeLabel =
    active === shown.length - 1 ? `${totals[active]} this week` : `${totals[active]} · week of ${shown[active].label}`;
  const boxW = Math.max(92, activeLabel.length * 7 + 22);
  const boxX = Math.min(Math.max(ax - boxW / 2, L), W - R - boxW);
  const boxY = ay - 46 < 0 ? ay + 14 : ay - 46;
  const labelEvery = shown.length > 8 ? 2 : 1;

  return (
    <section aria-labelledby={`${uid}-title`} className={`${US_CARD} p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={`${uid}-title`} className="font-display text-[19px] font-semibold leading-tight text-foreground">Your progress</h2>
          <p className="mt-1 text-[13px] text-muted-foreground">Sessions per week over the last {range} weeks.</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2.5">
          <Link href="/history" className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
            All sessions <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </Link>
          {selectable && all > 0 && (
            <label className="relative inline-flex items-center">
              <span className="sr-only">Weeks shown</span>
              <select
                value={range}
                onChange={(e) => {
                  setHover(null);
                  setRange(Number(e.target.value) as Range);
                }}
                className="h-8 appearance-none rounded-[8px] border border-border bg-card pl-3 pr-8 text-[12.5px] font-medium text-foreground shadow-[0_1px_2px_rgba(15,28,51,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r} weeks
                  </option>
                ))}
              </select>
              <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground">
                <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
          )}
        </div>
      </div>

      {all === 0 ? (
        <p className="mt-6 rounded-[12px] border border-dashed border-border px-4 py-12 text-center text-[13px] text-muted-foreground">
          Your first session starts this chart.
        </p>
      ) : (
        <figure className="mt-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Sessions per week for the last ${range} weeks; ${totals[totals.length - 1]} this week`}
            className="h-auto w-full overflow-visible"
            onMouseLeave={() => setHover(null)}
          >
            <defs>
              <linearGradient id={`${uid}-fill`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C8102E" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((k) => {
              const v = k * step;
              const yy = y(v);
              return (
                <g key={k}>
                  <line x1={L} x2={W - R} y1={yy} y2={yy} className="stroke-border" strokeDasharray={k === 0 ? undefined : '3 5'} />
                  <text x={L - 10} y={yy + 4} textAnchor="end" className="fill-muted-foreground tnum" style={{ fontSize: 11 }}>
                    {v}
                  </text>
                </g>
              );
            })}
            <path d={area} fill={`url(#${uid}-fill)`} />
            <path d={line} fill="none" className="stroke-primary" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
            {hover != null && <line x1={ax} x2={ax} y1={T} y2={T + plotH} className="stroke-foreground/15" />}
            {pts.map(([px, py], i) => (
              <g key={shown[i].start}>
                <circle
                  cx={px}
                  cy={py}
                  r={i === active ? 5 : 3.5}
                  className={i === active ? 'fill-primary' : 'fill-card stroke-primary'}
                  strokeWidth="2"
                />
                <rect
                  x={px - plotW / (shown.length * 2)}
                  y={T}
                  width={plotW / shown.length}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                />
              </g>
            ))}
            <g transform={`translate(${boxX}, ${boxY})`} style={{ filter: 'drop-shadow(0 6px 12px rgba(15,28,51,0.12))' }} pointerEvents="none">
              <rect width={boxW} height="30" rx="8" className="fill-card stroke-border" />
              <text x={boxW / 2} y="19.5" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
                {activeLabel}
              </text>
            </g>
            {shown.map((w, i) =>
              (shown.length - 1 - i) % labelEvery === 0 ? (
                <text
                  key={w.start}
                  x={x(i)}
                  y={H - 8}
                  textAnchor={i === shown.length - 1 ? 'end' : 'middle'}
                  className={i === shown.length - 1 ? 'fill-foreground' : 'fill-muted-foreground'}
                  style={{ fontSize: 11.5, fontWeight: i === shown.length - 1 ? 600 : 400 }}
                >
                  {i === shown.length - 1 ? 'This week' : w.label}
                </text>
              ) : null,
            )}
          </svg>
          <table className="sr-only">
            <caption>Sessions per week</caption>
            <thead>
              <tr>
                <th scope="col">Week starting</th>
                <th scope="col">Cases</th>
                <th scope="col">Market sizing</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((w) => (
                <tr key={w.start}>
                  <td>{w.label}</td>
                  <td>{w.cases}</td>
                  <td>{w.sizing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      )}
    </section>
  );
}
