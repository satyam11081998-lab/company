import type { Metadata } from 'next';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import DashboardPreview from '@/components/us/marketing/dashboard-preview';
import IntlPricingSection from '@/components/intl/intl-pricing-section';
import {
  AudienceStrip,
  CapabilityStrip,
  FaqSection,
  FinalCta,
  Hero,
  HowItWorks,
  MeasureSection,
  MethodSection,
  PracticeModes,
  Showcase,
} from '@/components/us/marketing/sections';
import { Dot, SectionHeading } from '@/components/us/ui';
import { getDailyTodayServerSide } from '@/lib/daily-server';
import { US_CASES, US_GUESSTIMATES } from '@/lib/us-market';
import { usTypeLabel } from '@/lib/us-market/labels';
import { INTL_PRICING_FAQ } from '@/lib/intl-plans';
import {
  US_SITE_TITLE,
  US_SITE_DESC,
  HREFLANG_HOME,
  faqPageJsonLd,
  howToJsonLd,
  usSoftwareApplicationJsonLd,
} from '@/lib/seo';

/**
 * The international (US + Europe) home page. Human visitors outside India are
 * routed here from "/" by the middleware; crawlers index both, joined by
 * hreflang. Static (ISR) like "/": the only data read is today's US daily
 * pair, through the cookie-less anon client.
 */
export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: US_SITE_TITLE },
  description: US_SITE_DESC,
  keywords: [
    'case interview practice',
    'case interview prep',
    'consulting case interview',
    'AI case interview',
    'mock case interview',
    'McKinsey case interview',
    'BCG case interview',
    'Bain case interview',
    'market sizing questions',
    'guesstimate practice',
    'MBA consulting recruiting',
    'case interview examples',
  ],
  alternates: { canonical: '/us', languages: { ...HREFLANG_HOME } },
  openGraph: {
    type: 'website',
    url: '/us',
    siteName: 'MECE',
    title: US_SITE_TITLE,
    description: US_SITE_DESC,
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', title: US_SITE_TITLE, description: US_SITE_DESC },
};

const HOME_FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is MECE?',
    answer:
      'MECE (mece.in) is an online case interview practice platform. An AI interviewer runs consulting-style cases and market sizing questions with you, answers your clarifying questions, pushes back on your structure, and scores you out of 100 on six dimensions in about a minute. It is named after the MECE principle (mutually exclusive, collectively exhaustive) but is a separate product.',
  },
  {
    question: 'How is practicing with an AI interviewer different from a case book?',
    answer:
      'A case book gives you a finished answer to read. A case interview is a conversation: you ask for data, lay out a structure, do math out loud and defend a recommendation. MECE simulates that conversation, so you practice the part case books cannot teach, then compare your approach with a worked solution.',
  },
  ...INTL_PRICING_FAQ.map((f) => ({ question: f.q, answer: f.a })),
  {
    question: 'Is MECE affiliated with McKinsey, BCG or Bain?',
    answer:
      'No. MECE is independent and is not affiliated with or endorsed by any consulting firm. Firm names describe the interview styles the cases are written in.',
  },
];

const HOW_STEPS = [
  { name: 'Pick a case or a market sizing question', text: "Start with today's free daily pair, or choose from a bank of 50 cases and 50 market sizing questions set in US markets." },
  { name: 'Run the interview', text: 'Ask clarifying questions, lay out your structure, request data and do the math out loud. The AI interviewer answers like a real one and pushes back when your logic is loose.' },
  { name: 'Get scored in about a minute', text: 'Receive a score out of 100 across structure, quantitative skills, synthesis, business judgment, creativity and communication, plus a worked solution and three ways a top candidate would approach it.' },
];



export default async function UsHomePage() {
  const daily = await getDailyTodayServerSide('static', 'US');
  // Hero element: today's real daily case; if the US schedule is empty, the
  // bank case the seed bootstraps as the first daily (US-C-05).
  const fallback = US_CASES.find((c) => c.code === 'US-C-05') ?? US_CASES[0];
  const bankMatch = daily.case ? US_CASES.find((c) => c.title === daily.case!.title) : undefined;
  const today = daily.case
    ? {
        id: daily.case.id,
        guesstimateId: daily.guesstimate?.id ?? null,
        title: daily.case.title,
        typeLabel: usTypeLabel(daily.case.type),
        difficulty: daily.case.difficulty,
        minutes: bankMatch?.minutes ?? null,
        isDaily: true,
      }
    : { id: null, guesstimateId: daily.guesstimate?.id ?? null, title: fallback.title, typeLabel: usTypeLabel(fallback.type), difficulty: fallback.difficulty, minutes: fallback.minutes, isDaily: false };

  const exampleCases = ['US-C-01', 'US-C-03', 'US-C-12']
    .map((code) => US_CASES.find((c) => c.code === code))
    .filter((c): c is (typeof US_CASES)[number] => Boolean(c));
  const exampleGuesses = ['US-G-01', 'US-G-08', 'US-G-23']
    .map((code) => US_GUESSTIMATES.find((g) => g.code === code))
    .filter((g): g is (typeof US_GUESSTIMATES)[number] => Boolean(g));

  const jsonLd = [
    usSoftwareApplicationJsonLd(),
    faqPageJsonLd(HOME_FAQS),
    howToJsonLd({
      name: 'How to practice a case interview with an AI interviewer',
      description: 'Three steps to a scored mock case interview on MECE.',
      url: '/us',
      totalMinutes: 20,
      steps: HOW_STEPS,
    }),
  ];

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow">
        Skip to content
      </a>
      <UsHeader />
      <main id="main">
        <Hero today={today} />
        <CapabilityStrip />
        <AudienceStrip />
        <PracticeModes cases={exampleCases} guesstimates={exampleGuesses} />
        <HowItWorks />
        <MethodSection />
        <Showcase preview={<DashboardPreview />} />
        <MeasureSection />
        <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-24">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
            <SectionHeading
              align="center"
              id="pricing-title"
              eyebrow="Pricing"
              title={<>Start free. Upgrade for recruiting season<Dot /></>}
              lead="The daily case and market sizing question are free forever. Paid plans are one-time payments that never auto-renew."
              className="mb-12"
            />
            <IntlPricingSection />
          </div>
        </section>
        <div className="bg-secondary/50">
          <FaqSection faqs={HOME_FAQS} />
        </div>
        <FinalCta />
      </main>
      <UsFooter />
    </div>
  );
}
