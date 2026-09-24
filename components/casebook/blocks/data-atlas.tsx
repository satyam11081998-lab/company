'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, CornerDownRight, Check, AlertTriangle } from 'lucide-react';
import type { AtlasData, AtlasSection, AtlasVisual, Datum, Grade } from '@/lib/casebook/atlas-types';

/* ============================================================================
   The Data Atlas block — a deck of slides with a search box over it.

   DESIGN RULES, all of them load-bearing. Each was a defect caught by
   screenshotting this thing in both themes at 1240px and 390px:

   1. NO TEXT ON A CHART FILL. The --viz and --viz-seq ramps invert between
      themes: a fill that is dark navy in light mode is pale blue in dark, so a
      white-on-fill label fails contrast in one theme whichever way you pick.
      Every value sits outside its mark, on a normal foreground token.
   2. BARS ARE MOBILE-FIRST: label and value on a row ABOVE a full-width bar,
      never a three-column grid. At 390px a grid leaves ~90px of track and all
      the bars come out the same length, which destroys the encoding.
   3. ORDERED THINGS TAKE THE SEQUENTIAL RAMP. Age bands, funnel stages,
      nested city definitions, powers of ten — these are ordinal, so they get
      --viz-seq-*, not categorical hues. Categorical (--viz-1, --viz-2) is
      reserved for genuinely distinct identities, taken in fixed order.
   4. --primary MEANS EMPHASIS, and only that. One mark per chart at most.
      When red also meant "outlier" on the same slide it read as an error state.
   5. A LABELLED AXIS MUST MATCH ITS OWN SCALE. The dumbbell positions on a
      declared domain and prints ticks from the same number.
   6. No accent rails on cards; no `ch` width clamps; no dashed gridlines.
   ============================================================================ */

/* ------------------------------------------------------------------ grades */

const GRADE_META: Record<Grade, { label: string; tag: string; blurb: string }> = {
  measured: {
    label: 'Counted',
    tag: 'tag tag-green',
    blurb: 'A census, survey or administrative count — the strongest thing on the sheet.',
  },
  official: {
    label: 'Official estimate',
    tag: 'tag tag-navy',
    blurb: 'A government or UN estimate. Solid, but it moves between revisions.',
  },
  derived: {
    label: 'Our arithmetic',
    tag: 'tag tag-amber',
    blurb: 'We divided one sourced number by another. The working is shown so you can check it.',
  },
  industry: {
    label: 'Trade estimate',
    tag: 'tag tag-red',
    blurb: 'Widely quoted, never actually counted. Use the order of magnitude, not the digits.',
  },
};

const GRADE_ORDER: Grade[] = ['measured', 'official', 'derived', 'industry'];

/** Categorical hues — distinct identities only, fixed order, never cycled. */
const VIZ = ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--viz-5'];
/** Sequential ramp, darkest first — for ordered stages and magnitudes. */
const SEQ = ['--viz-seq-5', '--viz-seq-4', '--viz-seq-3', '--viz-seq-2', '--viz-seq-1'];

const seqAt = (i: number, n: number) => {
  // Spread across the ramp so a 3-stage and a 5-stage chart both read as ordered.
  const span = Math.min(n, SEQ.length);
  const idx = n <= 1 ? 0 : Math.round((i / (n - 1)) * (span - 1));
  return SEQ[Math.min(idx, SEQ.length - 1)];
};

/* ----------------------------------------------------------------- helpers */

function haystack(d: Datum, sectionTitle: string) {
  return [
    d.label, d.value, d.alt ?? '', d.detail ?? '', d.unlocks ?? '',
    d.crossCheck ?? '', d.source, d.asOf, sectionTitle, ...(d.keywords ?? []),
  ].join(' • ').toLowerCase();
}

/** Split text on the query so matches can be marked without dangerouslySetInnerHTML. */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const needle = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  let guard = 0;
  while (guard++ < 40) {
    const at = rest.toLowerCase().indexOf(needle);
    if (at === -1) break;
    if (at > 0) out.push(<React.Fragment key={key++}>{rest.slice(0, at)}</React.Fragment>);
    out.push(
      <mark key={key++} className="rounded-[3px] bg-warning-soft px-0.5 text-foreground">
        {rest.slice(at, at + needle.length)}
      </mark>,
    );
    rest = rest.slice(at + needle.length);
  }
  out.push(<React.Fragment key={key++}>{rest}</React.Fragment>);
  return <>{out}</>;
}

