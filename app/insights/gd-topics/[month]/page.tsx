import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { homeSerif } from '@/components/home/fonts';
import { ACCENT_DARK, Crumbs, InsightsBar, InsightsFooter, PAPER, accentStyle, fmtDate } from '@/components/insights/parts';
import { AspirantHubNav } from '@/components/insights/AspirantHubNav';
import { formatMonthLabel, getGdTopicsData } from '@/lib/insights/aspirant-hubs';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 600;

export async function generateStaticParams() {
  const { months } = await getGdTopicsData();
  return months.map((m) => ({ month: m.slug }));
}

export async function generateMetadata({ params }: { params: { month: string } }): Promise<Metadata> {
  const monthLabel = formatMonthLabel(params.month);
  const title = `GD Topics for MBA Interviews — ${monthLabel} | MECE Insights`;
  const description = `Curated Group Discussion topics from ${monthLabel} business news with structured For and Against points for MBA aspirants.`;
  const canonicalUrl = `${SITE_URL}/insights/gd-topics/${params.month}`;

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
        url: `/og?title=${encodeURIComponent(`GD Topics — ${monthLabel}`)}&subtitle=${encodeURIComponent(`Business current affairs GD points for MBA interviews from ${monthLabel}.`)}&kind=insight`,
        width: 1200,
        height: 630,
      }],
    },
  };
}

export default async function GdTopicsMonthPage({ params }: { params: { month: string } }) {
  const { items, months } = await getGdTopicsData(params.month);
  if (items.length === 0) {
    notFound();
  }

  const monthLabel = formatMonthLabel(params.month);
  const canonicalUrl = `${SITE_URL}/insights/gd-topics/${params.month}`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `GD Topics for MBA Interviews — ${monthLabel}`,
    description: `Current affairs GD topics from ${monthLabel} for MBA interviews with balanced For and Against points.`,
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.gdTopic,
        url: `${SITE_URL}/insights/${item.slug}`,
      })),
    },
  };

  const breadcrumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
      { '@type': 'ListItem', position: 3, name: 'GD Topics', item: `${SITE_URL}/insights/gd-topics` },
      { '@type': 'ListItem', position: 4, name: monthLabel, item: canonicalUrl },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <InsightsBar />

      <main className="mx-auto max-w-[1200px] px-5 pt-4 pb-20 sm:px-6">
        <Crumbs
          items={[
            { label: 'MECE', href: '/' },
            { label: 'Insights', href: '/insights' },
            { label: 'GD Topics', href: '/insights/gd-topics' },
            { label: monthLabel },
          ]}
        />

        {/* Masthead */}
        <header className="py-8 sm:py-12 border-b border-border">
          <p className="text-micro font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Monthly Roundup · Group Discussions
          </p>
          <h1 className="mt-2 font-editorial text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            GD Topics — {monthLabel}
          </h1>
          <p className="mt-3 max-w-3xl font-editorial text-[1.12rem] leading-relaxed text-muted-foreground sm:text-[1.25rem]">
            Every Group Discussion topic covered in {monthLabel}, complete with structured arguments For and Against,
            verified data anchors, and strategic context.
          </p>
          <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
            <span className="font-semibold text-foreground">{items.length} Topics</span>
            <span>·</span>
            <Link href="/insights/gd-topics" className="underline underline-offset-4 hover:text-foreground">
              ← View All Months
            </Link>
          </div>
        </header>

        {/* Navigation & Archive */}
        <div className="py-6">
          <AspirantHubNav activeTab="gd-topics" currentMonth={params.month} months={months} />
        </div>

        {/* Topics List */}
        <section aria-label={`${monthLabel} GD Topics`} className="mt-4 space-y-8">
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

              <h2 className="mt-4 font-editorial text-[1.45rem] sm:text-[1.75rem] font-semibold leading-snug text-foreground">
                {item.gdTopic}
              </h2>

              {(item.forArguments.length > 0 || item.againstArguments.length > 0) && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {/* FOR arguments */}
                  <div className="rounded-md border border-border bg-muted/40 p-4">
                    <p className="text-small font-semibold uppercase tracking-[0.12em] text-foreground border-b border-border pb-2">
                      Points For
                    </p>
                    <ul className="mt-3 space-y-2.5 text-body text-card-foreground leading-relaxed">
                      {item.forArguments.map((arg, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground select-none">•</span>
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AGAINST arguments */}
                  <div className="rounded-md border border-border bg-muted/40 p-4">
                    <p className="text-small font-semibold uppercase tracking-[0.12em] text-foreground border-b border-border pb-2">
                      Points Against
                    </p>
                    <ul className="mt-3 space-y-2.5 text-body text-card-foreground leading-relaxed">
                      {item.againstArguments.map((arg, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-muted-foreground select-none">•</span>
                          <span>{arg}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/insights/${item.slug}`}
                  className="text-small font-medium text-foreground hover:underline underline-offset-4"
                >
                  Read full strategic analysis & sourced numbers →
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Practice CTA */}
        <section className="mt-16 rounded-xl border border-border bg-card p-8 sm:p-12 text-card-foreground text-center" aria-labelledby="cta-heading">
          <p className="text-micro font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Interview Preparation
          </p>
          <h2 id="cta-heading" className="mt-2 font-editorial text-[1.8rem] sm:text-[2.2rem] font-semibold text-foreground">
            Practice Case Interviews Live
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Test your commercial judgement and framework structure under timed pressure with AI interviewers.
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
