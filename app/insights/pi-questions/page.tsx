import type { Metadata } from 'next';
import Link from 'next/link';
import { homeSerif } from '@/components/home/fonts';
import { ACCENT_DARK, Crumbs, InsightsBar, InsightsFooter, PAPER, accentStyle, fmtDate } from '@/components/insights/parts';
import { AspirantHubNav } from '@/components/insights/AspirantHubNav';
import { getPiQuestionsData } from '@/lib/insights/aspirant-hubs';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: 'MBA Personal Interview (PI) Questions 2026 — Current Affairs & Business | MECE Insights' },
  description:
    'Curated Personal Interview (PI) questions drawn from major business and economic events, complete with strategic context and facts for MBA aspirants.',
  alternates: {
    canonical: `${SITE_URL}/insights/pi-questions`,
  },
  openGraph: {
    title: 'MBA Personal Interview (PI) Questions 2026 — Current Affairs & Business',
    description: 'Realistic interview questions from current affairs with strategic context for IIM and MBA admissions.',
    url: `${SITE_URL}/insights/pi-questions`,
    type: 'website',
    siteName: 'MECE',
    images: [{
      url: `/og?title=${encodeURIComponent('MBA Personal Interview (PI) Questions 2026')}&subtitle=${encodeURIComponent('Current affairs interview questions with strategic answers for MBA aspirants.')}&kind=insight`,
      width: 1200,
      height: 630,
    }],
  },
};

export default async function PiQuestionsPage() {
  const { items, months, totalPages, totalQuestions } = await getPiQuestionsData();
  const canonicalUrl = `${SITE_URL}/insights/pi-questions`;

  // Build FAQPage schema across the first 25 questions
  const faqEntities = items.flatMap((item) =>
    item.questions.map((q) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `In the context of ${item.articleTitle} (${item.topicLabel}): ${item.context || 'Analyze the underlying commercial dynamics, market tradeoffs, and strategic implications.'} Read full analysis at ${SITE_URL}/insights/${item.slug}`,
      },
    }))
  ).slice(0, 30);

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntities,
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MBA Personal Interview (PI) Questions 2026',
    description: 'Current affairs personal interview questions for MBA aspirants with strategic context.',
    url: canonicalUrl,
  };

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
      { '@type': 'ListItem', position: 3, name: 'PI Questions', item: canonicalUrl },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <InsightsBar />

      <main className="mx-auto max-w-[1200px] px-5 pt-4 pb-20 sm:px-6">
        <Crumbs items={[{ label: 'MECE', href: '/' }, { label: 'Insights', href: '/insights' }, { label: 'PI Questions' }]} />

        {/* Masthead */}
        <header className="py-8 sm:py-12 border-b border-border">
          <p className="text-micro font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            MBA Admission Preparation · Personal Interviews
          </p>
          <h1 className="mt-2 font-editorial text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            Personal Interview Questions (2026)
          </h1>
          <p className="mt-3 max-w-3xl font-editorial text-[1.12rem] leading-relaxed text-muted-foreground sm:text-[1.25rem]">
            Real questions professors and interview panellists ask on business current affairs. Every question connects
            to an underlying industry event, giving you the facts and perspective to answer with conviction.
          </p>
          <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
            <span className="font-semibold text-foreground">{totalQuestions} Interview Questions</span>
            <span>·</span>
            <span>Across {totalPages} Business Stories</span>
          </div>
        </header>

        {/* Navigation & Archive */}
        <div className="py-6">
          <AspirantHubNav activeTab="pi-questions" months={months} />
        </div>

        {/* Questions List */}
        <section aria-label="Curated PI Questions" className="mt-4 space-y-8">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-border bg-card p-6 sm:p-8 transition-shadow hover:shadow-sm text-card-foreground"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <span className="text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {item.topicLabel} · {fmtDate(item.publishedAt)}
                </span>
                <Link
                  href={`/insights/${item.slug}`}
                  className="text-small font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  From story: {item.articleTitle}
                </Link>
              </div>

              <div className="mt-6">
                <p className="text-small font-semibold uppercase tracking-[0.12em] text-foreground">
                  Questions an Interviewer Could Ask:
                </p>
                <ol className="mt-4 space-y-3">
                  {item.questions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-body leading-relaxed">
                      <span className="font-sans text-small font-bold tabular-nums text-muted-foreground select-none">
                        {i + 1}.
                      </span>
                      <span className="font-editorial text-[1.18rem] sm:text-[1.28rem] font-medium text-foreground">
                        {q}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {item.context && (
                <div className="mt-6 rounded-md border border-border bg-muted/30 p-4">
                  <p className="text-micro font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Strategic Background to Anchor Your Answer
                  </p>
                  <p className="mt-1 text-body text-card-foreground leading-relaxed">
                    {item.context}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/insights/${item.slug}`}
                  className="text-small font-medium text-foreground hover:underline underline-offset-4"
                >
                  Read full strategic essay with sourced data →
                </Link>
                <Link
                  href={`/insights/pi-questions/${item.monthSlug}`}
                  className="text-micro text-muted-foreground hover:text-foreground"
                >
                  More from {item.monthSlug.replace('-', ' ')}
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Practice CTA */}
        <section className="mt-16 rounded-xl border border-border bg-card p-8 sm:p-12 text-card-foreground text-center" aria-labelledby="cta-heading">
          <p className="text-micro font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Interview Simulation
          </p>
          <h2 id="cta-heading" className="mt-2 font-editorial text-[1.8rem] sm:text-[2.2rem] font-semibold text-foreground">
            Practice Answering Under Timed Pressure
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Don't rehearse answers in your head. Practice conversational case interviews with an AI interviewer
            that pushes you on structure, math, and commercial judgement.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/practice"
              className="rounded-full bg-foreground text-background px-6 py-2.5 text-small font-semibold transition-opacity hover:opacity-90"
            >
              Start Free Case Practice
            </Link>
          </div>
        </section>
      </main>

      <InsightsFooter />
    </div>
  );
}
