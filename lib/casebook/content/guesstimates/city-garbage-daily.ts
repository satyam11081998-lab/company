import type { Page } from '@/lib/casebook/types';

export const cityGarbageDaily: Page = {
  slug: 'guesstimates/city-garbage-daily',
  title: 'Garbage generated daily by a metro city',
  subtitle: 'Per-capita physical rates — and the non-household half people miss.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['physical-rates', 'public-systems'] },
  blocks: [
    { type: 'prose', md: 'Estimate the tonnes of municipal solid waste a 12-million metro generates daily. Anchor on a per-capita physical rate, then remember the half most candidates forget: **commercial, market, and construction waste** isn\'t in anyone\'s kitchen bin.' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Waste estimation from household per capita rates plus commercial institutional and construction streams', caption: 'Household waste is only ~55–60% of the city\'s stream — markets, restaurants, offices, and debris make the rest.', svg: `<svg viewBox="0 0 640 250" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="cgng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="260" height="96" rx="10" fill="url(#cgng)"/>
    <text x="170" y="48" font-size="10" font-weight="700" fill="#ffffff">HOUSEHOLD STREAM</text>
    <text x="170" y="67" font-size="9" fill="#b9c4d6">12M × ~0.45 kg/person/day</text>
    <text x="170" y="82" font-size="9" fill="#b9c4d6">(income-weighted: 0.3 low → 0.7 high)</text>
    <text x="170" y="104" font-size="11" font-weight="700" fill="#ffffff">≈ 5,400 tonnes</text>
    <rect x="340" y="24" width="260" height="96" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="470" y="48" font-size="10" font-weight="700" fill="hsl(var(--primary))">NON-HOUSEHOLD</text>
    <text x="470" y="67" font-size="9" fill="hsl(var(--muted-foreground))">restaurants, hotels, markets ≈ 1,800t ·</text>
    <text x="470" y="82" font-size="9" fill="hsl(var(--muted-foreground))">offices/institutions ≈ 900t · street</text>
    <text x="470" y="96" font-size="9" fill="hsl(var(--muted-foreground))">sweeping + C&amp;D fines ≈ 1,200t</text>
    <text x="470" y="113" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ 3,900 tonnes</text>
  </g>
  <path d="M170 120 L170 150 M470 120 L470 150 M170 150 L470 150 M320 150 L320 172" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="176" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="201" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 9,000–9,500 TONNES / DAY</text>
  <text x="320" y="236" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Logistics check: at 7 tonnes/truck-trip, that's ~1,300 truck trips a day — why landfills sit at city edges.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Household rate', md: 'Indian urban per-capita ≈ 0.3 kg (low-income) to 0.7 kg (high-income, more packaging); blended **~0.45 kg** → 12M × 0.45 = **5,400 t/day**.' },
      { title: 'Commercial', md: 'Restaurants, hotels, vegetable markets (huge wet-waste generators) ≈ **+1,800 t**.' },
      { title: 'Institutional + streets', md: 'Offices, schools, hospitals ~900 t; street sweeping, drain silt, small construction debris ~1,200 t.' },
      { title: 'Total', md: '**≈ 9,300 tonnes/day** — matching the reported 8–11K range for Indian megacities.' },
    ]},
    { type: 'mathBox', md: '12M × 0.45kg + 3,900t non-household ≈ **9,300 t/day** ≈ 1,300 truck trips' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Per-capita waste scales with **income** (packaging, food delivery), not just population — stating the 0.3–0.7 kg gradient shows real understanding. The truck-trips conversion makes the number tangible and sets up any follow-on question about waste-management economics.' },
  ],
};
