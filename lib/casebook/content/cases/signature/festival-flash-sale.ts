import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const festivalFlashSale: Page = {
  slug: 'cases/signature/festival-flash-sale',
  title: 'Should the Flash Sale Be Smaller?',
  subtitle: 'Ops, economics, and customer experience collide on the year\'s biggest day.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Signature · Operations × Economics', readingTimeMin: 11, tags: ['e-commerce', 'operations', 'blended'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client, a top-3 Indian e-commerce marketplace, runs an annual festival flash-sale week that generates 22% of annual GMV. Last year the week also produced: 9% order cancellations (vs 3% normal), delivery times of 8–11 days (vs 2–3), a courier-network meltdown, and a measurable dip in repeat-purchase rates among first-time festival customers. The COO asks a heretical question: **should we deliberately cap the sale?**' },
    ]},
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'The question behind the question: does the marginal festival order create or destroy value once fulfilment degrades? I need three things: the contribution of a festival order versus normal, the cost of the degradation (cancellations, support, re-delivery), and the LTV effect on customers who had a bad first experience.', note: 'Reframes "cap or not" into "find where the marginal order turns value-negative" — that\'s the analytical move the case wants.' },
        { speaker: 'interviewer', md: 'Festival orders average ₹1,450 AOV at 6% contribution after discounts and logistics — versus 11% normally. A cancelled order costs ~₹70 in logistics and support. First-time festival customers with delayed orders repeat at 18% over six months versus 34% for on-time.' },
        { speaker: 'candidate', md: 'So festival orders are *already* half-margin, and the tail of them — the ones that overflow capacity — carry cancellation costs and an LTV penalty. The structure: find the capacity threshold where degradation begins, price the degradation per order beyond it, and then design the better answer — because the real options aren\'t binary cap/no-cap; they\'re *shaping* demand and *flexing* capacity.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Framed the marginal festival order as create-or-destroy value: find the capacity threshold where fulfilment degrades, then price the degradation tail.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Marginal-order value curve crossing negative past a 24 lakh per day capacity threshold, demand shaping and capacity flexing panels, a flattening math tier stretching 6 days to 10 with peak 38 lakh falling to 26 against threshold plus surge of 27.6 lakh, an LTV preservation row of 35 to 60 crore, and a cap-velocity verdict bar', caption: 'The marginal-order curve, then the flattening math — 10 staggered days put the modelled peak under threshold + surge, preserving ₹35–60 cr of LTV.', svg: `<svg viewBox="0 0 720 555" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ffng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ffng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">SHOULD WE CAP THE SALE?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">find where the marginal order turns value-negative — then manage both sides of the line</text>
  <path d="M80 274 L640 274 M80 274 L80 104" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <text x="640" y="292" text-anchor="end" font-size="9" fill="hsl(var(--muted-foreground))">orders per day →</text>
  <path d="M80 184 C200 174, 300 172, 380 176 C440 180, 470 199, 520 234 C550 256, 590 268, 630 276" fill="none" stroke="hsl(var(--primary))" stroke-width="2.5"/>
  <path d="M420 104 L420 274" stroke="hsl(var(--border-strong))" stroke-width="1.5" stroke-dasharray="6 4"/>
  <text x="420" y="96" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CAPACITY THRESHOLD (~24L orders/day)</text>
  <text x="240" y="159" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">+₹87/order contribution</text>
  <text x="240" y="174" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">on-time · 3% cancels · LTV intact</text>
  <text x="555" y="174" text-anchor="middle" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">marginal order ≈ −₹15 to −₹60</text>
  <text x="555" y="189" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">cancels ×3 · support load ·</text>
  <text x="555" y="202" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">LTV penalty on first-timers</text>
  <g text-anchor="middle">
    <rect x="80" y="300" width="270" height="50" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">SHAPE DEMAND (left of the line)</text>
    <text x="215" y="333" font-size="8.5" fill="hsl(var(--muted-foreground))">stagger deals by category/day · early access tiers ·</text>
    <text x="215" y="344" font-size="8.5" fill="hsl(var(--muted-foreground))">honest delivery promises at checkout</text>
    <rect x="370" y="300" width="270" height="50" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">FLEX CAPACITY (move the line right)</text>
    <text x="505" y="333" font-size="8.5" fill="hsl(var(--muted-foreground))">pre-positioned inventory · gig-fleet surge contracts ·</text>
    <text x="505" y="344" font-size="8.5" fill="hsl(var(--muted-foreground))">seller-fulfilled lanes · slow-delivery-with-reward option</text>
  </g>
  <path d="M215 350 L215 364 M505 350 L505 364" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="366" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="215" y="384" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FLATTEN: 6 → 10 DAYS</text>
    <text x="215" y="400" font-size="8.5" fill="hsl(var(--muted-foreground))">31L/day avg → 18.6L · peak 38L → ~26L</text>
    <text x="215" y="420" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">vs 24L + 15% surge = 27.6L ✓</text>
    <rect x="385" y="366" width="240" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="384" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">LTV PRESERVED</text>
    <text x="505" y="400" font-size="8.5" fill="hsl(var(--muted-foreground))">~24L first-timers keep the 34% repeat rate</text>
    <text x="505" y="420" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹35–60 cr future contribution</text>
  </g>
  <path d="M215 430 L215 446 M505 430 L505 446 M215 446 L505 446 M360 446 L360 460" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="462" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="481" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">CAP VELOCITY, NOT REVENUE — SAME GMV, FLATTER CURVE</text>
  <text x="360" y="498" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">pre-position top-500 SKUs on wishlist data · ₹50-credit slow lane · courier surge contracted at 130%</text>
  <text x="360" y="536" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Past the threshold, marginal volume taxes every other order — flatten the peak, never shrink the area under the curve.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Price the degradation. Last year: 31 lakh orders/day average across the week against your 24 lakh threshold; first-time customers were 35% of festival orders.' },
        { speaker: 'candidate', md: 'Seven lakh orders a day ran "hot." Direct costs: cancellation delta 6% × ₹70 ≈ ₹4 per hot order — small. The LTV term dominates: 35% first-timers × (34% − 18%) repeat-rate drop × say ₹260 contribution per future repeat ≈ ₹15 per hot order — and that\'s one repeat cycle only; compounding cohorts make it ₹25–40. So each over-threshold order earns ₹87 of contribution but burns ₹20–45 of future value, plus brand drag we haven\'t priced. The marginal order is still weakly positive on paper — but barely, and the *average* customer experience degrades for everyone, including the 24 lakh below the line. That externality is the real argument.', note: 'The subtle point: over-capacity orders damage other orders\' experience too — a congestion externality, like the airline case\'s network effects inverted.' },
        { speaker: 'interviewer', md: 'So — cap or not? The CEO will want one sentence.' },
        { speaker: 'candidate', md: '"Don\'t cap revenue; cap *velocity* — spread the same GMV across more days and pre-sold slots, and the problem dissolves." Concretely: extend the event from 6 to 10 days with category-staggered deal drops; sell delivery-date slots at checkout (with a small reward for choosing the slow lane); pre-position the top-500 SKUs in regional warehouses based on wishlist data; and contract gig-courier surge capacity at 130% of last year. GMV holds or grows, the peak flattens under the threshold.' },
      ]},
      { type: 'reveal', summary: 'Reveal the flattening math', blocks: [
        { type: 'mathBox', title: 'Same GMV, flatter curve', md: 'Last year: 31L/day × 6 days = 186L orders, peak 38L\nPlan: 10 days, staggered → 18.6L/day average, modelled peak ~26L vs threshold 24L + surge capacity 15% → 27.6L ✓\nDegradation costs ≈ eliminated; LTV recovery on ~24L first-timers ≈ ₹35–60 cr of future contribution preserved.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the COO', items: [
        'Reject the binary: cap velocity, not revenue — stretch to 10 days with category-staggered drops and pre-booked delivery slots.',
        'Pre-position top SKUs regionally using wishlist signals; contract courier surge to 130% of last year\'s peak.',
        'Offer an incentivized slow lane ("get it in 6 days, earn ₹50 credit") — customers self-sort, and the credit is cheaper than a cancellation.',
        'Track the festival on contribution *including LTV deltas* per cohort, not GMV — make the externality visible in the metric the org optimizes.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Past a capacity threshold, marginal volume taxes every other order — a congestion externality most GMV-obsessed metrics never see. The elegant answer to "should we do less?" is usually "do the same, **differently distributed**" — flatten the peak, don\'t shrink the area under the curve.' },
    ]},
  ],
};
