'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowRight, BarChart3, Users, Trophy } from 'lucide-react';
import CaseVisuals from '@/components/results/charts/case-visuals';
import type { CaseInsight } from '@/lib/dashboard/case-insights';

export interface GateInfo {
  caseId: string;
  allowed: boolean;
  reason: string;
  /** Plain-English explanation of the lock, written for the user. */
  message: string;
}

/**
 * "Study a solution" — the dashboard panel where a user can read how a case
 * actually decomposes, with the cohort's numbers beside it.
 *
 * Two separate permissions are at work here and they are deliberately NOT the
 * same permission:
 *
 *   • CAN THEY LOOK? Governed by the spoiler rule in lib/dashboard/case-insights
 *     — the figures give the case away, so they appear once the user has
 *     attempted it (or on pro).
 *   • CAN THEY ATTEMPT? Governed by tier + the daily rotation, computed
 *     server-side by lib/access.ts, which mirrors the backend's access_guard.
 *
 * Conflating the two is what produces the two bad states: a locked case whose
 * answer is on screen anyway, and an open case the user is told they cannot
 * look at. Each lock below says which of the two it is and what unlocks it.
 *
 * The gate shown here is UX only. services/access_guard.py on the submit path
 * is the boundary that actually holds — this panel never decides anything.
 */
export default function SolutionStudy({
  insights,
  gates,
}: {
  insights: CaseInsight[];
  gates: GateInfo[];
}) {
  const [activeId, setActiveId] = useState(insights[0]?.caseId ?? null);
  if (!insights.length) return null;

  const active = insights.find((i) => i.caseId === activeId) ?? insights[0];
  const gate = gates.find((g) => g.caseId === active.caseId);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-body font-bold tracking-tight text-foreground">Study a solution</h2>
          <p className="mt-0.5 text-small text-muted-foreground">
            How each case actually decomposes, and how the cohort did on it.
          </p>
        </div>
        <Link href="/practice" className="text-small font-medium text-primary hover:underline">
          All cases
        </Link>
      </header>

      {/* Case picker */}
      <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {insights.map((i) => {
          const on = i.caseId === active.caseId;
          return (
            <button key={i.caseId} onClick={() => setActiveId(i.caseId)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-small font-medium transition-colors ${
                on ? 'bg-primary text-white' : 'border border-border bg-background text-muted-foreground hover:text-foreground'
              }`}>
              {i.title.length > 30 ? `${i.title.slice(0, 29)}…` : i.title}
            </button>
          );
        })}
      </div>

      {/* Cohort stats */}
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-background px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="h-3 w-3" /> Attempts
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-foreground">{active.attempts || '—'}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <BarChart3 className="h-3 w-3" /> Average
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-foreground">{active.avgScore ?? '—'}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Trophy className="h-3 w-3" /> Best
          </p>
          <p className="mt-1 text-xl font-bold leading-none text-foreground">{active.topScore ?? '—'}</p>
        </div>
        <div className={`rounded-xl border px-3.5 py-2.5 ${active.yourBest != null ? 'border-primary/30 bg-primary/[0.04]' : 'border-border bg-background'}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your best</p>
          <p className={`mt-1 text-xl font-bold leading-none ${active.yourBest != null ? 'text-primary' : 'text-muted-foreground'}`}>
            {active.yourBest ?? 'Not tried'}
          </p>
        </div>
      </div>

      {/* Figures, or the reason they are hidden */}
      <div className="mt-5">
        {active.visuals.length > 0 ? (
          <CaseVisuals visuals={active.visuals} />
        ) : active.visualsLockReason === 'tier' ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] p-5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-small font-semibold text-foreground">The worked figures are a Pro feature</p>
              <p className="mt-1 text-small leading-relaxed text-muted-foreground">
                Your own scores, scorecards and conversations stay free. Pro adds the case&apos;s
                own decomposition — the profit bridge, the 2&times;2, the driver tree — for every
                case you solve.
              </p>
              <Link href="/upgrade?src=dashboard-figures"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-hover">
                See Pro <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : active.visualsLockReason === 'unattempted' ? (
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-background p-5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-small font-semibold text-foreground">Solve it first</p>
              <p className="mt-1 text-small leading-relaxed text-muted-foreground">
                The breakdown for this case gives the answer away. Attempt it once and the
                full decomposition unlocks here permanently.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background p-5">
            <p className="text-small text-muted-foreground">
              No figures for this case yet — they appear once it has been solved and scored.
            </p>
          </div>
        )}
      </div>

      {/* Attempt gate — a SEPARATE permission from the one above */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        {gate?.allowed ? (
          <>
            <p className="text-small text-muted-foreground">
              {active.attemptedByUser ? 'You can attempt this again.' : 'This one is open to you now.'}
            </p>
            <Link href={`/cases/${active.caseId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-hover">
              {active.attemptedByUser ? 'Attempt again' : 'Attempt this case'} <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <>
            <p className="flex items-start gap-2 text-small text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {gate?.message ?? 'Attempting this case is not available on your plan right now.'}
            </p>
            <Link href="/upgrade"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-small font-semibold text-primary transition-colors hover:bg-primary/10">
              See plans <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
