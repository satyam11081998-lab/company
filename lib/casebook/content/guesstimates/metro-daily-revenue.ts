import type { Page } from '@/lib/casebook/types';

export const metroDailyRevenue: Page = {
  slug: 'guesstimates/metro-daily-revenue',
  title: 'Daily revenue of a city metro system',
  subtitle: 'Ridership × fare, plus the non-fare layer everyone forgets.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['revenue-build', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate the daily revenue of a large city metro network (say, ~250 km, in a 15-million metro). Fare revenue is the spine; the differentiating move is remembering **non-fare revenue** — advertising, retail rents, and parking — which real metros lean on heavily.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from city population to metro ridership built from commuter and occasional segments, fare mix of pass holders versus single tickets, plus three non-fare streams, summed to daily revenue', caption: 'Ridership from two rider segments, fare from the pass/single mix, then the non-fare layer — each stream sized on its own.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="mrng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#mrng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">METRO SYSTEM REVENUE / DAY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">15M city · ~250 km network</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">FARE REVENUE</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">rides × blended fare</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">NON-FARE REVENUE</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">the layer most candidates forget</text>
  </g>
  <path d="M185 138 L185 154 M100 154 L270 154 M100 154 L100 170 M270 154 L270 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M420 154 L650 154 M420 154 L420 170 M535 154 L535 170 M650 154 L650 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">RIDERSHIP</text>
    <text x="100" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">commuters: 1.5M × 2 legs</text>
    <text x="100" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">occasional: 0.5M × ~1 leg</text>
    <text x="100" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 3.5M rides/day</text>
    <text x="100" y="260" font-size="8" fill="hsl(var(--muted-foreground))">~12% of city rides daily</text>
    <rect x="190" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FARE MIX</text>
    <text x="270" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">pass-holders ~60% at ~₹26 eff.</text>
    <text x="270" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">single tickets ~40% at ~₹42</text>
    <text x="270" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">blended ≈ ₹32</text>
    <text x="270" y="260" font-size="8" fill="hsl(var(--muted-foreground))">slabs ₹10–60 by distance</text>
    <rect x="375" y="172" width="100" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="425" y="192" font-size="9" font-weight="700" fill="hsl(var(--foreground))">ADVERTISING</text>
    <text x="425" y="209" font-size="8" fill="hsl(var(--muted-foreground))">train wraps ·</text>
    <text x="425" y="222" font-size="8" fill="hsl(var(--muted-foreground))">station naming</text>
    <text x="425" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹1 cr/day</text>
    <rect x="485" y="172" width="100" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="192" font-size="9" font-weight="700" fill="hsl(var(--foreground))">RETAIL RENTS</text>
    <text x="535" y="209" font-size="8" fill="hsl(var(--muted-foreground))">station shops ·</text>
    <text x="535" y="222" font-size="8" fill="hsl(var(--muted-foreground))">kiosks · F&amp;B</text>
    <text x="535" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹0.8 cr/day</text>
    <rect x="595" y="172" width="100" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="645" y="192" font-size="9" font-weight="700" fill="hsl(var(--foreground))">PARKING +</text>
    <text x="645" y="209" font-size="8" fill="hsl(var(--muted-foreground))">feeder buses ·</text>
    <text x="645" y="222" font-size="8" fill="hsl(var(--muted-foreground))">consulting fees</text>
    <text x="645" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹0.4 cr/day</text>
  </g>
  <path d="M100 276 L100 294 M270 276 L270 294 M100 294 L270 294 M185 294 L185 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M425 276 L425 294 M535 276 L535 294 M645 276 L645 294 M425 294 L645 294 M535 294 L535 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="333" font-size="10" font-weight="700" fill="hsl(var(--primary))">3.5M × ₹32 ≈ ₹11.2 cr/day</text>
    <text x="185" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">fare line</text>
    <rect x="425" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="333" font-size="10" font-weight="700" fill="hsl(var(--foreground))">1 + 0.8 + 0.4 ≈ ₹2.2 cr/day</text>
    <text x="535" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">non-fare ≈ 20% of fare</text>
  </g>
  <path d="M185 356 L185 378 M535 356 L535 378 M185 378 L535 378 M360 378 L360 394" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="396" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="415" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹13–14 CR / DAY (~₹4,800 cr/yr)</text>
  <text x="360" y="432" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">right order of magnitude for a major Indian metro topline</text>
  <text x="360" y="476" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Punchline: fares rarely cover debt service — non-fare and land monetization are strategic, not decorative.</text>
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
