'use client';

/**
 * Revenue received and sign-ups (MECE admins) — the header of the old admin
 * Users screen, now on CRM home. Revenue is Razorpay-verified money across all
 * four revenue tables (lib/revenue.ts), with the opening balance shown apart.
 */
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { RevenueSummary } from '@/lib/revenue';
import { Card, Stat } from './ui';
import { Chart } from './insights/chart';

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function AdminPulse({ revenue, users, signups }: {
  revenue: RevenueSummary;
  users: { total: number; guests: number; paid: number; today: number; week: number };
  signups: Array<{ date: string; count: number }>;
}) {
  const partial = revenue.errors.length > 0 || revenue.truncated;
  const windowTotal = signups.reduce((a, s) => a + s.count, 0);
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Card title="Revenue received (admins)">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-bold tabular-nums">{inr(revenue.totalInr)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {revenue.paymentCount === 0 ? <>No customer payments yet — opening balance {inr(revenue.baselineInr)}.</>
                : <>{inr(revenue.ledgerInr)} from <b className="text-foreground">{revenue.paymentCount}</b> payment{revenue.paymentCount === 1 ? '' : 's'}, plus {inr(revenue.baselineInr)} booked before this ledger.</>}
            </p>
          </div>
          <div className="text-right"><p className="text-xs text-muted-foreground">Last 30 days</p><p className="text-xl font-semibold tabular-nums">{inr(revenue.last30Inr)}</p></div>
        </div>
        {revenue.paymentCount > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
            {revenue.streams.map((st) => <div key={st.key}><p className="text-[11px] text-muted-foreground">{st.label}</p><p className="text-sm font-semibold tabular-nums">{inr(st.inr)} <span className="text-[11px] font-normal text-muted-foreground">({st.count})</span></p></div>)}
          </div>
        )}
        {(revenue.international?.length ?? 0) > 0 && (
          <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">International (not in ₹ totals): {revenue.international.map((x) => `${x.currency === 'USD' ? '$' : '€'}${x.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} (${x.count})`).join(' · ')}</p>
        )}
        {revenue.excluded.count > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{inr(revenue.excluded.inr)} across {revenue.excluded.count} verified payment(s) set aside as internal/test{revenue.excluded.reasons.length ? ` — ${revenue.excluded.reasons.join(', ')}` : ''}.</p>}
        {partial && <p className="mt-2 flex items-start gap-1.5 rounded bg-warning-soft p-2 text-[11px]"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />This total is a floor: {revenue.truncated ? 'a table hit the row cap. ' : ''}{revenue.errors.join('; ')}</p>}
      </Card>
      <Card title={`Sign-ups — ${windowTotal} in the last 30 days`} actions={<Link href="/crm/m/contacts?view=new_signups" className="text-xs text-navy hover:underline">See new sign-ups</Link>}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          <Stat label="Users" value={users.total.toLocaleString('en-IN')} />
          <Stat label="Today" value={users.today} />
          <Stat label="This week" value={users.week} />
          <Stat label="On a paid plan" value={users.paid} />
          <Stat label="Guests" value={users.guests.toLocaleString('en-IN')} hint="not in the CRM" />
        </div>
        <div className="mt-3"><Chart kind="bar" height={150} data={signups.map((s) => ({ label: s.date.slice(5), value: s.count }))} /></div>
      </Card>
    </div>
  );
}
