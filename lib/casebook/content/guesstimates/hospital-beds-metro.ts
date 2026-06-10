import type { Page } from '@/lib/casebook/types';

export const hospitalBedsMetro: Page = {
  slug: 'guesstimates/hospital-beds-metro',
  title: 'Hospital beds in a metro city',
  subtitle: 'Norm-based vs demand-based — build it both ways and reconcile.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'two-way-build'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of hospital beds in a 10-million metro. This one rewards a **two-way build**: a quick norm-based answer (beds per 1,000 people), then a demand-based check (admissions × stay length ÷ occupancy). Reconciling the two is the differentiator.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Two parallel estimation paths each built in multiple tiers: norm-based beds per thousand, and demand-based from admissions, stay length, occupancy and referral catchment, reconciled into a final count with segmentation', caption: 'Both paths fully unpacked — Path B only matches Path A after the referral-catchment correction, which is the real insight.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="hbng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#hbng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">HOSPITAL BEDS · 10M METRO</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">two independent builds, reconciled</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="60" y="94" width="250" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="185" y="119" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PATH A · NORM-BASED</text>
    <rect x="410" y="94" width="250" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="119" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PATH B · DEMAND-BASED</text>
  </g>
  <path d="M185 134 L185 150 M535 134 L535 150 M460 150 L610 150 M460 150 L460 166 M610 150 L610 166" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="60" y="152" width="250" height="76" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="172" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BED-DENSITY NORM</text>
    <text x="185" y="189" font-size="8.5" fill="hsl(var(--muted-foreground))">national ~1.4/1,000 · metros concentrate</text>
    <text x="185" y="203" font-size="8.5" fill="hsl(var(--muted-foreground))">tertiary care → ~2.2/1,000</text>
    <text x="185" y="221" font-size="10" font-weight="700" fill="hsl(var(--primary))">10M × 2.2 ÷ 1,000 ≈ 22,000</text>
    <rect x="385" y="168" width="150" height="86" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="460" y="188" font-size="9" font-weight="700" fill="hsl(var(--foreground))">CITY DEMAND</text>
    <text x="460" y="204" font-size="8" fill="hsl(var(--muted-foreground))">7%/yr hospitalized</text>
    <text x="460" y="217" font-size="8" fill="hsl(var(--muted-foreground))">× 4-day stay = 2.8M</text>
    <text x="460" y="230" font-size="8" fill="hsl(var(--muted-foreground))">bed-days ÷ 365 ÷ 70% occ</text>
    <text x="460" y="246" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">≈ 11,000 beds</text>
    <rect x="555" y="168" width="150" height="86" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="630" y="188" font-size="9" font-weight="700" fill="hsl(var(--primary))">+ REFERRAL INFLOW</text>
    <text x="630" y="204" font-size="8" fill="hsl(var(--muted-foreground))">metros treat a catchment</text>
    <text x="630" y="217" font-size="8" fill="hsl(var(--muted-foreground))">~1.9× their own population</text>
    <text x="630" y="230" font-size="8" fill="hsl(var(--muted-foreground))">(surrounding districts)</text>
    <text x="630" y="246" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">× ~1.9 ≈ 21,000</text>
  </g>
  <path d="M185 228 L185 290 M460 254 L460 272 M630 254 L630 272 M460 272 L630 272 M545 272 L545 290 M185 290 L545 290 M360 290 L360 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <rect x="190" y="308" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="327" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 22,000–24,000 BEDS</text>
  <text x="360" y="344" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">paths agree only after the catchment fix — that reconciliation IS the answer</text>
  <path d="M360 352 L360 368 M150 368 L570 368 M150 368 L150 384 M360 368 L360 384 M570 368 L570 384" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="55" y="386" width="190" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="150" y="406" font-size="9" font-weight="700" fill="hsl(var(--foreground))">BY OWNERSHIP</text>
    <text x="150" y="423" font-size="8.5" fill="hsl(var(--muted-foreground))">~60% private (13–14k)</text>
    <text x="150" y="437" font-size="8.5" fill="hsl(var(--muted-foreground))">~40% public (9–10k)</text>
    <rect x="265" y="386" width="190" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="406" font-size="9" font-weight="700" fill="hsl(var(--foreground))">BY ACUITY</text>
    <text x="360" y="423" font-size="8.5" fill="hsl(var(--muted-foreground))">ICU ≈ 8–10% (~2k beds)</text>
    <text x="360" y="437" font-size="8.5" fill="hsl(var(--muted-foreground))">general ward the rest</text>
    <rect x="475" y="386" width="190" height="64" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="570" y="406" font-size="9" font-weight="700" fill="hsl(var(--foreground))">BY FACILITY SIZE</text>
    <text x="570" y="423" font-size="8.5" fill="hsl(var(--muted-foreground))">~40 large hospitals carry half;</text>
    <text x="570" y="437" font-size="8.5" fill="hsl(var(--muted-foreground))">~600 nursing homes the rest</text>
  </g>
  <text x="360" y="490" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">When two paths disagree, hunt the structural reason (here: referral catchment) — never fudge the midpoint.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Path A (norm)', md: 'Metro bed density ~2.2 per 1,000 (above the national ~1.4 because metros serve referral inflows) → 10M × 2.2/1,000 = **22,000**.' },
      { title: 'Path B (demand)', md: 'Hospitalization incidence ~7%/yr → 700K admissions × ~4-day average stay = 2.8M bed-days/yr ÷ 365 ≈ 7,700 occupied beds… ÷ 70% target occupancy ≈ **~11,000**? No — recompute: 2.8M ÷ 365 ≈ 7,670 average occupied; at 70% occupancy, installed = 7,670 ÷ 0.7 ≈ **~11,000 city-resident beds**; add ~50–100% referral inflow from surrounding districts (metros treat far more than their own population) → **~20,000+**.' },
      { title: 'Reconcile', md: 'The two paths agree only after counting referral inflow — that *is* the insight: metro hospitals serve a catchment 1.5–2× the city itself.' },
    ]},
    { type: 'mathBox', md: 'Norm: 10M × 2.2/1000 = 22k · Demand: (10M×7%×4 ÷ 365 ÷ 0.7) × ~1.9 catchment ≈ 21k → **≈ 22k beds**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The deliberate "mistake-and-repair" in Path B mirrors real interviews: if your two paths disagree, **hunt the structural reason** (here, referral catchment) instead of fudging a number. Naming why they diverged earns more credit than never diverging.' },
  ],
};
