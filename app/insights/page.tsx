import type { Metadata } from 'next';
import Link from 'next/link';
import { homeSerif } from '@/components/home/fonts';
import {
  ACCENT_DARK, Crumbs, InsightCard, InsightsBar, InsightsFooter, PAPER, TopicLabel, accentStyle, fmtDate, topicOf,
} from '@/components/insights/parts';
import { SITE_URL } from '@/lib/seo';
import { getPublishedSeoPages } from '@/lib/seo-pages';

// A post published from Telegram should show up here within minutes, not an hour.
export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: 'MECE Insights: a business story a day for MBA students' },
  description:
    'One business story a day, explained with sourced facts and figures, and turned into GD, WAT, interview and case practice for MBA students and aspirants.',
  alternates: { canonical: `${SITE_URL}/insights` },
  openGraph: {
    title: 'MECE Insights',
    description: 'A business story a day, sourced and explained, for MBA students and aspirants.',
    url: `${SITE_URL}/insights`,
    type: 'website',
    siteName: 'MECE',
    images: [{ url: `/og?title=${encodeURIComponent('A business story a day, sourced and explained')}&subtitle=${encodeURIComponent('For MBA students and aspirants: facts with sources, the strategy underneath, and GD, PI and case practice.')}&kind=insight`, width: 1200, height: 630 }],
  },
};

const rule = 'border-black/10 dark:border-white/10';

export default async function InsightsIndex() {
  const pages = await getPublishedSeoPages(200);
  const [lead, ...rest] = pages;
  const latest = rest.slice(0, 9);
  const archive = rest.slice(9);
  const listLd = pages.length ? {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MECE Insights',
    url: `${SITE_URL}/insights`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: pages.slice(0, 20).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/insights/${p.slug}`, name: p.title })),
    },
  } : null;
  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
    ],
  };

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle('#9D120D')}>
      {listLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />
      <InsightsBar />
      <div className="mx-auto max-w-[1200px] px-5 pt-4 sm:px-6">
        <Crumbs items={[{ label: 'MECE', href: '/' }, { label: 'Insights' }]} />
      </div>

      {/* ---------- masthead ---------- */}
      {/* Compact: the title, one wide standfirst (two lines on a laptop), then straight into the lead essay. */}
      <header className="mx-auto max-w-[1200px] px-5 pb-6 pt-4 text-center sm:px-6 sm:pb-8 sm:pt-6">
        <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          A business story a day · Sourced · Free
        </p>
        <h1 className="mt-2 font-editorial text-[clamp(2.8rem,8vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
          Insights
        </h1>
        <p className="mx-auto mt-3 max-w-[54rem] text-balance font-editorial text-[1.12rem] leading-snug text-neutral-600 sm:text-[1.25rem] dark:text-neutral-400">
          The business underneath the headline, explained with facts you can check, and turned into practice for
          your GD, WAT and interviews.
        </p>
        <div className={`mx-auto mt-6 h-[3px] max-w-[1200px] border-y sm:mt-8 ${rule}`} aria-hidden />
      </header>

      {pages.length === 0 ? (
        <div className="mx-auto max-w-[680px] px-5 pb-24 text-center font-editorial text-[1.2rem] text-neutral-600 dark:text-neutral-400">
          <p>The first essays are on their way.</p>
          <p className="mt-3">
            In the meantime,{' '}
            <Link href="/learn/mece-framework" className="text-[color:var(--accent)] underline underline-offset-4">learn the MECE method</Link>
            {' '}or{' '}
            <Link href="/practice" className="text-[color:var(--accent)] underline underline-offset-4">try a free case</Link>.
          </p>
        </div>
      ) : (
        <>
          {/* ---------- lead essay ---------- */}
          <section className="mx-auto max-w-[1200px] px-5 sm:px-6" aria-label="Latest essay">
            <InsightCard page={lead} size="lg" />
          </section>

          {/* ---------- what every essay gives you ---------- */}
          <section className="mx-auto mt-14 max-w-[1200px] px-5 sm:px-6" aria-label="What every essay gives you">
            <dl className={`grid divide-y divide-black/10 border-y ${rule} sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10`}>
              {[
                ['Sourced', 'Every figure is linked to the page it came from. No number without a note.'],
                ['Explained', 'Not the news again: how the business works, who wins, and the debate underneath.'],
                ['Practised', 'Each essay ends with a GD topic, interview questions, a WAT prompt and a case.'],
              ].map(([k, v]) => (
                <div key={k} className="py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0">
                  <dt className="font-editorial text-[1.3rem] font-semibold italic text-[color:var(--accent)]">{k}</dt>
                  <dd className="mt-1.5 font-sans text-[0.92rem] leading-relaxed text-neutral-600 dark:text-neutral-400">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* ---------- latest ---------- */}
          {latest.length > 0 && (
            <section className="mx-auto max-w-[1200px] px-5 pt-14 sm:px-6" aria-labelledby="latest-title">
              <h2 id="latest-title" className="font-editorial text-[1.7rem] font-semibold sm:text-[2rem]">Latest essays</h2>
              <div className="mt-8 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((p) => <InsightCard key={p.id} page={p} />)}
              </div>
            </section>
          )}

          {/* ---------- archive ---------- */}
          {archive.length > 0 && (
            <section className="mx-auto max-w-[900px] px-5 pt-16 sm:px-6" aria-labelledby="archive-title">
              <h2 id="archive-title" className="font-editorial text-[1.7rem] font-semibold sm:text-[2rem]">From the archive</h2>
              <ul className={`mt-6 divide-y ${rule} border-y ${rule}`}>
                {archive.map((p) => {
                  const t = topicOf(p);
                  return (
                    <li key={p.id}>
                      <Link href={`/insights/${p.slug}`} className="group grid gap-1 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                        <span className="pt-1 font-sans text-[0.76rem] uppercase tracking-[0.1em] text-neutral-500">
                          {fmtDate(p.published_at ?? p.created_at)}
                        </span>
                        <span>
                          <TopicLabel label={t.label} color={t.color} />
                          <span className="mt-1 block font-editorial text-[1.2rem] font-semibold leading-snug decoration-1 underline-offset-4 group-hover:underline">
                            {p.title}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {/* ---------- practise ---------- */}
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
