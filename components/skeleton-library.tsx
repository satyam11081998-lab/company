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
import { Download, Trophy, Lock, ShieldCheck, Filter, CheckSquare, Square, Building2, GraduationCap, Layers } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface VaultDeck {
  id: string;
  title: string;
  source_kind: string;   // 'corporate' | 'bschool'
  competition: string;
  result: string;
  case_type: string;
  round_type: string;
  file_type: string;
  description: string;
  tags: string[];
}

interface DeckVaultProps {
  decks: VaultDeck[];
  hasAccess: boolean;
}

type KindTab = 'all' | 'corporate' | 'bschool';
const ALL_TYPES = '__all__';
const PRICE_INR = 500;

export default function DeckVault({ decks, hasAccess }: DeckVaultProps) {
  const { user } = useUser();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [kindTab, setKindTab] = useState<KindTab>('all');
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);
  const [busy, setBusy] = useState(false);

  const caseTypes = useMemo(
    () => Array.from(new Set(decks.map((d) => d.case_type))).sort((a, b) => a.localeCompare(b)),
    [decks]
  );

  const visible = useMemo(
    () => decks.filter((d) =>
      (kindTab === 'all' || d.source_kind === kindTab) &&
      (typeFilter === ALL_TYPES || d.case_type === typeFilter)
    ),
    [decks, kindTab, typeFilter]
  );

  const counts = useMemo(() => ({
    corporate: decks.filter((d) => d.source_kind === 'corporate').length,
    bschool: decks.filter((d) => d.source_kind === 'bschool').length,
  }), [decks]);

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
      const allIn = visible.every((d) => next.has(d.id));
      if (allIn) visible.forEach((d) => next.delete(d.id));
      else visible.forEach((d) => next.add(d.id));
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
        description: 'Deck Vault — lifetime access',
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
              toast.success('Deck Vault unlocked!');
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
      toast.info('Select at least one deck first.');
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
      toast.success(`${data.files.length} deck${data.files.length > 1 ? 's' : ''} downloading.`);
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
          <h2 className="text-h2 text-foreground">Unlock the Deck Vault</h2>
          <p className="mt-3 text-body text-muted-foreground max-w-lg mx-auto">
            {decks.length > 0 ? `${decks.length}+ ` : 'A growing collection of '}
            case-competition decks from national winners, finalists and semi-finalists —
            corporate flagships and B-school competitions — plus problem statements and templates.
            One payment, lifetime access, every future addition included.
          </p>
          <ul className="mt-6 text-left max-w-md mx-auto space-y-2 text-body text-muted-foreground">
            <li className="flex gap-2"><Building2 className="h-4 w-4 mt-1 text-primary shrink-0" /> Corporate comps: HUL L.I.M.E., Flipkart WiRED, TVS EPIC, Samsung EDGE, Tata Steel-a-thon &amp; more</li>
            <li className="flex gap-2"><GraduationCap className="h-4 w-4 mt-1 text-primary shrink-0" /> B-school comps: IIM Lucknow, Rohtak, Kashipur, Ranchi winners &amp; national finalists</li>
            <li className="flex gap-2"><Download className="h-4 w-4 mt-1 text-primary shrink-0" /> Filter, select any number, download instantly</li>
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 mt-1 text-primary shrink-0" /> For learning and reference — study the structures, build your own decks</li>
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

  /* ── Vault ────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <KindButton active={kindTab === 'all'} onClick={() => setKindTab('all')} icon={<Layers className="w-4 h-4" />}>
            All ({decks.length})
          </KindButton>
          <KindButton active={kindTab === 'corporate'} onClick={() => setKindTab('corporate')} icon={<Building2 className="w-4 h-4" />}>
            Corporate ({counts.corporate})
          </KindButton>
          <KindButton active={kindTab === 'bschool'} onClick={() => setKindTab('bschool')} icon={<GraduationCap className="w-4 h-4" />}>
            B-School ({counts.bschool})
          </KindButton>
        </div>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            {/* @ts-ignore */}
            <SelectTrigger className="h-10 w-full sm:w-44" aria-label="Filter by domain">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All domains" />
              </div>
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {/* @ts-ignore */}
              <SelectItem value={ALL_TYPES}>All domains</SelectItem>
              {caseTypes.map((t) => (
                // @ts-ignore
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-10 gap-2 shrink-0" onClick={selectAllVisible}>
            <CheckSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Select shown</span>
          </Button>
          <Button className="h-10 gap-2 shrink-0" onClick={handleDownload} disabled={busy || selected.size === 0}>
            <Download className="h-4 w-4" />
            Download{selected.size > 0 ? ` (${selected.size})` : ''}
          </Button>
        </div>
      </div>

      {decks.length === 0 ? (
        <Card className="ui-card p-10 text-center">
          <p className="text-body text-muted-foreground">
            The first decks are being uploaded — you have lifetime access, so everything that lands here is yours.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((d) => {
            const isSelected = selected.has(d.id);
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggle(d.id)}
                className="text-left"
                aria-pressed={isSelected}
              >
                <Card className={`ui-card flex flex-col p-5 h-full transition-colors ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <span className="tag-navy px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                      {d.source_kind === 'corporate' ? 'Corporate' : 'B-School'} · {d.case_type}
                    </span>
                    {isSelected
                      ? <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                      : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>
                  <h3 className="text-strong font-semibold text-foreground mb-1">{d.title}</h3>
                  <p className="text-small text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                    {d.competition}{d.result ? ` · ${d.result}` : ''}
                  </p>
                  {d.description && (
                    <p className="text-body text-muted-foreground line-clamp-2">{d.description}</p>
                  )}
                  <div className="mt-auto pt-3">
                    <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-1 rounded uppercase">
                      {d.file_type}
                    </span>
                  </div>
                </Card>
              </button>
            );
          })}
          {visible.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <p className="text-body text-muted-foreground">No decks match these filters.</p>
              <Button variant="link" onClick={() => { setKindTab('all'); setTypeFilter(ALL_TYPES); }} className="mt-2 text-primary">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KindButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 md:py-2 rounded-full text-small font-semibold transition-all ${
        active ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
