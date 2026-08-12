/**
 * /mece-framework — content model for the definitive MECE reference page.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * "MECE" is our brand name AND the highest-intent informational query in our
 * category. The casebook version of this page (/learn/casebook/core-frameworks/mece)
 * is the short, in-course version; it canonicalises here. This page is the
 * public, link-earning, citation-earning artifact.
 *
 * EDITORIAL RULES (do not relax without a reason in the handoff)
 *   1. Every factual claim about MECE's origin, pronunciation, or criticism is
 *      traceable to an entry in SOURCES. If you cannot source it, cut it.
 *   2. Answer-first. Each H2 is a question a person actually types, and the
 *      first sentence under it answers that question in isolation. This is what
 *      gets lifted into AI Overviews / ChatGPT / Perplexity answers.
 *   3. No invented statistics, no invented named individuals, no fake "our
 *      research shows". Authority here comes from primary sources and from
 *      worked examples, not from manufactured credentials.
 *
 * Inline markdown supported by <InlineMd>: **bold**, *italic*, `code`,
 * [text](url). Nothing else. No raw HTML.
 */

export const MECE_PAGE_PATH = '/mece-framework';

/** Bumped whenever the body copy materially changes. Feeds dateModified. */
export const MECE_PAGE_PUBLISHED = '2025-06-20';
export const MECE_PAGE_MODIFIED = '2026-08-12';

/* ── The answer-first definition ───────────────────────────────────── */

/**
 * The extractable definition. Kept to ~50 words on purpose: this is the block
 * an answer engine quotes verbatim, and long definitions get truncated.
 */
export const MECE_DEFINITION =
  'MECE stands for Mutually Exclusive, Collectively Exhaustive. It is a rule for splitting a problem into categories that do not overlap (mutually exclusive) and that together cover everything (collectively exhaustive). Barbara Minto coined it at McKinsey in the late 1960s. It is pronounced "mee-see".';

export const MECE_KEY_TAKEAWAYS: string[] = [
  '**MECE = no overlaps + no gaps.** Mutually exclusive means one item cannot sit in two buckets. Collectively exhaustive means nothing relevant is left out.',
  '**It is a principle, not a framework.** Profitability, the 4Cs and Porter’s Five Forces are frameworks. MECE is the standard each of them has to pass.',
  '**Barbara Minto coined it at McKinsey between 1963 and 1973**, as the structural rule underneath her Pyramid Principle. She traces the underlying logic to Aristotle.',
  '**Six splits are MECE by construction:** an equation, a process, a segment, a stakeholder set, a 2x2, and a binary "X vs not X". Reach for one of these instead of listing buckets and hoping.',
  '**An "Other" bucket closes any gap in three seconds** and is fully acceptable in an interview, as long as your named buckets carry the bulk of the total.',
  '**MECE is necessary, not sufficient.** A split can be flawlessly MECE and still worthless if the buckets do not move the answer. Relevance is the second test.',
  '**Under time pressure, aim for roughly 80% MECE and highly relevant.** Fix overlaps first, since they are easier to spot than gaps, then close gaps with "Other".',
];

/**
 * The condensed summary for the sticky right rail.
 *
 * Not a duplicate of MECE_KEY_TAKEAWAYS. Those are 7 full sentences meant to be
 * quoted; these are 4 fragments meant to be glanced at from the corner of the
 * eye while reading something else, so they are trimmed to the point of being
 * headlines rather than statements.
 */
export const MECE_RAIL_SUMMARY: { label: string; value: string }[] = [
  { label: 'Stands for', value: 'Mutually Exclusive, Collectively Exhaustive' },
  { label: 'In one line', value: 'No overlaps, no gaps' },
  { label: 'Coined by', value: 'Barbara Minto, McKinsey, late 1960s' },
  { label: 'Said as', value: '"mee-see" (Minto says "meece")' },
];

/* ── ME / CE explainers ────────────────────────────────────────────── */

export interface Explainer {
  id: string;
  label: string;
  heading: string;
  lead: string;
  body: string[];
  goodExample: { title: string; md: string };
  badExample: { title: string; md: string };
}

