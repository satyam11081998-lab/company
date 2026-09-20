'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, AlertTriangle, Check, MessageSquare, Target,
  TrendingDown, Route, Lightbulb, FileText, Gauge, Lock,
} from 'lucide-react';
import { ScoreRadar, PointsBridge, DimensionBars, type RadarDatum, type BridgeStep, type DimBar } from './charts/primitives';
import CaseVisuals from './charts/case-visuals';
import type { CaseVisual } from '@/lib/results/visuals';

/**
 * The solution view, as a deck.
 *
 * ── Why this replaced a scroll ───────────────────────────────────────
 * The previous results page was ~10 stacked cards in one column: score, then
 * breakdown, then red flags, then the answer, then strengths, then
 * improvements, then three approaches. Everything had equal visual weight and
 * arrived in the order the scorer happened to produce it, so the reader had to
 * do the prioritising themselves — and the part that actually changes their
 * next attempt (which gap cost the most marks, and how a strong candidate
 * would have played it) sat below three screens of scroll.
 *
 * A deck forces the decisions a scroll lets you dodge: each panel gets ONE
 * job, the order is an argument (verdict → evidence → cost → the better line →
 * your own words), and anything that does not earn a panel does not ship.
 *
 * Panels are conditional: a submission with no approaches, or no case figures,
 * simply has fewer steps rather than empty sections. Guesstimates and cases
 * use the same shell with different dimensions.
 *
 * Accessibility: the rail is a real tablist, arrow keys move between panels,
 * and every panel is in the DOM order it is announced in. The deck never traps
 * focus and each panel scrolls internally if a long answer needs it.
 */

export interface DeckSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  render: () => React.ReactNode;
}

export interface ResultsDeckProps {
  score: number;
  scale: number;
  summary: string;
  caseTitle: string | null;
  caseType: string | null;
  notScored: boolean;
  validityReason?: string | null;
  radar: RadarDatum[];
  bars: DimBar[];
  bridge: BridgeStep[];
  dimensionNotes: Array<{ label: string; evidence?: string; gap?: string; toImprove?: string; pct: number }>;
  redFlags: string[];
  strengths: string[];
  improvements: string[];
  visuals: CaseVisual[];
  /** The KIND of each figure being withheld from a non-Pro viewer — never the
   *  model's own title or caption, which can contain the answer. The figures
   *  themselves are not sent to the client at all for these users; see the note
   *  in app/(app)/results/[id]/page.tsx. Empty when nothing is locked. */
  lockedFigureKinds?: CaseVisual['kind'][];
  topCandidate?: {
    title?: string;
    walkthrough?: string;
    frameworks?: string[];
    flow?: Array<{ step?: string; move?: string; framework?: string }>;
  };
  thirdAngle?: { title?: string; body?: string; insight?: string };
  yourLine?: {
    title?: string;
    exchanges?: Array<{ you_asked?: string; interviewer_said?: string; stronger_version?: string; why?: string }>;
  };
  finalRecommendation: string | null;
  attemptId: string | null;
  modelAnswer?: string | null;
  /** The case author's own worked solution, revealed after submitting. */
  workedSolution?: string | null;
  /** Guesstimate arithmetic backstop — deterministic checks on the candidate's
   *  own calculation chain. Only present on guesstimate rubrics. */
  backstop?: {
    findings?: Array<{ kind: string; label: string; message: string }>;
    summary?: string;
    notChecked?: string;
  } | null;
}

/**
 * Our OWN words for each figure kind, used on the lock screen.
 *
 * Deliberately not the model's title or caption: those are generated from the
 * case and can contain the very numbers being withheld. These six strings are
 * written here, in the repo, and can never leak anything.
 */
