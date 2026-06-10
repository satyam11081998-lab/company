import type { Page } from '@/lib/casebook/types';

export const deliveryRidersMetro: Page = {
  slug: 'guesstimates/delivery-riders-metro',
  title: 'Food-delivery riders in a metro',
  subtitle: 'Workforce sizing from order volume and rider throughput.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['workforce', 'demand-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of active food-delivery riders in a 10-million metro. Workforce guesstimates are demand ÷ throughput problems with a **peak-hour correction** — fleets are sized for dinner rush, not the daily average.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from metro population to ordering users to daily orders distributed across the day, peak hour load divided by rider throughput at peak, grossed up by roster factor to active rider base', caption: 'Users → orders → the shape of the day (size for the dinner spike, not the average) → throughput → roster gross-up.', svg: `<svg viewBox="0 0 720 530" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="drng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#drng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">DELIVERY RIDERS · 10M METRO</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">size the fleet at peak, not at the average</text>
  <path d="M360 60 L360 78" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="80" width="300" height="52" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="100" font-size="10" font-weight="700" fill="hsl(var(--foreground))">DAILY ORDER VOLUME</text>
    <text x="360" y="117" font-size="9" fill="hsl(var(--muted-foreground))">2.5M ordering users × ~0.25 orders/day ≈ <tspan font-weight="700" fill="hsl(var(--primary))">600K orders</tspan></text>
  </g>
  <path d="M360 132 L360 148 M125 148 L595 148 M125 148 L125 164 M360 148 L360 164 M595 148 L595 164" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="166" width="190" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LUNCH 12–2pm</text>
    <text x="125" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~22% of volume over 2 hrs</text>
    <text x="125" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ 66k orders/hr</text>
    <text x="125" y="237" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">secondary peak</text>
    <rect x="265" y="166" width="190" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">DINNER 7–10pm</text>
    <text x="360" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~45% of volume; worst hour</text>
    <text x="360" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">8–9pm ≈ 18% of the day</text>
    <text x="360" y="237" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 110k orders in 1 hr</text>
    <rect x="500" y="166" width="190" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="595" y="186" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REST OF DAY</text>
    <text x="595" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">~33% spread thin across</text>
    <text x="595" y="217" font-size="8.5" fill="hsl(var(--muted-foreground))">~19 hours</text>
    <text x="595" y="237" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">never binding</text>
  </g>
  <path d="M360 258 L360 276" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="115" y="278" width="240" height="74" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="235" y="298" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">RIDER THROUGHPUT AT PEAK</text>
    <text x="235" y="315" font-size="8.5" fill="hsl(var(--muted-foreground))">~20 min/delivery solo, but stacking</text>
    <text x="235" y="329" font-size="8.5" fill="hsl(var(--muted-foreground))">(2 orders/trip) lifts it</text>
    <text x="235" y="345" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 2.5 deliveries/hr</text>
    <rect x="375" y="278" width="240" height="74" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="495" y="298" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">PEAK FLEET REQUIRED</text>
    <text x="495" y="318" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">110k ÷ 2.5 ≈ 44,000 riders</text>
    <text x="495" y="335" font-size="8.5" fill="hsl(var(--muted-foreground))">on-shift simultaneously, 8–9pm</text>
  </g>
  <path d="M235 352 L235 370 M495 352 L495 370 M235 370 L495 370 M360 370 L360 386" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="388" width="400" height="48" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="407" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ROSTER GROSS-UP × ~1.6</text>
    <text x="360" y="424" font-size="8.5" fill="hsl(var(--muted-foreground))">part-timers, day-offs, churn — registered base must exceed peak need</text>
  </g>
  <path d="M360 436 L360 452" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="454" width="340" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="479" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 70,000–80,000 ACTIVE RIDERS</text>
  <text x="360" y="516" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sizing on the daily average gives ~25k — and hour-long dinner waits. Peak analysis is the whole answer.</text>
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