export const MECE_HALVES: Explainer[] = [
  {
    id: 'mutually-exclusive',
    label: 'ME',
    heading: 'What does mutually exclusive mean?',
    lead: 'Mutually exclusive means no single item can belong to two of your buckets. Each thing you are analysing has exactly one home, so nothing gets counted twice and nobody argues about where it goes.',
    body: [
      'The practical payoff is that you can hand each bucket to a different person, or investigate each one in turn, and know that no effort is being duplicated. On a five-person consulting team, that discipline saves hundreds of hours. In a 30-minute case interview, it stops you circling back to the same idea in three different sections.',
      'Overlaps almost never announce themselves. They hide inside categories that *sound* different but describe the same underlying thing. That is why the fix is usually definitional, not structural: tighten what each bucket means until an item can only satisfy one of them.',
    ],
    goodExample: {
      title: 'Mutually exclusive',
      md: 'Customers aged **0 to 17**, **18 to 34**, **35 to 59**, **60 and above**. A person has exactly one age, so they land in exactly one bracket. Note the closed boundaries: "under 50" and "over 50" is a classic trap because it silently drops everyone who is exactly 50.',
    },
    badExample: {
      title: 'Not mutually exclusive',
      md: 'Customers split into **millennials** and **online shoppers**. Most millennials shop online, so a large group sits in both buckets and gets counted twice. Same failure: **new customers** vs **lapsed customers**, which breaks the moment a lapsed customer reactivates.',
    },
  },
  {
    id: 'collectively-exhaustive',
    label: 'CE',
    heading: 'What does collectively exhaustive mean?',
    lead: 'Collectively exhaustive means your buckets, taken together, account for 100% of the thing you are analysing. Nothing relevant sits outside the structure.',
    body: [
      'This is the half that protects you from being blindsided. If the structure genuinely covers everything, then the root cause has to be inside it somewhere, and you can eliminate branches with confidence. The moment your structure has a hole, eliminating a branch proves nothing, because the answer might be living in the hole.',
      'Exhaustive does not mean exhausting. You are not required to name every possibility. Name the categories that carry the bulk of the total and add a clearly labelled **Other** bucket for the remainder. That is a complete structure, and it takes three seconds.',
    ],
    goodExample: {
      title: 'Collectively exhaustive',
      md: 'A company’s revenue split into **North America**, **Europe**, **Asia-Pacific**, and **Rest of world**. That last bucket is doing real work: without it, revenue from Latin America and Africa has nowhere to go and the split silently under-counts the total.',
    },
    badExample: {
      title: 'Not collectively exhaustive',
      md: 'Cost split into **fixed costs** and **labour costs**. Variable input costs such as raw material have no home, so an entire cost driver is invisible to you. Same failure: age brackets that stop at 65, which quietly delete every customer older than that.',
    },
  },
];

/* ── MECE vs non-MECE: the self-test table ─────────────────────────── */

export interface SegmentationRow {
  segmentation: string;
  me: 'Yes' | 'No';
  ce: 'Yes' | 'No';
  verdict: string;
}

/**
 * A superset of the 4-row and 5-row tables our competitors run. Ordered so the
 * first rows are unambiguous and the last rows are genuinely arguable, which is
 * where the learning actually happens.
 */
export const MECE_SEGMENTATION_TESTS: SegmentationRow[] = [
  {
    segmentation: 'Income under Rs 5L, Rs 5L to Rs 15L, above Rs 15L',
    me: 'Yes',
    ce: 'Yes',
    verdict: 'MECE. Numeric bands with closed boundaries and no ceiling are the safest split there is.',
  },
  {
    segmentation: 'Revenue = Price x Volume',
    me: 'Yes',
    ce: 'Yes',
    verdict: 'MECE by construction. An arithmetic identity cannot overlap or leak.',
  },
  {
    segmentation: 'Dog lovers vs cat lovers',
    me: 'No',
    ce: 'No',
    verdict: 'Fails both. People can love both, and plenty love neither.',
  },
  {
    segmentation: 'Ages 0 to 20, 21 to 40, 41 to 60, 61 to 80',
    me: 'Yes',
    ce: 'No',
    verdict: 'No overlap, but everyone over 80 has vanished. Add an open-ended top band.',
  },
  {
    segmentation: 'Taller than 160cm vs shorter than 180cm',
    me: 'No',
    ce: 'Yes',
    verdict: 'Everyone is covered, but the 160cm to 180cm band is counted twice.',
  },
  {
    segmentation: 'Profit decline in the US market vs decline in the Diet Coke line',
    me: 'No',
    ce: 'No',
    verdict: 'Mixes two different axes. Diet Coke sold in the US belongs to both, and Coke sold in Europe belongs to neither.',
  },
  {
    segmentation: 'North America, Canada, Europe, Asia',
    me: 'No',
    ce: 'No',
    verdict: 'A level error. Canada sits inside North America, and South America is missing entirely.',
  },
  {
    segmentation: 'Indoor hobbies vs outdoor hobbies',
    me: 'No',
    ce: 'No',
    verdict: 'People do both, and people with no hobbies are unrepresented.',
  },
  {
    segmentation: 'Nationality',
    me: 'No',
    ce: 'No',
    verdict: 'The textbook counter-example. Dual nationals sit in two buckets, stateless people in none.',
  },
  {
    segmentation: 'Existing customers vs new customers',
    me: 'Yes',
    ce: 'Yes',
    verdict: 'MECE, provided you fix a date and a definition. "Has purchased before today" is binary and airtight.',
  },
  {
    segmentation: 'Marketing initiatives vs customer acquisition strategies',
    me: 'No',
    ce: 'No',
    verdict: 'Different words for heavily overlapping activity. This is the most common hidden overlap in interviews.',
  },
  {
    segmentation: 'Rolling a die: 1, 2, 3, 4, 5, 6',
    me: 'Yes',
    ce: 'Yes',
    verdict: 'The purest case. A finite, enumerable sample space is MECE by definition.',
  },
];

/* ── The six ways to build a MECE split ────────────────────────────── */

export interface SplitMethod {
  n: number;
  name: string;
  oneLiner: string;
  how: string;
  worked: string;
  useWhen: string;
}

