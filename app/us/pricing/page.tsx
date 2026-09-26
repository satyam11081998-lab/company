import type { Metadata } from 'next';
import Link from 'next/link';
import UsHeader from '@/components/us/marketing/us-header';
import UsFooter from '@/components/us/marketing/us-footer';
import { FaqSection } from '@/components/us/marketing/sections';
import { Eyebrow } from '@/components/us/ui';
import IntlPricingSection from '@/components/intl/intl-pricing-section';
import { INTL_PRICING_FAQ } from '@/lib/intl-plans';
import { INTL_TIER_PRICING } from '@/lib/pricing-intl';
import { HREFLANG_PRICING, faqPageJsonLd, genericBreadcrumbJsonLd, pricingProductJsonLd, absoluteUrl } from '@/lib/seo';

/**
 * International pricing (US dollars / euros). Visitors outside India are routed
 * here from /pricing by the middleware. Static page; the numbers come from the
 * SAME table checkout charges from (lib/tier.ts INTL_TIER_PRICING).
 */
export const revalidate = 3600;

const TITLE = 'Case Interview Prep Pricing: Free, Lite $29, Pro $49 | MECE';
const DESC =
  'MECE pricing for the US and Europe: free daily case interview practice, Lite at $29/month and Pro at $49/month, or 3 months for $69 and $119. One-time payments, no auto-renewal.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: '/us/pricing', languages: { ...HREFLANG_PRICING } },
  openGraph: { type: 'website', url: '/us/pricing', title: TITLE, description: DESC, locale: 'en_US', siteName: 'MECE' },
};

export default function UsPricingPage() {
  const usd = INTL_TIER_PRICING.USD;
  const eur = INTL_TIER_PRICING.EUR;
  const products = pricingProductJsonLd([
    { name: 'Free', description: 'Daily case and market sizing question with scored feedback.', price: 0, currency: 'USD', url: absoluteUrl('/us/pricing') },
    { name: 'Lite (monthly)', description: '2 extra cases and 2 extra market sizing questions a day, unlimited re-attempts.', price: usd.lite.monthly, currency: 'USD', url: absoluteUrl('/us/pricing') },
    { name: 'Lite (3 months)', description: 'Lite for 3 months, one-time payment.', price: usd.lite.quarter, currency: 'USD', url: absoluteUrl('/us/pricing') },
    { name: 'Pro (monthly)', description: 'Unlimited US case bank, 20 clarifying questions per case, worked case figures.', price: usd.pro.monthly, currency: 'USD', url: absoluteUrl('/us/pricing') },
    { name: 'Pro (3 months)', description: 'Pro for 3 months, one-time payment.', price: usd.pro.quarter, currency: 'USD', url: absoluteUrl('/us/pricing') },
    { name: 'Lite (monthly, Europe)', description: 'Lite, billed in euros.', price: eur.lite.monthly, currency: 'EUR', url: absoluteUrl('/us/pricing') },
    { name: 'Pro (monthly, Europe)', description: 'Pro, billed in euros.', price: eur.pro.monthly, currency: 'EUR', url: absoluteUrl('/us/pricing') },
  ]);
  const faq = faqPageJsonLd(INTL_PRICING_FAQ.map((f) => ({ question: f.q, answer: f.a })));
  const crumbs = genericBreadcrumbJsonLd([{ name: 'MECE', url: '/us' }, { name: 'Pricing', url: '/us/pricing' }]);

  return (
    <div className="min-h-screen bg-background">
      {[products, faq, crumbs].map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
      <UsHeader />
      <main id="main">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-14 sm:px-6 lg:pt-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow className="justify-center">Pricing</Eyebrow>
            <h1 className="mt-4 font-display text-[38px] leading-[1.06] tracking-[-0.015em] text-foreground sm:text-[48px]">
              Case interview practice that fits your recruiting season.
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              Free forever for the daily case and market sizing question. Lite and Pro are one-time payments for one or
              three months of access. Nothing renews without you.
            </p>
          </div>
          <IntlPricingSection />
          <p className="mt-10 text-center text-[13px] text-muted-foreground">
            Questions about team or university access? Email{' '}
            <a href="mailto:team@mece.in" className="font-semibold text-primary hover:underline underline-offset-4">team@mece.in</a>.{' '}
            <Link href="/refund" className="underline underline-offset-4 hover:text-foreground">Refund policy</Link>.
          </p>
        </div>
        <FaqSection faqs={INTL_PRICING_FAQ.map((f) => ({ question: f.q, answer: f.a }))} id="pricing-faq" eyebrow="Pricing" title="Pricing questions." compact />
      </main>
      <UsFooter />
    </div>
  );
}
