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
      { type: 'svg', maxWidth: 720, ariaLabel: 'Donor funnel from 2.8 crore eligible to 3.2 lakh donors with 12 percent repeat, two strategy panels, a three-stream bridge tier adding 1.5 lakh repeat, 0.6 lakh replacement-convert and 0.9 lakh new units, and a gap-closed verdict bar', caption: 'The funnel, the two strategies, and the bridge — three quantified streams that sum to the 3 lakh gap.', svg: `<svg viewBox="0 0 720 475" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <linearGradient id="bdng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
    <marker id="bdar" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto"><path d="M0,0 L8,4.5 L0,9 Z" fill="hsl(var(--border-strong))"/></marker>
  </defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#bdng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">4 LAKH → 7 LAKH UNITS, 3 YEARS</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">no price lever — a behavioural funnel; barely 1.1% of the eligible ever donate</text>
  <g text-anchor="middle">
    <rect x="35" y="78" width="120" height="70" rx="9" fill="url(#bdng)"/>
    <text x="95" y="102" font-size="9.5" font-weight="700" fill="#ffffff">ELIGIBLE</text>
    <text x="95" y="119" font-size="9" fill="#b9c4d6">2.8 crore</text>
    <text x="95" y="134" font-size="8" fill="#b9c4d6">age 18–65, healthy</text>
    <rect x="175" y="78" width="120" height="70" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="235" y="102" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">AWARE + NEAR</text>
    <text x="235" y="119" font-size="8.5" fill="hsl(var(--muted-foreground))">camps reach 15–20%</text>
    <text x="235" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">of districts well</text>
    <rect x="315" y="78" width="120" height="70" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="375" y="102" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">WILLING</text>
    <text x="375" y="119" font-size="8.5" fill="hsl(var(--muted-foreground))">fear · myths ·</text>
    <text x="375" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">"weakness" beliefs</text>
    <rect x="455" y="78" width="120" height="70" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="515" y="102" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FIRST DONATION</text>
    <text x="515" y="119" font-size="8.5" fill="hsl(var(--muted-foreground))">~3.2 lakh unique</text>
    <text x="515" y="134" font-size="8.5" fill="hsl(var(--muted-foreground))">donors (1.1%)</text>
    <rect x="595" y="78" width="100" height="70" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
    <text x="645" y="102" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">REPEAT</text>
    <text x="645" y="119" font-size="8.5" fill="hsl(var(--muted-foreground))">only 12%</text>
    <text x="645" y="134" font-size="9" font-weight="700" fill="hsl(var(--primary))">← the lever</text>
  </g>
  <path d="M155 113 L171 113" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M295 113 L311 113" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M435 113 L451 113" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M575 113 L591 113" stroke="hsl(var(--border-strong))" stroke-width="1.75" marker-end="url(#bdar)"/>
  <path d="M375 148 L375 162 M200 162 L520 162 M200 162 L200 174 M520 162 L520 174" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="60" y="176" width="280" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="200" y="197" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">WIDEN THE TOP (slower, costlier)</text>
    <text x="200" y="215" font-size="8.5" fill="hsl(var(--muted-foreground))">institutional camps: colleges, factories, police,</text>
    <text x="200" y="229" font-size="8.5" fill="hsl(var(--muted-foreground))">temples · myth-busting via ASHA workers ·</text>
    <text x="200" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">employer half-day-leave mandate</text>
    <rect x="380" y="176" width="280" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="520" y="197" font-size="9.5" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--primary))">DEEPEN REPEAT (faster, cheaper)</text>
    <text x="520" y="215" font-size="8.5" fill="hsl(var(--muted-foreground))">donor registry + SMS recall at 90-day eligibility ·</text>
    <text x="520" y="229" font-size="8.5" fill="hsl(var(--muted-foreground))">donate-near-home micro-camps · recognition tiers ·</text>
    <text x="520" y="243" font-size="8.5" fill="hsl(var(--muted-foreground))">family blood-assurance card for 3+/yr donors</text>
  </g>
  <path d="M200 254 L200 270 M520 254 L520 270 M135 270 L585 270 M135 270 L135 284 M360 270 L360 284 M585 270 L585 284" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="286" width="210" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="304" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REPEAT ENGINE</text>
    <text x="135" y="320" font-size="8.5" fill="hsl(var(--muted-foreground))">3.2L registry: 12% → 40% repeat</text>
    <text x="135" y="340" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+1.4–1.6 lakh units</text>
    <rect x="255" y="286" width="210" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="304" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">REPLACEMENT CONVERT</text>
    <text x="360" y="320" font-size="8.5" fill="hsl(var(--muted-foreground))">25% of 1.8L/yr enrolled at the bedside</text>
    <text x="360" y="340" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+0.5–0.7 lakh</text>
    <rect x="480" y="286" width="210" height="64" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="304" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">NEW FIRST-TIMERS</text>
    <text x="585" y="320" font-size="8.5" fill="hsl(var(--muted-foreground))">institutional camps on an annual calendar</text>
    <text x="585" y="340" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">+0.8–1.0 lakh by yr 3</text>
  </g>
  <path d="M135 350 L135 366 M360 350 L360 366 M585 350 L585 366 M135 366 L585 366 M360 366 L360 380" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="382" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="401" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">+2.7–3.3 LAKH — THE 3 LAKH GAP CLOSES</text>
  <text x="360" y="418" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">registry + SMS recall first · expand cold-chain and testing in step · track wastage % as a co-equal KPI</text>
  <text x="360" y="452" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Retention beats acquisition in social programmes for the same reason it does in subscriptions — the cheapest unit comes from someone already convinced.</text>
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