export const MECE_SPLIT_METHODS: SplitMethod[] = [
  {
    n: 1,
    name: 'Split by an equation',
    oneLiner: 'Borrow an arithmetic identity. It cannot overlap and it cannot leak.',
    how: 'Write the quantity you care about as a formula, then treat each variable as a branch. Because the equation reconstructs the whole, the branches are automatically exhaustive, and because each variable is a distinct quantity, they are automatically exclusive.',
    worked:
      'Profit = Revenue − Cost. Revenue = Price x Volume. Cost = Fixed + Variable. Variable = Volume x Cost per unit. Four splits, all provably MECE, built in under 60 seconds.',
    useWhen: 'Profitability, revenue decline, cost reduction, market sizing, unit economics.',
  },
  {
    n: 2,
    name: 'Split by a process',
    oneLiner: 'Use the sequence of steps. Each step owns one moment in time.',
    how: 'Lay the activity out as an ordered flow from start to finish. Two steps cannot be the same step, so exclusivity is free, and listing every step from beginning to end buys exhaustiveness.',
    worked:
      'A D2C brand’s funnel: Impression, Click, Product page view, Add to cart, Checkout started, Payment success, Delivery, Repeat purchase. A drop-off can only live between two adjacent stages, which is exactly what you want to isolate.',
    useWhen: 'Operations, supply chain, funnel and conversion problems, customer journey, churn.',
  },
  {
    n: 3,
    name: 'Split by segment',
    oneLiner: 'Pick one axis of the population and cut along it. One axis at a time.',
    how: 'Choose a single dimension such as geography, product line, channel, or customer type, and split along it exhaustively. The discipline is picking exactly one axis: the instant you mix geography with product, you have created an overlap.',
    worked:
      'A QSR chain’s revenue by channel: dine-in, takeaway, own-app delivery, aggregator delivery. Every rupee of revenue arrives through exactly one of these, and together they sum to 100%.',
    useWhen: 'Diagnosing where a problem is concentrated, before diagnosing why.',
  },
  {
    n: 4,
    name: 'Split by stakeholder',
    oneLiner: 'List the distinct actors in the system and reason from each one.',
    how: 'Name the parties whose behaviour could move the outcome, and make sure the list closes the system. This is the natural split when the problem is fundamentally about incentives rather than arithmetic.',
    worked:
      'Why are wait times rising at a hospital? Patients, doctors, nurses, administrators, insurers. Each has separate levers, separate incentives, and separate data.',
    useWhen: 'Multi-party problems, marketplaces, public policy, change management, pricing negotiations.',
  },
  {
    n: 5,
    name: 'Split with a 2x2',
    oneLiner: 'Cross two independent binary axes to get four non-overlapping cells.',
    how: 'Choose two axes that genuinely vary independently and cut each in two. Four cells fall out, and because both axes are binary and exhaustive, the cells are too. If the axes are correlated, the diagonal cells will be empty and you have chosen badly.',
    worked:
      'Customers crossed as new vs existing, and high value vs low value. Four cells, four distinct plays: acquire, convert, retain, deprioritise.',
    useWhen: 'Prioritisation, portfolio decisions, segmentation for strategy rather than diagnosis.',
  },
  {
    n: 6,
    name: 'Split as X vs not-X',
    oneLiner: 'The fastest MECE split in existence, and it never fails.',
    how: 'Take any property and split on whether it holds. By the law of the excluded middle the two halves cannot overlap and cannot leave a gap. It is the emergency structure when an interviewer asks a question you have not seen.',
    worked:
      'Asked "what are the barriers to entry here?" with no time to think: economic barriers and non-economic barriers. Then fill each half. Also internal vs external, quantitative vs qualitative, controllable vs uncontrollable, short-term vs long-term.',
    useWhen: 'Brainstorming questions, unfamiliar cases, any moment you are put on the spot.',
  },
];

export const MECE_OTHER_BUCKET_NOTE =
  'There is a seventh move that is not a split but an escape hatch: **add an "Other" bucket**. When you cannot enumerate everything, name the three to five categories that carry most of the total and close the structure with "Other". This is standard practice at every firm, not a cop-out, as long as your named buckets are the ones that matter and "Other" is genuinely a remainder rather than a dumping ground.';

/* ── Ready-to-use structures ───────────────────────────────────────── */

export interface ReadyStructure {
  problem: string;
  structure: string;
  built: string;
}

