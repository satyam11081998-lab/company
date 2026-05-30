import type { Page } from '@/lib/casebook/types';

export const navigatingBlendedCases: Page = {
  slug: 'getting-started/navigating-blended-cases',
  title: 'Navigating tricky & blended cases',
  titleEmphasize: 'blended cases',
  subtitle: 'Real cases refuse to stay in one box. They braid two shapes together, hide inside vague prompts, or turn out to be something other than what you first guessed. Here is how to stay in control when that happens.',
  kind: 'concept',
  meta: { readingTimeMin: 9, tags: ['foundations', 'taxonomy'] },
  blocks: [
    { type: 'hook', md: 'Clean classification gets you through the first minute. Then the case stops behaving. A market-entry prompt turns into a profitability question the moment you decide to enter. An "unconventional" prompt looks structureless until you spot the pattern underneath. You build a growth tree and the data keeps screaming cost. The candidates who stand out are not the ones who never get surprised — they are the ones who navigate the surprise out loud, deliberately, without losing the room.', emphasize: 'navigate the surprise out loud' },

    { type: 'prose', md: 'The previous page trained the reflex: prompt in, shape out. This page is about everything that reflex does not cover — the three ways real cases break the clean taxonomy, and the specific moves that keep you in command when they do.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Cracking the "unconventional" bucket', emphasize: 'unconventional' },

    { type: 'prose', md: 'Most resources stop at "use first principles" — which is no help when your pulse is at 110. In practice, the cases labelled unconventional fall into four recurring sub-patterns, each with its own opening structure. Recognising the sub-pattern restores the scaffolding you thought the prompt had taken away.' },

    { type: 'table', headers: ['Sub-pattern', 'Sounds like', 'Opening structure'], firstColHeader: false, rows: [
      ['**Operations / bottleneck**', '"Reduce wait times at the airport," "the factory can\'t meet demand"', 'Map the process end to end → find the constraint (the slowest step) → attack it. Throughput is set by the bottleneck, nothing else.'],
      ['**Public-sector / social**', '"Cut road deaths 30%," "improve vaccination coverage"', 'Pin the objective and constraint (budget? politics?) → segment where the problem concentrates → match interventions to the biggest segments by impact-per-rupee.'],
      ['**Design / "build a business"**', '"Design the next IPL franchise," "launch a new airline"', 'Objective → who is the customer → what is the offer → how do we make money → what could kill it. A market-entry cousin, built forward.'],
      ['**Brainteaser / estimation**', '"How many EV charging points does Delhi need?"', 'A guesstimate in disguise — segment, build bottom-up or top-down, state assumptions aloud. (Covered in depth on the Guesstimates pages.)'],
    ]},

    { type: 'callout', variant: 'tip', title: 'The universal unconventional opener', md: 'When you genuinely cannot place the sub-pattern, fall back to this and you will rarely look lost: **"Let me start from the objective. What exactly are we optimising, and what constraints are we under? Then I\'ll work out the levers that move that objective the most."** Objective → constraints → levers is the structure that survives contact with any weird prompt.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'When cases braid', emphasize: 'braid' },

    { type: 'prose', md: 'Here is the thing the casebooks rarely admit: real cases are not pure. A market-entry case becomes a profitability case the moment you decide to enter and ask "will it actually make money?" A growth case contains a pricing case inside one of its branches. A pricing case opens into a competitive-response case. The shape you started with is not the shape you finish in.' },

    { type: 'prose', md: 'This is where candidates who memorised "one framework per case type" come undone — they try to force the whole interview through the first shape they spotted. The skill is not picking the one true shape. It is **knowing which shape you are inside at each moment, and saying so when you switch.** Watch the transition handled well:' },

    { type: 'dialogue', title: 'A market-entry case braiding into profitability', turns: [
      { speaker: 'narrator', md: 'The candidate has spent ten minutes establishing that the Indian market for premium electric two-wheelers is attractive — growing fast, not yet saturated. They now pivot.' },
      { speaker: 'candidate', md: 'So I\'m satisfied the market is attractive. But "attractive market" doesn\'t mean "we make money," so I want to shift from the market question to a profitability question for our specific entry: at the price Tier-2 buyers will bear, do the unit economics actually work after battery cost, dealer margin, and financing subvention?' },
      { speaker: 'interviewer', md: 'Go on — what would you need to believe?' },
      { speaker: 'candidate', md: 'I\'d need contribution per scooter to be positive after variable costs, and the fixed cost of setting up dealerships and service to be recoverable within a reasonable volume ramp. So I\'m now effectively running a profitability tree on the entry scenario — revenue per unit minus variable cost, scaled against the fixed investment. Can I get the rough bill-of-materials and the target retail price?' },
      { speaker: 'narrator', md: 'The candidate named the braid explicitly — "I want to shift from the market question to a profitability question" — so the interviewer always knows which shape is active. That sentence is the whole skill.', note: 'Naming the transition is what separates a candidate who is in control from one who is drifting.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'The phrase that signals control', md: 'The braiding move always sounds the same: *"I\'m satisfied on X, so I want to shift from [shape A] to [shape B], because [reason]."* It tells the interviewer you are navigating deliberately, not wandering. Practise that sentence until it is automatic — it is one of the highest-signal things you can say in any case.' },

    { type: 'heading', level: 3, text: 'The common braids', emphasize: 'common braids' },

    { type: 'prose', md: 'A handful of braids recur often enough to anticipate. Knowing them in advance means you see the transition coming instead of being surprised by it.' },

    { type: 'table', headers: ['Starts as', 'Braids into', 'At the moment when…'], rows: [
      ['Market entry', 'Profitability', 'you decide the market is attractive and ask whether *your* entry makes money'],
      ['Growth', 'Market entry', 'a growth lever turns out to be a new geography or category you must evaluate entering'],
      ['Growth', 'Pricing', 'the fastest growth lever is repricing the existing product'],
      ['Pricing', 'Competitive response', 'the pricing decision hinges on how rivals will react'],
      ['M&A', 'Profitability', 'you assess whether the target is a fundamentally healthy business'],
      ['Profitability', 'Operations', 'the cost leak traces back to a process bottleneck on the floor'],
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'When you guess the shape wrong', emphasize: 'guess the shape wrong' },

    { type: 'prose', md: 'You will sometimes misdiagnose. You label a case "growth," build the tree, and at minute eight the data refuses to fit — the interviewer keeps steering you toward a cost leak, or the numbers only make sense as a profit problem. This moment feels like failure. It is actually an opportunity to score on coachability, *if* you handle it cleanly.' },

    { type: 'comparison', title: 'The misdiagnosis moment', headers: ['Panic (C)', 'Grind (B)', 'Recover (A)'], rows: [
      { cells: [
        'Freezes, apologises, asks to "start over," visibly rattled. The misread becomes a confidence collapse.',
        'Notices the misfit but pushes the original tree through anyway, forcing data into branches where it doesn\'t belong. Lands a muddled answer.',
        'Names it and re-anchors: "The data isn\'t fitting a growth story — costs keep coming up. I think this is actually a profitability problem. Let me re-anchor on revenue minus cost." Then moves on, unflustered.',
      ]},
    ]},

    { type: 'callout', variant: 'tip', title: 'Misdiagnosis is cheap if you catch it early', md: 'The cost of a wrong shape is small if you correct it in the first few minutes and large if you discover it at minute twenty. This is exactly why the clarify step and the shape-spotting tells matter — they front-load the diagnosis when correcting it is still free. And when you do misread, the recovery sentence — "the data isn\'t fitting X, I think this is actually Y, let me re-anchor" — turns a stumble into a coachability point.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Drill: disguised & blended prompts', emphasize: 'disguised & blended' },

    { type: 'drill', title: 'Ten harder prompts', instructions: 'For each prompt, decide the shape in under ten seconds before reading the answer. Some are deliberately disguised, and several braid two shapes — name the *starting* shape and any braid you see. This is the harder companion to the clean drill on the previous page.', items: [
      { prompt: 'A Bengaluru cloud-kitchen operator has seen order volume rise 20% but is losing more money each month. What should they do?', answer: '**Profitability.** Volume up, losses up → cost or unit-economics problem, not demand. The rising-volume-falling-profit pattern is the classic profitability tell. (Watch for a braid into operations if the issue turns out to be delivery-radius economics.)' },
      { prompt: 'A textile exporter wants to know if it should start selling directly to consumers online instead of only to wholesalers.', answer: '**Market entry** (entering the D2C channel) — with a near-certain **braid into profitability** (do the D2C unit economics beat the wholesale margin after CAC and returns?). Start with attractiveness + right-to-win, expect to pivot to profit.' },
      { prompt: 'A hospital chain wants to cut the average patient wait time in its emergency departments by half.', answer: '**Unconventional → operations/bottleneck.** Map the patient journey, find the constraint step (triage? bed availability? discharge?), attack the bottleneck. Not a P&L case.' },
      { prompt: 'A ride-hailing firm wants to reach profitability within 18 months without raising fares. What levers does it have?', answer: '**Profitability** (the goal is reaching profit) with a hard constraint (no fare increase) that pushes you toward the cost side and non-fare revenue. Watch for a braid into growth if non-fare revenue means launching new lines.' },
      { prompt: 'A state wants to increase the share of children completing secondary school in its poorest districts.', answer: '**Unconventional → public-sector/social.** Pin the objective and constraints (budget, political feasibility), segment where dropout concentrates, match interventions to the biggest segments by impact-per-rupee.' },
      { prompt: 'A competitor just dropped prices 20% in our largest market. The CEO is panicking. What do we do?', answer: '**Pricing / competitive response.** Competitor-move trigger. Before matching, diagnose: is it a real threat (will we lose share?) or noise? Then weigh match / hold / differentiate. A reflexive price-match is the trap.' },
      { prompt: 'A profitable FMCG company with flat sales wants to know whether to acquire a fast-growing D2C brand or build a competing one in-house.', answer: '**M&A** (buy-vs-build is an acquisition question at its core) — braiding into **growth** (the underlying goal) and a flavour of **market entry** (the in-house option is entering the D2C space). Start by framing buy-vs-build, then evaluate the target.' },
      { prompt: 'An airline\'s on-time performance has collapsed and customer complaints are rising, though revenue is stable. Fix it.', answer: '**Unconventional → operations.** Revenue stable rules out a pure profitability framing; the problem is operational reliability. Map the turnaround process, find the bottleneck (crew scheduling? maintenance? gate availability?).' },
      { prompt: 'A two-wheeler EV startup that sells well in metros wants to know how to triple revenue over three years.', answer: '**Growth** (future target) → almost certainly **braids into market entry** (Tier-2/3 expansion) and possibly **pricing** (a cheaper model to open new segments). Start growth, size core vs beyond-core, expect the entry braid.' },
      { prompt: 'A PE-owned packaging company is three years into the hold. The fund wants to know how to maximise exit value in 18 months.', answer: '**M&A / PE (exit lens)** braiding into **profitability** (margin expansion is the fastest value lever) and possibly **growth** (a bolt-on acquisition to bump scale before exit). Frame around what moves the exit multiple and EBITDA.' },
    ], revealLabel: 'Show shapes & reasoning' },

    { type: 'callout', variant: 'tip', title: 'Build the navigation reflex', md: 'Do this drill cold, then take ten fresh prompts from the case chapters in this casebook and label each one\'s starting shape *and* the braid you expect. Within a couple of weeks you will stop being surprised by transitions — you will see them coming and name them before the interviewer does. That foresight is what separates a candidate who looks rattled from one who looks like they have done this a hundred times.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      '"Unconventional" is not unstructurable — it splits into operations, public-sector, design, and brainteaser sub-patterns, each with an opening structure. Universal fallback: objective → constraints → levers.',
      'Real cases braid. Know which shape you are inside at each moment, and name the transition out loud: "I\'m satisfied on X, so I\'m shifting from A to B because…"',
      'A handful of braids recur (market entry → profitability, growth → market entry, pricing → competitive response). Anticipate them so transitions never surprise you.',
      'When you misdiagnose, recover cleanly: "the data isn\'t fitting X, I think this is actually Y, let me re-anchor." Caught early, a wrong shape is cheap — and the recovery scores coachability.',
      'Naming transitions deliberately is one of the highest-signal things you can do in any case. It is the difference between looking in control and looking lost.',
    ]},
  ],
};
