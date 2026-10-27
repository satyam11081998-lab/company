import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { homeSerif } from '@/components/home/fonts';
import {
  ACCENT_DARK, Crumbs, InsightCard, InsightsBar, InsightsFooter, PAPER, accentStyle,
} from '@/components/insights/parts';
import { TOPIC_COLORS, topicFromSlug, topicOf, topicSlug } from '@/lib/insights/topics';
import { SITE_URL } from '@/lib/seo';
import { getPublishedSeoPages } from '@/lib/seo-pages';

/**
 * /insights/topic/<topic> — one hub per subject.
 *
 * Every essay already renders a topic label (Finance, Economy, Technology…) and
 * until now none of them linked anywhere, so the labels were decoration. These
 * hubs do three things a flat archive cannot:
 *   - give the site a page that can rank for the category itself
 *     ("UPI analysis for MBA", "Indian banking explained") rather than only for
 *     one day's headline;
 *   - add real internal linking depth, so a new post is one hop from a hub that
 *     is itself linked from the index, instead of sinking down a single list;
 *   - give a reader who liked one essay somewhere to go next.
 *
 * A hub with no essays 404s rather than shipping an empty page: an indexable
 * page with nothing on it is worse than no page.
 */

export const revalidate = 300;

const BLURB: Record<string, string> = {
  Finance: 'Banks, payments, markets and capital in India — what moved, who pays for it, and how to argue it in an interview.',
  Economy: 'Rates, inflation, trade and the rupee, explained with the figures and the debate underneath them.',
  Technology: 'AI, chips, data centres and telecom — the business model under the announcement.',
  Strategy: 'Mergers, conglomerates and competitive moves, read the way a consultant would read them.',
  Marketing: 'Brands, consumers and retail in India — positioning, pricing and who actually buys.',
  Operations: 'Supply chains, ports, factories and delivery — where the cost and the constraint really sit.',
  Careers: 'Hiring, placements and pay — what the market is doing to the jobs you are preparing for.',
  Business: 'Business stories that cut across sectors, explained for MBA students and aspirants.',
};

export function generateStaticParams() {
  return Object.keys(TOPIC_COLORS).map((l) => ({ topic: topicSlug(l) }));
}

async function load(slug: string) {
  const label = topicFromSlug(slug);
  if (!label) return null;
  const pages = (await getPublishedSeoPages(200)).filter((p) => topicOf(p).label === label);
  return { label, pages, color: TOPIC_COLORS[label] };
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  const data = await load(params.topic);
  if (!data || data.pages.length === 0) return { title: 'Not found', robots: { index: false, follow: false } };
  const title = `${data.label} — MECE Insights`;
  const description = BLURB[data.label] || BLURB.Business;
  const url = `${SITE_URL}/insights/topic/${topicSlug(data.label)}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: 'website', siteName: 'MECE',
      images: [{
        url: `/og?title=${encodeURIComponent(`${data.label} — MECE Insights`)}&subtitle=${encodeURIComponent(description)}&kind=insight`,
        width: 1200, height: 630,
      }],
    },
  };
}

export default async function TopicHub({ params }: { params: { topic: string } }) {
  const data = await load(params.topic);
  if (!data || data.pages.length === 0) notFound();
  const { label, pages, color } = data;
  const url = `${SITE_URL}/insights/topic/${topicSlug(label)}`;
  const others = Object.keys(TOPIC_COLORS).filter((l) => l !== label);

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${label} — MECE Insights`,
      description: BLURB[label] || BLURB.Business,
      url,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: pages.slice(0, 20).map((p, i) => ({
          '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/insights/${p.slug}`, name: p.title,
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
        { '@type': 'ListItem', position: 3, name: label, item: url },
      ],
    },
  ];

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle(color)}>
      {ld.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <InsightsBar />
      <div className="mx-auto max-w-[1200px] px-5 pt-4 sm:px-6">
        <Crumbs items={[{ label: 'MECE', href: '/' }, { label: 'Insights', href: '/insights' }, { label }]} />
      </div>

      <header className="mx-auto max-w-[1200px] px-5 pb-6 pt-6 sm:px-6 sm:pb-8">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--accent)]">
          MECE Insights
        </p>
        <h1 className="mt-2 font-editorial text-[clamp(2.4rem,7vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
          {label}
        </h1>
        <p className="mt-3 max-w-[48rem] text-balance font-editorial text-[1.12rem] leading-snug text-neutral-600 sm:text-[1.2rem] dark:text-neutral-400">
          {BLURB[label] || BLURB.Business}
        </p>
        <p className="mt-3 font-sans text-[0.85rem] text-neutral-500 dark:text-neutral-400">
          {pages.length} {pages.length === 1 ? 'essay' : 'essays'}
        </p>
        <div className="mt-6 h-[3px] border-y border-black/10 sm:mt-8 dark:border-white/10" aria-hidden />
      </header>

      <section className="mx-auto max-w-[1200px] px-5 sm:px-6" aria-label={`${label} essays`}>
        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => <InsightCard key={p.id} page={p} />)}
        </div>
      </section>

      <nav className="mx-auto mt-16 max-w-[1200px] px-5 sm:px-6" aria-label="Other topics">
        <h2 className="font-editorial text-[1.4rem] font-semibold">Other topics</h2>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {others.map((l) => (
            <li key={l}>
              <Link
                href={`/insights/topic/${topicSlug(l)}`}
                className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.14em] underline-offset-4 hover:underline"
                style={{ color: TOPIC_COLORS[l] }}
              >
                {l}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/insights" className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-neutral-500 underline-offset-4 hover:underline">
              All essays
            </Link>
          </li>
        </ul>
      </nav>

      <section className="mt-20 bg-[#0b0b0c] text-white" aria-labelledby="cta-title">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-16">
          <div className="max-w-2xl">
            <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/55">Read it, then practise it</p>
            <h2 id="cta-title" className="mt-3 font-editorial text-[2rem] font-semibold leading-tight sm:text-[2.6rem]">
              Knowing the story is half of it. Saying it well under pressure is the other half.
            </h2>
          </div>
          <Link href="/practice" className="shrink-0 self-start rounded-full bg-white px-6 py-3 font-sans text-[0.92rem] font-semibold text-black transition-opacity hover:opacity-90 sm:self-auto">
            Try a free case
          </Link>
        </div>
      </section>

      <InsightsFooter />
    </div>
  );
}
