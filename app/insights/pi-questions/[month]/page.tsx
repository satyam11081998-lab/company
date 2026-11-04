import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { homeSerif } from '@/components/home/fonts';
import { ACCENT_DARK, Crumbs, InsightsBar, InsightsFooter, PAPER, accentStyle, fmtDate } from '@/components/insights/parts';
import { AspirantHubNav } from '@/components/insights/AspirantHubNav';
import { formatMonthLabel, getPiQuestionsData } from '@/lib/insights/aspirant-hubs';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 600;

export async function generateStaticParams() {
  const { months } = await getPiQuestionsData();
  return months.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: { params: { month: string } }): Promise<Metadata> {
  const monthLabel = formatMonthLabel(params.month);
  const title = `MBA Personal Interview Questions — ${monthLabel} | MECE Insights`;
  const description = `Curated Personal Interview questions from ${monthLabel} business current affairs with structured background context for MBA aspirants.`;
  const canonicalUrl = `${SITE_URL}/insights/pi-questions/${params.month}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: 'MECE',
      images: [{
        url: `/og?title=${encodeURIComponent(`PI Questions — ${monthLabel}`)}&subtitle=${encodeURIComponent(`Current affairs interview questions from ${monthLabel} for MBA admissions.`)}&kind=insight`,
        width: 1200,
        height: 630,
      }],
    },
  };
}

export default async function PiQuestionsMonthPage({ params }: { params: { month: string } }) {
  const { items, months } = await getPiQuestionsData(params.month);
  if (items.length === 0) {
    notFound();
  }

  const monthLabel = formatMonthLabel(params.month);
  const canonicalUrl = `${SITE_URL}/insights/pi-questions/${params.month}`;
  const totalQuestions = items.reduce((acc, it) => acc + it.questions.length, 0);

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
    name: `MBA Personal Interview Questions — ${monthLabel}`,
    description: `Current affairs personal interview questions from ${monthLabel} for MBA aspirants.`,
    url: canonicalUrl,
  };

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
      { '@type': 'ListItem', position: 3, name: 'PI Questions', item: `${SITE_URL}/insights/pi-questions` },
      { '@type': 'ListItem', position: 4, name: monthLabel, item: canonicalUrl },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <InsightsBar />

      <main className="mx-auto max-w-[1200px] px-5 pt-4 pb-20 sm:px-6">
        <Crumbs
          items={[
            { label: 'MECE', href: '/' },
            { label: 'Insights', href: '/insights' },
            { label: 'PI Questions', href: '/insights/pi-questions' },
            { label: monthLabel },
          ]}
        />

        {/* Masthead */}
        <header className="py-8 sm:py-12 border-b border-border">
          <p className="text-micro font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Monthly Roundup · Personal Interviews
          </p>
          <h1 className="mt-2 font-editorial text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            Interview Questions — {monthLabel}
          </h1>
          <p className="mt-3 max-w-3xl font-editorial text-[1.12rem] leading-relaxed text-muted-foreground sm:text-[1.25rem]">
            Questions an interviewer could ask from the business events of {monthLabel}, paired with strategic context
            and data to frame credible, structured answers.
          </p>
          <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
            <span className="font-semibold text-foreground">{totalQuestions} Questions</span>
            <span>·</span>
            <Link href="/insights/pi-questions" className="underline underline-offset-4 hover:text-foreground">
              ← View All Months
            </Link>
          </div>
        </header>

        {/* Navigation & Archive */}
        <div className="py-6">
          <AspirantHubNav activeTab="pi-questions" currentMonth={params.month} months={months} />
        </div>

        {/* Questions List */}
        <section aria-label={`${monthLabel} PI Questions`} className="mt-4 space-y-8">
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
            Test Your Commercial Instincts Live
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Practice structuring business problems and explaining your reasoning out loud under timed pressure.
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
