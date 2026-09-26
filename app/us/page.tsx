import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Shield, Calculator, Briefcase, Target, MessagesSquare, LineChart, HelpCircle } from 'lucide-react';
import Footer from '@/components/footer';
import AuthCTA from '@/components/auth-cta';
import UsSiteHeader from '@/components/intl/us-site-header';
import IntlPricingSection from '@/components/intl/intl-pricing-section';
import InterviewSim from '@/components/landing/interview-sim';
import GuestPracticeActions from '@/components/guest/guest-practice-actions';
import { getDailyTodayServerSide } from '@/lib/daily-server';
import { US_CASES, US_GUESSTIMATES, US_CASE_TYPE_LABEL } from '@/lib/us-market';
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

const DIMENSIONS: [string, number, string][] = [
  ['Structure', 25, 'A MECE, hypothesis-driven framework tailored to the case, not a memorized template.'],
  ['Quantitative skills', 20, 'Clean, correct math with units, and the ability to turn numbers into an insight.'],
  ['Synthesis & communication', 20, 'A clear answer-first recommendation, with the "so what" stated plainly.'],
  ['Business judgment', 15, 'Risks, second-order effects and practical next steps an executive would ask about.'],
  ['Creativity', 10, 'Ideas beyond the obvious framework buckets.'],
  ['Presence', 10, 'Professional, concise delivery, the way you would speak to a partner.'],
];

const FIRMS = ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Oliver Wyman', 'L.E.K.', 'Kearney', 'Accenture Strategy', 'EY-Parthenon'];

