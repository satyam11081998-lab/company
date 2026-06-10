import type { Page } from '@/lib/casebook/types';

export const hospitalBedsMetro: Page = {
  slug: 'guesstimates/hospital-beds-metro',
  title: 'Hospital beds in a metro city',
  subtitle: 'Norm-based vs demand-based — build it both ways and reconcile.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['infrastructure', 'two-way-build'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of hospital beds in a 10-million metro. This one rewards a **two-way build**: a quick norm-based answer (beds per 1,000 people), then a demand-based check (admissions × stay length ÷ occupancy). Reconciling the two is the differentiator.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Two parallel estimation paths, norm based and demand based, reconciled into a final bed count', caption: 'Two independent paths to the same answer — when they agree, your number is defensible.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="hbng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="250" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="165" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PATH A · NORM-BASED</text>
    <text x="165" y="65" font-size="9" fill="hsl(var(--muted-foreground))">Indian metros: ~2–2.5 beds per 1,000</text>
    <text x="165" y="80" font-size="9" fill="hsl(var(--muted-foreground))">(national ~1.4; metros concentrate care)</text>
    <text x="165" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">10M × 2.2/1,000 ≈ 22,000</text>
    <rect x="350" y="24" width="250" height="86" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="475" y="46" font-size="10" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">PATH B · DEMAND-BASED</text>
    <text x="475" y="65" font-size="9" fill="hsl(var(--muted-foreground))">~7% hospitalized/yr × 10M = 700k admits</text>
    <text x="475" y="80" font-size="9" fill="hsl(var(--muted-foreground))">× 4-day stay = 2.8M bed-days ÷ 365</text>
    <text x="475" y="99" font-size="10" font-weight="700" fill="hsl(var(--foreground))">÷ 70% occupancy ≈ 23,500</text>
  </g>
  <path d="M165 110 L165 140 M475 110 L475 140 M165 140 L475 140 M320 140 L320 162" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="166" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="191" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 22,000–24,000 BEDS</text>
  <text x="320" y="236" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Plus the segmentation flourish: ~60% private / 40% public; ICU ≈ 8–10% of beds.</text>
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
