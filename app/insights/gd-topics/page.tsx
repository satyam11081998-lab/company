import type { Metadata } from 'next';
import Link from 'next/link';
import { homeSerif } from '@/components/home/fonts';
import { ACCENT_DARK, Crumbs, InsightsBar, InsightsFooter, PAPER, accentStyle, fmtDate } from '@/components/insights/parts';
import { AspirantHubNav } from '@/components/insights/AspirantHubNav';
import { getGdTopicsData } from '@/lib/insights/aspirant-hubs';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: 'GD Topics for MBA Interviews 2026 (With For & Against Points) — MECE Insights' },
  description:
    'Curated Group Discussion (GD) topics from real business current affairs, with structured For and Against arguments, facts, and strategy analysis for MBA aspirants.',
  alternates: {
    canonical: `${SITE_URL}/insights/gd-topics`,
  },
  openGraph: {
    title: 'GD Topics for MBA Interviews 2026 (With For & Against Points)',
    description: 'Structured current affairs debates with balanced arguments for IIM, XLRI, and MBA interview GD rounds.',
    url: `${SITE_URL}/insights/gd-topics`,
    type: 'website',
    siteName: 'MECE',
    images: [{
      url: `/og?title=${encodeURIComponent('GD Topics for MBA Interviews 2026')}&subtitle=${encodeURIComponent('Curated current affairs topics with structured For and Against arguments for MBA aspirants.')}&kind=insight`,
      width: 1200,
      height: 630,
    }],
  },
};

export default async function GdTopicsPage() {
  const { items, months, totalCount } = await getGdTopicsData();
  const canonicalUrl = `${SITE_URL}/insights/gd-topics`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GD Topics for MBA Interviews 2026',
    description: 'Current affairs GD topics for MBA interviews with balanced For and Against points.',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 30).map((item, idx) => ({
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
      { '@type': 'ListItem', position: 3, name: 'GD Topics', item: canonicalUrl },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <InsightsBar />

      <main className="mx-auto max-w-[1200px] px-5 pt-4 pb-20 sm:px-6">
        <Crumbs items={[{ label: 'MECE', href: '/' }, { label: 'Insights', href: '/insights' }, { label: 'GD Topics' }]} />

        {/* Masthead */}
        <header className="py-8 sm:py-12 border-b border-border">
          <p className="text-micro font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            MBA Placement & Admissions Prep · Group Discussions
          </p>
          <h1 className="mt-2 font-editorial text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            GD Topics for MBA Interviews (2026)
          </h1>
          <p className="mt-3 max-w-3xl font-editorial text-[1.12rem] leading-relaxed text-muted-foreground sm:text-[1.25rem]">
            Real business current affairs broken into structured debates. Every topic includes balanced For and Against
            arguments backed by verified facts for your IIM, XLRI, FMS, and consulting GD rounds.
          </p>
          <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount} Debated Topics</span>
            <span>·</span>
            <span>Updated Daily</span>
          </div>
        </header>

        {/* Navigation & Archive */}
        <div className="py-6">
          <AspirantHubNav activeTab="gd-topics" months={months} />
        </div>

        {/* Topics List */}
        <section aria-label="Curated GD Topics" className="mt-4 space-y-8">
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
                <Link
                  href={`/insights/gd-topics/${item.monthSlug}`}
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
            Interview Preparation
          </p>
          <h2 id="cta-heading" className="mt-2 font-editorial text-[1.8rem] sm:text-[2.2rem] font-semibold text-foreground">
            Practice Expressing Structure Under Real Pressure
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Knowledge of GD topics gets you noticed; structured clarity earns the offer. Test your business reasoning
            in interactive case simulations.
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
