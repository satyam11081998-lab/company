import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import AuthCTA from '@/components/auth-cta';
import Footer from '@/components/footer';
import { parseInlineMd } from '@/components/casebook/blocks/prose';
import { OnThisPageList } from '@/components/on-this-page-list';
import {
  ArrowRight,
  BookOpen,
  Check,
  X,
  Quote,
  ExternalLink,
  PlayCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  absoluteUrl,
  genericBreadcrumbJsonLd,
  faqPageJsonLd,
  ORG_ID,
  WEBSITE_ID,
  EEAT_AUTHOR,
  SITE_URL,
} from '@/lib/seo';
import {
  MECE_PAGE_PATH,
  MECE_PAGE_PUBLISHED,
  MECE_PAGE_MODIFIED,
  MECE_DEFINITION,
  MECE_KEY_TAKEAWAYS,
  MECE_RAIL_SUMMARY,
  MECE_HALVES,
  MECE_SEGMENTATION_TESTS,
  MECE_SPLIT_METHODS,
  MECE_OTHER_BUCKET_NOTE,
  MECE_READY_STRUCTURES,
  MECE_GRIPS_TEST,
  MECE_MISTAKES,
  MECE_RELATED_CONCEPTS,
  MECE_CRITICISMS,
  MECE_DRILLS,
  MECE_FAQS,
  MECE_SOURCES,
  MECE_INTERNAL_LINKS,
  MECE_HOWTO_STEPS,
  meceWordCount,
} from '@/lib/mece-framework';

/* ── Metadata ──────────────────────────────────────────────────────── */

const TITLE = 'MECE Framework: Meaning, Examples and How to Use It';
const DESCRIPTION =
  'MECE means Mutually Exclusive, Collectively Exhaustive. The complete guide: what it means, who invented it, 12 worked examples, 6 ways to build a MECE split, the GRIPS test, common mistakes and honest criticisms.';

export const metadata: Metadata = {
  // `absolute` suppresses the root "%s · MECE" template. The template would
  // render "MECE Framework: ... · MECE" — the brand twice in one SERP title,
  // spending pixels on a word that is already the first word of the title.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    'MECE',
    'MECE framework',
    'MECE principle',
    'mutually exclusive collectively exhaustive',
    'MECE meaning',
    'MECE examples',
    'MECE McKinsey',
    'Barbara Minto',
    'issue tree',
    'case interview structure',
    'MECE pronunciation',
    'how to be MECE',
  ],
  alternates: { canonical: MECE_PAGE_PATH },
  openGraph: {
    type: 'article',
    url: absoluteUrl(MECE_PAGE_PATH),
    siteName: 'MECE',
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_IN',
    publishedTime: MECE_PAGE_PUBLISHED,
    modifiedTime: MECE_PAGE_MODIFIED,
    images: [
      {
        url: `/og?title=${encodeURIComponent('The MECE Framework')}&subtitle=${encodeURIComponent(
          'Mutually Exclusive, Collectively Exhaustive'
        )}&kind=framework`,
        width: 1200,
        height: 630,
        alt: 'The MECE framework explained',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* ── JSON-LD ───────────────────────────────────────────────────────── */

const PAGE_URL = absoluteUrl(MECE_PAGE_PATH);

/**
 * The visible date, derived from the same constant as the machine-readable one.
 * Two hand-maintained copies of a date drift, and the pair that drifts here is
 * the one a reader sees against the one a crawler reads.
 */
const MODIFIED_HUMAN = new Date(`${MECE_PAGE_MODIFIED}T00:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * The editorial team as its own node, hung off the publisher.
 *
 * The repo's existing `eeatPersonJsonLd()` helper emits an Organization named
 * "MECE Editorial Team" carrying `url: SITE_URL` — the same url as the
 * publisher Organization. Two differently-named Organization nodes claiming one
 * url is an entity collision, and a consumer reconciling the graph has to guess
 * which one owns the domain. Giving the team a distinct @id and an explicit
 * parentOrganization says what is actually true: it is a masthead inside MECE,
 * not a second organisation at the same address.
 */
const EDITORIAL_TEAM = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#editorial-team`,
  name: EEAT_AUTHOR,
  parentOrganization: { '@id': ORG_ID },
};

/**
 * Article + LearningResource, with a DefinedTerm as `mainEntity`. The
 * DefinedTerm is what lets a knowledge-graph consumer treat this URL as the
 * definitional resource for the concept rather than as one more blog post.
 */
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Article', 'LearningResource'],
  '@id': `${PAGE_URL}#article`,
  mainEntityOfPage: PAGE_URL,
  url: PAGE_URL,
  headline: 'MECE Framework: Meaning, Examples and How to Use It',
  alternativeHeadline: 'Mutually Exclusive, Collectively Exhaustive, explained',
  description: DESCRIPTION,
  abstract: MECE_DEFINITION,
  inLanguage: 'en',
  isAccessibleForFree: true,
  datePublished: MECE_PAGE_PUBLISHED,
  dateModified: MECE_PAGE_MODIFIED,
  learningResourceType: 'Framework guide',
  educationalLevel: 'Postgraduate (MBA/PGDM) and professional',
  teaches: [
    'Mutual exclusivity in problem structuring',
    'Collective exhaustiveness in problem structuring',
    'Building MECE issue trees',
    'Testing a structure for gaps and overlaps',
  ],
  keywords:
    'MECE, MECE framework, MECE principle, mutually exclusive collectively exhaustive, Barbara Minto, issue tree, case interview',
  // Derived, never hand-maintained. A stale hardcoded wordCount is a small lie
  // in structured data, and structured data that contains lies is how you lose
  // rich-result eligibility for everything else on the page.
  wordCount: meceWordCount(),
  audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
  author: EDITORIAL_TEAM,
  reviewedBy: { '@id': `${SITE_URL}/#editorial-team` },
  publisher: { '@id': ORG_ID },
  isPartOf: { '@id': WEBSITE_ID },
  citation: MECE_SOURCES.map((s) => ({
    '@type': 'CreativeWork',
    name: s.label,
    url: s.href,
  })),
  mainEntity: {
    '@type': 'DefinedTerm',
    '@id': `${PAGE_URL}#definedterm`,
    name: 'MECE',
    alternateName: 'Mutually Exclusive, Collectively Exhaustive',
    description: MECE_DEFINITION,
    url: PAGE_URL,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'MECE MBA Glossary',
      url: absoluteUrl('/glossary'),
    },
    sameAs: 'https://en.wikipedia.org/wiki/MECE_principle',
  },
};

const breadcrumbJsonLd = genericBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'MECE framework' },
]);

