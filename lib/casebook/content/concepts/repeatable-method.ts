import type { Page } from '@/lib/casebook/types';

export const repeatableMethod: Page = {
  slug: 'getting-started/repeatable-method',
  title: 'A repeatable solving method',
  subtitle: 'Five moves, in order, every case. The same routine that lets strong candidates stay calm when the case turns hostile.',
  kind: 'concept',
  meta: { readingTimeMin: 16, tags: ['foundations', 'method'] },
  blocks: [
    { type: 'prose', md: 'The single biggest predictor of case-interview performance is not raw intelligence. It is **repeatability**. Strong candidates do the same five moves, in the same order, in every case they take. The prompts change. The numbers change. The industry changes. The method does not. That sameness is what frees up working memory for the thing the interviewer is actually grading — judgement under pressure.' },

    { type: 'prose', md: 'This page is the method. Five moves. A drill at the end of each move. A full case transcript at the end of the page, annotated against all five moves so you can see them assembled. Read it once linearly. Come back to individual sections the night before an interview.' },

    { type: 'callout', variant: 'insight', title: 'Why "method" beats "frameworks"', md: 'Frameworks are *what* you reach for. The method is *how* you reach. Candidates who memorise twenty frameworks but have no method tend to flail under pressure. Candidates with a sharp method and three frameworks tend to perform consistently. The method is the more durable skill — and the one that actually generalises across firms.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The five moves at a glance' },

    { type: 'table', headers: ['Move', 'Time', 'Purpose'], rows: [
      ['1 · Clarify', '60–90 sec', 'Confirm the question and pin down the objective'],
      ['2 · Structure', '90–120 sec', 'Lay out a MECE breakdown that responds to *this* prompt'],
      ['3 · Analyse', '18–22 min', 'Walk the structure, branch by branch, hypothesis-led'],
      ['4 · Synthesise', '60–90 sec', 'Distil the case into a single coherent story'],
      ['5 · Recommend', '60–90 sec', 'Deliver a top-down answer: action, reasons, risks'],
    ]},

    { type: 'prose', md: 'The proportions matter as much as the order. Roughly 8 minutes of structured opening and closing wrap roughly 20 minutes of open-middle analysis. Candidates who skimp on Move 1 or Move 2 burn the next 20 minutes solving the wrong problem. Candidates who skimp on Moves 4 and 5 do brilliant analysis and lose the case at the buzzer because they could not land the plane.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Move 1 · Clarify (60–90 sec)' },

    { type: 'prose', md: 'You have just been read a 3-sentence prompt. Before you do anything else, your job is to confirm you heard the right question. This sounds trivial. It is not. Roughly one in three rejected candidates answers a slightly different question than the one being asked, and discovers this at minute 18, when it is too late to recover.' },

    { type: 'prose', md: 'Move 1 has three jobs, executed in 60–90 seconds total:' },

    { type: 'steps', ordered: true, items: [
      { title: 'Play back the prompt in your own words', md: '*"So just to make sure I have this right — the client is a mid-sized Indian solar EPC firm, and they\'re trying to decide whether to vertically integrate into module manufacturing. Is that right?"* This forces the interviewer to confirm or correct your understanding *before* you have invested any structure in it. Mishearing a prompt is irrecoverable; getting it corrected here is free.' },
      { title: 'Pin down the objective', md: 'What does "success" look like — revenue, profit, market share, valuation at exit, social impact, defensive positioning? The structure you build depends on the goalpost. *"Is the client optimising for profit, or for strategic positioning over the next five years?"* The answers can lead to opposite recommendations on the same facts.' },
      { title: 'Ask one or two sharp context questions', md: 'Not a laundry list — one or two questions whose answers would change *which structure you reach for*. *"Is this a fresh entry, or are they responding to a competitor move?"* is sharp. *"What\'s the company\'s revenue?"* almost never changes the structure and so is rarely worth the time.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'The clarifying-question trap', md: 'Weak candidates use clarifying time to *stall*. They ask five questions hoping one will hand them the answer. Interviewers count them. The internal test before each question: *would the answer change which branch of my tree I open first?* If yes, ask it. If no, hold it for the analysis phase, where context-fishing is more forgivable.' },

    { type: 'comparison', title: 'Three candidates open the same prompt', headers: ['Weak (C)', 'Average (B)', 'Strong (A)'], rows: [
      { label: 'The prompt', cells: [
        '*"Our client is a regional dairy cooperative. Profit is down despite flat revenue. Why?"*',
        '*"Our client is a regional dairy cooperative. Profit is down despite flat revenue. Why?"*',
        '*"Our client is a regional dairy cooperative. Profit is down despite flat revenue. Why?"*',
      ]},
      { label: 'Opening response', cells: [
        '*"Okay, dairy. So, dairy is interesting. There\'s a lot going on in the dairy industry — milk prices, the cooperative structure, branding, distribution. Let me think… I\'d probably start with the cost side because dairy has a lot of input costs…"*',
        '*"Just to confirm — profit is falling but revenue is flat. So this is likely a cost-side issue or a mix issue. Could I ask what we mean by profit — gross margin, or operating?"*',
        '*"Just to confirm — profit is falling while revenue is flat, which usually means costs are rising or mix is shifting. Two quick questions before I structure: first, is the client optimising for short-term margin recovery or long-term competitive position? Second, has anything changed structurally in the last 12–24 months — input prices, a new entrant, a route or plant change?"*',
      ]},
      { label: 'What just happened', cells: [
        'Free-associated with the industry. No play-back, no objective check, no signal of which way they\'re going.',
        'Played back correctly and asked one decent question. But did not pin down the objective and did not ask a context question that would change structure.',
        'Played back. Pinned the objective. Asked exactly two questions, both of which change the analysis. Signalled a hypothesis without committing.',
      ]},
    ]},

    { type: 'heading', level: 3, text: 'Drill — practising Move 1' },

    { type: 'drill', title: 'Clarify in 60 seconds', instructions: 'For each prompt below, write or speak out loud — in under 60 seconds — (a) a play-back, (b) one objective-pinning question, and (c) one context question that would change your structure. Then check your version against the model answer.', items: [
      {
        prompt: '*"A large Indian QSR chain has seen its same-store sales decline for three consecutive quarters. The CEO wants to know what to do."*',
        answer: '**Play-back:** *"So same-store sales are falling for the third straight quarter, and the CEO wants a recommendation on how to reverse it — is that right?"* **Objective:** *"Is success defined as restoring same-store sales growth, or restoring profit per store? Those can have different answers if costs have also moved."* **Context:** *"Is this decline industry-wide — are competitors also seeing it — or is it specific to our client?"* (This last question changes everything: industry-wide → demand issue; client-specific → execution issue.)',
      },
      {
        prompt: '*"Our client is a global pharma major considering acquiring a mid-sized Indian generics manufacturer. Should they?"*',
        answer: '**Play-back:** *"So a global pharma is considering acquiring an Indian generics player, and they want to know whether to proceed."* **Objective:** *"What\'s the strategic motivation — access to the Indian market, lower-cost manufacturing for exports, or a specific portfolio gap they want filled?"* **Context:** *"Is the deal already on the table at a specific price, or are we earlier — still evaluating the strategic logic?"* (Different stages need different structures.)',
      },
      {
        prompt: '*"A state government wants to halve road accident deaths in five years. How?"*',
        answer: '**Play-back:** *"The state wants to cut road-accident deaths by 50% over five years, and we\'re advising on how."* **Objective:** *"Are we optimising purely for deaths, or for total casualties including serious injuries? And is there a budget constraint or can we propose policies that require new spending?"* **Context:** *"Do we have a profile of where deaths are concentrated — by road type (highways vs urban), by vehicle type (two-wheelers vs cars vs pedestrians), or by region? That shapes which levers are worth pulling."* (The answer to this single context question collapses what looks like a vast problem into 2–3 actionable interventions.)',
      },
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Move 2 · Structure (90–120 sec)' },

    { type: 'prose', md: 'You have clarified the question. Now you ask the interviewer for **30–60 seconds of thinking time** — verbatim: *"Could I take a minute to lay this out?"* No interviewer has ever refused this. Taking the minute is a *positive* signal, not a negative one. It says: I am about to be deliberate.' },

    { type: 'prose', md: 'In that minute you do exactly one thing: write a structure that is **MECE** (mutually exclusive, collectively exhaustive), is **anchored to the question** (not a generic profitability tree pasted onto a market-entry case), and is **actionable** (each branch has something a client could actually *do*, not just a topic to discuss).' },

    { type: 'prose', md: 'Then you present it, top-down, in 30–45 seconds. The classic shape:' },

    { type: 'quote', md: 'To answer whether the client should enter, I\'d look at two things. First, **is the market worth entering** — its size, growth, profitability, and competitive intensity. Second, **do we have a right to win** — our cost position, distribution access, and any unique capabilities. I\'d like to start with market attractiveness, since if the market itself is unattractive, the second question becomes moot.', attribution: 'A clean Move 2 delivery' },

    { type: 'callout', variant: 'tip', title: 'The "I\'d like to start with…" signal', md: 'Ending your structure with a deliberate starting point ("I\'d like to start with X because Y") is a small phrase that does heavy lifting. It signals you have a hypothesis, gives the interviewer a cheap chance to redirect ("actually, start with cost"), and removes the awkward "so… what now?" silence after the framework.' },

    { type: 'heading', level: 3, text: 'Three MECE checks before you speak' },

    { type: 'steps', ordered: true, items: [
      { title: 'No overlap', md: 'Can any single fact about the case fit into two of your branches? If yes, your branches overlap and you will count things twice in the analysis. "Customer segments" and "geographies" overlap; "B2B vs B2C" and "premium vs mass" overlap. Pick one axis per level.' },
      { title: 'No gaps', md: 'If something important happened to the client and your structure has no branch to hold it — your structure has a gap. A profitability tree without a "mix" branch is incomplete. A market-entry structure with no "right to win" arm is incomplete.' },
      { title: 'Actionable terminal nodes', md: 'Follow each branch down until you reach something a client could *do* — a price to set, a segment to target, a cost to renegotiate. If a branch ends at a topic ("competitive dynamics") rather than an action, it is too abstract to earn marks.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'Frameworks vs. structures', md: 'A *framework* is a generic mental model (4 P\'s, Porter\'s Five Forces, 3 C\'s). A *structure* is a specific tree you draw for a specific case. Frameworks inform structures; they are not substitutes for them. Saying "I\'ll use the 4 P\'s" without translating the 4 P\'s into the actual question is the canonical way to lose marks in minute three.' },

    { type: 'heading', level: 3, text: 'Drill — practising Move 2' },

    { type: 'drill', title: 'Structure in 90 seconds', instructions: 'For each prompt, take 60 seconds of silent thinking time, then write the 2–4 top-level branches of your structure with one sub-branch under each. Time yourself. Then compare to the model.', items: [
      {
        prompt: 'Structure: *"An Indian D2C skincare brand is launching a premium serum. What should they charge?"*',
        answer: '**Three lenses, used together:** (1) **Floor — cost-based.** What does it cost us to make and sell one bottle (COGS + customer acquisition + fulfilment)? Anything below this loses money per unit. (2) **Ceiling — value-based.** What willingness-to-pay can we extract — based on the value the customer perceives (claims, ingredients, results) and the price of substitutes (international brands available via Nykaa or Amazon)? (3) **Reference band — competitor-based.** Where do similar premium D2C serums sit today (₹2,000–₹5,000)? **Starting point:** I\'d open with value-based, since for a premium serum the value-side ceiling — not the cost-side floor — is the binding constraint on the recommendation.',
      },
      {
        prompt: 'Structure: *"A regional dairy brand sells ₹600 crore today. The board wants ₹1,500 crore by FY30. What\'s the playbook?"*',
        answer: '**Two arms:** (1) **Grow the core.** More volume in existing products and existing markets — through deeper distribution (more retail outlets, especially in Tier-3 towns), higher penetration per outlet, or share gain from rivals. (2) **Grow beyond the core.** New products (paneer, ghee, butter, yoghurt drinks), new geographies (adjacent states), or new channels (modern trade, quick-commerce, D2C). A simple math check: ₹600 cr → ₹1,500 cr in 5 years is ~20% CAGR. Decompose: how much can the core deliver at industry growth (say, 8–10%), and how much must come from beyond? That gap defines the strategy. **Starting point:** core first, since each rupee added there is cheaper than each rupee from new categories.',
      },
      {
        prompt: 'Structure: *"A two-wheeler EV startup wants to know whether to enter Tier-2 Indian cities."*',
        answer: '**Two arms (market entry):** (1) **Is the market attractive?** Size of the two-wheeler market in Tier-2 (the ICE base), EV adoption curve (vs Tier-1 today), competitive intensity (who\'s already there, what charging infrastructure exists), and unit economics (price points Tier-2 will bear). (2) **Do we have the right to win?** Our cost position vs incumbents, dealer/service network reach, financing partnerships (huge in Tier-2), and brand recognition outside metros. **Starting point:** market attractiveness, since Tier-2 EV economics may not yet support our pricing — that gates everything else.',
      },
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Move 3 · Analyse (18–22 min)' },

    { type: 'prose', md: 'This is the open middle. There is no clean script, because the case can branch in any direction. But the *shape* of strong analysis is recognisable, and it has six recurring habits. Every strong candidate displays all six. Every weak candidate fails on at least three.' },

    { type: 'heading', level: 3, text: 'The six habits of strong Move 3' },

    { type: 'steps', ordered: true, items: [
      { title: 'Drive the case', md: 'Strong candidates do not wait to be asked. After receiving data on one branch, they say what they conclude from it and where they want to go next: *"So feed costs are up 8% — that explains part of the margin compression. I\'d like to look at the mix shift on the revenue side next."* The interviewer should feel they are watching you think, not feeding you breadcrumbs.' },
      { title: 'Hypothesise before computing', md: 'Before you do any arithmetic, say what you *expect* the number to tell you and roughly what range would surprise you. *"If volume is up 12% but EBITDA is down 8 points, my expectation is fixed-cost dilution rather than a variable-cost issue, because variable costs typically scale with volume."* This is the single biggest tell of business judgement.' },
      { title: 'Numbers come with meaning', md: 'Never say a number without saying what it means. *"₹47 crore"* is a fact. *"₹47 crore, which is roughly 60% of the prize and large enough on its own to justify the investment"* is an insight. The first earns no marks; the second earns the case.' },
      { title: 'Update aloud', md: 'When new data arrives that changes your view, *say so*. *"This actually changes my earlier hypothesis — I had assumed price was the issue, but a 4% volume drop in the premium segment looks more important. I\'d like to dig into that."* Visible updating is what coachability looks like in real time.' },
      { title: 'Surface every few minutes', md: 'Every 2–3 minutes, step back from the detail and re-prioritise. *"Stepping back — on the cost side I\'ve established feed is the main driver. Before going deeper, I want to check the revenue side, because flat top-line with rising costs is a different story than falling top-line."* This habit prevents the most common Move 3 failure: getting lost in a branch.' },
      { title: 'Treat interviewer questions as redirects', md: 'When an interviewer says *"interesting — what about competitive dynamics?"*, that is rarely a casual question. It is a signal that the current branch is exhausted or wrong, or that an important branch is missing. Treat it as a redirect, not an aside.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'The hypothesis-led difference', md: 'A candidate who asks *"What\'s the feed cost figure?"* gets a number. A candidate who asks *"I\'d expect feed costs to have risen 6–10% given the monsoon failure last year — is that broadly right?"* gets the same number plus a signal that they have business judgement. The interviewer is grading the second question even if you ask it badly. Always lead with a hypothesis.' },

    { type: 'heading', level: 3, text: 'When the case turns hostile' },

    { type: 'prose', md: 'Three things can break the happy path in Move 3, and each has a stock response that strong candidates rehearse.' },

    { type: 'comparison', title: 'How to react when Move 3 breaks', headers: ['What happens', 'Weak reaction', 'Strong reaction'], rows: [
      { label: 'The interviewer rejects your structure', cells: [
        'Interviewer: *"Actually, I don\'t think cost-side is where I\'d start. Talk to me about revenue."*',
        'Defends the original structure: *"Well, I think cost-side still makes sense because…"* — sounds like ego-protection.',
        'Updates immediately and audibly: *"Fair — let me reorient. On revenue, the two questions are whether the issue is volume or price-and-mix. Given flat top-line, I\'d expect mix; let me start there."*',
      ]},
      { label: 'The math goes wrong', cells: [
        'You announce ₹47 crore, and realise mid-sentence you missed a factor of 10.',
        'Powers through or quietly recomputes hoping nobody noticed.',
        'Stops, owns it, recomputes visibly: *"Apologies — let me redo that. I dropped a zero. ₹47 crore should be ₹470 crore. That actually changes my read — the prize is much larger than I thought, which makes the recommendation easier."*',
      ]},
      { label: 'You hit a branch with no data', cells: [
        'Interviewer: *"I don\'t have data on competitor pricing — what would you do?"*',
        'Stalls or asks for the data again in a different way.',
        'Estimates from first principles: *"Without data, I\'d expect competitor pricing to fall in a 10–15% range around our price, based on the segment dynamics. If I assume that, my next question would be whether we\'re at the top or bottom of that band."*',
      ]},
      { label: 'You run out of time mid-branch', cells: [
        'Interviewer: *"We have about 4 minutes left — where are you?"*',
        'Speeds up and tries to finish everything. Quality collapses.',
        'Triage: *"I have one more thing to check on the cost side, but I think I have enough to land a recommendation. Let me give you my current view and flag what I\'d want to validate."*',
      ]},
    ]},

    { type: 'heading', level: 3, text: 'Drill — practising Move 3' },

    { type: 'drill', title: 'Hypothesise before you ask', instructions: 'For each data point an interviewer might offer, write the question you would *actually* ask — one that includes a hypothesis. The model answers show the contrast between a passive ask and a hypothesis-led ask.', items: [
      {
        prompt: 'You want to know about market growth rate for premium SUVs in India.',
        answer: '**Passive:** *"What is the market growth rate?"* **Hypothesis-led:** *"I\'d expect premium SUV growth in India to be running well above the broader auto market — perhaps 15–20% — given the segment-mix shift we\'ve seen over the last few years. Is that broadly right?"* The second version signals you know the sector and gives the interviewer a hook to either confirm or correct.',
      },
      {
        prompt: 'You want to know if a competitor recently changed prices.',
        answer: '**Passive:** *"Did the competitor change their prices?"* **Hypothesis-led:** *"Given the inventory build-up I\'d expect across the industry, my hypothesis is the competitor likely cut effective prices through promotions rather than list price. Has anything like that happened?"* This signals you understand the difference between list and net price — a real business-judgement marker.',
      },
      {
        prompt: 'You want to know the fixed-vs-variable cost split.',
        answer: '**Passive:** *"What\'s the cost structure?"* **Hypothesis-led:** *"For a manufacturing business at this scale, I\'d expect fixed costs to be roughly 30–40% of total — plant depreciation, salaried staff, baseline utilities. The rest scales with volume. Does that match what we see here?"* This shows you have a model of the industry, not just a generic question template.',
      },
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Move 4 · Synthesise (60–90 sec)' },

    { type: 'prose', md: 'Toward the end — usually when the interviewer says *"so what do you think?"* or you naturally run out of new branches — you synthesise. This is **not** a summary of what you did. It is the **answer to the question**, distilled into three sentences.' },

    { type: 'prose', md: 'A useful template: **The core issue is X. It is driven primarily by Y and secondarily by Z. The implication is W.** Three sentences. Hold yourself to three sentences. Anything longer is a sign you have not actually figured out what the answer is yet.' },

    { type: 'comparison', title: 'Synthesis: summary vs answer', headers: ['Summary (weak)', 'Recap (average)', 'Synthesis (strong)'], rows: [
      { cells: [
        '*"So I looked at revenue and cost. On revenue I found that volume was up but price was down. On cost I found feed costs were up 8%. There\'s also a mix shift happening with butter losing share to a new entrant…"*',
        '*"Putting it together — the issue is partly cost, partly mix. Feed has risen and butter share is down. So both sides are contributing."*',
        '*"The core issue is an adverse mix shift, not a cost problem. Customers are migrating from premium butter to commodity liquid milk, which has compressed blended margin by ~4 points. The feed cost rise is real but secondary. The implication: the right lever is brand defence on the premium line, not cost cutting."*',
      ]},
      { label: 'Why', cells: [
        'Walks the interviewer through the journey. The interviewer was there — they don\'t need the journey, they need the destination.',
        'Names the issues but doesn\'t rank them or commit to an interpretation. "Both sides are contributing" is true and useless.',
        'Identifies the *core* driver, ranks it against the secondary one, and states the *implication* that will drive Move 5. Three sentences, all signal.',
      ]},
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Move 5 · Recommend (60–90 sec)' },

    { type: 'prose', md: 'The recommendation is the only thing the client ever actually sees. It is also the move most candidates butcher, because they confuse "I have lots to say" with "I have a recommendation." A recommendation is *top-down*: answer first, then 2–3 supporting reasons, then risks with mitigations.' },

    { type: 'steps', ordered: true, items: [
      { title: 'Lead with the answer', md: '*"My recommendation is to defend the premium butter line rather than cutting feed costs."* One sentence. Verb is "recommend," not "I think" or "it depends."' },
      { title: 'Three supporting reasons in descending order of importance', md: '*"First, the size of the prize is larger — recovering even half the lost butter share is worth ~₹40 crore versus ~₹12 crore of feasible feed savings. Second, the entrant competes on price, which our client can disrupt with packaging and distribution rather than match on cost. Third, brand defence preserves long-term pricing power."*' },
      { title: 'Two risks with mitigations', md: '*"The main risks are that the entrant has deeper pockets — mitigated by leveraging our farmer network for a structural cost advantage — and that mix shift continues — mitigated by tracking it as a board KPI from this quarter."*' },
    ]},

    { type: 'callout', variant: 'tip', title: 'Why this order works', md: 'A senior partner reading a memo reads the first sentence, decides whether to read further, then either stops or skims the bolded text. The recommendation structure is engineered for that reader. In an interview, the interviewer\'s brain works exactly the same way — they decide if you are right within the first sentence, and spend the rest of your delivery looking for reasons to confirm or revise that judgement.' },

    { type: 'callout', variant: 'pitfall', title: 'The "it depends" trap', md: 'If you find yourself opening with *"It depends on a lot of factors…"* or *"There are arguments on both sides…"*, stop. The interviewer did not ask whether it depends; they asked what you would do. Pick a side, defend it, then flag the dependency as a risk. *"I\'d recommend X. The main thing that could change my view is Y, in which case I\'d shift to Z."* That is decisive *and* nuanced — which is what they are buying.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'A full case, annotated' },

    { type: 'prose', md: 'Here is what all five moves look like end-to-end in a single 28-minute case. The dialogue is condensed but every move is visible. Read it once for flow, then re-read with the annotations to see the method working in real time.' },

    { type: 'dialogue', title: 'Case prompt', turns: [
      { speaker: 'interviewer', md: 'Our client is a mid-sized Indian QSR chain — about 180 outlets, mostly in metros and Tier-1 cities, known for South Indian breakfast and snacks. Over the last 6 quarters, same-store sales have been declining roughly 3–5% per quarter, even though they\'ve been opening new stores. The CEO wants to know what to do. How would you approach this?' },
    ]},

    { type: 'callout', variant: 'note', title: 'Move 1 — Clarify', md: 'The candidate plays back, pins down the objective, and asks one context question. Total: ~70 seconds.' },

    { type: 'dialogue', turns: [
      { speaker: 'candidate', md: 'Let me play that back. The client is a 180-outlet South Indian QSR chain, mostly in metros and Tier-1. Same-store sales have been falling for 6 straight quarters at 3–5% per quarter — so we\'ve lost roughly 20% of comparable revenue per store over that period. Despite that, they\'re opening new stores. The CEO wants a recommendation on how to reverse the same-store decline. Is that right?' },
      { speaker: 'interviewer', md: 'That\'s right.' },
      { speaker: 'candidate', md: 'Two quick questions before I structure. First, is the goal to restore same-store sales growth specifically, or to restore total profitability of the chain? Those could lead to different recommendations.' },
      { speaker: 'interviewer', md: 'Profitability is the ultimate metric. Same-store sales is the lever the CEO is worried about.' },
      { speaker: 'candidate', md: 'Got it. Second — is the broader QSR industry in India growing, flat, or declining? In other words, are we losing share, or is everyone hurting?' },
      { speaker: 'interviewer', md: 'The broader Indian QSR market grew about 12% last year. Aggregator data suggests our segment — sit-down South Indian — grew about 4%.' },
      { speaker: 'candidate', md: 'So the segment is growing modestly, but we\'re going backwards. That suggests share loss, not category decline.', note: 'This is the candidate forming the first hypothesis before structuring.' },
    ]},

    { type: 'callout', variant: 'note', title: 'Move 2 — Structure', md: 'The candidate takes thinking time and lays out a clean tree. Total: ~110 seconds including the thinking-time pause.' },

    { type: 'dialogue', turns: [
      { speaker: 'candidate', md: 'Could I take a minute to lay out my structure?' },
      { speaker: 'interviewer', md: 'Of course.' },
      { speaker: 'narrator', md: '*[60 seconds of silent thinking and writing]*' },
      { speaker: 'candidate', md: 'Same-store sales can decline for three reasons, and I want to find which one is driving us. **First, footfall** — fewer customers walking into our outlets, either because they\'re going to competitors or because they\'re not eating out as much in our format. **Second, frequency** — existing customers coming back less often, perhaps because of changed habits, value perception, or substitution to delivery aggregators. **Third, ticket size** — customers spending less per visit, because of menu mix, smaller portions, or trade-down. Given the segment grew 4% while we declined 3–5%, my leading hypothesis is share loss on footfall — most likely to aggregator-fueled cloud kitchens and to better in-format competitors. I\'d like to start by validating that.' },
    ]},

    { type: 'callout', variant: 'note', title: 'Move 3 — Analyse', md: 'The candidate drives the case through three branches: footfall, ticket size, and then the structural question about new-store openings. ~18 minutes total. Edited for length but the rhythm is preserved.' },

    { type: 'dialogue', turns: [
      { speaker: 'candidate', md: 'On footfall, do we know how transaction count has moved per store over the six quarters?' },
      { speaker: 'interviewer', md: 'Transactions per store are down roughly 15% over that period.' },
      { speaker: 'candidate', md: 'So most of the same-store decline is footfall, not ticket size. If transactions are down 15% and same-store revenue is down ~18–20%, then about three-quarters of the issue is fewer customers, and the rest is ticket. That\'s consistent with the share-loss hypothesis. Do we have any data on how delivery has evolved for us — are we losing dine-in to delivery, or losing both?' },
      { speaker: 'interviewer', md: 'Dine-in transactions per store are down about 25%. Delivery transactions are up 30%, but off a small base — they\'re still only about 15% of total revenue.' },
      { speaker: 'candidate', md: 'That\'s revealing. The collapse is in dine-in, and delivery growth isn\'t compensating because it\'s starting from too small a base. Two follow-ups: what\'s happened to our delivery share specifically — are we under-indexed on Zomato and Swift relative to our offline presence? And on the dine-in side, has anything changed about our outlets — locations, format, refurbishment cycles?', note: 'The candidate signals an explicit "two follow-ups" — keeps the interviewer oriented.' },
      { speaker: 'interviewer', md: 'Delivery share is decent — we\'re in the top 5 in our category on aggregators. On dine-in, the outlet base is largely the same 180 outlets, average age 8 years. Most haven\'t been refurbished in the last 3 years.' },
      { speaker: 'candidate', md: 'Stepping back — delivery is fine, footfall in our existing dine-in outlets is collapsing, and our outlets are ageing without refresh. That sounds less like a competitive-loss story and more like an *outlet decay* story. Customers may not be choosing our competitors over us — they may be choosing newer, fresher options because ours feel tired. Let me check ticket size briefly before I commit to that view.', note: 'The "stepping back" move — surfacing up to re-prioritise.' },
      { speaker: 'candidate', md: 'On ticket size — is the decline driven by menu mix shifts (people ordering cheaper items) or by smaller groups (fewer people per visit)?' },
      { speaker: 'interviewer', md: 'Mix is broadly stable. Group size is down — average from 2.4 to 2.0 per dine-in visit.' },
      { speaker: 'candidate', md: 'Smaller groups, ageing outlets, falling dine-in — these all point to the same thing. Our outlets are losing their role as a destination. People aren\'t bringing the family for breakfast on Sunday the way they used to. That\'s not a price or product issue; it\'s an experience issue.' },
      { speaker: 'candidate', md: 'One last thing — the CEO is opening new stores while same-store sales fall. That worries me. Do we know how new stores perform in their first year compared to mature stores?' },
      { speaker: 'interviewer', md: 'New stores hit roughly 60% of mature-store revenue in year one, versus 80%+ five years ago.' },
      { speaker: 'candidate', md: 'So the new-store playbook is breaking too. The CEO is masking the same-store decline by adding outlets that themselves underperform the historical curve. That changes the recommendation — fixing the core has to come before expansion.', note: 'This is a meaningful update — the candidate has shifted from "fix same-store" to "fix same-store *and* slow new-store openings until the model works."' },
    ]},

    { type: 'callout', variant: 'note', title: 'Move 4 — Synthesise', md: 'The candidate distils the case to its core, in three sentences, before recommending. ~70 seconds.' },

    { type: 'dialogue', turns: [
      { speaker: 'candidate', md: 'Let me pull this together. **The core issue is outlet decay, not competitive loss.** Same-store revenue is down ~18–20% over six quarters, three-quarters of which is dine-in footfall collapse, driven by ageing outlets and shrinking group sizes — not by loss of share to specific competitors. The implication is that the lever is **outlet experience refresh**, and any new-store expansion should pause until the unit economics of the format are repaired.' },
    ]},

    { type: 'callout', variant: 'note', title: 'Move 5 — Recommend', md: 'Top-down: action, three reasons, two risks with mitigations. ~80 seconds.' },

    { type: 'dialogue', turns: [
      { speaker: 'candidate', md: 'My recommendation has two parts. First, **freeze new-outlet openings for the next 12 months** and redirect that capital into refurbishing the existing 180 outlets — focusing on the format, lighting, and seating that turn dine-in back into a destination experience. Second, **selectively trial a smaller, denser format** in a few markets to test whether the chain\'s real path forward is fewer-but-fresher rather than more-of-the-same.' },
      { speaker: 'candidate', md: 'Three reasons. First, the size of the prize: a refresh that recovered half the lost dine-in footfall would add roughly 10% to system-wide revenue and far more to profit, because the cost base is largely fixed. Second, new stores are now hitting only 60% of mature performance, so each new outlet *destroys* short-term ROI — pausing them stops the bleed. Third, refurbishment is a controllable lever, while competitive responses to cloud-kitchen entrants are not — we\'re betting on something we can execute.' },
      { speaker: 'candidate', md: 'Two risks. The CEO\'s growth narrative depends on outlet count — mitigated by reframing the year as "refurbishment-led growth" with clear KPIs on same-store recovery. And the refresh itself may fail if customer preferences have structurally moved against the format — mitigated by piloting refurbishment in 15–20 outlets first and measuring footfall recovery before scaling.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'What just happened', md: 'All five moves visibly. The candidate played back (Move 1), structured cleanly with a hypothesis (Move 2), drove the analysis with hypothesis-led questions, surfaced up twice, updated the hypothesis once (Move 3), synthesised in three sentences (Move 4), and recommended top-down with reasons and mitigated risks (Move 5). The case is not "right" — there are other defensible answers. But the *method* is legible end-to-end, which is what the interviewer is grading.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'How to practise the method' },

    { type: 'prose', md: 'The method is drilled, not absorbed. Reading this page once will not install it. Six weeks of deliberate practice will. A simple weekly cadence:' },

    { type: 'steps', ordered: true, items: [
      { title: 'One full mock per week, recorded', md: 'Mock case with a partner, recorded on your phone. After the case, listen back at 1.5× — painful but the fastest way to hear your own filler words, hedges, and dropped signposts.' },
      { title: 'Three Move-1 drills per week', md: 'Pick three case prompts from this casebook (or anywhere). For each, write play-back + objective + context question in under 60 seconds. Self-score against the model answers.' },
      { title: 'Two Move-2 drills per week', md: 'Same prompts. Time yourself: 60 seconds of silent thinking, 45 seconds to present the structure aloud. Record. Listen back.' },
      { title: 'Math drills every day', md: 'Five problems, paper-and-pen, five minutes (this is covered in detail on the Math page).' },
      { title: 'A weekly Move-5 close', md: 'Take any case you\'ve already done. Write the recommendation cold — action, three reasons, two risks — in 90 seconds. Speak it aloud. Compare against your original close.' },
    ]},

    { type: 'callout', variant: 'tip', title: 'The "one weakness per cycle" rule', md: 'Do not try to fix everything at once. After each mock, identify the *single* move that broke down hardest. For the next week, drill only that move. The casebook gives you enough material to drill any one move in isolation. By week 6, weaknesses run out faster than time does — which is when you are ready.' },

    { type: 'divider' },

    { type: 'keyTakeaways', items: [
      'Five moves in order, every case: Clarify → Structure → Analyse → Synthesise → Recommend. The proportions matter — ~8 minutes wrap around ~20 minutes of open middle.',
      'Move 1: play back, pin the objective, ask 1–2 context questions that would change your structure. Not a stall.',
      'Move 2: take explicit thinking time. Present top-down in 45 seconds. End with a deliberate starting point.',
      'Move 3: drive the case. Hypothesise before computing. Attach meaning to every number. Update aloud. Surface every few minutes. Treat interviewer questions as redirects.',
      'Move 4: three sentences — core issue, primary driver, implication. The synthesis is the answer, not a recap.',
      'Move 5: top-down recommendation. Action → three reasons → two risks with mitigations. The verb is "recommend."',
      'The method is drilled, not absorbed. Six weeks of single-move drills plus weekly recorded mocks installs it permanently.',
    ]},
  ],
};