export const MECE_READY_STRUCTURES: ReadyStructure[] = [
  { problem: 'Profitability', structure: 'Price, Volume, Variable cost, Fixed cost', built: 'Equation' },
  { problem: 'Revenue growth', structure: 'Existing customers (retention, upsell) vs New customers (acquisition)', built: 'X vs not-X' },
  { problem: 'Market sizing', structure: 'Population x Penetration x Frequency x Price', built: 'Equation' },
  { problem: 'Market entry', structure: 'Build organically, Partner, Acquire', built: 'Segment' },
  { problem: 'Value chain', structure: 'Supplier, Manufacturer, Distributor, Retailer, End customer', built: 'Process' },
  { problem: 'Cost reduction', structure: 'Fixed vs Variable, then Direct vs Indirect within each', built: 'Equation' },
  { problem: 'M&A rationale', structure: 'Revenue synergies, Cost synergies, Risks, Price', built: 'Segment' },
  { problem: 'Pricing approach', structure: 'Cost-based, Value-based, Competition-based', built: 'Segment' },
  { problem: 'Channel mix', structure: 'B2B vs B2C, then Direct vs Intermediated within each', built: '2x2' },
  { problem: 'Time horizon', structure: 'Short term, Medium term, Long term', built: 'Process' },
  { problem: 'Geography', structure: 'North, South, East, West, then Metro vs Tier 2 vs Rural', built: 'Segment' },
  { problem: 'Operations', structure: 'Inbound, Process, Outbound', built: 'Process' },
  { problem: 'Root cause', structure: 'Internal (in the company’s control) vs External (not)', built: 'X vs not-X' },
  { problem: 'Feasibility', structure: 'Desirable, Viable, Feasible', built: 'Stakeholder' },
  { problem: 'Any brainstorm', structure: 'Quantitative factors vs Qualitative factors', built: 'X vs not-X' },
];

/* ── The GRIPS test ────────────────────────────────────────────────── */

export interface GripsCheck {
  letter: string;
  name: string;
  question: string;
  fix: string;
}

/**
 * Our named test. Five checks, roughly 30 seconds, run silently before you
 * present a structure. Named so it is quotable and citable: a named artifact
 * is what answer engines attribute back to a source.
 */
export const MECE_GRIPS_TEST: GripsCheck[] = [
  {
    letter: 'G',
    name: 'Gaps',
    question: 'If the answer were hiding somewhere, could my structure miss it? Name one thing that has no home.',
    fix: 'If you find one, add the missing branch. If you cannot enumerate the rest, close it with an "Other" bucket.',
  },
  {
    letter: 'R',
    name: 'Redundancy',
    question: 'Do any two buckets describe the same underlying thing in different words?',
    fix: 'Tighten the definitions until an item can only satisfy one. If you cannot, merge the two buckets.',
  },
  {
    letter: 'I',
    name: 'Instances',
    question: 'Take two or three real, specific examples and place them. Does each land in exactly one bucket?',
    fix: 'An instance that lands twice is an overlap. An instance that lands nowhere is a gap. This catches more errors than any abstract check.',
  },
  {
    letter: 'P',
    name: 'Parallelism',
    question: 'Are all the buckets at the same level of abstraction?',
    fix: 'If one bucket contains another, you have a level error. Push the smaller one down a layer.',
  },
  {
    letter: 'S',
    name: 'So what',
    question: 'Would knowing the answer inside each bucket actually change my recommendation?',
    fix: 'Drop or merge buckets that cannot move the answer. A MECE structure full of irrelevant branches still fails the interview.',
  },
];

/* ── Common mistakes ───────────────────────────────────────────────── */

export interface Mistake {
  title: string;
  md: string;
}

export const MECE_MISTAKES: Mistake[] = [
  {
    title: 'Hidden overlaps between similar-sounding buckets',
    md: 'The single most common failure. "Brand awareness" and "marketing spend" look like separate branches, but almost every rupee of one shows up inside the other. Two buckets that could plausibly be described by the same sentence are the same bucket.',
  },
  {
    title: 'Mixing levels of abstraction',
    md: 'Putting **North America** next to **Canada**, or **digital marketing** next to **Instagram ads**. One contains the other, so the split cannot be exclusive. Everything at a given layer must be the same size of idea.',
  },
  {
    title: 'Mixing two axes in one layer',
    md: 'Splitting by geography *and* by product line at the same level. A product sold in a region belongs to both branches. Pick one axis per layer, then split again inside it.',
  },
  {
    title: 'Boiling the ocean',
    md: 'Treating "collectively exhaustive" as an instruction to analyse everything. It is an instruction to *cover* everything, which is different. Cover it all, then drill only the branch that carries the weight.',
  },
  {
    title: 'Open boundaries on numeric bands',
    md: '"Under 50" and "over 50" excludes everyone who is exactly 50. "0 to 20" and "20 to 40" double-counts them. Use "under 50" and "50 and above", or "0 to 19" and "20 to 39".',
  },
  {
    title: 'Too many buckets',
    md: 'Beyond five top-level branches, neither you nor your interviewer can hold the structure in mind. Three to five at the top, with sub-branches underneath if you need depth.',
  },
  {
    title: 'A perfectly MECE structure that is irrelevant',
    md: 'Splitting revenue by the first letter of the customer’s surname is impeccably MECE and completely useless. Cleanliness earns trust. Relevance earns the offer.',
  },
];

/* ── Related concepts ──────────────────────────────────────────────── */

export interface RelatedConcept {
  concept: string;
  whatItIs: string;
  relationship: string;
  href?: string;
}

