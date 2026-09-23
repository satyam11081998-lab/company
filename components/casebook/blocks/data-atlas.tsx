'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, CornerDownRight, Check, AlertTriangle, ArrowDown } from 'lucide-react';
import type {
  AtlasData,
  AtlasSection,
  AtlasVisual,
  Datum,
  Grade,
} from '@/lib/casebook/atlas-types';

/* ============================================================================
   The Data Atlas block.

   Design notes for whoever edits this next:
   • Colours come from the token set only — hsl(var(--…)). Never a literal hex,
     because every one of these surfaces has to hold in dark mode.
   • No accent rails on cards. The brand does not use them.
   • No `ch` width clamps. Text fills the card it is in; clamping inside a wide
     card is what produced the early-wrapping bug on the old page.
   • Charts obey the house rules: one axis of meaning, categorical hues taken in
     the fixed --viz-1..5 order, a sequential ramp only where the quantity is a
     magnitude, and grid lines that stay recessive.
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

/* ----------------------------------------------------------------- helpers */

function haystack(d: Datum, sectionTitle: string) {
  return [
    d.label,
    d.value,
    d.alt ?? '',
    d.detail ?? '',
    d.unlocks ?? '',
    d.crossCheck ?? '',
    d.source,
    d.asOf,
    sectionTitle,
    ...(d.keywords ?? []),
  ]
    .join(' • ')
    .toLowerCase();
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
      <mark
        key={key++}
        className="rounded-[3px] bg-warning-soft px-0.5 text-foreground"
      >
        {rest.slice(at, at + needle.length)}
      </mark>,
    );
    rest = rest.slice(at + needle.length);
  }
  out.push(<React.Fragment key={key++}>{rest}</React.Fragment>);
  return <>{out}</>;
}

/* ----------------------------------------------------------------- visuals */

const VIZ = ['--viz-1', '--viz-2', '--viz-3', '--viz-4', '--viz-5'];
const SEQ = ['--viz-seq-5', '--viz-seq-4', '--viz-seq-3', '--viz-seq-2', '--viz-seq-1'];

