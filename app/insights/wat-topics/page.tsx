import type { Metadata } from 'next';
import Link from 'next/link';
import { homeSerif } from '@/components/home/fonts';
import { ACCENT_DARK, Crumbs, InsightsBar, InsightsFooter, PAPER, accentStyle, fmtDate } from '@/components/insights/parts';
import { AspirantHubNav } from '@/components/insights/AspirantHubNav';
import { getWatTopicsData } from '@/lib/insights/aspirant-hubs';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: 'WAT Topics for MBA 2026 (Written Ability Test Prompts & Points) — MECE Insights' },
  description:
    'Curated Written Ability Test (WAT) essay prompts from real business current affairs, with analytical frameworks, background context, and data for MBA admissions.',
  alternates: {
    canonical: `${SITE_URL}/insights/wat-topics`,
  },
  openGraph: {
    title: 'WAT Topics for MBA 2026 (Written Ability Test Prompts & Points)',
    description: 'Analytical essay prompts and business frameworks for IIM, XLRI, and MBA admission WAT rounds.',
    url: `${SITE_URL}/insights/wat-topics`,
    type: 'website',
    siteName: 'MECE',
    images: [{
      url: `/og?title=${encodeURIComponent('WAT Topics for MBA 2026')}&subtitle=${encodeURIComponent('Written Ability Test prompts with business strategy analysis for MBA admissions.')}&kind=insight`,
      width: 1200,
      height: 630,
    }],
  },
};

export default async function WatTopicsPage() {
  const { items, months, totalCount } = await getWatTopicsData();
  const canonicalUrl = `${SITE_URL}/insights/wat-topics`;

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'WAT Topics for MBA 2026',
    description: 'Analytical Written Ability Test essay prompts from current affairs for MBA aspirants.',
    url: canonicalUrl,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 30).map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.watPrompt,
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
      { '@type': 'ListItem', position: 3, name: 'WAT Topics', item: canonicalUrl },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }} />
      <InsightsBar />

      <main className="mx-auto max-w-[1200px] px-5 pt-4 pb-20 sm:px-6">
        <Crumbs items={[{ label: 'MECE', href: '/' }, { label: 'Insights', href: '/insights' }, { label: 'WAT Topics' }]} />

        {/* Masthead */}
        <header className="py-8 sm:py-12 border-b border-border">
          <p className="text-micro font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            MBA Admission Preparation · Written Ability Test (WAT)
          </p>
          <h1 className="mt-2 font-editorial text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
            WAT Topics & Essay Prompts (2026)
          </h1>
          <p className="mt-3 max-w-3xl font-editorial text-[1.12rem] leading-relaxed text-muted-foreground sm:text-[1.25rem]">
            Analytical essay prompts drawn from major business and economic developments. Every prompt comes with the
            underlying market context, strategic tradeoffs, and verified facts needed for top-tier IIM WAT essays.
          </p>
          <div className="mt-6 flex items-center gap-3 text-small text-muted-foreground">
            <span className="font-semibold text-foreground">{totalCount} Curated Essay Prompts</span>
            <span>·</span>
            <span>Updated Daily</span>
          </div>
        </header>

        {/* Navigation & Archive */}
        <div className="py-6">
          <AspirantHubNav activeTab="wat-topics" months={months} />
        </div>

        {/* Topics List */}
        <section aria-label="Curated WAT Topics" className="mt-4 space-y-8">
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

              <div className="mt-4">
                <span className="text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Essay Prompt
                </span>
                <h2 className="mt-1 font-editorial text-[1.45rem] sm:text-[1.75rem] font-semibold leading-snug text-foreground">
                  "{item.watPrompt}"
                </h2>
              </div>

              {item.summary && (
                <div className="mt-4 rounded-md border border-border bg-muted/30 p-4">
                  <p className="text-micro font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Context & Strategic Background
                  </p>
                  <p className="mt-2 text-body text-card-foreground leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              )}

              {item.caseQuestion && (
                <div className="mt-4 rounded-md border border-border bg-muted/20 p-4">
                  <p className="text-micro font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Case Interview Angle
                  </p>
                  <p className="mt-1 text-body text-card-foreground italic">
                    {item.caseQuestion}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Link
                  href={`/insights/${item.slug}`}
                  className="text-small font-medium text-foreground hover:underline underline-offset-4"
                >
                  Read full strategic breakdown & facts for essay →
                </Link>
                <Link
                  href={`/insights/wat-topics/${item.monthSlug}`}
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
            MBA Interview Practice
          </p>
          <h2 id="cta-heading" className="mt-2 font-editorial text-[1.8rem] sm:text-[2.2rem] font-semibold text-foreground">
            Structure Your Thinking Like a Management Consultant
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">
            Writing a clear WAT essay requires the same MECE structuring principles used in top consulting interviews.
            Practice framework construction interactively.
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
