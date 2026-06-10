import type { Page } from '@/lib/casebook/types';

// Wholly invented scenario — no resemblance to any sourced case.
export const evTwoWheelerTier2: Page = {
  slug: 'cases/market-entry/ev-two-wheeler-tier2',
  title: 'Electric Scooters Beyond the Metros',
  subtitle: 'An EV maker saturating metros must decide: go deeper, or go wider?',
  kind: 'case',
  meta: { difficulty: 'moderate', caseType: 'Market Entry', readingTimeMin: 9, tags: ['automotive', 'ev', 'geographic-expansion'] },
  blocks: [
    { type: 'caseSection', label: 'prompt', blocks: [
      { type: 'prose', md: 'Your client is an Indian electric two-wheeler maker selling ~15,000 scooters a month, almost entirely in eight metros, through 120 company-owned experience stores. Growth is flattening. The CEO wants a recommendation on entering tier-2 and tier-3 cities — and whether the metro playbook will survive the journey.' },
    ]},
    { type: 'caseSection', label: 'clarifying', title: 'Opening exchange', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'candidate', md: 'Three clarifications. Is the flattening a demand problem or a supply/capacity constraint? Do we have evidence of tier-2 demand today — say, inquiries or deliveries to nearby towns? And what does the metro playbook cost — what\'s the economics of an experience store?' },
        { speaker: 'interviewer', md: 'Demand-side — metro share has plateaued around 18%. About 12% of current bookings already ship to towns *around* the metros, unprompted. An experience store costs ~₹1.2 crore a year to run and supports ~150 sales a month.', note: 'The unprompted 12% is the buried signal: latent demand already exists. Strong candidates seize on it.' },
        { speaker: 'candidate', md: 'That unprompted 12% is meaningful — demand is pulling us outward before we\'ve pushed. The question shifts from *whether* to *how*: which cities, and with what model, since a ₹1.2 crore store needing 150 sales/month may not clear in a tier-3 town.' },
      ]},
    ]},
    { type: 'caseSection', label: 'structure', blocks: [
      { type: 'prose', md: 'Structure in three layers: market attractiveness city-by-city (not "tier-2" as a blob), the right-to-win read across segments, and the entry *model* — because the binding constraint is distribution economics, not product.' },
      { type: 'svg', maxWidth: 720, ariaLabel: 'Three-layer structure for geographic expansion: city prioritization screen, right to win differences, and three distribution models compared', caption: 'The decision is really a distribution-model decision wearing a market-entry costume.', svg: `<svg viewBox="0 0 720 380" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs>
    <filter id="evcs" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f1c33" flood-opacity="0.10"/></filter>
    <linearGradient id="evng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient>
  </defs>
  <rect x="245" y="14" width="230" height="44" rx="12" fill="url(#evng)" filter="url(#evcs)"/>
  <text x="360" y="34" text-anchor="middle" font-size="12.5" font-weight="700" fill="#ffffff">GO WIDER — BUT HOW?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">city screen → segment fit → channel model</text>
  <path d="M360 58 L360 76 M140 76 L580 76 M140 76 L140 92 M360 76 L360 92 M580 76 L580 92" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <g text-anchor="middle">
    <rect x="40" y="94" width="200" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#evcs)"/>
    <text x="140" y="113" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">1 · CITY SCREEN</text>
    <text x="140" y="130" font-size="9.5" fill="hsl(var(--muted-foreground))">2W density · petrol spend</text>
    <text x="140" y="144" font-size="9.5" fill="hsl(var(--muted-foreground))">· grid reliability · existing</text>
    <text x="140" y="158" font-size="9.5" fill="hsl(var(--muted-foreground))">bookings · state EV subsidy</text>
    <rect x="260" y="94" width="200" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25" filter="url(#evcs)"/>
    <text x="360" y="113" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">2 · SEGMENT FIT</text>
    <text x="360" y="130" font-size="9.5" fill="hsl(var(--muted-foreground))">metro: tech-led commuter</text>
    <text x="360" y="144" font-size="9.5" fill="hsl(var(--muted-foreground))">tier-2/3: TCO-led family +</text>
    <text x="360" y="158" font-size="9.5" fill="hsl(var(--muted-foreground))">commercial (delivery fleets)</text>
    <rect x="480" y="94" width="200" height="78" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.5" filter="url(#evcs)"/>
    <text x="580" y="113" font-size="9" font-weight="700" letter-spacing="0.08em" fill="hsl(var(--primary))">3 · CHANNEL MODEL</text>
    <text x="580" y="130" font-size="9.5" fill="hsl(var(--muted-foreground))">own stores · franchise</text>
    <text x="580" y="144" font-size="9.5" fill="hsl(var(--muted-foreground))">dealers · hub-and-spoke</text>
    <text x="580" y="158" font-size="9.5" fill="hsl(var(--muted-foreground))">(store + service vans)</text>
  </g>
  <path d="M580 172 L580 196" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.5"/>
  <rect x="60" y="200" width="600" height="100" rx="11" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.5"/>
  <text x="360" y="222" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="0.04em" fill="hsl(var(--primary))">THE CHANNEL MATH DECIDES THE CITY LIST</text>
  <text x="90" y="245" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Own store:</text>
  <text x="175" y="245" font-size="10" fill="hsl(var(--muted-foreground))">breaks even ~110 sales/mo → only the top ~15 tier-2 cities qualify</text>
  <text x="90" y="265" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Franchise:</text>
  <text x="175" y="265" font-size="10" fill="hsl(var(--muted-foreground))">breaks even ~35/mo at lower capex, costs ~5 pts of margin → next ~60 cities</text>
  <text x="90" y="285" font-size="10" font-weight="600" fill="hsl(var(--foreground))">Hub-spoke:</text>
  <text x="175" y="285" font-size="10" fill="hsl(var(--muted-foreground))">store in anchor city + service vans covering satellite towns → captures the 12%</text>
  <text x="360" y="340" text-anchor="middle" font-size="10" font-style="italic" fill="hsl(var(--muted-foreground))">"Tier-2" is not one market — it's ~80 cities whose viable channel differs by demand density.</text>
</svg>` },
    ]},
    { type: 'caseSection', label: 'analysis', blocks: [
      { type: 'dialogue', turns: [
        { speaker: 'interviewer', md: 'The CEO worries about two tier-2 specifics: charging anxiety and resale value. How do they change the play?' },
        { speaker: 'candidate', md: 'Both bite harder outside metros. Charging: tier-2 homes more often have private parking, which *helps* — home charging is the EV\'s tier-2 advantage — but public infrastructure is thin, so range claims must be conservative and the service van network doubles as roadside assurance. Resale: thinner used-EV markets mean buyers fear being stuck; a manufacturer buy-back guarantee at, say, 50% after 3 years directly attacks the #1 adoption barrier and costs little if battery health data supports it.', note: 'Turns each risk into a specific, costed mitigation rather than acknowledging it generically.' },
        { speaker: 'interviewer', md: 'Quickly: the client can fund 25 new points of presence next year. Allocate them.' },
        { speaker: 'candidate', md: 'Roughly: 8 own stores in the largest tier-2 cities that clear the 110/month bar; 12 franchises in the next band, prioritizing cities with existing unprompted bookings and state subsidies; 5 hub-and-spoke conversions around the metros where that 12% spillover already ships — cheapest demand we can serve, since the brand work is done.' },
      ]},
      { type: 'reveal', summary: 'Reveal the prioritization logic', blocks: [
        { type: 'mathBox', title: 'Why spillover towns rank first on ROI', md: 'Spillover towns: demand exists (12% of 15,000 = **1,800 units/mo** already), zero brand spend needed, service van capex ≈ ₹25 lakh vs ₹1.2 cr store.\nROI order: hub-spoke ≫ franchise in subsidy states > own stores (strategic flagships only).' },
      ]},
    ]},
    { type: 'caseSection', label: 'recommendation', blocks: [
      { type: 'keyTakeaways', title: 'Recommend to the CEO', items: [
        'Enter wider, with a three-channel architecture matched to city demand density — do not export the metro store model wholesale.',
        'Sequence: hub-and-spoke around metros first (capture the existing 12% spillover), then franchise the subsidy-rich tier-2 band, own stores only in the top ~8 cities.',
        'De-risk adoption with a 3-year buy-back guarantee and conservative real-world range claims.',
        'Add a commercial-fleet line of attack (delivery riders) in tier-2 — TCO economics sell themselves without brand spend.',
      ]},
    ]},
    { type: 'caseSection', label: 'takeaway', blocks: [
      { type: 'callout', variant: 'insight', title: 'What this case teaches', md: 'Geographic expansion cases are usually **channel-economics cases in disguise**. Break "tier-2" into bands by demand density, let the break-even math assign a channel to each band, and hunt for spillover demand — it\'s the cheapest growth you\'ll ever buy.' },
    ]},
  ],
};
