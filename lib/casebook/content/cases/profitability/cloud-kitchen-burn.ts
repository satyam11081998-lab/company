import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const cloudKitchenBurn: Page = {
  slug: 'cases/profitability/cloud-kitchen-burn',
  title: 'The Cloud Kitchen That Grows and Bleeds',
  subtitle: 'Orders double every year. So do the losses.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Profitability', readingTimeMin: 9, tags: ['unit-economics', 'food-delivery'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client runs 25 cloud kitchens across three metros, selling four house brands exclusively through food-delivery apps. Order volume has doubled for two consecutive years, yet the company has never made money and losses are widening. The founder wants a path to profitability within 12 months.' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Three clarifications. Is the loss widening in absolute terms only, or is the loss *per order* also widening? Are all 25 kitchens loss-making, or is there a spread? And are we free to change channels — for example, our own app or dine-in — or must we stay on the aggregators?' },
        { speaker: 'interviewer', md: 'Loss per order is roughly flat, around ₹18. About a third of kitchens are contribution-positive. Channels are open to discussion, but 95% of demand currently comes from two aggregators.' },
        { speaker: 'candidate', md: 'Flat loss per order with doubling volume means we are scaling a broken unit economic — fixed costs are not the story. I\'ll focus on the per-order P&L first, then use the spread between good and bad kitchens as a natural experiment.', note: 'Restates what the data implies before structuring — this is what separates a hypothesis-led candidate.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Established flat loss-per-order against doubling volume — a broken unit economic, not a fixed-cost story — and set up the per-order P&L plus a good-vs-bad-kitchen comparison.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'Build the order-level P&L, then split the network: what do the contribution-positive kitchens do differently?' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Order-level profit and loss waterfall from 380 rupee order value through commission, discounts, food cost, packaging and kitchen opex to minus 18 rupees contribution, followed by break-even density math of 218 orders per day and a good versus bad kitchen comparison', caption: 'The order P&L waterfall, then the density band — ₹87 pre-opex contribution vs ₹19k/day opex makes the whole case arithmetic.', svg: `<svg viewBox="0 0 720 560" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ckng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ckng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">ORDER P&amp;L → DENSITY MATH</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">loss/order flat at −₹18 while volume doubles — fix the order, then the divisor</text>
  <rect x="20" y="80" width="92" height="170" rx="8" fill="url(#ckng)"/>
  <text x="66" y="105" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">AOV</text>
  <text x="66" y="120" text-anchor="middle" font-size="9" fill="#b9c4d6">₹380</text>
  <rect x="132" y="80" width="92" height="48" rx="8" fill="hsl(var(--primary))" opacity="0.85"/>
  <text x="178" y="100" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">COMMISSION</text>
  <text x="178" y="114" text-anchor="middle" font-size="9" fill="#ffffff">−₹95 (25%)</text>
  <rect x="244" y="128" width="92" height="34" rx="8" fill="hsl(var(--primary))" opacity="0.7"/>
  <text x="290" y="143" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">DISCOUNTS</text>
  <text x="290" y="156" text-anchor="middle" font-size="9" fill="#ffffff">−₹45</text>
  <rect x="356" y="162" width="92" height="60" rx="8" fill="hsl(var(--primary))" opacity="0.55"/>
  <text x="402" y="185" text-anchor="middle" font-size="9.5" font-weight="700" fill="#ffffff">FOOD COGS</text>
  <text x="402" y="199" text-anchor="middle" font-size="9" fill="#ffffff">−₹125 (33%)</text>
  <rect x="468" y="222" width="92" height="26" rx="8" fill="hsl(var(--primary))" opacity="0.4"/>
  <text x="514" y="234" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PACKAGING</text>
  <text x="514" y="245" text-anchor="middle" font-size="9" fill="hsl(var(--foreground))">−₹28</text>
  <rect x="580" y="248" width="92" height="40" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="626" y="264" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">KITCHEN OPEX</text>
  <text x="626" y="278" text-anchor="middle" font-size="9" fill="hsl(var(--muted-foreground))">−₹105/order</text>
  <path d="M112 250 L580 250" stroke="hsl(var(--border-strong))" stroke-width="1" stroke-dasharray="4 4"/>
  <text x="626" y="302" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">= −₹18/order</text>
  <path d="M360 252 L360 296 M135 296 L585 296 M135 296 L135 310 M360 296 L360 310 M585 296 L585 310" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="312" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="330" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">PRE-OPEX CONTRIBUTION</text>
    <text x="135" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">380 − 95 − 45 − 125 − 28</text>
    <text x="135" y="362" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹87 / order</text>
    <rect x="255" y="312" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="330" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">KITCHEN OPEX</text>
    <text x="360" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">rent + 8 staff, semi-fixed</text>
    <text x="360" y="362" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹19,000 / day</text>
    <rect x="480" y="312" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="330" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">BREAK-EVEN DENSITY</text>
    <text x="585" y="346" font-size="8.5" fill="hsl(var(--muted-foreground))">19,000 ÷ 87</text>
    <text x="585" y="362" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ 218 orders / day</text>
  </g>
  <path d="M135 370 L135 384 M360 370 L360 384 M585 370 L585 384 M135 384 L585 384 M215 384 L215 398 M505 384 L505 398" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="400" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="418" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">POSITIVE THIRD · 210/day</text>
    <text x="215" y="434" font-size="8.5" fill="hsl(var(--muted-foreground))">same commission, COGS, discounts</text>
    <text x="215" y="450" font-size="10" font-weight="700" fill="hsl(var(--primary))">87 × 210 ≈ ₹18.3k — clears opex ✓</text>
    <rect x="385" y="400" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="418" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">NEGATIVE REST · 90/day</text>
    <text x="505" y="434" font-size="8.5" fill="hsl(var(--muted-foreground))">87 × 90 = ₹7,830 vs ₹19,000</text>
    <text x="505" y="450" font-size="10" font-weight="700" fill="hsl(var(--primary))">−₹11,170 / day per weak kitchen</text>
  </g>
  <path d="M215 458 L215 472 M505 458 L505 472 M215 472 L505 472 M360 472 L360 484" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="486" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="505" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">CLEAR ~220 ORDERS/DAY — OR SHRINK FORMAT, OR CLOSE</text>
  <text x="360" y="522" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">ramp dense micro-markets · 2-brand/4-staff thin markets · exit the bottom ~5</text>
  <text x="360" y="552" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Commission + discounts take ₹140 of a ₹380 order before food is cooked — yet survivors and casualties differ only in density.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Here\'s the twist: the contribution-positive kitchens have the *same* commission, COGS, and discounts. What could they be doing differently?' },
        { speaker: 'candidate', md: 'If the per-order lines are identical, the difference must be the divisor — order density. Kitchen opex is semi-fixed, so kitchens doing more orders per day spread rent and staff thinner. I\'d check orders per kitchen per day across the network.', note: 'Works the only remaining free variable instead of guessing.' },
        { speaker: 'interviewer', md: 'Correct. Positive kitchens average 210 orders/day; negative ones average 90. Staffing is nearly identical across both.' },
        { speaker: 'candidate', md: 'So the model works at ~200 orders/day and fails at 90. The question becomes: can the 90-order kitchens get to 200, or should they close? I\'d segment them — some are young and ramping, some are in micro-markets that will never support four brands, and some may have an operational issue like poor app ratings.' },
      ]},
      { type: 'reveal', summary: 'Reveal the worked economics', blocks: [
        { type: 'mathBox', title: 'Break-even density', md: 'Pre-opex contribution = 380 − 95 − 45 − 125 − 28 = **₹87/order**\nKitchen opex ≈ ₹19,000/day (rent + 8 staff)\nBreak-even = 19,000 ÷ 87 ≈ **~218 orders/day**\nAt 90 orders: 87 × 90 = ₹7,830 vs ₹19,000 → **−₹11,170/day per weak kitchen**' },
        { type: 'prose', md: 'The 12-month path is now arithmetic: every kitchen must clear ~220 orders/day or shrink its opex (shared staffing, smaller footprint, fewer brands) — or close.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the founder', items: [
        'Triage the 17 sub-scale kitchens: ramp (marketing push, brand mix change) the ones in dense micro-markets; convert thin markets to a 2-brand, 4-staff format; exit the bottom ~5.',
        'Attack the ₹140 aggregator take: negotiate volume-tiered commissions and shift the top 10% repeat customers to a direct-order channel with a loyalty hook.',
        'Cut discounts from blanket to surgical — fund them only on first orders and dead hours, not on repeat orders that would come anyway.',
        'Make **orders/kitchen/day** the operating metric the network is run on; review weekly.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When loss **per unit** is flat while volume scales, fixed-cost dilution is not coming to save you. Find the *density* or *take-rate* lever — and use the spread between good and bad units as your fastest diagnostic.' },
    ]},
  ],
};
