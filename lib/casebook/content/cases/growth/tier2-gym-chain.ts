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
    { type: 'reveal', summary: 'How a strong candidate opens — clarifying questions', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Three checks. What does one owned gym look like — capex, ramp time, steady-state economics? How much capital can the company deploy over five years? And what makes the brand strong — is it replicable by a franchisee, or does it depend on owned-gym service quality?' },
        { speaker: 'interviewer', md: 'An owned gym: ₹2.5 crore capex, 18 months to mature, then ₹3.2 crore revenue at 25% gym-level EBITDA. The company can invest about ₹100 crore over five years. The brand rests on equipment quality and trainer standards — protocols exist on paper.', note: 'Capex per gym × available capital instantly bounds the owned path: ₹100 cr ÷ ₹2.5 cr = 40 new gyms max. The 200 target is unreachable on owned capital alone — the structure must confront this.' },
        { speaker: 'candidate', md: 'Then the math already says something loud: ₹100 crore funds only ~40 owned gyms — 75 total, far from 200. So the real question isn\'t own *versus* franchise; it\'s **which mix**, and whether franchise economics and brand control can be made good enough.' },
      ]},
      { type: 'callout', variant: 'insight', title: 'What the questions locked', md: 'Pinned single-gym economics, the capital envelope, and brand replicability — turning ‘own vs franchise’ into a question of the right *mix*.' },
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree comparing owned and franchised gym models, a five-year hybrid arithmetic row of 70 owned times 80 lakh plus 130 franchised times 22 lakh equals about 85 crore EBITDA, a capital envelope row of 87 crore capex plus 13 crore support organization, and a hybrid verdict bar', caption: 'Both models priced per location, then the hybrid arithmetic — 70 × ₹80L + 130 × ₹22L ≈ ₹85 cr, inside the ₹100 cr envelope.', svg: `<svg viewBox="0 0 720 510" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="ggng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#ggng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">200 GYMS, ₹100 CR</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">₹100 cr ÷ ₹2.5 cr = only ~40 more owned — the target forces a mix</text>
  <path d="M360 60 L360 70 M215 70 L505 70 M215 70 L215 82 M505 70 L505 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="95" y="84" width="240" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OWNED</text>
    <text x="215" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">₹2.5 cr capex · 18-mo ramp ·</text>
    <text x="215" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">₹80L EBITDA mature · ROIC ~32% ·</text>
    <text x="215" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">full quality control</text>
    <text x="215" y="171" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">capital-capped: ~40 more</text>
    <text x="215" y="186" font-size="8" fill="hsl(var(--muted-foreground))">75 total — misses 200 by 125</text>
    <rect x="385" y="84" width="240" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="505" y="104" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FRANCHISED</text>
    <text x="505" y="121" font-size="8.5" fill="hsl(var(--muted-foreground))">franchisee funds capex ·</text>
    <text x="505" y="135" font-size="8.5" fill="hsl(var(--muted-foreground))">₹25L fee + 7% royalty ≈ ₹22L/yr ·</text>
    <text x="505" y="149" font-size="8.5" fill="hsl(var(--muted-foreground))">quality risk, selection risk</text>
    <text x="505" y="171" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">~27% of owned profit, ~0 capital</text>
    <text x="505" y="186" font-size="8" fill="hsl(var(--muted-foreground))">speed unlimited-ish — brand exposed</text>
  </g>
  <path d="M215 194 L215 210 M505 194 L505 210 M135 210 L585 210 M135 210 L135 226 M360 210 L360 226 M585 210 L585 226" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="228" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="246" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OWNED ENGINE</text>
    <text x="135" y="262" font-size="8.5" fill="hsl(var(--muted-foreground))">70 gyms (35 + 35 new) × ₹80L</text>
    <text x="135" y="278" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">= ₹56 cr EBITDA</text>
    <rect x="255" y="228" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="246" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FRANCHISE ENGINE</text>
    <text x="360" y="262" font-size="8.5" fill="hsl(var(--muted-foreground))">130 gyms × ₹22L royalty + fees</text>
    <text x="360" y="278" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹29 cr EBITDA</text>
    <rect x="480" y="228" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="246" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">YEAR-5 RUN-RATE</text>
    <text x="585" y="262" font-size="8.5" fill="hsl(var(--muted-foreground))">vs ~₹31 cr today</text>
    <text x="585" y="278" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">≈ ₹85 cr EBITDA</text>
  </g>
  <path d="M135 286 L135 302 M360 286 L360 302 M585 286 L585 302 M135 302 L585 302 M215 302 L215 318 M505 302 L505 318" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="95" y="320" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="215" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">CAPEX ENVELOPE</text>
    <text x="215" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">35 new owned × ₹2.5 cr</text>
    <text x="215" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">= ₹87 cr</text>
    <rect x="385" y="320" width="240" height="58" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="505" y="338" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">SUPPORT ORG — the forgotten line</text>
    <text x="505" y="354" font-size="8.5" fill="hsl(var(--muted-foreground))">trainer academy · audits · procurement</text>
    <text x="505" y="370" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹13 cr spare funds it</text>
  </g>
  <path d="M215 378 L215 394 M505 378 L505 394 M215 394 L505 394 M360 394 L360 408" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="150" y="410" width="420" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="429" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">HYBRID 70 / 130 — 200 GYMS INSIDE THE ₹100 CR ENVELOPE</text>
  <text x="360" y="446" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">anchor every city with an owned gym before franchising it · two-strike buy-back audits</text>
  <text x="360" y="484" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">The debate dissolves once each model is priced per location — and a profitable franchisee is the only durable quality-control system.</text>
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
