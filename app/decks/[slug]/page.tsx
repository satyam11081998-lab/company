import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDeckBySlug } from '@/lib/decks';
import { SITE_URL } from '@/lib/seo';
import { Lock, ArrowRight, Sparkles, Trophy, Building2, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import DeckProtection from '@/components/decks/deck-protection';

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
      {/* Same chrome as /pricing — the other public, crawlable page. This used
          to hand-roll a text "MECE" wordmark, so a deck page looked like a
          different product to the stranger arriving from Google. That visitor
          is the entire point of these pages: their first impression of MECE is
          this header. Logo + ThemeToggle + AuthCTA are the shared components,
          so the deck page cannot drift from the rest of the brand again. */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center -ml-2 shrink-0">
            <Logo isLanding />
          </Link>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              Deck Vault
            </span>
            <ThemeToggle />
            <AuthCTA variant="nav" />
          </div>
        </div>
      </nav>

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

        {/* ONE CONTINUOUS DECK. Slides run in a single column, free then
            locked, in real slide order, the way you read a deck. The previous
            version broke after the free pages into a separate 2-up grid capped
            at 4 placeholders, so a 40-slide deck showed 3 slides, then 4 boxes,
            then stopped. It read as a different component rather than the rest
            of the same deck, and it hid how much was actually behind the wall.
            Showing every locked slide in sequence IS the upgrade argument.

            SECURITY: locked slides emit NO <img> and no URL. There is nothing
            hidden to reveal in DevTools because the bytes were never sent, and
            /api/decks/<slug>/page/<n> returns 403 past the free limit. The lock
            is server-side; this is only its visual representation. */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-bold text-foreground">The deck</h2>
              <p className="text-sm text-muted-foreground">
                {effectiveFree} of {pageCount} slides free. The rest unlock with MECE Pro.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
              Slides 1&ndash;{effectiveFree} free
            </span>
          </div>

          <DeckProtection>
          <div className="deck-free-preview flex flex-col gap-6">
            {freePagesList.map((n) => (
              <figure key={n} className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Slide {n} of {pageCount}</span>
                  <span className="truncate max-w-[60%]">{deck.title}</span>
                </div>
                <div className="relative aspect-[16/9] w-full bg-muted flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/decks/${deck.slug}/page/${n}`}
                    alt={`${deck.title} slide ${n} of ${pageCount}`}
                    loading={n === 1 ? 'eager' : 'lazy'}
                    className="w-full h-full object-contain"
                  />
                </div>
              </figure>
            ))}

            {lockedPagesList.map((n) => (
              <Link
                key={n}
                href="/upgrade?from=deck"
                aria-label={`Slide ${n} of ${pageCount}, unlock with MECE Pro`}
                className="deck-locked-paywall group block bg-card border border-border/70 rounded-xl overflow-hidden shadow-sm transition-colors hover:border-primary/50"
              >
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Slide {n} of {pageCount}</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Lock className="w-3 h-3" /> Pro
                  </span>
                </div>
                <div className="relative aspect-[16/9] w-full bg-muted/30 flex items-center justify-center">
                  {/* A DRAWN placeholder, never a CSS blur over the real slide:
                      blurring would mean the slide had already been sent. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 10px)' }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
                    <span className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors">
                      <Lock className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">Unlock with MECE Pro</span>
                    <span className="text-xs text-muted-foreground">
                      Slides {effectiveFree + 1}&ndash;{pageCount}, plus every other winning deck
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          </DeckProtection>
        </section>

        {lockedPagesList.length > 0 && (
          <section className="space-y-6 pt-4">

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