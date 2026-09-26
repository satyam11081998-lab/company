import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import { FaqSection } from '@/components/us/marketing/sections';
import { Eyebrow } from '@/components/us/ui';
import { US_CASES, US_CASE_TYPE_LABEL, type UsCase } from '@/lib/us-market';
import { faqPageJsonLd, genericBreadcrumbJsonLd, itemListJsonLd } from '@/lib/seo';

/**
 * Public index of the 50 US practice cases — the prompts only. Worked
 * solutions stay behind an attempt, exactly as for every case on MECE, so this
 * page never gives away what the practice is for. Static.
 */
export const dynamic = 'force-static';

const TITLE = '50 Case Interview Examples to Practice (Consulting, US Markets) | MECE';
const DESC =
  '50 consulting case interview examples with prompts and data: profitability, market entry, M&A, pricing, growth and operations cases set in US markets. Practice each one live with an AI interviewer.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  keywords: ['case interview examples', 'consulting case examples', 'profitability case', 'market entry case', 'M&A case interview', 'case interview questions', 'McKinsey case examples', 'BCG case examples', 'Bain case examples'],
  alternates: { canonical: '/us/case-interview-examples' },
  openGraph: { type: 'article', url: '/us/case-interview-examples', title: TITLE, description: DESC, locale: 'en_US', siteName: 'MECE' },
};

const ORDER: UsCase['type'][] = [
  'profitability', 'market entry', 'growth', 'pricing', 'm&a', 'operations', 'cost reduction', 'go to market', 'competitive strategy',
];

const FAQS = [
  {
    question: 'What is a case interview?',
    answer:
      'A case interview is a 20–40 minute business problem an interviewer walks you through, used by consulting firms such as McKinsey, BCG and Bain and by many finance and strategy teams. You ask clarifying questions, structure the problem, analyze data and do math out loud, then give a recommendation. Interviewers score how you think, not whether you reach one right answer.',
  },
  {
    question: 'What types of case interviews are there?',
    answer:
      'The most common are profitability cases (why profits fell), market entry (should we enter a market), M&A and private equity (should we buy a company), pricing, growth strategy, operations, cost reduction and competitive response, plus market sizing questions. Interviewer-led cases (McKinsey style) move you through set questions; candidate-led cases (BCG and Bain style) let you drive.',
  },
  {
    question: 'How should I practice with these case examples?',
    answer:
      'Treat each one as a live interview, not reading material. Say your clarifying questions and structure out loud, do the math by hand, and commit to a recommendation before checking any answer. On MECE you can run every case with an AI interviewer that answers your questions and scores you on six dimensions.',
  },
];

export default function CaseInterviewExamplesPage() {
  const byType = ORDER.map((t) => ({ type: t, items: US_CASES.filter((c) => c.type === t) })).filter((g) => g.items.length);
  const jsonLd = [
    itemListJsonLd({
      name: 'Case interview examples',
      url: '/us/case-interview-examples',
      items: US_CASES.map((c) => ({ name: c.title, url: `/us/case-interview-examples#${c.slug}` })),
    }),
    faqPageJsonLd(FAQS),
    genericBreadcrumbJsonLd([{ name: 'MECE', url: '/us' }, { name: 'Case interview examples', url: '/us/case-interview-examples' }]),
  ];

  return (
    <div className="min-h-screen bg-background">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <UsHeader />
      <main id="main" className="mx-auto w-full max-w-[880px] px-4 py-14 sm:px-6 lg:py-20">
        <header className="mb-10">
          <Eyebrow>Case interview examples</Eyebrow>
          <h1 className="mt-4 font-display text-[36px] leading-[1.08] tracking-[-0.015em] text-foreground sm:text-[46px]">
            50 case interview examples to practice, set in US markets
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
            Every case below is a full interview prompt with the data a candidate is given up front: profitability,
            market entry, M&amp;A and private equity, pricing, growth, operations, cost reduction, go-to-market and
            competitive strategy. They are written in the interviewer-led style McKinsey uses and the candidate-led
            style common at BCG and Bain. Read a prompt, then practice it live with MECE&apos;s AI interviewer, which
            answers your clarifying questions, pushes back on your structure and scores you out of 100.
          </p>
          <nav aria-label="Case types" className="mt-6 flex flex-wrap gap-2">
            {byType.map((g) => (
              <a key={g.type} href={`#type-${g.type.replace(/[^a-z]+/g, '-')}`} className="rounded-[6px] border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
                {US_CASE_TYPE_LABEL[g.type]} ({g.items.length})
              </a>
            ))}
          </nav>
        </header>

        {byType.map((g) => (
          <section key={g.type} id={`type-${g.type.replace(/[^a-z]+/g, '-')}`} className="mb-12 scroll-mt-24">
            <h2 className="mb-2 font-display text-[28px] leading-tight text-foreground">
              {US_CASE_TYPE_LABEL[g.type]} cases
            </h2>
            <div className="divide-y divide-border border-y border-border">
              {g.items.map((c) => (
                <article key={c.code} id={c.slug} className="scroll-mt-24 py-8">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.industry} · {c.difficulty} · {c.firm}-style, {c.format} · ~{c.minutes} min
                  </p>
                  <h3 className="mt-2 text-[19px] font-semibold leading-snug text-foreground">{c.title}</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">{c.situation}</p>
                  <p className="mt-4 text-[13px] font-semibold text-foreground">What you know</p>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[13.5px] text-muted-foreground">
                    {c.facts.map((f) => <li key={f}>{f}</li>)}
                  </ul>
                  <p className="mt-4 text-[13px] font-semibold text-foreground">Your task</p>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[13.5px] text-muted-foreground">
                    {c.asks.map((a) => <li key={a}>{a}</li>)}
                  </ol>
                  <Link
                    href={`/p/${c.code}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline underline-offset-4"
                    prefetch={false}
                  >
                    Practice this case with the AI interviewer <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-10 text-[14px] text-muted-foreground">
          Looking for estimation questions? See{' '}
          <Link href="/us/market-sizing-questions" className="font-semibold text-primary hover:underline underline-offset-4">50 market sizing questions</Link>.
          All scenarios are fictional and written for practice; MECE is not affiliated with any consulting firm.
        </p>
      </main>
      <FaqSection faqs={FAQS} id="case-faq" eyebrow="Case interviews" title="Case interview questions." compact />
      <UsFooter />
    </div>
  );
}
