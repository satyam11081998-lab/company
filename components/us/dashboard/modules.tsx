import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Calculator,
  ChartColumn,
  Check,
  Clock,
  Crown,
  FileText,
  Flame,
  Gauge,
  Network,
  Plus,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Target,
} from 'lucide-react';
import { IconChip, US_CARD, UsImage, usButton, type ChipTone } from '@/components/us/ui';
import { dailyLine } from '@/lib/us-market/quotes';
import { photoForAdvice, photoForCase, skylineForDay } from '@/lib/us-market/assets';
import type { UsDashboardModel, UsInProgress, UsTodayItem, UsTypeStat } from '@/lib/us-market/dashboard';
import { lastSevenDays, relativeDay, shortDate } from '@/components/us/dashboard/format';
import WeeklyChart from '@/components/us/dashboard/weekly-chart';

/**
 * US dashboard modules (v3, 2026-09-27) — server components, each answering
 * ONE question. White cards, tinted icon chips, serif titles; photography
 * shows what today's items are ABOUT (lib/us-market/assets.ts: topic photos,
 * one skyline a day). No coloured side or top rules on any tile.
 */

const MODULE = US_CARD;

function ModuleHeader({
  title,
  id,
  sub,
  action,
}: {
  title: string;
  id?: string;
  sub?: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 id={id} className="font-display text-[19px] font-semibold leading-tight text-foreground">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-muted-foreground">{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
          {action.label} <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

const DIFFICULTY = {
  easy: { Icon: SignalLow, text: 'text-emerald-700 dark:text-emerald-400', pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
  medium: { Icon: SignalMedium, text: 'text-amber-700 dark:text-amber-400', pill: 'bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300' },
  hard: { Icon: SignalHigh, text: 'text-primary', pill: 'bg-rose-50 text-rose-700 dark:bg-primary/15 dark:text-rose-300' },
} as const;

const diffOf = (level: string) => DIFFICULTY[(level in DIFFICULTY ? level : 'medium') as keyof typeof DIFFICULTY];

function Difficulty({ level }: { level: string }) {
  const d = diffOf(level);
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold capitalize ${d.text}`}>
      <d.Icon aria-hidden className="h-4 w-4" strokeWidth={2.25} />
      <span className="sr-only">Difficulty: </span>
      {level}
    </span>
  );
}

function DifficultyPill({ level }: { level: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold capitalize ${diffOf(level).pill}`}>
      <span className="sr-only">Difficulty: </span>
      {level}
    </span>
  );
}

function DoneChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11.5px] font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
      <Check aria-hidden className="h-3.5 w-3.5" /> Done today
    </span>
  );
}

/* ── Greeting, today's line and the day's skyline ──────────────────────── */

/**
 * The skyline behind the greeting: one US city a day, faded into the page on
 * its left and bottom edges and washed pale at the top so the line of the day
 * reads cleanly over it. Rendered by the dashboard layout as the first child
 * of a full-width `relative isolate` wrapper so it can run to the right edge.
 */
export function SkylineBanner({ dayKey }: { dayKey: string }) {
  const sky = skylineForDay(dayKey);
  const fadeX = 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 18%, #000 45%)';
  const fadeY = 'linear-gradient(to bottom, #000 0%, #000 52%, transparent 100%)';
  return (
    <div aria-hidden className="pointer-events-none absolute right-0 top-0 -z-10 h-[220px] w-[92%] overflow-hidden sm:h-[280px] md:w-[64%] lg:h-[340px] lg:w-[58%]">
      <div className="h-full w-full" style={{ WebkitMaskImage: fadeX, maskImage: fadeX }}>
        <div className="h-full w-full" style={{ WebkitMaskImage: fadeY, maskImage: fadeY }}>
          <UsImage
            photo={sky}
            decorative
            priority
            sizes="(min-width: 1024px) 58vw, 92vw"
            widths={[640, 960, 1280, 1680]}
            className="h-full w-full opacity-45 sm:opacity-70 md:opacity-100 dark:opacity-30 sm:dark:opacity-35 md:dark:opacity-40"
          />
        </div>
      </div>
      {/* a soft pale pool behind the line of the day, so it reads on any sky */}
      <div className="absolute right-0 top-0 h-[190px] w-[520px] max-w-full bg-[radial-gradient(closest-side_at_62%_42%,hsl(var(--background)/0.88),hsl(var(--background)/0.55)_55%,transparent)]" />
    </div>
  );
}

