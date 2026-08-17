import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDeckBySlug, deckHeading } from '@/lib/decks';
import { SITE_URL } from '@/lib/seo';
import { Lock, ArrowRight, Sparkles, Trophy, Building2, Calendar, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import DeckViewer from '@/components/decks/deck-viewer';
import GuestPreviewNav from '@/components/guest/guest-preview-nav';
import DeckGuestOverlay from '@/components/decks/deck-guest-overlay';

interface PageProps {
  params: { slug: string };
}

// ISR: the page is public and identical for every visitor, so it is CDN-cached
// and regenerated at most hourly instead of rendered on every request (the old
// force-dynamic meant two uncached DB reads per hit — generateMetadata + body).
// New decks render on first hit (dynamicParams default) and cache thereafter;
// admin visibility/index toggles reflect within the revalidation window.
export const revalidate = 3600;

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
  const title = `${deckHeading(deck)} | MECE Deck Vault`;
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
    'name': deckHeading(deck),
    'alternateName': deck.title,
    'headline': deckHeading(deck),
    'about': deck.competition,
    'datePublished': deck.year ? `${deck.year}-01-01` : deck.created_at,
    'inLanguage': 'en',
    // Crawlable (non-/api) image so Google can fetch it for rich results.
    'image': `${SITE_URL}/deck-img/${deck.slug}/1.webp`,
    'keywords': [deck.competition, deck.organizer, deck.result, deck.case_type, deck.round_type, deck.year]
      .filter(Boolean)
      .join(', '),
    'publisher': {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      'name': 'MECE',
    },
    'isPartOf': {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
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

      {/* Login / sign-up overlay for LOGGED-OUT visitors. Client-only, so
          crawlers still receive the full free preview + summary with no overlay.
          Dismissible → the visitor keeps browsing as an anonymous guest. Its
          auth links carry ?next=/decks/<slug> so login returns here. */}
      <DeckGuestOverlay slug={deck.slug} competition={deck.competition} />

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
            {/* Awareness links — a stranger who landed here from Google should
                be one tap from "what is this / what does it cost". */}
            <Link href="/methodology" className="hidden md:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/pricing" className="hidden md:inline-block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <ThemeToggle />
            <AuthCTA variant="nav" />
          </div>
        </div>
        {/* Dashboard / Practice / Leaderboard / Casebook — the SAME section nav a
            guest sees while exploring. Makes the whole product reachable from a
            page a stranger landed on; each destination gates its real actions
            behind sign-in (middleware PREVIEW_ROUTES + the (app) guest chrome). */}
        <GuestPreviewNav />
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

          {/* Composed from the admin's structured fields, not the raw title —
              see deckHeading() in lib/decks.ts for why. */}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            {deckHeading(deck)}
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

        {/* TWO COLUMNS. Summary left, slide viewer right.
            The summary is the SEO asset — it is the prose that ranks for
            "<competition> deck", and it must stay in the server HTML. The
            viewer is the product demo. Previously the summary sat above an
            endless column of slide cards and was scrolled past; now they sit
            side by side and each does its job.

            On mobile this collapses to summary-then-viewer, which is also the
            right reading order for a crawler. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 items-start">

          {/* Height-matched to the viewer. The summary is the SEO asset and can
              run long; letting it set the row height left the slide viewer
              floating beside a wall of text. Capping it and scrolling INTERNALLY
              keeps the two columns level.

              Scrolled content is still fully in the DOM, so this costs nothing
              for indexing — Google reads the whole summary regardless of what is
              visible in the viewport. */}
          <section className="bg-muted/30 border border-border/80 rounded-2xl p-6 sm:p-7 shadow-sm lg:sticky lg:top-24 flex flex-col gap-4 lg:max-h-[calc(100vh-9rem)]">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm shrink-0">
              <Sparkles className="w-4 h-4" />
              <h2>Executive summary</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-foreground/90 text-[15px] leading-relaxed whitespace-pre-line flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {deck.summary || deck.description || `This ${deck.result.toLowerCase()} presentation for ${deck.competition} sets out the problem statement, the team's structure and analysis, and their final recommendations.`}
            </div>
            <div className="pt-3 border-t border-border/60 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground shrink-0">
              <span><span className="text-foreground font-medium">{pageCount}</span> slides</span>
              <span><span className="text-foreground font-medium">{effectiveFree}</span> free to read</span>
              {deck.year && <span>Presented <span className="text-foreground font-medium">{deck.year}</span></span>}
            </div>
          </section>

          <div className="space-y-3">
            <DeckViewer
              slug={deck.slug as string}
              title={deck.title}
              pageCount={pageCount}
              freePages={effectiveFree}
            />
            <p className="text-xs text-muted-foreground text-center">
              Use the arrows or your keyboard to move through the deck.
            </p>
          </div>
        </div>

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
                    Explore MECE
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