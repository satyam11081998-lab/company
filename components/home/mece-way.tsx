import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import DrawOnView from '@/components/home/draw-on-view';
import HandNote from '@/components/home/hand-note';
import HomeImage from '@/components/home/photo';
import { HOME_PHOTOS } from '@/lib/home/photos';

/**
 * THE MECE WAY — how an interview actually runs (clarify, structure, solve,
 * recommend), structured thinking on a real whiteboard with a worked split
 * floated on it, and the six scoring dimensions (the target of the nav's
 * "Scoring" link).
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

          {/* Structure, photographed rather than drawn: a real whiteboard,
              with the worked split floated on it the way the hero floats the
              practice tile on its photo. */}
          <div className="relative mt-12 flex items-start gap-2">
            <figure className="relative w-full max-w-[600px] flex-1">
              <div className="relative overflow-hidden rounded-[14px] border border-black/[0.06] shadow-[0_1px_2px_rgba(15,28,51,0.06),0_30px_60px_-30px_rgba(15,28,51,0.45)] dark:border-white/10">
                <HomeImage
                  photo={HOME_PHOTOS.whiteboard}
                  sizes="(min-width: 1280px) 600px, (min-width: 1024px) 55vw, 100vw"
                  widths={[480, 720, 960, 1200]}
                  ratio={16 / 10}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
              {/* The worked example, as a card on the photo. */}
              <div className="relative -mt-16 ml-auto mr-4 w-[min(88%,330px)] rounded-[12px] border border-border/90 bg-card/95 p-4 shadow-[0_18px_40px_-18px_rgba(15,28,51,0.45)] backdrop-blur-sm sm:absolute sm:bottom-5 sm:right-5 sm:mr-0 sm:mt-0">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">Worked example</p>
                <p className="mt-1.5 font-editorial text-[16.5px] font-semibold leading-snug text-navy dark:text-white">
                  Profit fell 18% while revenue grew. Split it before you solve it.
                </p>
                <ul className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[12px] font-medium text-foreground">
                  {['Revenue', 'Costs', 'Market'].map((b) => (
                    <li key={b} className="rounded-[6px] border border-border bg-background px-1.5 py-1.5">
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11.5px] text-muted-foreground">No overlaps, no gaps — that is MECE.</p>
              </div>
              <figcaption className="sr-only">
                A hand drawing a branching structure on a whiteboard, with a worked example: a profit problem split
                into revenue, costs and market.
              </figcaption>
            </figure>
            <HandNote
              lines={['Structured thinking', 'for unstructured', 'problems.']}
              arrow="left"
              arrowSide="left"
              rotate={-8}
              className="-ml-3 mt-[92px] hidden shrink-0 xl:flex"
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