function StackChart({ v }: { v: Extract<AtlasVisual, { kind: 'stack' }> }) {
  return (
    <div className="mt-5">
      <div className="flex h-11 w-full overflow-hidden rounded-lg border border-border">
        {v.segments.map((s, i) => (
          <div
            key={s.label}
            className="flex items-center justify-center overflow-hidden px-2"
            style={{ width: `${s.pct}%`, background: `hsl(var(${VIZ[i % VIZ.length]}))` }}
            title={`${s.label} — ${s.pct}%`}
          >
            <span className="truncate text-micro font-semibold text-white">{s.pct}%</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {v.segments.map((s, i) => (
          <span key={s.label} className="inline-flex items-center gap-2 text-small text-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: `hsl(var(${VIZ[i % VIZ.length]}))` }}
              aria-hidden="true"
            />
            {s.label}
            {s.display ? (
              <span className="font-mono-data text-muted-foreground">{s.display}</span>
            ) : null}
          </span>
        ))}
      </div>
      {v.unitNote ? <p className="mt-2 text-micro text-muted-foreground">{v.unitNote}</p> : null}
    </div>
  );
}

function BarsChart({ v }: { v: Extract<AtlasVisual, { kind: 'bars' }> }) {
  const max = Math.max(...v.items.map((i) => i.value)) || 1;
  return (
    <div className="mt-5">
      <div className="space-y-2.5">
        {v.items.map((it, i) => (
          <div key={it.label} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3">
            <span className="truncate text-small text-muted-foreground">{it.label}</span>
            <span className="relative block h-6 rounded-[4px] bg-muted">
              <span
                className="absolute inset-y-0 left-0 rounded-[4px]"
                style={{
                  width: `${Math.max((it.value / max) * 100, 1.5)}%`,
                  background: it.muted
                    ? 'hsl(var(--muted-foreground) / 0.45)'
                    : `hsl(var(${SEQ[Math.min(i, SEQ.length - 1)]}))`,
                }}
              />
            </span>
            <span className="font-mono-data text-small font-semibold text-foreground">{it.display}</span>
          </div>
        ))}
      </div>
      {v.unitNote ? <p className="mt-3 text-micro text-muted-foreground">{v.unitNote}</p> : null}
    </div>
  );
}

function PyramidChart({ v }: { v: Extract<AtlasVisual, { kind: 'pyramid' }> }) {
  return (
    <div className="mt-5 space-y-1.5">
      {v.tiers.map((t, i) => {
        const width = 34 + i * 22;
        return (
          <div key={t.label} className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4">
            <div className="flex w-full justify-center sm:w-1/2">
              <div
                className="flex h-12 items-center justify-center rounded-md px-3"
                style={{
                  width: `${Math.min(width, 100)}%`,
                  background: `hsl(var(${SEQ[Math.min(i, SEQ.length - 1)]}))`,
                }}
              >
                <span
                  className={`truncate text-micro font-semibold ${i < 2 ? 'text-white' : 'text-foreground'}`}
                >
                  {t.band}
                </span>
              </div>
            </div>
            <span className="text-small text-foreground sm:w-1/2">{t.label}</span>
          </div>
        );
      })}
      {v.unitNote ? <p className="mt-3 text-micro text-muted-foreground">{v.unitNote}</p> : null}
    </div>
  );
}

function RatioChart({ v }: { v: Extract<AtlasVisual, { kind: 'ratio' }> }) {
  return (
    <div className="mt-5 space-y-5">
      {v.pairs.map((p) => {
        const total = p.aValue + p.bValue || 1;
        return (
          <div key={p.aLabel + p.bLabel}>
            <div className="flex h-14 w-full overflow-hidden rounded-lg border border-border">
              <div
                className="flex flex-col justify-center px-3"
                style={{ width: `${(p.aValue / total) * 100}%`, background: 'hsl(var(--viz-1))' }}
              >
                <span className="truncate text-micro font-semibold text-white/80">{p.aLabel}</span>
                <span className="truncate font-mono-data text-strong font-bold text-white">{p.aDisplay}</span>
              </div>
              <div
                className="flex flex-col justify-center px-3"
                style={{ width: `${(p.bValue / total) * 100}%`, background: 'hsl(var(--viz-2))' }}
              >
                <span className="truncate text-micro font-semibold text-white/80">{p.bLabel}</span>
                <span className="truncate font-mono-data text-strong font-bold text-white">{p.bDisplay}</span>
              </div>
            </div>
            {p.note ? <p className="mt-2 text-small text-muted-foreground">{p.note}</p> : null}
          </div>
        );
      })}
      {v.unitNote ? <p className="mt-2 text-micro text-muted-foreground">{v.unitNote}</p> : null}
    </div>
  );
}

function ChainChart({ v }: { v: Extract<AtlasVisual, { kind: 'chain' }> }) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {v.chains.map((c) => {
        const holds = c.verdict === 'holds';
        return (
          <div key={c.goal} className="ui-card p-4">
            <p className="text-label text-muted-foreground">{c.goal}</p>
            <div className="mt-3 space-y-1.5">
              {c.steps.map((s) => (
                <div key={s.md} className="flex items-baseline justify-between gap-3">
                  <span className="text-small text-foreground">{s.md}</span>
                  <span className="shrink-0 font-mono-data text-small font-semibold text-foreground">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
              <span className="text-small font-semibold text-foreground">Gives</span>
              <span className="font-mono-data text-h3 font-bold text-primary">{c.result}</span>
            </div>
            <div
              className="mt-3 flex items-start gap-2 rounded-md p-2.5"
              style={{
                background: holds
                  ? 'hsl(var(--success-soft))'
                  : 'hsl(var(--warning-soft))',
              }}
            >
              {holds ? (
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(var(--success))' }} />
              ) : (
                <AlertTriangle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: 'hsl(var(--warning))' }}
                />
              )}
              <span className="text-small text-foreground">{c.check}</span>
            </div>
          </div>
        );
      })}
      {v.unitNote ? (
        <p className="text-micro text-muted-foreground lg:col-span-2">{v.unitNote}</p>
      ) : null}
    </div>
  );
}

function Visual({ v }: { v: AtlasVisual }) {
  switch (v.kind) {
    case 'stack':
      return <StackChart v={v} />;
    case 'bars':
      return <BarsChart v={v} />;
    case 'pyramid':
      return <PyramidChart v={v} />;
    case 'ratio':
      return <RatioChart v={v} />;
    case 'chain':
      return <ChainChart v={v} />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------- datum card */

function DatumCard({
  d,
  query,
  big,
  sectionTitle,
}: {
  d: Datum;
  query: string;
  big?: boolean;
  sectionTitle?: string;
}) {
  const g = GRADE_META[d.grade];
  return (
    <div className="ui-card flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-label text-muted-foreground">
          <Highlight text={d.label} query={query} />
        </p>
        <span className={`${g.tag} shrink-0`} title={g.blurb}>
          {g.label}
        </span>
      </div>

      <p
        className={`mt-2 font-mono-data font-bold tracking-tight text-foreground ${
          big ? 'text-[26px] leading-[1.15]' : 'text-h3'
        }`}
      >
        <Highlight text={d.value} query={query} />
      </p>

      {d.alt ? (
        <p className="mt-1 text-small text-muted-foreground">
          <Highlight text={d.alt} query={query} />
        </p>
      ) : null}

      {d.detail ? (
        <p className="mt-2.5 text-body text-foreground/85">
          <Highlight text={d.detail} query={query} />
        </p>
      ) : null}

      {d.unlocks ? (
        <p className="mt-2.5 flex items-start gap-1.5 text-small text-foreground">
          <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="font-semibold">Use it for </span>
            <Highlight text={d.unlocks} query={query} />
          </span>
        </p>
      ) : null}

      {d.crossCheck ? (
        <p className="mt-2.5 rounded-md bg-muted/60 p-2.5 text-small text-foreground">
          <span className="font-semibold">Cross-check. </span>
          <Highlight text={d.crossCheck} query={query} />
        </p>
      ) : null}

      <p className="mt-auto pt-3 text-micro text-muted-foreground">
        {sectionTitle ? <span className="text-primary">{sectionTitle} · </span> : null}
        <span className="font-mono-data">{d.asOf}</span> · {d.source}
      </p>
    </div>
  );
}

/* ----------------------------------------------------------------- section */

function SectionSlide({ s, index }: { s: AtlasSection; index: number }) {
  return (
    <section
      id={`atlas-${s.id}`}
      className="scroll-mt-[96px] rounded-xl border border-border bg-card p-5 md:p-7"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono-data text-h3 font-bold text-primary/60">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="text-h2 text-foreground">{s.title}</h3>
      </div>
      <p className="mt-2 text-strong text-muted-foreground">{s.kicker}</p>

      {s.aha ? (
        <p className="mt-4 rounded-lg bg-accent px-4 py-3 text-body font-medium text-accent-foreground">
          {s.aha}
        </p>
      ) : null}

      {s.headline && s.headline.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.headline.map((d) => (
            <DatumCard key={d.id} d={d} query="" big />
          ))}
        </div>
      ) : null}

      {s.visual ? <Visual v={s.visual} /> : null}

      {s.facts.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {s.facts.map((d) => (
            <DatumCard key={d.id} d={d} query="" />
          ))}
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
        [...(s.headline ?? []), ...s.facts].map((d) => ({
          d,
          section: s,
          hay: haystack(d, s.title),
        })),
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

  // "/" focuses the box, Escape clears it — the two shortcuts people try first.
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
      {/* Toolbar */}
      <div className="sticky top-[64px] z-20 -mx-1 rounded-xl border border-border bg-card/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:p-4">
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
              placeholder={`Search ${total} numbers — try "UPI", "households", "milk", "crore"`}
              aria-label="Search the data atlas"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-body text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
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
          <p className="shrink-0 text-small text-muted-foreground">
            {searching ? (
              <>
                <span className="font-semibold text-foreground">{hits.length}</span> of {total}
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{total}</span> numbers · every one
                sourced · updated {data.updated}
              </>
            )}
          </p>
        </div>

        {/* Grade filter — doubles as the legend */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setGrade('all')}
            aria-pressed={grade === 'all'}
            className={`rounded-full border px-3 py-1 text-small font-medium transition-colors ${
              grade === 'all'
                ? 'border-primary/40 bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
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
              className={`rounded-full border px-3 py-1 text-small font-medium transition-colors ${
                grade === g
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {GRADE_META[g].label}
            </button>
          ))}
        </div>

        {/* Jump bar */}
        {!searching ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
            <span className="text-micro text-muted-foreground">Jump to</span>
            {data.sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jump(s.id)}
                className="rounded-md border border-border px-2.5 py-1 text-small text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                {s.nav}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Results, or the slides */}
      {searching ? (
        <div className="mt-5">
          {hits.length === 0 ? (
            <div className="ui-card p-8 text-center">
              <p className="text-strong text-foreground">Nothing on the sheet matches that.</p>
              <p className="mx-auto mt-2 text-body text-muted-foreground">
                Try a plainer word — &ldquo;milk&rdquo; rather than &ldquo;dairy consumption per
                head&rdquo;. If a number genuinely is not here, it is usually because no primary
                source publishes it, and that is worth saying out loud in the room.
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
          {data.sections.map((s, i) => (
            <SectionSlide key={s.id} s={s} index={i} />
          ))}
        </div>
      )}

      {!searching ? (
        <p className="mt-5 flex items-center justify-center gap-1.5 text-micro text-muted-foreground">
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
          Press <kbd className="rounded border border-border px-1 font-mono-data">/</kbd> anywhere to
          search
        </p>
      ) : null}
    </div>
  );
}