function Panel({
  title, note, children, className = '',
}: { title?: string; note?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-border bg-background p-4 ${className}`}>
      {title ? <p className="text-label text-muted-foreground">{title}</p> : null}
      <div className={title ? 'mt-3' : ''}>{children}</div>
      {note ? <p className="mt-3 text-small text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function Swatch({ token, round }: { token: string; round?: boolean }) {
  return (
    <span
      className={`h-2.5 w-2.5 shrink-0 ${round ? 'rounded-full' : 'rounded-[2px]'}`}
      style={{ background: `hsl(var(${token}))` }}
      aria-hidden="true"
    />
  );
}

/* ----------------------------------------------------------------- visuals */

/** One bar. Label + value ABOVE a full-width track: the only pattern that
 *  survives a 390px viewport (see rule 2). */
function BarRow({
  label, pct, display, token, emphasis, strong,
}: { label: string; pct: number; display: string; token: string; emphasis?: boolean; strong?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`text-small ${emphasis || strong ? 'font-semibold text-foreground' : 'text-foreground'}`}>
          {label}
        </span>
        <span
          className={`shrink-0 whitespace-nowrap font-mono-data text-small font-semibold ${
            emphasis ? 'text-primary' : 'text-foreground'
          }`}
        >
          {display}
        </span>
      </div>
      <span className="mt-1 block h-6 w-full rounded-[4px] bg-muted">
        <span
          className="block h-6 rounded-[4px]"
          style={{
            width: `${Math.max(Math.min(pct, 100), 1.5)}%`,
            background: emphasis ? 'hsl(var(--primary))' : `hsl(var(${token}))`,
          }}
        />
      </span>
    </div>
  );
}

function BarsChart({ v }: { v: Extract<AtlasVisual, { kind: 'bars' }> }) {
  const max = Math.max(...v.items.map((i) => i.value), v.reference?.at ?? 0) || 1;
  const scale = v.reference ? max * 1.06 : max;
  return (
    <Panel title={v.title} note={v.note}>
      <div className="relative space-y-2.5">
        {v.items.map((it, i) => (
          <BarRow
            key={it.label}
            label={it.label}
            pct={(it.value / scale) * 100}
            display={it.display}
            emphasis={it.emphasis}
            token={
              it.muted
                ? '--muted'
                : v.ordered
                  ? seqAt(i, v.items.length)
                  : '--viz-1'
            }
          />
        ))}
        {v.reference ? (
          <span
            className="pointer-events-none absolute bottom-0 top-0 w-[2px] bg-foreground/70"
            style={{ left: `${(v.reference.at / scale) * 100}%` }}
            aria-hidden="true"
          />
        ) : null}
      </div>
      {v.reference ? (
        <p className="mt-2 text-micro text-muted-foreground">Vertical rule: {v.reference.label}</p>
      ) : null}
    </Panel>
  );
}

function FunnelChart({ v }: { v: Extract<AtlasVisual, { kind: 'funnel' }> }) {
  const max = Math.max(...v.stages.map((s) => s.value)) || 1;
  return (
    <Panel title={v.title} note={v.note}>
      <div className="space-y-2.5">
        {v.stages.map((s, i) => (
          <BarRow
            key={s.label}
            label={s.label}
            pct={(s.value / max) * 100}
            display={s.display}
            emphasis={s.emphasis}
            token={seqAt(i, v.stages.length)}
          />
        ))}
      </div>
    </Panel>
  );
}

function StackChart({ v }: { v: Extract<AtlasVisual, { kind: 'stack' }> }) {
  return (
    <Panel title={v.title} note={v.note}>
      {/* 2px surface gaps between segments rather than borders on the marks */}
      <div className="flex h-9 w-full gap-[2px] overflow-hidden rounded-lg">
        {v.segments.map((s, i) => (
          <span
            key={s.label}
            className="first:rounded-l-lg last:rounded-r-lg"
            style={{ width: `${s.pct}%`, background: `hsl(var(${VIZ[i % VIZ.length]}))` }}
            title={`${s.label} — ${s.pct}%`}
          />
        ))}
      </div>
      <div className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-3">
        {v.segments.map((s, i) => (
          <div key={s.label} className="flex items-baseline gap-2">
            <span className="translate-y-[-1px]"><Swatch token={VIZ[i % VIZ.length]} /></span>
            <span className="text-small text-foreground">{s.label}</span>
            <span className="ml-auto whitespace-nowrap font-mono-data text-small font-semibold text-foreground">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function WaffleChart({ v }: { v: Extract<AtlasVisual, { kind: 'waffle' }> }) {
  const cells: string[] = [];
  v.bands.forEach((b, i) => {
    for (let n = 0; n < b.count; n++) cells.push(seqAt(i, v.bands.length));
  });
  return (
    <Panel title={v.title} note={v.note}>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: 'repeat(25, minmax(0, 1fr))' }}
        aria-hidden="true"
      >
        {cells.map((tok, i) => (
          <span key={i} className="aspect-square rounded-[2px]" style={{ background: `hsl(var(${tok}))` }} />
        ))}
      </div>
      <div className="mt-3 grid gap-x-5 gap-y-1.5 sm:grid-cols-3">
        {v.bands.map((b, i) => (
          <div key={b.label} className="flex items-baseline gap-2">
            <span className="translate-y-[-1px]"><Swatch token={seqAt(i, v.bands.length)} /></span>
            <span className="text-small text-foreground">{b.label}</span>
            <span className="ml-auto whitespace-nowrap font-mono-data text-small font-semibold text-foreground">
              {b.count} · {b.display}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MeterChart({ v }: { v: Extract<AtlasVisual, { kind: 'meter' }> }) {
  const span = v.max - v.min || 1;
  const fill = ((v.value - v.min) / span) * 100;
  const rule = ((v.threshold.at - v.min) / span) * 100;
  const dp = (v.threshold.label.split('.')[1] ?? '').length;
  return (
    <Panel note={v.note}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-label text-muted-foreground">{v.title}</p>
        <p className="font-mono-data text-h3 font-bold text-foreground">{v.display}</p>
      </div>
      <div className="relative mt-3 h-7 rounded-[4px] bg-muted">
        <span
          className="absolute inset-y-0 left-0 rounded-[4px]"
          style={{ width: `${fill}%`, background: 'hsl(var(--viz-seq-4))' }}
        />
        <span className="absolute inset-y-[-6px] w-[2px] bg-foreground" style={{ left: `${rule}%` }} />
      </div>
      <div className="relative mt-2 h-4">
        <span className="absolute left-0 text-micro text-muted-foreground">{v.min.toFixed(dp)}</span>
        <span
          className="absolute whitespace-nowrap text-micro font-semibold text-foreground"
          style={{ left: `${rule}%`, transform: 'translateX(-50%)' }}
        >
          {v.threshold.label}
        </span>
        <span className="absolute right-0 text-micro text-muted-foreground">{v.max.toFixed(dp)}</span>
      </div>
    </Panel>
  );
}

function DumbbellChart({ v }: { v: Extract<AtlasVisual, { kind: 'dumbbell' }> }) {
  const x = (n: number) => (n / v.max) * 100;
  // Print both ends to the same precision: "43%" beside "17.9%" reads as a
  // different kind of number, which is the last thing this chart needs.
  const dp = Math.max(
    ...v.rows.flatMap((r) => [r.a, r.b]).map((n) => (String(n).split('.')[1] ?? '').length),
  );
  const pre = v.unit.includes('\u20b9') ? '\u20b9' : '';
  const suf = v.unit === '%' ? '%' : '';
  const fmt = (n: number) =>
    `${pre}${n.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp })}${suf}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    pos: f * 100,
    label: `${Math.round(v.max * f).toLocaleString('en-IN')}${v.unit === '%' ? '%' : ''}`,
  }));
  const axisNote = v.unit === '%' ? null : v.unit;
  return (
    <Panel title={v.title} note={v.note}>
      {/* legend — two series, so identity is never colour-alone */}
      <div className="flex flex-wrap items-center gap-5">
        <span className="inline-flex items-center gap-2 text-small text-foreground">
          <Swatch token="--viz-1" round /> {v.seriesA}
        </span>
        <span className="inline-flex items-center gap-2 text-small text-foreground">
          <Swatch token="--viz-2" round /> {v.seriesB}
        </span>
      </div>

      <div className="mt-4 space-y-3.5">
        {v.rows.map((r) => {
          const ax = x(r.a);
          const bx = x(r.b);
          const lo = Math.min(ax, bx);
          const hi = Math.max(ax, bx);
          return (
            <div
              key={r.label}
              className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,10rem)_1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-strong font-semibold text-foreground">{r.label}</p>
                <p className="text-micro text-muted-foreground">{r.gap}</p>
              </div>
              <div className="relative h-8">
                <span
                  className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2"
                  style={{ background: 'hsl(var(--viz-grid))' }}
                />
                <span
                  className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                  style={{ left: `${lo}%`, width: `${hi - lo}%`, background: 'hsl(var(--muted-foreground) / 0.4)' }}
                />
                <span
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                  style={{ left: `${ax}%`, background: 'hsl(var(--viz-1))', ['--tw-ring-color' as string]: 'hsl(var(--background))' }}
                />
                <span
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
                  style={{ left: `${bx}%`, background: 'hsl(var(--viz-2))', ['--tw-ring-color' as string]: 'hsl(var(--background))' }}
                />
              </div>
              {/* values live in a fixed column — a label can never collide with a mark */}
              <div className="flex gap-4 sm:w-[10.5rem] sm:justify-end">
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="translate-y-[-1px]"><Swatch token="--viz-1" round /></span>
                  <span className="font-mono-data text-small font-semibold text-foreground">
{fmt(r.a)}
                  </span>
                </span>
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="translate-y-[-1px]"><Swatch token="--viz-2" round /></span>
                  <span className="font-mono-data text-small font-semibold text-foreground">
{fmt(r.b)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}

        {/* axis — printed from the same domain the marks are positioned on */}
        <div className="hidden sm:grid sm:grid-cols-[minmax(0,10rem)_1fr_auto]">
          <span />
          <div className="relative h-4">
            {ticks.map((t, i) => (
              <span
                key={t.label + i}
                className="absolute whitespace-nowrap text-micro text-muted-foreground"
                style={
                  i === 0
                    ? { left: 0 }
                    : i === ticks.length - 1
                      ? { right: 0 }
                      : { left: `${t.pos}%`, transform: 'translateX(-50%)' }
                }
              >
                {t.label}
              </span>
            ))}
          </div>
          <span className="sm:w-[10.5rem] text-right text-micro text-muted-foreground">{axisNote}</span>
        </div>
      </div>
    </Panel>
  );
}

function RatioChart({ v }: { v: Extract<AtlasVisual, { kind: 'ratio' }> }) {
  const total = v.aValue + v.bValue || 1;
  return (
    <Panel title={v.title} note={v.note}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <span className="flex items-baseline gap-2">
          <span className="translate-y-[-2px]"><Swatch token="--viz-1" /></span>
          <span className="text-small text-muted-foreground">{v.aLabel}</span>
          <span className="font-mono-data text-h3 font-bold text-foreground">{v.aDisplay}</span>
        </span>
        <span className="flex items-baseline gap-2">
          <span className="font-mono-data text-h3 font-bold text-foreground">{v.bDisplay}</span>
          <span className="text-small text-muted-foreground">{v.bLabel}</span>
          <span className="translate-y-[-2px]"><Swatch token="--viz-2" /></span>
        </span>
      </div>
      <div className="mt-2 flex h-7 w-full gap-[2px] overflow-hidden rounded-md">
        <span className="rounded-l-md" style={{ width: `${(v.aValue / total) * 100}%`, background: 'hsl(var(--viz-1))' }} />
        <span className="rounded-r-md" style={{ width: `${(v.bValue / total) * 100}%`, background: 'hsl(var(--viz-2))' }} />
      </div>
    </Panel>
  );
}

function EquationChart({ v }: { v: Extract<AtlasVisual, { kind: 'equation' }> }) {
  return (
    <Panel title={v.title} note={v.note}>
      <div className="grid gap-3 xl:grid-cols-2">
        {v.rows.map((r) => {
          const holds = r.verdict === 'holds';
          return (
            <div key={r.goal} className="flex flex-col rounded-lg border border-border bg-card p-3.5">
              <p className="text-label text-muted-foreground">{r.goal}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {r.terms.map((t, i) => (
                  <React.Fragment key={t.label}>
                    {i > 0 ? (
                      <span className="text-small text-muted-foreground">{r.op ?? '\u00d7'}</span>
                    ) : null}
                    <span className="rounded-md bg-muted px-2.5 py-1.5">
                      <span className="block text-micro text-muted-foreground">{t.label}</span>
                      <span className="font-mono-data text-small font-semibold text-foreground">{t.value}</span>
                    </span>
                  </React.Fragment>
                ))}
                <span className="text-small text-muted-foreground">=</span>
                <span className="rounded-md bg-navy px-2.5 py-1.5 text-navy-foreground">
                  <span className="block text-micro opacity-70">gives</span>
                  <span className="font-mono-data text-small font-semibold">{r.result}</span>
                </span>
              </div>
              <div
                className="mt-auto flex items-start gap-2 rounded-md p-2.5 pt-2.5"
                style={{ background: holds ? 'hsl(var(--success-soft))' : 'hsl(var(--warning-soft))' }}
              >
                {holds ? (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--success))' }} />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--warning))' }} />
                )}
                <span className="text-small text-foreground">{r.check}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function LadderChart({ v }: { v: Extract<AtlasVisual, { kind: 'ladder' }> }) {
  return (
    <Panel title={v.title} note={v.note}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {v.rungs.map((r) => (
          <div
            key={r.label}
            className={`rounded-md p-3 ${r.emphasis ? 'bg-accent' : 'bg-muted/60'}`}
          >
            <p className={`font-mono-data text-small ${r.emphasis ? 'text-primary' : 'text-muted-foreground'}`}>
              {r.exp}
            </p>
            <p className={`mt-0.5 text-strong font-semibold ${r.emphasis ? 'text-accent-foreground' : 'text-foreground'}`}>
              {r.label}
            </p>
            <p className={`text-micro ${r.emphasis ? 'text-accent-foreground' : 'text-muted-foreground'}`}>{r.alt}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TilesChart({ v }: { v: Extract<AtlasVisual, { kind: 'tiles' }> }) {
  return (
    <Panel title={v.title} note={v.note}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {v.tiles.map((t) => (
          <div key={t.label}>
            <p className="font-mono-data text-h3 font-bold leading-tight text-foreground">
              {t.value}
              {t.unit ? <span className="text-small font-semibold">{t.unit}</span> : null}
            </p>
            <p className="mt-0.5 text-micro text-muted-foreground">{t.label}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Visual({ v }: { v: AtlasVisual }) {
  switch (v.kind) {
    case 'bars': return <BarsChart v={v} />;
    case 'funnel': return <FunnelChart v={v} />;
    case 'stack': return <StackChart v={v} />;
    case 'waffle': return <WaffleChart v={v} />;
    case 'meter': return <MeterChart v={v} />;
    case 'dumbbell': return <DumbbellChart v={v} />;
    case 'ratio': return <RatioChart v={v} />;
    case 'equation': return <EquationChart v={v} />;
    case 'ladder': return <LadderChart v={v} />;
    case 'tiles': return <TilesChart v={v} />;
    default: return null;
  }
}

/* ------------------------------------------------------- headline stat tile */

function HeroTile({ d, invert }: { d: Datum; invert?: boolean }) {
  const g = GRADE_META[d.grade];
  // Tiles get the source's first clause; the full citation rides in the tooltip
  // and is printed in full on the detail card. Three wrapped lines of
  // "UN World Population Prospects 2024 revision, medium variant" under a hero
  // number is exactly the text-heaviness this redesign exists to remove.
  const shortSource = d.source.split(/[,(]/)[0].trim();
  const longValue = d.value.length > 13;
  return (
    <div
      className={`flex flex-col rounded-lg p-4 ${
        invert ? 'bg-navy text-navy-foreground' : 'border border-border bg-background'
      }`}
      title={d.unlocks ? `Use it for ${d.unlocks}` : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-label ${invert ? 'opacity-70' : 'text-muted-foreground'}`}>{d.label}</p>
        <span
          className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-micro font-semibold ${
            invert ? 'bg-white/15 text-navy-foreground' : g.tag
          }`}
          title={g.blurb}
        >
          {g.label}
        </span>
      </div>
      <p
        className={`mt-1.5 font-bold leading-[1.1] tracking-tight ${
          longValue ? 'text-[26px]' : 'text-[30px]'
        }`}
      >
        {d.value}
      </p>
      {d.alt ? (
        <p className={`mt-1.5 text-small ${invert ? 'opacity-80' : 'text-muted-foreground'}`}>{d.alt}</p>
      ) : null}
      <p
        className={`mt-auto pt-3 text-micro ${
          invert ? 'border-t border-white/15 opacity-70' : 'border-t border-border text-muted-foreground'
        }`}
        title={d.source}
      >
        <span className="font-mono-data">{d.asOf}</span> · {shortSource}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- full detail card */

function DatumCard({ d, query, sectionTitle }: { d: Datum; query: string; sectionTitle?: string }) {
  const g = GRADE_META[d.grade];
  return (
    <div className="ui-card flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label text-muted-foreground"><Highlight text={d.label} query={query} /></p>
        <span className={`${g.tag} shrink-0 whitespace-nowrap`} title={g.blurb}>{g.label}</span>
      </div>
      <p className="mt-2 font-mono-data text-h3 font-bold tracking-tight text-foreground">
        <Highlight text={d.value} query={query} />
      </p>
      {d.alt ? (
        <p className="mt-1 text-small text-muted-foreground"><Highlight text={d.alt} query={query} /></p>
      ) : null}
      {d.detail ? (
        <p className="mt-2.5 text-body text-foreground/85"><Highlight text={d.detail} query={query} /></p>
      ) : null}
      {d.unlocks ? (
        <p className="mt-2.5 flex items-start gap-1.5 text-small text-foreground">
          <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span><span className="font-semibold">Use it for </span><Highlight text={d.unlocks} query={query} /></span>
        </p>
      ) : null}
      {d.crossCheck ? (
        <p className="mt-2.5 rounded-md bg-muted/60 p-2.5 text-small text-foreground">
          <span className="font-semibold">Cross-check. </span><Highlight text={d.crossCheck} query={query} />
        </p>
      ) : null}
      <p className="mt-auto pt-3 text-micro text-muted-foreground">
        {sectionTitle ? <span className="text-primary">{sectionTitle} · </span> : null}
        <span className="font-mono-data">{d.asOf}</span> · {d.source}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- slide */

function Slide({ s, index }: { s: AtlasSection; index: number }) {
  const [open, setOpen] = useState(false);
  // A number that a chart on this slide already shows does not get repeated as
  // a chip. It stays in the search index, where its detail belongs.
  const covered = new Set(s.covers ?? []);
  const extras = s.facts.filter((f) => !covered.has(f.id));

  return (
    <section id={`atlas-${s.id}`} className="scroll-mt-[112px] rounded-xl border border-border bg-card p-5 md:p-7">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <span className="font-mono-data text-h2 font-bold leading-none text-primary/25">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="text-label text-primary">{s.nav}</p>
            <h3 className="mt-1 text-h2 text-foreground">{s.title}</h3>
          </div>
        </div>
        {s.sources?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {s.sources.map((src) => (
              <span key={src} className="badge-pill text-micro">{src}</span>
            ))}
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-strong text-muted-foreground">{s.kicker}</p>

      {s.headline?.length ? (
        <div
          className={`mt-4 grid gap-3 sm:grid-cols-2 ${
            s.headline.length % 3 === 0 || s.headline.length > 4 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {s.headline.map((d, i) => (
            <HeroTile key={d.id} d={d} invert={i === 0 || i === 4} />
          ))}
        </div>
      ) : null}

      {s.visuals?.length ? (
        <div className="mt-4 space-y-3">
          {s.visuals.map((v, i) => <Visual key={i} v={v} />)}
        </div>
      ) : null}

      {/* the remaining numbers, as chips — the prose lives behind the toggle
          and in search results, which is what stopped this page being a wall */}
      {extras.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-label text-muted-foreground">
              {extras.length} more number{extras.length === 1 ? '' : 's'} on this slide
            </p>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="text-small font-medium text-primary underline-offset-2 hover:underline"
            >
              {open ? 'Hide the detail' : 'Show source and detail'}
            </button>
          </div>

          {open ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {extras.map((d) => <DatumCard key={d.id} d={d} query="" />)}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {extras.map((d) => (
                <div key={d.id} title={d.detail}>
                  <p
                    className={`font-mono-data font-bold leading-tight text-foreground ${
                      d.value.length > 16 ? 'text-strong' : 'text-h3'
                    }`}
                  >
                    {d.value}
                  </p>
                  <p className="mt-0.5 text-micro text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {s.aha ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-accent px-4 py-3">
          <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <p className="text-body text-accent-foreground">
            <span className="text-label mr-1.5 text-primary">So what</span>
            {s.aha}
          </p>
        </div>
      ) : null}
    </section>
  );
}

/* ------------------------------------------------------------------- block */

export function DataAtlasBlock({ data }: { data: AtlasData }) {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState<Grade | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(
    () =>
      data.sections.flatMap((s) =>
        [...(s.headline ?? []), ...s.facts].map((d) => ({ d, section: s, hay: haystack(d, s.title) })),
      ),
    [data],
  );

  const q = query.trim().toLowerCase();
  const searching = q.length >= 2 || grade !== 'all';

  const hits = useMemo(() => {
    if (!searching) return [];
    return index.filter(
      (e) => (q.length < 2 || e.hay.includes(q)) && (grade === 'all' || e.d.grade === grade),
    );
  }, [index, q, grade, searching]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && el === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const jump = useCallback((id: string) => {
    document.getElementById(`atlas-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const total = index.length;

  return (
    <div className="my-8">
      {/* Toolbar — sticks under the reader shell's own sticky sidebar (top-24) */}
      <div className="relative z-20 rounded-xl border border-border bg-card/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 sm:sticky sm:top-24 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${total} numbers — try "UPI", "households", "milk"`}
              aria-label="Search the data atlas"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <p className="shrink-0 text-small text-muted-foreground" aria-live="polite">
            {searching ? (
              <><span className="font-semibold text-foreground">{hits.length}</span> of {total} numbers</>
            ) : (
              <>
                <span className="font-semibold text-foreground">{total}</span> numbers, every one sourced ·{' '}
                {data.updated}
              </>
            )}
          </p>
        </div>

        {/* Grade filter — doubles as the legend for the badges */}
        <div className="mt-3 items-center flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
          <button
            type="button"
            onClick={() => setGrade('all')}
            aria-pressed={grade === 'all'}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-small font-medium transition-colors ${
              grade === 'all'
                ? 'border-primary/40 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
            }`}
          >
            Everything
          </button>
          {GRADE_ORDER.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGrade(grade === g ? 'all' : g)}
              aria-pressed={grade === g}
              title={GRADE_META[g].blurb}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-small font-medium transition-colors ${
                grade === g
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
              }`}
            >
              {GRADE_META[g].label}
            </button>
          ))}
        </div>

        {!searching ? (
          <div className="mt-3 items-center border-t border-border pt-3 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
            <span className="mr-0.5 shrink-0 self-center text-micro text-muted-foreground">Jump to</span>
            {data.sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jump(s.id)}
                className="shrink-0 whitespace-nowrap rounded-md border border-border px-2.5 py-1 text-small text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {s.nav}
              </button>
            ))}
            <span className="ml-auto hidden shrink-0 self-center text-micro text-muted-foreground sm:inline">
              Press <kbd className="rounded border border-border px-1 font-mono-data">/</kbd> to search
            </span>
          </div>
        ) : null}
      </div>

      {searching ? (
        <div className="mt-5">
          {hits.length === 0 ? (
            <div className="ui-card p-8 text-center">
              <p className="text-strong text-foreground">Nothing on the sheet matches that.</p>
              <p className="mt-2 text-body text-muted-foreground">
                Try a plainer word — &ldquo;milk&rdquo; rather than &ldquo;dairy consumption per head&rdquo;. If a
                number genuinely is not here, it is usually because no primary source publishes it — and saying
                that out loud in the room is itself an answer.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {hits.map((h) => (
                <DatumCard
                  key={`${h.section.id}-${h.d.id}`}
                  d={h.d}
                  query={q.length >= 2 ? q : ''}
                  sectionTitle={h.section.nav}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {data.sections.map((s, i) => <Slide key={s.id} s={s} index={i} />)}
        </div>
      )}
    </div>
  );
}
