import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DrawOnView from '@/components/home/draw-on-view';
import HandNote from '@/components/home/hand-note';

/**
 * THE MECE WAY — how an interview actually runs (clarify, structure, solve,
 * recommend), a worked issue tree that draws itself in, and the six scoring
 * dimensions (the target of the nav's "Scoring" link).
 */

const STEPS = [
  { n: '01', title: 'Clarify', text: 'Understand the problem and ask the right questions.' },
  { n: '02', title: 'Structure', text: 'Create a logical, MECE framework.' },
  { n: '03', title: 'Solve', text: 'Analyse with data, insights and clear logic.' },
  { n: '04', title: 'Recommend', text: 'Synthesise and propose a way forward.' },
];

const RUBRIC: [string, number][] = [
  ['Structure', 25],
  ['Quantitative', 20],
  ['Synthesis', 20],
  ['Business judgment', 15],
  ['Creativity', 10],
  ['Professional tone', 10],
];

export default function MeceWay() {
  return (
    <section id="the-mece-way" aria-labelledby="mece-way-title" className="relative isolate scroll-mt-24 overflow-hidden">
      <div aria-hidden className="home-grid pointer-events-none absolute inset-0 -z-10 opacity-80 [mask-image:radial-gradient(ellipse_80%_70%_at_60%_50%,#000_20%,transparent_80%)]" />
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-4 xl:col-span-4">
          <p className="home-eyebrow">The MECE way</p>
          <h2
            id="mece-way-title"
            className="mt-5 font-editorial text-[38px] font-semibold leading-[1.06] tracking-[-0.02em] text-navy dark:text-white sm:text-[44px]"
          >
            Don&rsquo;t just prepare. Learn to think like a consultant.
          </h2>
          <p className="mt-5 font-editorial text-[18px] leading-[1.6] text-[#55534C] dark:text-white/70">
            We train you the way interviews work — clarify, structure, solve, recommend. Every case and guesstimate is
            scored across six dimensions so you know exactly where you stand and what to improve.
          </p>
          <Link
            href="/learn/mece-framework"
            className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-[8px] border border-border-strong/70 bg-card px-6 text-[15px] font-semibold text-foreground shadow-[0_1px_2px_rgba(15,28,51,0.06)] transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Explore the MECE framework <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <div className="lg:col-span-8 lg:pl-6 xl:pl-10">
          {/* Four moves, joined by a line that runs out to the next one. */}
          <DrawOnView as="ol" className="home-steps grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-5">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <div className="flex items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FBEEF0] text-[12.5px] font-semibold text-primary ring-1 ring-inset ring-primary/10 tabular-nums dark:bg-primary/15 dark:text-rose-300">
                    {s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span aria-hidden className="relative ml-3 hidden h-px flex-1 sm:block" style={{ transitionDelay: `${i * 180}ms` }} data-line>
                      <span className="absolute inset-0 bg-primary/35" />
                      <span className="absolute -right-0.5 -top-[2.5px] h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-editorial text-[21px] font-semibold leading-tight text-navy dark:text-white">{s.title}</h3>
                <p className="mt-1.5 max-w-[15rem] text-[14px] leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </DrawOnView>

          {/* A worked issue tree: a problem split into parts that don't
              overlap and leave nothing out — with a margin note beside it. */}
          <div className="relative mt-12 flex items-start gap-2">
            <DrawOnView
              as="figure"
              className="home-tree relative -mx-4 w-[calc(100%+2rem)] max-w-none flex-1 overflow-x-auto px-4 pb-2 sm:mx-0 sm:w-full sm:max-w-[580px] sm:overflow-visible sm:px-0"
              threshold={0.3}
            >
              <IssueTree />
              <figcaption className="sr-only">
                An issue tree: a business problem split into revenue (price, volume, mix), costs (fixed, variable,
                one-off) and market (demand, rivals, policy).
              </figcaption>
            </DrawOnView>
            <HandNote
              lines={['Structured thinking', 'for unstructured', 'problems.']}
              arrow="left"
              arrowSide="left"
              rotate={-8}
              className="-ml-3 mt-[54px] hidden shrink-0 xl:flex"
              textClassName="w-[150px] text-center text-[20px]"
              arrowClassName="mt-6 shrink-0 text-[#2b2a27] dark:text-white/80"
              delay={500}
            />
          </div>
        </div>

        {/* Scoring — the six dimensions every answer is marked on (the
            nav's "Scoring" link lands here). */}
        <div id="scoring" className="scroll-mt-28 lg:col-span-12">
          <div className="rounded-[12px] border border-border/90 bg-card/85 px-5 py-6 shadow-[0_1px_2px_rgba(15,28,51,0.04)] backdrop-blur-[2px] sm:px-7">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h3 className="font-editorial text-[20px] font-semibold text-navy dark:text-white">Every answer, scored out of 100</h3>
              <Link href="/methodology" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary underline-offset-4 hover:underline">
                See the full rubric <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
              {RUBRIC.map(([k, v]) => (
                <li key={k}>
                  <p className="text-[13.5px] text-muted-foreground">{k}</p>
                  <p className="mt-1 font-editorial text-[24px] font-semibold leading-none text-navy tabular-nums dark:text-white">
                    {v}
                    <span className="ml-1 font-sans text-[12px] font-medium text-muted-foreground">pts</span>
                  </p>
                  <span aria-hidden className="mt-3 block h-1 rounded-full bg-muted">
                    <span className="block h-1 rounded-full bg-primary" style={{ width: `${(v / 25) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── The issue tree, drawn in SVG so it stays crisp at any size ─────────── */

const BRANCHES = [
  { x: 106, label: 'Revenue', leaves: ['Price', 'Volume', 'Mix'] },
  { x: 320, label: 'Costs', leaves: ['Fixed', 'Variable', 'One-off'] },
  { x: 534, label: 'Market', leaves: ['Demand', 'Rivals', 'Policy'] },
];
const LEAF_DX = 72;

function IssueTree() {
  return (
    <svg viewBox="0 0 640 196" className="h-auto w-full min-w-[520px] font-sans sm:min-w-0" aria-hidden>
      <g className="stroke-[#9A968B] dark:stroke-white/40" fill="none" strokeWidth={1}>
        {/* spine through the root, root to bar, bar to branches */}
        <path data-draw pathLength={1} d="M150 17 H490" style={{ transitionDelay: '0ms' }} />
        <path data-draw pathLength={1} d="M320 32 V52" style={{ transitionDelay: '150ms' }} />
        <path data-draw pathLength={1} d="M106 52 H534" style={{ transitionDelay: '250ms' }} />
        {BRANCHES.map((b, i) => (
          <g key={b.label}>
            <path data-draw pathLength={1} d={`M${b.x} 52 V74`} style={{ transitionDelay: `${350 + i * 80}ms` }} />
            <path data-draw pathLength={1} d={`M${b.x} 104 V124`} style={{ transitionDelay: `${700 + i * 80}ms` }} />
            <path data-draw pathLength={1} d={`M${b.x - LEAF_DX} 124 H${b.x + LEAF_DX}`} style={{ transitionDelay: `${800 + i * 80}ms` }} />
            {[-1, 0, 1].map((d) => (
              <path key={d} data-draw pathLength={1} d={`M${b.x + d * LEAF_DX} 124 V146`} style={{ transitionDelay: `${950 + i * 80}ms` }} />
            ))}
          </g>
        ))}
      </g>

      {/* root */}
      <g data-box style={{ transitionDelay: '0ms' }}>
        <rect x="248" y="2" width="144" height="30" rx="4" fill="#C8102E" />
        <text x="320" y="21.5" textAnchor="middle" fill="#fff" style={{ fontSize: 12.5, fontWeight: 600 }}>
          Business problem
        </text>
      </g>

      {BRANCHES.map((b, i) => (
        <g key={b.label}>
          <g data-box style={{ transitionDelay: `${500 + i * 90}ms` }}>
            <rect x={b.x - 52} y="74" width="104" height="30" rx="4" className="fill-card stroke-[#8E8A7E] dark:stroke-white/45" strokeWidth={1} />
            <text x={b.x} y="93.5" textAnchor="middle" className="fill-navy dark:fill-white" style={{ fontSize: 12.5, fontWeight: 600 }}>
              {b.label}
            </text>
          </g>
          {b.leaves.map((leaf, j) => {
            const x = b.x + (j - 1) * LEAF_DX;
            return (
              <g key={leaf} data-box style={{ transitionDelay: `${1100 + i * 90 + j * 40}ms` }}>
                <circle cx={x} cy={146} r={2} fill="#C8102E" />
                <rect x={x - 31} y="150" width="62" height="26" rx="3.5" className="fill-card stroke-[#B3AEA2] dark:stroke-white/30" strokeWidth={1} />
                <text x={x} y="167" textAnchor="middle" className="fill-[#55534C] dark:fill-white/70" style={{ fontSize: 11 }}>
                  {leaf}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