export default async function UsHomePage() {
  const daily = await getDailyTodayServerSide('static', 'US');
  const featuredCases = ['US-C-01', 'US-C-02', 'US-C-03', 'US-C-12', 'US-C-14', 'US-C-20']
    .map((code) => US_CASES.find((c) => c.code === code))
    .filter((c): c is (typeof US_CASES)[number] => Boolean(c));
  const featuredGuesses = ['US-G-01', 'US-G-02', 'US-G-08', 'US-G-23', 'US-G-31', 'US-G-37']
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
    <div className="min-h-screen overflow-x-hidden bg-background">
      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <UsSiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pt-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="animate-fade-in">
            <div className="badge-pill mb-5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              AI case interview · scored in about a minute
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Case interview practice with an interviewer that <span className="text-primary">pushes back.</span>
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground/80">Reading case books won&apos;t get you the offer.</strong>{' '}
              Run real consulting cases and market sizing questions the way McKinsey, BCG and Bain interviewers run
              them: clarify, structure, do the math, recommend. Get scored on six dimensions in about a minute.
            </p>
            <div className="mt-7">
              <AuthCTA variant="hero" />
            </div>
            <div className="mt-5">
              <GuestPracticeActions
                targets={{
                  caseId: daily.case?.id ?? null,
                  caseTitle: daily.case?.title ?? null,
                  guesstimateId: daily.guesstimate?.id ?? null,
                  guesstimateTitle: daily.guesstimate?.title ?? daily.guesstimate_title ?? null,
                  briefId: null,
                  briefHeadline: null,
                }}
                heading="Try today's case right now — no sign-up"
                subheading="Today's case and market sizing question are free for everyone. Create an account only when you want your score."
              />
            </div>
            <div className="mt-8 flex items-center gap-8">
              {[
                ['50 + 50', 'Cases & market sizing'],
                ['6', 'Scoring dimensions'],
                ['~60s', 'To your feedback'],
              ].map(([k, v]) => (
                <div key={v}>
                  <p className="text-xl font-bold text-foreground">{k}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 animate-slide-up md:mt-0">
            <InterviewSim caseId={daily.case?.id ?? null} guesstimateId={daily.guesstimate?.id ?? null} />
          </div>
        </div>
      </section>

      {/* ── Firms strip (styles, not affiliation) ────────────────────── */}
      <section className="border-y border-border bg-card/60 py-5">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-5 text-center text-[12px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Practice for case interviews at firms like
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 opacity-60 grayscale">
            {FIRMS.map((f) => (
              <span key={f} className="text-[13px] font-semibold text-muted-foreground/70">{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-10 text-center">
          <div className="badge-pill mx-auto mb-4 w-fit"><MessagesSquare className="h-3.5 w-3.5" /> How it works</div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">A mock case interview, on demand</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            No scheduling a practice partner, no reading answers you haven&apos;t earned. Three steps, twenty minutes.
          </p>
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {HOW_STEPS.map((s, i) => (
            <li key={s.name} id={`step-${i + 1}`} className="ui-card p-6">
              <span className="font-mono text-sm font-bold text-primary">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-bold text-foreground">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Scoring ──────────────────────────────────────────────────── */}
      <section id="how-scoring-works" className="border-y border-border bg-card py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 md:grid-cols-2">
          <div>
            <div className="badge-pill mb-4"><Shield className="h-3.5 w-3.5" /> How scoring works</div>
            <h2 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">
              Scored like a real case interview, out of 100
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Every attempt is scored on the six things interviewers actually weigh, with written evidence for each
              score, a worked solution and three ways a strong candidate would have cracked the case. Market sizing
              answers also get a deterministic arithmetic check, so a math slip can&apos;t hide behind a confident
              delivery.
            </p>
            <ul className="mt-6 space-y-3">
              {['Feedback in about a minute, any time of day', 'See exactly where your marks went', 'Track improvement across every attempt'].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[14px] text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="ui-card-floating overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">The rubric</span>
              <span className="tag tag-red">100 points</span>
            </div>
            <ul className="divide-y divide-border">
              {DIMENSIONS.map(([name, pts, what]) => (
                <li key={name} className="flex items-start justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-foreground">{name}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{what}</p>
                  </div>
                  <span className="font-mono text-[13px] font-semibold text-foreground">{pts}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Case bank preview ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="badge-pill mb-3"><Briefcase className="h-3.5 w-3.5" /> Case bank</div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">50 consulting cases set in US markets</h2>
            <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
              Profitability, market entry, M&amp;A and private equity, pricing, growth, operations and more, priced in
              dollars and built around US companies and customers.
            </p>
          </div>
          <Link href="/us/case-interview-examples" className="btn-ghost w-fit">
            See all 50 case examples <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCases.map((c) => (
            <Link key={c.code} href={`/us/case-interview-examples#${c.slug}`} className="ui-card block p-5 transition-shadow hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {US_CASE_TYPE_LABEL[c.type]} · {c.difficulty}
              </p>
              <h3 className="mt-2 text-[15px] font-bold leading-snug text-foreground">{c.title}</h3>
              <p className="mt-2 text-[13px] text-muted-foreground">{c.industry} · {c.firm}-style · ~{c.minutes} min</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Market sizing preview ────────────────────────────────────── */}
      <section className="border-y border-border bg-card/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="badge-pill mb-3"><Calculator className="h-3.5 w-3.5" /> Market sizing</div>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">50 market sizing questions, answered your way</h2>
              <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
                The estimation questions interviewers love, from gas stations in the US to people in the air right now.
              </p>
            </div>
            <Link href="/us/market-sizing-questions" className="btn-ghost w-fit">
              See all 50 questions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {featuredGuesses.map((g) => (
              <li key={g.code}>
                <Link href={`/us/market-sizing-questions#${g.slug}`} className="ui-card flex items-start gap-3 p-4 transition-shadow hover:shadow-md">
                  <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <span className="text-[14px] font-medium text-foreground">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-8 text-center">
          <div className="badge-pill mx-auto mb-4 w-fit"><LineChart className="h-3.5 w-3.5" /> Pricing</div>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Start free. Upgrade for recruiting season.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted-foreground">
            The daily case and market sizing question are free forever. Paid plans are one-time payments that never
            auto-renew.
          </p>
        </div>
        <IntlPricingSection />
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="border-t border-border bg-card py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <div className="badge-pill mx-auto mb-4 w-fit"><HelpCircle className="h-3.5 w-3.5" /> FAQ</div>
            <h2 className="text-3xl font-bold text-foreground">Questions candidates ask</h2>
          </div>
          <div className="space-y-3">
            {HOME_FAQS.map((f) => (
              <details key={f.question} className="ui-card group p-5">
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-foreground">
                  {f.question}
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="bg-navy py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl font-bold text-white">Your first case is waiting.</h2>
          <p className="mt-3 text-[15px] text-white/70">
            Twenty minutes, one real interview, a score you can act on. No credit card.
          </p>
          <div className="mt-7 flex justify-center">
            <AuthCTA variant="cta" />
          </div>
          <p className="mt-6 text-[12px] text-white/50">
            MECE is independent and not affiliated with any consulting firm.
          </p>
        </div>
      </section>

      <Footer intl />
    </div>
  );
}
