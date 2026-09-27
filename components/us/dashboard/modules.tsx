import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  Clock,
  Crown,
  Flame,
  Gauge,
  Network,
  PlayCircle,
  Target,
} from 'lucide-react';
import { Eyebrow, IconChip, US_CARD, UsImage, usButton, type ChipTone } from '@/components/us/ui';
import { photoForCase } from '@/lib/us-market/assets';
import type { UsDashboardModel, UsTodayItem, UsTypeStat } from '@/lib/us-market/dashboard';
import { lastSevenDays, relativeDay, shortDate } from '@/components/us/dashboard/format';

/**
 * US dashboard modules (v2) — server components, each answering ONE question.
 * Surfaces are soft white cards; emphasis comes from tinted icon chips and
 * type, never from coloured side or top rules.
 */

const MODULE = US_CARD;

function ModuleHeader({ title, id, action }: { title: string; id?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="text-[16px] font-semibold text-foreground">{title}</h2>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline underline-offset-4">
          {action.label} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full border border-border/80 bg-card px-2.5 py-0.5 text-[12px] font-medium text-foreground/80">{children}</span>;
}

function DifficultyPill({ level }: { level: string }) {
  const tone =
    level === 'hard'
      ? 'bg-rose-50 text-rose-700 dark:bg-primary/15 dark:text-rose-300'
      : level === 'medium'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium capitalize ${tone}`}>{level}</span>;
}

/* ── Today's case: the primary module ─────────────────────────────────── */

export function TodayPractice({ item, className = '' }: { item: UsTodayItem | null; className?: string }) {
  if (!item) {
    return (
      <section aria-labelledby="today-case-title" className={`${MODULE} flex flex-col justify-center bg-gradient-to-br from-rose-50/80 via-card to-card p-7 dark:from-primary/10 ${className}`}>
        <Eyebrow>Today&apos;s practice</Eyebrow>
        <h2 id="today-case-title" className="mt-4 font-display text-[26px] leading-tight text-foreground">
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
    <section
      aria-labelledby="today-case-title"
      className={`${MODULE} relative flex flex-col gap-5 overflow-hidden bg-gradient-to-br from-rose-50 via-card to-card p-5 dark:from-primary/10 sm:p-6 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:gap-6 ${className}`}
    >
      <div className="relative order-first aspect-[16/9] overflow-hidden rounded-[14px] md:order-last md:aspect-auto md:min-h-[250px]">
        <UsImage
          photo={photo}
          ratio={4 / 3}
          widths={[400, 640, 900]}
          sizes="(min-width: 1280px) 340px, (min-width: 768px) 40vw, 100vw"
          className="absolute inset-0 h-full w-full"
          alt=""
          decorative
        />
        {item.industry && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {item.industry}
          </span>
        )}
      </div>
      <div className="flex flex-col md:py-1">
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>Today&apos;s practice</Eyebrow>
          {item.done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Check aria-hidden className="h-3.5 w-3.5" /> Done today
            </span>
          ) : (
            <span className="rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground/70 ring-1 ring-inset ring-border">Case</span>
          )}
        </div>
        <h2 id="today-case-title" className="mt-4 font-display text-[25px] leading-[1.2] text-foreground sm:text-[28px]">
          {item.title}
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <MetaChip>{item.typeLabel}</MetaChip>
          <DifficultyPill level={item.difficulty} />
          {item.minutes != null && (
            <span className="inline-flex items-center gap-1.5 px-1 text-[12.5px] text-muted-foreground">
              <Clock aria-hidden className="h-3.5 w-3.5" /> About {item.minutes} min
            </span>
          )}
          {item.points != null && <span className="px-1 text-[12.5px] text-muted-foreground tnum">{item.points} pts</span>}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
          {item.done ? (
            item.done.submissionId ? (
              <Link href={`/results/${item.done.submissionId}`} className={usButton('primary', 'md')}>
                {item.done.score != null ? <>Review your score · <span className="tnum">{item.done.score}</span></> : 'Review your attempt'}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null
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
    <section aria-labelledby="today-sizing-title" className={`${MODULE} flex flex-col p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <IconChip tone="amber" size="sm"><Calculator /></IconChip>
        <p className="text-[13px] font-semibold text-foreground">Today&apos;s market sizing</p>
      </div>
      {item ? (
        <>
          <h2 id="today-sizing-title" className="mt-3.5 text-[16px] font-semibold leading-snug text-foreground">{item.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DifficultyPill level={item.difficulty} />
            {item.minutes != null && (
              <span className="inline-flex items-center gap-1.5 px-1 text-[12.5px] text-muted-foreground">
                <Clock aria-hidden className="h-3.5 w-3.5" /> <span className="sr-only">Time limit: </span>{item.minutes} min
              </span>
            )}
            {item.points != null && <span className="px-1 text-[12.5px] text-muted-foreground tnum">{item.points} pts</span>}
          </div>
          <div className="mt-auto pt-5">
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
          <h2 id="today-sizing-title" className="mt-3.5 text-[15px] font-semibold text-foreground">Today&apos;s question is on its way.</h2>
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconChip tone="red" size="sm"><Flame /></IconChip>
          <p id="streak-title" className="text-[13px] font-semibold text-foreground">Daily streak</p>
        </div>
        <p className="text-[12px] text-muted-foreground">Last 7 days</p>
      </div>
      <p className="mt-3 text-[28px] font-semibold leading-none tracking-tight text-foreground tnum">
        {count > 0 ? (
          <>
            {count} <span className="text-[15px] font-medium text-muted-foreground">{count === 1 ? 'day' : 'days'}</span>
          </>
        ) : (
          <span className="text-[17px] font-semibold">Start a streak today</span>
        )}
      </p>
      <ol className="mt-4 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1.5">
            <span
              className={`h-3.5 w-3.5 rounded-full ${
                d.practiced ? 'bg-primary' : d.isToday ? 'bg-card ring-2 ring-inset ring-primary/60' : 'bg-muted ring-1 ring-inset ring-border'
              }`}
            />
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
    <section aria-labelledby="next-title" className={`${MODULE} p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <IconChip tone="red"><Target /></IconChip>
        <div className="min-w-0 flex-1">
          <p id="next-title" className="text-[13px] font-semibold text-muted-foreground">What to do next</p>
          {a ? (
            <div className="mt-1 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <h3 className="font-display text-[23px] leading-snug text-foreground">{a.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{a.reason}</p>
              </div>
              <Link href={a.href} className={usButton('primary', 'md', 'shrink-0')}>
                {a.cta} <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          ) : model.sessionsUntilAdvice > 0 ? (
            <div className="mt-1">
              <h3 className="font-display text-[21px] leading-snug text-foreground">Your recommendations start after three scored sessions.</h3>
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                Until then, today&apos;s case is the best next step. {3 - model.sessionsUntilAdvice} of 3 done.
              </p>
              <div className="mt-4 flex gap-1.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`h-2 w-12 rounded-full ${i < 3 - model.sessionsUntilAdvice ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <h3 className="font-display text-[21px] leading-snug text-foreground">Nothing stands out. Keep your rhythm.</h3>
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                Your scores are even across what you&apos;ve practiced. Today&apos;s case keeps the streak going.
              </p>
            </div>
          )}
        </div>
      </div>
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
    <section aria-labelledby="plan-title" className={`${MODULE} flex flex-col p-5 ${className}`}>
      <div className="flex items-center gap-3">
        <IconChip tone="amber" size="sm"><Crown /></IconChip>
        <p id="plan-title" className="text-[13px] font-semibold text-foreground">
          {isGuest ? 'No account yet' : tier === 'free' ? 'Free plan' : tier === 'pro' ? 'Pro plan' : 'Lite plan'}
        </p>
      </div>
      {isGuest ? (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">Create a free account to keep your scores, history and streak.</p>
          <div className="mt-4 flex gap-2">
            <Link href="/signup?next=/dashboard" className={usButton('primary', 'sm')}>Create account</Link>
            <Link href="/login?next=/dashboard" className={usButton('ghost', 'sm')}>Log in</Link>
          </div>
        </>
      ) : tier === 'free' ? (
        <>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Today&apos;s case and market sizing question, plus one extra of each. Lite and Pro open the full US bank.
          </p>
          <Link href="/upgrade" className={usButton('secondary', 'sm', 'mt-4 w-full')}>
            View plans
          </Link>
        </>
      ) : (
        <>
          <p className="mt-3 text-[13px] text-muted-foreground">{until ? <>Access through {until}. Nothing renews automatically.</> : 'Active.'}</p>
          <Link href="/upgrade" className={usButton('secondary', 'sm', 'mt-4 w-full')}>
            Manage plan
          </Link>
        </>
      )}
    </section>
  );
}

/* ── Four headline numbers ─────────────────────────────────────────────── */

export function StatCards({ model, className = '' }: { model: UsDashboardModel; className?: string }) {
  const m = model.metrics;
  const cells: { Icon: typeof Network; tone: ChipTone; k: string; v: string; sub?: string; good?: boolean }[] = [
    { Icon: Network, tone: 'red', k: 'Cases practiced', v: String(m.casesPracticed) },
    { Icon: Calculator, tone: 'amber', k: 'Market sizing', v: String(m.sizingPracticed) },
    {
      Icon: Gauge,
      tone: 'emerald',
      k: 'Average case score',
      v: m.avgCaseScore == null ? '—' : String(m.avgCaseScore),
      sub: m.recentDelta == null ? undefined : `${m.recentDelta >= 0 ? '+' : '−'}${Math.abs(m.recentDelta)} last 5 vs previous 5`,
      good: (m.recentDelta ?? 0) >= 0,
    },
    { Icon: BarChart3, tone: 'violet', k: 'Average sizing score', v: m.avgSizingScore == null ? '—' : String(m.avgSizingScore) },
  ];
  return (
    <section aria-label="Your numbers" className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${className}`}>
      {cells.map(({ Icon, tone, k, v, sub, good }) => (
        <div key={k} className={`${MODULE} flex items-center gap-4 p-5`}>
          <IconChip tone={tone}><Icon strokeWidth={1.75} /></IconChip>
          <div className="min-w-0">
            <p className="text-[26px] font-semibold leading-none tracking-tight text-foreground tnum">{v}</p>
            <p className="mt-1.5 text-[12.5px] text-muted-foreground">{k}</p>
            {sub && <p className={`mt-1 text-[11.5px] font-medium ${good ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>{sub}</p>}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ── Pick up where you left off ────────────────────────────────────────── */

export function ContinueSessions({ items, tz, className = '' }: { items: UsDashboardModel['inProgress']; tz: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="continue-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="continue-title" title="Continue where you left off" />
      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.attemptId} className="flex flex-col rounded-[12px] border border-border/80 bg-background/60 p-4">
            <div className="flex items-start gap-3">
              <IconChip tone={it.typeLabel === 'Market sizing' ? 'amber' : 'violet'} size="sm">
                {it.typeLabel === 'Market sizing' ? <Calculator /> : <Network />}
              </IconChip>
              <div className="min-w-0">
                <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">{it.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {it.typeLabel} · started {(() => { const d = relativeDay(it.startedAt, tz); return d === 'Today' || d === 'Yesterday' ? d.toLowerCase() : d; })()}
                </p>
              </div>
            </div>
            <Link href={`/cases/${it.caseId}`} className={usButton('secondary', 'sm', 'mt-4 self-start')}>
              <PlayCircle aria-hidden className="h-4 w-4 text-primary" /> Resume
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Progress chart: sessions per week ─────────────────────────────────── */

export function ProgressChart({ model, className = '', gradientId = 'us-progress-fill' }: { model: UsDashboardModel; className?: string; gradientId?: string }) {
  const total = model.weeks.reduce((a, w) => a + w.cases + w.sizing, 0);
  return (
    <section aria-labelledby="progress-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="progress-title" title="Your progress" action={{ href: '/history', label: 'All sessions' }} />
      <p className="mt-1 text-[13px] text-muted-foreground">Sessions per week over the last 8 weeks.</p>
      {total === 0 ? (
        <p className="mt-6 rounded-[12px] border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
          Your first session starts this chart.
        </p>
      ) : (
        <WeeklyLine weeks={model.weeks} gradientId={gradientId} />
      )}
    </section>
  );
}

function WeeklyLine({ weeks, gradientId }: { weeks: UsDashboardModel['weeks']; gradientId: string }) {
  const totals = weeks.map((w) => w.cases + w.sizing);
  const max = Math.max(4, ...totals);
  const W = 520;
  const H = 170;
  const padT = 18;
  const step = W / (weeks.length - 1);
  const y = (v: number) => padT + (H - padT) * (1 - v / max);
  const pts = totals.map((t, i) => [i * step, y(t)] as const);
  const line = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${yy.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <figure className="mt-5">
      <svg viewBox={`-6 0 ${W + 12} ${H + 26}`} role="img" aria-label="Sessions per week for the last eight weeks" className="h-auto w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C8102E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={0} x2={W} y1={padT + (H - padT) * f} y2={padT + (H - padT) * f} className="stroke-border" strokeDasharray="3 5" />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, yy], i) => (
          <circle key={i} cx={x} cy={yy} r={i === pts.length - 1 ? 5 : 3.2} className={i === pts.length - 1 ? 'fill-primary' : 'fill-card stroke-primary'} strokeWidth="2" />
        ))}
        <g transform={`translate(${Math.min(last[0] - 44, W - 88)}, ${Math.max(0, last[1] - 44)})`}>
          <rect width="84" height="30" rx="8" className="fill-card stroke-border" />
          <text x="42" y="19.5" textAnchor="middle" className="fill-foreground" style={{ fontSize: 12, fontWeight: 600 }}>
            {totals[totals.length - 1]} this week
          </text>
        </g>
        {weeks.map((w, i) =>
          i % 2 === 1 || i === weeks.length - 1 ? (
            <text
              key={w.start}
              x={i * step}
              y={H + 20}
              textAnchor={i === weeks.length - 1 ? 'end' : 'middle'}
              className="fill-muted-foreground"
              style={{ fontSize: 12 }}
            >
              {i === weeks.length - 1 ? 'This week' : w.label}
            </text>
          ) : null,
        )}
      </svg>
      <table className="sr-only">
        <caption>Sessions per week</caption>
        <thead><tr><th>Week starting</th><th>Cases</th><th>Market sizing</th></tr></thead>
        <tbody>{weeks.map((w) => <tr key={w.start}><td>{w.label}</td><td>{w.cases}</td><td>{w.sizing}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}

/* ── Performance by case type ──────────────────────────────────────────── */

export function TypePerformance({ stats, focusType, className = '' }: { stats: UsTypeStat[]; focusType: string | null; className?: string }) {
  const tried = stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const untried = stats.filter((s) => s.count === 0);
  return (
    <section aria-labelledby="type-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="type-title" title="Performance by case type" />
      <p className="mt-1 text-[13px] text-muted-foreground">Average score out of 100.</p>
      {!tried.length ? (
        <p className="mt-6 rounded-[12px] border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
          Scores by case type appear after your first scored session.
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-4">
            {tried.map((s) => {
              const focus = s.type === focusType;
              return (
                <li key={s.type}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="font-medium text-foreground">
                      {s.label}
                      {focus && <span className="ml-2 rounded-full bg-primary/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Focus</span>}
                    </span>
                    <span className="text-muted-foreground tnum">
                      <span className="font-semibold text-foreground">{s.avg ?? '—'}</span> · {s.count} {s.count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                  <div aria-hidden className="mt-1.5 h-2 w-full rounded-full bg-muted">
                    <div className={`h-2 rounded-full ${focus ? 'bg-primary' : 'bg-primary/55'}`} style={{ width: `${Math.max(2, s.avg ?? 0)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {untried.length > 0 && (
            <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
              Not yet practiced: {untried.map((s) => s.label).join(', ')}.
            </p>
          )}
        </>
      )}
    </section>
  );
}

/* ── Recent activity ───────────────────────────────────────────────────── */

export function RecentActivity({ items, tz, className = '' }: { items: UsDashboardModel['activity']; tz: string; className?: string }) {
  return (
    <section aria-labelledby="activity-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="activity-title" title="Recent activity" action={items.length > 0 ? { href: '/history', label: 'View all' } : undefined} />
      {items.length === 0 ? (
        <p className="mt-4 text-[14px] text-muted-foreground">Nothing yet. Your sessions will be listed here, newest first.</p>
      ) : (
        <ol className="mt-4 divide-y divide-border/70">
          {items.map((it) => (
            <li key={it.id}>
              <Link href={`/results/${it.id}`} className="group flex items-center gap-3.5 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[8px]">
                <IconChip tone={it.kind === 'sizing' ? 'amber' : 'violet'} size="sm">
                  {it.kind === 'sizing' ? <Calculator /> : <Network />}
                </IconChip>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-muted-foreground">{it.kind === 'sizing' ? 'Market sizing' : it.typeLabel}</p>
                  <p className="truncate text-[14px] font-medium text-foreground group-hover:text-primary">{it.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  {it.score != null ? (
                    <p className="text-[14px] font-semibold text-foreground tnum">{it.score}</p>
                  ) : (
                    <p className="text-[12px] text-muted-foreground">Unscored</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">{relativeDay(it.at, tz)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

