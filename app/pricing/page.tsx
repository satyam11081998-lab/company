import Link from 'next/link';
import type { Metadata } from 'next';
import { Check, Minus, ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/theme-toggle';
import Footer from '@/components/footer';
import PricingPlans from '@/components/pricing-plans';
import TeamsContactBanner from '@/components/teams-contact-banner';
import AuthCTA from '@/components/auth-cta';
import {
  pricingProductJsonLd,
  faqPageJsonLd,
  genericBreadcrumbJsonLd,
} from '@/lib/seo';

/* ── Metadata ──────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'MECE pricing plans — Free, Lite (₹199/mo), and Pro (₹499/mo). Start practicing MBA placement interviews for free, upgrade when ready.',
  alternates: { canonical: '/pricing' },
};

/* ── Static data ───────────────────────────────────────────────────── */

const FAQS = [
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes. Your subscription runs until the end of the current billing cycle. Cancel from your account settings — no calls, no forms, no questions asked.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'The Free tier is essentially a perpetual trial. You get the full Casebook library, daily cases, and leaderboard access at no cost — forever. Upgrade only when you want more practice.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept UPI, all major credit and debit cards, net banking, and popular wallets via Razorpay. All payments are processed securely in INR.',
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Absolutely. You can upgrade at any time and the new features activate instantly. To downgrade, simply let your current plan expire and switch to the lower tier.',
  },
  {
    question: 'Is there a student discount?',
    answer:
      'Our pricing is already built for MBA students on a budget. At ₹199–₹499/month, MECE is a fraction of what traditional prep coaching costs. We don\'t offer additional discounts at this time.',
  },
  {
    question: 'What happens when my subscription expires?',
    answer:
      'You automatically revert to the Free tier. All your past scores, leaderboard rank, and Casebook access remain intact — you just lose access to paid features like extra practice and guided hints.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a 7-day refund policy for first-time subscribers. If you\'re not satisfied, email team@mece.in within 7 days of purchase for a full refund. See our refund policy for details.',
  },
  {
    question: 'Is the Casebook library really free?',
    answer:
      'Yes. The entire Learn & Casebook library — concepts, frameworks, worked cases, guesstimates, and industry primers — is free for everyone. No paywall, no sign-up wall.',
  },
  {
    question: 'How does the interviewer simulator work?',
    answer:
      'Available on Pro, the interviewer simulator runs your case the way a live interviewer would — asking follow-up questions, challenging your assumptions, and guiding you in real time, like a good mock partner.',
  },
  {
    question: 'What is Deck Vault?',
    answer:
      'Deck Vault is a curated collection of consulting slide templates and strategy decks. Pro subscribers get lifetime access to download and use them for case prep and presentations.',
  },
];

const FEATURES = [
  { name: 'Daily cases & guesstimates', free: '1/day', lite: '3/day', pro: 'Unlimited' },
  { name: 'Practice bank access', free: false, lite: true, pro: true },
  { name: 'Unlimited re-attempts', free: false, lite: true, pro: true },
  { name: 'GD Briefs', free: false, lite: true, pro: true },
  { name: 'Interviewer Hints', free: false, lite: '5 per case', pro: 'Unlimited' },
  { name: 'Bookmarks', free: false, lite: false, pro: true },
  { name: 'Personal cheat-sheet', free: false, lite: false, pro: true },
  { name: 'Interviewer simulator', free: false, lite: false, pro: true },
  { name: 'Deck Vault (lifetime)', free: false, lite: false, pro: true },
];

/* ── JSON-LD ───────────────────────────────────────────────────────── */

const productJsonLd = pricingProductJsonLd([
  { name: 'Free', description: 'Full Casebook library, daily case & guesstimate, leaderboard & badges.', price: 0 },
  { name: 'Lite', description: 'Everything in Free plus 2 extra daily cases, unlimited re-attempts, GD Briefs, and 5 interviewer hints per case.', price: 199 },
  { name: 'Pro', description: 'Everything in Lite plus unlimited practice bank, live interviewer hints, bookmarks, cheat-sheet, the interviewer simulator, and Deck Vault lifetime access.', price: 499 },
]);

const faqJsonLd = faqPageJsonLd(FAQS);

const breadcrumbJsonLd = genericBreadcrumbJsonLd([
  { name: 'Home', url: '/' },
  { name: 'Pricing' },
]);

