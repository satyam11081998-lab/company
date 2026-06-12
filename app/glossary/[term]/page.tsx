import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import Footer from '@/components/footer';
import {
  getAllSlugs,
  getTermBySlug,
  getRelatedTerms,
  CATEGORY_LABELS,
} from '@/lib/glossary';
import { glossaryTermJsonLd, genericBreadcrumbJsonLd } from '@/lib/seo';
import { ArrowRight, BookOpen, ArrowLeft, Lightbulb } from 'lucide-react';

/* ── Static params ─────────────────────────────────────────────────── */

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ term: slug }));
}

/* ── Metadata ──────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return {};

  return {
    title: `What is ${term.term}? — MBA Glossary`,
    description: term.definition,
    alternates: { canonical: `/glossary/${slug}` },
    openGraph: {
      title: `What is ${term.term}?`,
      description: term.definition,
      url: `/glossary/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `What is ${term.term}?`,
      description: term.definition,
    },
  };
}

/* ── Page ───────────────────────────────────────────────────────────── */

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) notFound();

  const related = getRelatedTerms(slug);

  const termJsonLd = glossaryTermJsonLd({
    term: term.term,
    definition: term.definition,
    url: `/glossary/${slug}`,
    category: term.category,
  });

  const breadcrumbJsonLd = genericBreadcrumbJsonLd([
    { name: 'Home', url: '/' },
    { name: 'MBA Glossary', url: '/glossary' },
    { name: term.term },
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center -ml-2 shrink-0">
            <Logo isLanding />
          </Link>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            <AuthCTA variant="nav" />
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <article className="container max-w-3xl mx-auto px-4 pt-10 pb-16">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href="/glossary"
                  className="hover:text-foreground transition-colors"
                >
                  Glossary
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium truncate max-w-[200px]">
                {term.term}
              </li>
            </ol>
          </nav>

          {/* Category badge */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-4">
            <BookOpen className="h-3 w-3" />
            {CATEGORY_LABELS[term.category]}
          </span>

          {/* H1 */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
            What is {term.term}?
          </h1>

          {/* Definition block (answer-first, AEO-optimized) */}
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
            <p className="text-[15px] text-foreground leading-relaxed font-medium">
              {term.definition}
            </p>
          </div>

          {/* Full explanation */}
          <div className="mt-8 prose prose-sm max-w-none text-foreground/80">
            {term.explanation.split('\n\n').map((para, i) => (
              <p key={i} className="leading-relaxed mb-4 text-[15px]">
                {para}
              </p>
            ))}
          </div>

          {/* Example */}
          {term.example && (
            <div className="mt-8 rounded-xl border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Real-world example
                </p>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {term.example}
              </p>
            </div>
          )}

          {/* Related terms */}
          {related.length > 0 && (
            <section className="mt-10 pt-8 border-t border-border">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Related terms
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/glossary/${r.slug}`}
                    className="group ui-card p-4 flex items-start gap-3 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.term}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {r.definition.slice(0, 100)}…
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related casebook pages */}
          {term.relatedCasebookPages && term.relatedCasebookPages.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-foreground mb-3">
                Practice with MECE
              </h2>
              <div className="flex flex-wrap gap-2">
                {term.relatedCasebookPages.map((slug) => (
                  <Link
                    key={slug}
                    href={`/learn/casebook/${slug}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    {slug.split('/').pop()?.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-10 rounded-xl bg-muted/50 border border-border p-6 text-center">
            <p className="text-sm font-semibold text-foreground">
              Ready to put {term.term} into practice?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              MECE has worked cases, frameworks, and AI-graded practice — all free.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <Link href="/signup">
                <button className="btn-primary text-sm">
                  Start practicing <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Back to glossary */}
          <div className="mt-8">
            <Link
              href="/glossary"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to glossary
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
