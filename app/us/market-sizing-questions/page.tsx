import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/footer';
import UsSiteHeader from '@/components/intl/us-site-header';
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
      <UsSiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-14">
        <header className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Market sizing</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">50 market sizing questions for case interviews</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Market sizing questions, also called guesstimates, show up in almost every consulting first round and in
            many finance and product interviews. Every question below is about the United States, with the exact scope
            an interviewer would give you. Work each one out loud, then practice it on MECE: the AI interviewer pins down
            your assumptions, and every answer gets an arithmetic check plus a worked estimate.
          </p>
        </header>

        {tiers.map((t) => (
          <section key={t.label} className="mb-12">
            <h2 className="mb-5 border-b border-border pb-2 text-2xl font-bold text-foreground">{t.label}</h2>
            <ol className="space-y-4">
              {t.items.map((g) => (
                <li key={g.code} id={g.slug} className="ui-card scroll-mt-24 p-5">
                  <h3 className="text-[16px] font-bold leading-snug text-foreground">{g.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Scope: </span>{g.scope}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">~{g.minutes} min · {g.firm}-style</p>
                  <Link href={`/p/${g.code}`} prefetch={false} className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline">
                    Practice this question <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-bold text-foreground">Market sizing FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.question} className="ui-card p-5">
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-foreground">{f.question}</summary>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Ready for full cases? See{' '}
            <Link href="/us/case-interview-examples" className="font-semibold text-primary hover:underline">50 case interview examples</Link>.
          </p>
        </section>
      </main>
      <Footer intl />
    </div>
  );
}
