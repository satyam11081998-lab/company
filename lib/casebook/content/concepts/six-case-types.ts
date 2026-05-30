import type { Page } from '@/lib/casebook/types';

export const sixCaseTypes: Page = {
  slug: 'getting-started/six-case-types',
  title: 'The six case types at a glance',
  titleEmphasize: 'six case types',
  subtitle: 'Almost every case is one of six shapes wearing a costume. Learn to see the shape inside the first sixty seconds — and you reclaim the first minute of every interview.',
  kind: 'concept',
  meta: { readingTimeMin: 7, tags: ['foundations', 'taxonomy'] },
  blocks: [
    { type: 'hook', md: 'A salon chain, a battery plant, an EdTech app — every prompt sounds new. Underneath, almost all of them are one of just six shapes, and the shape tells you which structure earns marks. The candidates who freeze are the ones still deciding what *kind* of problem they are in at minute five. This page trains you to name the shape in sixty seconds. The next one — *Navigating tricky & blended cases* — handles what happens when a case refuses to stay in one box.', emphasize: 'name the shape in sixty seconds' },

    { type: 'prose', md: 'Recognising the shape early is the highest-leverage skill in case interviewing, because the shape is a lookup key. See "market entry" and you reach for *is it attractive / can we win*. See "profitability" and you reach for *revenue minus cost*. Misread the shape and you spend the first ten minutes building the wrong tree — then either grind through a structure that does not fit, or visibly scramble to rebuild it while the interviewer watches.' },

    { type: 'callout', variant: 'insight', title: 'The taxonomy is a tool, not trivia', md: 'You are not memorising six categories to recite them. You are building a reflex: prompt in, shape out, structure ready — fast enough that the interviewer never sees you hesitate. Everything on this page exists to make that reflex automatic.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The six shapes', emphasize: 'six shapes' },

    { type: 'prose', md: 'For each shape: the core question it answers, the default structure it unlocks, the words that give it away, and — most importantly — what a strong candidate *says first* when they recognise it. The first move matters more than the definition, because the definition is what you know and the first move is what you are graded on.' },

    { type: 'heading', level: 3, text: '1 · Profitability', emphasize: 'Profitability' },
    { type: 'prose', md: '**Core question:** Why did profit change, and what do we do about it?  \n**Default structure:** Profit = Revenue — Cost, decomposed until you reach a lever.  \n**Tells:** falling margins, shrinking profit, "we used to make ₹40 crore and now ₹25," costs rising faster than revenue. Two-period comparisons are the giveaway.' },
    { type: 'dialogue', title: 'Trigger → first move', turns: [
      { speaker: 'interviewer', md: 'Our client is a premium ice-cream brand. Volumes grew 12% last year but EBITDA fell 8 points. Why?' },
      { speaker: 'candidate', md: 'Volume up but profit down means the problem is on the cost side or in mix — it can\'t be a demand problem if people are buying more. I\'d decompose profit into revenue and cost, but given the signal I\'d start on cost and mix rather than volume. Before I structure: is the EBITDA fall in absolute rupees or as a margin percentage?' },
    ]},

    { type: 'heading', level: 3, text: '2 · Market Entry', emphasize: 'Market Entry' },
    { type: 'prose', md: '**Core question:** Should we enter this market, and how?  \n**Default structure:** Two arms — *is the market worth entering* (attractiveness) and *can we win in it* (right to play).  \n**Tells:** "enter," "expand into," "launch in," "set up," "should we go." A firm crossing into a new geography, product, or segment.' },
    { type: 'dialogue', title: 'Trigger → first move', turns: [
      { speaker: 'interviewer', md: 'A European luxury watchmaker is considering its first retail presence in India. Should they enter?' },
      { speaker: 'candidate', md: 'I\'d look at two things: whether the Indian luxury-watch market is worth entering — its size, growth, and competitive intensity — and whether this brand specifically has a right to win here, given distribution, brand awareness, and the grey-market dynamics that are big in Indian luxury. I\'d start with attractiveness, because if the market is too small or too crowded, the second question is moot. One clarifier: is "should they enter" the question, or "how should they enter" assuming the decision is made?' },
    ]},

    { type: 'heading', level: 3, text: '3 · Growth', emphasize: 'Growth' },
    { type: 'prose', md: '**Core question:** How do we grow revenue or profit faster than we are now?  \n**Default structure:** Two arms — *grow the core* (more of what we sell, to whom we sell it) and *grow beyond the core* (new products, segments, geographies, or M&A). Usually anchored on a target.  \n**Tells:** "double in three years," "the CEO wants to grow," "hit ₹1,000 crore," "what should our five-year strategy be."' },
    { type: 'dialogue', title: 'Trigger → first move', turns: [
      { speaker: 'interviewer', md: 'A regional dairy brand does ₹600 crore today. The board wants ₹1,500 crore by FY30. What\'s the playbook?' },
      { speaker: 'candidate', md: 'That is roughly a 20% CAGR over five years — well above what the dairy category alone will give, so some of this has to come from beyond the core. I\'d split it: how much can we get from the core — deeper distribution, higher penetration, share gain — and how much must come from new categories like paneer and ghee, new geographies, or new channels like quick-commerce. Sizing that gap first tells us how aggressive the beyond-core bets need to be.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'Profitability vs. Growth — the most common mix-up', md: 'Profitability looks **backwards** ("why did this happen?"). Growth looks **forwards** ("how do we get there?"). They often live in the same company, but the structures are not interchangeable. Drawing a profitability tree on a growth prompt makes you sound like you misheard the question — and applying a growth playbook to a profit-leak makes you sound like you are dodging the diagnosis. The verb tense in the prompt is your tell.' },

    { type: 'heading', level: 3, text: '4 · Pricing', emphasize: 'Pricing' },
    { type: 'prose', md: '**Core question:** What should we charge — for a new product, a changed one, or in response to a competitor?  \n**Default structure:** Three lenses used together — cost-based (the floor), value-based (the ceiling), competitor-based (the reference band).  \n**Tells:** "how should we price," "what should the price be," "a competitor cut prices 15%," a new SKU launch.' },
    { type: 'dialogue', title: 'Trigger → first move', turns: [
      { speaker: 'interviewer', md: 'An Indian D2C skincare brand is launching a premium serum. What should they charge?' },
      { speaker: 'candidate', md: 'I\'d triangulate three numbers. The floor is our fully-loaded cost per bottle including customer acquisition — below that we lose money. The ceiling is willingness-to-pay, anchored on the value the customer perceives and the price of substitutes like international brands on Nykaa. The reference band is where comparable Indian premium serums sit — roughly ₹2,000–5,000. For a premium launch the ceiling usually binds, so I\'d start there rather than cost-up.' },
    ]},

    { type: 'heading', level: 3, text: '5 · M&A / PE / Due Diligence', emphasize: 'M&A' },
    { type: 'prose', md: '**Core question:** Should we buy this asset, and at what price?  \n**Default structure:** Four arms — the **target** (is the business itself good?), the **market** (is the industry attractive?), the **synergies** (what is uniquely true for us as the acquirer?), the **deal** (price, structure, integration risk). PE variants drop synergies and emphasise the exit thesis.  \n**Tells:** "should we acquire," "a PE fund is evaluating," "diligence on," "good buy at 12x EBITDA?"' },
    { type: 'dialogue', title: 'Trigger → first move', turns: [
      { speaker: 'interviewer', md: 'A large Indian paints company is considering acquiring a smaller regional player at 12x EBITDA. Good deal?' },
      { speaker: 'candidate', md: 'I\'d test four things: is the target a healthy business on its own, is the regional paints market attractive, what synergies are uniquely available to *this* acquirer — distribution overlap, raw-material scale, dealer-network leverage — and whether 12x is justified given those. The synergies arm is where the answer usually lives in a strategic acquisition, so after a quick read on target and market I\'d spend most time quantifying what the buyer specifically unlocks.' },
    ]},

    { type: 'heading', level: 3, text: '6 · Unconventional', emphasize: 'Unconventional' },
    { type: 'prose', md: '**Core question:** Anything that does not fit the five above — operations problems, public-sector trade-offs, "design a business," or pure brainteasers.  \n**Default structure:** None off the shelf. You build it from the objective, then the constraints, then the levers. This is where business judgement is graded hardest, because there is no scaffolding to lean on. "Unconventional" does not mean "unstructurable," though — the next page breaks this bucket into its real sub-patterns, each with its own opening structure.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Spotting the shape in sixty seconds', emphasize: 'sixty seconds' },

    { type: 'prose', md: 'Three tells, applied in order, classify almost any prompt before you ask a single question.' },

    { type: 'steps', ordered: true, items: [
      { title: 'Listen for the verb', md: '*Improve / restore / why did* → profitability. *Enter / expand / launch in* → market entry. *Grow / double / reach ₹X* → growth. *Price / charge* → pricing. *Acquire / buy / diligence* → M&A. The verb alone classifies most prompts.' },
      { title: 'Listen for the comparison', md: 'A two-period comparison ("profit fell from ₹40cr to ₹25cr") signals profitability. A future target ("₹1,500cr by 2030") signals growth. A competitor reference ("they cut prices") signals pricing or competitive response.' },
      { title: 'If still unclear, ask one clean clarifier', md: 'A single aimed question pins it: *"Just to confirm — is the question whether to enter, or how to enter assuming the decision is made?"* One exchange, shape locked.' },
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Quick-spot drill', emphasize: 'Quick-spot' },

    { type: 'drill', title: 'Five prompts, ten seconds each', instructions: 'Decide the shape in under ten seconds before checking. These five are "clean" — the disguised and blended ones live on the next page. The goal here is to make the basic reflex automatic.', items: [
      { prompt: 'A two-wheeler manufacturer profit per vehicle has shrunk for six quarters even as it sells more units.', answer: '**Profitability.** Six-quarter decline + more units = cost or mix erosion. Decompose, lead with cost and mix given the volume-up signal.' },
      { prompt: 'A snack-food company is deciding the launch price for a new baked-chips line for health-conscious urban buyers.', answer: '**Pricing.** New SKU + "launch price." Triangulate cost floor, value ceiling, competitor band; lead with value given the premium-health positioning.' },
      { prompt: 'A packaged-foods major doing ₹2,000 crore wants to reach ₹5,000 crore in five years.', answer: '**Growth.** Future target = growth. ~20% CAGR, above category growth, so split core vs beyond-core and size the gap.' },
      { prompt: 'A PE fund is evaluating a chain of diagnostic labs at 10x EBITDA. Should it invest?', answer: '**M&A / PE.** "PE fund evaluating" + multiple = deal case. Use target / market / deal, drop synergies (financial buyer), emphasise the exit thesis.' },
      { prompt: 'A textile firm in Surat wants to start selling directly to consumers online instead of only to wholesalers.', answer: '**Market entry** (entering the D2C channel). Attractiveness + right-to-win. (This one quietly blends into profitability — exactly the kind of case the next page handles.)' },
    ], revealLabel: 'Show shapes & reasoning' },

    { type: 'callout', variant: 'tip', title: 'Next: when the shape will not hold still', md: 'These five were clean. Real cases are messier — they braid two shapes together, hide inside "unconventional" prompts, or turn out to be a different shape than you first guessed. That is the entire subject of the next page, *Navigating tricky & blended cases*, including a ten-prompt drill on disguised and blended prompts.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'Six shapes cover ~95% of cases: Profitability, Market Entry, Growth, Pricing, M&A/PE/DD, Unconventional. The shape is a lookup key to the right default structure.',
      'On recognising a shape, what you *say first* is graded — not the definition you know. Lead with the structure and a hypothesis.',
      'Classify with three tells: the verb, the comparison (two-period = profitability, future target = growth), and one clean clarifier.',
      'Profitability looks backwards; growth looks forwards. The verb tense is the tell. Do not draw a profit tree on a growth prompt.',
      'Clean classification is the floor, not the ceiling — the next page handles braided, disguised, and misdiagnosed cases.',
    ]},
  ],
};
