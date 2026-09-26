'use client';

import Link from 'next/link';
import { Check, Minus } from 'lucide-react';
import { usButton } from '@/components/us/ui';
// Deliberately NOT '@/lib/tier': that module also carries the rupee price
// table, and anything imported here ships to international visitors' browsers.
import { BILLING_PERIODS, BILLING_PERIOD_LABELS, BILLING_PERIOD_SUFFIX, type BillingPeriod } from '@/lib/billing';
import {
  intlPriceFor as priceFor,
  intlPerMonthEquivalent as perMonthEquivalent,
  intlPeriodSavingPct as periodSavingPct,
} from '@/lib/pricing-intl';
import { formatMoney, type Currency } from '@/lib/market';
import { INTL_PLAN_COPY, type PlanLine } from '@/lib/intl-plans';

/**
 * International (USD / EUR) plan cards. One component for both surfaces:
 *   - mode 'public'   → /us/pricing and the US landing: every CTA goes to /signup
 *   - mode 'checkout' → /upgrade for a signed-in international account
 * The prices come from lib/tier.ts INTL_TIER_PRICING — the SAME table the
 * server charges from, so the page cannot show a price checkout won't honour.
 */
export default function IntlPlanCards({
  currency,
  period,
  onPeriod,
  mode,
  onUpgrade,
  loading = null,
  current = 'free',
  currentPeriod = null,
}: {
  currency: Exclude<Currency, 'INR'>;
  period: BillingPeriod;
  onPeriod: (p: BillingPeriod) => void;
  mode: 'public' | 'checkout';
  onUpgrade?: (tier: 'lite' | 'pro') => void;
  loading?: string | null;
  current?: 'free' | 'lite' | 'pro';
  currentPeriod?: BillingPeriod | null;
}) {
  const isCurrent = (t: 'free' | 'lite' | 'pro') =>
    t === current && (t === 'free' || (currentPeriod !== null && currentPeriod === period));

  return (
    <>
      <div className="mb-10 flex justify-center">
        <div role="group" aria-label="Billing period" className="inline-flex w-full max-w-md items-center gap-1 rounded-[8px] border border-border bg-card p-1 sm:w-auto sm:max-w-none">
          {BILLING_PERIODS.map((p) => {
            const save = periodSavingPct('pro', p, currency);
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPeriod(p)}
                aria-pressed={period === p}
                className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-[6px] px-3 py-1.5 text-sm font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:block sm:h-9 sm:min-h-0 sm:flex-none sm:px-4 sm:py-0 ${
                  period === p ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {BILLING_PERIOD_LABELS[p]}
                {p !== 'monthly' && save > 0 && (
                  <span className={`text-[11px] font-semibold sm:ml-1.5 ${period === p ? 'text-background/80' : 'text-success'}`}>save up to {Math.max(save, periodSavingPct('lite', p, currency))}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {/* Free */}
        <div className="flex h-full flex-col rounded-[12px] border border-border bg-card">
          <div className="flex flex-col border-b border-border p-6">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-[18px] font-semibold tracking-tight text-foreground">Free</h3>
              {mode === 'checkout' && isCurrent('free') && <CurrentTag />}
            </div>
            <p className="text-xs text-muted-foreground">{INTL_PLAN_COPY.free.tagline}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-[34px] font-semibold tracking-tight text-foreground tnum">
                {formatMoney(0, currency)}
              </span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 p-6">
            <Lines lines={INTL_PLAN_COPY.free.lines} />
            {mode === 'public' ? (
              <Link href="/signup" className={usButton('secondary', 'md', 'mt-auto w-full')}>
                Start free
              </Link>
            ) : (
              <button disabled className="mt-auto flex h-10 w-full cursor-default items-center justify-center rounded-[8px] border border-border bg-muted/40 text-sm font-semibold text-muted-foreground">
                {current === 'free' ? 'Your current plan' : 'Included in your plan'}
              </button>
            )}
          </div>
        </div>

        {/* Lite */}
        <div className="flex h-full flex-col rounded-[12px] border border-border bg-card">
          <div className="flex flex-col border-b border-border p-6">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-[18px] font-semibold tracking-tight text-foreground">Lite</h3>
              {mode === 'checkout' && isCurrent('lite') && <CurrentTag />}
            </div>
            <p className="text-xs text-muted-foreground">{INTL_PLAN_COPY.lite.tagline}</p>
            <PriceBlock tier="lite" period={period} currency={currency} />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 p-6">
            <div>
              <Everything label="Everything in Free" />
              <Lines lines={INTL_PLAN_COPY.lite.lines} />
            </div>
            {mode === 'public' ? (
              <Link href="/signup?next=%2Fupgrade" className={usButton('secondary', 'md', 'mt-auto w-full')}>
                Get Lite
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onUpgrade?.('lite')}
                disabled={loading !== null || current === 'pro' || isCurrent('lite')}
                className={usButton('secondary', 'md', 'mt-auto w-full')}
              >
                {current === 'pro' ? 'Included in Pro' : isCurrent('lite') ? 'Your current plan' : loading === 'lite' ? 'Opening checkout…' : `Get Lite · ${formatMoney(priceFor('lite', period, currency), currency)}`}
              </button>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-[12px] border border-primary/50 bg-card">
          <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-primary" />
          <div className="flex flex-col border-b border-border p-6">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-[18px] font-semibold tracking-tight text-foreground">Pro</h3>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Recommended</span>
              {mode === 'checkout' && isCurrent('pro') && <CurrentTag />}
            </div>
            <p className="text-xs text-muted-foreground">{INTL_PLAN_COPY.pro.tagline}</p>
            <PriceBlock tier="pro" period={period} currency={currency} />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 p-6">
            <div>
              <Everything label="Everything in Lite" accent />
              <Lines lines={INTL_PLAN_COPY.pro.lines} />
            </div>
            {mode === 'public' ? (
              <Link href="/signup?next=%2Fupgrade" className={usButton('primary', 'md', 'mt-auto w-full')}>
                Get Pro
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onUpgrade?.('pro')}
                disabled={loading !== null || isCurrent('pro')}
                className={usButton('primary', 'md', 'mt-auto w-full')}
              >
                {isCurrent('pro') ? 'Your current plan' : loading === 'pro' ? 'Opening checkout…' : current === 'pro' ? `Extend · ${formatMoney(priceFor('pro', period, currency), currency)}` : `Get Pro · ${formatMoney(priceFor('pro', period, currency), currency)}`}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        One-time payment for the period you choose. Nothing renews automatically. Prices in {currency === 'USD' ? 'US dollars' : 'euros'}.
      </p>
    </>
  );
}

function PriceBlock({ tier, period, currency }: { tier: 'lite' | 'pro'; period: BillingPeriod; currency: Exclude<Currency, 'INR'> }) {
  const per = perMonthEquivalent(tier, period, currency);
  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-1">
        <span className="text-[34px] font-semibold tracking-tight text-foreground tnum">
          {formatMoney(priceFor(tier, period, currency), currency)}
        </span>
        <span className="text-xs text-muted-foreground">{BILLING_PERIOD_SUFFIX[period]}</span>
      </div>
      {period !== 'monthly' && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          ≈ {currency === 'USD' ? '$' : '€'}
          {per.toFixed(Number.isInteger(per) ? 0 : 2)}/mo · save {periodSavingPct(tier, period, currency)}% vs monthly
        </p>
      )}
    </div>
  );
}

function Everything({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <Check aria-hidden className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent ? 'text-primary' : 'text-foreground/70'}`} />
      <span className="text-sm font-semibold leading-tight text-foreground">{label}</span>
    </div>
  );
}

function Lines({ lines }: { lines: PlanLine[] }) {
  return (
    <ul className="space-y-3">
      {lines.map((l) => (
        <li key={l.text} className="flex items-start gap-2.5">
          {l.cross ? (
            <Minus aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
          ) : (
            <Check aria-hidden className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground/50" />
          )}
          <span className="text-sm leading-tight text-muted-foreground">{l.text}</span>
        </li>
      ))}
    </ul>
  );
}

function CurrentTag() {
  return (
    <span className="ml-auto rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
      Current
    </span>
  );
}
