import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDeckBySlug } from '@/lib/decks';
import { SITE_URL } from '@/lib/seo';
import { Lock, ArrowRight, Sparkles, Trophy, Building2, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const deck = await getDeckBySlug(params.slug);
  if (!deck) {
    return {
      title: 'Deck Not Found | MECE Deck Vault',
      robots: { index: false, follow: false },
    };
  }

  const competitionText = deck.organizer ? `${deck.competition} (${deck.organizer})` : deck.competition;
  const yearText = deck.year ? ` · ${deck.year}` : '';
  const title = `${deck.title} — ${deck.result} | MECE Deck Vault`;
  const rawDescription = deck.summary || deck.description || `Read the verified ${deck.result.toLowerCase()} presentation for ${competitionText}${yearText} on MECE.`;
  const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}...` : rawDescription;
  const canonicalUrl = `${SITE_URL}/decks/${deck.slug}`;
  // Dedicated JPEG endpoint for universal social preview and AI scraper compatibility
  const ogImageUrl = `${SITE_URL}/api/decks/${deck.slug}/og`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'MECE',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/jpeg',
          alt: `${deck.title} - Slide 1`,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: {
      index: deck.is_indexable,
      follow: true,
    },
  };
}

export default async function PublicDeckPage({ params }: PageProps) {
  const deck = await getDeckBySlug(params.slug);
  if (!deck) {
    notFound();
  }

  const pageCount = deck.page_count || 12;
  // Effective free pages is derived directly from the SQL database function
  // See the note in app/api/decks/[slug]/page/[n]/route.ts — `|| 1` treats a
  // deliberate free_pages = 0 (fully locked) as "show one page".
  const rawFree = Number(deck.effective_free_pages);
  const effectiveFree = Number.isFinite(rawFree) ? rawFree : 1;
  const freePagesList = Array.from({ length: Math.min(pageCount, effectiveFree) }, (_, i) => i + 1);
  const lockedPagesList = Array.from({ length: Math.max(0, pageCount - effectiveFree) }, (_, i) => effectiveFree + i + 1);

  // Structured Data (Schema.org CreativeWork + Paywall declaration for Google)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': deck.title,
    'about': deck.competition,
    'datePublished': deck.year ? `${deck.year}-01-01` : deck.created_at,
    'inLanguage': 'en',
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'MECE',
      'url': SITE_URL,
    },
    'isAccessibleForFree': false,
    'hasPart': [
      {
        '@type': 'WebPageElement',
        'isAccessibleForFree': true,
        'cssSelector': '.deck-free-preview',
      },
      {
        '@type': 'WebPageElement',
        'isAccessibleForFree': false,
        'cssSelector': '.deck-locked-paywall',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* JSON-LD for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-mono font-bold text-lg tracking-wider text-foreground">MECE</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Deck Vault</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/pricing">
              <Button size="sm" className="gap-1.5 shadow-sm">
                <span>Unlock All Decks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 gap-1 font-medium">
              <Trophy className="w-3.5 h-3.5" />
              {deck.result}
            </Badge>
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {deck.source_kind === 'corporate' ? 'Corporate Case' : 'B-School Competition'}
            </Badge>
            {deck.year && (
              <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
                <Calendar className="w-3 h-3" /> {deck.year}
              </Badge>
            )}
            <Badge variant="outline" className="bg-muted text-muted-foreground">
              {pageCount} Slides
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {deck.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Competition:</span>
              <span>{deck.competition}</span>
            </div>
            {deck.organizer && (
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Organizer:</span>
                <span>{deck.organizer}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Winner Deck</span>
            </div>
          </div>
        </div>

        {/* AI Executive Summary */}
        <section className="bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <h2>Executive Summary & Strategy Breakdown</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 text-base leading-relaxed whitespace-pre-line">
            {deck.summary || deck.description || 'This presentation outlines the core problem statement, strategic analysis, financial projections, and actionable go-to-market recommendations presented by the winning team.'}
          </div>
        </section>

        {/* Free Preview Slides (deck-free-preview) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">Free Preview Slides</h2>
              <p className="text-sm text-muted-foreground">
                Showing the first {effectiveFree} of {pageCount} slides in full resolution.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
              Free Access ({effectiveFree} Pages)
            </span>
          </div>

          <div className="deck-free-preview grid grid-cols-1 gap-8">
            {freePagesList.map((n) => (
              <div key={n} className="space-y-2 bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Slide {n} of {pageCount}</span>
                  <span>{deck.title}</span>
                </div>
                <div className="relative aspect-[16/9] w-full bg-muted flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/decks/${deck.slug}/page/${n}`}
                    alt={`${deck.title} — Slide ${n}`}
                    loading={n === 1 ? 'eager' : 'lazy'}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Locked Paywall Slides (deck-locked-paywall) */}
        {lockedPagesList.length > 0 && (
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Remaining Presentation Slides</h2>
                <p className="text-sm text-muted-foreground">
                  Slides {effectiveFree + 1} to {pageCount} are available exclusively to MECE Pro members.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked Content
              </span>
            </div>

            <div className="deck-locked-paywall grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lockedPagesList.slice(0, 4).map((n) => (
                <div
                  key={n}
                  className="relative aspect-[16/9] rounded-xl border border-border/60 bg-muted/20 flex flex-col items-center justify-center p-6 text-center overflow-hidden group shadow-inner"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/90" />
                  <div className="relative z-10 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mx-auto text-muted-foreground group-hover:text-primary transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">Slide {n} of {pageCount}</p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                      Unlock recommendations, financials, and implementation plans.
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Paywall CTA Card */}
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 text-center space-y-6 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl font-bold text-foreground">
                  Unlock the full {pageCount}-slide deck and 50+ winning presentations
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get full access to verified corporate finalist presentations from HUL L.I.M.E., Tata Steel Steel-a-thon, ITC Interrobang, and premier B-school competitions.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full slide-by-slide breakdowns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive consulting casebook</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero risk access</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-2 shadow-lg">
                    <span>Unlock MECE Pro</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/explore-mece" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full">
                    Explore MECE Frameworks
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MECE. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/explore-mece" className="hover:text-foreground transition-colors">Explore</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}