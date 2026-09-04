'use client';

/**
 * Real-time interview minutes — balance + top-up.
 *
 * Real-time voice is credit-metered (it costs ~10x the Groq pipeline). Pro gets a
 * monthly included allowance; this shows what's left and lets the user buy minute
 * packs through the same Razorpay flow as Deck Vault. Purchased minutes never
 * expire. Balance is read from the backend GET /realtime/credits.
 */

import { useCallback, useEffect, useState } from 'react';
import Script from 'next/script';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { REALTIME_PACKS, type RealtimePackId } from '@/lib/realtime-packs';
import { Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

declare global {
  interface Window { Razorpay: any }
}

export default function RealtimeMinutes() {
  const [balance, setBalance] = useState<number | null>(null);
  const [busy, setBusy] = useState<RealtimePackId | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch(`${API_URL}/realtime/credits`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const j = await res.json();
      setBalance(typeof j.total_remaining === 'number' ? j.total_remaining : null);
    } catch {
      /* balance is best-effort */
    }
  }, []);

  useEffect(() => { loadBalance(); }, [loadBalance]);

  async function buy(pack: RealtimePackId) {
    setErr(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErr('Please sign in first.'); return; }
    try {
      setBusy(pack);
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: 'rt_pack', pack }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not start checkout.');
      if (typeof window === 'undefined' || !window.Razorpay) throw new Error('Payment is still loading — please retry.');

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'MECE Real-time minutes',
        description: `${REALTIME_PACKS[pack].minutes} minutes of real-time interview`,
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
                product: 'rt_pack',
              }),
            });
            const vd = await verifyRes.json();
            if (verifyRes.ok) { await loadBalance(); setOpen(false); }
            else setErr(vd.error || 'Payment verification failed.');
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

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="flex flex-col items-end gap-1.5 text-micro text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          <span>{balance === null ? 'Real-time minutes' : `${balance} real-time min left`}</span>
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setOpen((o) => !o)}
          >
            Buy minutes
          </button>
        </div>
        {open && (
          <div className="flex flex-wrap justify-end gap-1.5 pt-1">
            {(Object.keys(REALTIME_PACKS) as RealtimePackId[]).map((id) => (
              <Button
                key={id}
                size="sm"
                variant="outline"
                disabled={busy !== null}
                onClick={() => buy(id)}
                className="h-8"
              >
                {busy === id ? 'Starting…' : `${REALTIME_PACKS[id].label} · ₹${REALTIME_PACKS[id].priceInr}`}
              </Button>
            ))}
          </div>
        )}
        {err && <p className="text-destructive">{err}</p>}
      </div>
    </>
  );
}
