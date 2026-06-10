import type { Page } from '@/lib/casebook/types';

export const paintConsumptionIndia: Page = {
  slug: 'guesstimates/paint-consumption-india',
  title: 'Paint consumed in India per year',
  subtitle: 'Stock × repaint cycle + new construction — a surface-area problem.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['stock-and-flow', 'physical-rates'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual decorative paint consumption in India (litres). This is a **surface-area** problem wearing a market-sizing costume: housing stock × paintable area × repaint frequency, plus the new-construction flow. (Industrial/auto coatings excluded — clarify that upfront.)' },
    { type: 'svg', maxWidth: 640, ariaLabel: 'Paint demand from existing housing stock repaint cycles plus new construction, converted through coverage rates', caption: 'Stock (repaints) + flow (new construction), converted via litres-per-100-m² coverage.', svg: `<svg viewBox="0 0 640 260" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="pcng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <g text-anchor="middle">
    <rect x="40" y="24" width="260" height="100" rx="10" fill="url(#pcng)"/>
    <text x="170" y="46" font-size="10" font-weight="700" fill="#ffffff">REPAINT (STOCK)</text>
    <text x="170" y="64" font-size="9" fill="#b9c4d6">~220M paint-using homes ×</text>
    <text x="170" y="78" font-size="9" fill="#b9c4d6">~180 m² paintable ÷ 7-yr cycle</text>
    <text x="170" y="92" font-size="9" fill="#b9c4d6">× ~8L per 100 m² (2 coats)</text>
    <text x="170" y="112" font-size="11" font-weight="700" fill="#ffffff">≈ 450M L/yr</text>
    <rect x="340" y="24" width="260" height="100" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="470" y="46" font-size="10" font-weight="700" fill="hsl(var(--primary))">NEW BUILD (FLOW)</text>
    <text x="470" y="64" font-size="9" fill="hsl(var(--muted-foreground))">~8M new units/yr × 180 m²</text>
    <text x="470" y="78" font-size="9" fill="hsl(var(--muted-foreground))">× 8L/100m² + commercial/</text>
    <text x="470" y="92" font-size="9" fill="hsl(var(--muted-foreground))">institutional ≈ +30%</text>
    <text x="470" y="112" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ 150M L/yr</text>
  </g>
  <path d="M170 124 L170 154 M470 124 L470 154 M170 154 L470 154 M320 154 L320 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="170" y="180" width="300" height="40" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
  <text x="320" y="205" text-anchor="middle" font-size="11" font-weight="700" fill="hsl(var(--primary))">≈ 600M LITRES / YEAR</text>
  <text x="320" y="242" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Value check: ~600M L × ~₹230/L ≈ ₹14,000 cr retail decorative — right zone for the reported market.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Stock', md: '~300M households; ~220M live in paintable pucca homes. Paintable area (walls + ceiling, interior + some exterior) ≈ **180 m²** for a modest home.' },
      { title: 'Repaint cycle', md: 'Urban affluent every 4–5 years (festivals, weddings); rural 10+ → blended **~7 years**.' },
      { title: 'Coverage', md: 'Two coats ≈ **8 litres per 100 m²** → ~14.4 L per home per repaint.' },
      { title: 'Repaint demand', md: '220M ÷ 7 ≈ 31M homes/yr × 14.4 L ≈ **450M litres**.' },
      { title: 'New construction', md: '~8M new units + commercial/institutional ≈ **+150M litres** → total **~600M litres/yr**.' },
    ]},
    { type: 'mathBox', md: '(220M ÷ 7 × 14.4L) + 150M ≈ 450M + 150M = **600M L/yr** ≈ ₹14k cr retail' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The repaint **cycle** is the sensitivity to flag: one year shorter (7→6) adds ~75M litres — which is why paint companies advertise around festivals: they\'re not selling colour, they\'re compressing the repaint cycle.' },
  ],
};
