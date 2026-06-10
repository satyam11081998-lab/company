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
      { type: 'svg', maxWidth: 720, ariaLabel: 'Four-tier tree for tier-2 expansion: city screen with 12 percent unprompted spillover, segment fit with buy-back guarantee, channel model, break-even row comparing own store at 110 per month, franchise at 35 per month and hub-spoke at 25 lakh capex, and a 25-point allocation verdict bar of 8, 12 and 5', caption: 'The rebuilt tree — the channel break-even row decides the city list, and the 25 points fall out as 8 / 12 / 5.', svg: `<svg viewBox="0 0 720 490" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" font-family="Inter, system-ui, sans-serif">
  <defs><linearGradient id="evng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(214 64% 19%)"/><stop offset="1" stop-color="hsl(214 74% 11%)"/></linearGradient></defs>
  <rect x="240" y="14" width="240" height="46" rx="11" fill="url(#evng)"/>
  <text x="360" y="34" text-anchor="middle" font-size="11.5" font-weight="700" fill="#ffffff">GO WIDER — BUT HOW?</text>
  <text x="360" y="50" text-anchor="middle" font-size="9" fill="#b9c4d6">metro share plateaued at 18% — and demand is already pulling outward</text>
  <path d="M360 60 L360 70 M125 70 L595 70 M125 70 L125 82 M360 70 L360 82 M595 70 L595 82" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <g text-anchor="middle">
    <rect x="30" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="125" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">1 · CITY SCREEN</text>
    <rect x="265" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
    <text x="360" y="108" font-size="10" font-weight="700" fill="hsl(var(--foreground))">2 · SEGMENT FIT</text>
    <rect x="500" y="84" width="190" height="40" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="595" y="108" font-size="10" font-weight="700" fill="hsl(var(--primary))">3 · CHANNEL MODEL — the bind</text>
  </g>
  <path d="M125 124 L125 152 M360 124 L360 152 M595 124 L595 152" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="125" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">~80 CITIES, NOT A BLOB</text>
    <text x="125" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">2W density · petrol spend · grid</text>
    <text x="125" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">reliability · state EV subsidy ·</text>
    <text x="125" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">existing unprompted bookings</text>
    <text x="125" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">12% = 1,800/mo spillover</text>
    <text x="125" y="256" font-size="8" fill="hsl(var(--muted-foreground))">demand pulling before any push</text>
    <rect x="265" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--border-strong))" stroke-width="1.1"/>
    <text x="360" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">TCO BUYER, NOT TECH BUYER</text>
    <text x="360" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">family + delivery fleets; home</text>
    <text x="360" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">charging helps, thin public infra</text>
    <text x="360" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">and resale fear hurt</text>
    <text x="360" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">50% buy-back @ 3 yrs</text>
    <text x="360" y="256" font-size="8" fill="hsl(var(--muted-foreground))">attacks the #1 adoption barrier</text>
    <rect x="500" y="154" width="190" height="110" rx="9" fill="hsl(var(--card))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="595" y="174" font-size="9.5" font-weight="700" fill="hsl(var(--primary))">STORE MATH TRAVELS BADLY</text>
    <text x="595" y="191" font-size="8.5" fill="hsl(var(--muted-foreground))">metro store: ₹1.2 cr/yr opex,</text>
    <text x="595" y="205" font-size="8.5" fill="hsl(var(--muted-foreground))">supports ~150 sales/mo —</text>
    <text x="595" y="219" font-size="8.5" fill="hsl(var(--muted-foreground))">few tier-2 cities clear that</text>
    <text x="595" y="241" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">₹1.2 cr vs ₹25L capex</text>
    <text x="595" y="256" font-size="8" fill="hsl(var(--muted-foreground))">store vs service-van hub-spoke</text>
  </g>
  <path d="M125 264 L125 282 M360 264 L360 282 M595 264 L595 282 M125 282 L595 282 M135 282 L135 298 M360 282 L360 298 M585 282 L585 298" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.25"/>
  <g text-anchor="middle">
    <rect x="30" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="135" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">OWN STORE</text>
    <text x="135" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">break-even ~110 sales/mo</text>
    <text x="135" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">top ~15 cities only</text>
    <rect x="255" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="360" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">FRANCHISE</text>
    <text x="360" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">break-even ~35/mo, costs ~5 pts margin</text>
    <text x="360" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">next ~60 cities</text>
    <rect x="480" y="300" width="210" height="58" rx="9" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.4"/>
    <text x="585" y="318" font-size="9.5" font-weight="700" fill="hsl(var(--foreground))">HUB-AND-SPOKE</text>
    <text x="585" y="334" font-size="8.5" fill="hsl(var(--muted-foreground))">van ₹25L · captures the 1,800/mo</text>
    <text x="585" y="350" font-size="10.5" font-weight="700" fill="hsl(var(--primary))">highest ROI</text>
  </g>
  <path d="M135 358 L135 372 M360 358 L360 372 M585 358 L585 372 M135 372 L585 372 M360 372 L360 386" fill="none" stroke="hsl(var(--border-strong))" stroke-width="1.4"/>
  <rect x="160" y="388" width="400" height="44" rx="10" fill="hsl(var(--background))" stroke="hsl(var(--primary))" stroke-width="1.6"/>
  <text x="360" y="407" text-anchor="middle" font-size="11.5" font-weight="700" fill="hsl(var(--primary))">25 POINTS: 8 OWN · 12 FRANCHISE · 5 HUB-SPOKE</text>
  <text x="360" y="424" text-anchor="middle" font-size="8.5" fill="hsl(var(--muted-foreground))">sequence: spillover towns first → subsidy-rich franchise band → flagship own stores</text>
  <text x="360" y="462" text-anchor="middle" font-size="9.5" font-style="italic" fill="hsl(var(--muted-foreground))">"Tier-2" is not one market — it is ~80 cities whose viable channel differs by demand density. The break-even math assigns each its model.</text>
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
