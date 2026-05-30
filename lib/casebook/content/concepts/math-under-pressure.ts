import type { Page } from '@/lib/casebook/types';

export const mathUnderPressure: Page = {
  slug: 'getting-started/math-under-pressure',
  title: 'Math under pressure',
  titleEmphasize: 'under pressure',
  subtitle: 'The bar is not advanced math. It is calm, fast, audible arithmetic while someone watches — and that is a skill you can drill to fluency in two weeks.',
  kind: 'concept',
  meta: { readingTimeMin: 11, tags: ['foundations', 'execution', 'quant'] },
  blocks: [
    { type: 'hook', md: 'Most candidates who fumble case math are not bad at math. They are bad at math *while being watched* — the arithmetic they would ace alone falls apart under a stranger\'s gaze and a ticking clock. The fix is not getting smarter. It is making the conditions familiar: the same techniques, the same layout, the same handful of base numbers, drilled until the pressure stops mattering. This page gives you all three.', emphasize: 'math while being watched' },

    { type: 'prose', md: 'You will multiply, divide, take percentages, compute growth rates, and estimate — all without a calculator, all out loud, all while an interviewer forms a judgement about whether you can sit in front of a client CFO. The good news: the bar is far lower than candidates fear. No calculus, no clever tricks. Just arithmetic you cannot rush and cannot fake, done calmly. Calm is the whole game, and calm comes from preparation, not talent.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Five techniques that make mental math calm', emphasize: 'five techniques' },

    { type: 'steps', ordered: true, items: [
      { title: 'Round first, sharpen later', md: 'On the first pass, round to whatever makes the arithmetic trivial. 437 becomes 400 or 450. 18.7% becomes 20%. Get a rough answer fast, *then* refine only if the answer sits near a decision threshold. "₹437 crore × 18.7% — call it ₹450 × 20% ≈ ₹90 crore as a first cut; closer to ₹82, but the decision doesn\'t hinge on the gap." Interviewers love this: it shows a sense of scale and it keeps you moving.' },
      { title: 'Use powers of ten, not zeros', md: 'India\'s population is 1.4 × 10⁹, not 1,400,000,000. Mistakes hide in zeros. Multiplying 1.4B × ₹250 → 1.4 × 250 = 350, then attach 10⁹ → ₹350B → ₹35,000 crore. Track the significant digits and the exponent separately and the zeros stop biting you.' },
      { title: 'Break percentages into easy pieces', md: '17% of 4,300? Don\'t reach for 0.17 × 4300. Do 10% (430) + 5% (215) + 2% (86) = 731. Percentages decompose into 10%, 5%, 1% chunks you can add. 10% is a decimal shift; 5% is half of that; 1% is two shifts. Almost any percentage is a small sum of these.' },
      { title: 'Divide by simplifying the ratio', md: 'For division, simplify before you compute. 9,700 ÷ 9 → think "9,700 ÷ 9 ≈ 9,000 ÷ 9 + 700 ÷ 9 = 1,000 + ~78 ≈ 1,078." Or cancel: 3,600 ÷ 45 → divide both by 9 → 400 ÷ 5 = 80. Reshaping the ratio beats long division every time.' },
      { title: 'Speak every step aloud', md: 'Narrate as you go: "1.4 billion people, 30% urban → 420 million; of those ~5% earn over ₹15 lakh → about 21 million; call it 20 million." This lets the interviewer catch an error early (cheap to fix) and shows the *reasoning*, which is what earns marks even when a number is rounded.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'Why rounding is a strength, not a shortcut', md: 'Junior candidates think precision signals competence, so they reach for 0.187 × 437 and grind. Senior candidates know that in a real client setting nobody trusts a back-of-envelope figure to three decimals anyway — so they round, move fast, and sharpen only the numbers that change the decision. Rounding well is a judgement signal. Grinding for false precision is the opposite.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Lay it out like this', emphasize: 'Lay it out' },

    { type: 'prose', md: 'Never do a step that matters in your head. Write it on paper in labelled rows, so a slip is visible and recoverable — the interviewer can point to the row, you fix it, you move on. A wrong answer with no visible working is unrecoverable, because neither of you can find where it broke. Here is the same market-sizing calculation laid out the way you should actually write it:' },

    { type: 'mathBox', title: 'Worked layout — sizing premium yoga apparel, urban India', md: 'Urban India population        ≈ 500 M\n× premium-income HH share     ≈ 50 M households earning > ₹15L\n× HH with a regular exerciser  × 60%        = 30 M people\n× who do yoga / pilates        × 25%        = 7.5 M\n× who buy purpose-built kit     × 50%        = ~3.75 M customers\n× annual spend per customer     × ₹4,500     = ₹16,875 M\n                                              ≈ ₹1,700 crore market\n\nSanity check: ₹1,700 cr is a small slice of the ~₹6 lakh cr\nIndian apparel market → plausible for a premium niche.\nBiggest sensitivities: premium-HH count, spend per customer.' },

    { type: 'callout', variant: 'tip', title: 'The layout rules', md: 'One operation per row. Label every row (what the number *is*, not just the figure). Keep a running result down the right. Circle the final answer. End with a one-line sanity check against something you already know. This format does double duty — it keeps *you* organised and it lets the interviewer follow your logic without interrupting.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The numbers to hold in your head', emphasize: 'numbers to hold in your head' },

    { type: 'prose', md: 'A small set of base figures turns almost any India sizing question into a quick chain of multiplications. Memorise the order of magnitude, not the exact digit — interviewers will not stop you to correct the third significant figure, but they will stop you if you say India has 400 million people.' },

    { type: 'table', headers: ['Quantity', 'Hold this', 'Useful for'], firstColHeader: false, rows: [
      ['Population', '~1.4 billion', 'Any sizing question'],
      ['Households', '~300 million (~4.5 per HH)', 'Durables, FMCG, services'],
      ['Urban share', '~35% (~500 million)', 'Retail, premium goods, mobility'],
      ['GDP', '~$3.7 trillion (~₹310 lakh crore)', 'Sector-size sanity checks'],
      ['Middle-class / affluent HH', '~50–60 million', 'Premium consumption'],
      ['Smartphone users', '~750 million', 'Digital, fintech, EdTech'],
      ['Cars sold per year', '~4 million', 'Auto, mobility, EV'],
      ['Two-wheelers sold per year', '~17–18 million', 'Mobility, lubricants, insurance'],
      ['Internet users', '~900 million', 'Any digital-adoption case'],
      ['Working-age population', '~950 million', 'Labour, gig economy, financial services'],
    ]},

    { type: 'callout', variant: 'note', title: 'These are anchors, not facts', md: 'Every figure here drifts year to year. The order of magnitude is what matters in a case. "Roughly 1.4 billion people, around 300 million households" is bulletproof; chasing the precise current number is wasted effort and false precision. Update the magnitudes every year or so and otherwise stop worrying about them.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Sanity-check before you speak', emphasize: 'Sanity-check' },

    { type: 'prose', md: 'The single most damaging math mistake is not an arithmetic slip — it is announcing a number that is obviously, embarrassingly wrong and not noticing. The fix is a reflex: before any figure leaves your mouth, ask "does this make sense against something I already know?"' },

    { type: 'steps', ordered: false, items: [
      { title: 'Check against a known total', md: 'If you size a market at ₹4 lakh crore, ask: is that bigger than the entire sector it sits inside? If your premium-yoga-apparel number exceeds total Indian apparel, you have an error — find it before the interviewer does.' },
      { title: 'Check the per-capita implication', md: 'Divide back by population. If your number implies every Indian spends ₹50,000 a year on your product, that is a red flag for most categories. Per-capita is a fast plausibility filter.' },
      { title: 'Check the order of magnitude', md: 'Is the answer in the right "zone" — crores, hundreds of crores, thousands of crores? A factor-of-ten error usually announces itself the moment you ask which zone you expected to land in.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'The self-caught vs interviewer-caught slip', md: 'A slip you catch yourself ("wait — that implies 14 billion passengers a year, more than the population; I\'ve dropped a factor of ten") is a *strength* signal: it shows you monitor your own work. The identical slip caught by the interviewer is a *weakness* signal. Same error, opposite outcome. The sanity-check reflex is what flips one into the other.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Defending — and challenging — the interviewer\'s number', emphasize: 'challenging' },

    { type: 'prose', md: 'Interviewers sometimes hand you a number to use. Most of the time you take it and run. But sometimes the number is a *test* — quietly implausible, to see whether you will swallow it or flag it. Knowing when to push back is a genuine business-judgement signal, and almost no candidate does it.' },

    { type: 'dialogue', title: 'Swallowing an implausible assumption (weak)', turns: [
      { speaker: 'interviewer', md: 'Assume the client can capture 60% market share within the first year of entry.' },
      { speaker: 'candidate', md: 'Okay, 60% share in year one. So if the market is ₹1,000 crore, that\'s ₹600 crore of revenue for us in year one…' },
      { speaker: 'narrator', md: 'A first-year entrant taking 60% share is wildly unusual. The candidate accepted it without a flicker — which tells the interviewer they have no internal model of what is normal.', note: 'This is the trap. The number was bait.' },
    ]},

    { type: 'dialogue', title: 'Flagging it gracefully (strong)', turns: [
      { speaker: 'interviewer', md: 'Assume the client can capture 60% market share within the first year of entry.' },
      { speaker: 'candidate', md: 'I\'ll use 60% since you\'ve given it — though I\'ll flag that a first-year entrant taking 60% share would be exceptional; new entrants usually take low-single-digit to low-double-digit share in year one unless the market is tiny or they\'re acquiring an incumbent. I\'ll run with 60%, but if the recommendation turns out to be sensitive to that assumption, I\'d want to stress-test it at, say, 10–15%.' },
      { speaker: 'narrator', md: 'The candidate used the number as instructed (coachable) while signalling they know it is abnormal (judgement) and proposing a sensitivity (rigour). All three at once.', note: 'You do not refuse the interviewer\'s number — you use it AND flag it.' },
    ]},

    { type: 'callout', variant: 'tip', title: 'The rule for pushback', md: 'Never refuse an interviewer\'s number outright — that reads as uncoachable. Instead: use it, *and* flag it if it is implausible, *and* offer a sensitivity. "I\'ll use X as given; I\'ll note it looks high/low because…; I\'d sanity-test the answer against a more typical value." That sentence proves you can follow instructions and think independently — the exact combination consulting wants.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Recovering from a visible error', emphasize: 'Recovering' },

    { type: 'prose', md: 'You will, at some point, announce a wrong number and realise it mid-sentence. How you recover is graded harder than the error itself.' },

    { type: 'comparison', title: 'The error-recovery moment', headers: ['Hide (C)', 'Fluster (B)', 'Own it (A)'], rows: [
      { cells: [
        'Quietly recomputes hoping nobody noticed, or doubles down on the wrong figure to avoid admitting the slip.',
        'Apologises three times, loses composure, lets the error rattle the rest of the case.',
        '"Let me correct that — I dropped a zero. ₹47 crore should be ₹470 crore. That actually strengthens the case, because the prize is now clearly worth the investment." Fixes it in one breath and uses it.',
      ]},
    ]},

    { type: 'callout', variant: 'insight', title: 'An error owned well can score points', md: 'Counter-intuitively, a cleanly recovered math error can leave a *better* impression than a flawless case — because it demonstrates composure under pressure, self-monitoring, and the ability to update without ego. Interviewers are not looking for people who never err. They are looking for people who catch and fix errors calmly, the way you would on a live client team.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Drill 1: mental arithmetic', emphasize: 'mental arithmetic' },

    { type: 'drill', title: 'Compute these the fast way', instructions: 'Do each in your head using the techniques above (decompose percentages, simplify ratios, powers of ten). Then check both the answer and the method. Speed and method matter more than perfection.', items: [
      { prompt: '17% of 4,300', answer: '**731.** Decompose: 10% = 430, 5% = 215, 2% = 86. Sum = 731. (Not 0.17 × 4300 by long multiplication.)' },
      { prompt: '₹35,000 crore is what % of a ₹3,20,000 crore sector?', answer: '**~11%.** 35,000 / 320,000 ≈ 35/320 ≈ 0.109. Simplify: 35/320 ≈ 35/350 = 0.10, nudge up slightly → ~11%.' },
      { prompt: '1.4 billion × ₹250', answer: '**₹350 billion = ₹35,000 crore.** 1.4 × 250 = 350, attach 10⁹. Convert: ₹350B = ₹35,000 cr (1 crore = 10⁷; ₹350 × 10⁹ ÷ 10⁷ = 35,000).' },
      { prompt: '9,700 ÷ 9', answer: '**~1,078.** 9,000/9 = 1,000; 700/9 ≈ 78; sum ≈ 1,078. Good enough to round to ~1,080.' },
      { prompt: 'A business grows from ₹600 cr to ₹1,500 cr in 5 years — roughly what CAGR?', answer: '**~20%.** It is 2.5× over 5 years. The rule of thumb: ~15%/yr doubles in ~5 years (rule of 72: 72/15 ≈ 4.8). 2.5× is more than double, so a bit above 15% — ~20% is the right ballpark. (Exact is ~20.1%.)' },
      { prompt: '₹4,500 × 3.75 million customers', answer: '**≈ ₹1,700 crore.** 4,500 × 3.75 = 16,875, so ₹16,875 million. Convert to crore: 1 crore = 10 million, so divide by 10 → ₹1,687.5 crore ≈ ₹1,700 crore.' },
    ], revealLabel: 'Show answers & methods' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Drill 2: sanity-check the figure', emphasize: 'sanity-check' },

    { type: 'drill', title: 'Is this number plausible?', instructions: 'For each, decide in a few seconds whether the figure passes a sanity check — and if not, roughly where the error is. This trains the reflex that catches errors before you say them.', items: [
      { prompt: 'A candidate sizes the Indian market for premium coffee at ₹8 lakh crore.', answer: '**Implausible — far too big.** ₹8 lakh crore is a meaningful fraction of India\'s entire consumer economy. The whole Indian coffee market (all segments) is a tiny fraction of that. Likely a factor-of-100+ error — probably confused crore and lakh, or over-counted the customer base.' },
      { prompt: 'A candidate estimates 50 million Indians fly domestically each year (unique flyers).', answer: '**Plausible.** Domestic air passengers are ~150M trips/year; unique flyers far fewer because frequent flyers repeat. 50M unique flyers (~3–4% of population, concentrated in the affluent/urban segment) passes the per-capita and order-of-magnitude checks.' },
      { prompt: 'A candidate concludes a D2C brand needs ₹2,000 customer-acquisition cost on a product with ₹800 average order value and no repeat purchase.', answer: '**Implausible as a business — the unit economics are upside down.** Paying ₹2,000 to acquire a customer worth ₹800 once loses ₹1,200 per customer. The number may be arithmetically fine but it flags a broken model — worth saying so, not just accepting it.' },
      { prompt: 'A candidate sizes annual two-wheeler sales in India at ~18 million units.', answer: '**Plausible — matches the base number.** ~17–18M two-wheelers/year is correct order of magnitude. Passes.' },
    ], revealLabel: 'Show verdicts' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'How to practise', emphasize: 'practise' },

    { type: 'prose', md: 'Math fluency under pressure is built by recreating the pressure, daily, in small doses. A two-week protocol that works:' },

    { type: 'steps', ordered: true, items: [
      { title: 'The daily 5×5', md: 'Five minutes, five problems, on paper, no calculator: one 3-digit × 3-digit multiplication, one division, one percentage, one growth-rate/CAGR, one sizing chain. Every day. By day ten the anxiety drops sharply — not because the math got easier, but because the *conditions* got familiar.' },
      { title: 'Narrate out loud', md: 'Do at least some problems speaking every step aloud, as you would in the room. Silent math and audible math are different skills; the interview tests the audible one.' },
      { title: 'Time-box the layout', md: 'Practise writing the labelled-row layout fast. The format should be automatic so that under pressure you reach for it without thinking.' },
      { title: 'Drill the base numbers cold', md: 'Once a week, write out the India base-numbers table from memory. They should be as automatic as your phone number — that is what lets a sizing question become a calm chain of multiplications instead of a panic.' },
    ]},

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'The bar is calm, audible, calculator-free arithmetic — not advanced math. Calm comes from familiarity, which comes from drilling.',
      'Five techniques make mental math reliable: round first then sharpen, use powers of ten, decompose percentages into 10/5/1% chunks, simplify ratios before dividing, and speak every step aloud.',
      'Lay every meaningful calculation out in labelled rows on paper, with a running result and a one-line sanity check. Visible working makes errors recoverable.',
      'Memorise the India base numbers by order of magnitude (1.4B people, ~300M households, ~500M urban, ~750M smartphones). They turn sizing into a chain of multiplications.',
      'Sanity-check before you speak. A self-caught slip is a strength; an interviewer-caught slip is a weakness — same error, opposite signal.',
      'Use the interviewer\'s number even when it is implausible — but flag it and offer a sensitivity. That combination shows coachability and judgement at once.',
      'Recover from a visible error in one calm breath and, if you can, use the correction. A well-owned error can score better than a flawless run.',
    ]},
  ],
};