export function Greeting({
  greeting,
  firstName,
  dateLabel,
  dayKey,
}: {
  greeting: string;
  firstName: string | null;
  dateLabel: string;
  dayKey: string;
}) {
  const line = dailyLine(dayKey);
  return (
    <header className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,340px)] md:items-start">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{dateLabel}</p>
        <h1 className="mt-3 font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.015em] text-foreground sm:text-[42px] lg:text-[46px]">
          {greeting}
          {firstName ? <>, {firstName}</> : null}
          <span className="text-primary">.</span>
        </h1>
        <p className="mt-3 text-[16px] text-muted-foreground sm:text-[17px]">Let&apos;s make progress toward your goals today.</p>
      </div>
      <figure className="md:justify-self-end md:pt-2 md:text-right">
        <blockquote className="font-display text-[19px] italic leading-snug text-foreground sm:text-[22px]">
          <p>&ldquo;{line}&rdquo;</p>
        </blockquote>
        <figcaption className="sr-only">Today&apos;s line. A new one appears every day.</figcaption>
        <span aria-hidden className="mt-4 block h-[2px] w-10 rounded-full bg-primary md:ml-auto" />
      </figure>
    </header>
  );
}

/* ── Today's case: the primary module ─────────────────────────────────── */

export function TodayPractice({ item, className = '' }: { item: UsTodayItem | null; className?: string }) {
  if (!item) {
    return (
      <section id="today" aria-labelledby="today-case-title" className={`${MODULE} flex scroll-mt-28 flex-col justify-center p-7 ${className}`}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">Today&apos;s practice</p>
        <h2 id="today-case-title" className="mt-4 font-display text-[26px] font-semibold leading-tight text-foreground">
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
  const photo = photoForCase({ industry: item.industry, title: item.title, type: item.type, seed: item.id });
  return (
    <section
      id="today"
      aria-labelledby="today-case-title"
      className={`${MODULE} grid scroll-mt-28 grid-cols-1 overflow-hidden md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] ${className}`}
    >
      <div className="relative m-2 mb-0 aspect-[16/9] overflow-hidden rounded-[12px] md:order-last md:m-2 md:ml-0 md:aspect-auto md:min-h-[320px]">
        <UsImage
          photo={photo}
          decorative
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 42vw, 100vw"
          widths={[480, 720, 960]}
          className="absolute inset-0 h-full w-full"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-x-4 bottom-3.5 text-right text-white">
          <p className="font-display text-[16px] font-semibold leading-tight [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">{item.industry ?? item.typeLabel}</p>
          <p className="mt-0.5 text-[11.5px] text-white/90">{item.typeLabel} · Case of the day</p>
        </div>
      </div>
      <div className="flex flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primary">Today&apos;s practice</p>
          {item.done ? (
            <DoneChip />
          ) : (
            <span className="rounded-[6px] bg-muted px-2 py-0.5 text-[11.5px] font-semibold text-foreground/75">Case</span>
          )}
        </div>
        <h2 id="today-case-title" className="mt-4 font-display text-[25px] font-semibold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[28px] xl:text-[26px] min-[1400px]:text-[29px]">
          {item.title}
        </h2>
        {item.blurb && <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-muted-foreground">{item.blurb}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          {item.minutes != null && (
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <Clock aria-hidden className="h-4 w-4 text-muted-foreground" /> {item.minutes} min
            </span>
          )}
          <Difficulty level={item.difficulty} />
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[12px] font-medium text-foreground/80">{item.typeLabel}</span>
          {item.points != null && (
            <span className="inline-flex items-center gap-0.5 font-medium text-foreground/80 tnum">
              <Plus aria-hidden className="h-3.5 w-3.5" /> {item.points} pts
            </span>
          )}
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
            <Link href={`/cases/${item.id}`} className={usButton('primary', 'md', 'px-5')}>
              Start practicing <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          )}
          <Link href="/practice?tab=scored" className={usButton('secondary', 'md', 'px-5')}>
            Browse cases
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Today's market sizing ─────────────────────────────────────────────── */

export function TodaySizing({ item, className = '' }: { item: UsTodayItem | null; className?: string }) {
  if (!item) {
    return (
      <section aria-labelledby="today-sizing-title" className={`${MODULE} flex flex-col p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <IconChip tone="amber" size="sm" square><Calculator /></IconChip>
          <p className="text-[14px] font-semibold text-foreground">Today&apos;s market sizing</p>
        </div>
        <h2 id="today-sizing-title" className="mt-4 font-display text-[19px] font-semibold text-foreground">Today&apos;s question is on its way.</h2>
        <Link href="/practice?tab=guesstimates" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
          Browse market sizing <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>
    );
  }
  const photo = photoForCase({ title: item.title, type: 'guesstimate', seed: item.id });
  return (
    <section aria-labelledby="today-sizing-title" className={`${MODULE} grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(0,1fr)_minmax(0,0.6fr)] ${className}`}>
      <div className="relative h-[170px] sm:order-last sm:h-auto sm:min-h-[230px]">
        <UsImage photo={photo} decorative sizes="(min-width: 1024px) 220px, (min-width: 640px) 40vw, 100vw" widths={[320, 480, 720]} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3">
          <IconChip tone="amber" size="sm" square><Calculator /></IconChip>
          <p className="text-[14px] font-semibold text-foreground">Today&apos;s market sizing</p>
        </div>
        <h2 id="today-sizing-title" className="mt-4 font-display text-[19px] font-semibold leading-snug text-foreground">{item.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[12.5px] text-muted-foreground">
          <DifficultyPill level={item.difficulty} />
          {item.minutes != null && (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="h-3.5 w-3.5" /> {item.minutes} min
            </span>
          )}
          {item.done && <DoneChip />}
        </div>
        <div className="mt-auto pt-6">
          {item.done ? (
            item.done.submissionId ? (
              <Link href={`/results/${item.done.submissionId}`} className={usButton('secondary', 'md', 'w-full')}>
                {item.done.score != null ? <>Review your score · <span className="tnum">{item.done.score}</span></> : 'Review your answer'}
              </Link>
            ) : null
          ) : (
            <Link href={`/cases/${item.id}`} className={usButton('secondary', 'md', 'w-full')}>
              Start estimating <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
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
          <IconChip tone="red" size="sm" square><Flame /></IconChip>
          <p id="streak-title" className="text-[14px] font-semibold text-foreground">Daily streak</p>
        </div>
        <p className="text-[12px] text-muted-foreground">Last 7 days</p>
      </div>
      <p className="mt-4 font-display text-[21px] font-semibold leading-tight text-foreground">
        {count > 0 ? <>{count}-day streak</> : 'Start a streak today'}
      </p>
      <ol className="mt-4 grid grid-cols-7 gap-1">
        {days.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-2">
            <span
              aria-hidden
              className={`h-4 w-4 rounded-full ${
                d.practiced ? 'bg-primary' : d.isToday ? 'bg-card ring-2 ring-inset ring-primary' : 'bg-muted ring-1 ring-inset ring-border'
              }`}
            />
            <span aria-hidden className={`text-[11px] ${d.isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{d.initial}</span>
            <span className="sr-only">
              {d.name}
              {d.isToday ? ' (today)' : ''}: {d.practiced ? 'practiced' : 'not practiced'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ── What to do next ───────────────────────────────────────────────────── */

export function NextBestAction({
  model,
  todayHref,
  className = '',
}: {
  model: UsDashboardModel;
  todayHref: string | null;
  className?: string;
}) {
  const a = model.nextAction;
  const photo = photoForAdvice(a?.focusType);
  const fade = 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.55) 30%, #000 70%)';
  const done = 3 - model.sessionsUntilAdvice;
  return (
    <section aria-labelledby="next-title" className={`${MODULE} relative overflow-hidden ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] sm:block">
        <div className="h-full w-full" style={{ WebkitMaskImage: fade, maskImage: fade }}>
          <UsImage photo={photo} decorative sizes="(min-width: 1024px) 300px, 40vw" widths={[320, 480, 720]} className="h-full w-full dark:opacity-70" />
        </div>
      </div>
      <div aria-hidden className="relative h-[140px] sm:hidden">
        <UsImage photo={photo} decorative sizes="100vw" widths={[480, 720]} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="relative flex h-full flex-col p-6 sm:max-w-[64%] sm:p-7">
        <div className="flex items-start gap-4">
          <IconChip tone="red"><Target /></IconChip>
          <div className="min-w-0">
            <p id="next-title" className="text-[13px] font-medium text-muted-foreground">What to do next</p>
            <h3 className="mt-1 font-display text-[24px] font-semibold leading-snug text-foreground sm:text-[26px] xl:text-[24px] min-[1400px]:text-[26px]">
              {a ? a.title : model.sessionsUntilAdvice > 0 ? 'Build your baseline' : 'Keep your rhythm'}
            </h3>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          {a
            ? a.reason
            : model.sessionsUntilAdvice > 0
            ? `Personal recommendations start after three scored sessions. ${done} of 3 done. Until then, today’s case is the best next step.`
            : 'Your scores are even across what you’ve practiced. Today’s case keeps the streak going.'}
        </p>
        {!a && model.sessionsUntilAdvice > 0 && (
          <div className="mt-4 flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-1.5 w-12 rounded-full ${i < done ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6">
          {a ? (
            <Link href={a.href} className={usButton('primary', 'md', 'px-5')}>
              {a.cta} <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : todayHref ? (
            <Link href={todayHref} className={usButton('primary', 'md', 'px-5')}>
              Start today&apos;s case <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/practice?tab=scored" className={usButton('primary', 'md', 'px-5')}>
              Browse cases <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          )}
          <Link href="#skill-map" className="text-[13.5px] font-medium text-foreground underline decoration-foreground/30 underline-offset-4 hover:text-primary hover:decoration-primary">
            See your skill map
          </Link>
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
  const name = isGuest ? 'No account yet' : tier === 'free' ? 'Free plan' : tier === 'pro' ? 'Pro plan' : 'Lite plan';
  const sub = isGuest
    ? 'Keep your scores, history and streak'
    : tier === 'free'
    ? 'Today’s pair plus one extra of each'
    : until
    ? `Active · Full access through ${until}`
    : 'Active · Full access';
  return (
    <section aria-labelledby="plan-title" className={`${MODULE} flex flex-col p-5 ${className}`}>
      <div className="flex items-center gap-3.5">
        <IconChip tone="amber"><Crown /></IconChip>
        <div className="min-w-0">
          <p id="plan-title" className="font-display text-[18px] font-semibold leading-tight text-foreground">{name}</p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{sub}</p>
        </div>
      </div>
      {isGuest ? (
        <div className="mt-4 flex gap-2">
          <Link href="/signup?next=/dashboard" className={usButton('primary', 'sm', 'flex-1')}>Create account</Link>
          <Link href="/login?next=/dashboard" className={usButton('secondary', 'sm')}>Log in</Link>
        </div>
      ) : (
        <Link href="/upgrade" className={usButton('secondary', 'md', 'mt-4 w-full')}>
          {tier === 'free' ? 'See plans' : 'Manage plan'} <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}

/* ── Four headline numbers ─────────────────────────────────────────────── */

type Trend = { dir: 'up' | 'down' | 'flat'; text: string; sr: string };

function countTrend(n: number): Trend {
  return n > 0 ? { dir: 'up', text: `${n} this week`, sr: `${n} this week` } : { dir: 'flat', text: 'None yet this week', sr: 'none yet this week' };
}

function deltaTrend(delta: number | null, scored: number): Trend {
  if (delta == null) return { dir: 'flat', text: scored ? `Across ${scored} scored` : 'No scores yet', sr: scored ? `across ${scored} scored sessions` : 'no scores yet' };
  if (delta === 0) return { dir: 'flat', text: 'Level with previous 5', sr: 'level: last 5 average equals the previous 5' };
  const up = delta > 0;
  return {
    dir: up ? 'up' : 'down',
    text: `${Math.abs(delta)} last 5 vs previous 5`,
    sr: `${up ? 'up' : 'down'} ${Math.abs(delta)} points, last 5 versus the previous 5`,
  };
}

export function StatCards({ model, className = '', cols = 4 }: { model: UsDashboardModel; className?: string; cols?: 2 | 4 }) {
  const m = model.metrics;
  const cells: { Icon: typeof Network; tone: ChipTone; k: string; v: string; trend: Trend }[] = [
    { Icon: FileText, tone: 'red', k: 'Cases practiced', v: String(m.casesPracticed), trend: countTrend(m.casesThisWeek) },
    { Icon: BarChart3, tone: 'amber', k: 'Market sizing', v: String(m.sizingPracticed), trend: countTrend(m.sizingThisWeek) },
    { Icon: Gauge, tone: 'emerald', k: 'Average case score', v: m.avgCaseScore == null ? '—' : String(m.avgCaseScore), trend: deltaTrend(m.recentDelta, m.scoredCases) },
    { Icon: ChartColumn, tone: 'violet', k: 'Average sizing score', v: m.avgSizingScore == null ? '—' : String(m.avgSizingScore), trend: deltaTrend(m.sizingDelta, m.scoredSizing) },
  ];
  return (
    <section aria-label="Your numbers" className={`grid grid-cols-2 gap-3 sm:gap-4 ${cols === 4 ? 'xl:grid-cols-4' : ''} ${className}`}>
      {cells.map(({ Icon, tone, k, v, trend }) => (
        <div key={k} className={`${MODULE} flex flex-col items-start gap-3 p-4 sm:flex-row sm:gap-4 sm:p-5 xl:gap-3 xl:p-4 min-[1400px]:gap-4 min-[1400px]:p-5`}>
          <IconChip tone={tone} square><Icon strokeWidth={1.75} /></IconChip>
          <div className="min-w-0">
            <p className="text-[28px] font-semibold leading-none tracking-tight text-foreground tnum">{v}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">{k}</p>
            <p
              className={`mt-2 flex items-start gap-1 text-[12px] font-medium leading-snug ${
                trend.dir === 'up' ? 'text-emerald-700 dark:text-emerald-400' : trend.dir === 'down' ? 'text-rose-700 dark:text-rose-300' : 'text-muted-foreground'
              }`}
            >
              {trend.dir === 'up' && <ArrowUp aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />}
              {trend.dir === 'down' && <ArrowDown aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />}
              <span aria-hidden>{trend.text}</span>
              <span className="sr-only">{trend.sr}</span>
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

/* ── Pick up where you left off ────────────────────────────────────────── */

export function ContinueSessions({ items, tz, className = '' }: { items: UsInProgress[]; tz: string; className?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="continue-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="continue-title" title="Continue where you left off" action={{ href: '/history', label: 'View all' }} />
      <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((it) => {
          const photo = photoForCase({ title: it.title, type: it.type, seed: it.caseId });
          const rel = relativeDay(it.startedAt, tz);
          return (
            <li key={it.attemptId} className="flex gap-4 rounded-[12px] border border-border/80 bg-card p-3">
              <div className="relative min-h-[118px] w-[92px] shrink-0 overflow-hidden rounded-[10px]">
                <UsImage photo={photo} decorative sizes="92px" widths={[184, 276]} ratio={92 / 118} className="absolute inset-0 h-full w-full" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
                <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">{it.title}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {it.typeLabel} · started {rel === 'Today' || rel === 'Yesterday' ? rel.toLowerCase() : rel}
                </p>
                {it.progressPct != null && (
                  <div className="mt-3 flex items-center gap-2.5" title="Estimated from how far the conversation has gone">
                    <div aria-hidden className="h-1.5 flex-1 rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${it.progressPct}%` }} />
                    </div>
                    <span aria-hidden className="text-[12px] font-medium text-foreground/80 tnum">{it.progressPct}%</span>
                    <span className="sr-only">About {it.progressPct}% through, estimated from the conversation so far.</span>
                  </div>
                )}
                <Link href={`/cases/${it.caseId}`} className={usButton('secondary', 'sm', 'mt-3 self-start')}>
                  Resume <ArrowRight aria-hidden className="h-4 w-4" />
                  <span className="sr-only">: {it.title}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── Progress chart: sessions per week ─────────────────────────────────── */

export function ProgressChart({ model, className = '', selectable = true }: { model: UsDashboardModel; className?: string; selectable?: boolean }) {
  return <WeeklyChart weeks={model.weeks} selectable={selectable} className={className} />;
}

/* ── Performance by case type ──────────────────────────────────────────── */

export function TypePerformance({ stats, focusType, className = '' }: { stats: UsTypeStat[]; focusType: string | null; className?: string }) {
  const tried = stats.filter((s) => s.count > 0).sort((a, b) => b.count - a.count);
  const untried = stats.filter((s) => s.count === 0);
  return (
    <section aria-labelledby="type-title" className={`${MODULE} p-6 ${className}`}>
      <ModuleHeader id="type-title" title="Performance by case type" sub="Average score out of 100." />
      {!tried.length ? (
        <p className="mt-6 rounded-[12px] border border-dashed border-border px-4 py-10 text-center text-[13px] text-muted-foreground">
          Scores by case type appear after your first scored session.
        </p>
      ) : (
        <>
          <ul className="mt-5 space-y-5">
            {tried.map((s) => {
              const focus = s.type === focusType;
              return (
                <li key={s.type}>
                  <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className="font-medium text-foreground">
                      {s.label}
                      {focus && (
                        <span className="ml-2.5 rounded-[6px] bg-primary/[0.08] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary">
                          Focus
                        </span>
                      )}
                    </span>
                    <span className="text-muted-foreground tnum">
                      <span className="font-semibold text-foreground">{s.avg ?? '—'}</span> · {s.count} {s.count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                  <div aria-hidden className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(2, s.avg ?? 0)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          {untried.length > 0 && (
            <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
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
        <ol className="relative mt-4">
          <span aria-hidden className="absolute bottom-6 left-[4.5px] top-6 w-px bg-border" />
          {items.map((it) => (
            <li key={it.id} className="relative pl-6">
              <span aria-hidden className="absolute left-0 top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full border-[1.5px] border-foreground/35 bg-card" />
              <Link
                href={`/results/${it.id}`}
                className="group flex items-center gap-3 rounded-[8px] py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <IconChip tone={it.kind === 'sizing' ? 'amber' : 'violet'} size="sm" square>
                  {it.kind === 'sizing' ? <Calculator /> : <Network />}
                </IconChip>
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] text-muted-foreground">{it.kind === 'sizing' ? 'Market sizing' : it.typeLabel}</p>
                  <p className="truncate text-[13.5px] font-medium text-foreground group-hover:text-primary">{it.title}</p>
                </div>
                <div className="shrink-0 text-right">
                  {it.score != null ? (
                    <p className="text-[14px] font-semibold text-foreground tnum">
                      <span className="sr-only">Score </span>
                      {it.score}
                    </p>
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
