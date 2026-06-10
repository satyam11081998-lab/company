import type { Page } from '@/lib/casebook/types';

export const cabRidesMetro: Page = {
  slug: 'guesstimates/cab-rides-metro',
  title: 'App-based cab rides per day in a metro',
  subtitle: 'Demand build with a supply-side reconciliation.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['two-way-build', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily app-based cab rides (Uber/Ola-style, four-wheelers) in a 10-million metro. Do it demand-side, then **reconcile against driver supply** — if your demand number implies each driver does 40 rides a day, your demand number is wrong.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Demand-side estimate of cab rides reconciled against driver supply capacity', caption: 'Demand build on the left, supply ceiling on the right — the answer must satisfy both.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="crng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="260" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="170" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">DEMAND BUILD</text>
    <text x="170" y="65" font-size="9" fill="hsl(var(--muted-foreground))">~1.5M ride-hailing users</text>
    <text x="170" y="80" font-size="9" fill="hsl(var(--muted-foreground))">frequent 20% × 1.2/day +</text>
    <text x="170" y="95" font-size="9" fill="hsl(var(--muted-foreground))">occasional 80% × 0.15/day</text>
    <text x="170" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 540k rides/day</text>
    <rect x="340" y="24" width="260" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="470" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">SUPPLY CEILING</text>
    <text x="470" y="65" font-size="9" fill="hsl(var(--muted-foreground))">~45k active cabs ×</text>
    <text x="470" y="80" font-size="9" fill="hsl(var(--muted-foreground))">~12 rides/shift-day</text>
    <text x="470" y="95" font-size="9" fill="hsl(var(--muted-foreground))">(8–10 hr shifts, traffic)</text>
    <text x="470" y="113" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 540k rides/day ✓</text>
  </g>
  <path d="M170 124 L170 154 M470 124 L470 154 M170 154 L470 154 M320 154 L320 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="180" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="205" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 5–5.5 LAKH RIDES / DAY</text>
  <text x="320" y="242" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">When demand and supply agree within ~10%, present the range with confidence; when they don't, the gap IS the finding.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'User base', md: '10M people → smartphone + affordability + habit filter → **~1.5M monthly ride-hailers**.' },
      { title: 'Frequency', md: 'Frequent users (daily commuters, airport-heavy) 20% × ~1.2 rides/day; occasional 80% × ~0.15/day → **~540K rides/day**.' },
      { title: 'Supply check', md: '~45K active cabs; a full-time driver completes 12–15 rides/day but part-timers drag the average to ~12 → ceiling **~540K**. The builds agree.' },
      { title: 'Range', md: 'Quote **5–5.5 lakh/day**, noting it doubles on rainy Fridays and halves on holiday mornings.' },
    ]},
    { type: 'mathBox', md: 'Demand: 300k×1.2 + 1.2M×0.15 = 540k · Supply: 45k × 12 = 540k → **≈ 5.4 lakh rides/day**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The two-sided reconciliation is the move interviewers remember. If pushed on auto-rickshaws/bike taxis, clarify scope upfront — "app-based four-wheeler" — scope discipline is free marks.' },
  ],
};
