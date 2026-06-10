import type { Page } from '@/lib/casebook/types';

export const cabRidesMetro: Page = {
  slug: 'guesstimates/cab-rides-metro',
  title: 'App-based cab rides per day in a metro',
  subtitle: 'Demand build with a supply-side reconciliation.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['two-way-build', 'transport'] },
  blocks: [
    { type: 'prose', md: 'Estimate daily app-based cab rides (Uber/Ola-style, four-wheelers) in a 10-million metro. Do it demand-side, then **reconcile against driver supply** — if your demand number implies each driver does 40 rides a day, your demand number is wrong.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Two fully unpacked builds: demand from user base split into frequent and occasional riders, supply from fleet count times rides per driver day, reconciled into the final range', caption: 'Both builds unpacked to their leaves — when two independent trees land within 10%, the number is defensible.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="crng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#crng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">APP-CAB RIDES / DAY · 10M METRO</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">demand build × supply ceiling — both must agree</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">PATH A · DEMAND</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">users × frequency, segmented</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">PATH B · SUPPLY</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">fleet × driver productivity</text>
  </g>
  <path d="M185 138 L185 154 M100 154 L270 154 M100 154 L100 170 M270 154 L270 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M450 154 L620 154 M450 154 L450 170 M620 154 L620 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FREQUENT · 20%</text>
    <text x="100" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">300k users: daily office</text>
    <text x="100" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">commuters, airport-heavy</text>
    <text x="100" y="237" font-size="8.5" fill="hsl(var(--muted-foreground))">travellers × ~1.2 rides/day</text>
    <text x="100" y="259" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 360k rides</text>
    <rect x="190" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OCCASIONAL · 80%</text>
    <text x="270" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">1.2M users: weekend</text>
    <text x="270" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">outings, rain days, late</text>
    <text x="270" y="237" font-size="8.5" fill="hsl(var(--muted-foreground))">nights × ~0.15 rides/day</text>
    <text x="270" y="259" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 180k rides</text>
    <rect x="370" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">ACTIVE FLEET</text>
    <text x="450" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">~60k registered cabs ×</text>
    <text x="450" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">~75% active on a given day</text>
    <text x="450" y="259" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 45k cabs</text>
    <rect x="540" y="172" width="160" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">RIDES / DRIVER-DAY</text>
    <text x="620" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">9-hr shift · ~40 min/ride</text>
    <text x="620" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">incl. deadhead + idle ·</text>
    <text x="620" y="237" font-size="8.5" fill="hsl(var(--muted-foreground))">part-timers drag average</text>
    <text x="620" y="259" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 12 rides</text>
  </g>
  <path d="M100 276 L100 294 M270 276 L270 294 M100 294 L270 294 M185 294 L185 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 276 L450 294 M620 276 L620 294 M450 294 L620 294 M535 294 L535 312" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="333" font-size="10" font-weight="700" fill="hsl(var(--primary))">360k + 180k = 540k/day</text>
    <text x="185" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">what riders want</text>
    <rect x="425" y="314" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="333" font-size="10" font-weight="700" fill="hsl(var(--foreground))">45k × 12 = 540k/day</text>
    <text x="535" y="348" font-size="8.5" fill="hsl(var(--muted-foreground))">what drivers can serve ✓</text>
  </g>
  <path d="M185 356 L185 378 M535 356 L535 378 M185 378 L535 378 M360 378 L360 394" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="396" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="415" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 5–5.5 LAKH RIDES / DAY</text>
  <text x="360" y="432" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">doubles on rainy Fridays, halves on holiday mornings</text>
  <text x="360" y="474" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">When the two trees disagree, the gap is the finding: unserved demand (surge) or idle supply (driver churn).</text>
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
