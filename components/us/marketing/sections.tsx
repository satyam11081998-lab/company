import Link from 'next/link';
import {
  ArrowRight,
  Calculator,
  ChevronRight,
  CircleCheck,
  CirclePlay,
  Flag,
  Gauge,
  Lightbulb,
  MessagesSquare,
  Network,
  ScanSearch,
  Sigma,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Dot, Eyebrow, IconChip, SectionHeading, US_CARD, UsImage, usButton, type ChipTone } from '@/components/us/ui';
import { IssueTreeArt } from '@/components/us/art';
import StartButton from '@/components/us/marketing/start-button';
import StartCaseButton from '@/components/us/marketing/start-case-button';
import { US_PHOTOS } from '@/lib/us-market/assets';
import { US_CASE_TYPE_LABEL } from '@/lib/us-market';
import type { UsCase, UsGuesstimate } from '@/lib/us-market/types';

const WRAP = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6';

/* ════════════════════════════════════════════════════════════════════════
   1 · HERO — headline left, full-bleed photograph right, today's real case
   ════════════════════════════════════════════════════════════════════════ */

type HeroToday = { id: string | null; title: string; typeLabel: string; difficulty: string; minutes: number | null; isDaily: boolean };

export function Hero({ today }: { today: HeroToday }) {
  return (
    <section className="relative overflow-hidden">
      {/* Soft warm glow behind the headline */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-rose-100/50 blur-3xl dark:bg-primary/10" />

      {/* Desktop: the photograph bleeds to the right edge and fades into the page. */}
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
        <UsImage
          photo={US_PHOTOS.hero}
          priority
          widths={[720, 1080, 1440, 1920]}
          sizes="48vw"
          className="h-full w-full"
          decorative
        />
        <div className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />
      </div>

      <div className={`${WRAP} relative grid grid-cols-1 items-center gap-10 pb-14 pt-12 sm:pt-16 lg:min-h-[620px] lg:grid-cols-12 lg:pb-16 lg:pt-8`}>
        <div className="lg:col-span-7 lg:pr-10">
          <Eyebrow>Built for ambitious minds</Eyebrow>
          <h1 className="mt-6 font-display text-[42px] leading-[1.06] tracking-[-0.02em] text-foreground sm:text-[54px] lg:text-[44px] xl:text-[52px]">
            Master business thinking<Dot />
            <span className="block">Prepare like a consultant<Dot /></span>
          </h1>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-muted-foreground sm:text-[18px]">
            Daily case practice, market sizing and an AI interviewer that asks follow-ups, then scores your
            structure, math and judgment. For consulting, strategy, product and finance interviews.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton />
            <a href="#how-it-works" className={usButton('secondary', 'lg')}>
              <CirclePlay aria-hidden className="h-[18px] w-[18px] text-primary" />
              See how it works
            </a>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-muted-foreground">
            {['Free daily case', 'No credit card', 'Scored in about a minute'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <CircleCheck aria-hidden className="h-4 w-4 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative lg:col-span-5 lg:min-h-[500px]">
          {/* Phone / tablet: the photograph as a rounded block. */}
          <div className="relative overflow-hidden rounded-[20px] lg:hidden">
            <UsImage photo={US_PHOTOS.hero} priority ratio={4 / 3} widths={[480, 720, 960]} sizes="100vw" className="aspect-[4/3] w-full" />
          </div>

          {/* Example score card, floating top-right on desktop. */}
          <div className={`${US_CARD} absolute right-0 top-6 hidden w-[240px] p-4 lg:block`}>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold text-foreground">Case score</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/75">Example</span>
            </div>
            <p className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-foreground tnum">
              84<span className="text-[14px] font-medium text-muted-foreground">/100</span>
            </p>
            <ul className="mt-3 space-y-2">
              {[
                ['Structure', 22, 25],
                ['Quantitative', 17, 20],
                ['Synthesis', 16, 20],
              ].map(([k, v, max]) => (
                <li key={k as string}>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>{k}</span>
                    <span className="tnum">{v}/{max}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${((v as number) / (max as number)) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Today's real case. */}
          <div className={`${US_CARD} relative -mt-14 mx-3 p-5 sm:mx-8 lg:absolute lg:bottom-4 lg:-left-6 lg:mx-0 lg:mt-0 lg:w-[360px]`}>
            <div className="flex items-center gap-3">
              <IconChip tone="red" size="sm"><Network /></IconChip>
              <p className="text-[12px] font-semibold text-primary">{today.isDaily ? "Today's case · free" : 'From the case bank'}</p>
            </div>
            <p className="mt-3 font-display text-[21px] leading-snug text-foreground">{today.title}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {today.typeLabel} · <span className="capitalize">{today.difficulty}</span>
              {today.minutes ? <> · about {today.minutes} min</> : null}
            </p>
            {today.id && (
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-[12px] text-muted-foreground">No sign-up needed</span>
                <StartCaseButton caseId={today.id} label="Start this case" size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   2 · FEATURE STRIP — five tinted icons, no dividers
   ════════════════════════════════════════════════════════════════════════ */

const FEATURES = [
  { Icon: Network, title: 'Case practice', text: '50 cases set in US markets' },
  { Icon: Calculator, title: 'Market sizing', text: '50 estimation questions' },
  { Icon: MessagesSquare, title: 'AI interviewer', text: 'Follow-ups and pushback' },
  { Icon: Gauge, title: 'Scored feedback', text: 'Six dimensions in a minute' },
  { Icon: TrendingUp, title: 'Progress tracking', text: 'Trend, weak spots, next step' },
];

export function CapabilityStrip() {
  return (
    <section aria-label="What MECE includes" className="relative border-y border-border/70 bg-card">
      <ul className={`${WRAP} grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-5`}>
        {FEATURES.map(({ Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3.5">
            <IconChip tone="red"><Icon strokeWidth={1.75} /></IconChip>
            <div>
              <p className="text-[15px] font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · INTERVIEW STYLES — names as quiet wordmarks; no logos, no counts
   ════════════════════════════════════════════════════════════════════════ */

const STYLES = ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Oliver Wyman', 'L.E.K.', 'Kearney', 'EY-Parthenon'];

export function AudienceStrip() {
  return (
    <section aria-label="Interview styles" className={`${WRAP} py-12 text-center`}>
      <p className="text-[14px] text-muted-foreground">Cases written in the interview styles of</p>
      <ul className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-x-9 gap-y-3">
        {STYLES.map((s) => (
          <li key={s} className="whitespace-nowrap text-[19px] font-semibold tracking-[-0.01em] text-foreground/60">
            {s}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-[12px] text-muted-foreground">Interview styles only. MECE is independent and not affiliated with any firm.</p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4 · EVERYTHING IN ONE PLACE — heading left, four product cards right
   ════════════════════════════════════════════════════════════════════════ */

export function PracticeModes({ cases, guesstimates }: { cases: UsCase[]; guesstimates: UsGuesstimate[] }) {
  const c = cases[0];
  const g = guesstimates[0];
  const cards: { Icon: typeof Network; tone: ChipTone; title: string; text: string; href: string; cta: string }[] = [
    {
      Icon: Network,
      tone: 'violet',
      title: 'Case interview practice',
      text: c ? `Realistic US business problems, like “${c.title}” (${US_CASE_TYPE_LABEL[c.type].toLowerCase()}).` : 'Realistic US business problems with a worked solution.',
      href: '/us/case-interview-examples',
      cta: 'See the cases',
    },
    {
      Icon: Calculator,
      tone: 'amber',
      title: 'Market sizing',
      text: g ? `Estimation questions anchored in US numbers, like “${g.title}”` : 'Estimation questions anchored in US numbers.',
      href: '/us/market-sizing-questions',
      cta: 'See the questions',
    },
    {
      Icon: MessagesSquare,
      tone: 'sky',
      title: 'An AI interviewer',
      text: 'Ask for data, get pushback, defend your structure. It answers like a case interviewer, not a quiz.',
      href: '#how-it-works',
      cta: 'How it works',
    },
    {
      Icon: Gauge,
      tone: 'red',
      title: 'Scored feedback',
      text: 'A score out of 100 on six dimensions, a worked solution and the one thing to fix next.',
      href: '#how-scoring-works',
      cta: 'How scoring works',
    },
  ];
  return (
    <section id="practice-modes" className="scroll-mt-24 bg-secondary/50">
      <div className={`${WRAP} grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:items-center lg:py-28`}>
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="One place to prepare"
            title={<>Everything you need for interview day<Dot /></>}
            lead="From today's free case to a full bank of cases and market sizing questions, MECE gives you the reps, the feedback and the plan."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/practice" className={usButton('primary', 'lg')}>
              Explore the case bank <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
          {cards.map(({ Icon, tone, title, text, href, cta }) => (
            <li key={title} className={`${US_CARD} group flex flex-col p-6 transition-transform duration-200 hover:-translate-y-0.5`}>
              <IconChip tone={tone} square><Icon strokeWidth={1.75} /></IconChip>
              <h3 className="mt-5 text-[17px] font-semibold text-foreground">{title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted-foreground">{text}</p>
              <Link href={href} className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                {cta} <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5 · HOW IT WORKS — three steps and an example exchange
   ════════════════════════════════════════════════════════════════════════ */

const STEPS = [
  { title: 'Pick a case', text: "Start with today's free case or market sizing question, or choose from 100 in the bank." },
  { title: 'Run the interview', text: 'Ask clarifying questions, lay out your structure and do the math out loud. The interviewer pushes back.' },
  { title: 'Get scored', text: 'A score out of 100 across six dimensions in about a minute, with a worked solution to compare.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="scroll-mt-24">
      <div className={`${WRAP} grid grid-cols-1 gap-12 py-20 lg:grid-cols-12 lg:items-center lg:py-28`}>
        <div className="lg:col-span-5">
          <SectionHeading id="how-title" eyebrow="How it works" title={<>A real interview, not a quiz<Dot /></>} />
          <ol className="mt-10 space-y-7">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-[15px] font-semibold text-primary ring-1 ring-inset ring-rose-100 dark:bg-primary/15 dark:text-rose-300 dark:ring-primary/20 tnum">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-7">
          <InterviewFigure />
        </div>
      </div>
    </section>
  );
}

/** A short, illustrative exchange — clearly labelled as an example. */
function InterviewFigure() {
  const turns: { who: 'Interviewer' | 'You'; text: string }[] = [
    { who: 'Interviewer', text: 'Our client, a national gym chain, grew members 8% but operating profit fell 20%. Where would you start?' },
    { who: 'You', text: 'I’d split profit into revenue and cost. With members up, I want to see revenue per member first.' },
    { who: 'Interviewer', text: 'Revenue per member is down 12%. Before you go on: is that a price problem or a mix problem?' },
  ];
  return (
    <figure className={`${US_CARD} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <IconChip tone="sky" size="sm"><MessagesSquare /></IconChip>
          <div>
            <p className="text-[14px] font-semibold text-foreground">Case interview · Profitability</p>
            <p className="text-[12px] text-muted-foreground">Example exchange</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
          Live
        </span>
      </div>
      <ol className="space-y-4 bg-background/60 px-6 py-6">
        {turns.map((t, i) => (
          <li key={i} className={`flex ${t.who === 'You' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${t.who === 'You' ? 'text-right' : ''}`}>
              <p className="mb-1 text-[11px] font-semibold text-muted-foreground">{t.who}</p>
              <p
                className={`inline-block rounded-[14px] px-4 py-3 text-left text-[14.5px] leading-relaxed ${
                  t.who === 'You'
                    ? 'rounded-br-[4px] bg-navy text-white dark:bg-white/10'
                    : 'rounded-bl-[4px] border border-border/80 bg-card text-foreground shadow-[0_1px_2px_rgba(15,28,51,0.05)]'
                }`}
              >
                {t.text}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <figcaption className="flex items-center gap-2.5 border-t border-border/70 px-6 py-4 text-[13px] text-muted-foreground">
        <Gauge aria-hidden className="h-4 w-4 text-primary" />
        Scored on structure, math, synthesis, judgment, creativity and presence.
      </figcaption>
    </figure>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6 · THE MECE METHOD — what MECE stands for, and the five moves
   ════════════════════════════════════════════════════════════════════════ */

const MOVES: { Icon: typeof Target; title: string; text: string; example: string }[] = [
  { Icon: ScanSearch, title: 'Problem', text: 'Restate the question and the goal in one line.', example: 'Members +8%, profit −20%. Why?' },
  { Icon: Network, title: 'Structure', text: 'Split it into parts that don’t overlap and leave nothing out.', example: 'Profit = revenue − cost' },
  { Icon: Sigma, title: 'Analyze', text: 'Ask for the data your structure needs; do the math aloud.', example: '1.08 × 0.88 ≈ 0.95' },
  { Icon: Lightbulb, title: 'Synthesize', text: 'Say what the numbers mean, not the arithmetic.', example: 'A price problem, not volume' },
  { Icon: Flag, title: 'Recommend', text: 'Answer first, then reasons, risks and next steps.', example: 'End the $10 intro rate' },
];

export function MethodSection() {
  return (
    <section id="method" aria-labelledby="method-title" className="scroll-mt-24 bg-secondary/50">
      <div className={`${WRAP} py-20 lg:py-28`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeading
              id="method-title"
              eyebrow="The MECE method"
              title={<>Mutually exclusive. Collectively exhaustive<Dot /></>}
              lead={
                <>
                  <strong className="font-semibold text-foreground">MECE</strong> (Method for Evaluating Corporate
                  Excellence) is built on the rule every case interviewer holds you to: break a problem into parts
                  that <strong className="font-semibold text-foreground">don’t overlap</strong> and{' '}
                  <strong className="font-semibold text-foreground">leave nothing out</strong>. Every case you
                  practice here is scored against it.
                </>
              }
            />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className={`${US_CARD} p-5`}>
                <MeDiagram />
                <p className="mt-4 text-[15px] font-semibold text-foreground">Mutually exclusive</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">No overlaps. Each fact belongs to exactly one branch.</p>
              </div>
              <div className={`${US_CARD} p-5`}>
                <CeDiagram />
                <p className="mt-4 text-[15px] font-semibold text-foreground">Collectively exhaustive</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">No gaps. Together the branches cover the whole problem.</p>
              </div>
            </div>
          </div>
          <figure className={`${US_CARD} p-6 sm:p-8 lg:col-span-6`}>
            <figcaption className="flex items-center justify-between gap-3">
              <span className="text-[14px] font-semibold text-foreground">A MECE issue tree</span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/75">Worked example</span>
            </figcaption>
            <IssueTreeArt className="mt-6 h-auto w-full" />
            <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
              A gym chain grew members 8% while profit fell 20%. The red branch is the hypothesis to test first.
            </p>
          </figure>
        </div>

        <h3 className="mt-20 text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">The five moves every answer is scored on</h3>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MOVES.map(({ Icon, title, text, example }, i) => (
            <li key={title} className={`${US_CARD} relative flex flex-col p-5`}>
              {i < MOVES.length - 1 && (
                <ChevronRight aria-hidden className="absolute -right-[18px] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-border-strong lg:block" />
              )}
              <div className="flex items-center justify-between">
                <IconChip tone={i === MOVES.length - 1 ? 'red' : 'navy'} size="sm"><Icon /></IconChip>
                <span className="text-[12px] font-semibold text-muted-foreground tnum">0{i + 1}</span>
              </div>
              <p className="mt-4 text-[16px] font-semibold text-foreground">{title}</p>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
              <p className="mt-4 rounded-[8px] bg-muted/70 px-3 py-2 text-[12.5px] text-foreground/80">
                <span className="sr-only">Example: </span>
                {example}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Two separate circles: no overlap. */
function MeDiagram() {
  return (
    <svg viewBox="0 0 120 56" aria-hidden className="h-14 w-auto">
      <circle cx="32" cy="28" r="22" className="fill-rose-100 stroke-primary dark:fill-primary/20" strokeWidth="1.5" />
      <circle cx="88" cy="28" r="22" className="fill-slate-100 stroke-navy dark:fill-white/10 dark:stroke-white/60" strokeWidth="1.5" />
    </svg>
  );
}

/** A whole split into parts that fill it: no gaps. */
function CeDiagram() {
  return (
    <svg viewBox="0 0 120 56" aria-hidden className="h-14 w-auto">
      <rect x="4" y="6" width="112" height="44" rx="8" className="fill-slate-100 stroke-navy dark:fill-white/10 dark:stroke-white/60" strokeWidth="1.5" />
      <rect x="4" y="6" width="44" height="44" rx="8" className="fill-rose-100 stroke-primary dark:fill-primary/20" strokeWidth="1.5" />
      <line x1="82" y1="6" x2="82" y2="50" className="stroke-navy dark:stroke-white/60" strokeWidth="1.5" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7 · PRODUCT SHOWCASE — the real dashboard, framed
   ════════════════════════════════════════════════════════════════════════ */

export const SHOWCASE_CALLOUTS = [
  { Icon: Target, k: 'Today, planned', v: 'A fresh US case and market sizing question every day, free.' },
  { Icon: Lightbulb, k: 'What to do next', v: 'One recommendation drawn from your own scores.' },
  { Icon: TrendingUp, k: 'Your trend', v: 'Sessions by week and your average by case type.' },
];

export function Showcase({ preview }: { preview: React.ReactNode }) {
  return (
    <section aria-labelledby="showcase-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-40 mx-auto h-[420px] max-w-[1000px] rounded-full bg-rose-100/40 blur-3xl dark:bg-primary/10" />
      <div className={`${WRAP} relative py-20 lg:py-28`}>
        <SectionHeading
          align="center"
          id="showcase-title"
          eyebrow="Your dashboard"
          title={<>Your preparation, planned for you<Dot /></>}
          lead="Open MECE and the day is ready: today's case, what to fix next, and how far you've come."
        />
        <div className="mx-auto mt-12 max-w-[1080px]">
          <div className="overflow-hidden rounded-[20px] border border-border/80 bg-card shadow-[0_40px_80px_-40px_rgba(15,28,51,0.45)]">
            <div className="flex items-center gap-3 border-b border-border/70 bg-muted/50 px-4 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
              </span>
              <span className="mx-auto rounded-full bg-background px-4 py-1 text-[11px] text-muted-foreground">mece.in/dashboard</span>
              <span className="w-10" aria-hidden />
            </div>
            {preview}
          </div>
          <p className="mt-3 text-center text-[12px] text-muted-foreground">Illustrative account. Your dashboard shows your own practice.</p>
        </div>
        <ul className="mx-auto mt-12 grid grid-cols-1 max-w-[1080px] gap-5 sm:grid-cols-3">
          {SHOWCASE_CALLOUTS.map(({ Icon, k, v }) => (
            <li key={k} className="flex gap-4">
              <IconChip tone="red"><Icon strokeWidth={1.75} /></IconChip>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{k}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{v}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   8 · TRACK YOUR IMPROVEMENT — the real rubric, an example account
   ════════════════════════════════════════════════════════════════════════ */

const CASE_RUBRIC: [string, number, number][] = [
  ['Structure', 21, 25],
  ['Quantitative skills', 16, 20],
  ['Synthesis & communication', 15, 20],
  ['Business judgment', 11, 15],
  ['Creativity', 7, 10],
  ['Presence', 8, 10],
];
const TREND = [58, 61, 60, 66, 64, 70, 72, 76];

export function MeasureSection() {
  return (
    <section id="how-scoring-works" aria-labelledby="measure-title" className="scroll-mt-24 bg-secondary/50">
      <div className={`${WRAP} grid grid-cols-1 gap-14 py-20 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-28`}>
        <div className="lg:col-span-5">
          <SectionHeading
            id="measure-title"
            eyebrow="How you're scored"
            title={<>Track your improvement<Dot /></>}
            lead="Every case is scored out of 100 on the six things interviewers weigh, with written evidence for each mark and a worked solution. Market sizing answers also get an arithmetic check."
          />
          <ul className="mt-8 space-y-3.5">
            {[
              'Your score trend across every scored case',
              'Your average by case type, weakest one flagged',
              'One recommended next practice from your own results',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px] text-foreground">
                <CircleCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <figure className={`${US_CARD} p-6 sm:p-7 lg:col-span-7`}>
          <figcaption className="flex items-center justify-between gap-3">
            <span className="text-[15px] font-semibold text-foreground">Overall progress</span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground/75">Example account</span>
          </figcaption>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
            <ScoreRing value={76} label="Latest case score" />
            <TrendChart values={TREND} />
          </div>
          <div className="mt-7 border-t border-border/70 pt-6">
            <p className="text-[13px] font-semibold text-foreground">Scored on six dimensions</p>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {CASE_RUBRIC.map(([name, v, max]) => (
                <li key={name}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="text-foreground">{name}</span>
                    <span className="font-semibold text-foreground tnum">
                      {v}<span className="font-normal text-muted-foreground">/{max}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted" aria-hidden>
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(v / max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </figure>
      </div>
    </section>
  );
}

function ScoreRing({ value, label }: { value: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 128 128" className="h-[140px] w-[140px]" role="img" aria-label={`${label}: ${value} out of 100`}>
        <circle cx="64" cy="64" r={r} fill="none" className="stroke-muted" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          className="stroke-primary"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * c} ${c}`}
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="62" textAnchor="middle" className="fill-foreground" style={{ fontSize: 30, fontWeight: 600 }}>{value}</text>
        <text x="64" y="82" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>out of 100</text>
      </svg>
      <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}

function TrendChart({ values }: { values: number[] }) {
  const W = 360;
  const H = 150;
  const min = 50;
  const max = 80;
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => [i * step, H - ((v - min) / (max - min)) * (H - 16) - 8] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="h-auto w-full" role="img" aria-label={`Example case scores over eight weeks, from ${values[0]} to ${values[values.length - 1]}`}>
        <defs>
          <linearGradient id="us-trend-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C8102E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C8102E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((i) => (
          <line key={i} x1="0" x2={W} y1={8 + i * ((H - 16) / 2)} y2={8 + i * ((H - 16) / 2)} className="stroke-border" strokeDasharray="3 4" />
        ))}
        <path d={area} fill="url(#us-trend-fill)" />
        <path d={line} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4.5 : 3} className={i === pts.length - 1 ? 'fill-primary' : 'fill-card stroke-primary'} strokeWidth="2" />
        ))}
        {['8 wk', '6 wk', '4 wk', '2 wk', 'Now'].map((t, i) => (
          <text key={t} x={i === 4 ? W : (i * W) / 4} y={H + 18} textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'} className="fill-muted-foreground" style={{ fontSize: 11 }}>
            {t}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   9 · FAQ
   ════════════════════════════════════════════════════════════════════════ */

export function FaqSection({
  faqs,
  id = 'faq',
  eyebrow = 'Questions',
  title = 'What candidates ask us.',
  compact = false,
}: {
  faqs: { question: string; answer: string }[];
  id?: string;
  eyebrow?: string;
  title?: string;
  compact?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className={`${WRAP} grid grid-cols-1 gap-10 lg:grid-cols-12 ${compact ? 'py-16' : 'py-20 lg:py-28'}`}>
        <div className="lg:col-span-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="mt-5 font-display text-[34px] leading-tight text-foreground sm:text-[40px]">
            {title}
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Something else? <a href="mailto:team@mece.in" className="font-semibold text-primary hover:underline underline-offset-4">team@mece.in</a>
          </p>
        </div>
        <div className={`${US_CARD} divide-y divide-border/70 px-6 lg:col-span-8`}>
          {faqs.map((f) => (
            <details key={f.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-[6px] text-[16px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {f.question}
                <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-open:rotate-45 motion-reduce:transition-none">
                  <svg viewBox="0 0 12 12" className="h-3 w-3"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   10 · FINAL CTA — navy band with the city
   ════════════════════════════════════════════════════════════════════════ */

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className={`${WRAP} py-20 lg:py-24`}>
      <div className="relative isolate grid grid-cols-1 overflow-hidden rounded-[24px] bg-navy lg:grid-cols-2">
        <div className="relative z-10 px-7 py-14 sm:px-12 lg:py-20">
          <Eyebrow tone="inverse">Start today</Eyebrow>
          <h2 id="final-cta-title" className="mt-5 font-display text-[38px] leading-[1.05] text-white sm:text-[50px]">
            Your next case starts here<span className="text-primary">.</span>
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-white/70">
            One structured problem at a time. Build sharper business thinking every week.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton variant="inverse" />
            <Link href="/us/pricing" className={usButton('inverse-outline', 'lg')}>See pricing</Link>
          </div>
          <p className="mt-4 text-[12px] text-white/55">Free daily case. No credit card.</p>
        </div>
        <div className="relative min-h-[220px] lg:min-h-0">
          <UsImage photo={US_PHOTOS.band} decorative sizes="(min-width: 1024px) 600px, 100vw" widths={[640, 960, 1280]} className="absolute inset-0 h-full w-full" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-navy via-navy/40 to-transparent lg:bg-gradient-to-r lg:from-navy lg:via-navy/30 lg:to-transparent" />
        </div>
      </div>
    </section>
  );
}
