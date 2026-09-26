import Link from 'next/link';
import { ArrowDown, ArrowRight, Check } from 'lucide-react';
import { Eyebrow, SectionHeading, UsImage, usButton } from '@/components/us/ui';
import {
  GlyphChain,
  GlyphDialog,
  GlyphRubric,
  GlyphTrajectory,
  GlyphTree,
  IssueTreeArt,
  PeaksOutline,
  SizingChainArt,
} from '@/components/us/art';
import StartButton from '@/components/us/marketing/start-button';
import StartCaseButton from '@/components/us/marketing/start-case-button';
import { US_PHOTOS } from '@/lib/us-market/assets';
import { US_CASE_TYPE_LABEL } from '@/lib/us-market';
import type { UsCase, UsGuesstimate } from '@/lib/us-market/types';

const WRAP = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6';

/* ════════════════════════════════════════════════════════════════════════
   1 · HERO — positioning, one photograph, one real product element
   ════════════════════════════════════════════════════════════════════════ */

export function Hero({
  today,
}: {
  /** Today's real US daily case (or a bank fallback when the schedule is empty). */
  today: { id: string | null; title: string; typeLabel: string; difficulty: string; minutes: number | null; isDaily: boolean };
}) {
  return (
    <section className="relative overflow-hidden">
      <PeaksOutline className="pointer-events-none absolute -left-48 bottom-0 hidden w-[520px] xl:block" />
      <div className={`${WRAP} relative grid items-center gap-12 pb-14 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-20`}>
        <div className="lg:col-span-6">
          <Eyebrow>Built for ambitious minds</Eyebrow>
          <h1 className="mt-6 font-display text-[46px] leading-[1.02] tracking-[-0.02em] text-foreground sm:text-[60px] lg:text-[64px]">
            Master business thinking<span className="text-primary">.</span>
          </h1>
          <p className="mt-3 font-display text-[26px] italic leading-snug text-foreground/70 sm:text-[30px]">Prepare like a consultant.</p>
          <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-muted-foreground">
            Structured case practice, market sizing and an interviewer that asks follow-up questions, then scores
            your structure, math and judgment. For candidates recruiting into consulting, strategy, product and
            finance roles.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <StartButton />
            <a href="#method" className={usButton('secondary', 'lg')}>
              See how it works
              <ArrowDown aria-hidden className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-5 text-[13px] text-muted-foreground">
            Free every day: one case and one market sizing question. No credit card, no account to start.
          </p>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative overflow-hidden rounded-[14px] border border-border">
            <UsImage
              photo={US_PHOTOS.hero}
              priority
              ratio={5 / 4}
              widths={[480, 720, 960, 1280]}
              sizes="(min-width: 1200px) 580px, (min-width: 1024px) 48vw, 100vw"
              className="aspect-[5/4] w-full"
            />
          </div>
          {/* The ONE product element over the photo: today's actual case. */}
          <div className="relative -mt-16 ml-4 mr-4 rounded-[12px] border border-border bg-card p-5 shadow-[0_18px_40px_-24px_rgba(15,28,51,0.45)] sm:ml-10 sm:mr-auto sm:max-w-[400px] lg:absolute lg:-bottom-8 lg:-left-10 lg:mt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {today.isDaily ? "Today's case · free" : 'From the case bank'}
            </p>
            <p className="mt-2 font-display text-[21px] leading-snug text-foreground">{today.title}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              {today.typeLabel} · <span className="capitalize">{today.difficulty}</span>
              {today.minutes ? <> · about {today.minutes} min</> : null}
            </p>
            {today.id && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
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
   2 · WHAT YOU GET — a quiet strip, not five cards
   ════════════════════════════════════════════════════════════════════════ */

const CAPABILITIES = [
  { Glyph: GlyphTree, title: 'Case interviews', text: '50 cases set in US markets' },
  { Glyph: GlyphChain, title: 'Market sizing', text: '50 estimation questions' },
  { Glyph: GlyphDialog, title: 'A live interviewer', text: 'Follow-ups and pushback' },
  { Glyph: GlyphRubric, title: 'Scored feedback', text: 'Six dimensions, about a minute' },
  { Glyph: GlyphTrajectory, title: 'Progress', text: 'Trend, weak spots, next step' },
];

export function CapabilityStrip() {
  return (
    <section aria-label="What MECE includes" className="border-y border-border bg-card/60">
      <ul className={`${WRAP} grid grid-cols-2 gap-x-6 gap-y-7 py-8 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-border lg:gap-0`}>
        {CAPABILITIES.map(({ Glyph, title, text }) => (
          <li key={title} className="flex items-start gap-3 lg:px-6 lg:first:pl-0">
            <Glyph className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-[14px] font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   3 · WHO IT IS FOR — honest; no logos, no counts we cannot prove
   ════════════════════════════════════════════════════════════════════════ */

const STYLES = ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Oliver Wyman', 'L.E.K.', 'Kearney', 'EY-Parthenon'];

export function AudienceStrip() {
  return (
    <section aria-label="Who MECE is for" className={`${WRAP} py-12 text-center`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Built for candidates preparing for consulting, strategy, product &amp; finance interviews
      </p>
      <p className="mx-auto mt-5 max-w-3xl text-[15px] leading-relaxed text-foreground/80">
        Cases written in the interview styles of{' '}
        {STYLES.map((s, i) => (
          <span key={s}>
            <span className="whitespace-nowrap font-semibold text-foreground">{s}</span>
            {i < STYLES.length - 2 ? ', ' : i === STYLES.length - 2 ? ' and ' : ''}
          </span>
        ))}
        .
      </p>
      <p className="mt-2 text-[12px] text-muted-foreground">Interview styles only. MECE is independent and not affiliated with any firm.</p>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   4 · THREE WAYS TO PRACTICE
   ════════════════════════════════════════════════════════════════════════ */

export function PracticeModes({ cases, guesstimates }: { cases: UsCase[]; guesstimates: UsGuesstimate[] }) {
  return (
    <section id="practice-modes" className="border-t border-border">
      <div className={`${WRAP} py-20 lg:py-28`}>
        <SectionHeading
          eyebrow="Practice"
          title="Three ways to practice."
          lead="Every session is a conversation, not a quiz: you ask, structure, calculate and recommend, and the interviewer responds to what you actually said."
        />

        <div className="mt-14 divide-y divide-border border-y border-border">
          <ModeRow
            index="01"
            name="Case practice"
            line="Think through the problem."
            text="Realistic business situations, from a Midwest grocer's shrinking margins to a private equity roll-up in the Sun Belt. Ask for data, lay out a structure, do the math out loud and land a recommendation."
            examplesLabel="From the case bank"
            examples={cases.map((c) => ({ href: `/us/case-interview-examples#${c.slug}`, title: c.title, meta: `${US_CASE_TYPE_LABEL[c.type]} · ${c.minutes} min` }))}
            more={{ href: '/us/case-interview-examples', label: 'All 50 cases' }}
            art={<IssueTreeArt className="h-auto w-full max-w-[420px]" />}
            caption="Structure first. The red branch is the hypothesis you test first."
          />
          <ModeRow
            index="02"
            name="Market sizing"
            line="Structure the unknown."
            text="Estimation questions that train scoping, segmentation, assumptions, arithmetic and a sanity check, anchored in US numbers: about 335 million people and 131 million households."
            examplesLabel="Questions candidates get"
            examples={guesstimates.map((g) => ({ href: `/us/market-sizing-questions#${g.slug}`, title: g.title, meta: `${g.minutes} min` }))}
            more={{ href: '/us/market-sizing-questions', label: 'All 50 questions' }}
            art={<SizingChainArt className="h-auto w-full max-w-[420px]" />}
            caption="Each assumption narrows the population until the answer falls out."
            flip
          />
          <ModeRow
            index="03"
            name="The interviewer"
            line="Defend your thinking."
            text="The interviewer owns the case facts, answers what you ask and pushes back when your logic is loose, the way a case interviewer does. When you submit, you get a score out of 100 with the evidence for each mark."
            art={<InterviewFigure />}
          />
        </div>
      </div>
    </section>
  );
}

function ModeRow({
  index,
  name,
  line,
  text,
  examples,
  examplesLabel,
  more,
  art,
  caption,
  flip = false,
}: {
  index: string;
  name: string;
  line: string;
  text: string;
  examples?: { href: string; title: string; meta: string }[];
  examplesLabel?: string;
  more?: { href: string; label: string };
  art: React.ReactNode;
  caption?: string;
  flip?: boolean;
}) {
  return (
    <article className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
      <div className={`lg:col-span-6 ${flip ? 'lg:order-2' : ''}`}>
        <p className="text-[12px] font-semibold tracking-[0.08em] text-primary tnum">{index}</p>
        <h3 className="mt-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{name}</h3>
        <p className="mt-2 font-display text-[30px] leading-tight text-foreground sm:text-[34px]">{line}</p>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">{text}</p>
        {examples && examples.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{examplesLabel}</p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {examples.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="group flex flex-col gap-0.5 py-3 text-[15px] text-foreground transition-colors hover:text-primary sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                    <span className="min-w-0">{e.title}</span>
                    <span className="shrink-0 text-[12px] text-muted-foreground">{e.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {more && (
              <Link href={more.href} className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline underline-offset-4">
                {more.label} <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
      <figure className={`flex flex-col justify-center lg:col-span-6 ${flip ? 'lg:order-1' : ''}`}>
        <div className="rounded-[12px] border border-border bg-card p-6 sm:p-8">{art}</div>
        {caption && <figcaption className="mt-3 text-[13px] text-muted-foreground">{caption}</figcaption>}
      </figure>
    </article>
  );
}

/** A short, illustrative exchange — clearly labelled as an example. */
function InterviewFigure() {
  const turns: { who: 'Interviewer' | 'You'; text: string; push?: boolean }[] = [
    { who: 'Interviewer', text: 'Our client’s profit fell 20% while members grew 8%. Where would you start?' },
    { who: 'You', text: 'I’d split profit into revenue and cost. With members up, I want to see revenue per member first.' },
    { who: 'Interviewer', text: 'Revenue per member is down 12%. Before you go on: is that a price problem or a mix problem?', push: true },
  ];
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Example exchange</p>
      <ol className="mt-4 space-y-4">
        {turns.map((t, i) => (
          <li key={i} className={`${t.who === 'You' ? 'ml-8' : 'mr-8'}`}>
            <p className="text-[11px] font-semibold text-muted-foreground">{t.who}</p>
            <p
              className={`mt-1 rounded-[8px] border px-3.5 py-2.5 text-[14px] leading-relaxed ${
                t.who === 'You' ? 'border-navy/15 bg-navy/[0.04] text-foreground' : t.push ? 'border-primary/30 bg-card text-foreground' : 'border-border bg-card text-foreground'
              }`}
            >
              {t.push && <span className="mr-1.5 inline-block h-2 w-2 -translate-y-px rotate-45 bg-primary" aria-hidden />}
              {t.text}
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4 text-[12px] text-muted-foreground">
        <GlyphRubric className="h-4 w-4 text-primary" />
        Scored on structure, math, synthesis, judgment, creativity and presence.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   5 · THE MECE METHOD — the signature section
   ════════════════════════════════════════════════════════════════════════ */

const METHOD = [
  {
    step: 'Problem',
    what: 'Restate the question and the goal in one line before touching a framework.',
    example: 'A national gym chain added 8% more members, yet operating profit fell 20%. Why?',
  },
  {
    step: 'Structure',
    what: 'Break it into pieces that don’t overlap and leave nothing out.',
    example: 'Profit = revenue − cost. Revenue = members × revenue per member. Cost = fixed + variable.',
  },
  {
    step: 'Analyze',
    what: 'Ask for the data your structure needs, then do the math out loud.',
    example: 'Revenue per member is down 12%: 1.08 × 0.88 ≈ 0.95, so revenue fell ~5% against flat costs.',
  },
  {
    step: 'Synthesize',
    what: 'Say what the numbers mean: the “so what,” not the arithmetic.',
    example: 'It’s a price problem, not a volume one. A $10 promotion is buying members who don’t cover their cost.',
  },
  {
    step: 'Recommend',
    what: 'Answer first, then the reasons, then the risks and next steps.',
    example: 'End the $10 rate for new joins, step promo members to full price at month three, track revenue per member weekly.',
  },
];

export function MethodSection() {
  return (
    <section id="method" aria-labelledby="method-title" className="scroll-mt-20 bg-secondary/60">
      <div className={`${WRAP} py-20 lg:py-28`}>
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow>The MECE method</Eyebrow>
            <h2 id="method-title" className="mt-4 font-display text-[36px] leading-[1.06] tracking-[-0.015em] text-foreground sm:text-[46px]">
              Don&apos;t memorize frameworks.
              <br />
              Learn to think with them.
            </h2>
          </div>
          <p className="self-end text-[16px] leading-relaxed text-muted-foreground lg:col-span-5">
            Every case on MECE is scored against the same five moves a strong candidate makes. Here they are,
            applied to one worked example.
          </p>
        </div>

        <ol className="relative mt-14 grid gap-0 lg:grid-cols-5">
          {/* rail: vertical on mobile, horizontal on desktop */}
          <span aria-hidden className="absolute bottom-6 left-[11px] top-3 w-px bg-border-strong lg:hidden" />
          <span aria-hidden className="absolute left-3 right-3 top-[11px] hidden h-px bg-border-strong lg:block" />
          {METHOD.map((m, i) => (
            <li key={m.step} className="relative pb-10 pl-10 lg:pb-0 lg:pl-0 lg:pr-6">
              <span
                aria-hidden
                className={`absolute left-0 top-0 flex h-[23px] w-[23px] items-center justify-center lg:relative ${i === METHOD.length - 1 ? 'text-primary' : 'text-navy dark:text-navy-foreground'}`}
              >
                <svg viewBox="0 0 23 23" className="h-[23px] w-[23px]">
                  <rect x="0.5" y="0.5" width="22" height="22" rx="5" className={i === METHOD.length - 1 ? 'fill-primary stroke-primary' : 'fill-background stroke-border-strong'} />
                  <text x="11.5" y="15.5" textAnchor="middle" className={i === METHOD.length - 1 ? 'fill-white' : 'fill-foreground'} style={{ fontSize: 11, fontWeight: 700 }}>
                    {i + 1}
                  </text>
                </svg>
              </span>
              <h3 className="mt-0 text-[18px] font-semibold text-foreground lg:mt-5">{m.step}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{m.what}</p>
              <p className="mt-4 border-l-2 border-primary/60 pl-3 text-[14px] leading-relaxed text-foreground/90">
                <span className="sr-only">Worked example: </span>
                {m.example}
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-[13px] text-muted-foreground">
          Worked example written for this page. The 50 cases in the bank keep their solutions behind the attempt.
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   6 · PRODUCT SHOWCASE — one real-looking screen, four quiet callouts
   ════════════════════════════════════════════════════════════════════════ */

export const SHOWCASE_CALLOUTS = [
  { k: 'Daily practice', v: 'A fresh US case and market sizing question every day, free.' },
  { k: 'What to do next', v: 'One recommendation, drawn from your own scores.' },
  { k: 'Consistency', v: 'Your streak and the last seven days at a glance.' },
  { k: 'Progress', v: 'Sessions by week and your average by case type.' },
];

export function Showcase({ preview }: { preview: React.ReactNode }) {
  return (
    <section aria-labelledby="showcase-title" className="border-t border-border">
      <div className={`${WRAP} py-20 lg:py-28`}>
        <SectionHeading
          eyebrow="The product"
          title={<span id="showcase-title">Your interview preparation system, in one place.</span>}
          lead="Open MECE and the day is already planned: today's case, what to fix next, and how far you've come."
        />
        <div className="mt-12">
          <div className="overflow-hidden rounded-[14px] border border-border-strong/70 bg-card shadow-[0_30px_60px_-40px_rgba(15,28,51,0.5)]">
            <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
              <span aria-hidden className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
                <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
              </span>
              <span className="rounded-[6px] border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">mece.in/dashboard</span>
            </div>
            {preview}
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">Illustrative account. Your dashboard shows your own practice.</p>
        </div>
        <ol className="mt-10 grid gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {SHOWCASE_CALLOUTS.map((c, i) => (
            <li key={c.k}>
              <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground">
                <span aria-hidden className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-primary text-[10px] font-bold tracking-normal text-white">{i + 1}</span>
                {c.k}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{c.v}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   7 · HOW YOU'RE MEASURED — the real rubric, not invented stats
   ════════════════════════════════════════════════════════════════════════ */

const CASE_RUBRIC: [string, number, string][] = [
  ['Structure', 25, 'A MECE, hypothesis-driven framework built for this case, not a memorized template.'],
  ['Quantitative skills', 20, 'Correct math with units, turned into an insight.'],
  ['Synthesis & communication', 20, 'Answer first, with the “so what” stated plainly.'],
  ['Business judgment', 15, 'Risks, second-order effects and practical next steps.'],
  ['Creativity', 10, 'Ideas beyond the obvious framework buckets.'],
  ['Presence', 10, 'Concise, professional delivery, the way you’d speak to a partner.'],
];
const SIZING_RUBRIC = ['Scoping', 'Structure', 'Segmentation & assumptions', 'Arithmetic & units', 'Sanity check'];

export function MeasureSection() {
  return (
    <section id="how-scoring-works" aria-labelledby="measure-title" className="scroll-mt-20 border-t border-border">
      <div className={`${WRAP} grid gap-14 py-20 lg:grid-cols-12 lg:gap-12 lg:py-28`}>
        <div className="lg:col-span-5">
          <Eyebrow>How you&apos;re measured</Eyebrow>
          <h2 id="measure-title" className="mt-4 font-display text-[36px] leading-[1.06] tracking-[-0.015em] text-foreground sm:text-[46px]">
            See yourself get better.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            Every case is scored out of 100 on the six things interviewers weigh, with written evidence for each
            mark, a worked solution and three ways a strong candidate would approach it. Market sizing answers
            also get an arithmetic check, so a math slip can&apos;t hide behind a confident delivery.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Your score trend across every scored case',
              'Your average by case type, with the weakest one flagged',
              'One recommended next practice, based on your own results',
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[15px] text-foreground">
                <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <figure className="rounded-[12px] border border-border bg-card p-6 sm:p-8">
            <figcaption className="flex items-baseline justify-between gap-4">
              <span className="text-[13px] font-semibold text-foreground">The case rubric</span>
              <span className="text-[12px] text-muted-foreground">Points out of 100</span>
            </figcaption>
            <ul className="mt-6 space-y-5">
              {CASE_RUBRIC.map(([name, pts, what]) => (
                <li key={name}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[14px] font-semibold text-foreground">{name}</span>
                    <span className="text-[14px] font-semibold text-foreground tnum">{pts}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted" aria-hidden>
                    <div className="h-1.5 rounded-full bg-navy dark:bg-viz-1" style={{ width: `${(pts / 25) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{what}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-border pt-5">
              <p className="text-[13px] font-semibold text-foreground">Market sizing is scored on five dimensions</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{SIZING_RUBRIC.join(' · ')}</p>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   8 · PRINCIPLE BAND — the one editorial statement (no fake testimonial)
   ════════════════════════════════════════════════════════════════════════ */

export function PrincipleBand() {
  return (
    <section aria-label="The MECE principle" className="relative isolate overflow-hidden bg-navy">
      <UsImage photo={US_PHOTOS.band} decorative sizes="100vw" widths={[640, 1080, 1600, 2200]} className="absolute inset-0 -z-10 h-full w-full opacity-40" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy/60" />
      <div className={`${WRAP} py-20 lg:py-28`}>
        <p className="max-w-3xl font-display text-[34px] leading-[1.12] text-white sm:text-[48px]">
          Mutually exclusive.
          <br />
          Collectively exhaustive.
        </p>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75">
          The principle behind every strong case answer, and behind our name. Break a problem into pieces that
          don&apos;t overlap and leave nothing out, and the answer usually shows itself.
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   9 · FAQ — editorial accordion
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
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-border">
      <div className={`${WRAP} grid gap-10 lg:grid-cols-12 ${compact ? 'py-16' : 'py-20 lg:py-28'}`}>
        <div className="lg:col-span-4">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id={`${id}-title`} className="mt-4 font-display text-[34px] leading-tight text-foreground sm:text-[40px]">
            {title}
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground">
            Something else? <a href="mailto:team@mece.in" className="font-semibold text-primary hover:underline underline-offset-4">team@mece.in</a>
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.question} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 rounded-[6px] text-[16px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {f.question}
                <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rotate-45 border-b-[1.5px] border-r-[1.5px] border-muted-foreground transition-transform group-open:-rotate-[135deg] motion-reduce:transition-none" />
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
   10 · FINAL CTA
   ════════════════════════════════════════════════════════════════════════ */

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="bg-navy">
      <div className={`${WRAP} flex flex-col items-start gap-8 py-20 lg:flex-row lg:items-end lg:justify-between lg:py-24`}>
        <div>
          <h2 id="final-cta-title" className="font-display text-[38px] leading-[1.05] text-white sm:text-[52px]">
            Your next case starts here.
          </h2>
          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/70">
            One structured problem at a time. Build stronger business thinking every week.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <StartButton variant="inverse" />
          <p className="text-[12px] text-white/55">Free daily case. No credit card.</p>
        </div>
      </div>
    </section>
  );
}
