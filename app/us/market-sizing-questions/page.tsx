import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import { FaqSection } from '@/components/us/marketing/sections';
import { Eyebrow } from '@/components/us/ui';
import { US_GUESSTIMATES } from '@/lib/us-market';
import { faqPageJsonLd, genericBreadcrumbJsonLd, itemListJsonLd } from '@/lib/seo';

/**
 * Public index of the 50 US market sizing (guesstimate) questions — the
 * questions and their scope only; worked estimates stay behind an attempt.
 */
export const dynamic = 'force-static';

const TITLE = '50 Market Sizing Questions for Case Interviews (with Practice) | MECE';
const DESC =
  '50 market sizing and guesstimate questions asked in consulting case interviews, all about the US: gas stations, Amazon packages, NYC subway rides and more. Practice each one with an AI interviewer and an arithmetic check.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: ['market sizing questions', 'market sizing examples', 'guesstimate questions', 'estimation questions consulting', 'Fermi questions interview', 'case interview market sizing', 'how to answer market sizing questions'],
  alternates: { canonical: '/us/market-sizing-questions' },
  openGraph: { type: 'article', url: '/us/market-sizing-questions', title: TITLE, description: DESC, locale: 'en_US', siteName: 'MECE' },
};

const FAQS = [
  {
    question: 'What is a market sizing question?',
    answer:
      'A market sizing question (also called a guesstimate or estimation question) asks you to estimate a number you cannot look up, such as how many gas stations there are in the US. Interviewers use it to test structured thinking, reasonable assumptions and clean mental math, not trivia.',
  },
  {
    question: 'How do you answer a market sizing question?',
    answer:
      'Clarify the scope and units, choose a top-down or bottom-up structure, segment the key driver (for example by age group or usage), attach a number to every assumption, multiply through to one point estimate, and finish with a sanity check against something you already know.',
  },
  {
    question: 'Top-down or bottom-up: which is better?',
    answer:
      'Neither is always better. Top-down starts from a large known number (population, households) and narrows it; bottom-up builds from a unit (one store, one customer) and scales up. Strong candidates pick the one with the most reliable anchors and cross-check with the other when time allows.',
  },
];

export default function MarketSizingQuestionsPage() {
  const tiers: { label: string; items: typeof US_GUESSTIMATES }[] = [
    { label: 'Warm-up (easy)', items: US_GUESSTIMATES.filter((g) => g.difficulty === 'easy') },
    { label: 'Interview-level (medium)', items: US_GUESSTIMATES.filter((g) => g.difficulty === 'medium') },
    { label: 'Final-round (hard)', items: US_GUESSTIMATES.filter((g) => g.difficulty === 'hard') },
  ];
  const jsonLd = [
    itemListJsonLd({
      name: 'Market sizing questions',
      url: '/us/market-sizing-questions',
      items: US_GUESSTIMATES.map((g) => ({ name: g.title, url: `/us/market-sizing-questions#${g.slug}` })),
    }),
    faqPageJsonLd(FAQS),
    genericBreadcrumbJsonLd([{ name: 'MECE', url: '/us' }, { name: 'Market sizing questions', url: '/us/market-sizing-questions' }]),
  ];

  return (
    <div className="min-h-screen bg-background">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <UsHeader />
      <main id="main" className="mx-auto w-full max-w-[880px] px-4 py-14 sm:px-6 lg:py-20">
        <header className="mb-10">
          <Eyebrow>Market sizing</Eyebrow>
          <h1 className="mt-4 font-display text-[36px] leading-[1.08] tracking-[-0.015em] text-foreground sm:text-[46px]">50 market sizing questions for case interviews</h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            Market sizing questions, also called guesstimates, show up in almost every consulting first round and in
            many finance and product interviews. Every question below is about the United States, with the exact scope
            an interviewer would give you. Work each one out loud, then practice it on MECE: the AI interviewer pins down
            your assumptions, and every answer gets an arithmetic check plus a worked estimate.
          </p>
        </header>

        {tiers.map((t) => (
          <section key={t.label} className="mb-12">
            <h2 className="mb-2 font-display text-[28px] leading-tight text-foreground">{t.label}</h2>
            <ol className="divide-y divide-border border-y border-border">
              {t.items.map((g) => (
                <li key={g.code} id={g.slug} className="scroll-mt-24 py-6">
                  <h3 className="text-[17px] font-semibold leading-snug text-foreground">{g.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Scope: </span>{g.scope}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">~{g.minutes} min · {g.firm}-style</p>
                  <Link href={`/p/${g.code}`} prefetch={false} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline underline-offset-4">
                    Practice this question <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <p className="mt-10 text-[14px] text-muted-foreground">
          Ready for full cases? See{' '}
          <Link href="/us/case-interview-examples" className="font-semibold text-primary hover:underline underline-offset-4">50 case interview examples</Link>.
        </p>
      </main>
      <FaqSection faqs={FAQS} id="sizing-faq" eyebrow="Market sizing" title="Market sizing questions, answered." compact />
      <UsFooter />
    </div>
  );
}
