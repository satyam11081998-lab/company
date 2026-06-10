import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const b2bIotSensor: Page = {
  slug: 'cases/pricing/b2b-iot-sensor',
  title: 'Pricing a Machine That Predicts Breakdowns',
  subtitle: 'No competitor, no reference price. Build the number from the customer\'s P&L.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Pricing', readingTimeMin: 10, tags: ['b2b', 'economic-value', 'new-product'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client built an IoT retrofit kit for textile-mill machinery: vibration and temperature sensors plus software that predicts loom failures 48 hours ahead. Pilot results: unplanned downtime cut by 60%. There is no direct competitor in India. The client asks: how do we price this — per sensor, per machine, per mill? And at what number?' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'With no reference price, this is economic-value pricing: quantify what a breakdown costs the mill, how much we prevent, and take a fair share of that. First — what does one hour of unplanned loom downtime cost a typical mill, and how many such hours do they suffer?' },
        { speaker: 'interviewer', md: 'A mid-size mill runs 80 looms. Each loom contributes about ₹1,800/hour. Unplanned downtime averages 22 hours per loom per year, plus each breakdown event costs ~₹15,000 in emergency repairs versus ₹6,000 planned. Typical mill: ~70 breakdown events a year.', note: 'Everything needed for an EVC (economic value to customer) build is now on the table. The case is won by doing this math cleanly.' },
        { speaker: 'candidate', md: 'I\'ll build the value pool per mill per year, apply our 60% prevention rate, then split that surplus between customer and client — B2B convention says the customer keeps the larger share, or adoption stalls. Then choose the **metric** (per loom/month) to scale naturally with mill size.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Economic value to customer waterfall: downtime savings plus repair savings form the value pool, split between customer share and vendor price', caption: 'EVC in one picture — compute the pool, prevent a share, split the surplus.', svg: `<svg viewBox="0 0 700 340" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="iocs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="iong" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <g text-anchor="middle">
    <rect x="30" y="30" width="190" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#iocs)"/>
    <text x="125" y="53" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">DOWNTIME VALUE</text>
    <text x="125" y="72" font-size="9.5" fill="hsl(var(--muted-foreground))">80 looms × 22 hrs × ₹1,800</text>
    <text x="125" y="92" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ ₹31.7 lakh/yr</text>
    <rect x="255" y="30" width="190" height="84" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#iocs)"/>
    <text x="350" y="53" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="hsl(var(--primary))">REPAIR PREMIUM</text>
    <text x="350" y="72" font-size="9.5" fill="hsl(var(--muted-foreground))">70 events × (15k − 6k)</text>
    <text x="350" y="92" font-size="11" font-weight="700" fill="hsl(var(--foreground))">≈ ₹6.3 lakh/yr</text>
    <rect x="480" y="30" width="190" height="84" rx="10" fill="url(#iong)" filter="url(#iocs)"/>
    <text x="575" y="53" font-size="9.5" font-weight="700" letter-spacing="0.06em" fill="#b9c4d6">PAIN POOL</text>
    <text x="575" y="72" font-size="9.5" fill="#b9c4d6">total addressable pain</text>
    <text x="575" y="92" font-size="11" font-weight="700" fill="#ffffff">≈ ₹38 lakh/yr</text>
  </g>
  <path d="M575 114 L575 140" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="390" y="144" width="280" height="50" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#iocs)"/>
    <text x="530" y="165" font-size="10" font-weight="700" fill="hsl(var(--primary))">× 60% PREVENTED = ₹22.8 LAKH/YR</text>
    <text x="530" y="182" font-size="9" fill="hsl(var(--muted-foreground))">the surplus our product creates per mill</text>
  </g>
  <path d="M530 194 L530 220" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="120" y="224" width="260" height="62" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#iocs)"/>
    <text x="250" y="247" font-size="10" font-weight="700" fill="hsl(var(--foreground))">CUSTOMER KEEPS ~70%</text>
    <text x="250" y="265" font-size="9" fill="hsl(var(--muted-foreground))">₹16 lakh/yr — the reason to sign</text>
    <rect x="420" y="224" width="260" height="62" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#iocs)"/>
    <text x="550" y="247" font-size="10" font-weight="700" fill="hsl(var(--primary))">CLIENT CAPTURES ~30%</text>
    <text x="550" y="265" font-size="9" fill="hsl(var(--muted-foreground))">₹6.8 lakh/yr/mill → ₹700/loom/month</text>
  </g>
  <text x="350" y="320" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Price metric = per loom per month: scales with value, lowers entry barrier, recurring by construction.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Why 30% capture and not 50%? And why per-loom-per-month instead of selling the hardware outright?' },
        { speaker: 'candidate', md: 'On the split: this is a new category sold to skeptical, cash-tight mills — the pilot proves value *we* believe; the buyer hasn\'t lived it yet. A 70/30 split in the customer\'s favour makes the ROI pitch trivial: "pay ₹6.8 lakh, save ₹23 lakh." As the category matures and trust builds, capture can rise toward 40–50% on renewals or premium tiers. On the metric: outright hardware sale caps revenue at one transaction and makes us a capex line competing with a new loom; per-loom-month is opex, scales with mill size, keeps us paid for the software\'s ongoing value, and builds a recurring base a future acquirer will pay for.', note: 'Two classic B2B pricing arguments: share-of-surplus calibrated to buyer risk, and metric chosen for adoption + recurring revenue.' },
        { speaker: 'interviewer', md: 'A large mill group with 1,200 looms demands 40% off. Respond.' },
        { speaker: 'candidate', md: 'Never discount the rate card 40% — it reprices the whole market through word of mouth. Instead: volume tiers built into the metric (e.g., ₹700 first 200 looms, ₹560 beyond), an enterprise SLA tier that *adds* value instead of cutting price, and multi-year lock-in as the concession currency. Headline rate survives; their effective rate lands near ₹590.' },
      ]},
      { type: 'reveal', summary: 'Reveal the full price build', blocks: [
        { type: 'mathBox', title: 'From value pool to rate card', md: 'Pool: 80 × 22 × ₹1,800 = ₹31.7L + 70 × ₹9,000 = ₹6.3L → **₹38L/mill/yr**\nPrevented: × 60% = **₹22.8L** · Client share × 30% = **₹6.84L/yr**\nMetric: ÷ 80 looms ÷ 12 = **₹712 → price ₹699/loom/month**\nSanity: hardware cost ₹3,000/loom amortizes in &lt;5 months ✓' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend', items: [
        'Price at ₹699 per loom per month, subscription including hardware, installation, and the prediction software — no upfront capex for the mill.',
        'Sell with the customer\'s own P&L: "keep ₹16 lakh of the ₹23 lakh we save you" — the 70/30 split is the sales pitch, not a concession.',
        'Handle large groups with volume tiers and SLA-tier upsells; never cut the headline rate.',
        'Re-anchor capture toward 40% at renewal once realized savings are in the customer\'s own data.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When there\'s no reference price, **build the customer\'s value pool and split it** — and remember the metric (per what?) is as strategic as the number. New-category B2B pricing buys adoption with a generous split, then earns capture back with proof.' },
    ]},
  ],
};