const faqJsonLd = faqPageJsonLd(MECE_FAQS);

/**
 * Built inline rather than via `howToJsonLd()`. That helper is shaped for the
 * product funnel: it hardcodes `estimatedCost` in INR, `supply: A web browser`
 * and `tool: MECE`. Those are meaningless for a thinking check and would put
 * obviously wrong facts into structured data, which is exactly the sort of
 * thing that gets a rich result suppressed.
 */
const gripsHowToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  '@id': `${PAGE_URL}#grips`,
  name: 'How to test whether a structure is MECE: the GRIPS test',
  description:
    'A five-check, roughly 30-second test for gaps, redundancy, misplaced instances, level errors and irrelevance, run silently before you present any structure.',
  inLanguage: 'en',
  totalTime: 'PT30S',
  publisher: { '@id': ORG_ID },
  isPartOf: { '@id': WEBSITE_ID },
  step: MECE_HOWTO_STEPS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: s.name,
    text: s.text,
    url: `${PAGE_URL}#grips-test`,
  })),
};

/* ── Table of contents ─────────────────────────────────────────────── */

const TOC: { id: string; label: string }[] = [
  { id: 'what-is-mece', label: 'What is MECE?' },
  { id: 'the-two-halves', label: 'The two halves, explained' },
  { id: 'pronunciation', label: 'How to pronounce MECE' },
  { id: 'who-invented-mece', label: 'Who invented MECE' },
  { id: 'framework-or-principle', label: 'Framework or principle?' },
  { id: 'why-it-matters', label: 'Why MECE matters' },
  { id: 'examples', label: 'MECE vs non-MECE: 12 examples' },
  { id: 'how-to-build', label: 'The 6 ways to build a MECE split' },
  { id: 'ready-structures', label: '15 ready-to-use structures' },
  { id: 'worked-example', label: 'A worked case, end to end' },
  { id: 'grips-test', label: 'The GRIPS test' },
  { id: 'mistakes', label: '7 common mistakes' },
  { id: 'how-mece-is-enough', label: 'How MECE is MECE enough?' },
  { id: 'related-concepts', label: 'MECE vs issue tree vs Pyramid Principle' },
  { id: 'criticisms', label: 'Criticisms and limits' },
  { id: 'beyond-consulting', label: 'MECE outside consulting' },
  { id: 'india-placements', label: 'MECE in Indian MBA placements' },
  { id: 'drills', label: 'Practice drills' },
  { id: 'faq', label: 'Frequently asked questions' },
  { id: 'sources', label: 'Sources' },
];

/**
 * Hoisted to module scope so the array identity is stable. <OnThisPageList>
 * keys its IntersectionObserver effect on this prop; mapping inline in the
 * component body would hand it a fresh array every render and tear the observer
 * down and rebuild it for nothing.
 */
const TOC_ITEMS = TOC.map((t) => ({ id: t.id, text: t.label, level: 2 }));

/* ── Small presentational helpers ──────────────────────────────────── */

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 mt-14 text-2xl sm:text-[28px] font-bold tracking-tight text-foreground"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-body leading-relaxed text-foreground/85">{children}</p>;
}