/* ── Page ───────────────────────────────────────────────────────────── */

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border w-full">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="flex items-center -ml-2 shrink-0">
            <Logo isLanding />
          </Link>
          {/* Auth-aware: logged-in users see "Open MECE" → /dashboard instead of
              the "Login / Get started" pair they'd already completed. */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <ThemeToggle />
            <AuthCTA variant="nav" />
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <section className="container max-w-5xl mx-auto px-4 pt-16 pb-4 text-center animate-fade-in">
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">
            Pricing Plans
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
            MECE Pricing — Plans for Every MBA Aspirant
          </h1>
          <p className="mt-5 text-[15px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            MECE offers three tiers — Free, Lite, and Pro — so you can start practising
            MBA placement interviews at zero cost and upgrade when you need the full practice
            bank, GD briefs, interviewer hints, and unlimited re-attempts. Pick the plan that fits
            your prep stage.
          </p>
        </section>

        {/* ── Pricing Cards ──────────────────────────────────────────── */}
        <section className="container max-w-5xl mx-auto px-4 py-10">
          <PricingPlans />
          <div className="mt-6">
            <TeamsContactBanner />
          </div>
        </section>

        {/* ── Feature Comparison Table ────────────────────────────────── */}
        <section className="container max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Full Feature Comparison
          </h2>
          <div className="ui-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Free
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Lite
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider bg-primary/[0.03]">
                      Pro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, i) => (
                    <tr
                      key={feature.name}
                      className={`border-b border-border last:border-0 ${
                        i % 2 === 0 ? '' : 'bg-muted/20'
                      }`}
                    >
                      <td className="p-4 font-medium text-foreground">{feature.name}</td>
                      <td className="p-4 text-center">
                        <CellValue value={feature.free} />
                      </td>
                      <td className="p-4 text-center">
                        <CellValue value={feature.lite} />
                      </td>
                      <td className="p-4 text-center bg-primary/[0.02]">
                        <CellValue value={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ Section ─────────────────────────────────────────────── */}
        <section className="container max-w-3xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-foreground text-center mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Everything you need to know about MECE pricing and subscriptions.
          </p>
          <Accordion type="single" collapsible className="ui-card divide-y divide-border overflow-hidden">
            {FAQS.map((faq, i) => (
              // @ts-expect-error — accordion.jsx lacks TS children types
              <AccordionItem key={i} value={`faq-${i}`} className="border-b-0 px-6">
                {/* @ts-expect-error — accordion.jsx lacks TS children types */}
                <AccordionTrigger className="text-sm font-semibold text-foreground text-left py-5">
                  {faq.question}
                </AccordionTrigger>
                {/* @ts-expect-error — accordion.jsx lacks TS children types */}
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ── Navy CTA ───────────────────────────────────────────────── */}
        <section className="bg-navy relative overflow-hidden py-16 mt-10">
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {[
              { w: 600, h: 400, rotate: 15, left: '-8%', top: '-20%', op: 0.06 },
              { w: 500, h: 320, rotate: 15, right: '-5%', bottom: '-15%', op: 0.06 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: s.w,
                  height: s.h,
                  border: `1px solid rgba(255,255,255,${s.op})`,
                  borderRadius: 24,
                  transform: `rotate(${s.rotate}deg)`,
                  left: s.left,
                  top: s.top,
                  right: (s as Record<string, unknown>).right as string | undefined,
                  bottom: (s as Record<string, unknown>).bottom as string | undefined,
                }}
              />
            ))}
          </div>
          <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Ready to ace your placements?
            </h2>
            <p className="mt-4 text-[15px] text-white/50 leading-relaxed">
              Start with the free tier today. No credit card required. Upgrade when you&apos;re ready
              for the full practice bank and every scored-prep feature.
            </p>
            <div className="mt-7 flex items-center justify-center gap-3">
              <Link href="/signup">
                <button className="btn-primary">
                  Get started free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login">
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
                  Already a member?
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Refund Policy Link ──────────────────────────────────────── */}
        <section className="container max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            See our{' '}
            <Link href="/refund" className="text-primary hover:underline font-medium">
              refund policy
            </Link>{' '}
            for details on cancellations and refunds.
          </p>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

/* ── Helper components ─────────────────────────────────────────────── */

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-4 w-4 text-success/70 mx-auto" />;
  }
  if (value === false) {
    return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}
