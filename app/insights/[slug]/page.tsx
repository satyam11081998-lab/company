import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_URL } from '@/lib/seo';
import { getPublishedSeoPage } from '@/lib/seo-pages';

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

export default async function InsightPage({ params }: { params: { slug: string } }) {
  const page = await getPublishedSeoPage(params.slug);
  if (!page) notFound();

  const c = page.content || {};
  const url = `${SITE_URL}/insights/${page.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.meta_description,
    datePublished: page.published_at ?? page.created_at,
    dateModified: page.updated_at,
    author: { '@type': 'Organization', name: 'MECE', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'MECE', url: SITE_URL },
    mainEntityOfPage: url,
    keywords: (page.keywords || []).join(', '),
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-6 flex items-center justify-between text-sm">
        <Link href="/" className="font-semibold text-navy hover:text-primary">MECE</Link>
        <Link href="/insights" className="text-muted-foreground hover:text-foreground">All insights</Link>
      </div>

      <article>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Case &amp; GD breakdown</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-foreground sm:text-3xl">{page.title}</h1>
        {page.dek && <p className="mt-2 text-base text-muted-foreground">{page.dek}</p>}

        {c.intro && <p className="mt-6 text-body leading-relaxed text-foreground">{c.intro}</p>}

        {c.why_it_matters && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-foreground">Why it matters</h2>
            <p className="mt-1 leading-relaxed text-muted-foreground">{c.why_it_matters}</p>
          </div>
        )}

        {c.framework?.steps?.length ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground">
              {c.framework.heading || 'How to structure this in an interview'}
            </h2>
            <ol className="mt-3 space-y-2">
              {c.framework.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-body text-foreground">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {(c.sections || []).map((sec, i) => (
          <div key={i} className="mt-6">
            {sec.heading && <h2 className="text-lg font-semibold text-foreground">{sec.heading}</h2>}
            {(sec.paragraphs || []).map((p, j) => (
              <p key={j} className="mt-1.5 leading-relaxed text-muted-foreground">{p}</p>
            ))}
            {sec.bullets?.length ? (
              <ul className="mt-2 space-y-1.5">
                {sec.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        {c.takeaways?.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground">Key takeaways</h2>
            <ul className="mt-2 space-y-1.5">
              {c.takeaways.map((t, i) => (
                <li key={i} className="flex gap-2 text-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Practice CTA — the whole point: convert a reader into a practising user */}
        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h2 className="text-lg font-semibold text-foreground">Now practise it — the real way</h2>
          {c.practice_prompt && (
            <p className="mt-1 text-body text-muted-foreground">
              Try this: <span className="text-foreground">{c.practice_prompt}</span>
            </p>
          )}
          <p className="mt-2 text-body text-muted-foreground">
            Reading beats nothing; a graded, timed attempt with a live AI interviewer beats reading. MECE scores
            your structure, quant and synthesis and shows exactly where you lost points.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              Practise free on MECE
            </Link>
            <Link href="/learn/mece-framework" className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/40">
              Learn the MECE method
            </Link>
          </div>
        </div>

        {page.source_refs?.length ? (
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
