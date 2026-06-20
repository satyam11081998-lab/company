import type { Page } from '@/lib/casebook/types';

export const paintConsumptionIndia: Page = {
  slug: 'guesstimates/paint-consumption-india',
  title: 'Paint consumed in India per year',
  subtitle: 'Stock × repaint cycle + new construction — a surface-area problem.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['stock-and-flow', 'physical-rates'] },
  blocks: [
    { type: 'prose', md: 'Estimate annual decorative paint consumption in India (litres). This is a **surface-area** problem wearing a market-sizing costume: housing stock × paintable area × repaint frequency, plus the new-construction flow. (Industrial/auto coatings excluded — clarify that upfront.)' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Scope, since it’s wide: *decorative* paint only — excluding industrial and automotive coatings — in litres, and including both repaint of existing stock and new construction?', note: 'Industrial/auto coatings are a different market; excluding them keeps the build clean.' },
        { speaker: 'interviewer', md: 'Decorative only, litres, both repaint and new build.' },
        { speaker: 'candidate', md: 'All India, a typical year?' },
        { speaker: 'interviewer', md: 'Yes.' },
        { speaker: 'candidate', md: 'Then it’s a surface-area problem: housing stock × paintable area × repaint frequency, plus the new-construction flow.', note: 'Reframes a market-sizing question as the surface-area build it really is.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Decorative-only scope, litres, both repaint and new build — and a surface-area (stock × area × frequency) structure.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier stock-and-flow tree: repaint branch from housing stock through paintable area, urban and rural repaint cycles, and coverage rate; new-build branch from units and commercial construction; summed with value check', caption: 'Stock branch (repaints, with the urban/rural cycle split) + flow branch (new build) — every node carries its number.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="pcng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#pcng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">PAINT CONSUMED / YEAR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">decorative only · stock (repaint) + flow (new build)</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">REPAINT · THE STOCK</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">~75% of demand lives here</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--foreground))">NEW BUILD · THE FLOW</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">construction adds fresh surface</text>
  </g>
  <path d="M185 138 L185 154 M75 154 L295 154 M75 154 L75 170 M185 154 L185 170 M295 154 L295 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M450 154 L620 154 M450 154 L450 170 M620 154 L620 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="110" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="75" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">PAINTABLE STOCK</text>
    <text x="75" y="208" font-size="8" fill="hsl(var(--muted-foreground))">300M homes →</text>
    <text x="75" y="221" font-size="8" fill="hsl(var(--muted-foreground))">~220M pucca</text>
    <text x="75" y="234" font-size="8" fill="hsl(var(--muted-foreground))">× ~180 m² each</text>
    <text x="75" y="256" font-size="9" font-weight="700" fill="hsl(var(--primary))">40B m²</text>
    <rect x="130" y="172" width="110" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.3"/>
    <text x="185" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--primary))">REPAINT CYCLE</text>
    <text x="185" y="208" font-size="8" fill="hsl(var(--muted-foreground))">urban 80M @ ~5 yr</text>
    <text x="185" y="221" font-size="8" fill="hsl(var(--muted-foreground))">(festivals, weddings)</text>
    <text x="185" y="234" font-size="8" fill="hsl(var(--muted-foreground))">rural 140M @ ~9 yr</text>
    <text x="185" y="256" font-size="9" font-weight="700" fill="hsl(var(--primary))">blended ≈ 7 yr</text>
    <rect x="240" y="172" width="110" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="295" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">COVERAGE RATE</text>
    <text x="295" y="208" font-size="8" fill="hsl(var(--muted-foreground))">2 coats ≈ 8 L</text>
    <text x="295" y="221" font-size="8" fill="hsl(var(--muted-foreground))">per 100 m²</text>
    <text x="295" y="234" font-size="8" fill="hsl(var(--muted-foreground))">→ 14.4 L/home</text>
    <text x="295" y="256" font-size="9" font-weight="700" fill="hsl(var(--primary))">per repaint</text>
    <rect x="395" y="172" width="110" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">NEW HOMES</text>
    <text x="450" y="208" font-size="8" fill="hsl(var(--muted-foreground))">~8M units/yr</text>
    <text x="450" y="221" font-size="8" fill="hsl(var(--muted-foreground))">× 180 m² × 8L/100m²</text>
    <text x="450" y="234" font-size="8" fill="hsl(var(--muted-foreground))">(primer + 2 coats)</text>
    <text x="450" y="256" font-size="9" font-weight="700" fill="hsl(var(--primary))">≈ 115M L</text>
    <rect x="565" y="172" width="110" height="104" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="192" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">COMMERCIAL +</text>
    <text x="620" y="208" font-size="8" fill="hsl(var(--muted-foreground))">offices, retail,</text>
    <text x="620" y="221" font-size="8" fill="hsl(var(--muted-foreground))">institutions ≈ +30%</text>
    <text x="620" y="234" font-size="8" fill="hsl(var(--muted-foreground))">of new-build line</text>
    <text x="620" y="256" font-size="9" font-weight="700" fill="hsl(var(--primary))">≈ 35M L</text>
  </g>
  <path d="M75 276 L75 294 M185 276 L185 294 M295 276 L295 294 M75 294 L295 294 M185 294 L185 310" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 276 L450 294 M620 276 L620 294 M450 294 L620 294 M535 294 L535 310" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="312" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="331" font-size="10" font-weight="700" fill="hsl(var(--primary))">220M÷7 × 14.4L ≈ 450M L/yr</text>
    <text x="185" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">~31M homes repaint each year</text>
    <rect x="425" y="312" width="220" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="331" font-size="10" font-weight="700" fill="hsl(var(--foreground))">115 + 35 ≈ 150M L/yr</text>
    <text x="535" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">new-surface demand</text>
  </g>
  <path d="M185 354 L185 376 M535 354 L535 376 M185 376 L535 376 M360 376 L360 392" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="394" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="413" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 600M LITRES / YEAR</text>
  <text x="360" y="430" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~₹230/L ≈ ₹14,000 cr retail decorative — matches the reported market</text>
  <text x="360" y="472" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sensitivity: cycle 7→6 yrs adds ~75M L — which is why paint ads cluster around festivals: they compress the cycle.</text>
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
