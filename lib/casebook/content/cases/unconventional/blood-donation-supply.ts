import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const bloodDonationSupply: Page = {
  slug: 'cases/unconventional/blood-donation-supply',
  title: 'Double the State\'s Blood Donations',
  subtitle: 'A social-sector funnel case — no price lever, all behaviour.',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Unconventional', readingTimeMin: 8, tags: ['social-sector', 'funnel', 'behaviour'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'A state health department collects 4 lakh units of blood annually against an estimated need of 7 lakh. Paid donation is illegal; imports between states are limited. The health secretary asks you to design a programme to close the gap within three years.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Supply problems without a price lever become funnel problems: eligible population → aware → willing → actually donates → donates *again*. Two clarifications: how does the 4 lakh split between voluntary camps and "replacement" donation by patients\' relatives? And what\'s the repeat-donation rate among voluntary donors?' },
        { speaker: 'interviewer', md: '55% voluntary camps, 45% replacement. Repeat rate among voluntary donors: 12% donate more than once a year. Eligible population in the state: roughly 2.8 crore.', note: 'A 12% repeat rate is the buried treasure — a repeat donor costs almost nothing to re-acquire.' },
        { speaker: 'candidate', md: 'Then notice the arithmetic before structuring: 4 lakh units from ~3.2 lakh unique donors out of 2.8 crore eligible — barely 1.1% participation. We don\'t need to convert the masses; we need either +1 percentage point of first-timers, or to move the repeat rate from 12% toward 40%. The repeat lever is cheaper — these people already cleared every barrier once.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 700, ariaLabel: 'Donor funnel from eligible population through awareness, willingness, first donation and repeat donation, with the repeat stage highlighted as the highest-leverage fix', caption: 'The funnel: 2.8 crore eligible shrinks to 3.2 lakh donors. The cheapest new unit comes from someone who already donated.', svg: `<svg viewBox="0 0 700 330" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="bdcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="bdng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <marker id="bdar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>
  <g text-anchor="middle">
    <rect x="25" y="40" width="120" height="70" rx="10" fill="url(#bdng)" filter="url(#bdcs)"/>
    <text x="85" y="65" font-size="9.5" font-weight="700" fill="#ffffff">ELIGIBLE</text>
    <text x="85" y="82" font-size="9" fill="#b9c4d6">2.8 crore</text>
    <text x="85" y="97" font-size="8" fill="#b9c4d6">age 18–65, healthy</text>
    <rect x="165" y="40" width="120" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#bdcs)"/>
    <text x="225" y="65" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AWARE + NEAR</text>
    <text x="225" y="82" font-size="9" fill="hsl(var(--muted-foreground))">camps reach maybe</text>
    <text x="225" y="97" font-size="9" fill="hsl(var(--muted-foreground))">15–20% of districts well</text>
    <rect x="305" y="40" width="120" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#bdcs)"/>
    <text x="365" y="65" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">WILLING</text>
    <text x="365" y="82" font-size="9" fill="hsl(var(--muted-foreground))">fear · myths ·</text>
    <text x="365" y="97" font-size="9" fill="hsl(var(--muted-foreground))">"weakness" beliefs</text>
    <rect x="445" y="40" width="120" height="70" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#bdcs)"/>
    <text x="505" y="65" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FIRST DONATION</text>
    <text x="505" y="82" font-size="9" fill="hsl(var(--muted-foreground))">~3.2 lakh unique</text>
    <text x="505" y="97" font-size="9" fill="hsl(var(--muted-foreground))">donors (1.1%)</text>
    <rect x="585" y="40" width="100" height="70" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="2" filter="url(#bdcs)"/>
    <text x="635" y="65" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">REPEAT</text>
    <text x="635" y="82" font-size="9" fill="hsl(var(--muted-foreground))">only 12%</text>
    <text x="635" y="97" font-size="9" font-weight="700" fill="hsl(var(--primary))">← the lever</text>
  </g>
  <path d="M145 75 L161 75" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M285 75 L301 75" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M425 75 L441 75" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M565 75 L581 75" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <g text-anchor="middle">
    <rect x="60" y="150" width="280" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#bdcs)"/>
    <text x="200" y="171" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">WIDEN THE TOP (slower, costlier)</text>
    <text x="200" y="189" font-size="9" fill="hsl(var(--muted-foreground))">institutional camps: colleges, factories, police,</text>
    <text x="200" y="203" font-size="9" fill="hsl(var(--muted-foreground))">temples · myth-busting via ASHA workers ·</text>
    <text x="200" y="217" font-size="9" fill="hsl(var(--muted-foreground))">employer half-day-leave mandate</text>
    <rect x="360" y="150" width="280" height="78" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.75" filter="url(#bdcs)"/>
    <text x="500" y="171" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">DEEPEN REPEAT (faster, cheaper)</text>
    <text x="500" y="189" font-size="9" fill="hsl(var(--muted-foreground))">donor registry + SMS recall at 90-day eligibility ·</text>
    <text x="500" y="203" font-size="9" fill="hsl(var(--muted-foreground))">donate-near-home micro-camps · recognition tiers ·</text>
    <text x="500" y="217" font-size="9" fill="hsl(var(--muted-foreground))">family blood-assurance card for 3+/yr donors</text>
  </g>
  <text x="350" y="265" text-anchor="middle" font-size="10" font-weight="700" fill="hsl(var(--primary))">12% → 40% repeat ≈ +1.5 lakh units — half the gap, from people already convinced</text>
  <text x="350" y="300" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">Replacement donation (45%) also converts: every relative who donates once is a warm registry lead.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Build the three-year bridge from 4 to 7 lakh units.' },
        { speaker: 'candidate', md: 'Three streams. Repeat: 3.2 lakh registered donors, repeat rate 12% → 40% via SMS recall and micro-camps adds ~1.4–1.6 lakh units. Replacement conversion: 1.8 lakh replacement donors a year are *already in the building* — converting 25% into registry donors adds ~0.5–0.7 lakh. New first-timers: institutional camps in colleges and uniformed services, +0.8–1.0 lakh by year 3. Total: +2.7–3.3 lakh — the 3 lakh gap closes, with repeat as the engine, not posters.', note: 'Three quantified streams that sum to the target — a bridge, not a wish list.' },
        { speaker: 'interviewer', md: 'What\'s the binding constraint nobody mentions?' },
        { speaker: 'candidate', md: 'Collection and storage capacity. Doubling donations means doubling camp logistics, cold-chain capacity, and testing throughput — if a donor shows up and waits two hours, you lose the repeat. I\'d audit blood-bank processing capacity in parallel and stage the demand generation to match; wastage (expired units) should be tracked as a KPI alongside collection, since mismatch shows up there first.' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the health secretary', items: [
        'Build the donor registry + 90-day SMS recall system first — the repeat lever (12% → 40%) is half the gap at a tenth of the cost of mass campaigns.',
        'Convert replacement donors at the bedside: enrol them into the registry at the moment of donation, with a family blood-assurance benefit as the hook.',
        'Run institutional camps on an annual calendar (colleges, police, factories) rather than ad-hoc drives — predictability builds the habit.',
        'Expand processing/cold-chain capacity in step, and track wastage % as a co-equal KPI with collections.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When price is off the table, structure supply as a **behavioural funnel** and hunt for the cheapest conversion: people who\'ve already done the behaviour once. Retention beats acquisition in social programmes for exactly the reason it does in subscription businesses.' },
    ]},
  ],
};
