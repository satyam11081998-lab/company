import Link from 'next/link';
import { ArrowRight, Clock, Check } from 'lucide-react';
import { UsImage, usButton } from '@/components/us/ui';
import { GlyphChain, GlyphTimer, GlyphTree } from '@/components/us/art';
import { photoForCase } from '@/lib/us-market/assets';
import type { UsDashboardModel, UsTodayItem, UsTypeStat } from '@/lib/us-market/dashboard';
import { lastSevenDays, relativeDay, shortDate } from '@/components/us/dashboard/format';

/**
 * US dashboard modules — server components, each answering ONE question.
 * Hierarchy: Today (what now) → Next (what to improve) → Progress (how am I
 * doing) → Activity (what have I done). Only the Today module is loud.
 */

const MODULE = 'rounded-[12px] border border-border bg-card';
const LABEL = 'text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground';

function DifficultyMark({ level }: { level: string }) {
  const n = level === 'hard' ? 3 : level === 'medium' ? 2 : 1;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="inline-flex items-end gap-[2px]">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-[3px] rounded-[1px] ${i <= n ? 'bg-foreground/70' : 'bg-border-strong'}`} style={{ height: 4 + i * 3 }} />
        ))}
      </span>
      <span className="capitalize">{level}</span>
    </span>
  );
}

/* ── Today's case: the primary module ─────────────────────────────────── */

export function TodayPractice({ item, className = '' }: { item: UsTodayItem | null; className?: string }) {
  if (!item) {
    return (
      <section aria-labelledby="today-case-title" className={`${MODULE} flex flex-col justify-center p-7 ${className}`}>
        <p className={`${LABEL} !text-primary`}>Today&apos;s practice</p>
        <h2 id="today-case-title" className="mt-3 font-display text-[26px] leading-tight text-foreground">
          Today&apos;s case is on its way.
        </h2>
        <p className="mt-2 max-w-md text-[14px] text-muted-foreground">
          A new US case is scheduled every day after midnight Eastern. In the meantime, pick any case from the library.
        </p>
        <div className="mt-6">
          <Link href="/practice?tab=scored" className={usButton('primary', 'md')}>
            Browse cases <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }
  const photo = photoForCase({ industry: item.industry, title: item.title, type: item.type });
  return (
    <section aria-labelledby="today-case-title" className={`${MODULE} flex flex-col overflow-hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] ${className}`}>
      <div className="relative order-first aspect-[16/8] md:order-last md:aspect-auto md:min-h-[260px]">
        <UsImage
          photo={photo}
          ratio={4 / 3}
          widths={[400, 640, 900]}
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 40vw, 100vw"
          className="absolute inset-0 h-full w-full"
          alt=""
          decorative
        />
        {item.industry && (
          <span className="absolute bottom-3 left-3 rounded-[6px] bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {item.industry}
          </span>
        )}
      </div>
      <div className="flex flex-col p-6 sm:p-7">
        <p className={`${LABEL} !text-primary`}>Today&apos;s practice · Case</p>
        <h2 id="today-case-title" className="mt-3 font-display text-[25px] leading-[1.18] text-foreground sm:text-[29px]">
          {item.title}
        </h2>
        <dl className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
          {item.minutes != null && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Time</dt>
              <Clock aria-hidden className="h-3.5 w-3.5" />
              <dd>About {item.minutes} min</dd>
            </div>
          )}
          <div>
            <dt className="sr-only">Difficulty</dt>
            <dd><DifficultyMark level={item.difficulty} /></dd>
          </div>
          <div>
            <dt className="sr-only">Category</dt>
            <dd>{item.typeLabel}</dd>
          </div>
          {item.points != null && (
            <div>
              <dt className="sr-only">Points</dt>
              <dd className="tnum">{item.points} pts</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
          {item.done ? (
            <>
              {item.done.submissionId && (
                <Link href={`/results/${item.done.submissionId}`} className={usButton('primary', 'md')}>
                  {item.done.score != null ? <>Review your score · <span className="tnum">{item.done.score}</span></> : 'Review your attempt'}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              )}
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-success">
                <Check aria-hidden className="h-4 w-4" /> Done today
              </span>
            </>
          ) : (
            <>
              <Link href={`/cases/${item.id}`} className={usButton('primary', 'md')}>
                Start practicing <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
              <Link href="/practice?tab=scored" className={usButton('ghost', 'md')}>
                Browse cases
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Today's market sizing ─────────────────────────────────────────────── */

export function TodaySizing({ item, className = '' }: { item: UsTodayItem | null; className?: string }) {
  return (
    <section aria-labelledby="today-sizing-title" className={`${MODULE} p-5 ${className}`}>
      <p className={LABEL}>Today&apos;s market sizing</p>
      {item ? (
        <>
          <h2 id="today-sizing-title" className="mt-3 text-[16px] font-semibold leading-snug text-foreground">{item.title}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            {item.minutes != null && (
              <span className="inline-flex items-center gap-1.5">
                <GlyphTimer className="h-4 w-4" />
                <span><span className="sr-only">Time limit: </span>{item.minutes} min</span>
              </span>
            )}
            <DifficultyMark level={item.difficulty} />
            {item.points != null && <span className="tnum">{item.points} pts</span>}
          </p>
          <div className="mt-4">
            {item.done ? (
              item.done.submissionId ? (
                <Link href={`/results/${item.done.submissionId}`} className={usButton('secondary', 'sm', 'w-full')}>
                  {item.done.score != null ? <>Review your score · <span className="tnum">{item.done.score}</span></> : 'Review your answer'}
                </Link>
              ) : null
            ) : (
              <Link href={`/cases/${item.id}`} className={usButton('secondary', 'sm', 'w-full')}>
                Start estimating <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 id="today-sizing-title" className="mt-3 text-[15px] font-semibold text-foreground">Today&apos;s question is on its way.</h2>
          <Link href="/practice?tab=guesstimates" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline underline-offset-4">
            Browse market sizing <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </>
      )}
    </section>
  );
}

/* ── Streak ────────────────────────────────────────────────────────────── */

export function Streak({ count, timestamps, tz, className = '' }: { count: number; timestamps: string[]; tz: string; className?: string }) {
  const days = lastSevenDays(timestamps, tz);
  return (
    <section aria-labelledby="streak-title" className={`${MODULE} p-5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <p id="streak-title" className={LABEL}>Streak</p>
        <p className="text-[12px] text-muted-foreground">Last 7 days</p>
      </div>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-foreground tnum">
        {count > 0 ? (
          <>
            {count} <span className="text-[14px] font-medium text-muted-foreground">{count === 1 ? 'day' : 'days'}</span>
          </>
        ) : (
          <span className="text-[16px] font-semibold">Start a streak today</span>
        )}
      </p>
      <ol className="mt-4 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                d.practiced
                  ? 'bg-navy text-white dark:bg-viz-1'
                  : d.isToday
                  ? 'border border-dashed border-primary'
                  : 'border border-border-strong'
              }`}
            >
              {d.practiced && <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span aria-hidden className={`text-[11px] ${d.isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{d.initial}</span>
            <span className="sr-only">
              {d.name}{d.isToday ? ' (today)' : ''}: {d.practiced ? 'practiced' : 'not practiced'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── What to do next ───────────────────────────────────────────────────── */

export function NextBestAction({ model, className = '' }: { model: UsDashboardModel; className?: string }) {
  const a = model.nextAction;
  return (
    <section aria-labelledby="next-title" className={`${MODULE} relative overflow-hidden p-6 ${className}`}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-primary" />
      <p id="next-title" className={LABEL}>What to do next</p>
      {a ? (
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-primary">{a.eyebrow}</p>
            <h2 className="mt-1.5 font-display text-[23px] leading-snug text-foreground">{a.title}</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{a.reason}</p>
          </div>
          <Link href={a.href} className={usButton('secondary', 'md', 'shrink-0')}>
            {a.cta} <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      ) : model.sessionsUntilAdvice > 0 ? (
        <div className="mt-3">
          <h2 className="font-display text-[21px] leading-snug text-foreground">Your recommendations start after three scored sessions.</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Until then, today&apos;s case is the best next step. {3 - model.sessionsUntilAdvice} of 3 done.
          </p>
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 w-10 rounded-full ${i < 3 - model.sessionsUntilAdvice ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <h2 className="font-display text-[21px] leading-snug text-foreground">Nothing stands out. Keep your rhythm.</h2>
          <p className="mt-2 text-[14px] text-muted-foreground">
            Your scores are even across what you&apos;ve practiced. Today&apos;s case keeps the streak going.
          </p>
        </div>
      )}
    </section>
  );
}

/* ── Plan (account context, deliberately quiet) ────────────────────────── */

export function PlanStatus({
  tier,
  expiresAt,
  isGuest,
  tz,
  className = '',
}: {
  tier: 'free' | 'lite' | 'pro';
  expiresAt: string | null;
  isGuest: boolean;
  tz: string;
  className?: string;
}) {
  const until = shortDate(expiresAt, tz);
  return (
    <section aria-labelledby="plan-title" className={`${MODULE} flex flex-col p-6 ${className}`}>
      <p id="plan-title" className={LABEL}>Your plan</p>
      {isGuest ? (
        <>
          <p className="mt-3 text-[17px] font-semibold text-foreground">No account yet</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">Create a free account to keep your scores, history and streak.</p>
          <div className="mt-auto flex gap-2 pt-5">
            <Link href="/signup?next=/dashboard" className={usButton('primary', 'sm')}>Create account</Link>
            <Link href="/login?next=/dashboard" className={usButton('ghost', 'sm')}>Log in</Link>
          </div>
        </>
      ) : tier === 'free' ? (
        <>
          <p className="mt-3 text-[17px] font-semibold text-foreground">Free</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Today&apos;s case and market sizing question, plus one extra of each. Lite and Pro open the full US bank.
          </p>
          <Link href="/upgrade" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-primary hover:underline underline-offset-4">
            See plans <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-[17px] font-semibold text-foreground">{tier === 'pro' ? 'Pro' : 'Lite'}</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{until ? <>Access through {until}. Nothing renews automatically.</> : 'Active.'}</p>
          <Link href="/upgrade" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-foreground hover:text-primary">
            Manage plan <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </>
      )}
    </section>
  );
}

/* ── Pick up where you left off ────────────────────────────────────────── */

export function ContinueSessions({ items, tz, className = '' }: { items: UsDashboardModel['inProgress']; tz: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="continue-title" className={`${MODULE} p-6 ${className}`}>
      <p id="continue-title" className={LABEL}>Pick up where you left off</p>
      <ul className="mt-3 divide-y divide-border">
        {items.map((it) => (
          <li key={it.attemptId} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">{it.title}</p>
              <p className="text-[12px] text-muted-foreground">{it.typeLabel} · started {(() => { const d = relativeDay(it.startedAt, tz); return d === 'Today' || d === 'Yesterday' ? d.toLowerCase() : d; })()}</p>
            </div>
            <Link href={`/cases/${it.caseId}`} className={usButton('secondary', 'sm', 'shrink-0 self-start sm:self-auto')}>
              Resume <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Progress: metrics, weekly practice, by case type ──────────────────── */

export function ProgressSection({ model, focusType, className = '' }: { model: UsDashboardModel; focusType: string | null; className?: string }) {
  const m = model.metrics;
  const total = model.weeks.reduce((a, w) => a + w.cases + w.sizing, 0);
  const cells: { k: string; v: string; sub?: string }[] = [
    { k: 'Cases practiced', v: String(m.casesPracticed) },
    { k: 'Market sizing', v: String(m.sizingPracticed) },
    {
      k: 'Average case score',
      v: m.avgCaseScore == null ? '—' : String(m.avgCaseScore),
      sub: m.recentDelta == null ? undefined : `${m.recentDelta >= 0 ? '+' : '−'}${Math.abs(m.recentDelta)} last 5 vs previous 5`,
    },
    { k: 'Average sizing score', v: m.avgSizingScore == null ? '—' : String(m.avgSizingScore) },
  ];
  return (
    <section aria-labelledby="progress-title" className={`${MODULE} ${className}`}>
      <div className="flex items-center justify-between gap-3 px-6 pt-6">
        <p id="progress-title" className={LABEL}>Your progress</p>
        <Link href="/history" className="text-[13px] font-semibold text-foreground hover:text-primary">
          All sessions <ArrowRight aria-hidden className="inline h-3.5 w-3.5" />
        </Link>
      </div>
      <dl className="mt-4 grid grid-cols-2 border-y border-border lg:grid-cols-4">
        {cells.map((c, i) => (
          <div key={c.k} className={`px-6 py-5 ${i % 2 === 1 ? 'border-l border-border' : ''} ${i >= 2 ? 'border-t border-border lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}>
            <dt className="text-[12px] text-muted-foreground">{c.k}</dt>
            <dd className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-foreground tnum">{c.v}</dd>
            {c.sub && <dd className={`mt-1.5 text-[12px] ${c.sub.startsWith('+') ? 'text-success' : 'text-muted-foreground'}`}>{c.sub}</dd>}
          </div>
        ))}
      </dl>
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="p-6 lg:border-r lg:border-border">
          <h3 className="text-[14px] font-semibold text-foreground">Practice by week</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Sessions over the last 8 weeks. Consistency beats cramming.</p>
          {total === 0 ? (
            <p className="mt-6 rounded-[8px] border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
              Your first session starts this chart.
            </p>
          ) : (
            <>
              <div className="hidden sm:block"><WeeklyChart weeks={model.weeks} /></div>
              <div className="sm:hidden"><WeeklyChart weeks={model.weeks} compact /></div>
            </>
          )}
        </div>
        <div className="border-t border-border p-6 lg:border-t-0">
          <h3 className="text-[14px] font-semibold text-foreground">Average score by case type</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Where your marks come from, and where they don&apos;t.</p>
          <TypeBars stats={[...model.byType, model.sizing]} focusType={focusType} />
        </div>
      </div>
    </section>
  );
}

function WeeklyChart({ weeks, compact = false }: { weeks: UsDashboardModel['weeks']; compact?: boolean }) {
  const max = Math.max(1, ...weeks.map((w) => w.cases + w.sizing));
  // Drawn at roughly its display size (~440px desktop, ~300px phone) so the
  // numbers stay 11–12px on screen instead of being scaled down.
  const H = compact ? 120 : 150;
  const barW = compact ? 22 : 30;
  const gap = compact ? 14 : 28;
  const padR = compact ? 10 : 16;
  const W = weeks.length * barW + (weeks.length - 1) * gap + padR;
  return (
    <figure className="mt-5">
      <svg viewBox={`0 0 ${W} ${H + 24}`} role="img" aria-label="Sessions per week for the last eight weeks" className={`h-auto w-full ${compact ? 'max-w-[340px]' : 'max-w-[460px]'}`}>
        <line x1={0} y1={H + 0.5} x2={W} y2={H + 0.5} className="stroke-border" />
        {weeks.map((w, i) => {
          const x = i * (barW + gap);
          const hc = (w.cases / max) * (H - 22);
          const hs = (w.sizing / max) * (H - 22);
          const total = w.cases + w.sizing;
          return (
            <g key={w.start}>
              {hs > 0 && <rect x={x} y={H - hs} width={barW} height={hs} rx={2} className="fill-viz-seq3" />}
              {hc > 0 && <rect x={x} y={H - hs - hc} width={barW} height={hc} rx={2} className="fill-navy dark:fill-viz-seq5" />}
              {total > 0 && (
                <text x={x + barW / 2} y={H - hs - hc - 6} textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
                  {total}
                </text>
              )}
              {(i % 2 === 1 || i === weeks.length - 1) && (
                <text x={x + barW / 2} y={H + 18} textAnchor={i === weeks.length - 1 ? 'end' : 'middle'} dx={i === weeks.length - 1 ? barW / 2 : 0} className="fill-muted-foreground" style={{ fontSize: 11.5 }}>
                  {i === weeks.length - 1 ? (compact ? 'Now' : 'This week') : w.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-[3px] bg-navy dark:bg-viz-seq5" /> Cases</span>
        <span className="inline-flex items-center gap-1.5"><span aria-hidden className="h-2.5 w-2.5 rounded-[3px] bg-viz-seq3" /> Market sizing</span>
      </figcaption>
      {!compact && <table className="sr-only">
        <caption>Sessions per week</caption>
        <thead><tr><th>Week starting</th><th>Cases</th><th>Market sizing</th></tr></thead>
        <tbody>{weeks.map((w) => <tr key={w.start}><td>{w.label}</td><td>{w.cases}</td><td>{w.sizing}</td></tr>)}</tbody>
      </table>}
    </figure>
  );
}

function TypeBars({ stats, focusType }: { stats: UsTypeStat[]; focusType: string | null }) {
  const tried = stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const untried = stats.filter((s) => s.count === 0);
  if (!tried.length) {
    return (
      <p className="mt-6 rounded-[8px] border border-dashed border-border px-4 py-8 text-center text-[13px] text-muted-foreground">
        Scores by case type appear after your first scored session.
      </p>
    );
  }
  return (
    <div className="mt-5">
      <ul className="space-y-3.5">
        {tried.map((s) => {
          const focus = s.type === focusType;
          return (
            <li key={s.type}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="font-medium text-foreground">
                  {s.label}
                  {focus && <span className="ml-2 rounded-[3px] border border-primary/40 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary">Focus</span>}
                </span>
                <span className="text-muted-foreground tnum">
                  <span className="font-semibold text-foreground">{s.avg ?? '—'}</span> · {s.count} {s.count === 1 ? 'session' : 'sessions'}
                </span>
              </div>
              <div aria-hidden className="mt-1.5 h-1.5 w-full rounded-full bg-muted">
                <div className={`h-1.5 rounded-full ${focus ? 'bg-primary' : 'bg-navy dark:bg-viz-1'}`} style={{ width: `${Math.max(2, s.avg ?? 0)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
      {untried.length > 0 && (
        <p className="mt-4 text-[12px] text-muted-foreground">
          Not yet practiced: {untried.map((s) => s.label).join(', ')}.
        </p>
      )}
    </div>
  );
}

/* ── Recent activity ───────────────────────────────────────────────────── */

export function RecentActivity({ items, tz, className = '' }: { items: UsDashboardModel['activity']; tz: string; className?: string }) {
  return (
    <section aria-labelledby="activity-title" className={`${MODULE} p-6 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p id="activity-title" className={LABEL}>Recent activity</p>
        {items.length > 0 && (
          <Link href="/history" className="text-[13px] font-semibold text-foreground hover:text-primary">View all</Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-[14px] text-muted-foreground">Nothing yet. Your sessions will be listed here, newest first.</p>
      ) : (
        <ol className="mt-3">
          {items.map((it, i) => (
            <li key={it.id} className="relative flex gap-4 pb-4 last:pb-0">
              {i < items.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-20px)] w-px bg-border" />}
              <span aria-hidden className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-border bg-background text-muted-foreground">
                {it.kind === 'sizing' ? <GlyphChain className="h-3.5 w-3.5" /> : <GlyphTree className="h-3.5 w-3.5" />}
              </span>
              <Link href={`/results/${it.id}`} className="group min-w-0 flex-1 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <p className="text-[11px] text-muted-foreground">
                  {relativeDay(it.at, tz)} · {it.typeLabel}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[14px] font-medium leading-snug text-foreground group-hover:text-primary">{it.title}</p>
              </Link>
              <span className="mt-4 shrink-0 text-[13px] font-semibold text-foreground tnum">
                {it.score != null ? it.score : <span className="text-[12px] font-normal text-muted-foreground">Unscored</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
