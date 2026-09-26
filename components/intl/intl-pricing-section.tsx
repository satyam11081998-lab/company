'use client';

import { useEffect, useState } from 'react';
import IntlPlanCards from '@/components/intl/intl-plan-cards';
import { REGION_COOKIE } from '@/lib/market';
import type { BillingPeriod } from '@/lib/billing';

/**
 * Public international pricing (US landing + /us/pricing). Static page, so
 * currency is resolved on the client: dollars by default, euros when the
 * middleware placed this browser in Europe (the readable `mece_rg` cookie).
 * The visitor can flip between the two — both are international prices; the
 * India price list is never rendered on this surface. What checkout actually
 * charges is decided server-side from the account's locked market.
 */
export default function IntlPricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');

  useEffect(() => {
    try {
      const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${REGION_COOKIE}=([^;]*)`));
      if (m && decodeURIComponent(m[1]).startsWith('EU')) setCurrency('EUR');
    } catch {
      /* default USD */
    }
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Prices in</span>
        <div className="inline-flex rounded-md border border-border p-0.5">
          {(['USD', 'EUR'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              aria-pressed={currency === c}
              className={`rounded px-2.5 py-1 font-semibold transition-colors ${currency === c ? 'bg-foreground text-background' : 'hover:text-foreground'}`}
            >
              {c === 'USD' ? 'US$' : '€ EUR'}
            </button>
          ))}
        </div>
      </div>
      <IntlPlanCards currency={currency} period={period} onPeriod={setPeriod} mode="public" />
    </div>
  );
}