export const MECE_RELATED_CONCEPTS: RelatedConcept[] = [
  {
    concept: 'Issue tree',
    whatItIs: 'A diagram that breaks a question into sub-questions across several layers.',
    relationship: 'MECE is the rule; the issue tree is the tool that applies it. Every layer of the tree should be MECE.',
    href: '/glossary/issue-tree',
  },
  {
    concept: 'Hypothesis tree',
    whatItIs: 'The same shape as an issue tree, but each branch is a testable claim rather than an open question.',
    relationship: 'Usually faster than an issue tree because it commits to an answer early. The branches still have to be MECE.',
    href: '/glossary/hypothesis-driven-approach',
  },
  {
    concept: 'Decision tree',
    whatItIs: 'A map of choices and the outcomes that follow from each one.',
    relationship: 'Options at any node must be MECE, otherwise you are either double-counting a path or ignoring one.',
  },
  {
    concept: 'Pyramid Principle',
    whatItIs: 'Barbara Minto’s communication rule: lead with the answer, then support it with grouped arguments.',
    relationship: 'MECE tells you *what* to cover. The Pyramid Principle tells you *what order* to say it in. Minto built the second on top of the first.',
  },
  {
    concept: '80/20 (Pareto)',
    whatItIs: 'The observation that a small share of causes drives most of the effect.',
    relationship: 'The counterweight to MECE. MECE makes you cover everything; 80/20 tells you which covered branch to actually spend time on.',
  },
  {
    concept: 'Work breakdown structure',
    whatItIs: 'The project-management practice of decomposing a project into non-overlapping deliverables.',
    relationship: 'The same idea under a different name. A WBS that is not MECE produces either duplicated work or unowned work.',
  },
];

/* ── Criticisms ────────────────────────────────────────────────────── */

export const MECE_CRITICISMS: Mistake[] = [
  {
    title: 'MECE does not exclude the irrelevant',
    md: 'The best-known objection, made by decision scientist Tim van Gelder: being exhaustive says nothing about whether every item you included is *worth* including. A structure can be MECE and still be padded with branches that cannot change the answer. MECE screens for completeness, never for relevance.',
  },
  {
    title: 'Redundancy is sometimes what you want',
    md: 'Arnaud Chevallier makes the point that MECE thinking precludes redundancy by definition, yet there are cases where redundancy is desirable or necessary, such as safety-critical systems and deliberate cross-checks. Insisting on exclusivity there removes a feature, not a bug.',
  },
  {
    title: 'Mutual exclusivity can be artificially limiting',
    md: 'It is one thing to classify the *answers* to a question so each is considered exactly once. It is another to force the answers themselves to be non-overlapping. Real causes interact. Pricing affects volume, which affects unit cost, which affects pricing. Insisting on clean separation can flatten the interdependence that mattered.',
  },
  {
    title: 'Interdependent systems resist clean partition',
    md: 'Where a domain has heavy feedback loops, cleanly separating causes is genuinely hard, and a structure that looks MECE on a page may be misleading about the underlying system. Use MECE to organise the investigation; do not mistake it for a claim that the world is separable.',
  },
];

/* ── Practice drills ───────────────────────────────────────────────── */

export interface Drill {
  prompt: string;
  answer: string;
}

export const MECE_DRILLS: Drill[] = [
  {
    prompt: 'Split "all the ways a coffee chain could increase revenue" into a MECE structure in 15 seconds.',
    answer:
      'Revenue = Number of transactions x Average ticket. Transactions splits into more stores, more footfall per store, higher conversion. Average ticket splits into higher price and more items per order. Built from an equation, so it cannot leak.',
  },
  {
    prompt: 'Is "students who use our app" vs "students preparing for placements" MECE?',
    answer:
      'No, on both counts. Most app users are preparing for placements, so the buckets overlap heavily; and students who do neither are unrepresented. Fix it by picking one axis: "uses our app" vs "does not use our app" is airtight.',
  },
  {
    prompt: 'An airline wants to cut operating cost. Give a MECE first layer.',
    answer:
      'Fuel, Crew and staff, Aircraft ownership and maintenance, Airport and navigation charges, Everything else. One axis (cost category), the four largest buckets named, and an explicit remainder so the split sums to 100%.',
  },
  {
    prompt: 'Why is "increase marketing" and "improve brand perception" not a MECE pair?',
    answer:
      'Because most marketing spend exists in order to improve brand perception. They are the same activity described as an input and as an outcome. Split by *input* (spend, channel, creative) or by *outcome* (awareness, consideration, preference), not by one of each.',
  },
  {
    prompt: 'Split "reasons a food delivery order arrives late" without using any framework you have memorised.',
    answer:
      'Use the process: order placed, restaurant accepts, food prepared, rider assigned, rider collects, rider travels, handover. A delay lives in exactly one gap between two adjacent steps, and the steps cover the whole journey.',
  },
];

/* ── FAQs ──────────────────────────────────────────────────────────── */

export interface FAQ {
  question: string;
  answer: string;
}

/**
 * These feed both the visible accordion and FAQPage JSON-LD. Answers are
 * 40 to 70 words: long enough to be a complete answer standing alone, short
 * enough to be quoted whole.
 */
