import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { SITE_URL } from '@/lib/seo';
import { getPublishedSeoPage, type SeoContent } from '@/lib/seo-pages';

// ISR: published pages are near-static; refresh hourly so edits/new pages appear
// without a redeploy. Drafts are never fetched (RLS + the status filter).
export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: { slug: string } },
): Promise<Metadata> {
  const page = await getPublishedSeoPage(params.slug);
  if (!page) return { title: 'Not found — MECE', robots: { index: false, follow: false } };
  const url = `${SITE_URL}/insights/${page.slug}`;
  return {
    title: `${page.title} — MECE`,
    description: page.meta_description,
    keywords: page.keywords?.length ? page.keywords : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.meta_description,
      url,
      type: 'article',
      siteName: 'MECE',
    },
    twitter: { card: 'summary_large_image', title: page.title, description: page.meta_description },
  };
}

/** Text with [1] / [1,3] source markers rendered as small links to the numbered sources below. */
function Cited({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\[\d+(?:,\s*\d+)*\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+(?:,\s*\d+)*)\]$/);
        if (!m) return <span key={i}>{part}</span>;
        const ns = m[1].split(',').map((x) => x.trim());
        return (
          <sup key={i} className="ml-0.5 text-[0.7em] font-medium">
            {ns.map((n, j) => (
              <span key={n}>
                {j > 0 && ','}
                <a href={`#source-${n}`} className="text-primary hover:underline" aria-label={`Source ${n}`}>{n}</a>
              </span>
            ))}
          </sup>
        );
      })}
    </>
  );
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '';