const FIGURE_KIND_LABEL: Record<CaseVisual['kind'], { title: string; blurb: string }> = {
  waterfall: { title: 'A profit bridge', blurb: "Where this case's money actually goes, step by step, from revenue to profit." },
  quadrant: { title: 'A 2×2 of the levers', blurb: 'Every option the case allows, plotted on impact against how controllable it is.' },
  tree: { title: 'The driver tree', blurb: 'The decomposition a strong answer would have built, taken down to real numbers.' },
  funnel: { title: 'The funnel', blurb: 'The top-down narrowing behind the estimate, stage by stage.' },
  bar: { title: 'A segment comparison', blurb: 'Where the total actually comes from, once the segments are multiplied out.' },
  line: { title: 'The trend', blurb: "The series the case supplies, and what it does over time." },
};

/* ── Small building blocks ────────────────────────────────────────── */

function PanelHeading({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb?: string }) {
  return (
    <header className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      {blurb && <p className="mt-2 max-w-2xl text-body leading-relaxed text-muted-foreground">{blurb}</p>}
    </header>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function band(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: 'Interview-ready', tone: 'text-viz-good' };
  if (score >= 65) return { label: 'Close — fixable gaps', tone: 'text-viz-4' };
  if (score >= 45) return { label: 'Developing', tone: 'text-viz-4' };
  return { label: 'Needs rebuilding', tone: 'text-viz-critical' };
}

/* ── The deck ─────────────────────────────────────────────────────── */

export default function ResultsDeck(p: ResultsDeckProps) {
  const [active, setActive] = useState(0);

  const sections = useMemo<DeckSection[]>(() => {
    const out: DeckSection[] = [];
    const verdict = band(p.score);

    // 1 · Verdict
    out.push({
      id: 'verdict', label: 'Verdict', icon: <Gauge className="h-4 w-4" />,
      render: () => (
        <div>
          <PanelHeading eyebrow="The verdict" title={p.caseTitle ?? 'Your attempt'} />
          <div className="grid items-center gap-8 md:grid-cols-[auto,1fr]">
            <div className="flex flex-col items-center">
              <div className="score-ring score-ring-lg" style={{ '--progress': p.score } as React.CSSProperties}>
                <p className="text-6xl font-bold tracking-tighter text-primary">
                  {p.score}
                  <span className="text-base font-normal text-muted-foreground/70">/{p.scale}</span>
                </p>
              </div>
              <p className={`mt-3 text-small font-semibold ${verdict.tone}`}>{verdict.label}</p>
            </div>
            <div>
              <p className="text-body leading-relaxed text-foreground/85">{p.summary}</p>
              {p.notScored && (
                <div className="mt-4 flex gap-3 rounded-xl border border-viz-4/40 bg-viz-4/5 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-viz-4" />
                  <div>
                    <p className="text-body font-semibold text-foreground">This wasn&apos;t scored as a real attempt</p>
                    {p.validityReason && <p className="mt-1 text-small text-muted-foreground">{p.validityReason}</p>}
                  </div>
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Stat label="Strongest" value={p.bars.length ? [...p.bars].sort((a, b) => (b.earned / b.available) - (a.earned / a.available))[0].label.split(' ')[0] : '—'} />
                <Stat label="Costliest gap" value={p.bridge.length ? [...p.bridge].sort((a, b) => b.lost - a.lost)[0].label.split(' ')[0] : '—'}
                  sub={p.bridge.length ? `−${Math.round([...p.bridge].sort((a, b) => b.lost - a.lost)[0].lost)} marks` : undefined} />
                <Stat label="Red flags" value={String(p.redFlags.length)} sub={p.redFlags.length ? 'see scorecard' : 'none raised'} />
              </div>
            </div>
          </div>
        </div>
      ),
    });

    // 2 · Scorecard
    if (p.radar.length >= 3) {
      out.push({
        id: 'scorecard', label: 'Scorecard', icon: <Target className="h-4 w-4" />,
        render: () => (
          <div>
            <PanelHeading eyebrow="Scorecard" title="The shape of this attempt"
              blurb="An even shape is a balanced candidate; a spike is a lopsided one. The dashed ring is where a strong candidate sits." />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,320px),1fr] lg:items-center">
              <ScoreRadar data={p.radar} />
              <div>
                <DimensionBars data={p.bars} />
              </div>
            </div>
            {p.redFlags.length > 0 && (
              <div className="mt-6 rounded-xl border border-viz-4/40 bg-viz-4/5 p-4">
                <p className="text-small font-semibold uppercase tracking-wide text-viz-4">Red flags</p>
                <ul className="mt-2 space-y-1.5">
                  {p.redFlags.map((f, i) => (
                    <li key={i} className="flex gap-2 text-small text-foreground/80">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-viz-4" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ),
      });
    }

    // 3 · Where the marks went
    if (p.bridge.some((b) => b.lost > 0.5)) {
      out.push({
        id: 'gaps', label: 'Where marks went', icon: <TrendingDown className="h-4 w-4" />,
        render: () => {
          const ranked = [...p.dimensionNotes].sort((a, b) => a.pct - b.pct).slice(0, 3);
          return (
            <div>
              <PanelHeading eyebrow="Diagnosis" title="Where the marks went"
                blurb="Ordered by what each gap actually cost — not by how low the percentage looked. A dimension can be 70% and still be your biggest loss if it carries the most weight." />
              <PointsBridge steps={p.bridge} total={p.scale} finalScore={p.score} />
              {ranked.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {ranked.map((d) => (
                    <div key={d.label} className="rounded-xl border border-border bg-card p-4">
                      <p className="text-small font-semibold text-foreground">{d.label}</p>
                      {d.gap && <p className="mt-2 text-small leading-relaxed text-muted-foreground"><span className="font-medium text-foreground/70">Gap: </span>{d.gap}</p>}
                      {d.toImprove && <p className="mt-2 text-small leading-relaxed text-foreground/80"><span className="font-medium text-primary">Next time: </span>{d.toImprove}</p>}
                    </div>
                  ))}
                </div>
              )}
              {/* The arithmetic backstop is a DETERMINISTIC check on the
                  candidate's own calculation chain, not a model opinion — it
                  belongs beside the marks it actually moved. */}
              {p.backstop && (p.backstop.summary || (p.backstop.findings?.length ?? 0) > 0) && (
                <div className="mt-6 rounded-xl border border-border bg-card p-5">
                  <p className="text-small font-semibold uppercase tracking-wide text-muted-foreground">Arithmetic check</p>
                  {p.backstop.summary && <p className="mt-2 text-small leading-relaxed text-foreground/80">{p.backstop.summary}</p>}
                  {(p.backstop.findings?.length ?? 0) > 0 && (
                    <ul className="mt-3 space-y-2">
                      {p.backstop.findings!.map((f, i) => (
                        <li key={i} className="flex gap-2 text-small leading-relaxed text-foreground/80">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-viz-4" />
                          <span><span className="font-medium">{f.label}: </span>{f.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {p.backstop.notChecked && <p className="mt-3 text-[11px] text-muted-foreground">{p.backstop.notChecked}</p>}
                </div>
              )}
            </div>
          );
        },
      });
    }

    // 4 · Case figures. Free/Lite get the panel with the figures WITHHELD —
    // titles and captions only, which say what is behind the lock without
    // being an answer. The figures themselves never reach this component for
    // those users, so there is nothing here to un-hide.
    const locked = (p.lockedFigureKinds?.length ?? 0) > 0;
    if (p.visuals.length > 0 || locked) {
      out.push({
        id: 'figures', label: 'The numbers', icon: <MessageSquare className="h-4 w-4" />,
        render: () => (
          <div>
            <PanelHeading eyebrow="The case in numbers" title="What the economics actually said"
              blurb="The structure a strong answer would have built, drawn from this case's own figures." />
            {locked ? (
              <div>
                <div className="space-y-3">
                  {p.lockedFigureKinds!.map((k, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-5">
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-body font-semibold text-foreground">{FIGURE_KIND_LABEL[k].title}</p>
                        <p className="mt-1 text-small leading-relaxed text-muted-foreground">{FIGURE_KIND_LABEL[k].blurb}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-primary/25 bg-primary/[0.04] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">Pro</p>
                  <p className="mt-2 text-body leading-relaxed text-foreground/85">
                    {p.lockedFigureKinds!.length === 1 ? 'This figure is' : `These ${p.lockedFigureKinds!.length} figures are`}{' '}
                    the worked answer to the case, drawn from its own numbers. Your score, your scorecard,
                    where your marks went and the three approaches stay free — this is the case solved.
                  </p>
                  <Link href="/upgrade?src=results-figures"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-small font-semibold text-white transition-colors hover:bg-primary-hover">
                    See Pro <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <CaseVisuals visuals={p.visuals} />
            )}
          </div>
        ),
      });
    }

    // 5 · Your own line, tightened — the single most actionable panel, because
    // it quotes what the candidate actually said and shows the stronger phrasing
    // of that exact turn rather than a generic ideal answer.
    if (p.yourLine?.exchanges && p.yourLine.exchanges.length > 0) {
      out.push({
        id: 'line', label: 'Your line', icon: <MessageSquare className="h-4 w-4" />,
        render: () => (
          <div>
            <PanelHeading eyebrow="Your line, tightened" title={p.yourLine?.title || 'The same points, said better'}
              blurb="Your own turns, rewritten the way a strong candidate would have put them." />
            <div className="space-y-4">
              {p.yourLine!.exchanges!.map((ex, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  {ex.you_asked && <p className="text-small text-muted-foreground"><span className="font-semibold text-foreground/70">You: </span>{ex.you_asked}</p>}
                  {ex.interviewer_said && ex.interviewer_said !== '\u2014' && (
                    <p className="mt-1 text-small text-muted-foreground"><span className="font-semibold text-foreground/70">Interviewer: </span>{ex.interviewer_said}</p>
                  )}
                  {ex.stronger_version && (
                    <p className="mt-2.5 rounded-lg border border-viz-good/30 bg-viz-good/[0.06] px-3 py-2 text-small leading-relaxed text-foreground/85">
                      <span className="font-semibold text-viz-good">Stronger: </span>{ex.stronger_version}
                    </p>
                  )}
                  {ex.why && <p className="mt-1.5 text-[11px] text-muted-foreground">{ex.why}</p>}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    }

    // 6 · The better line
    const tc = p.topCandidate;
    const hasTc = !!(tc?.walkthrough || (tc?.flow && tc.flow.length) || p.modelAnswer || p.workedSolution);
    if (hasTc) {
      out.push({
        id: 'top', label: 'A stronger line', icon: <Route className="h-4 w-4" />,
        render: () => (
          <div>
            <PanelHeading eyebrow="A stronger line" title={tc?.title || 'How a top candidate solves this'}
              blurb="Not a model answer to memorise — the sequence of moves, so you can see where yours diverged." />
            {tc?.flow && tc.flow.length > 0 && (
              <ol className="relative space-y-3 border-l-2 border-border pl-6">
                {tc.flow.map((f, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{i + 1}</span>
                    <div className="rounded-xl border border-border bg-card p-4">
                      {f.step && <p className="text-small font-semibold text-foreground">{f.step}</p>}
                      {f.move && <p className="mt-1 text-small leading-relaxed text-muted-foreground">{f.move}</p>}
                      {f.framework && (
                        <span className="mt-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{f.framework}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
            {tc?.walkthrough && (
              <p className="mt-5 whitespace-pre-line text-body leading-relaxed text-foreground/85">{tc.walkthrough}</p>
            )}
            {tc?.frameworks && tc.frameworks.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Frameworks in play</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tc.frameworks.map((fw, i) => (
                    <span key={i} className="rounded-full border border-border bg-card px-3 py-1 text-small text-foreground/80">{fw}</span>
                  ))}
                </div>
              </div>
            )}
            {p.modelAnswer && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.04] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">How a top candidate would approach this</p>
                <p className="mt-2 whitespace-pre-line text-body leading-relaxed text-foreground/85">{p.modelAnswer}</p>
              </div>
            )}
            {p.workedSolution && (
              <div className="mt-5 rounded-xl border border-border bg-card p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">The worked solution</p>
                <p className="mt-2 whitespace-pre-line text-body leading-relaxed text-foreground/85">{p.workedSolution}</p>
              </div>
            )}
          </div>
        ),
      });
    }

    // 7 · The other angle
    if (p.thirdAngle?.body) {
      out.push({
        id: 'third', label: 'The other angle', icon: <Lightbulb className="h-4 w-4" />,
        render: () => (
          <div>
            <PanelHeading eyebrow="The other angle" title={p.thirdAngle?.title || 'A different road through the same case'}
              blurb="Most cases have more than one defensible structure. This is the one you did not take." />
            <p className="whitespace-pre-line text-body leading-relaxed text-foreground/85">{p.thirdAngle?.body}</p>
            {p.thirdAngle?.insight && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">The insight</p>
                <p className="mt-1.5 text-body leading-relaxed text-foreground/85">{p.thirdAngle.insight}</p>
              </div>
            )}
          </div>
        ),
      });
    }

    // 8 · Your own words
    out.push({
      id: 'yours', label: 'Your answer', icon: <FileText className="h-4 w-4" />,
      render: () => (
        <div>
          <PanelHeading eyebrow="Your answer" title="What you actually said" />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-viz-good/30 bg-viz-good/[0.05] p-5">
              <p className="text-small font-semibold uppercase tracking-wide text-viz-good">What worked</p>
              <ul className="mt-3 space-y-2">
                {p.strengths.length === 0 && <li className="text-small text-muted-foreground">No highlights recorded.</li>}
                {p.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-small leading-relaxed text-foreground/80">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-viz-good" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5">
              <p className="text-small font-semibold uppercase tracking-wide text-primary">Do differently</p>
              <ul className="mt-3 space-y-2">
                {p.improvements.length === 0 && <li className="text-small text-muted-foreground">No suggestions recorded.</li>}
                {p.improvements.map((s, i) => (
                  <li key={i} className="flex gap-2 text-small leading-relaxed text-foreground/80">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {p.finalRecommendation && (
            <div className="mt-5 rounded-xl border border-border bg-card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your closing recommendation</p>
              <p className="mt-2 whitespace-pre-line text-body leading-relaxed text-foreground/85">{p.finalRecommendation}</p>
            </div>
          )}
          {p.attemptId && (
            <Link href={`/history/${p.attemptId}`}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-small font-medium text-foreground transition-colors hover:bg-muted">
              <MessageSquare className="h-4 w-4" /> Read the whole conversation
            </Link>
          )}
        </div>
      ),
    });

    return out;
  }, [p]);

  const count = sections.length;
  const go = useCallback((i: number) => setActive(Math.max(0, Math.min(count - 1, i))), [count]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement;
      if (el && ['INPUT', 'TEXTAREA'].includes(el.tagName)) return;
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft') go(active - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, go]);

  const current = sections[active];

  return (
    <div className="grid gap-6 lg:grid-cols-[210px,1fr] lg:items-start">
      {/* Rail — vertical on desktop, a scrollable chip row on phones. */}
      <nav role="tablist" aria-label="Solution sections"
        className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
        {sections.map((s, i) => {
          const on = i === active;
          return (
            <button key={s.id} role="tab" aria-selected={on} aria-controls={`panel-${s.id}`}
              onClick={() => go(i)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-left text-small font-medium transition-colors lg:rounded-lg lg:w-full ${
                on ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border lg:border-transparent'
              }`}>
              <span className={on ? 'text-white' : 'text-muted-foreground'}>{s.icon}</span>
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          );
        })}
      </nav>

      <div>
        <section id={`panel-${current.id}`} role="tabpanel" aria-label={current.label}
          className="animate-fade-in rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {current.render()}
        </section>

        {/* Deck controls */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button onClick={() => go(active - 1)} disabled={active === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-small font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-1.5" aria-hidden>
            {sections.map((s, i) => (
              <span key={s.id} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-border'}`} />
            ))}
          </div>
          <button onClick={() => go(active + 1)} disabled={active === count - 1}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {active + 1} of {count} · use ← → to move
        </p>
      </div>
    </div>
  );
}