function Lead({ md }: { md: string }) {
  return (
    <p className="mt-4 text-[17px] leading-relaxed text-foreground font-medium">
      {parseInlineMd(md)}
    </p>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function MeceFrameworkPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gripsHowToJsonLd) }}
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
        {/*
          Two-column reader, matching the casebook: content column plus a
          sticky right rail. The casebook's third (left nav) column is
          deliberately absent — this page is a public entry point that people
          land on cold from search, and a course tree on first contact reads as
          "you are lost in somebody's LMS". The rail carries the route into the
          casebook instead.
        */}
        <div className="container max-w-[1180px] mx-auto px-4 pt-8 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_250px] lg:gap-14 lg:items-start">
          <article className="w-full max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-foreground font-medium">MECE framework</li>
            </ol>
          </nav>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-4">
            <BookOpen className="h-3 w-3" aria-hidden="true" />
            Core framework
          </span>

          <h1 className="text-3xl sm:text-[40px] font-bold tracking-tight text-foreground leading-[1.15]">
            The MECE framework
          </h1>
          <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
            Mutually Exclusive, Collectively Exhaustive. The one rule underneath every clean
            structure you will ever draw: no double-counting, and nothing missed.
          </p>

          {/* Byline / freshness — E-E-A-T surface */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground border-y border-border py-3">
            <span>
              By the <span className="text-foreground font-medium">{EEAT_AUTHOR}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Updated <time dateTime={MECE_PAGE_MODIFIED}>{MODIFIED_HUMAN}</time>
            </span>
            <span aria-hidden="true">·</span>
            <span>18 min read</span>
            <span aria-hidden="true">·</span>
            <span>
              {MECE_SOURCES.length} cited source{MECE_SOURCES.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* ── Answer-first definition ─────────────────────────────── */}
          <div className="mt-8 rounded-xl border-2 border-primary/25 bg-primary/[0.04] p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Definition
            </p>
            <p className="mt-2 text-[17px] leading-relaxed text-foreground">
              {MECE_DEFINITION}
            </p>
          </div>

          {/* ── Freshness / editorial note ──────────────────────────── */}
          <details className="mt-4 rounded-lg border border-border bg-muted/25">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors rounded-lg">
              How this page is maintained, and what changed in the August 2026 update
            </summary>
            <div className="px-4 pb-4 space-y-3 text-sm leading-relaxed text-foreground/80">
              <p>
                This update added the documented criticisms of MECE, the link back to
                Ranganathan&apos;s 1937 canons, a sixth construction method, six more rows to the
                worked example table, and a full source list. Every historical claim was re-checked
                against a primary source before publication.
              </p>
              <p>
                Where a statement is our own judgement rather than a sourced fact, it is written as
                judgement. We do not cite statistics we cannot trace, and we do not attribute
                credentials to the page that the organisation does not hold. If you find an error,
                write to{' '}
                <a
                  href="mailto:team@mece.in"
                  className="text-primary hover:underline underline-offset-4"
                >
                  team@mece.in
                </a>{' '}
                and we will correct it and note the correction here.
              </p>
            </div>
          </details>

          {/* ── Key takeaways ───────────────────────────────────────── */}
          <section className="mt-8 rounded-xl border border-border bg-muted/40 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Key takeaways
            </h2>
            <ul className="mt-4 space-y-3">
              {MECE_KEY_TAKEAWAYS.map((item, i) => (
                <li key={i} className="flex gap-3 text-body leading-relaxed text-foreground/85">
                  <Check
                    className="h-4 w-4 mt-1 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{parseInlineMd(item)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── TOC — mobile/tablet only; lg+ gets the sticky rail ───── */}
          <nav aria-label="On this page" className="lg:hidden mt-8 rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </h2>
            <ol className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
              {TOC.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="text-sm text-foreground/75 hover:text-primary transition-colors"
                  >
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ── What is MECE ────────────────────────────────────────── */}
          <SectionHeading id="what-is-mece">What is the MECE framework?</SectionHeading>
          <P>
            MECE is a grouping rule. You take a problem, cut it into categories, and the cut is MECE
            if two conditions hold at once: no item can sit in more than one category, and the
            categories together account for everything. Consultants describe this as{' '}
            <strong className="font-semibold text-foreground">no overlaps and no gaps</strong>.
          </P>
          <P>
            The payoff is not tidiness. It is that a MECE structure lets you{' '}
            <em className="italic">eliminate</em> with confidence. If profit is down and your
            structure says profit is revenue minus cost, then learning that revenue is flat means
            the answer is definitely inside cost. You have halved the problem in one move, and you
            know you have not thrown away the answer, because the structure could not have been
            hiding it anywhere else. Without MECE, eliminating a branch proves nothing: the cause
            might have been living in the gap you never noticed.
          </P>
          <P>
            This is why the principle outlives any particular framework. Profitability, the 4Cs,
            Porter&apos;s Five Forces and the value chain are all structures people memorise. MECE is
            the test each of them has to pass, and the thing you fall back on when no memorised
            structure fits the problem in front of you.
          </P>

          {/* SVG: MECE vs the two failure modes */}
          <figure className="mt-8">
            <svg
              viewBox="0 0 760 250"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Three panels. A clean MECE split where three equal buckets tile the whole. A not-mutually-exclusive split where two buckets overlap and the shared region is counted twice. A not-collectively-exhaustive split where one bucket is missing, leaving a gap."
              className="w-full h-auto rounded-xl border border-border bg-card"
            >
              {/* Panel 1 — MECE */}
              <text x="24" y="34" fill="hsl(var(--success))" fontSize="12" fontWeight="700" letterSpacing="0.06em">
                MECE
              </text>
              <text x="24" y="52" fill="hsl(var(--muted-foreground))" fontSize="11">
                no overlaps, no gaps
              </text>
              <rect x="24" y="70" width="200" height="52" rx="8" fill="hsl(var(--muted))" />
              <rect x="26" y="72" width="64" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="58" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">A</text>
              <rect x="92" y="72" width="64" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="124" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">B</text>
              <rect x="158" y="72" width="64" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="190" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">C</text>
              <text x="24" y="152" fill="hsl(var(--foreground))" fontSize="12" fontWeight="600">The pieces tile the whole.</text>
              <text x="24" y="172" fill="hsl(var(--muted-foreground))" fontSize="11.5">Every item has exactly one home,</text>
              <text x="24" y="189" fill="hsl(var(--muted-foreground))" fontSize="11.5">so eliminating a branch is safe.</text>

              {/* Panel 2 — not ME */}
              <line x1="252" y1="20" x2="252" y2="215" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="276" y="34" fill="hsl(var(--primary))" fontSize="12" fontWeight="700" letterSpacing="0.06em">
                NOT EXCLUSIVE
              </text>
              <text x="276" y="52" fill="hsl(var(--muted-foreground))" fontSize="11">
                buckets overlap
              </text>
              <rect x="276" y="70" width="200" height="52" rx="8" fill="hsl(var(--muted))" />
              <rect x="278" y="72" width="118" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="312" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">A</text>
              <rect x="356" y="72" width="118" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="440" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">B</text>
              <rect x="356" y="72" width="40" height="48" fill="hsl(var(--primary))" fillOpacity="0.22" />
              <text x="376" y="138" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10.5" fontWeight="600">counted twice</text>
              <text x="276" y="164" fill="hsl(var(--foreground))" fontSize="12" fontWeight="600">&ldquo;New vs lapsed customers&rdquo;</text>
              <text x="276" y="182" fill="hsl(var(--muted-foreground))" fontSize="11.5">A reactivated user is both.</text>
              <text x="276" y="199" fill="hsl(var(--muted-foreground))" fontSize="11.5">Tighten the definitions.</text>

              {/* Panel 3 — not CE */}
              <line x1="504" y1="20" x2="504" y2="215" stroke="hsl(var(--border))" strokeWidth="1" />
              <text x="528" y="34" fill="hsl(var(--primary))" fontSize="12" fontWeight="700" letterSpacing="0.06em">
                NOT EXHAUSTIVE
              </text>
              <text x="528" y="52" fill="hsl(var(--muted-foreground))" fontSize="11">
                a bucket is missing
              </text>
              <rect x="528" y="70" width="200" height="52" rx="8" fill="hsl(var(--muted))" />
              <rect x="530" y="72" width="62" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="561" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">A</text>
              <rect x="596" y="72" width="62" height="48" rx="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="627" y="103" textAnchor="middle" fill="hsl(var(--primary))" fontSize="16" fontWeight="700">?</text>
              <rect x="662" y="72" width="64" height="48" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
              <text x="694" y="102" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="13" fontWeight="600">C</text>
              <text x="528" y="164" fill="hsl(var(--foreground))" fontSize="12" fontWeight="600">&ldquo;Fixed + labour cost&rdquo;</text>
              <text x="528" y="182" fill="hsl(var(--muted-foreground))" fontSize="11.5">Variable inputs have no home,</text>
              <text x="528" y="199" fill="hsl(var(--muted-foreground))" fontSize="11.5">so a whole driver is invisible.</text>
            </svg>
            <figcaption className="mt-2 text-xs text-muted-foreground">
              One clean split, and the only two ways a split can fail: an overlap, or a gap.
            </figcaption>
          </figure>

          {/* ── The two halves ──────────────────────────────────────── */}
          <SectionHeading id="the-two-halves">The two halves, explained</SectionHeading>
          {MECE_HALVES.map((half) => (
            <section key={half.id} className="mt-8">
              <h3
                id={half.id}
                className="scroll-mt-24 text-xl font-bold text-foreground flex items-center gap-2.5"
              >
                <span className="inline-flex h-6 min-w-6 px-1.5 items-center justify-center rounded-md bg-primary/12 text-primary text-[11px] font-bold tracking-wide">
                  {half.label}
                </span>
                {half.heading}
              </h3>
              <Lead md={half.lead} />
              {half.body.map((para, i) => (
                <P key={i}>{parseInlineMd(para)}</P>
              ))}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-success/35 bg-success/[0.06] p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-success">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    {half.goodExample.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {parseInlineMd(half.goodExample.md)}
                  </p>
                </div>
                <div className="rounded-lg border border-primary/35 bg-primary/[0.05] p-4">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    {half.badExample.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    {parseInlineMd(half.badExample.md)}
                  </p>
                </div>
              </div>
            </section>
          ))}

          {/* ── Pronunciation ───────────────────────────────────────── */}
          <SectionHeading id="pronunciation">How do you pronounce MECE?</SectionHeading>
          <Lead md="Almost everyone in consulting says **mee-see**, with two syllables. Barbara Minto, who coined the term, insists on the single syllable **meece**, rhyming with *niece*." />
          <P>
            The disagreement is genuinely unresolved and mildly famous. The McKinsey Alumni Center
            put the question to Minto directly, and her answer has been quoted ever since.
          </P>
          <figure className="mt-5 rounded-xl border-l-4 border-primary bg-muted/40 p-5">
            <Quote className="h-5 w-5 text-primary/60" aria-hidden="true" />
            <blockquote className="mt-2 text-[17px] leading-relaxed text-foreground italic">
              I invented it, so I get to say how to pronounce it.
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              Barbara Minto,{' '}
              <a
                href={MECE_SOURCES[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4"
              >
                McKinsey Alumni Center
              </a>
            </figcaption>
          </figure>
          <P>
            In practice you will hear &ldquo;mee-see&rdquo; in every firm and every interview room.
            Use whichever you like. No interviewer has ever marked a candidate down for this, and if
            one did, the problem would not be your pronunciation.
          </P>

          {/* ── Who invented ────────────────────────────────────────── */}
          <SectionHeading id="who-invented-mece">Who invented the MECE principle?</SectionHeading>
          <Lead md="Barbara Minto coined MECE at McKinsey & Company in the late 1960s, during a tenure that ran from 1963 to 1973. She was the firm’s first female MBA professional hire." />
          <P>
            Minto&apos;s route to the idea was editorial rather than analytical. Asked to fix the
            firm&apos;s writing, she found that the advice everyone was giving each other, write more
            clearly, missed the point. As she put it, the problem was the thinking, not the
            language. People were starting to write before they had worked out what they thought.
            Her fix was to organise ideas into a pyramid of non-overlapping groups, and MECE is the
            rule that makes those groups hold together. That work became{' '}
            <em className="italic">The Pyramid Principle: Logic in Writing and Thinking</em>,
            published in 1985 and revised in 1996.
          </P>
          <P>
            Minto is careful not to over-claim. She has said the underlying logic goes back to
            Aristotle, and the record supports her: in 1937, three decades before MECE was named,
            the Indian librarian and mathematician S. R. Ranganathan set out two rules in{' '}
            <em className="italic">Prolegomena to Library Classification</em> that are recognisably
            the same idea. His Canon of Exhaustiveness holds that classes in an array should be
            totally exhaustive of their common universe. His Canon of Exclusiveness holds that
            classes in an array should be mutually exclusive.
          </P>
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Worth knowing
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">
              MECE has close relatives in fields that never heard of McKinsey. Mathematicians call
              it a <em className="italic">partition of a set</em>. Logicians know it as{' '}
              <em className="italic">proof by cases</em>. Project managers build{' '}
              <em className="italic">work breakdown structures</em> on it. Programmers get it for
              free from <em className="italic">algebraic data types</em>. The consulting version is
              the same rule wearing a suit.
            </p>
          </div>

          {/* ── Framework or principle ──────────────────────────────── */}
          <SectionHeading id="framework-or-principle">
            Is MECE a framework or a principle?
          </SectionHeading>
          <Lead md="Strictly, MECE is a principle. A framework is a specific structure you apply to a problem. MECE is the standard any framework has to meet." />
          <P>
            Profitability, the 4Cs, Porter&apos;s Five Forces, the value chain and cost-benefit
            analysis are frameworks. Each is a particular set of buckets someone found useful and
            named. What they have in common is that each was built to be MECE, which is why they
            survive contact with real problems.
          </P>
          <P>
            The distinction matters practically. If you only know frameworks, you are stuck the
            moment a problem does not match one, which is most interesting problems. If you know the
            principle, you can build a structure for anything. The phrase &ldquo;MECE
            framework&rdquo; is now so common that everyone uses the two words interchangeably, and
            this page does too. Just remember which one is load-bearing.
          </P>

          {/* ── Why it matters ──────────────────────────────────────── */}
          <SectionHeading id="why-it-matters">Why does MECE matter?</SectionHeading>
          <Lead md="Three reasons, in ascending order of importance: it prevents duplicated work, it eliminates blind spots, and it makes your thinking legible to somebody else." />
          <div className="mt-6 space-y-4">
            {[
              {
                n: '01',
                title: 'No duplicated work',
                body: 'Because the buckets do not overlap, two people can work on two branches and never collide. On a five-person project that is hundreds of hours saved. In a case interview it is the difference between a crisp 25 minutes and circling the same idea three times under three different headings.',
              },
              {
                n: '02',
                title: 'No blind spots',
                body: 'Because the buckets cover everything, the root cause has to be inside the structure. That is what makes elimination valid, and elimination is how you get from a vague problem to a specific answer inside half an hour. A structure with a hole in it cannot do this, and worse, it will not tell you that it cannot.',
              },
              {
                n: '03',
                title: 'Legibility, which is what is actually being bought',
                body: 'A client hiring a consulting firm on a billion-rupee decision is buying risk reduction in the form of clarity and rigour. A MECE structure is the visible proof that the work was rigorous: it shows what will be investigated, what will not, and why that is safe. Interviewers test it for exactly the same reason. They are not checking whether you can think. They are checking whether anyone else can follow you while you do.',
              },
              {
                n: '04',
                title: 'It makes what you say memorable',
                body: 'Try holding nine unrelated items in your head: bread, popsicles, strawberry, muffin, ice cream, banana, bagel, fish sticks, grapes. Now hold three: bakery, frozen, fresh fruit. Same information, a third of the load. Grouping into MECE buckets is an act of synthesis, and synthesis is what survives the walk back to the desk. A CEO will not remember 25 recommended actions. They will remember "working capital and culture", and ask for the detail later. In an interview the listener is under the same constraint you are.',
              },
            ].map((item) => (
              <div key={item.n} className="flex gap-4 rounded-xl border border-border p-5">
                <span className="text-2xl font-bold text-primary/25 leading-none tabular-nums">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-body leading-relaxed text-foreground/85">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Examples table ──────────────────────────────────────── */}
          <SectionHeading id="examples">MECE vs non-MECE: 12 examples to test yourself</SectionHeading>
          <P>
            Cover the right-hand columns and judge each split yourself before reading the verdict.
            The first rows are unambiguous. The last few are where people actually get caught.
          </P>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                Twelve segmentations judged against mutual exclusivity and collective exhaustiveness
              </caption>
              <thead>
                <tr className="bg-muted/60">
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3">
                    Segmentation
                  </th>
                  <th scope="col" className="font-semibold text-foreground px-2 py-3 w-14">
                    ME
                  </th>
                  <th scope="col" className="font-semibold text-foreground px-2 py-3 w-14">
                    CE
                  </th>
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3">
                    Verdict
                  </th>
                </tr>
              </thead>
              <tbody>
                {MECE_SEGMENTATION_TESTS.map((row, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <th
                      scope="row"
                      className="text-left font-medium text-foreground px-4 py-3"
                    >
                      {row.segmentation}
                    </th>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={
                          row.me === 'Yes'
                            ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success'
                            : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary'
                        }
                        aria-label={row.me === 'Yes' ? 'Mutually exclusive' : 'Not mutually exclusive'}
                      >
                        {row.me === 'Yes' ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <span
                        className={
                          row.ce === 'Yes'
                            ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success'
                            : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary'
                        }
                        aria-label={
                          row.ce === 'Yes' ? 'Collectively exhaustive' : 'Not collectively exhaustive'
                        }
                      >
                        {row.ce === 'Yes' ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80 leading-relaxed">{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── How to build ────────────────────────────────────────── */}
          <SectionHeading id="how-to-build">The 6 ways to build a MECE split</SectionHeading>
          <Lead md="You almost never invent a MECE split from nothing. You reach for an axis that is MECE **by construction**, so the property is guaranteed rather than hoped for. There are six of them, and between them they cover nearly every problem you will meet." />
          <div className="mt-6 space-y-5">
            {MECE_SPLIT_METHODS.map((m) => (
              <section key={m.n} className="rounded-xl border border-border overflow-hidden">
                <div className="flex items-baseline gap-3 bg-muted/50 px-5 py-3.5 border-b border-border">
                  <span className="text-sm font-bold text-primary tabular-nums">
                    {String(m.n).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-foreground">{m.name}</h3>
                    <p className="text-sm text-muted-foreground">{m.oneLiner}</p>
                  </div>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-body leading-relaxed text-foreground/85">{m.how}</p>
                  <div className="rounded-lg bg-muted/40 border border-border/60 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Worked
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{m.worked}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground/70">Use when:</span> {m.useWhen}
                  </p>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-primary/30 bg-primary/[0.05] p-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {parseInlineMd(MECE_OTHER_BUCKET_NOTE)}
            </p>
          </div>

          {/* ── Ready structures ────────────────────────────────────── */}
          <SectionHeading id="ready-structures">15 ready-to-use MECE structures</SectionHeading>
          <P>
            Worth knowing cold, not because you should force a problem into one, but because
            recognising which of the six construction methods produced each of them is what lets you
            build the next one yourself.
          </P>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                Fifteen common MECE structures and the split method each is built from
              </caption>
              <thead>
                <tr className="bg-muted/60">
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3 w-40">
                    Problem
                  </th>
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3">
                    Structure
                  </th>
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3 w-32">
                    Built from
                  </th>
                </tr>
              </thead>
              <tbody>
                {MECE_READY_STRUCTURES.map((s, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <th scope="row" className="text-left font-medium text-foreground px-4 py-3">
                      {s.problem}
                    </th>
                    <td className="px-4 py-3 text-foreground/85 leading-relaxed">{s.structure}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {s.built}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Worked example ──────────────────────────────────────── */}
          <SectionHeading id="worked-example">
            What MECE looks like in a real case, end to end
          </SectionHeading>
          <P>
            A retail chain&apos;s profit is down 18% year on year and the interviewer asks you why.
            Watch what the structure does for you at each step.
          </P>
          <ol className="mt-6 space-y-4">
            {[
              {
                step: 'Split 1',
                title: 'Profit = Revenue − Cost',
                body: 'An equation split, so it cannot leak. The interviewer tells you revenue is flat. You can now discard the entire revenue branch, and crucially you can discard it safely, because the structure guarantees the cause is in cost.',
              },
              {
                step: 'Split 2',
                title: 'Cost = Fixed + Variable',
                body: 'Still an equation. Fixed costs are unchanged; variable costs are up 15%. Half the remaining space is gone. You are two questions in and you have already eliminated three-quarters of the possible causes.',
              },
              {
                step: 'Split 3',
                title: 'Variable cost = Volume × Cost per unit',
                body: 'Volume is flat, which you already knew from revenue being flat at a stable price. So cost per unit is the driver. In three splits you have moved from "profit is down" to "input cost per unit has risen", which is a specific, checkable claim.',
              },
              {
                step: 'Then',
                title: 'Now change axis',
                body: 'Cost per unit rose: is that one supplier or all of them, one input or all inputs, one region or all regions? This is a segment split, and it is the right move now precisely because the equation split has already told you where to point it.',
              },
            ].map((s, i) => (
              <li key={i} className="flex gap-4 rounded-xl border border-border p-5">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-primary pt-1 w-16">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-1.5 text-body leading-relaxed text-foreground/85">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <P>
            Notice what never happened. You never guessed. You never jumped from &ldquo;profit is
            down&rdquo; to &ldquo;maybe it is competition&rdquo; to &ldquo;maybe it is
            marketing&rdquo;, which is what an unstructured candidate does and why they run out of
            time with nothing to recommend. Each elimination was licensed by the structure, and the
            structure was licensed by MECE.
          </P>

          {/* ── GRIPS test ──────────────────────────────────────────── */}
          <SectionHeading id="grips-test">
            How do you test whether your structure is MECE? The GRIPS test
          </SectionHeading>
          <Lead md="Five checks, about 30 seconds, run silently before you open your mouth. **G**aps, **R**edundancy, **I**nstances, **P**arallelism, **S**o what." />
          <div className="mt-6 divide-y divide-border rounded-xl border border-border">
            {MECE_GRIPS_TEST.map((c) => (
              <div key={c.letter} className="flex gap-4 p-5">
                <span className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary font-bold">
                  {c.letter}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <p className="mt-1 text-body leading-relaxed text-foreground/85">{c.question}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground/70">Fix:</span> {c.fix}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <P>
            <strong className="font-semibold text-foreground">I is the one that earns its keep.</strong>{' '}
            Abstract checking is unreliable, because a structure always looks fine to the person who
            just built it. Placing two or three concrete instances is mechanical, takes five
            seconds, and catches more real errors than the other four checks put together.
          </P>

          {/* ── Mistakes ────────────────────────────────────────────── */}
          <SectionHeading id="mistakes">7 common MECE mistakes</SectionHeading>
          <div className="mt-6 space-y-3">
            {MECE_MISTAKES.map((m, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <h3 className="flex items-start gap-2 font-semibold text-foreground">
                  <AlertTriangle
                    className="h-4 w-4 mt-1 shrink-0 text-primary/70"
                    aria-hidden="true"
                  />
                  {m.title}
                </h3>
                <p className="mt-1.5 pl-6 text-body leading-relaxed text-foreground/85">
                  {parseInlineMd(m.md)}
                </p>
              </div>
            ))}
          </div>

          {/* ── How MECE is enough ──────────────────────────────────── */}
          <SectionHeading id="how-mece-is-enough">
            Do you always need to be 100% MECE?
          </SectionHeading>
          <Lead md="No. With two minutes to build a structure, nobody produces a perfect one, including the people interviewing you. Roughly 80% MECE and visibly relevant beats flawless and generic, every time." />
          <P>
            When the clock is against you, three rules in order. First,{' '}
            <strong className="font-semibold text-foreground">fix overlaps before gaps</strong>,
            because overlaps are easier to spot and an overlap is what makes you sound confused out
            loud. Second,{' '}
            <strong className="font-semibold text-foreground">close gaps with &ldquo;Other&rdquo;</strong>
            , which costs three seconds and buys you exhaustiveness. Third,{' '}
            <strong className="font-semibold text-foreground">choose relevance over symmetry</strong>
            . A structure where every bucket obviously matters to this specific client will beat a
            beautifully balanced one full of buckets nobody would ever investigate.
          </P>
          <P>
            There is a useful sanity check for relevance, sometimes called the toothbrush test: if
            the client sold toothbrushes instead of whatever they actually sell, how much of your
            structure would change? If the answer is &ldquo;nothing&rdquo;, your structure is
            generic, and generic is the feedback that gets people rejected far more often than
            imperfect MECE does.
          </P>

          {/* ── Related concepts ────────────────────────────────────── */}
          <SectionHeading id="related-concepts">
            MECE vs issue tree vs Pyramid Principle
          </SectionHeading>
          <P>
            These get conflated constantly. They are different things doing different jobs, and MECE
            sits underneath all of them.
          </P>
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm border-collapse">
              <caption className="sr-only">
                How MECE relates to issue trees, hypothesis trees, decision trees, the Pyramid
                Principle, 80/20 and work breakdown structures
              </caption>
              <thead>
                <tr className="bg-muted/60">
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3 w-44">
                    Concept
                  </th>
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3">
                    What it is
                  </th>
                  <th scope="col" className="text-left font-semibold text-foreground px-4 py-3">
                    Relationship to MECE
                  </th>
                </tr>
              </thead>
              <tbody>
                {MECE_RELATED_CONCEPTS.map((c, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <th scope="row" className="text-left font-medium text-foreground px-4 py-3">
                      {c.href ? (
                        <Link
                          href={c.href}
                          className="text-primary hover:underline underline-offset-4"
                        >
                          {c.concept}
                        </Link>
                      ) : (
                        c.concept
                      )}
                    </th>
                    <td className="px-4 py-3 text-foreground/80 leading-relaxed">{c.whatItIs}</td>
                    <td className="px-4 py-3 text-foreground/80 leading-relaxed">
                      {parseInlineMd(c.relationship)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Criticisms ──────────────────────────────────────────── */}
          <SectionHeading id="criticisms">Criticisms and limits of MECE</SectionHeading>
          <P>
            Most guides to MECE are written by people selling case-interview courses, so they tend
            to present it as unambiguously good. It is a useful tool with real, documented limits,
            and knowing them is what separates someone who has learned the acronym from someone who
            has understood the idea.
          </P>
          <div className="mt-6 space-y-3">
            {MECE_CRITICISMS.map((c, i) => (
              <div key={i} className="rounded-lg border border-border bg-muted/25 p-4">
                <h3 className="font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1.5 text-body leading-relaxed text-foreground/85">
                  {parseInlineMd(c.md)}
                </p>
              </div>
            ))}
          </div>
          <P>
            None of this makes MECE wrong. It makes it a tool with a scope. Use it to organise how
            you investigate a problem. Do not mistake a clean structure for a claim that the world
            is cleanly separable, and do not let a MECE structure stop you from saying &ldquo;these
            two branches interact, and here is how&rdquo;. Interviewers notice that sentence.
          </P>

          {/* ── Beyond consulting ───────────────────────────────────── */}
          <SectionHeading id="beyond-consulting">Where MECE is used outside consulting</SectionHeading>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                field: 'Product management',
                body: 'Segmenting users and prioritising features without double-counting the same need under two labels. Roadmap themes that overlap produce two teams building the same thing.',
              },
              {
                field: 'Marketing',
                body: 'Audience definitions that sum to the addressable market, so budget allocation is arithmetic rather than argument, and attribution does not count one conversion twice.',
              },
              {
                field: 'Engineering and debugging',
                body: 'Bisecting a failure by ruling out whole categories at once: is it the client or the server, the code or the config, the request or the response. Each split halves the search space, which is only valid if the split is exhaustive.',
              },
              {
                field: 'Medicine',
                body: 'A differential diagnosis is a MECE structure under a different name. Cover the space of plausible causes, then eliminate.',
              },
              {
                field: 'Writing and content',
                body: 'Outlines that neither repeat a point in two sections nor skip something the title promised. Overlapping sections are the most common reason a long article feels padded.',
              },
              {
                field: 'Project management',
                body: 'A work breakdown structure exists to make deliverables non-overlapping and complete. If it is not MECE, some work is done twice and some work is owned by nobody.',
              },
              {
                field: 'Data and analytics',
                body: 'Dimension values that overlap make every downstream sum wrong, silently. Most "the numbers do not tie out" incidents are a non-MECE dimension.',
              },
              {
                field: 'Everyday decisions',
                body: 'Eat in or eat out, then cook or order, then which cuisine. Three MECE layers turn an open-ended argument into three quick choices.',
              },
            ].map((f) => (
              <div key={f.field} className="rounded-lg border border-border p-4">
                <h3 className="font-semibold text-foreground text-sm">{f.field}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{f.body}</p>
              </div>
            ))}
          </div>

          {/* ── India placements ────────────────────────────────────── */}
          <SectionHeading id="india-placements">
            MECE in Indian MBA placements: where it is actually graded
          </SectionHeading>
          <P>
            If you are preparing for summers or finals at an IIM, ISB, XLRI, FMS, SPJIMR, MDI or any
            other campus running a case-and-GD process, MECE is not one topic among many. It is the
            single dimension that shows up in almost every evaluation sheet, under names like
            &ldquo;structure&rdquo;, &ldquo;approach&rdquo; or &ldquo;clarity of thought&rdquo;.
          </P>
          <div className="mt-6 space-y-4">
            {[
              {
                moment: 'The opening framework',
                body: 'Two minutes, a sheet of paper, and a business problem. This is the most visible MECE moment and the one candidates prepare for. Build it from one of the six construction methods rather than from memory, and say out loud why the split is exhaustive.',
              },
              {
                moment: 'Brainstorming questions',
                body: 'Where offers are actually lost. When an interviewer says "just tell me what comes to mind, no need to write", they are not switching off the structure test. They are removing your paper. Answer with two buckets before you give a single example: "I would split this into X and not-X. Under X, ..."',
              },
              {
                moment: 'Guesstimates',
                body: 'Every branch must multiply back to the whole, so a non-MECE split produces a number that is wrong by construction, not by estimation. Population x penetration x frequency x price is MECE because it is an equation.',
              },
              {
                moment: 'Group discussions',
                body: 'The highest-scoring GD contribution is usually not a new point. It is a structure: "there seem to be three separate questions here, and we have been mixing them." That is MECE used as a moderation tool, and panels reward it heavily.',
              },
              {
                moment: 'The final recommendation',
                body: 'Two or three supporting reasons that are distinct from each other and together carry your case. If two of your three reasons are the same reason in different words, the recommendation sounds thin even when the analysis was good.',
              },
            ].map((m) => (
              <div key={m.moment} className="rounded-xl border border-border p-5">
                <h3 className="font-semibold text-foreground">{m.moment}</h3>
                <p className="mt-1.5 text-body leading-relaxed text-foreground/85">{m.body}</p>
              </div>
            ))}
          </div>

          {/* ── Drills ──────────────────────────────────────────────── */}
          <SectionHeading id="drills">Practice drills</SectionHeading>
          <P>
            Structure each one before you open the answer. Thirty seconds each, out loud if you can.
          </P>
          <div className="mt-6 space-y-3">
            {MECE_DRILLS.map((d, i) => (
              <details key={i} className="group rounded-xl border border-border overflow-hidden">
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-foreground hover:bg-muted/40 transition-colors flex items-start gap-3">
                  <span className="shrink-0 text-xs font-bold text-primary pt-1 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1">{d.prompt}</span>
                  <span className="shrink-0 text-xs text-muted-foreground pt-1 group-open:hidden">
                    Show
                  </span>
                </summary>
                <div className="px-5 pb-4 pl-[3.25rem]">
                  <p className="text-body leading-relaxed text-foreground/85 border-l-2 border-primary/30 pl-4">
                    {d.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <section className="mt-14 rounded-2xl border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground">
              Reading about MECE is not the same as being graded on it
            </h2>
            <p className="mt-2 text-body leading-relaxed text-foreground/85">
              MECE is a motor skill. You get it by building structures under time pressure and
              having someone tell you where the overlap was. Practise a live case interview on MECE
              and get your structure scored against a fixed rubric, including a structure dimension
              that checks exactly this. Today&apos;s case and guesstimate are free, no account
              needed.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Practise a case free
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/learn/casebook/core-frameworks/structuring-fundamentals"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Read structuring fundamentals
              </Link>
            </div>
          </section>

          {/* ── FAQ ─────────────────────────────────────────────────── */}
          <SectionHeading id="faq">Frequently asked questions about MECE</SectionHeading>
          <div className="mt-6 divide-y divide-border rounded-xl border border-border">
            {MECE_FAQS.map((faq, i) => (
              <details key={i} className="group">
                <summary className="cursor-pointer list-none px-5 py-4 font-medium text-foreground hover:bg-muted/40 transition-colors flex items-start justify-between gap-4">
                  <h3 className="text-[15px] font-semibold">{faq.question}</h3>
                  <span
                    className="shrink-0 text-muted-foreground text-lg leading-none pt-0.5 transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-body leading-relaxed text-foreground/85">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>

          {/* ── Sources ─────────────────────────────────────────────── */}
          <SectionHeading id="sources">Sources and further reading</SectionHeading>
          <P>
            Every claim on this page about MECE&apos;s origin, pronunciation and criticism traces to
            one of these. Where a claim is our own judgement rather than a cited fact, it is written
            as judgement.
          </P>
          <ul className="mt-6 space-y-3">
            {MECE_SOURCES.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-4">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 font-medium text-primary hover:underline underline-offset-4"
                >
                  {s.kind === 'video' ? (
                    <PlayCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 mt-1 shrink-0" aria-hidden="true" />
                  )}
                  {s.label}
                </a>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </li>
            ))}
          </ul>

          {/* ── Internal links ──────────────────────────────────────── */}
          <SectionHeading id="keep-reading">Keep reading</SectionHeading>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MECE_INTERNAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group rounded-lg border border-border p-4 hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-1.5 font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                  {l.title}
                  <ArrowRight
                    className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {l.blurb}
                </span>
              </Link>
            ))}
            </div>
          </article>

          {/* ── Sticky right rail ─────────────────────────────────────
              TOC and summary scroll inside the rail; the route back into
              the Casebook is pinned, so it is reachable from any scroll
              depth rather than only from the top of the page. */}
          <div className="hidden lg:block pt-1">
            <OnThisPageList
              items={TOC_ITEMS}
              widthClassName="w-[250px]"
              pinned={
                <div className="rounded-xl border border-primary/25 bg-primary/[0.05] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Part of the MECE Casebook
                  </p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/80">
                    This framework sits in Core Frameworks, alongside 50+ worked cases and
                    guesstimates. Free, no account.
                  </p>
                  <Link
                    href="/learn/casebook/getting-started/what-it-tests"
                    className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline underline-offset-4"
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Open the Casebook
                  </Link>
                  <Link
                    href="/learn/casebook/core-frameworks/mece"
                    className="mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    In-course version of this page
                  </Link>
                </div>
              }
            >
              {/* Key summary — glanceable, sits under the TOC */}
              <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4">
                <h4 className="text-label text-muted-foreground uppercase tracking-widest">
                  Key summary
                </h4>
                <dl className="mt-3 space-y-2.5">
                  {MECE_RAIL_SUMMARY.map((s) => (
                    <div key={s.label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {s.label}
                      </dt>
                      <dd className="mt-0.5 text-[13px] leading-snug text-foreground/90">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a
                  href="#faq"
                  className="mt-3 inline-block text-[12px] font-medium text-primary hover:underline underline-offset-4"
                >
                  Jump to the 14 FAQs
                </a>
              </div>
            </OnThisPageList>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
