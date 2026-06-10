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
      { type: 'svg', maxWidth: 720, ariaLabel: 'Economic value waterfall from downtime value of 31.7 lakh and repair premium of 6.3 lakh to a 38 lakh pain pool, 60 percent prevented equals 22.8 lakh, split 70-30 between customer and client, then a rate-card tier building 699 rupees per loom per month with volume tiers of 700 then 560, and a verdict bar', caption: 'The EVC waterfall, extended to the rate card — pool → prevention → split → metric → tiers. Every number is the build.', svg: `<svg viewBox="0 0 720 565" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="iong" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#iong)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">NO REFERENCE PRICE — BUILD IT</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">quantify the pain pool, prevent a share, split the surplus, choose the metric</text>
  <path d="M360 60 L360 70 M215 70 L505 70 M215 70 L215 82 M505 70 L505 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="95" y="84" width="240" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="106" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">DOWNTIME VALUE</text>
    <text x="215" y="124" font-size="8.5" fill="hsl(var(--muted-foreground))">80 looms × 22 hrs × ₹1,800/hr</text>
    <text x="215" y="148" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹31.7 lakh/yr</text>
    <rect x="385" y="84" width="240" height="84" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="106" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REPAIR PREMIUM</text>
    <text x="505" y="124" font-size="8.5" fill="hsl(var(--muted-foreground))">70 events × (₹15,000 − ₹6,000)</text>
    <text x="505" y="148" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹6.3 lakh/yr</text>
  </g>
  <path d="M215 168 L215 182 M505 168 L505 182 M215 182 L505 182 M360 182 L360 194" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="196" width="300" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="213" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">PAIN POOL ≈ ₹38 LAKH / MILL / YR</text>
    <text x="360" y="229" font-size="8.5" fill="hsl(var(--muted-foreground))">total addressable pain</text>
  </g>
  <path d="M360 238 L360 250" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="210" y="252" width="300" height="42" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="269" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">× 60% PREVENTED = ₹22.8 LAKH / YR</text>
    <text x="360" y="285" font-size="8.5" fill="hsl(var(--muted-foreground))">the surplus the product creates per mill</text>
  </g>
  <path d="M360 294 L360 306 M215 306 L505 306 M215 306 L215 318 M505 306 L505 318" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="320" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CUSTOMER KEEPS ~70%</text>
    <text x="215" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">"pay ₹6.8L, save ₹23L" — trivial ROI pitch</text>
    <text x="215" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹16 lakh/yr — the reason to sign</text>
    <rect x="385" y="320" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">CLIENT CAPTURES ~30%</text>
    <text x="505" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">rises toward 40–50% at renewal, on proof</text>
    <text x="505" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹6.84 lakh/yr/mill</text>
  </g>
  <path d="M215 378 L215 394 M505 378 L505 394" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="396" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="414" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">METRIC BUILD</text>
    <text x="215" y="430" font-size="8.5" fill="hsl(var(--muted-foreground))">₹6.84L ÷ 80 looms ÷ 12 = ₹712</text>
    <text x="215" y="446" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">price: ₹699 / loom / month</text>
    <rect x="385" y="396" width="240" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="414" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">VOLUME TIERS, NOT DISCOUNTS</text>
    <text x="505" y="430" font-size="8.5" fill="hsl(var(--muted-foreground))">first 200 looms @ ₹700 · beyond @ ₹560</text>
    <text x="505" y="446" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">effective ~₹590, headline intact</text>
  </g>
  <path d="M215 454 L215 470 M505 454 L505 470 M215 470 L505 470 M360 470 L360 482" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="484" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="503" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">₹699 / LOOM / MONTH — SUBSCRIPTION, HARDWARE IN</text>
  <text x="360" y="520" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">opex not capex · scales with mill size · recurring base a future acquirer pays for</text>
  <text x="360" y="552" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Sanity check: ₹3,000/loom hardware amortizes in under 5 months. The metric is as strategic as the number.</text>
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
