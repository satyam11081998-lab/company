'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { US_CARD, usButton } from '@/components/us/ui';
import { lowerLabel, type UsTypeStat } from '@/lib/us-market/dashboard';

/**
 * YOUR SKILL MAP — the nine US case types plus market sizing, drawn as the
 * network they really are (profitability leads into pricing and cost work,
 * market entry leans on market sizing, and so on). Every state comes from the
 * user's own scored sessions:
 *
 *   Mastered     2+ sessions and an average of 80+
 *   In progress  practiced, not yet mastered
 *   Next         the type "What to do next" recommends
 *   Not started  never practiced
 *
 * States are carried by shape and text as well as colour (check mark, score,
 * dashed ring, "NEXT" label). Nodes are real <button>s laid over the SVG, so
 * the map is keyboard- and screen-reader-usable; phones get a plain list.
 */

type State = 'mastered' | 'progress' | 'next' | 'new';

const LAYOUT: Record<string, { x: number; y: number }> = {
  profitability: { x: 62, y: 60 },
  growth: { x: 230, y: 52 },
  'm&a': { x: 388, y: 60 },
  pricing: { x: 138, y: 150 },
  'market entry': { x: 305, y: 146 },
  'cost reduction': { x: 50, y: 218 },
  'go to market': { x: 192, y: 236 },
  'competitive strategy': { x: 388, y: 218 },
  operations: { x: 98, y: 292 },
  guesstimate: { x: 292, y: 282 },
};

const EDGES: [string, string][] = [
  ['profitability', 'cost reduction'],
  ['profitability', 'pricing'],
  ['profitability', 'growth'],
  ['cost reduction', 'operations'],
  ['pricing', 'go to market'],
  ['pricing', 'growth'],
  ['growth', 'market entry'],
  ['growth', 'm&a'],
  ['market entry', 'go to market'],
  ['market entry', 'guesstimate'],
  ['market entry', 'competitive strategy'],
  ['m&a', 'competitive strategy'],
];

const W = 460;
const H = 336;

function stateOf(s: UsTypeStat, focusType: string | null): State {
  if (s.type === focusType) return 'next';
  if (s.count >= 2 && (s.avg ?? 0) >= 80) return 'mastered';
  if (s.count > 0) return 'progress';
  return 'new';
}

const STATE_LABEL: Record<State, string> = { mastered: 'Mastered', progress: 'In progress', next: 'Next', new: 'Not started' };

function practiceHref(type: string) {
  return type === 'guesstimate' ? '/practice?tab=guesstimates' : `/practice?tab=scored&focus=${encodeURIComponent(type)}`;
}