export default async function InsightPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedSeoPage(params.slug);
  if (!page) notFound();

  const c = page.content || {};
  const daily = c.format === 'daily-1' || c.format === 'daily-2';
  const url = `${SITE_URL}/insights/${page.slug}`;
  const published = page.published_at ?? page.created_at;
  const minutes = Math.max(2, Math.round((c.words || 0) / 200));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.meta_description,
    datePublished: published,
    dateModified: page.updated_at,
    author: { '@type': 'Organization', name: 'MECE', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'MECE', url: SITE_URL },
    mainEntityOfPage: url,
    keywords: (page.keywords || []).join(', '),
  };
  // A visible FAQ section below, so FAQPage markup matches what the reader sees.
  const faqLd = daily && c.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '') },
    })),
  } : null;
  const related = c.related || {};

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold text-navy hover:text-primary">MECE</Link>
        <Link href="/insights" className="text-muted-foreground hover:text-foreground">All insights</Link>
      </div>

      <article>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          {daily ? 'MECE Insights' : 'Case \u0026 GD breakdown'}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground sm:text-3xl">{page.title}</h1>
        {page.dek && <p className="mt-2 text-base text-muted-foreground">{page.dek}</p>}
        {daily && (
          <p className="mt-3 text-xs text-muted-foreground">
            MECE Editorial · <time dateTime={published}>{fmtDate(published)}</time>{c.words ? ` · ${minutes} min read` : ''}
          </p>
        )}

        {daily && c.key_points?.length ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key points</p>
            <ul className="mt-2 space-y-1.5">
              {c.key_points.map((k, i) => (
                <li key={i} className="flex gap-2 leading-relaxed text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span><Cited text={k} /></span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {daily && c.lede && (
          <p className="mt-6 text-[1.05rem] leading-relaxed text-foreground"><Cited text={c.lede} /></p>
        )}

        {daily && c.summary && !c.key_points?.length && (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In short</p>
            <p className="mt-1.5 leading-relaxed text-foreground"><Cited text={c.summary} /></p>
          </div>
        )}

        {c.intro && <p className="mt-6 text-body leading-relaxed text-foreground">{c.intro}</p>}

        {c.why_it_matters && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-foreground">Why it matters</h2>
            <p className="mt-1 leading-relaxed text-muted-foreground">{c.why_it_matters}</p>
          </div>
        )}

        {/* the older breakdowns put the framework first; a daily post explains the story first */}
        {!daily && <Framework c={c} />}

        {(c.sections || []).map((sec, i) => (
          <div key={i} className="mt-7">
            {sec.heading && <h2 className="text-lg font-semibold text-foreground">{sec.heading}</h2>}
            {(sec.paragraphs || []).map((p, j) => (
              <p key={j} className="mt-2 leading-relaxed text-muted-foreground"><Cited text={p} /></p>
            ))}
            {sec.bullets?.length ? (
              <ul className="mt-2 space-y-1.5">
                {sec.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed"><Cited text={b} /></span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        {daily && c.numbers?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">By the numbers</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {c.numbers.map((n, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4">
                  <dt className="text-xl font-semibold tabular-nums text-foreground">
                    {n.figure}
                    {n.sources?.length ? <Cited text={` [${n.sources.join(',')}]`} /> : null}
                  </dt>
                  <dd className="mt-0.5 text-sm text-muted-foreground">{n.what}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {daily && <Framework c={c} />}

        {daily && c.what_to_watch?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">What to watch</h2>
            <ul className="mt-2 space-y-1.5">
              {c.what_to_watch.map((w, i) => (
                <li key={i} className="flex gap-2 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  <span className="leading-relaxed"><Cited text={w} /></span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {daily && c.aspirants && (c.aspirants.gd_topic || c.aspirants.pi_questions?.length) ? (
          <section className="mt-8 rounded-xl border border-border bg-card p-5" aria-labelledby="aspirants-title">
            <h2 id="aspirants-title" className="text-lg font-semibold text-foreground">For MBA aspirants: GD, PI and WAT</h2>
            {c.aspirants.gd_topic && (
              <p className="mt-2 text-muted-foreground">
                <span className="font-medium text-foreground">GD topic: </span>{c.aspirants.gd_topic}
              </p>
            )}
            {(c.aspirants.for?.length || c.aspirants.against?.length) ? (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {([['For', c.aspirants.for], ['Against', c.aspirants.against]] as const).map(([label, pts]) => (
                  pts?.length ? (
                    <div key={label}>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                        {pts.map((x, i) => <li key={i} className="leading-relaxed">• <Cited text={x} /></li>)}
                      </ul>
                    </div>
                  ) : null
                ))}
              </div>
            ) : null}
            {c.aspirants.pi_questions?.length ? (
              <>
                <p className="mt-4 text-sm font-medium text-foreground">Questions an interviewer could ask</p>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  {c.aspirants.pi_questions.map((q, i) => <li key={i} className="leading-relaxed">{q}</li>)}
                </ol>
              </>
            ) : null}
            {c.aspirants.wat_prompt && (
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">WAT prompt: </span>{c.aspirants.wat_prompt}
              </p>
            )}
            {c.aspirants.case_question && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">As a case: </span>{c.aspirants.case_question}
              </p>
            )}
          </section>
        ) : null}

        {daily && c.interview_angle && (c.interview_angle.case || c.interview_angle.questions?.length) ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">How this can come up in your interview</h2>
            {c.interview_angle.case && (
              <p className="mt-2 leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">As a case: </span><Cited text={c.interview_angle.case} />
              </p>
            )}
            {c.interview_angle.gd && (
              <p className="mt-2 leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">In a GD: </span><Cited text={c.interview_angle.gd} />
              </p>
            )}
            {c.interview_angle.questions?.length ? (
              <>
                <p className="mt-3 text-sm font-medium text-foreground">Questions an interviewer could ask</p>
                <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {c.interview_angle.questions.map((q, i) => <li key={i} className="leading-relaxed">{q}</li>)}
                </ol>
              </>
            ) : null}
          </div>
        ) : null}

        {c.takeaways?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Key takeaways</h2>
            <ul className="mt-2 space-y-1.5">
              {c.takeaways.map((t, i) => (
                <li key={i} className="flex gap-2 text-foreground">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  <span className="leading-relaxed"><Cited text={t} /></span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Practice CTA — the whole point: convert a reader into a practising user */}
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Now practise it, the real way</h2>
          {c.practice_prompt && (
            <p className="mt-1 text-body text-muted-foreground">
              Try this: <span className="text-foreground">{c.practice_prompt}</span>
            </p>
          )}
          <p className="mt-2 text-body text-muted-foreground">
            Reading helps; a timed attempt with a live AI interviewer helps more. MECE scores your structure, maths and
            synthesis and shows exactly where you lost marks.
          </p>
          {(related.case || related.guesstimate) && (
            <ul className="mt-3 space-y-1.5 text-sm">
              {[related.case, related.guesstimate].filter(Boolean).map((r) => (
                <li key={r!.id}>
                  <Link href={`/cases/${r!.id}`} className="font-medium text-navy underline underline-offset-2 hover:text-primary">
                    {r!.type === 'guesstimate' ? 'A related guesstimate' : 'A related case'}: {r!.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={daily ? '/practice' : '/signup'} className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              {daily ? 'Try today\u2019s free case' : 'Practise free on MECE'}
            </Link>
            <Link href="/learn/mece-framework" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40">
              Learn the MECE method
            </Link>
          </div>
        </div>

        {daily && c.faq?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-foreground">Questions people ask</h2>
            <dl className="mt-3 space-y-4">
              {c.faq.map((f, i) => (
                <div key={i}>
                  <dt className="font-medium text-foreground">{f.q}</dt>
                  <dd className="mt-1 leading-relaxed text-muted-foreground"><Cited text={f.a} /></dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {daily && c.sources?.length ? (
          <div className="mt-10 border-t border-border pt-5">
            <h2 className="text-sm font-semibold text-foreground">Sources</h2>
            <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
              {c.sources.map((s) => (
                <li key={s.n} id={`source-${s.n}`} className="scroll-mt-20">
                  <span className="tabular-nums">{s.n}.</span>{' '}
                  {s.url
                    ? <a href={s.url} rel="nofollow noopener" target="_blank" className="underline hover:text-foreground">{s.label || s.url}</a>
                    : s.label}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Figures are as published by these sources on or before {fmtDate(published)}. Researched and drafted with
              AI, checked against the sources above and reviewed by the MECE team before publishing.
            </p>
          </div>
        ) : page.source_refs?.length ? (
          <p className="mt-8 text-xs text-muted-foreground">
            Source:{' '}
            {page.source_refs.map((r, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <a href={r.url} rel="nofollow noopener" target="_blank" className="underline hover:text-foreground">{r.label}</a>
              </span>
            ))}
          </p>
        ) : null}
      </article>
    </main>
  );
}

function Framework({ c }: { c: SeoContent }) {
  if (!c.framework?.steps?.length) return null;
  return (
    <div className="mt-8 rounded-xl border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">
        {c.framework.heading || 'How to structure this in an interview'}
      </h2>
      {c.framework.name && <p className="mt-0.5 text-sm text-muted-foreground">Lens: {c.framework.name}</p>}
      <ol className="mt-3 space-y-2">
        {c.framework.steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-body text-foreground">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
            <span className="leading-relaxed"><Cited text={s} /></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
