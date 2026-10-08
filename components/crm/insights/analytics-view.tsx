'use client';

/**
 * Customer analytics (MK615: CLV, customer equity, CAC, profitability,
 * concentration, lifecycle and loyalty). Every figure says how it is
 * computed; estimates are labelled as estimates.
 */
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { anSaveSettings } from '@/app/(app)/crm/insight-actions';
import { Bars, Button, Card, Field, Stat, inp, inr } from '../ui';
import { Chart } from './chart';

/* eslint-disable @typescript-eslint/no-explicit-any */
type A = any;
const pct = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? '—' : `${(x * 100).toFixed(d)}%`);
const p = (x: number | null | undefined) => (x === null || x === undefined ? '—' : `${x}%`);
const TABS = [
  ['overview', 'CLV and equity'], ['segments', 'CLV by segment'], ['cac', 'Acquisition (CAC)'], ['profit', 'Profitability'], ['lifecycle', 'Lifecycle and cohorts'], ['loyalty', 'Loyalty (NPS/CSAT/CES)'], ['settings', 'Assumptions'],
] as const;

export default function AnalyticsView({ data, canEdit }: { data: A; canEdit: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('overview');
  const d = data;
  const mDisc = Math.pow(1 + d.settings.annualDiscount, 1 / 12) - 1;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Customer analytics</h1>
        <p className="text-sm text-muted-foreground">{d.population.contacts.toLocaleString('en-IN')} customers (internal and test accounts excluded) · {d.population.payers} have paid · lifetime revenue {inr(d.population.revenue)}</p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-3 py-2 text-sm ${tab === k ? 'border-navy font-medium text-navy' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Monthly retention (r)" value={pct(d.retention.monthly)} hint={d.retention.estimated ? `from ${d.retention.sample} paying customers’ renewals` : 'default — fewer than 10 eligible payers'} tone={d.retention.estimated ? undefined : 'warn'} />
            <Stat label="Margin per customer-month (m)" value={inr(d.margin.marginPerMonth)} hint={`ARPU ${inr(d.margin.arpu)}/mo${d.margin.grossMarginPct !== null ? ` × ${d.margin.grossMarginPct}% gross margin` : ''}`} />
            <Stat label="Expected lifetime" value={`${d.clv.lifetimeMonths} months`} hint="1 ÷ (1 − r)" />
            <Stat label="Discount rate (d)" value={`${(d.settings.annualDiscount * 100).toFixed(0)}% a year`} hint={`${(mDisc * 100).toFixed(2)}% a month`} />
          </div>
          <Card title="Customer lifetime value — three ways">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Simple (no discounting)</p><p className="text-2xl font-semibold">{inr(d.clv.simple)}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">CLV = m ÷ (1 − r)</p></div>
              <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Discounted, infinite horizon (Gupta–Lehmann)</p><p className="text-2xl font-semibold">{inr(d.clv.guptaLehmann)}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">CLV = m × r ÷ (1 + d − r)</p></div>
              <div className="rounded-md border border-border p-3"><p className="text-xs text-muted-foreground">Discounted, {d.settings.horizonMonths}-month horizon</p><p className="text-2xl font-semibold">{inr(d.clv.finite)}</p><p className="mt-1 font-mono text-[11px] text-muted-foreground">CLV = Σₜ m·rᵗ⁻¹ ÷ (1+d)ᵗ, t = 1…{d.settings.horizonMonths}</p></div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">r is estimated from how often paying customers buy again within one billing cycle ({d.retention.cycleDays} days); m is revenue per customer-month after payment fees and the AI cost to serve them (support cost is counted in Profitability).</p>
          </Card>
          <Card title="Customer equity (value of the customer base)">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Stat label="Current customers" value={inr(d.equity.current)} hint="today’s customers × CLV" />
              <Stat label="Future customers (12 mo)" value={inr(d.equity.future)} hint={`${d.cac.newPerMonth}/month × (CLV − CAC), discounted`} />
              <Stat label="Customer equity" value={inr(d.equity.total)} />
              <Stat label="CLV : CAC" value={d.equity.clvToCac === null ? '—' : `${d.equity.clvToCac} : 1`} tone={d.equity.clvToCac === null ? undefined : d.equity.clvToCac >= 3 ? 'good' : d.equity.clvToCac < 1 ? 'bad' : 'warn'} hint="3:1 or better is healthy" />
              <Stat label="CAC payback" value={d.equity.paybackMonths === null ? '—' : `${d.equity.paybackMonths} months`} hint="CAC ÷ m" />
            </div>
          </Card>
        </div>
      )}

      {tab === 'segments' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {([['plan', 'By plan'], ['channel', 'By acquisition channel'], ['market', 'By market'], ['rfm', 'By RFM segment']] as const).map(([k, title]) => (
            <Card key={k} title={title}>
              <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
                <thead className="text-xs text-muted-foreground"><tr className="text-right"><th className="py-1 text-left font-medium">Segment</th><th className="font-medium">Payers</th><th className="font-medium">Revenue</th><th className="font-medium">m / mo</th><th className="font-medium">r</th><th className="font-medium">CLV</th><th className="font-medium">CLV (disc.)</th></tr></thead>
                <tbody>{(d.clvBy[k] as A[]).map((s) => (
                  <tr key={s.segment} className="border-t border-border text-right tabular-nums"><td className="py-1 text-left capitalize">{s.segment}</td><td>{s.customers}</td><td>{inr(s.revenue)}</td><td>{inr(s.marginMonth)}</td><td title={s.retentionEstimated ? 'estimated from this segment' : 'too few customers — overall rate used'}>{pct(s.retention, 0)}{s.retentionEstimated ? '' : '*'}</td><td>{inr(s.clvSimple)}</td><td>{inr(s.clvDiscounted)}</td></tr>
                ))}{!(d.clvBy[k] as A[]).length && <tr><td colSpan={7} className="py-4 text-center text-muted-foreground">No paying customers yet.</td></tr>}</tbody>
              </table></div>
              <p className="mt-2 text-[11px] text-muted-foreground">* fewer than 10 eligible customers in the segment, so the overall retention rate is used.</p>
            </Card>
          ))}
        </div>
      )}

      {tab === 'cac' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {([['last90', 'Last 90 days'], ['allTime', 'All time']] as const).map(([k, title]) => (
            <Card key={k} title={`${title} — blended CAC ${d.cac[k].blendedCac === null ? '—' : inr(d.cac[k].blendedCac)}`}>
              <table className="w-full text-sm"><thead className="text-xs text-muted-foreground"><tr className="text-right"><th className="py-1 text-left font-medium">Channel</th><th className="font-medium">Spend</th><th className="font-medium">New payers</th><th className="font-medium">CAC</th></tr></thead>
                <tbody>{(d.cac[k].rows as A[]).map((r) => <tr key={r.channel} className="border-t border-border text-right tabular-nums"><td className="py-1 text-left">{r.channel}</td><td>{inr(r.spend)}</td><td>{r.newCustomers}</td><td>{r.cac === null ? (r.spend > 0 ? 'no payers yet' : '—') : inr(r.cac)}</td></tr>)}
                  <tr className="border-t-2 border-border text-right font-medium tabular-nums"><td className="py-1 text-left">Total</td><td>{inr(d.cac[k].totalSpend)}</td><td>{d.cac[k].totalNew}</td><td>{d.cac[k].blendedCac === null ? '—' : inr(d.cac[k].blendedCac)}</td></tr>
                </tbody></table>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground xl:col-span-2">Spend comes from campaign actual cost (by campaign type), purchase orders marked “Marketing (acquisition)”, and coupon commissions ({d.cac.spendItems} items). A new payer’s channel is their lead source, else what they told us at sign-up. Organic channels have zero spend, so their CAC is ₹0.</p>
        </div>
      )}

      {tab === 'profit' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card title="Whale curve (cumulative profit, best customers first)">
            <Chart kind="line" data={(d.profit.whale.points as A[]).map((pt) => ({ label: `${pt.x}%`, value: pt.y }))} format={(n) => `${n}%`} />
            <p className="mt-2 text-xs text-muted-foreground">Peak {p(d.profit.whale.peak)} of total profit at the top {p(d.profit.whale.peakAtPct)} of customers; {p(d.profit.whale.unprofitablePct)} of payers lose money after their share of fixed costs ({inr(d.profit.perCustomerFixed)} each). Total profit {inr(d.profit.whale.totalProfit)}. Free users cost {inr(d.profit.freeUserCost)} to serve (not included).</p>
          </Card>
          <Card title="Customer profitability by decile">
            <Bars data={(d.profit.deciles as A[]).map((x) => ({ label: `Decile ${x.decile} (${x.customers})`, value: x.sum, tone: x.sum < 0 ? 'bg-destructive' : 'bg-viz-1' }))} format={(n) => inr(n)} max={Math.max(1, ...(d.profit.deciles as A[]).map((x) => Math.abs(x.sum)))} />
          </Card>
          <Card title="Loyalty vs profitability (Reinartz & Kumar)">
            <div className="grid grid-cols-2 gap-2">
              {(['True friends', 'Butterflies', 'Barnacles', 'Strangers'] as const).map((q) => (
                <div key={q} className="rounded-md border border-border p-3"><p className="text-sm font-medium">{q}: {d.profit.quadrants.counts[q]?.customers ?? 0} <span className="text-xs font-normal text-muted-foreground">· profit {inr(d.profit.quadrants.counts[q]?.profit ?? 0)}</span></p><p className="mt-1 text-xs text-muted-foreground">{d.profit.quadrants.advice[q]}</p></div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Split at the median profit ({inr(d.profit.quadrants.profitMedian)}) and median tenure ({d.profit.quadrants.tenureMedianDays} days).</p>
          </Card>
          <Card title="Revenue concentration">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Stat label="Top 1%" value={p(d.concentration.top1)} /><Stat label="Top 10%" value={p(d.concentration.top10)} /><Stat label="Top 20%" value={p(d.concentration.top20)} hint="Pareto check" /><Stat label="Gini" value={d.concentration.gini ?? '—'} hint={`HHI ${d.concentration.hhi ?? '—'}`} />
            </div>
            <Chart kind="line" height={180} data={(d.concentration.lorenz as A[]).map((pt) => ({ label: `${pt.x}%`, value: pt.y }))} format={(n) => `${n}%`} />
            <p className="text-[11px] text-muted-foreground">Lorenz curve: share of revenue from the smallest x% of payers. The further below the diagonal, the more concentrated.</p>
          </Card>
        </div>
      )}

      {tab === 'lifecycle' && (
        <div className="space-y-4">
          <Card title={`Lifecycle funnel — ${d.funnel.activeNow.toLocaleString('en-IN')} active in the last 30 days`}>
            <Bars data={(d.funnel.steps as A[]).map((s) => ({ label: `${s.stage}${s.ofPrev !== null ? ` (${s.ofPrev}% of previous)` : ''}`, value: s.count }))} />
          </Card>
          <Card title="Monthly cohorts — % of each sign-up month active (and paying) in later months">
            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-xs">
              <thead className="text-muted-foreground"><tr><th className="py-1 text-left font-medium">Cohort</th><th className="text-right font-medium">Size</th>{(d.cohorts[0]?.active ?? []).map((_: unknown, k: number) => <th key={k} className="text-right font-medium">M{k}</th>)}</tr></thead>
              <tbody>{(d.cohorts as A[]).map((c) => (
                <tr key={c.cohort} className="border-t border-border tabular-nums"><td className="py-1">{c.cohort}</td><td className="text-right">{c.size}</td>
                  {(c.active as Array<number | null>).map((v, k) => <td key={k} className="text-right" style={{ background: v === null ? undefined : `hsl(var(--viz-1) / ${Math.min(0.85, v / 100 + 0.05)})`, color: v !== null && v > 45 ? 'white' : undefined }} title={v === null ? '' : `${v}% active, ${c.paying[k] ?? 0}% paying`}>{v === null ? '' : `${v}`}</td>)}
                </tr>
              ))}</tbody>
            </table></div>
            <p className="mt-2 text-[11px] text-muted-foreground">Active = started or solved a case that month. Hover a cell to see the share paying.</p>
          </Card>
          <Card title="RFM segments (customers)">
            <Bars data={(d.rfm as A[]).map((r) => ({ label: r.label, value: r.n }))} />
          </Card>
        </div>
      )}

      {tab === 'loyalty' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat label={`NPS (${d.loyalty.nps.responses} answers, 12 months)`} value={d.loyalty.nps.score ?? '—'} hint="% promoters (9–10) − % detractors (0–6)" tone={d.loyalty.nps.score === null ? undefined : d.loyalty.nps.score >= 30 ? 'good' : d.loyalty.nps.score < 0 ? 'bad' : undefined} />
          <Stat label={`CSAT (${d.loyalty.csat.responses} answers)`} value={d.loyalty.csat.score === null ? '—' : `${d.loyalty.csat.score}%`} hint="share answering 4 or 5 of 5" />
          <Stat label={`CES (${d.loyalty.ces.responses} answers)`} value={d.loyalty.ces.score ?? '—'} hint={`mean of 1–7; ${d.loyalty.ces.easyPct ?? '—'}% found it easy (5+)`} />
        </div>
      )}

      {tab === 'settings' && <Settings s={d.settings} canEdit={canEdit} />}
    </div>
  );
}

function Settings({ s, canEdit }: { s: A; canEdit: boolean }) {
  const router = useRouter();
  const [v, setV] = useState({ ...s });
  const save = async () => {
    const r = await anSaveSettings(v);
    if (!r.ok) return toast.error(r.error);
    toast.success('Saved');
    router.refresh();
  };
  const num = (k: string, label: string, hint: string, step = '1') => (
    <Field label={label} hint={hint}><input className={inp} type="number" step={step} value={v[k]} disabled={!canEdit} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} /></Field>
  );
  return (
    <Card title="Assumptions used above">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {num('annualDiscount', 'Annual discount rate', 'e.g. 0.12 = 12% (cost of capital)', '0.01')}
        {num('horizonMonths', 'CLV horizon (months)', 'for the finite-horizon CLV')}
        {num('usdInr', 'USD → INR', 'converts AI cost (billed in USD)', '0.5')}
        {num('costPerCase', 'Support cost per case (₹)', 'activity-based cost of one support case')}
        {num('feePct', 'Payment fee', 'e.g. 0.02 = 2% gateway fee', '0.005')}
      </div>
      {canEdit ? <div className="mt-3 flex justify-end"><Button primary onClick={save}>Save</Button></div> : <p className="mt-3 text-xs text-muted-foreground">Only admins can change these.</p>}
    </Card>
  );
}
