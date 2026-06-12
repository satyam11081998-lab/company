import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import Footer from '@/components/footer';
import { genericBreadcrumbJsonLd } from '@/lib/seo';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  getTermsByCategory,
} from '@/lib/glossary';
import { BookOpen, ArrowRight } from 'lucide-react';

/* ── Metadata ──────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'MBA Glossary — Key Business Terms Explained',
  description:
    '75 essential MBA and consulting terms explained with definitions, examples, and interview context. From MECE to EBITDA, master the vocabulary of business.',
  alternates: { canonical: '/glossary' },
};

/* ── JSON-LD ───────────────────────────────────────────────────────── */

const breadcrumbJsonLd = genericBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'MBA Glossary' },
]);

/* ── Category colors ───────────────────────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  consulting: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
  finance: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  marketing: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  operations: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
  product: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800',
  strategy: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800',
};

/* ── Page ───────────────────────────────────────────────────────────── */

export default function GlossaryIndexPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* JSON-LD */}
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
        {/* Header */}
        <section className="container max-w-5xl mx-auto px-4 pt-16 pb-4 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            75 Terms
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            MBA Glossary
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master the vocabulary of business, consulting, and finance. Each term includes a clear definition,
            detailed explanation, and context for how it appears in MBA placement interviews.
          </p>
        </section>

        {/* Terms by category */}
        <section className="container max-w-5xl mx-auto px-4 py-10 space-y-12">
          {CATEGORIES.map((category) => {
            const terms = getTermsByCategory(category);
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    {CATEGORY_LABELS[category]}
                  </h2>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[category]}`}>
                    {terms.length} terms
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {terms.map((term) => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      className="group ui-card p-4 flex items-start gap-3 transition-all hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {term.term}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {term.definition.slice(0, 120)}…
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <section className="bg-navy relative overflow-hidden py-14 mt-10">
          <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Ready to put these terms into practice?
            </h2>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              MECE has 100+ worked cases, guesstimates, and framework guides — all free.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/signup">
                <button className="btn-primary">
                  Start practicing free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/learn/casebook">
                <button
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 22px',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    borderRadius: 9999,
                    fontSize: 14,
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.12)',
                    cursor: 'pointer',
                  }}
                >
                  Browse Casebook
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
