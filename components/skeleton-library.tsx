'use client';

import { useMemo, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/components/user-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Layers, Lock, ShieldCheck, Filter, CheckSquare, Square } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface SkeletonItem {
  id: string;
  title: string;
  case_type: string;
  round_type: string;
  slide_count: number;
  description: string;
  tags: string[];
}

interface SkeletonLibraryProps {
  skeletons: SkeletonItem[];
  hasAccess: boolean;
}

const ALL_TYPES = '__all__';
const PRICE_INR = 500;

export default function SkeletonLibrary({ skeletons, hasAccess }: SkeletonLibraryProps) {
  const { user } = useUser();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [busy, setBusy] = useState(false);

  const caseTypes = useMemo(
    () => Array.from(new Set(skeletons.map((s) => s.case_type))).sort((a, b) => a.localeCompare(b)),
    [skeletons]
  );

  const visible = useMemo(
    () => (typeFilter === ALL_TYPES ? skeletons : skeletons.filter((s) => s.case_type === typeFilter)),
    [skeletons, typeFilter]
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allIn = visible.every((s) => next.has(s.id));
      if (allIn) visible.forEach((s) => next.delete(s.id));
      else visible.forEach((s) => next.add(s.id));
      return next;
    });
  };

  /* ── Purchase flow (mirrors the upgrade page) ─────────────────────── */
  const handleBuy = async () => {
    if (!user) {
      toast.error('Please log in first.');
      router.push('/login');
      return;
    }
    try {
      setBusy(true);
      const res = await fetch('/api/skeletons/order', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'MECE Placement Prep',
        description: 'Deck Skeleton Library — lifetime access',
        order_id: data.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/skeletons/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success('Skeleton Library unlocked!');
              router.refresh();
            } else {
              toast.error(verifyData.error || 'Payment verification failed');
            }
          } catch {
            toast.error('Error verifying payment.');
          } finally {
            setBusy(false);
          }
        },
        prefill: { name: user.name || '', email: user.email || '' },
        theme: { color: '#0F172A' },
        modal: {
          ondismiss: function () {
            setBusy(false);
            toast.info('Payment cancelled.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setBusy(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
      setBusy(false);
    }
  };

  /* ── Download flow ────────────────────────────────────────────────── */
  const handleDownload = async () => {
    if (selected.size === 0) {
      toast.info('Select at least one skeleton first.');
      return;
    }
    try {
      setBusy(true);
      const res = await fetch('/api/skeletons/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Download failed');

      for (const file of data.files as { title: string; url: string }[]) {
        const a = document.createElement('a');
        a.href = file.url;
        a.download = file.title;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Stagger so the browser doesn't swallow multiple downloads.
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success(`${data.files.length} skeleton${data.files.length > 1 ? 's' : ''} downloading.`);
    } catch (err: any) {
      toast.error(err.message || 'Download failed.');
    } finally {
      setBusy(false);
    }
  };

  /* ── Paywall ──────────────────────────────────────────────────────── */
  if (!hasAccess) {
    return (
      <>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Card className="ui-card max-w-2xl mx-auto p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-h2 text-foreground">Unlock the Skeleton Library</h2>
          <p className="mt-3 text-body text-muted-foreground max-w-lg mx-auto">
            {skeletons.length > 0 ? `${skeletons.length}+` : 'A growing set of'} slide-by-slide deck skeletons —
            the structures behind winning competition decks, rebuilt as clean MECE templates you can fill with
            your own analysis. One payment, lifetime access, every future skeleton included.
          </p>
          <ul className="mt-6 text-left max-w-md mx-auto space-y-2 text-body text-muted-foreground">
            <li className="flex gap-2"><Layers className="h-4 w-4 mt-1 text-primary shrink-0" /> Screening (3–5 slide) and finale (8–12 slide) formats, by case type</li>
            <li className="flex gap-2"><Download className="h-4 w-4 mt-1 text-primary shrink-0" /> Select any number, download instantly</li>
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" /> Original MECE templates — yours to use in any competition</li>
          </ul>
          <Button className="mt-8 h-11 px-8 text-base font-semibold" onClick={handleBuy} disabled={busy}>
            {busy ? 'Opening checkout…' : `Unlock for ₹${PRICE_INR}`}
          </Button>
          <p className="mt-3 text-small text-muted-foreground">
            New to competitions? Start with the free{' '}
            <Link href="/learn/casebook/case-competitions/why-they-matter" className="text-primary hover:underline">
              Case Competitions track
            </Link>.
          </p>
        </Card>
      </>
    );
  }

  /* ── Library ──────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            {/* @ts-ignore */}
            <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Filter by case type">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All case types" />
              </div>
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {/* @ts-ignore */}
              <SelectItem value={ALL_TYPES}>All case types</SelectItem>
              {caseTypes.map((t) => (
                // @ts-ignore
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10 gap-2" onClick={selectAllVisible}>
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Select all shown</span>
          </Button>
        </div>
        <Button className="h-10 gap-2" onClick={handleDownload} disabled={busy || selected.size === 0}>
          <Download className="h-4 w-4" />
          Download{selected.size > 0 ? ` (${selected.size})` : ''}
        </Button>
      </div>

      {skeletons.length === 0 ? (
        <Card className="ui-card p-10 text-center">
          <p className="text-body text-muted-foreground">
            The first batch of skeletons is being prepared — you have lifetime access, so everything that lands here is yours.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((s) => {
            const isSelected = selected.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                className="text-left"
                aria-pressed={isSelected}
              >
                <Card className={`ui-card flex flex-col p-5 h-full transition-colors ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="tag-navy px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                      {s.case_type}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {s.round_type} · {s.slide_count} slides
                      </span>
                      {isSelected
                        ? <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>
                  </div>
                  <h3 className="text-strong font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-body text-muted-foreground line-clamp-2">{s.description}</p>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
