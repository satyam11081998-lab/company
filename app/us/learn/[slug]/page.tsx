import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, BookOpen, Clock, ExternalLink, PlayCircle } from 'lucide-react';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import StartButton from '@/components/us/marketing/start-button';
import { FinalCta } from '@/components/us/marketing/sections';
import { Eyebrow, US_CARD } from '@/components/us/ui';
import { LearnBlocks } from '@/components/us-learn/blocks';
import { InlineMd } from '@/components/us-learn/inline-md';
import { US_CASE_TYPE_LABEL } from '@/lib/us-market';
import {
  LEARN_BASE,
  LEARN_PAGES,
  getLearnPage,
  learnPath,
  practiceFor,
  readMinutes,
  validateLearnLibrary,
} from '@/lib/us-learn';
import { US_ENTITY_LINE, jsonLdString, learnPageJsonLd, learnPageMetadata } from '@/lib/us-learn/seo';

/**
 * US Learn article — /us/learn/<slug>. Static (SSG): every page is known at
 * build time and unknown slugs 404. Public via the '/us' entry in
 * PUBLIC_ROUTES; never geo-redirected (not an India twin, not India-only).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  // Fail the build on a broken internal link, a missing case code or a
  // duplicate slug, instead of shipping a dead link to crawlers.
  const problems = validateLearnLibrary();
  if (problems.length) throw new Error(`US Learn library is inconsistent:\n- ${problems.join('\n- ')}`);
  return LEARN_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getLearnPage(params.slug);
  return page ? learnPageMetadata(page) : {};
}

function humanDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export default function LearnArticlePage({ params }: { params: { slug: string } }) {
  const page = getLearnPage(params.slug);
  if (!page) notFound();

  const practice = practiceFor(page);
  const related = page.related.map(getLearnPage).filter((p): p is NonNullable<typeof p> => !!p);
  const minutes = readMinutes(page);
  const toc = [
    ...page.sections.map((s) => ({ id: s.id, label: s.h })),
    ...(practice.cases.length || practice.sizing.length ? [{ id: 'practice', label: 'Practice this' }] : []),
    { id: 'faq', label: 'Frequently asked questions' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {learnPageJsonLd(page).map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(j) }} />
      ))}
      <UsHeader />

      <main id="main" className="mx-auto w-full max-w-[1160px] px-4 pb-6 pt-8 sm:px-6 lg:pt-12">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/us" className="hover:text-foreground">MECE</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href={LEARN_BASE} className="hover:text-foreground">Learn</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-foreground">{page.nav}</li>
          </ol>
        </nav>

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
          <article className="min-w-0 max-w-[760px]">
            <header>
              <Eyebrow>{page.eyebrow}</Eyebrow>
              <h1 className="mt-4 font-display text-[34px] leading-[1.1] tracking-[-0.015em] text-foreground sm:text-[44px]">{page.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
                <span>
                  Updated <time dateTime={page.modified}>{humanDate(page.modified)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock aria-hidden className="h-3.5 w-3.5" /> {minutes} min read
                </span>
                <span>By the MECE Editorial Team</span>
              </p>
            </header>

            <section aria-labelledby="short-answer" className={`${US_CARD} mt-7 p-5 sm:p-6`}>
              <h2 id="short-answer" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
                Short answer
              </h2>
              <p className="mt-2 text-[17px] leading-[1.7] text-foreground">{page.answer}</p>
            </section>

            <section aria-labelledby="takeaways" className="mt-7">
              <h2 id="takeaways" className="text-[18px] font-semibold text-foreground">
                Key takeaways
              </h2>
              <ul className="mt-3 space-y-2 text-[16px] leading-[1.7] text-foreground/85">
                {page.takeaways.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      <InlineMd md={t} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {page.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-12 scroll-mt-24">
                <h2 id={`${s.id}-h`} className="mb-4 font-display text-[26px] leading-tight text-foreground sm:text-[30px]">
                  {s.h}
                </h2>
                <LearnBlocks blocks={s.blocks} />
              </section>
            ))}

            {(practice.cases.length > 0 || practice.sizing.length > 0) && (
              <section id="practice" aria-labelledby="practice-h" className="mt-14 scroll-mt-24">
                <h2 id="practice-h" className="font-display text-[26px] leading-tight text-foreground sm:text-[30px]">
                  Practice this with a live case
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Reading builds recognition; solving builds skill. Each case below runs with MECE&apos;s AI interviewer, which answers your
                  clarifying questions, pushes back and scores you out of 100.
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {practice.cases.map((c) => (
                    <li key={c.code} className={`${US_CARD} flex flex-col p-4`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {US_CASE_TYPE_LABEL[c.type]} · {c.industry} · {c.difficulty}
                      </p>
                      <Link href={`/us/case-interview-examples#${c.slug}`} className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
                        {c.title}
                      </Link>
                      <Link
                        href={`/p/${c.code}`}
                        prefetch={false}
                        rel="nofollow"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-primary hover:underline underline-offset-4"
                      >
                        <PlayCircle aria-hidden className="h-4 w-4" /> Practice live
                      </Link>
                    </li>
                  ))}
                  {practice.sizing.map((g) => (
                    <li key={g.code} className={`${US_CARD} flex flex-col p-4`}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Market sizing · {g.difficulty}</p>
                      <Link href={`/us/market-sizing-questions#${g.slug}`} className="mt-1.5 text-[15px] font-semibold leading-snug text-foreground hover:text-primary">
                        {g.title}
                      </Link>
                      <Link
                        href={`/p/${g.code}`}
                        prefetch={false}
                        rel="nofollow"
                        className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[13px] font-semibold text-primary hover:underline underline-offset-4"
                      >
                        <PlayCircle aria-hidden className="h-4 w-4" /> Practice live
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[14px] text-muted-foreground">
                  Browse all{' '}
                  <Link href="/us/case-interview-examples" className="font-semibold text-primary hover:underline underline-offset-4">
                    50 case interview examples
                  </Link>{' '}
                  and{' '}
                  <Link href="/us/market-sizing-questions" className="font-semibold text-primary hover:underline underline-offset-4">
                    50 market sizing questions
                  </Link>
                  .
                </p>
              </section>
            )}

            <section id="faq" aria-labelledby="faq-h" className="mt-14 scroll-mt-24">
              <h2 id="faq-h" className="font-display text-[26px] leading-tight text-foreground sm:text-[30px]">
                Frequently asked questions
              </h2>
              <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
                {page.faqs.map((f) => (
                  <div key={f.q} className="py-5">
                    <h3 className="text-[16px] font-semibold text-foreground">{f.q}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {page.sources?.length ? (
              <section aria-labelledby="sources-h" className="mt-12">
                <h2 id="sources-h" className="text-[18px] font-semibold text-foreground">
                  Sources
                </h2>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-muted-foreground">
                  {page.sources.map((s) => (
                    <li key={s.url + s.label}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/85 underline decoration-border underline-offset-[3px] hover:text-primary">
                        {s.label}
                        <ExternalLink aria-hidden className="ml-1 inline h-3 w-3" />
                      </a>
                      <span className="block">{s.note}</span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {related.length > 0 && (
              <section aria-labelledby="related-h" className="mt-12">
                <h2 id="related-h" className="text-[18px] font-semibold text-foreground">
                  Keep learning
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={learnPath(r.slug)} className={`${US_CARD} group flex h-full flex-col p-4 transition-colors hover:border-border-strong`}>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{r.eyebrow}</span>
                        <span className="mt-1 text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">{r.title}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-primary">
                          Read the guide <ArrowRight aria-hidden className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="mt-12 border-t border-border/70 pt-6 text-[13px] leading-relaxed text-muted-foreground">
              {US_ENTITY_LINE} Companies in worked examples are fictional and their figures are illustrative.
            </p>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              <nav aria-label="On this page" className={`${US_CARD} p-5`}>
                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <BookOpen aria-hidden className="h-3.5 w-3.5" /> On this page
                </p>
                <ol className="mt-3 space-y-2 text-[13.5px] leading-snug">
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} className="text-foreground/75 hover:text-primary">
                        {t.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="rounded-[16px] bg-navy p-5 text-white">
                <p className="font-display text-[22px] leading-tight">Try it on a real case</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/70">
                  A free daily case and market sizing question, scored on six dimensions in about a minute.
                </p>
                <StartButton size="md" variant="inverse" className="mt-4 w-full" />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <FinalCta />
      <UsFooter />
    </div>
  );
}
