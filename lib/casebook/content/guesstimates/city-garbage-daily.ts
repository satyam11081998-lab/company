import type { Page } from '@/lib/casebook/types';

export const cityGarbageDaily: Page = {
  slug: 'guesstimates/city-garbage-daily',
  title: 'Garbage generated daily by a metro city',
  subtitle: 'Per-capita physical rates — and the non-household half people miss.',
  kind: 'guesstimate',
  meta: { difficulty: 'moderate', readingTimeMin: 5, tags: ['physical-rates', 'public-systems'] },
  blocks: [
    { type: 'prose', md: 'Estimate the tonnes of municipal solid waste a 12-million metro generates daily. Anchor on a per-capita physical rate, then remember the half most candidates forget: **commercial, market, and construction waste** isn\'t in anyone\'s kitchen bin.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree: household stream split by income band with per-capita rates, plus commercial, institutional and street/construction streams each sized, summed with a truck-logistics conversion', caption: 'Households split by income band (waste scales with income), plus the three non-household streams — then the truck check.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="cgng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#cgng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">MSW / DAY · 12M METRO</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">household stream + the half people forget</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">HOUSEHOLD ≈ 58%</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">per-capita rate scales with income</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">NON-HOUSEHOLD ≈ 42%</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">none of this comes from kitchen bins</text>
  </g>
  <path d="M185 138 L185 154 M75 154 L295 154 M75 154 L75 170 M185 154 L185 170 M295 154 L295 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M425 154 L645 154 M425 154 L425 170 M535 154 L535 170 M645 154 L645 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="75" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">LOW-INCOME 40%</text>
    <text x="75" y="208" font-size="8" fill="hsl(var(--muted-foreground))">4.8M × 0.3 kg</text>
    <text x="75" y="222" font-size="8" fill="hsl(var(--muted-foreground))">little packaging</text>
    <text x="75" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1,450 t</text>
    <rect x="130" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="185" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">MIDDLE 45%</text>
    <text x="185" y="208" font-size="8" fill="hsl(var(--muted-foreground))">5.4M × 0.5 kg</text>
    <text x="185" y="222" font-size="8" fill="hsl(var(--muted-foreground))">packaged goods era</text>
    <text x="185" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">2,700 t</text>
    <rect x="240" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="295" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">HIGH 15%</text>
    <text x="295" y="208" font-size="8" fill="hsl(var(--muted-foreground))">1.8M × 0.7 kg</text>
    <text x="295" y="222" font-size="8" fill="hsl(var(--muted-foreground))">delivery boxes, e-waste</text>
    <text x="295" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1,250 t</text>
    <rect x="370" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="425" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">COMMERCIAL</text>
    <text x="425" y="208" font-size="8" fill="hsl(var(--muted-foreground))">restaurants, hotels,</text>
    <text x="425" y="222" font-size="8" fill="hsl(var(--muted-foreground))">vegetable markets (wet)</text>
    <text x="425" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1,800 t</text>
    <rect x="480" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="535" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">INSTITUTIONAL</text>
    <text x="535" y="208" font-size="8" fill="hsl(var(--muted-foreground))">offices, schools,</text>
    <text x="535" y="222" font-size="8" fill="hsl(var(--muted-foreground))">hospitals</text>
    <text x="535" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">900 t</text>
    <rect x="590" y="172" width="110" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="645" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">STREETS + C&amp;D</text>
    <text x="645" y="208" font-size="8" fill="hsl(var(--muted-foreground))">sweeping, drain silt,</text>
    <text x="645" y="222" font-size="8" fill="hsl(var(--muted-foreground))">small construction debris</text>
    <text x="645" y="244" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">1,200 t</text>
  </g>
  <path d="M75 272 L75 290 M185 272 L185 290 M295 272 L295 290 M75 290 L295 290 M185 290 L185 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M425 272 L425 290 M535 272 L535 290 M645 272 L645 290 M425 290 L645 290 M535 290 L535 306" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="85" y="308" width="200" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="333" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 5,400 t household</text>
    <rect x="435" y="308" width="200" height="40" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="333" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 3,900 t non-household</text>
  </g>
  <path d="M185 348 L185 370 M535 348 L535 370 M185 370 L535 370 M360 370 L360 386" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="388" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="407" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 9,300 TONNES / DAY</text>
  <text x="360" y="424" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">Indian megacities report 8–11k t/day ✓</text>
  <path d="M360 432 L360 448" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="160" y="450" width="400" height="48" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="469" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOGISTICS CONVERSION</text>
    <text x="360" y="486" font-size="8.5" fill="hsl(var(--muted-foreground))">÷ 7 t/truck-trip ≈ 1,300 trips/day — why landfills sit at city edges and transfer stations exist</text>
  </g>
  <text x="360" y="528" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Waste scales with income, not just headcount — the 0.3→0.7 kg gradient is the insight to state.</text>
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