export const MECE_FAQS: FAQ[] = [
  {
    question: 'What does MECE stand for?',
    answer:
      'MECE stands for Mutually Exclusive, Collectively Exhaustive. Mutually exclusive means the categories do not overlap, so no item belongs to two of them. Collectively exhaustive means the categories together cover everything relevant, so nothing is left out. A split that satisfies both has no double-counting and no blind spots.',
  },
  {
    question: 'How do you pronounce MECE?',
    answer:
      'Almost everyone in consulting says "mee-see", with two syllables. Barbara Minto, who coined the term, prefers the single syllable "meece", rhyming with "niece", and told the McKinsey Alumni Center: "I invented it, so I get to say how to pronounce it." Either is understood, and no interviewer will penalise you.',
  },
  {
    question: 'Who invented the MECE principle?',
    answer:
      'Barbara Minto developed MECE at McKinsey & Company in the late 1960s, during a tenure that ran from 1963 to 1973. She was the firm’s first female MBA professional hire. MECE is the structural rule underneath her Pyramid Principle, published as a book in 1985. Minto herself traces the underlying logic back to Aristotle.',
  },
  {
    question: 'Is MECE a framework or a principle?',
    answer:
      'Strictly, MECE is a principle. A framework is a specific structure you apply to a problem, such as the profitability formula or the 4Cs. MECE is the quality standard those frameworks have to meet. The phrase "MECE framework" is now used so widely that the two are treated as interchangeable in practice.',
  },
  {
    question: 'What is the difference between MECE and an issue tree?',
    answer:
      'MECE is the rule and an issue tree is the diagram that follows it. An issue tree breaks a question into sub-questions across multiple layers, and every layer of that tree should be mutually exclusive and collectively exhaustive. Think of MECE as the quality check and the issue tree as the artifact being checked.',
  },
  {
    question: 'Is it more important to be mutually exclusive or collectively exhaustive?',
    answer:
      'Collectively exhaustive matters slightly more, because a gap can hide the root cause and make every elimination you perform meaningless. Overlaps cost you time and clarity but rarely cost you the answer. In practice, fix overlaps first because they are easier to spot, then close any gap with an "Other" bucket.',
  },
  {
    question: 'Do you always need to be 100% MECE?',
    answer:
      'No. With about two minutes to build a structure in an interview, even experienced consultants rarely produce a perfect one. A structure that is roughly 80% MECE and clearly relevant to the specific case beats a flawless structure full of generic buckets. Prioritise mutual exclusivity, close gaps with "Other", and move on.',
  },
  {
    question: 'How many buckets should a MECE structure have?',
    answer:
      'Three to five at the top level. Fewer than three usually means you have not broken the problem down. More than five and neither you nor your interviewer can hold the structure in working memory. If you need more detail, add a second layer underneath rather than widening the first.',
  },
  {
    question: 'Can you use an "Other" bucket and still be MECE?',
    answer:
      'Yes, and it is standard practice at every major firm. When you cannot enumerate every possibility, name the categories that carry the bulk of the total and close the structure with an explicit "Other". The one condition is that "Other" stays a genuine remainder rather than becoming a place to hide things you did not want to think about.',
  },
  {
    question: 'When do interviewers actually test MECE?',
    answer:
      'Four moments: when you present your opening framework, when you answer a brainstorming question, when you narrow down a hypothesis mid-case, and when you deliver the final recommendation. The framework moment is the most visible, but candidates lose offers far more often on unstructured brainstorming answers.',
  },
  {
    question: 'Is MECE used outside consulting?',
    answer:
      'Widely. Product managers use it to segment features without double-counting, marketers to define audiences cleanly, engineers to rule out whole categories of failure at once, doctors to build differential diagnoses, and writers to outline arguments that neither repeat themselves nor skip an obvious point. Any structured decomposition benefits from it.',
  },
  {
    question: 'What are the criticisms of MECE?',
    answer:
      'Three main ones. It screens for completeness but not relevance, so a MECE structure can be padded with useless branches. It precludes redundancy, which is sometimes desirable. And it can impose artificial separation on genuinely interdependent causes. MECE is a tool for organising an investigation, not a claim that reality is cleanly separable.',
  },
  {
    question: 'How do I practise MECE thinking?',
    answer:
      'Structure one everyday decision a day: what to cook, how to spend a weekend, how to organise a wardrobe. Then apply the same reflex to business prompts and check each structure with a fast test for gaps, overlaps and level errors. Repetition is what makes it automatic under interview pressure.',
  },
  {
    question: 'What is the fastest way to make any answer MECE?',
    answer:
      'Split on "X versus not X". Internal versus external, quantitative versus qualitative, controllable versus uncontrollable, short term versus long term. By construction the two halves cannot overlap and cannot leave a gap, so you buy yourself a valid structure in one second and can fill in the detail while you talk.',
  },
];

/* ── Sources ───────────────────────────────────────────────────────── */

export interface Source {
  label: string;
  detail: string;
  href: string;
  kind: 'primary' | 'reference' | 'video' | 'book';
}

/**
 * Every claim on the page that is not a worked example traces to one of these.
 * Commercial competitors on this query cite essentially nothing; this list is
 * a real differentiator for both human trust and machine citation.
 */
