import type { Page } from '@/lib/casebook/types';

export const whatItTests: Page = {
  slug: 'getting-started/what-it-tests',
  title: 'What a case interview tests',
  titleEmphasize: 'tests',
  subtitle: 'Five things, graded at once, in real time. Most candidates can name them and still fail on the two they cannot see.',
  kind: 'concept',
  meta: { readingTimeMin: 9, tags: ['foundations'] },
  blocks: [
    { type: 'hook', md: 'Most people who fail a case interview were not outthought. They lost on two or three of the five things being graded — and the two that decide the most outcomes are the two they never knew to practise. This page makes all five visible, so you stop polishing what you are already good at and start fixing what is actually capping you.', emphasize: 'never knew to practise' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'You will be able to name the five things an interviewer grades — and, more usefully, see which ones *you* are weak on.',
      'You will stop over-investing in structure (the most prepared-for, least deciding dimension) and redirect effort to judgement, communication, and coachability.',
      'You will recognise that there is no single right answer — the path is graded, not the destination — and start committing to defensible positions instead of hedging.',
      'You will understand how the five dimensions trade off inside a live case, so you can prepare the *integration*, not just the parts.',
      'You will stop chasing firm folklore ("McKinsey only wants structure") and prepare the one rubric every firm actually shares.',
    ]},

    { type: 'prose', md: 'A case interview is a thirty-minute window into how you would behave on a real engagement, compressed into a puzzle small enough to fit on one page. Cracking the puzzle proves almost nothing. **How** you cracked it is the entire point — and "how" breaks down into five things the interviewer grades at the same time, continuously, from your first sentence to your last.' },

    { type: 'prose', md: 'Almost every candidate can recite these five dimensions. Far fewer can see which ones they personally fail on, because the two that matter most are the two hardest to observe in yourself. This page makes all five visible — and shows what each looks like at three levels of performance, so you can locate yourself honestly.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The five dimensions', emphasize: 'five dimensions' },

    { type: 'prose', md: 'Listed in the rough order candidates *think* they matter — which is almost the reverse of how often they decide outcomes.' },

    { type: 'steps', ordered: true, items: [
      { title: 'Structured problem-solving', md: 'Can you take a vague, ambiguous business problem and break it into pieces that are **mutually exclusive and collectively exhaustive**? This is the most teachable dimension and therefore the one candidates over-prepare. A clean structure is the price of entry, not the thing that wins.' },
      { title: 'Business judgement', md: 'Beyond the math — do you have a feel for how businesses actually work? When the interviewer says "margins are down 4 points," do you instinctively reach for the two or three likely causes, or do you treat it as an arithmetic exercise? Judgement is the dimension firms most want and least able to teach quickly. It is also the one most candidates cannot self-assess.' },
      { title: 'Quantitative comfort', md: 'You will multiply, divide, take percentages, and estimate without a calculator while someone watches. The bar is not Olympiad math — it is *unflustered* arithmetic. Calmness with numbers signals you can be put in front of a CFO unsupervised.' },
      { title: 'Communication & presence', md: 'Can you state a structure in 30 seconds, walk someone through your logic without losing them, and deliver a recommendation that sounds like a decision rather than a hedge? In the room, this routinely outweighs the quality of the analysis itself.' },
      { title: 'Coachability', md: 'When the interviewer pushes back, do you flinch, dig in, or update? Firms hire people they can put on a client team next week. This is the single most underestimated dimension — and the one most often failed without the candidate ever realising it happened.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'Why "graded at once" matters', md: 'These are not five sequential checkpoints. The interviewer is scoring all five continuously. You can produce a textbook profitability tree (structure: A), do the math flawlessly (quant: A), and still be rejected because your recommendation was three caveats with no point of view (communication: C) and you bristled when challenged (coachability: D). The lowest two scores usually decide the outcome — not the highest.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'What each dimension looks like at three levels', emphasize: 'three levels' },

    { type: 'prose', md: 'The fastest way to improve is to see the gap between where you are and where you need to be. Below, the same five dimensions rendered as observable behaviour at C, B, and A level. Read each row and locate yourself honestly — most candidates are an A on one or two dimensions and a C on one they have never examined.' },

    { type: 'comparison', title: 'Structured problem-solving', headers: ['C', 'B', 'A'], rows: [
      { cells: [
        'Lists topics ("we should look at costs, competition, customers") with no logic connecting them. The "structure" is a brainstorm.',
        'Produces a recognisable framework, MECE-ish, but generic — the same tree they would draw for any case of this type.',
        'Builds a structure tailored to *this* prompt, with branches that map to real levers, and signals which branch they will open first and why.',
      ]},
    ]},

    { type: 'comparison', title: 'Business judgement', headers: ['C', 'B', 'A'], rows: [
      { cells: [
        'Treats every number as a math problem. No prior expectation of what the data will show; surprised by everything.',
        'Has reasonable instincts but states them only when asked. Reactive rather than anticipatory.',
        'Forms a hypothesis before each piece of data ("I\'d expect feed costs up 6–10% given the monsoon — is that right?") and is rarely surprised, because they predicted the shape of the answer.',
      ]},
    ]},

    { type: 'comparison', title: 'Quantitative comfort', headers: ['C', 'B', 'A'], rows: [
      { cells: [
        'Freezes at mental math, makes zero-counting errors, cannot recover when a number looks wrong.',
        'Gets the arithmetic right but slowly, in silence, with no sense of whether the answer is plausible.',
        'Rounds aggressively, speaks the math aloud, sanity-checks before announcing, and attaches meaning to every figure.',
      ]},
    ]},

    { type: 'comparison', title: 'Communication & presence', headers: ['C', 'B', 'A'], rows: [
      { cells: [
        'Buries the answer at the end of a long ramble. The interviewer has to dig for the point.',
        'Clear but bottom-up — walks through the work and arrives at the conclusion last.',
        'Top-down every time: headline first, support second. Sounds like someone briefing a client, not a student showing working.',
      ]},
    ]},

    { type: 'comparison', title: 'Coachability', headers: ['C', 'B', 'A'], rows: [
      { cells: [
        'Defends the original answer when challenged, or collapses entirely and asks to restart.',
        'Accepts the pushback politely but does not actually change course — nods, then continues as before.',
        'Integrates the challenge visibly and fast: "Fair — that changes my read. Let me reorient," then genuinely reorients.',
      ]},
    ]},

    { type: 'callout', variant: 'tip', title: 'Use this as a self-diagnostic', md: 'After every practice case, score yourself C/B/A on all five dimensions — separately. Do not average them. The point is to find your lowest one, because that is almost certainly what is capping your performance. Most candidates discover their ceiling is a dimension they had never thought about — usually coachability or judgement, rarely structure.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The dimension nobody teaches: coachability', emphasize: 'coachability' },

    { type: 'prose', md: 'Structure, math, and communication get all the prep attention because they are visible and drillable. Coachability gets almost none, because most candidates do not believe it applies to them — everyone thinks they take feedback well. In the room, under pressure, far fewer actually do. Here is what the difference sounds like.' },

    { type: 'prose', md: 'Setup: the candidate has just proposed starting a profitability case on the cost side. The interviewer pushes back.' },

    { type: 'dialogue', title: 'Uncoachable — the defender', turns: [
      { speaker: 'interviewer', md: 'I\'m not sure cost is where I\'d start. Why there?' },
      { speaker: 'candidate', md: 'Well, I think cost makes sense because manufacturing businesses usually have a lot of cost levers, and the prompt mentioned rising input prices, so I\'d expect the issue to be on that side. I\'d like to continue with cost if that\'s okay.' },
      { speaker: 'narrator', md: 'The candidate heard the pushback as an obstacle to argue past, not a signal. They defended the original plan and asked permission to proceed unchanged.', note: 'This reads as ego-protection. The interviewer now expects the candidate to be hard to manage on a real team.' },
    ]},

    { type: 'dialogue', title: 'Coachable — the updater', turns: [
      { speaker: 'interviewer', md: 'I\'m not sure cost is where I\'d start. Why there?' },
      { speaker: 'candidate', md: 'Fair question — my reasoning was the input-price mention, but you\'re signalling revenue might be more important, and you\'d know the shape of this case better than I do. Let me reorient. On the revenue side, the two questions are whether the issue is volume or price-and-mix. Given the prompt said revenue is flat, I\'d actually expect a mix problem — let me start there.' },
      { speaker: 'narrator', md: 'The candidate treated the pushback as information, updated genuinely (not just politely), and produced a real new direction within seconds.', note: 'This is what "I can put this person on a client team next week" sounds like.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'The trap inside coachability', md: 'Coachability is NOT spinelessness. The failure mode on the *other* side is the candidate who abandons a perfectly good structure the instant the interviewer raises an eyebrow. Sometimes the interviewer is testing whether you will cave under mild pressure. The skill is judgement about *which* pushback is a genuine redirect and which is a test of conviction. When you are confident, you can hold ground gracefully: "I hear that — my reason for starting with cost is X, but I\'m happy to flip to revenue if you think that\'s more fruitful." That sentence is both coachable and confident. Pure capitulation is its own failure.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'How the dimensions trade off', emphasize: 'trade off' },

    { type: 'prose', md: 'The reason "just be good at all five" is useless advice is that the five dimensions *compete for the same thirty minutes and the same working memory*. Improving one often costs another if you are not deliberate. Three of the most common trade-off failures:' },

    { type: 'steps', ordered: false, items: [
      { title: 'Structure starves communication', md: 'The candidate so focused on building the perfect MECE tree that they present it as a monotone list of branches, lose the interviewer, and never recover the room. A B-grade structure delivered with presence beats an A-grade structure delivered as a recitation.' },
      { title: 'Math starves judgement', md: 'The candidate heads-down in the arithmetic, getting every digit right, while never lifting up to ask what the number *means* or whether it even matters to the decision. Perfect math on an irrelevant branch scores worse than rough math on the deciding one.' },
      { title: 'Communication starves coachability', md: 'The candidate so polished and rehearsed that they steamroll the interviewer\'s nudges — too busy delivering their prepared narrative to notice they are being redirected. Slickness can read as deafness.' },
    ]},

    { type: 'callout', variant: 'insight', title: 'The implication for how you prepare', md: 'Do not prepare the five dimensions in isolation. Prepare the *integration* — full cases where you have to hold all five at once. This is why mock interviews under realistic pressure are worth ten times more than reading framework summaries. The dimensions are easy alone and hard together, and "together" is the only condition the interview actually tests.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Do firms grade differently?', emphasize: 'firms' },

    { type: 'prose', md: 'Candidates spend enormous energy on firm folklore — "McKinsey only cares about structure," "Bain just wants someone likeable," "BCG loves creativity." It is worth being honest about how much of this is real, because chasing the myth wastes preparation.' },

    { type: 'prose', md: 'The truth: **all three of the major firms — and essentially every serious strategy consultancy — grade the same five dimensions.** What genuinely differs is two things, and neither is the rubric:' },

    { type: 'steps', ordered: true, items: [
      { title: 'Interview format', md: 'Some firms lean toward **interviewer-led** cases (the interviewer drives, asks you discrete questions in sequence — historically associated with McKinsey\'s PEI-plus-case format). Others lean toward **candidate-led** cases (you drive the whole case, the interviewer mostly reacts — historically associated with Bain and BCG). This is a real difference and it changes how much you must *drive* versus *respond*. It does not change what is being graded.' },
      { title: 'Cultural emphasis at the margin', md: 'At the edges, firms do weight tie-breakers slightly differently — a firm with a strong apprenticeship culture may give marginally more weight to coachability and warmth; a firm with a strong analytical brand may give marginally more weight to structure under ambiguity. But these are *tie-breakers between two strong candidates*, not different rubrics. A candidate who is A on all five passes everywhere; a candidate who is C on judgement fails everywhere.' },
    ]},

    { type: 'callout', variant: 'tip', title: 'What to actually do with firm differences', md: 'Two practical moves, and only two. First, find out whether your target firm runs interviewer-led or candidate-led cases and practise that format — it changes your rhythm. Second, for interviewer-led formats, be ready to answer discrete sub-questions cleanly; for candidate-led, be ready to drive without being prompted. Beyond that, ignore the folklore and prepare the five dimensions. The folklore is mostly cope from people explaining their rejections.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'What the case interview is not', emphasize: 'is not' },

    { type: 'prose', md: 'One myth is worth killing because candidates genuinely still believe it and it actively harms their performance:' },

    { type: 'callout', variant: 'pitfall', title: 'Myth: there is a right answer', md: 'For the large majority of cases, there are two or three defensible answers. The interviewer is testing the *path*, not the *destination*. Believing there is one correct answer makes candidates tentative — they hedge, waiting to be told they are right, instead of committing to a position and defending it. The candidates who pass commit to an answer they can defend and treat the interviewer as a colleague to convince, not an examiner with a key.' },

    { type: 'prose', md: 'The related myths — "it is a memory test," "speed wins," "it tests raw IQ" — are all variations on the same misunderstanding: that the case has a hidden correct output you must produce. It does not. It has a *process* you must demonstrate. Internalising that single shift changes how you sit in the chair.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'A thirty-second illustration', emphasize: 'illustration' },

    { type: 'prose', md: 'To make all five dimensions concrete, here is the same prompt answered at two levels. The prompt: *"Our client is a chain of premium salons in Mumbai. Same-store revenue has been flat for two years while the market grew 15%. What\'s going on?"*' },

    { type: 'dialogue', title: 'A weaker opening (B-minus)', turns: [
      { speaker: 'candidate', md: 'Okay, salons. So there could be a few reasons. Maybe pricing is off, maybe there\'s more competition now, maybe they\'re not marketing well — a lot of salons struggle with Instagram presence these days. I think I\'d want to look into all of those. Should I start with competition?' },
      { speaker: 'narrator', md: 'A list, not a structure. No hypothesis, no logic connecting the items, and it ends by handing the decision back to the interviewer.', note: 'Scores: structure C, judgement C, communication B, coachability B. Not disqualifying, but unmemorable.' },
    ]},

    { type: 'dialogue', title: 'A stronger opening (A)', turns: [
      { speaker: 'candidate', md: 'Same-store revenue moves for three reasons: how many customers walk in, how often each returns, and what they spend per visit. The market grew 15% while we stayed flat, so the question is whether we\'re losing footfall to competitors, losing repeat visits to substitutes, or losing wallet share within each visit. Flat revenue against a 15% market makes me suspect share loss on footfall most — so I\'d like to start there, unless you\'d point me elsewhere.' },
      { speaker: 'narrator', md: 'A clean three-way structure, a stated hypothesis grounded in the market-growth gap, a top-down delivery, and an explicit-but-humble starting point that invites redirection.', note: 'Scores: structure A, judgement A, communication A, coachability A — all five visible in thirty seconds.' },
    ]},

    { type: 'prose', md: 'Same prompt. Same thirty seconds. Same information available. The second answer earns marks on every dimension at once — which is the whole game. Notice especially that the strong answer did not need *more* knowledge than the weak one. It needed the five dimensions working together.' },

    { type: 'callout', variant: 'insight', title: 'The takeaway that changes how you practise', md: 'If you only remember one thing from this page: the interview does not reward knowing more. It rewards demonstrating the five dimensions, together, under pressure. That is a performance skill, and performance skills are built by performing — not by reading. Everything else in this casebook exists to give you something to perform with. The performing itself is on you.' },
  ],
};
