'use client';

/**
 * What is happening while the candidate waits — reading the CV, building the interview, writing
 * the report. Every step and finding comes from the server (the work reports its own stages); the
 * percentage moves smoothly between polls on the current step's time estimate and only reaches
 * 100 % when the work is really done.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { activeStep, estimatePct, monotonic } from '@/lib/interview-intelligence/progress';
import type { LiveProgress, LiveStep } from '@/lib/interview-intelligence/types';

const LOOKING_EVERY_MS = 3200;

export default function ProgressCard({ progress, receivedAt, doneTitle, className = '' }: {
  progress: LiveProgress;
  /** performance.now() when `progress` arrived (lets the bar move between polls). */
  receivedAt: number;
  /** Heading once everything is done (e.g. "Your CV, understood"). */
  doneTitle?: string;
  className?: string;
}) {
  const [pct, setPct] = useState(() => estimatePct(progress, 0));
  const shown = useRef(pct);
  // Findings fade in only when they land while you watch — not every time a finished card is shown.
  const [reveal] = useState(() => !progress.done);
  const current = activeStep(progress);

  useEffect(() => {
    const tick = () => {
      const next = monotonic(shown.current, estimatePct(progress, performance.now() - receivedAt), progress.done);
      shown.current = next;
      setPct(next);
    };
    tick();
    if (progress.done) return;
    const t = setInterval(tick, 200);
    return () => clearInterval(t);
  }, [progress, receivedAt]);

  // what a running analysis is looking for, one at a time
  const looking = current?.state === 'active' && !current.detail ? current.looking_for || [] : [];
  const [li, setLi] = useState(0);
  useEffect(() => {
    setLi(0);
    if (looking.length < 2) return;
    const t = setInterval(() => setLi((i) => (i + 1) % looking.length), LOOKING_EVERY_MS);
    return () => clearInterval(t);
  }, [current?.id, looking.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sub = current?.detail || (looking.length ? `Looking for ${looking[li]}…` : '');
  const heading = progress.done ? (doneTitle || 'Done') : current?.label || 'Working…';

  return (
    <section className={`rounded-lg border border-border px-4 py-4 sm:px-5 ${className}`}
             aria-label={progress.done ? heading : `In progress: ${heading}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium" aria-live="polite">{heading}</p>
          {!progress.done && (
            <p key={sub} className="mt-0.5 min-h-[1.25rem] text-sm text-muted-foreground motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-500">
              {sub}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-2xl font-semibold tabular-nums leading-none ${progress.done ? 'text-viz-good' : 'text-foreground'}`}
              aria-hidden>
          {pct}%
        </span>
      </div>

      {!progress.done && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100}
             aria-valuenow={pct} aria-label={heading}>
          <div className="h-full rounded-full bg-navy motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out dark:bg-foreground"
               style={{ width: `${Math.max(2, pct)}%` }} />
        </div>
      )}

      <ol className="mt-4 space-y-2.5">
        {progress.steps.map((s) => <StepRow key={s.id} step={s} reveal={reveal} />)}
      </ol>

      {progress.done && progress.highlights && progress.highlights.length > 0 && (
        <ul className={`mt-3 flex flex-wrap gap-1.5 pl-6 ${reveal ? 'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-700' : ''}`}
            aria-label="Highlights">
          {progress.highlights.map((h) => (
            <li key={h} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground">{h}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StepRow({ step, reveal }: { step: LiveStep; reveal: boolean }) {
  const done = step.state === 'done';
  const facts = useMemo(() => step.facts.filter(Boolean), [step.facts]);
  return (
    <li className="flex gap-2.5 text-sm">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
        {done ? <Check className="h-4 w-4 text-viz-good" strokeWidth={2.5} />
          : step.state === 'active' ? <Loader2 className="h-4 w-4 animate-spin text-navy dark:text-foreground" />
            : step.state === 'waiting' ? <span className="h-2.5 w-2.5 rounded-full border-2 border-navy motion-safe:animate-pulse dark:border-foreground" />
              : <span className="h-2.5 w-2.5 rounded-full border border-muted-foreground/50" />}
      </span>
      <div className="min-w-0">
        <p className={done || step.state === 'active' ? 'text-foreground' : 'text-muted-foreground'}>
          <span className="sr-only">{done ? 'Done: ' : step.state === 'active' ? 'Now: ' : 'Next: '}</span>
          {step.label}
        </p>
        {facts.length > 0 && (
          <ul className={`mt-0.5 space-y-0.5 text-muted-foreground ${reveal
            ? 'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 motion-safe:duration-500' : ''}`}>
            {facts.map((f) => <li key={f}>{f}</li>)}
          </ul>
        )}
      </div>
    </li>
  );
}