export const MECE_SOURCES: Source[] = [
  {
    label: 'Barbara Minto: "MECE: I invented it, so I get to say how to pronounce it"',
    detail:
      'The primary source on the term’s origin and the pronunciation dispute, published by the McKinsey Alumni Center.',
    href: 'https://www.mckinsey.com/alumni/news-and-insights/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it',
    kind: 'primary',
  },
  {
    label: 'Barbara Minto, The Pyramid Principle: Logic in Writing and Thinking',
    detail:
      'First published 1985, revised 1996. The book that introduced MECE to a general audience as the structural rule beneath the Pyramid Principle.',
    href: 'https://www.barbaraminto.com/',
    kind: 'book',
  },
  {
    label: 'MECE principle, Wikipedia',
    detail:
      'The neutral reference entry, including the criticism section and the link back to Ranganathan’s canons.',
    href: 'https://en.wikipedia.org/wiki/MECE_principle',
    kind: 'reference',
  },
  {
    label: 'S. R. Ranganathan, Prolegomena to Library Classification (1937)',
    detail:
      'Sets out the Canon of Exhaustiveness and the Canon of Exclusiveness thirty years before MECE was named. The earliest formal statement of the same two rules.',
    href: 'https://en.wikipedia.org/wiki/S._R._Ranganathan',
    kind: 'book',
  },
  {
    label: 'Tim van Gelder, "What is MECE, and is it MECE?"',
    detail:
      'The best-known critique: MECE guarantees completeness but says nothing about whether the included items are relevant.',
    href: 'https://timvangelder.com/2010/06/04/what-is-mece-and-is-it-mece/',
    kind: 'reference',
  },
  {
    label: 'Arnaud Chevallier, Strategic Thinking in Complex Problem Solving',
    detail:
      'Oxford University Press, 2016, p. 78. Argues that MECE precludes redundancy even where redundancy is desirable or necessary.',
    href: 'https://global.oup.com/academic/product/strategic-thinking-in-complex-problem-solving-9780190463908',
    kind: 'book',
  },
  {
    label: 'W. Frazier Pruitt, "Some Assembly Required", Quality Progress (ASQ), May 2020',
    detail:
      'On reorganising Six Sigma DMAIC findings with MECE and SCQA so executive audiences get the point before the detail.',
    href: 'https://asq.org/quality-progress/articles/some-assembly-required?id=2fdaca65b02a4686b5a0e185f126e906',
    kind: 'reference',
  },
  {
    label: 'Learn MECE in 8 Minutes: 5 Easy Ways to be MECE',
    detail:
      'Hacking the Case Interview, 8 min 36 s. A clear video walkthrough of the main MECE split types by a former Bain manager.',
    href: 'https://www.youtube.com/watch?v=baAuw5XoHY8',
    kind: 'video',
  },
];

/* ── Internal links ────────────────────────────────────────────────── */

export interface InternalLink {
  title: string;
  blurb: string;
  href: string;
}

export const MECE_INTERNAL_LINKS: InternalLink[] = [
  {
    title: 'Structuring fundamentals',
    blurb: 'How to build the structure that MECE then checks, layer by layer.',
    href: '/learn/casebook/core-frameworks/structuring-fundamentals',
  },
  {
    title: 'The profitability framework',
    blurb: 'The equation split worked end to end, with the arithmetic.',
    href: '/learn/casebook/core-frameworks/profitability',
  },
  {
    title: 'Market entry',
    blurb: 'A segment-and-stakeholder structure applied to a real entry decision.',
    href: '/learn/casebook/core-frameworks/market-entry',
  },
  {
    title: 'Guesstimates',
    blurb: 'Where equation splits do the heaviest lifting, because every branch has to multiply back to the whole.',
    href: '/learn/casebook/guesstimates/pain-and-promise',
  },
  {
    title: 'Issue tree, in the glossary',
    blurb: 'The diagram MECE is usually applied to, with a worked example.',
    href: '/glossary/issue-tree',
  },
  {
    title: 'The MECE Casebook',
    blurb: 'Fifty-plus worked cases and guesstimates, free to read without an account.',
    href: '/learn/casebook/getting-started/what-it-tests',
  },
];

/* ── HowTo steps (schema) ──────────────────────────────────────────── */

export const MECE_HOWTO_STEPS = MECE_GRIPS_TEST.map((c) => ({
  name: `${c.letter} — ${c.name}`,
  text: `${c.question} ${c.fix}`,
}));

/* ── Word count (schema) ───────────────────────────────────────────── */

/**
 * Word count of everything held in this module, rounded to the nearest 100.
 * The page component adds roughly 1,200 further words of narrative prose that
 * are not modelled here, so this is a deliberate undercount rather than an
 * overclaim.
 */
export function meceWordCount(): number {
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  let n = words(MECE_DEFINITION);
  MECE_KEY_TAKEAWAYS.forEach((t) => (n += words(t)));
  MECE_HALVES.forEach((h) => {
    n += words(h.lead) + words(h.goodExample.md) + words(h.badExample.md);
    h.body.forEach((b) => (n += words(b)));
  });
  MECE_SEGMENTATION_TESTS.forEach((r) => (n += words(r.segmentation) + words(r.verdict)));
  MECE_SPLIT_METHODS.forEach((m) => {
    n += words(m.oneLiner) + words(m.how) + words(m.worked) + words(m.useWhen);
  });
  n += words(MECE_OTHER_BUCKET_NOTE);
  MECE_READY_STRUCTURES.forEach((s) => (n += words(s.structure)));
  MECE_GRIPS_TEST.forEach((c) => (n += words(c.question) + words(c.fix)));
  MECE_MISTAKES.forEach((m) => (n += words(m.md)));
  MECE_RELATED_CONCEPTS.forEach((c) => (n += words(c.whatItIs) + words(c.relationship)));
  MECE_CRITICISMS.forEach((c) => (n += words(c.md)));
  MECE_DRILLS.forEach((d) => (n += words(d.prompt) + words(d.answer)));
  MECE_FAQS.forEach((f) => (n += words(f.question) + words(f.answer)));
  MECE_SOURCES.forEach((s) => (n += words(s.detail)));
  return Math.round(n / 100) * 100;
}

