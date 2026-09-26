'use client';

import Link from 'next/link';
import { Check, Minus, Star, Zap, Sparkles, ShieldCheck } from 'lucide-react';
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
      <div className="flex justify-center mb-8">
        <div className="inline-flex w-full max-w-md items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:w-auto sm:max-w-none">
          {BILLING_PERIODS.map((p) => {
            const save = periodSavingPct('pro', p, currency);
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPeriod(p)}
                aria-pressed={period === p}
                className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-md px-2 py-1.5 text-sm font-medium leading-tight transition-colors sm:block sm:h-9 sm:min-h-0 sm:flex-none sm:px-4 sm:py-0 ${
                  period === p
                    ? 'border border-border bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {BILLING_PERIOD_LABELS[p]}
                {p !== 'monthly' && save > 0 && (
                  <span className="text-[11px] font-semibold text-success sm:ml-1.5">save up to {Math.max(save, periodSavingPct('lite', p, currency))}%</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {/* Free */}
        <div className="ui-card flex h-full flex-col">
          <div className="flex flex-col border-b border-border p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">Free</h2>
              {mode === 'checkout' && isCurrent('free') && <CurrentTag />}
            </div>
            <p className="text-xs text-muted-foreground">{INTL_PLAN_COPY.free.tagline}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {formatMoney(0, currency)}
              </span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 p-6">
            <Lines lines={INTL_PLAN_COPY.free.lines} />
            {mode === 'public' ? (
              <Link href="/signup" className="mt-auto">
                <span className="flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                  Start free
                </span>
              </Link>
            ) : (
              <button disabled className="mt-auto flex h-10 w-full cursor-default items-center justify-center rounded-md border border-border bg-muted/40 text-sm font-semibold text-muted-foreground">
                {current === 'free' ? 'Your current plan' : 'Included in your plan'}
              </button>
            )}
          </div>
        </div>

        {/* Lite */}
        <div className="ui-card flex h-full flex-col">
          <div className="flex flex-col border-b border-border p-6">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">Lite</h2>
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
              <Link href="/signup" className="mt-auto">
                <span className="flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold transition-colors hover:bg-muted">
                  Get Lite
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onUpgrade?.('lite')}
                disabled={loading !== null || current === 'pro' || isCurrent('lite')}
                className="mt-auto flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50"
              >
                {current === 'pro' ? 'Included in Pro' : isCurrent('lite') ? 'Your current plan' : loading === 'lite' ? 'Opening checkout…' : `Get Lite · ${formatMoney(priceFor('lite', period, currency), currency)}`}
              </button>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className="ui-card relative flex h-full flex-col border-primary shadow-[0_0_15px_rgba(200,16,46,0.1)]">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <span className="rounded-full border border-primary-hover bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
              Recommended
            </span>
          </div>
          <div className="flex flex-col border-b border-border bg-primary/[0.02] p-6">
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">Pro</h2>
              {mode === 'checkout' && isCurrent('pro') && <CurrentTag />}
            </div>
            <p className="text-xs text-muted-foreground">{INTL_PLAN_COPY.pro.tagline}</p>
            <PriceBlock tier="pro" period={period} currency={currency} />
          </div>
          <div className="flex flex-1 flex-col justify-between gap-8 bg-primary/[0.01] p-6">
            <div>
              <Everything label="Everything in Lite" accent />
              <Lines lines={INTL_PLAN_COPY.pro.lines} />
            </div>
            {mode === 'public' ? (
              <Link href="/signup" className="mt-auto">
                <span className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover">
                  Get Pro
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onUpgrade?.('pro')}
                disabled={loading !== null || isCurrent('pro')}
                className="mt-auto flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
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
        <span className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
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
      <ShieldCheck className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent ? 'text-primary' : 'text-foreground/70'}`} />
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
            <Minus className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/40" />
          ) : (
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success/70" />
          )}
          <span className={`text-sm leading-tight ${l.muted ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>{l.text}</span>
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
