'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, IndianRupee, Ban, RotateCcw, CheckCircle2, XCircle, Copy } from 'lucide-react';
import { createInfluencerCoupon, setCouponStatus, markCommissionPaid } from './actions';

export interface AdminCoupon {
  id: string;
  code: string;
  discountPct: number;
  commissionPct: number;
  tierScope: string;
  status: string;
  ownerName: string;
  ownerHandle: string | null;
  ownerContact: string | null;
  note: string;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string;
  createdAt: string;
  grossPaise: number;
  commissionOwedPaise: number;
  commissionTotalPaise: number;
}

export interface AdminRedemption {
  id: string;
  couponId: string;
  code: string;
  buyerName: string;
  buyerEmail: string;
  tier: string;
  period: string;
  listPricePaise: number;
  paidPaise: number;
  discountPaise: number;
  commissionPaise: number;
  payoutStatus: string;
  createdAt: string;
}

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function CouponsAdminClient({
  coupons,
  redemptions,
}: {
  coupons: AdminCoupon[];
  redemptions: AdminRedemption[];
}) {
  const [log, setLog] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [openCoupon, setOpenCoupon] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [owner, setOwner] = useState('');
  const [handle, setHandle] = useState('');
  const [contact, setContact] = useState('');
  const [discount, setDiscount] = useState('10');
  const [commission, setCommission] = useState('5');
  const [scope, setScope] = useState<'any' | 'lite' | 'pro'>('any');
  const [cap, setCap] = useState('');
  const [days, setDays] = useState('365');
  const [note, setNote] = useState('');

  const totals = useMemo(() => {
    const active = coupons.filter((c) => c.status === 'active').length;
    return {
      active,
      uses: coupons.reduce((a, c) => a + c.redemptionCount, 0),
      gross: coupons.reduce((a, c) => a + c.grossPaise, 0),
      owed: coupons.reduce((a, c) => a + c.commissionOwedPaise, 0),
    };
  }, [coupons]);

  async function handleCreate() {
    setBusy('create');
    setLog(null);
    const res = await createInfluencerCoupon({
      code,
      discountPct: Number(discount),
      commissionPct: Number(commission),
      tierScope: scope,
      ownerName: owner,
      ownerHandle: handle,
      ownerContact: contact,
      maxRedemptions: cap.trim() === '' ? null : Number(cap),
      validDays: Number(days),
      note,
    });
    if (res.success) {
      setLog({ type: 'success', message: `${res.data?.code} is live. Share it as-is — codes are case-insensitive.` });
      setCode(''); setOwner(''); setHandle(''); setContact(''); setCap(''); setNote('');
    } else {
      setLog({ type: 'error', message: res.error || 'Could not create the coupon.' });
    }
    setBusy(null);
  }

  async function handleStatus(id: string, status: 'active' | 'revoked') {
    setBusy(id);
    setLog(null);
    const res = await setCouponStatus(id, status);
    setLog(res.success
      ? { type: 'success', message: status === 'revoked' ? 'Coupon revoked.' : 'Coupon reactivated.' }
      : { type: 'error', message: res.error || 'Failed.' });
    setBusy(null);
  }

  async function handlePayout(id: string) {
    setBusy(id);
    setLog(null);
    const res = await markCommissionPaid(id);
    setLog(res.success
      ? { type: 'success', message: `Marked ${res.data?.count ?? 0} redemption(s) as paid out.` }
      : { type: 'error', message: res.error || 'Failed.' });
    setBusy(null);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-display-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Ticket className="h-6 w-6 text-primary" />
          Influencer coupons
        </h1>
        <p className="text-body text-muted-foreground mt-2">
          Public codes anyone can redeem. The buyer sees only their discount — the commission below is
          never exposed to users, in the app or in any API response.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active codes', value: String(totals.active) },
          { label: 'Total redemptions', value: String(totals.uses) },
          { label: 'Gross collected', value: rupees(totals.gross) },
          { label: 'Commission owed', value: rupees(totals.owed) },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Create */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">New code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Commission is calculated on the <span className="font-medium text-foreground">list price</span>, so
          it does not shrink when the discount grows.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Code</span>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ANUSHKA10"
              className="h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm uppercase" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Owner</span>
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Anushka"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Handle</span>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@anushka"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Payout contact</span>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="UPI or email"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Buyer discount %</span>
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="numeric"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Owner commission %</span>
            <input value={commission} onChange={(e) => setCommission(e.target.value)} inputMode="decimal"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Applies to</span>
            <select value={scope} onChange={(e) => setScope(e.target.value as 'any' | 'lite' | 'pro')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="any">Any plan</option>
              <option value="pro">Pro only</option>
              <option value="lite">Lite only</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Max uses (blank = unlimited)</span>
            <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="numeric" placeholder="unlimited"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Valid for (days)</span>
            <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums" />
          </label>
          <label className="text-sm sm:col-span-2 lg:col-span-3">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Note (internal)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Instagram reels collab, Aug 2026"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
          </label>
        </div>
        <Button onClick={handleCreate} disabled={busy === 'create' || !code.trim() || !owner.trim()}
          className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
          {busy === 'create' ? 'Creating…' : 'Create code'}
        </Button>
      </Card>

      {/* List */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Codes</h2>
        </div>
        {coupons.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">No influencer codes yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {coupons.map((c) => {
              const expired = new Date(c.expiresAt).getTime() < Date.now();
              const rows = redemptions.filter((r) => r.couponId === c.id);
              const open = openCoupon === c.id;
              return (
                <div key={c.id} className="px-6 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-foreground">{c.code}</span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(c.code)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label="Copy code"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'active' && !expired
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {expired && c.status === 'active' ? 'expired' : c.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.ownerName}
                        {c.ownerHandle ? ` · ${c.ownerHandle}` : ''} · {c.discountPct}% off ·{' '}
                        <span className="font-medium text-foreground">{c.commissionPct}% commission</span> ·{' '}
                        {c.tierScope === 'any' ? 'any plan' : `${c.tierScope} only`}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.redemptionCount}
                        {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''} used · expires {shortDate(c.expiresAt)}
                        {c.ownerContact ? ` · pay to ${c.ownerContact}` : ''}
                        {c.note ? ` · ${c.note}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Owed</p>
                        <p className="text-lg font-semibold tabular-nums text-foreground">
                          {rupees(c.commissionOwedPaise)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {rupees(c.commissionTotalPaise)} lifetime · {rupees(c.grossPaise)} gross
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setOpenCoupon(open ? null : c.id)}>
                          {open ? 'Hide' : `Log (${rows.length})`}
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          disabled={busy === c.id || c.commissionOwedPaise === 0}
                          onClick={() => handlePayout(c.id)}
                        >
                          <IndianRupee className="mr-1 h-3.5 w-3.5" /> Mark paid
                        </Button>
                        {c.status === 'revoked' ? (
                          <Button variant="outline" size="sm" disabled={busy === c.id}
                            onClick={() => handleStatus(c.id, 'active')}>
                            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled={busy === c.id}
                            onClick={() => handleStatus(c.id, 'revoked')}
                            className="text-destructive hover:text-destructive">
                            <Ban className="mr-1 h-3.5 w-3.5" /> Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                      {rows.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                          No redemptions yet.
                        </p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">When</th>
                              <th className="px-3 py-2 text-left font-medium">Buyer</th>
                              <th className="px-3 py-2 text-left font-medium">Plan</th>
                              <th className="px-3 py-2 text-right font-medium">List</th>
                              <th className="px-3 py-2 text-right font-medium">Paid</th>
                              <th className="px-3 py-2 text-right font-medium">Commission</th>
                              <th className="px-3 py-2 text-right font-medium">Payout</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {rows.map((r) => (
                              <tr key={r.id}>
                                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{shortDate(r.createdAt)}</td>
                                <td className="px-3 py-2">
                                  <span className="block text-foreground">{r.buyerName}</span>
                                  <span className="block text-xs text-muted-foreground">{r.buyerEmail}</span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 capitalize text-muted-foreground">
                                  {r.tier} · {r.period}
                                </td>
                                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">{rupees(r.listPricePaise)}</td>
                                <td className="px-3 py-2 text-right tabular-nums text-foreground">{rupees(r.paidPaise)}</td>
                                <td className="px-3 py-2 text-right tabular-nums font-medium text-foreground">{rupees(r.commissionPaise)}</td>
                                <td className="px-3 py-2 text-right">
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    r.payoutStatus === 'paid'
                                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                      : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                  }`}>
                                    {r.payoutStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {log && (
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${
          log.type === 'success'
            ? 'border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400'
            : 'border-destructive/20 bg-destructive/10 text-destructive'
        }`}>
          {log.type === 'success'
            ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            : <XCircle className="mt-0.5 h-5 w-5 shrink-0" />}
          <div className="text-sm font-medium">{log.message}</div>
        </div>
      )}
    </div>
  );
}
