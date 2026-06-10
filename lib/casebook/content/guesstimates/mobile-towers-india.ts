import type { Page } from '@/lib/casebook/types';

export const mobileTowersIndia: Page = {
  slug: 'guesstimates/mobile-towers-india',
  title: 'Mobile towers in India',
  subtitle: 'Coverage-based vs capacity-based — geography meets traffic.',
  kind: 'guesstimate',
  meta: { difficulty: 'challenging', readingTimeMin: 6, tags: ['infrastructure', 'coverage-capacity'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of mobile towers in India. Towers are built for two different reasons: **coverage** (rural — one tower blankets a radius) and **capacity** (urban — towers added because spectrum saturates). Build the two separately; adding them is the answer.' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree splitting towers into rural coverage-driven and urban capacity-driven branches, each unpacked into area, radius, subscribers and per-tower capacity, summed with a tenancy clarification', caption: 'Two physics, fully unpacked: rural towers cover land, urban towers carry traffic. Sum the branches, then clarify the unit.', svg: `<svg viewBox="0 0 720 540" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="mtng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#mtng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">MOBILE TOWERS IN INDIA</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">coverage problem + capacity problem</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="185" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">RURAL · COVERAGE-DRIVEN</text>
    <text x="185" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">one tower must blanket a radius</text>
    <rect x="405" y="94" width="260" height="44" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="113" font-size="10" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">URBAN · CAPACITY-DRIVEN</text>
    <text x="535" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">spectrum saturates; towers added for load</text>
  </g>
  <path d="M185 138 L185 154 M100 154 L270 154 M100 154 L100 170 M270 154 L270 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 138 L535 154 M450 154 L620 154 M450 154 L450 170 M620 154 L620 170" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AREA TO COVER</text>
    <text x="100" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">India 3.3M km² minus</text>
    <text x="100" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">desert/high mountain/forest</text>
    <text x="100" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 2.2M km² inhabited</text>
    <rect x="190" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">COVERAGE PER TOWER</text>
    <text x="270" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">~3.5 km radius → π r² ≈ 38 km²</text>
    <text x="270" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">halve for terrain + overlap</text>
    <text x="270" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 19 km² effective</text>
    <rect x="370" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="450" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">URBAN SUBSCRIBERS</text>
    <text x="450" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">~500M urbanites ×</text>
    <text x="450" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">~1.1 active SIMs each</text>
    <text x="450" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 550M connections</text>
    <rect x="540" y="172" width="160" height="96" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="620" y="192" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LOAD PER TOWER</text>
    <text x="620" y="209" font-size="8.5" fill="hsl(var(--muted-foreground))">data-era practical limit</text>
    <text x="620" y="223" font-size="8.5" fill="hsl(var(--muted-foreground))">~1,500–2,000 users/site</text>
    <text x="620" y="244" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 1,700 blended</text>
  </g>
  <path d="M100 268 L100 286 M270 268 L270 286 M100 286 L270 286 M185 286 L185 304" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M450 268 L450 286 M620 268 L620 286 M450 286 L620 286 M535 286 L535 304" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="75" y="306" width="220" height="44" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="325" font-size="10" font-weight="700" fill="hsl(var(--primary))">2.2M ÷ 19 ≈ 115k towers</text>
    <text x="185" y="341" font-size="8.5" fill="hsl(var(--muted-foreground))">rural floor, traffic-independent</text>
    <rect x="425" y="306" width="220" height="44" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="535" y="325" font-size="10" font-weight="700" fill="hsl(var(--primary))">550M ÷ 1,700 ≈ 325k towers</text>
    <text x="535" y="341" font-size="8.5" fill="hsl(var(--muted-foreground))">grows with data demand</text>
  </g>
  <path d="M185 350 L185 372 M535 350 L535 372 M185 372 L535 372 M360 372 L360 388" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="390" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="409" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 4.4 LAKH TOWERS</text>
  <text x="360" y="426" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">× 1.8 operator tenancy ≈ 8 lakh BTS "sites" — define the unit before answering</text>
  <text x="360" y="466" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Opening line that wins the question: "rural is a coverage problem, urban is a capacity problem — I'll size them separately."</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Split the problem', md: 'Rural towers exist to *cover area*; urban towers exist to *carry traffic*. One formula cannot serve both.' },
      { title: 'Rural', md: 'Inhabited/farmed area ~2.2M km²; a rural tower covers ~3–4 km radius ≈ 38 km² → ~60K minimum grid; terrain, overlap, and operator duplication roughly double it → **~120K**.' },
      { title: 'Urban', md: '~550M urban SIM users; a saturated urban tower serves ~1,500–2,000 concurrent-capable users → **~300–350K**.' },
      { title: 'Total', md: '120K + 325K ≈ **~4.5 lakh towers** (close to the published ~8 lakh *BTS sites* counting multi-operator tenancy — define your unit out loud).' },
    ]},
    { type: 'mathBox', md: 'Rural 2.2M km² ÷ 38 km² × 2 ≈ 115k · Urban 550M ÷ 1,700 ≈ 325k → **≈ 4.4 lakh towers**' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'Two defensive moves: state the **coverage vs capacity** split as your opening line (it\'s the insight), and define the unit — tower, site, or antenna — before estimating. Ambiguous units are how good guesstimates get marked wrong.' },
  ],
};