/* ── Markdown serialization (llms-full.txt) ────────────────────────── */

/**
 * The page as plain markdown for llms-full.txt.
 *
 * This is the single highest-leverage AEO artifact on the site. Answer engines
 * that fetch llms-full.txt get the whole reference as clean text with the
 * canonical URL attached, which is what makes a citation back to us likely
 * rather than a paraphrase of somebody else's page.
 */
export function meceFrameworkMarkdown(siteUrl: string): string {
  const L: string[] = [];
  const strip = (s: string) => s.replace(/\*\*/g, '');

  L.push('# The MECE Framework');
  L.push('');
  L.push(`URL: ${siteUrl}${MECE_PAGE_PATH}`);
  L.push(`Last updated: ${MECE_PAGE_MODIFIED}`);
  L.push('');
  L.push('## Definition');
  L.push('');
  L.push(MECE_DEFINITION);
  L.push('');

  L.push('## Key takeaways');
  L.push('');
  MECE_KEY_TAKEAWAYS.forEach((t) => L.push(`- ${strip(t)}`));
  L.push('');

  MECE_HALVES.forEach((h) => {
    L.push(`## ${h.heading}`);
    L.push('');
    L.push(strip(h.lead));
    L.push('');
    h.body.forEach((b) => {
      L.push(strip(b));
      L.push('');
    });
    L.push(`Good example: ${strip(h.goodExample.md)}`);
    L.push('');
    L.push(`Failing example: ${strip(h.badExample.md)}`);
    L.push('');
  });

  L.push('## MECE vs non-MECE examples');
  L.push('');
  L.push('| Segmentation | Mutually exclusive | Collectively exhaustive | Verdict |');
  L.push('| --- | --- | --- | --- |');
  MECE_SEGMENTATION_TESTS.forEach((r) =>
    L.push(`| ${r.segmentation} | ${r.me} | ${r.ce} | ${r.verdict} |`)
  );
  L.push('');

  L.push('## The six ways to build a MECE split');
  L.push('');
  MECE_SPLIT_METHODS.forEach((m) => {
    L.push(`### ${m.n}. ${m.name}`);
    L.push('');
    L.push(m.oneLiner);
    L.push('');
    L.push(m.how);
    L.push('');
    L.push(`Worked example: ${m.worked}`);
    L.push(`Use when: ${m.useWhen}`);
    L.push('');
  });
  L.push(strip(MECE_OTHER_BUCKET_NOTE));
  L.push('');

  L.push('## Ready-to-use MECE structures');
  L.push('');
  L.push('| Problem | Structure | Built from |');
  L.push('| --- | --- | --- |');
  MECE_READY_STRUCTURES.forEach((s) =>
    L.push(`| ${s.problem} | ${s.structure} | ${s.built} |`)
  );
  L.push('');

  L.push('## The GRIPS test: how to check a structure is MECE');
  L.push('');
  MECE_GRIPS_TEST.forEach((c) => {
    L.push(`- ${c.letter} (${c.name}): ${c.question} Fix: ${c.fix}`);
  });
  L.push('');

  L.push('## Common MECE mistakes');
  L.push('');
  MECE_MISTAKES.forEach((m) => L.push(`- ${m.title}: ${strip(m.md)}`));
  L.push('');

  L.push('## MECE compared with related concepts');
  L.push('');
  L.push('| Concept | What it is | Relationship to MECE |');
  L.push('| --- | --- | --- |');
  MECE_RELATED_CONCEPTS.forEach((c) =>
    L.push(`| ${c.concept} | ${c.whatItIs} | ${strip(c.relationship)} |`)
  );
  L.push('');

  L.push('## Criticisms and limits of MECE');
  L.push('');
  MECE_CRITICISMS.forEach((c) => L.push(`- ${c.title}: ${strip(c.md)}`));
  L.push('');

  L.push('## Practice drills');
  L.push('');
  MECE_DRILLS.forEach((d, i) => {
    L.push(`${i + 1}. ${d.prompt}`);
    L.push(`   Answer: ${d.answer}`);
  });
  L.push('');

  L.push('## Frequently asked questions');
  L.push('');
  MECE_FAQS.forEach((f) => {
    L.push(`### ${f.question}`);
    L.push('');
    L.push(f.answer);
    L.push('');
  });

  L.push('## Sources');
  L.push('');
  MECE_SOURCES.forEach((s) => L.push(`- ${s.label} — ${s.href}. ${s.detail}`));
  L.push('');

  return L.join('\n');
}
