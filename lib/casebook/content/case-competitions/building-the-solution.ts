import type { Page } from '@/lib/casebook/types';

export const buildingTheSolution: Page = {
  slug: 'case-competitions/building-the-solution',
  title: 'From analysis to solution — the architecture of a recommendation',
  subtitle: 'Issue tree → prioritised levers → one decisive recommendation with numbers attached.',
  kind: 'concept',
  meta: { difficulty: 'moderate', readingTimeMin: 11, tags: ['case-competitions', 'strategy', 'frameworks'] },
  blocks: [
    { type: 'hook', md: 'Losing teams present "three options for the client to consider." Winning teams say: **"We recommend B. Here is the math, here is the plan, and here is why A and C don\'t hold up."** Judges reward decisiveness — optionality reads as fear.' },
    { type: 'heading', level: 2, text: 'The build, in four moves' },
    { type: 'svg', maxWidth: 720, ariaLabel: 'Solution architecture flow in four bands: MECE issue tree, impact versus feasibility prioritisation, a three-pillar recommendation with financial spine, and roadmap with risks, ending in a verdict bar', caption: 'The architecture every winning deck shares — whatever the domain, this skeleton is underneath.', svg: `<svg viewBox="0 0 720 545" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="kpsl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#kpsl)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">SOLUTION ARCHITECTURE</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">structure → prioritise → recommend with numbers → de-risk</text>
  <path d="M360 60 L360 76" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="95" y="78" width="240" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="98" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">1 · STRUCTURE (MECE)</text>
    <text x="215" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">break the ask into 3–4 branches that</text>
    <text x="215" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">don't overlap and cover everything;</text>
    <text x="215" y="143" font-size="8.5" fill="hsl(var(--muted-foreground))">generate 8–12 candidate levers</text>
    <text x="215" y="160" font-size="8" fill="hsl(var(--primary))" font-weight="700">tool: the issue tree (core frameworks)</text>
    <rect x="385" y="78" width="240" height="92" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="98" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">2 · PRIORITISE</text>
    <text x="505" y="115" font-size="8.5" fill="hsl(var(--muted-foreground))">score every lever on impact ×</text>
    <text x="505" y="129" font-size="8.5" fill="hsl(var(--muted-foreground))">feasibility (cost, time, capability);</text>
    <text x="505" y="143" font-size="8.5" fill="hsl(var(--muted-foreground))">kill 70% of your own ideas — visibly</text>
    <text x="505" y="160" font-size="8" fill="hsl(var(--primary))" font-weight="700">show the matrix IN the deck</text>
  </g>
  <path d="M215 170 L215 186 M505 170 L505 186 M215 186 L505 186 M360 186 L360 200" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="60" y="202" width="600" height="118" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
    <text x="360" y="224" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">3 · THE RECOMMENDATION — 2–3 PILLARS + A FINANCIAL SPINE</text>
    <rect x="90" y="238" width="170" height="48" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="175" y="258" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">PILLAR 1 · quick win</text>
    <text x="175" y="273" font-size="8" fill="hsl(var(--muted-foreground))">visible in 0–6 months</text>
    <rect x="275" y="238" width="170" height="48" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="258" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">PILLAR 2 · core move</text>
    <text x="360" y="273" font-size="8" fill="hsl(var(--muted-foreground))">the main value driver</text>
    <rect x="460" y="238" width="170" height="48" rx="8" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="545" y="258" font-size="8.5" font-weight="700" fill="hsl(var(--foreground))">PILLAR 3 · structural bet</text>
    <text x="545" y="273" font-size="8" fill="hsl(var(--muted-foreground))">12–36 month moat-builder</text>
    <text x="360" y="306" font-size="8.5" fill="hsl(var(--muted-foreground))">spine: investment ₹ · revenue/saving ₹ · payback months · one sensitivity ("at half our adoption assumption, still positive")</text>
  </g>
  <path d="M360 320 L360 334 M215 334 L505 334 M215 334 L215 348 M505 334 L505 348" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="350" width="240" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="370" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">4a · ROADMAP</text>
    <text x="215" y="386" font-size="8.5" fill="hsl(var(--muted-foreground))">phased 30/90/365-day plan with</text>
    <text x="215" y="400" font-size="8.5" fill="hsl(var(--muted-foreground))">owners, milestones, and the KPI</text>
    <text x="215" y="414" font-size="8.5" fill="hsl(var(--muted-foreground))">each phase moves</text>
    <rect x="385" y="350" width="240" height="78" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="370" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">4b · RISKS &amp; MITIGATIONS</text>
    <text x="505" y="386" font-size="8.5" fill="hsl(var(--muted-foreground))">top 3 risks, each with a mitigation</text>
    <text x="505" y="400" font-size="8.5" fill="hsl(var(--muted-foreground))">and a trigger; pre-empts half of</text>
    <text x="505" y="414" font-size="8.5" fill="hsl(var(--muted-foreground))">the Q&amp;A grilling before it starts</text>
  </g>
  <path d="M215 428 L215 444 M505 428 L505 444 M215 444 L505 444 M360 444 L360 458" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="460" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="479" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">ONE RECOMMENDATION, NUMBERED, DE-RISKED</text>
  <text x="360" y="496" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">"we recommend B" + the math + the plan + why A and C lose — decisiveness scores</text>
  <text x="360" y="530" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">Innovation wins prizes only when it survives the feasibility column — a bold idea with a payback number beats a safe idea and a wild one.</text>
</svg>` },
    { type: 'heading', level: 2, text: 'Move 1–2: structure, then kill your darlings' },
    { type: 'prose', md: 'Structure the ask with the same MECE discipline as a case interview — the [core frameworks](/learn/casebook/core-frameworks/profitability) and [issue-tree method](/learn/casebook/getting-started/repeatable-method) transfer directly. Competitions differ in one way: you have days, not minutes, so the tree should generate **8–12 candidate levers** before you choose. Then prioritise ruthlessly on an impact × feasibility matrix and *show the matrix in the deck* — judges score the visible discipline of rejecting your own ideas almost as highly as the ideas you kept.' },
    { type: 'heading', level: 2, text: 'Move 3: the financial spine' },
    { type: 'prose', md: 'Every recommendation needs four numbers: what it costs, what it returns, when it pays back, and what happens if your key assumption is half wrong. "This will improve profitability" is air; "₹14 crore investment, ₹46 crore incremental revenue by year 2, payback in 11 months, still positive at half the assumed adoption" is a recommendation. Build the model bottom-up in a sheet, keep it simple enough to defend live, and put the headline numbers on the recommendation slide — the workings go to the appendix.' },
    { type: 'callout', variant: 'insight', title: 'The innovation–feasibility trade', md: 'Rubrics often weight "innovation" ~30% — which tempts teams into metaverse-flavoured fantasy. The trick: innovate **inside one pillar** (the structural bet) while keeping the other pillars boringly executable. The deck reads as both imaginative and adult.' },
    { type: 'heading', level: 2, text: 'Move 4: roadmap and risks' },
    { type: 'steps', ordered: false, items: [
      { title: 'Phase the plan', md: '30/90/365 days, each phase with an owner function (sales, ops, digital), a milestone, and the KPI it moves. A Gantt-style strip on one slide is enough.' },
      { title: 'Name the top three risks yourself', md: 'For each: likelihood, impact, mitigation, and the trigger at which the mitigation fires. Every risk you name and answer is a Q&A grenade defused in advance.' },
      { title: 'Pre-write the kill question', md: 'Ask: "if a judge wanted to destroy this in one question, what would they ask?" Write that question and its answer into the appendix. It will be asked.' },
    ]},
    { type: 'keyTakeaways', title: 'Key takeaways', items: [
      'Structure MECE, generate 8–12 levers, then kill 70% on an impact × feasibility matrix — and show the kill visibly in the deck.',
      'Recommend in 2–3 pillars (quick win, core move, structural bet) carried by a financial spine: cost, return, payback, sensitivity.',
      'Phase the roadmap, name your top risks before the judges do, and pre-write the kill question into the appendix.',
    ]},
  ],
};
