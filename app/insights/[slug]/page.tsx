import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { homeSerif } from '@/components/home/fonts';
import {
  ACCENT_DARK, Cited, Credit, Crumbs, InsightCard, InsightsBar, InsightsFooter, Kicker, PAPER, Picture, TopicLabel,
  accentStyle, fmtDate, lighten, readingMinutes, topicOf,
} from '@/components/insights/parts';
import { ReadingProgress, ShareRow } from '@/components/insights/ReadingChrome';
import { ORG_ID, SITE_URL, WEBSITE_ID } from '@/lib/seo';
import { getPublishedSeoPage, getPublishedSeoPages, type SeoContent, type SeoPage } from '@/lib/seo-pages';

/**
 * One MECE Insights essay. Art direction follows the essay magazines (Aeon): a black stage with the
 * picture, a big serif title and the standfirst; then a single serif column with a drop cap, pictures
 * that break wider than the text, a pull quote, a stat strip, a tinted sidebar for MBA aspirants,
 * numbered notes and an author box; then more essays. Pictures are generated with Gemini per article
 * (consilio-backend services/growth/images.py); an article without one keeps the typographic stage.
 * Renders 'daily-2', 'daily-1' and the older news_case breakdowns.
 */

// ISR: near-static. Ten minutes so pictures added after publishing show up soon.
export const revalidate = 600;

const bodyText = 'text-[#2a2a27] dark:text-[#d9d5cc]';
const rule = 'border-black/10 dark:border-white/10';

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const page = await getPublishedSeoPage(params.slug);
  if (!page) return { title: { absolute: 'Not found · MECE Insights' }, robots: { index: false, follow: false } };
  const url = `${SITE_URL}/insights/${page.slug}`;
  const hero = page.content?.hero;
  const image = hero?.url
    ? hero.og_url
      // the link-preview JPEG is 1200 px wide, same shape as the hero (services/growth/images.py)
      ? { url: hero.og_url, width: 1200, height: hero.width && hero.height ? Math.round((1200 * hero.height) / hero.width) : 675, alt: hero.alt || page.title }
      : { url: hero.url, width: hero.width, height: hero.height, alt: hero.alt || page.title }
    : { url: `/og?title=${encodeURIComponent(page.title.slice(0, 110))}&subtitle=${encodeURIComponent((page.dek || '').slice(0, 150))}&kind=insight`, width: 1200, height: 630, alt: page.title };
  const published = page.published_at ?? page.created_at;
  return {
    title: { absolute: `${page.title} | MECE Insights` },
    description: page.meta_description,
    keywords: page.keywords?.length ? page.keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.meta_description,
      url,
      type: 'article',
      siteName: 'MECE',
      publishedTime: published,
      modifiedTime: page.updated_at,
      section: topicOf(page).label,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.meta_description, images: [image.url] },
  };
}

