'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/components/user-context';
import { useTrackAction } from '@/hooks/use-track-action';
import TrackPageAction from '@/components/analytics/track-page-action';
import IntlPlanCards from '@/components/intl/intl-plan-cards';
import { BILLING_PERIOD_LABELS, type BillingPeriod } from '@/lib/billing';

/**
 * /upgrade for an international (US / Europe) account.
 *
 * Deliberately a separate component from the India page rather than a pile of
 * conditionals inside it: the India checkout (coupons, rupee copy, GD and
 * Deck Vault features) stays byte-for-byte what it was.
 *
 * The client never names a price or a currency. It sends only {tier, period};
 * /api/razorpay/order reads the account's locked market server-side and
 * creates the order in USD or EUR. Razorpay checkout then shows whatever the
 * order says (`data.currency`), and /verify checks the captured amount against
 * the same price table.
 */
export default function IntlUpgrade() {
  const { user, tier, refresh, currency } = useUser();
  const router = useRouter();
  const trackAction = useTrackAction();
  const [loading, setLoading] = useState<string | null>(null);
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const intlCurrency = currency === 'EUR' ? 'EUR' : 'USD';

  const purchasedPeriod: BillingPeriod | null = (() => {
    if (tier === 'free') return null;
    const started = user?.subscription_started_at ? new Date(user.subscription_started_at).getTime() : null;
    const expires = user?.subscription_expires_at ? new Date(user.subscription_expires_at).getTime() : null;
    if (started === null || expires === null) return null;
    return (expires - started) / 86_400_000 < 60 ? 'monthly' : 'quarter';
  })();

  const expiresOn = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleUpgrade = async (target: 'lite' | 'pro') => {
    if (user?.admin_preview) {
      // Admin "view as US" preview (lib/admin-preview.ts): the account is not
      // really international, so /order would price it in rupees. Look, don't buy.
      toast.info('Admin preview: checkout is disabled. Exit the preview to use your real account.');
      return;
    }
    if (!user) {
      toast.error('Please log in to upgrade.');
      router.push('/login');
      return;
    }
    try {
      setLoading(target);
      trackAction('initiate_checkout', 'payment', `${target} ${period}`, { tier: target, period, currency: intlCurrency });
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: target, period }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Checkout is still loading. Please try again in a moment.');
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'MECE Case Interview Prep',
        description: `${target === 'pro' ? 'Pro' : 'Lite'} • ${BILLING_PERIOD_LABELS[period]}`,
        order_id: data.id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tier: target,
                period,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success(`You're on ${target === 'pro' ? 'Pro' : 'Lite'}. Welcome aboard!`);
              trackAction('complete_payment', 'payment', target, { amount_minor: data.amount, currency: data.currency });
              await refresh();
              router.push('/dashboard');
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment.');
          } finally {
            setLoading(null);
          }
        },
        prefill: { name: user.name || '', email: user.email || '' },
        theme: { color: '#0F172A' },
        modal: {
          ondismiss: () => {
            setLoading(null);
            toast.info('Payment cancelled.');
          },
        },
      });
      rzp.on('payment.failed', (response: { error?: { description?: string } }) => {
        toast.error(`Payment failed: ${response?.error?.description || 'please try another card'}`);
        setLoading(null);
      });
      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <TrackPageAction action="view_pricing" category="pricing" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <main className="container mx-auto max-w-5xl space-y-10">
        <div className="flex animate-fade-in flex-col items-center justify-center text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">Plans</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Choose your plan.</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Start free with today&apos;s case and market sizing question. Upgrade when you want the full US case
            bank, unlimited re-attempts and worked case figures.
          </p>
        </div>

        {tier !== 'free' && (
          <div className="-mt-4 flex justify-center">
            <p className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
              You&apos;re on <b className="text-foreground">{tier === 'pro' ? 'Pro' : 'Lite'}</b>
              {purchasedPeriod && <> &middot; {BILLING_PERIOD_LABELS[purchasedPeriod]} plan</>}
              {expiresOn ? <> &middot; access until {expiresOn}</> : <> &middot; no expiry date</>}
            </p>
          </div>
        )}

        <IntlPlanCards
          currency={intlCurrency}
          period={period}
          onPeriod={setPeriod}
          mode="checkout"
          onUpgrade={handleUpgrade}
          loading={loading}
          current={tier}
          currentPeriod={purchasedPeriod}
        />
      </main>
    </div>
  );
}
