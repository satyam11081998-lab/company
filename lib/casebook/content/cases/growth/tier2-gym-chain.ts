import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const tier2GymChain: Page = {
  slug: 'cases/growth/tier2-gym-chain',
  title: 'The Gym Chain at a Crossroads',
  subtitle: 'Own every gym, or franchise the brand? Growth model is the case.',
  kind: 'case',
  meta: { difficulty: 'challenging', caseType: 'Growth', readingTimeMin: 10, tags: ['fitness', 'franchise', 'capital-allocation'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client runs 35 company-owned gyms in tier-2 cities — strong brand, ₹110 crore revenue, 22% EBITDA. They want to reach 200 locations in five years. The founders are split: half want to keep owning gyms, half want to franchise. Resolve the debate with numbers and a recommendation.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Three checks. What does one owned gym look like — capex, ramp time, steady-state economics? How much capital can the company deploy over five years? And what makes the brand strong — is it replicable by a franchisee, or does it depend on owned-gym service quality?' },
        { speaker: 'interviewer', md: 'An owned gym: ₹2.5 crore capex, 18 months to mature, then ₹3.2 crore revenue at 25% gym-level EBITDA. The company can invest about ₹100 crore over five years. The brand rests on equipment quality and trainer standards — protocols exist on paper.', note: 'Capex per gym × available capital instantly bounds the owned path: ₹100 cr ÷ ₹2.5 cr = 40 new gyms max. The 200 target is unreachable on owned capital alone — the structure must confront this.' },
        { speaker: 'candidate', md: 'Then the math already says something loud: ₹100 crore funds only ~40 owned gyms — 75 total, far from 200. So the real question isn\'t own *versus* franchise; it\'s **which mix**, and whether franchise economics and brand control can be made good enough.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Comparison of owned versus franchise growth models on capital, speed, profit per location, and brand control, leading to a hybrid recommendation', caption: 'The two models compared on what actually decides: capital, speed, quality control, and per-location profit.', svg: `<svg viewBox="0 0 720 360" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="ggcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="ggng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="250" y="14" width="220" height="44" rx="12" fill="url(#ggng)" filter="url(#ggcs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">200 GYMS, ₹100 CR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">what mix of owned and franchised gets there?</text>
  <g text-anchor="middle">
    <rect x="60" y="80" width="280" height="160" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#ggcs)"/>
    <text x="200" y="103" font-size="11" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">OWNED</text>
    <text x="200" y="125" font-size="9.5" fill="hsl(var(--muted-foreground))">₹2.5 cr capex · 18-mo ramp</text>
    <text x="200" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">₹80 lakh EBITDA at maturity</text>
    <text x="200" y="159" font-size="9.5" fill="hsl(var(--muted-foreground))">full quality control</text>
    <text x="200" y="183" font-size="10" font-weight="700" fill="hsl(var(--primary))">capital-capped: ~40 more</text>
    <text x="200" y="200" font-size="9" fill="hsl(var(--muted-foreground))">ROIC ≈ 32% mature, but slow to 200</text>
    <rect x="380" y="80" width="280" height="160" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#ggcs)"/>
    <text x="520" y="103" font-size="11" font-weight="700" letter-spacing="0.05em" fill="hsl(var(--foreground))">FRANCHISED</text>
    <text x="520" y="125" font-size="9.5" fill="hsl(var(--muted-foreground))">franchisee funds capex</text>
    <text x="520" y="142" font-size="9.5" fill="hsl(var(--muted-foreground))">₹25 lakh fee + 7% royalty ≈ ₹22 lakh/yr</text>
    <text x="520" y="159" font-size="9.5" fill="hsl(var(--muted-foreground))">quality risk · franchisee selection</text>
    <text x="520" y="183" font-size="10" font-weight="700" fill="hsl(var(--primary))">capital-light: speed unlimited-ish</text>
    <text x="520" y="200" font-size="9" fill="hsl(var(--muted-foreground))">~27% of owned profit, ~0 capital</text>
  </g>
  <rect x="120" y="265" width="480" height="48" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="285" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">HYBRID: OWN THE FLAGSHIPS, FRANCHISE THE FOOTPRINT</text>
  <text x="360" y="302" text-anchor="middle" font-size="9.5" fill="hsl(var(--muted-foreground))">owned anchors per city protect the brand; franchises buy reach with other people’s capital</text>
  <text x="360" y="340" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">The debate dissolves once each model is priced per location: they solve different problems.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'Build me the five-year arithmetic for a hybrid.' },
        { speaker: 'candidate', md: 'Say 70 owned (35 existing + 35 new, ₹87 crore capex) and 130 franchised. Owned at maturity: 70 × ₹80 lakh = ₹56 crore EBITDA. Franchised: 130 × ₹22 lakh ≈ ₹29 crore, nearly capital-free. Total ≈ ₹85 crore EBITDA vs ~₹31 crore today, hitting 200 locations within the ₹100 crore envelope — with ₹13 crore spare for the franchise support infrastructure, which is the piece everyone forgets to fund.', note: 'Reserves capital for the support org — franchising isn\'t free; it converts capex into an operating capability.' },
        { speaker: 'interviewer', md: 'What kills this plan in practice?' },
        { speaker: 'candidate', md: 'Quality decay. One viral video of a bad franchise gym taxes all 200. So: franchisees selected for operating capability not just capital; mandatory trainer certification through our academy; equipment from approved vendors; mystery audits with teeth — two strikes then buy-back rights. And sequencing matters: franchise only into cities where one owned anchor gym sets the standard first.' },
      ]},
      { type: 'reveal', summary: 'Reveal the five-year model', blocks: [
        { type: 'mathBox', title: 'Hybrid vs pure paths (year-5 run-rate)', md: 'Pure owned: 75 gyms · ₹60 cr EBITDA · misses target by 125 locations\nPure franchise: 200+ gyms · ₹31 + 36 = ~₹67 cr · max speed, max brand risk\n**Hybrid 70/130: 200 gyms · ~₹85 cr EBITDA · brand anchored in every city** ✓' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the founders', items: [
        'Adopt the hybrid: ~70 owned flagships, ~130 franchises, anchoring every new city with an owned gym before franchising it.',
        'Fund a real franchise organization (~₹13 crore): trainer academy, audit teams, central procurement — this is the brand-protection budget.',
        'Set franchise unit economics so the franchisee earns 25%+ ROIC — a profitable franchisee is the only durable quality-control system.',
        'Review the mix annually: if royalty income proves stickier than expected, tilt further toward franchise; if audit failures rise, freeze and fix.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'When growth targets exceed capital, the question is never "own vs franchise" — it\'s **what mix, with what control system**. Price both models per location, let the capital constraint set the mix, and budget explicitly for the machinery that keeps quality from decaying.' },
    ]},
  ],
};