export default async function InsightPage({ params }: { params: { slug: string } }) {
  const [page, recent] = await Promise.all([getPublishedSeoPage(params.slug), getPublishedSeoPages(24)]);
  if (!page) notFound();

  const c: SeoContent = page.content || {};
  const daily = Boolean(c.format?.startsWith('daily'));
  const t = topicOf(page);
  const url = `${SITE_URL}/insights/${page.slug}`;
  const published = page.published_at ?? page.created_at;
  const hero = c.hero?.url ? c.hero : null;
  const sections = c.sections || [];
  const nSec = sections.length;
  const imagesAfter = (i: number) =>
    (c.images || []).filter((im) => im?.url && Math.min(Math.max(im.after_section || 1, 1), Math.max(nSec, 1)) === i + 1);
  // The pull quote sits after the second section unless a picture is already there.
  const quoteAfter = c.pull_quote && nSec > 1
    ? ([1, 2, 0].find((i) => i < nSec - 1 && imagesAfter(i).length === 0) ?? 1)
    : -1;
  const firstPara: 'lede' | 'intro' | 'section' = c.lede ? 'lede' : c.intro ? 'intro' : 'section';
  const related = pickRelated(recent, page, t.label);
  const pics = [...(hero ? [hero] : []), ...(c.images || [])];
  const rel = c.related || {};

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: page.title.slice(0, 110),
    description: page.meta_description,
    image: hero ? [hero.og_url || hero.url] : undefined,
    datePublished: published,
    dateModified: page.updated_at,
    author: { '@type': 'Organization', name: 'MECE Editorial', url: `${SITE_URL}/insights` },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: url,
    articleSection: t.label,
    wordCount: c.words || undefined,
    keywords: (page.keywords || []).join(', ') || undefined,
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
  };
  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MECE', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${SITE_URL}/insights` },
      { '@type': 'ListItem', position: 3, name: page.title, item: url },
    ],
  };
  // The FAQ is visible below, so FAQPage markup matches what the reader sees.
  const faqLd = daily && c.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '') },
    })),
  } : null;

  return (
    <div className={`${homeSerif.variable} ${PAPER} ${ACCENT_DARK}`} style={accentStyle(t.color)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <ReadingProgress color="var(--accent)" />

      {/* ---------- the stage ---------- */}
      <header
        className="bg-[#0b0b0c] text-white"
        style={hero ? undefined : { backgroundImage: `radial-gradient(90% 70% at 50% 0%, ${t.color}66 0%, transparent 70%)` }}
      >
        <InsightsBar onDark />
        <div className="mx-auto max-w-[1200px] px-5 pt-3 sm:px-6 sm:pt-4">
          <Crumbs onDark items={[{ label: 'MECE', href: '/' }, { label: 'Insights', href: '/insights' }, { label: page.title }]} />
        </div>
        {hero && (
          <figure className="mx-auto max-w-[1200px] pt-3 sm:px-6 sm:pt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.url}
              alt={hero.alt || ''}
              width={hero.width}
              height={hero.height}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="block aspect-[16/9] max-h-[min(62vh,680px)] w-full bg-neutral-900 object-cover"
            />
            {(hero.caption || hero.credit) && (
              <figcaption className="mx-auto mt-3 max-w-[1200px] px-5 font-sans text-[0.78rem] leading-relaxed text-white/50 sm:px-0">
                {hero.caption}{hero.caption && hero.credit ? ' ' : ''}
                <Credit image={hero} onDark />
              </figcaption>
            )}
          </figure>
        )}
        <div className={`mx-auto max-w-[940px] px-5 text-center ${hero ? 'pb-16 pt-10 sm:pb-20 sm:pt-12' : 'pb-20 pt-16 sm:pb-28 sm:pt-24'}`}>
          <Link href="/insights" className="hover:opacity-80">
            <TopicLabel label={daily ? t.label : 'Case & GD breakdown'} color={t.color} onDark />
          </Link>
          <h1 className="mx-auto mt-5 text-balance font-editorial text-[clamp(2.2rem,6.2vw,4.4rem)] font-semibold leading-[1.05] tracking-[-0.018em]">
            {page.title}
          </h1>
          {page.dek && (
            <p className="mx-auto mt-6 max-w-[40rem] text-balance font-editorial text-[1.22rem] leading-[1.4] text-white/75 sm:text-[1.45rem]">
              {page.dek}
            </p>
          )}
          <p className="mt-8 font-sans text-[0.74rem] font-medium uppercase tracking-[0.18em] text-white/55">
            By MECE Editorial
          </p>
        </div>
      </header>

      {/* ---------- meta bar ---------- */}
      <div className={`border-b ${rule}`}>
        <div className="mx-auto flex max-w-[1040px] flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-sans text-[0.76rem] font-medium uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            <time dateTime={published}>{fmtDate(published, true)}</time>
            {c.words ? <> · {c.words.toLocaleString('en-IN')} words · {readingMinutes(c.words)} min read</> : null}
          </p>
          <ShareRow url={url} title={page.title} />
        </div>
      </div>

      {/* ---------- the essay ---------- */}
      <article id="insight-body" className="mx-auto max-w-[680px] px-5 pb-10 pt-12 sm:px-0 sm:pt-16">
        <div className={`font-editorial text-[1.17rem] leading-[1.72] sm:text-[1.26rem] ${bodyText}`}>
          {daily && c.key_points?.length ? (
            <aside className={`mb-12 border-y ${rule} py-6`} aria-label="In brief">
              <Kicker>In brief</Kicker>
              <ul className="mt-3 space-y-2.5">
                {c.key_points.map((k, i) => (
                  <li key={i} className="flex gap-3 text-[1.04rem] leading-[1.55] sm:text-[1.08rem]">
                    <span className="mt-[0.15em] font-sans text-[0.8rem] font-semibold tabular-nums text-[color:var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
                    <span><Cited text={k} /></span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          {daily && c.summary && !c.key_points?.length && (
            <aside className={`mb-12 border-y ${rule} py-6`} aria-label="In short">
              <Kicker>In short</Kicker>
              <p className="mt-3 text-[1.06rem] leading-[1.6]"><Cited text={c.summary} /></p>
            </aside>
          )}

          {c.lede && <p className={dropCap}><Cited text={c.lede} /></p>}
          {c.intro && <p className={firstPara === 'intro' ? dropCap : 'mt-6'}>{c.intro}</p>}

          {c.why_it_matters && (
            <>
              <H2>Why it matters</H2>
              <p className="mt-4">{c.why_it_matters}</p>
            </>
          )}

          {/* the older breakdowns put the framework first; an essay explains the story first */}
          {!daily && <Framework c={c} />}

          {sections.map((sec, i) => (
            <div key={i}>
              {sec.heading && <H2>{sec.heading}</H2>}
              {(sec.paragraphs || []).map((p, j) => (
                <p key={j} className={i === 0 && j === 0 && firstPara === 'section' && !sec.heading ? dropCap : 'mt-6'}>
                  <Cited text={p} />
                </p>
              ))}
              {sec.bullets?.length ? (
                <ul className="mt-5 space-y-3">
                  {sec.bullets.map((b, j) => (
                    <li key={j} className="relative pl-6 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-[color:var(--accent)]">
                      <Cited text={b} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {imagesAfter(i).map((im, k) => (
                <Picture key={k} image={im} wide className="my-14" />
              ))}
              {i === quoteAfter && c.pull_quote && <PullQuote text={c.pull_quote} />}
            </div>
          ))}

          {daily && c.numbers?.length ? (
            <section className="mt-16" aria-labelledby="numbers-title">
              <Kicker><span id="numbers-title">By the numbers</span></Kicker>
              <dl className={`mt-4 grid border-t ${rule} sm:grid-cols-2`}>
                {c.numbers.map((n, i) => (
                  <div key={i} className={`border-b ${rule} py-5 sm:odd:pr-6 sm:even:border-l sm:even:pl-6`}>
                    <dt className="font-editorial text-[2.3rem] font-semibold leading-none tracking-[-0.01em] text-[color:var(--accent)] sm:text-[2.6rem]">
                      {n.figure}
                      {n.sources?.length ? <span className="text-[1rem]"><Cited text={` [${n.sources.join(',')}]`} /></span> : null}
                    </dt>
                    <dd className="mt-2 font-sans text-[0.92rem] leading-snug text-neutral-600 dark:text-neutral-400">{n.what}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {daily && <Framework c={c} />}

          {daily && c.what_to_watch?.length ? (
            <section aria-labelledby="watch-title">
              <H2 id="watch-title">What to watch</H2>
              <ul className="mt-5 space-y-3">
                {c.what_to_watch.map((w, i) => (
                  <li key={i} className="relative pl-6 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-[color:var(--accent)]">
                    <Cited text={w} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {daily && c.aspirants && (c.aspirants.gd_topic || c.aspirants.pi_questions?.length) ? (
            <Aspirants a={c.aspirants} />
          ) : null}

          {daily && c.interview_angle && (c.interview_angle.case || c.interview_angle.questions?.length) ? (
            <section aria-labelledby="angle-title">
              <H2 id="angle-title">How this can come up in your interview</H2>
              {c.interview_angle.case && <p className="mt-4"><b className="font-semibold">As a case: </b><Cited text={c.interview_angle.case} /></p>}
              {c.interview_angle.gd && <p className="mt-4"><b className="font-semibold">In a GD: </b><Cited text={c.interview_angle.gd} /></p>}
              {c.interview_angle.questions?.length ? (
                <ol className="mt-4 list-decimal space-y-2 pl-6 marker:font-sans marker:text-[0.85em] marker:text-[color:var(--accent)]">
                  {c.interview_angle.questions.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              ) : null}
            </section>
          ) : null}

          {c.takeaways?.length ? (
            <section aria-labelledby="takeaways-title">
              <H2 id="takeaways-title">Key takeaways</H2>
              <ul className="mt-5 space-y-3">
                {c.takeaways.map((x, i) => (
                  <li key={i} className="relative pl-6 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-[color:var(--accent)]">
                    <Cited text={x} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* the end mark */}
          <p className="mt-12 text-center text-[color:var(--accent)]" aria-hidden>
            <svg viewBox="50 47 49 32" className="inline h-3 w-auto"><polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="currentColor" /><polygon points="52.00,77.00 66.88,56.88 81.75,77.00" fill="currentColor" opacity="0.55" /></svg>
          </p>
        </div>

        {/* ---------- practise it ---------- */}
        <section className="relative left-1/2 mt-16 w-[min(100vw,820px)] -translate-x-1/2 bg-[#0b0b0c] px-6 py-10 text-white sm:px-12 sm:py-12" aria-labelledby="practise-title">
          <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em]" style={{ color: lighten(t.color) }}>Read it, then practise it</p>
          <h2 id="practise-title" className="mt-3 font-editorial text-[1.8rem] font-semibold leading-tight sm:text-[2.1rem]">
            Could you crack this in an interview?
          </h2>
          {c.practice_prompt && (
            <p className="mt-3 font-editorial text-[1.12rem] leading-snug text-white/80">Try this: {c.practice_prompt}</p>
          )}
          <p className="mt-3 max-w-xl font-sans text-[0.95rem] leading-relaxed text-white/65">
            Reading builds the context; a timed attempt with a live AI interviewer builds the skill. MECE scores your
            structure, maths and synthesis and shows exactly where you lost marks.
          </p>
          {(rel.case || rel.guesstimate) && (
            <ul className="mt-5 space-y-2 font-sans text-[0.92rem]">
              {[rel.case, rel.guesstimate].filter(Boolean).map((r) => (
                <li key={r!.id}>
                  <Link href={`/cases/${r!.id}`} className="underline decoration-white/30 underline-offset-4 hover:decoration-white">
                    {r!.type === 'guesstimate' ? 'Related guesstimate' : 'Related case'}: {r!.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-7 flex flex-wrap gap-3 font-sans">
            <Link href="/practice" className="rounded-full bg-white px-5 py-2.5 text-[0.88rem] font-semibold text-black transition-opacity hover:opacity-90">
              {daily ? 'Try today’s free case' : 'Practise free on MECE'}
            </Link>
            <Link href="/learn/mece-framework" className="rounded-full border border-white/30 px-5 py-2.5 text-[0.88rem] font-semibold text-white hover:border-white/60">
              Learn the MECE method
            </Link>
          </div>
        </section>

        {daily && c.faq?.length ? (
          <section className="mt-16" aria-labelledby="faq-title">
            <H2 id="faq-title" className="!mt-0">Questions people ask</H2>
            <dl className={`mt-5 divide-y ${rule} border-y ${rule}`}>
              {c.faq.map((f, i) => (
                <div key={i} className="py-5">
                  <dt className="font-editorial text-[1.18rem] font-semibold leading-snug">{f.q}</dt>
                  <dd className={`mt-2 font-editorial text-[1.06rem] leading-[1.65] ${bodyText}`}><Cited text={f.a} /></dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {/* ---------- notes ---------- */}
        {daily && c.sources?.length ? (
          <section className="mt-14" aria-labelledby="notes-title">
            <p id="notes-title" className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">Notes and sources</p>
            <ol className="mt-4 space-y-2 font-sans text-[0.85rem] leading-relaxed text-neutral-600 dark:text-neutral-400">
              {c.sources.map((s) => (
                <li key={s.n} id={`note-${s.n}`} className="flex scroll-mt-24 gap-3 target:bg-black/[0.04] dark:target:bg-white/[0.06]">
                  <span className="w-5 shrink-0 text-right tabular-nums text-[color:var(--accent)]">{s.n}</span>
                  <span className="min-w-0 break-words">
                    {s.url
                      ? <a href={s.url} rel="nofollow noopener" target="_blank" className="underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900 dark:decoration-neutral-600 dark:hover:text-white">{s.label || hostOf(s.url)}</a>
                      : s.label}
                    {s.url && s.label && <span className="text-neutral-400"> · {hostOf(s.url)}</span>}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 font-sans text-[0.8rem] leading-relaxed text-neutral-500">
              Figures are as published by these sources on or before {fmtDate(published, true)}. Researched and drafted
              with AI, checked against the sources above and reviewed by the MECE team before publishing.
              {pics.some((x) => x.source === 'photo') ? ' Photographs are used under their open licences; the photographer and licence are credited under each one.' : ''}
              {pics.some((x) => x.source !== 'photo') ? ' Pictures marked as generated were made with Gemini and are illustrative, not photographs of the companies or people in the story.' : ''}
            </p>
          </section>
        ) : page.source_refs?.length ? (
          <p className="mt-14 font-sans text-[0.85rem] text-neutral-500">
            Source:{' '}
            {page.source_refs.map((r, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <a href={r.url} rel="nofollow noopener" target="_blank" className="underline hover:text-neutral-900 dark:hover:text-white">{r.label}</a>
              </span>
            ))}
          </p>
        ) : null}

        {/* ---------- author ---------- */}
        <div className={`mt-14 flex gap-4 border-t ${rule} pt-8`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F1C33] dark:bg-white" aria-hidden>
            <svg viewBox="50 47 49 32" className="h-[18px] w-auto"><polygon points="63.38,77.00 80.00,49.00 96.63,77.00" fill="#C8102E" /><polygon points="52.00,77.00 66.88,56.88 81.75,77.00" className="fill-white dark:fill-[#0F1C33]" /></svg>
          </span>
          <div>
            <p className="font-sans text-[0.95rem] font-semibold">MECE Editorial</p>
            <p className="mt-1 font-editorial text-[1.02rem] leading-snug text-neutral-600 dark:text-neutral-400">
              MECE Insights explains one business story a day for MBA students and aspirants: the facts with their
              sources, the strategy underneath, and how it can come up in a GD, a WAT or an interview.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 font-sans text-[0.8rem]">
              <span className="text-neutral-500">Filed under</span>
              <Link href="/insights" className="rounded-full border px-2.5 py-0.5 font-medium text-[color:var(--accent)] hover:bg-[color:var(--accent)] hover:text-white" style={{ borderColor: 'var(--accent)' }}>
                {t.label}
              </Link>
              {(page.keywords || []).slice(0, 3).map((k) => (
                <span key={k} className={`rounded-full border ${rule} px-2.5 py-0.5 text-neutral-600 dark:text-neutral-400`}>{k}</span>
              ))}
            </p>
          </div>
        </div>
      </article>

      {/* ---------- more ---------- */}
      {related.length > 0 && (
        <section className={`border-t ${rule}`} aria-labelledby="more-title">
          <div className="mx-auto max-w-[1200px] px-5 py-14 sm:px-6 sm:py-16">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="more-title" className="font-editorial text-[1.7rem] font-semibold sm:text-[2rem]">More from MECE Insights</h2>
              <Link href="/insights" className="shrink-0 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-neutral-500 hover:text-neutral-900 dark:hover:text-white">
                All essays
              </Link>
            </div>
            <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <InsightCard key={p.id} page={p} />)}
            </div>
          </div>
        </section>
      )}

      <InsightsFooter />
    </div>
  );
}

const dropCap =
  'first-letter:float-left first-letter:mr-3 first-letter:mt-[0.06em] first-letter:font-editorial first-letter:text-[4.15em] ' +
  'first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-[color:var(--accent)]';

function H2({ children, id, className = '' }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={`mt-14 font-editorial text-[1.55rem] font-semibold leading-[1.2] tracking-[-0.01em] text-[#141413] sm:text-[1.8rem] dark:text-[#f1ede5] ${className}`}>
      {children}
    </h2>
  );
}

function PullQuote({ text }: { text: string }) {
  return (
    <figure className="my-14 sm:-mx-16">
      <blockquote className="border-y-2 py-8 text-center font-editorial text-[1.6rem] font-medium italic leading-[1.28] text-[color:var(--accent)] sm:text-[2.05rem]" style={{ borderColor: 'var(--accent)' }}>
        {text.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '')}
      </blockquote>
    </figure>
  );
}

function Framework({ c }: { c: SeoContent }) {
  if (!c.framework?.steps?.length) return null;
  return (
    <section className="mt-16 border-l-[3px] pl-6 sm:pl-8" style={{ borderColor: 'var(--accent)' }} aria-labelledby="lens-title">
      <Kicker>{c.framework.name ? `The lens: ${c.framework.name}` : 'The lens'}</Kicker>
      <h2 id="lens-title" className="mt-2 font-editorial text-[1.45rem] font-semibold leading-tight text-[#141413] sm:text-[1.65rem] dark:text-[#f1ede5]">
        {c.framework.heading || 'How to structure this in an interview'}
      </h2>
      <ol className="mt-5 space-y-4">
        {c.framework.steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-[0.1em] font-editorial text-[1.4rem] font-semibold leading-none tabular-nums text-[color:var(--accent)]">{i + 1}</span>
            <span><Cited text={s} /></span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Aspirants({ a }: { a: NonNullable<SeoContent['aspirants']> }) {
  return (
    <section
      className="relative left-1/2 mt-16 w-[min(100vw,760px)] -translate-x-1/2 bg-[#f3eee3] px-6 py-9 sm:px-10 dark:bg-[#1c1a16]"
      aria-labelledby="aspirants-title"
    >
      <Kicker>For MBA aspirants</Kicker>
      <h2 id="aspirants-title" className="mt-2 font-editorial text-[1.55rem] font-semibold leading-tight text-[#141413] sm:text-[1.8rem] dark:text-[#f1ede5]">
        GD, PI and WAT
      </h2>
      {a.gd_topic && (
        <p className="mt-5 font-editorial text-[1.3rem] italic leading-snug text-[#141413] dark:text-[#f1ede5]">
          <span className="not-italic font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">GD topic</span>
          <br />{a.gd_topic}
        </p>
      )}
      {(a.for?.length || a.against?.length) ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {([['For', a.for], ['Against', a.against]] as const).map(([label, pts]) => (
            pts?.length ? (
              <div key={label}>
                <p className="border-b border-black/15 pb-1.5 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.12em] dark:border-white/15">{label}</p>
                <ul className="mt-3 space-y-2.5 font-editorial text-[1.04rem] leading-[1.55]">
                  {pts.map((x, i) => <li key={i}><Cited text={x} /></li>)}
                </ul>
              </div>
            ) : null
          ))}
        </div>
      ) : null}
      {a.pi_questions?.length ? (
        <div className="mt-7">
          <p className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">Questions an interviewer could ask</p>
          <ol className="mt-3 space-y-2.5 font-editorial text-[1.04rem] leading-[1.55]">
            {a.pi_questions.map((q, i) => (
              <li key={i} className="flex gap-3">
                <span className="font-sans text-[0.85rem] font-semibold tabular-nums text-[color:var(--accent)]">{i + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {(a.wat_prompt || a.case_question) && (
        <dl className="mt-7 grid gap-5 sm:grid-cols-2">
          {a.wat_prompt && (
            <div>
              <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">WAT prompt</dt>
              <dd className="mt-2 font-editorial text-[1.04rem] leading-[1.55]">{a.wat_prompt}</dd>
            </div>
          )}
          {a.case_question && (
            <div>
              <dt className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-neutral-500">As a case</dt>
              <dd className="mt-2 font-editorial text-[1.04rem] leading-[1.55]">{a.case_question}</dd>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

function hostOf(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return u; }
}

/** Three other essays: same topic first, then the newest. */
function pickRelated(all: SeoPage[], page: SeoPage, label: string): SeoPage[] {
  const others = all.filter((p) => p.slug !== page.slug);
  const same = others.filter((p) => topicOf(p).label === label);
  const rest = others.filter((p) => topicOf(p).label !== label);
  return [...same.slice(0, 2), ...rest, ...same.slice(2)].slice(0, 3);
}
