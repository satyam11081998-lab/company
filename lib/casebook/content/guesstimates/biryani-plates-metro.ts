import type { Page } from '@/lib/casebook/types';

export const biryaniPlatesMetro: Page = {
  slug: 'guesstimates/biryani-plates-metro',
  title: 'Biryani plates sold daily in a metro',
  subtitle: 'Demand-side build with an occasion-frequency twist.',
  kind: 'guesstimate',
  meta: { difficulty: 'easy', readingTimeMin: 5, tags: ['consumption', 'frequency'] },
  blocks: [
    { type: 'prose', md: 'Estimate the number of biryani plates sold per day in a 10-million-person metro (restaurants + delivery + street, *commercially sold* only — home cooking excluded). The key structuring move: estimate **eating-out occasions first**, then biryani\'s share of them.' },
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', title: 'Clarifying questions before building the tree', turns: [
        { speaker: 'candidate', md: 'Two scope locks before I build. We count *commercially sold* plates only — restaurants, delivery, street — excluding home cooking? And one plate = one ordered portion, veg or non-veg?', note: 'Home-cooked biryani dwarfs commercial volume; excluding it is the single biggest scope call.' },
        { speaker: 'interviewer', md: 'Yes — commercial only, any type, one ordered portion.' },
        { speaker: 'candidate', md: 'And the metro is ~10 million, counted on a typical day, not a festival or weekend peak?' },
        { speaker: 'interviewer', md: 'Typical day, 10M.' },
        { speaker: 'candidate', md: 'Then I’ll size eating-out *occasions* first, take biryani’s share of them, and sanity-check against restaurant supply.', note: 'Occasions are the honest denominator; ‘% who eat biryani’ overshoots.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Commercial-only scope, the plate unit, a typical day, and an occasions-first structure — the difference between a grounded number and one inflated by home cooking.' },
    ]},
    { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree from metro population through commercial eaters split by occupation, meal frequency per segment, biryani share, to plates per day with a supply-side cross-check', caption: 'Population → eater segments → occasions per segment → biryani share → plates. The supply branch cross-checks the answer.', svg: `<svg viewBox="0 0 720 520" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="bpng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#bpng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">BIRYANI PLATES / DAY</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">10M metro · commercially sold only</text>
  <path d="M360 60 L360 76 M185 76 L535 76 M185 76 L185 92 M535 76 L535 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="55" y="94" width="260" height="50" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">DEMAND BUILD</text>
    <text x="185" y="131" font-size="9" fill="hsl(var(--muted-foreground))">eaters × occasions × biryani share</text>
    <rect x="405" y="94" width="260" height="50" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="535" y="114" font-size="10.5" font-weight="700" fill="hsl(var(--foreground))">SUPPLY CROSS-CHECK</text>
    <text x="535" y="131" font-size="9" fill="hsl(var(--muted-foreground))">outlets × plates per outlet</text>
  </g>
  <path d="M185 144 L185 160 M100 160 L270 160 M100 160 L100 176 M270 160 L270 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M535 144 L535 160 M460 160 L610 160 M460 160 L460 176 M610 160 L610 176" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="20" y="178" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="100" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OFFICE-GOERS ~3M</text>
    <text x="100" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">lunch out + delivery habit</text>
    <text x="100" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">~0.8 commercial meals/day</text>
    <text x="100" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">2.4M meals</text>
    <text x="100" y="264" font-size="8" fill="hsl(var(--muted-foreground))">(the heavy half)</text>
    <rect x="190" y="178" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="270" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OTHERS ~3M</text>
    <text x="270" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">students, homemakers, elderly</text>
    <text x="270" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">~0.2 commercial meals/day</text>
    <text x="270" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">0.6M meals</text>
    <text x="270" y="264" font-size="8" fill="hsl(var(--muted-foreground))">(4M residents eat ~only at home)</text>
    <rect x="380" y="178" width="160" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="460" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OUTLETS SERVING</text>
    <text x="460" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">~50k eateries citywide</text>
    <text x="460" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">× ~30% have biryani on menu</text>
    <text x="460" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">≈ 15,000 outlets</text>
    <rect x="550" y="178" width="150" height="100" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="625" y="197" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PLATES / OUTLET</text>
    <text x="625" y="214" font-size="8.5" fill="hsl(var(--muted-foreground))">specialists ~80/day × 10%</text>
    <text x="625" y="228" font-size="8.5" fill="hsl(var(--muted-foreground))">generalists ~13/day × 90%</text>
    <text x="625" y="248" font-size="10" font-weight="700" fill="hsl(var(--primary))">avg ≈ 20/day</text>
  </g>
  <path d="M100 278 L100 296 M270 278 L270 296 M100 296 L270 296 M185 296 L185 314" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <path d="M460 278 L460 296 M625 278 L625 296 M460 296 L625 296 M542 296 L542 314" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="65" y="316" width="240" height="56" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="185" y="335" font-size="10" font-weight="700" fill="hsl(var(--primary))">3M meals × 9% biryani share</text>
    <text x="185" y="351" font-size="8.5" fill="hsl(var(--muted-foreground))">top-3 ordered dish; weight delivery higher</text>
    <text x="185" y="365" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 2.7 lakh plates</text>
    <rect x="422" y="316" width="240" height="56" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="542" y="335" font-size="10" font-weight="700" fill="hsl(var(--foreground))">15,000 × 20 plates</text>
    <text x="542" y="351" font-size="8.5" fill="hsl(var(--muted-foreground))">independent supply-side route</text>
    <text x="542" y="365" font-size="10" font-weight="700" fill="hsl(var(--foreground))">≈ 3.0 lakh plates ✓</text>
  </g>
  <path d="M185 372 L185 394 M542 372 L542 394 M185 394 L542 394 M360 394 L360 412" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="190" y="414" width="340" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="433" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">≈ 2.5–3 LAKH PLATES / DAY</text>
  <text x="360" y="450" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">≈ ₹6–8 crore/day at ₹250 average per plate</text>
  <text x="360" y="492" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Two independent routes landing within 10% of each other — that convergence is the defense.</text>
</svg>` },
    { type: 'steps', ordered: true, items: [
      { title: 'Who eats commercially', md: '10M people; exclude very young children and strictly-home eaters → ~**6M** people in the commercial-food market.' },
      { title: 'Occasions', md: 'Office lunches, dinners out, delivery — averages to ~**0.5 commercial meals/person/day** (heavy for office-goers, light for homemakers/elderly) → **3M meals/day**.' },
      { title: 'Biryani\'s share', md: 'Consistently a top-ordered dish; weight delivery higher → **8–10%** of commercial meals → **~2.7 lakh plates**.' },
      { title: 'Sanity check (supply side)', md: '~15,000 biryani-serving outlets × ~20 plates/day ≈ **3 lakh** — the two sides agree.' },
    ]},
    { type: 'mathBox', md: '6M eaters × 0.5 meals × 9% biryani ≈ **2.7 lakh plates/day** (≈ ₹6–8 cr/day at ₹250/plate)' },
    { type: 'callout', variant: 'tip', title: 'How to defend it', md: 'The interviewer will attack the **0.5 meals/day**. Defend it as a weighted average: ~3M office-goers at ~0.8 (lunch + frequent delivery) and ~3M others at ~0.2. Always be ready to decompose any blended rate you state.' },
  ],
};
