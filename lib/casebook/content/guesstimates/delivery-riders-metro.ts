import type { Page } from '@/lib/casebook/types';

export const deliveryRidersMetro: Page = {
  slug: 'guesstimates/delivery-riders-metro',
  title: 'Food-delivery riders in a metro',
  subtitle: 'Workforce sizing from order volume and rider throughput.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['workforce', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of active food-delivery riders in a 10-million metro. Workforce guesstimates are demand ÷ throughput problems with a **peak-hour correction** — fleets are sized for dinner rush, not the daily average.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree from daily food delivery orders through peak hour share to rider throughput and fleet size', caption: 'Orders → peak-hour load → ÷ rider throughput at peak → fleet size.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="drng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="25" y="26" width="180" height="70" rx="10" fill="url(#drng)"/>
    <text x="115" y="50" font-size="10" font-weight="700" fill="#ffffff">DAILY ORDERS</text>
    <text x="115" y="67" font-size="9" fill="#b9c4d6">2.5M ordering users ×</text>
    <text x="115" y="81" font-size="9" fill="#b9c4d6">~0.25 orders/day ≈ 600k</text>
    <rect x="245" y="26" width="170" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="330" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">PEAK-HOUR LOAD</text>
    <text x="330" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~18% of day's orders in</text>
    <text x="330" y="81" font-size="9" fill="hsl(var(--muted-foreground))">the 8–9pm hour ≈ 110k</text>
    <rect x="455" y="26" width="165" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="537" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">RIDER THROUGHPUT</text>
    <text x="537" y="67" font-size="9" fill="hsl(var(--muted-foreground))">~2.5 deliveries/hour</text>
    <text x="537" y="81" font-size="9" fill="hsl(var(--muted-foreground))">at peak (stacked orders)</text>
  </g>
  <path d="M205 61 L241 61 M415 61 L451 61" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M330 96 L330 124 M537 96 L537 124 M330 124 L537 124 M433 124 L433 146" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="283" y="150" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="433" y="175" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 45,000 ON AT PEAK → ~70–80k ACTIVE</text>
  <text x="320" y="222" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Roster ≠ on-shift: part-timers and churn mean the registered base runs ~1.6–1.8× peak need.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Orders', md: '10M people → ~2.5M food-delivery users (urban, smartphone, ordering habit); ~0.25 orders/user/day blended → **~600K orders/day**.' },
      { title: 'Peak concentration', md: 'Dinner 8–9 pm carries ~18% of daily volume → **~110K orders in the peak hour**.' },
      { title: 'Throughput', md: 'At peak with order-stacking, a rider completes ~2.5 deliveries/hour → need **~45,000 riders on-shift** at peak.' },
      { title: 'Active base', md: 'Part-time mix and shift patterns mean the weekly-active base ≈ 1.6× peak requirement → **~70–80K riders**.' },
    ]},
    { type: 'mathBox', md: '600k × 18% ÷ 2.5/hr ≈ 43k at peak × 1.6 roster factor ≈ **~70k active riders**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The peak-sizing step is the whole point — sizing on daily averages gives ~25K and would mean hour-long dinner waits. Any workforce/fleet guesstimate (cabs, ambulances, servers) should be sized at peak and reconciled to roster.' },
  ],
};
