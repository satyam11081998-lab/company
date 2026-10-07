import { createStaticClient } from '@/lib/supabase/static';
import { getPublishedTestimonials } from '@/lib/testimonials';
import { faqPageJsonLd, HREFLANG_HOME } from '@/lib/seo';
import { getDailyTodayServerSide } from '@/lib/daily-server';
import { orderStories } from '@/lib/home/stories';
import { homeHand, homeSerif } from '@/components/home/fonts';
import HomeHeader from '@/components/home/home-header';
import Hero from '@/components/home/hero';
import StartCards from '@/components/home/start-cards';
import MeceWay from '@/components/home/mece-way';
import HomeFaq from '@/components/home/home-faq';
import SuccessStories from '@/components/home/success-stories';
import FinalCta from '@/components/home/final-cta';
import HomeFooter from '@/components/home/home-footer';
import '@/components/home/home.css';

export const metadata = {
  // hreflang (2026-09-25): India here, the international site at /us.
  alternates: { canonical: '/', languages: { ...HREFLANG_HOME } },
};

/** Homepage FAQ — also emitted as FAQPage JSON-LD for AEO + entity disambiguation. */
const HOMEPAGE_FAQS = [
  {
    question: 'What is MECE?',
    answer:
      'MECE (mece.in) is an online MBA & PGDM placement-interview preparation platform for MBA & PGDM students. It offers a free case-interview casebook, case and guesstimate practice scored on a six-dimension consulting rubric, daily group-discussion (GD) briefs, and a national leaderboard.',
  },
  {
    question: 'Is mece.in the same as the MECE framework?',
    answer:
      'No. The MECE principle (Mutually Exclusive, Collectively Exhaustive) is a problem-solving concept popularised in management consulting by Barbara Minto at McKinsey. MECE — the platform at mece.in — is a separate product that helps MBA and PGDM students prepare for placement interviews. It is named after the principle but is a distinct service. Our full guide to the principle itself is at mece.in/learn/mece-framework.',
  },
  {
    question: 'Who is MECE for?',
    answer:
      'MBA and PGDM students preparing for summer-internship and final placements — especially consulting, finance, marketing, product, and operations roles at firms such as McKinsey, BCG, Bain, Goldman Sachs, P&G, and HUL.',
  },
  {
    question: 'Is MECE free?',
    answer:
      'The MECE Casebook — frameworks, worked cases, and guesstimates — is free to read without an account. Scored practice, GD briefs, and the leaderboard need a free account, with paid plans for unlimited practice. No credit card is required to start.',
  },
  {
    question: 'How does MECE score my answers?',
    answer:
      'Every submission is graded on a transparent 100-point rubric across six dimensions — Structure, Quantitative, Synthesis, Business Judgment, Creativity, and Professional Tone — with written feedback in about 60 seconds. The full rubric is on the methodology page.',
  },
];

const faqJsonLd = faqPageJsonLd(HOMEPAGE_FAQS);

/** Target firms, set as plain type — names only, never logos (no implied endorsement). */
const TARGET_FIRMS = ['McKinsey', 'BCG', 'Bain', 'Goldman Sachs', 'JPMorgan', 'HUL', 'P&G', 'Amazon', 'Flipkart'];

/**
 * ISR, not force-dynamic: the landing page is the highest-traffic SEO surface
 * and everything on it is public. Testimonials come from a cookie-less anon
 * client (RLS = logged-out visitor); auth-dependent CTAs resolve client-side
 * in <AuthCTA/>.
 *
 * FRESHNESS (2026-10-07): re-rendered ON DEMAND, not every 5 minutes. The two
 * things on this page that change are refreshed the moment they change:
 *   - today's daily pair → the backend calls /api/revalidate/home right after
 *     writing the daily_schedule row (and the daily cron does too);
 *   - testimonials → app/(app)/admin/testimonials/actions.ts revalidatePath('/').
 * The 1-hour revalidate below is only the fallback. At 300s this page was
 * re-rendered ~37 times per 12h at ~0.4s of Vercel Active CPU each.
 *
 * REDESIGN (2026-09-30, branch feat/india-landing-redesign): the page follows
 * the approved editorial mockup — Newsreader headlines, margin notes in a pen
 * hand, real photography (lib/home/photos.ts), the live MCQ warm-up lifted in
 * front of the hero photo, and success stories (testimonials) near the close
 * in place of the endorsement wall. Components live in components/home/.
 */
export const revalidate = 3600;

export default async function LandingPage() {
  const supabase = createStaticClient();
  // `daily` is fetched server-side and baked into the ISR snapshot, so the
  // homepage advertises the same pair the pre-login dashboard opens. It reads
  // no session — the anonymous sign-in is client-side and click-driven — so "/"
  // stays static with revalidate = 300 and every crawler gets identical HTML.
  const [testimonials, daily] = await Promise.all([
    getPublishedTestimonials(supabase),
    // 'static' is REQUIRED here, not a preference: the default client reads
    // cookies(), and a single cookies() read anywhere in this tree drops "/"
    // out of static rendering into per-request rendering.
    getDailyTodayServerSide('static'),
  ]);
  const caseId = daily.case?.id ?? null;
  const guesstimateId = daily.guesstimate?.id ?? null;

  return (
    <div
      className={`${homeSerif.variable} ${homeHand.variable} relative z-[1] min-h-screen overflow-x-clip bg-background font-sans text-foreground`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
      >
        Skip to content
      </a>

      <HomeHeader />

      <main id="main">
        <Hero caseId={caseId} guesstimateId={guesstimateId} />

        {/* ── Target firms + three ways in ─────────────────────────────── */}
        <section aria-label="Where MECE aspirants are headed" className="relative">
          <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6">
            <div className="border-b border-border/80 pb-9 pt-4 lg:pt-2">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11.5px] sm:tracking-[0.2em]">
                Used by aspirants targeting roles at
              </p>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-3 sm:gap-x-12 lg:justify-between lg:gap-x-6">
                {TARGET_FIRMS.map((f) => (
                  <li key={f} className="whitespace-nowrap font-editorial text-[19px] font-medium tracking-[-0.005em] text-navy/85 dark:text-white/75 sm:text-[21px]">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="py-10 lg:py-12">
              <StartCards caseId={caseId} guesstimateId={guesstimateId} />
            </div>
          </div>
        </section>

        <MeceWay />

        <HomeFaq faqs={HOMEPAGE_FAQS} />

        <SuccessStories stories={orderStories(testimonials)} />

        <FinalCta />
      </main>

      <HomeFooter />
    </div>
  );
}
