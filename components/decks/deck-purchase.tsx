'use client';

import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useDeckAccess } from '@/lib/use-deck-access';
import { DECK_SINGLE_PRICE_INR, DECK_VAULT_PRICE_INR } from '@/lib/deck-access';
import { Lock, ArrowRight } from 'lucide-react';

declare global {
  interface Window { Razorpay: any }
}

export default function DeckPurchase({ skeletonId, slug, layout = 'row' }: { skeletonId: string; slug: string; layout?: 'row' | 'stacked' }) {
  const router = useRouter();
  const { loading, hasAccess } = useDeckAccess(skeletonId);
  const [busy, setBusy] = useState<null | 'deck' | 'vault'>(null);
  const [err, setErr] = useState<string | null>(null);

  if (loading || hasAccess) return null;

  async function buy(product: 'deck' | 'vault') {
    setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/decks/' + slug)}`);
      return;
    }
    try {
      setBusy(product);
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product === 'deck' ? { product: 'deck', skeletonId } : { product: 'vault' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      if (typeof window === 'undefined' || !window.Razorpay) throw new Error('Payment is still loading — please retry.');

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'MECE Deck Vault',
        description: product === 'deck' ? 'Unlock this deck' : 'Unlock the whole Vault',
        order_id: data.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                product,
              }),
            });
            const vd = await verifyRes.json();
            if (verifyRes.ok) {
              // Deck access is gated by the CLIENT hook useDeckAccess, which only
              // fetches on mount, so router.refresh() (server components only) leaves
              // the deck locked. A full reload re-runs the hook so the just-bought deck
              // shows immediately instead of waiting for a manual refresh.
              window.location.reload();
              return;
            } else {
              setErr(vd.error || 'Payment verification failed.');
            }
          } catch {
            setErr('Error verifying payment.');
          } finally {
            setBusy(null);
          }
        },
        prefill: { name: (user.user_metadata as any)?.full_name || '', email: user.email || '' },
        theme: { color: '#0F1C33' },
        modal: { ondismiss: function () { setBusy(null); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (r: any) { setErr(r?.error?.description || 'Payment failed.'); setBusy(null); });
      rzp.open();
    } catch (e: any) {
      setErr(e?.message || 'Something went wrong.');
      setBusy(null);
    }
  }

  const stacked = layout === 'stacked';
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className={stacked ? 'flex w-full flex-col gap-2' : 'flex flex-col sm:flex-row items-center justify-center gap-3'}>
        <Button size={stacked ? 'sm' : 'lg'} variant="outline" className={`gap-2 ${stacked ? 'w-full' : 'w-full sm:w-auto'}`} disabled={busy !== null} onClick={() => buy('deck')}>
          <Lock className="w-4 h-4" />
          {busy === 'deck' ? 'Starting…' : `Unlock this deck — ₹${DECK_SINGLE_PRICE_INR}`}
        </Button>
        <Button size={stacked ? 'sm' : 'lg'} variant="outline" className={`gap-2 ${stacked ? 'w-full' : 'w-full sm:w-auto'}`} disabled={busy !== null} onClick={() => buy('vault')}>
          {busy === 'vault' ? 'Starting…' : `Unlock the whole Vault — ₹${DECK_VAULT_PRICE_INR}`}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
      {err && <p className="text-xs text-destructive text-center pt-1">{err}</p>}
    </>
  );
}