export default function SkillMap({
  stats,
  focusType,
  lastPracticed,
  className = '',
}: {
  stats: UsTypeStat[];
  focusType: string | null;
  /** type → formatted "last practiced" date, computed server-side in the viewer's timezone. */
  lastPracticed: Record<string, string | null>;
  className?: string;
}) {
  const nodes = stats.filter((s) => LAYOUT[s.type]).map((s) => ({ ...s, state: stateOf(s, focusType), ...LAYOUT[s.type] }));
  const byType = Object.fromEntries(nodes.map((n) => [n.type, n]));
  const initial = focusType && byType[focusType] ? focusType : (nodes.find((n) => n.state === 'progress') ?? nodes[0])?.type ?? null;
  const [selected, setSelected] = useState<string | null>(initial);
  const sel = selected ? byType[selected] : null;

  return (
    <section id="skill-map" aria-labelledby="skillmap-title" className={`${US_CARD} flex scroll-mt-28 flex-col p-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 id="skillmap-title" className="font-display text-[19px] font-semibold leading-tight text-foreground">Your skill map</h2>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground" aria-label="Legend">
          <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-navy dark:bg-viz-1" /> Mastered</li>
          <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-full border-[1.5px] border-navy dark:border-viz-1" /> In progress</li>
          <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-full border-[1.5px] border-primary" /> Next</li>
          <li className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-full border border-dashed border-border-strong" /> Not started</li>
        </ul>
      </div>

      <div className="hidden sm:mt-4 sm:grid sm:flex-1 sm:grid-cols-1 sm:content-center sm:gap-5 min-[1360px]:grid-cols-[minmax(0,1fr)_188px] min-[1360px]:items-center min-[1360px]:gap-6">
      {/* Map (tablet and up) */}
      <div className="relative mx-auto w-full max-w-[460px]" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} aria-hidden className="absolute inset-0 h-full w-full">
          {EDGES.map(([a, b]) => {
            const A = byType[a];
            const B = byType[b];
            if (!A || !B) return null;
            const hot = (a === selected || b === selected);
            return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} className={hot ? 'stroke-foreground/40' : 'stroke-border-strong'} strokeWidth={1} opacity={hot ? 1 : 0.7} />;
          })}
          {nodes.map((n) => {
            const r = 21;
            const isSel = n.type === selected;
            const circ = 2 * Math.PI * (r - 4);
            return (
              <g key={n.type}>
                {isSel && <circle cx={n.x} cy={n.y} r={r + 7} className="fill-none stroke-foreground/25" strokeWidth={1} />}
                {n.state === 'mastered' && <circle cx={n.x} cy={n.y} r={r} className="fill-navy dark:fill-viz-1" />}
                {n.state === 'progress' && (
                  <>
                    <circle cx={n.x} cy={n.y} r={r} className="fill-card stroke-navy dark:stroke-viz-1" strokeWidth={1.5} />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r - 4}
                      className="fill-none stroke-navy/25 dark:stroke-viz-1/30"
                      strokeWidth={3}
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={r - 4}
                      className="fill-none stroke-navy dark:stroke-viz-1"
                      strokeWidth={3}
                      strokeDasharray={`${((n.avg ?? 0) / 100) * circ} ${circ}`}
                      transform={`rotate(-90 ${n.x} ${n.y})`}
                    />
                  </>
                )}
                {n.state === 'next' && <circle cx={n.x} cy={n.y} r={r} className="fill-card stroke-primary" strokeWidth={2} />}
                {n.state === 'new' && <circle cx={n.x} cy={n.y} r={r} className="fill-background stroke-border-strong" strokeWidth={1.25} strokeDasharray="3 3" />}
                {n.state === 'mastered' && (
                  <path d={`M${n.x - 6} ${n.y} l4 4 l8 -8`} fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                )}
                {(n.state === 'progress' || n.state === 'next') && n.avg != null && (
                  <text x={n.x} y={n.y + 4.5} textAnchor="middle" className={n.state === 'next' ? 'fill-primary' : 'fill-foreground'} style={{ fontSize: 13.5, fontWeight: 700 }}>
                    {n.avg}
                  </text>
                )}
                {n.state === 'next' && (
                  <text x={n.x} y={n.y - r - 8} textAnchor="middle" className="fill-primary" style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em' }}>
                    NEXT
                  </text>
                )}
                <text
                  x={n.x}
                  y={n.y + r + 19}
                  textAnchor="middle"
                  className={`${isSel ? 'fill-foreground' : 'fill-foreground/80'} stroke-card`}
                  style={{ fontSize: 14.5, fontWeight: isSel ? 700 : 500, paintOrder: 'stroke', strokeWidth: 5, strokeLinejoin: 'round' }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        {nodes.map((n) => (
          <button
            key={n.type}
            type="button"
            onClick={() => setSelected(n.type)}
            aria-pressed={n.type === selected}
            aria-label={`${n.label}: ${STATE_LABEL[n.state]}${n.avg != null ? `, average ${n.avg}` : ''}, ${n.count} ${n.count === 1 ? 'session' : 'sessions'}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: 56, height: 56 }}
          />
        ))}
      </div>

      {/* Details for the selected skill */}
      {sel && (
        <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between min-[1360px]:flex-col min-[1360px]:items-start min-[1360px]:justify-center min-[1360px]:self-stretch min-[1360px]:border-l min-[1360px]:border-t-0 min-[1360px]:pl-6 min-[1360px]:pt-0" aria-live="polite">
          <div>
            <p className="font-display text-[18px] font-semibold leading-tight text-foreground">
              {sel.label}
              <span className={`ml-2 inline-block whitespace-nowrap align-middle text-[10.5px] font-semibold uppercase tracking-[0.1em] ${sel.state === 'next' ? 'text-primary' : 'text-muted-foreground'}`}>
                {STATE_LABEL[sel.state]}
              </span>
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {sel.count > 0 ? (
                <>
                  Average <span className="font-semibold text-foreground tnum">{sel.avg ?? '—'}</span> · {sel.count} {sel.count === 1 ? 'session' : 'sessions'}
                </>
              ) : (
                'Not practiced yet.'
              )}
            </p>
            {sel.count > 0 && lastPracticed[sel.type] && (
              <p className="mt-1 text-[13px] text-muted-foreground">Last practiced {lastPracticed[sel.type]}</p>
            )}
          </div>
          <Link href={practiceHref(sel.type)} className={usButton(sel.state === 'next' ? 'primary' : 'secondary', 'sm', 'shrink-0')}>
            Practice {lowerLabel(sel.label)} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      )}
      </div>

      {/* Phones: the same information as a list */}
      <ul className="mt-4 divide-y divide-border sm:hidden">
        {nodes
          .slice()
          .sort((a, b) => ({ next: 0, progress: 1, mastered: 2, new: 3 }[a.state] - { next: 0, progress: 1, mastered: 2, new: 3 }[b.state]))
          .map((n) => (
            <li key={n.type}>
              <Link href={practiceHref(n.type)} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    n.state === 'mastered'
                      ? 'bg-navy text-white dark:bg-viz-1'
                      : n.state === 'next'
                      ? 'border-2 border-primary'
                      : n.state === 'progress'
                      ? 'border-[1.5px] border-navy dark:border-viz-1'
                      : 'border border-dashed border-border-strong'
                  }`}
                >
                  {n.state === 'mastered' && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-foreground">{n.label}</span>
                  <span className={`block text-[12px] ${n.state === 'next' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {STATE_LABEL[n.state]}
                    {n.count > 0 && <> · avg {n.avg ?? '—'} · {n.count} {n.count === 1 ? 'session' : 'sessions'}</>}
                  </span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
}
