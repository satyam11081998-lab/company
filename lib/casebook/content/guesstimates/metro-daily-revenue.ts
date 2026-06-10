import type { Page } from '@/lib/casebook/types';

export const metroDailyRevenue: Page = {
  slug: 'guesstimates/metro-daily-revenue',
  title: 'Daily revenue of a city metro system',
  subtitle: 'Ridership × fare, plus the non-fare layer everyone forgets.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['revenue-build', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate the daily revenue of a large city metro network (say, ~250 km, in a 15-million metro). Fare revenue is the spine; the differentiating move is remembering **non-fare revenue** — advertising, retail rents, and parking — which real metros lean on heavily.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Estimation tree from daily ridership times average fare plus non-fare revenue streams', caption: 'Ridership × average fare + the non-fare layer (ads, retail, parking).', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="mrng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="30" y="26" width="180" height="74" rx="10" fill="url(#mrng)"/>
    <text x="120" y="50" font-size="10" font-weight="700" fill="#ffffff">RIDERSHIP</text>
    <text x="120" y="67" font-size="9" fill="#b9c4d6">~12% of 15M make a metro</text>
    <text x="120" y="81" font-size="9" fill="#b9c4d6">trip daily × 2 legs ≈ 3.5M rides</text>
    <rect x="250" y="26" width="170" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="335" y="50" font-size="10" font-weight="700" fill="hsl(var(--foreground))">AVG FARE</text>
    <text x="335" y="67" font-size="9" fill="hsl(var(--muted-foreground))">slab fares ₹10–60,</text>
    <text x="335" y="81" font-size="9" fill="hsl(var(--muted-foreground))">commuter passes pull it to ~₹32</text>
    <rect x="460" y="26" width="160" height="74" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="540" y="50" font-size="10" font-weight="700" fill="hsl(var(--primary))">NON-FARE</text>
    <text x="540" y="67" font-size="9" fill="hsl(var(--muted-foreground))">ads + station retail +</text>
    <text x="540" y="81" font-size="9" fill="hsl(var(--muted-foreground))">parking ≈ 20% extra</text>
  </g>
  <path d="M210 63 L246 63 M420 63 L456 63" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <path d="M335 100 L335 128 M540 100 L540 128 M335 128 L540 128 M437 128 L437 150" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="287" y="154" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="437" y="179" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ ₹13–14 CR / DAY</text>
  <text x="320" y="226" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Cross-check: ~₹4,800 cr/yr — the right order of magnitude for a major Indian metro's topline.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Ridership', md: 'Of 15M residents, metro-accessible-and-using share ≈ 12% on a given day; each makes ~2 legs → **~3.5M rides/day**.' },
      { title: 'Average fare', md: 'Slabs run ₹10–60; short trips dominate and passes discount heavily → blended **~₹32**.' },
      { title: 'Fare revenue', md: '3.5M × ₹32 ≈ **₹11.2 crore/day**.' },
      { title: 'Non-fare', md: 'Advertising (train wraps, station naming rights), station retail rents, parking ≈ **+20%** → +₹2.2 crore.' },
      { title: 'Total', md: '**≈ ₹13–14 crore/day** (~₹4,800 crore/year).' },
    ]},
    { type: 'mathBox', md: '3.5M rides × ₹32 = ₹11.2 cr + 20% non-fare ≈ **₹13.4 cr/day**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Volunteer the economics punchline: fare revenue rarely covers debt service for metro systems — non-fare and land monetization are strategic, not decorative. That single sentence converts a sizing answer into an infrastructure-economics conversation.' },
  ],
};
