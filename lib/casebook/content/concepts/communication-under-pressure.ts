import type { Page } from '@/lib/casebook/types';

export const communicationUnderPressure: Page = {
  slug: 'getting-started/communication-under-pressure',
  title: 'Communication under pressure',
  titleEmphasize: 'Communication',
  subtitle: 'The same analysis, delivered two ways, earns two different scores. In the room, how you sound routinely outweighs what you found. This page is the operating manual.',
  kind: 'concept',
  meta: { readingTimeMin: 11, tags: ['foundations', 'execution', 'communication'] },
  blocks: [
    { type: 'hook', md: 'A case interview is a spoken exercise, and you are graded on the spoken part — not the thinking you did silently. Two candidates can reach the identical answer and walk away with different verdicts, because one sounded like a consultant briefing a client and the other sounded like a student showing working. The difference is not charisma. It is a small set of patterns and phrases you can learn and rehearse until they are automatic.', emphasize: 'how you sound, not just what you found' },

    { type: 'prose', md: 'Communication is the most under-prepared of the five graded dimensions, because candidates assume it is a fixed personality trait — you are either articulate or you are not. It is not. It is a set of mechanics: leading with the headline, signposting transitions, pausing deliberately, and recovering cleanly when you stumble. Every one of those is learnable, and this page gives you the scripts.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Speak top-down, every single time', emphasize: 'top-down' },

    { type: 'prose', md: 'This is the master rule from which most of the others follow. Whenever you open your mouth — presenting a structure, reporting an analysis, delivering a recommendation, answering a side question — lead with the **headline**, then give the support. Never make the interviewer wait for the point. Never narrate your way *toward* a conclusion; state the conclusion and then justify it.' },

    { type: 'columns', columns: [
      [
        { type: 'callout', variant: 'pitfall', title: 'Bottom-up (weak)', md: '"So I looked at volume, and it\'s up 4%. Then I checked price, and it\'s down 7%. So the price drop outweighs the volume gain. So revenue is actually down. So the problem is on the revenue side."' },
      ],
      [
        { type: 'callout', variant: 'tip', title: 'Top-down (strong)', md: '"The problem is on the revenue side. A 7% price decline is outweighing a 4% volume gain, so revenue is down despite selling more. I\'d like to dig into the price decline next."' },
      ],
    ]},

    { type: 'prose', md: 'Same facts, same conclusion. The top-down version lands the headline in the first six words, is shorter, and signals the next step. The bottom-up version makes the interviewer hold four facts in suspense before learning why any of them mattered. Under the cognitive load of grading you live, that suspense is a cost — and you pay it.' },

    { type: 'callout', variant: 'insight', title: 'Why top-down wins, mechanically', md: 'A senior listener decides whether you are right within your first sentence, then spends the rest of your answer looking for confirmation or contradiction. Top-down delivery hands them the thesis immediately, so the rest of your words reinforce a judgement already forming in your favour. Bottom-up delivery forces them to suspend judgement — and suspended judgement reads as "I am not yet convinced." You want their judgement forming early and positively.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The pause', emphasize: 'pause' },

    { type: 'prose', md: 'A two-to-three-second pause before answering a hard question is one of the most underused tools in case interviewing. It signals deliberation, gives your brain time to organise, and prevents the verbal-filler avalanche — "um, so, like, I think, maybe…" — that quietly erodes credibility. Most candidates avoid silence because it feels excruciating from the inside. From the outside, it plays as composure.' },

    { type: 'dialogue', title: 'The same question, with and without the pause', turns: [
      { speaker: 'interviewer', md: 'How would you size the market for electric two-wheelers in India?' },
      { speaker: 'candidate', md: '[answers instantly] Um, so, India is big, lots of people ride two-wheelers, so maybe… a few crore? It\'s hard to say exactly…' },
      { speaker: 'narrator', md: 'The instant answer signals a guess. No method, no confidence, just filler buying time the candidate should have taken as silence.', note: 'Speed of answering is not the goal. Speed of thinking is.' },
      { speaker: 'candidate', md: '[pauses three seconds] There are two ways I could approach this — top-down from the population, or bottom-up from current petrol two-wheeler sales. I\'ll go top-down because the adoption rate is the key uncertainty, and that\'s easier to reason about from the population base. So, starting with…' },
      { speaker: 'narrator', md: 'The pause bought a structured opening. The candidate sounds like they are thinking, because they are — and thinking is the thing being paid for.' },
    ]},

    { type: 'callout', variant: 'tip', title: 'Make the pause explicit when it is long', md: 'For a genuinely hard question that needs more than a beat, say so out loud: "Let me take a moment to think that through properly." This converts silence from something that might look like floundering into a visible, deliberate act. Interviewers respect "let me think" far more than a rushed half-answer.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Signposting: the navigation aids', emphasize: 'Signposting' },

    { type: 'prose', md: 'The interviewer is tracking your logic in their own head as you talk. Signposts are short phrases that tell them where you are and where you are going, so they never lose the thread. They are not filler — they are the difference between a case the interviewer can follow effortlessly and one they have to work to keep up with. Make their job easy.' },

    { type: 'table', headers: ['When you are…', 'Say something like'], rows: [
      ['Opening a new branch', '"I\'d like to turn to the cost side now."'],
      ['Taking thinking time', '"Let me take a moment to work this through."'],
      ['Concluding a sub-question', '"So on revenue, my conclusion is X. Now to cost."'],
      ['Updating a prior view', '"This changes my earlier read — I\'d assumed Y, but this points to Z."'],
      ['Stepping back to re-prioritise', '"Stepping back from the detail for a second…"'],
      ['Flagging a hypothesis', '"My hypothesis going in is X — let me test it."'],
      ['Transitioning to the recommendation', '"Pulling this together, my recommendation is…"'],
      ['Switching case shape (braiding)', '"I\'m satisfied on X, so I want to shift to the question of Y."'],
    ]},

    { type: 'callout', variant: 'insight', title: 'Signposts buy you forgiveness', md: 'A well-signposted case earns slack. When the interviewer can always tell where you are, a moment of weaker analysis reads as a small dip in a clearly-navigated journey. When they are lost, the same dip reads as you being lost too. Signposting is cheap insurance against your worst thirty seconds.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The dialogue bank', emphasize: 'dialogue bank' },

    { type: 'prose', md: 'The single highest-value thing on this page: a bank of stock lines for the moments that reliably recur in cases. Internalise these and you stop improvising in the situations where improvising goes wrong. They are not scripts to recite robotically — they are patterns to make your own, so the *shape* of a strong response is automatic even when the words vary.' },

    { type: 'heading', level: 3, text: 'When you need a moment', emphasize: 'need a moment' },
    { type: 'steps', ordered: false, items: [
      { title: 'Before structuring', md: '"Could I take a minute to lay this out?" — always granted, always a positive signal.' },
      { title: 'Before a hard calculation', md: '"Let me set this up on paper so I don\'t make a slip." — buys time and signals rigour.' },
      { title: 'Before a curveball', md: '"That\'s a good question — let me think about it for a second." — converts a freeze into a deliberate pause.' },
    ]},

    { type: 'heading', level: 3, text: 'When you do not have the data', emphasize: 'do not have the data' },
    { type: 'steps', ordered: false, items: [
      { title: 'Estimate openly', md: '"I don\'t have that number, so let me estimate it — I\'d expect it to be in the range of X, because…" Strong candidates reason through missing data; weak ones stall waiting for it.' },
      { title: 'State what you\'d want', md: '"Ideally I\'d look at X to confirm this, but assuming a reasonable value, here\'s where it points…" Shows you know what evidence matters even without it.' },
    ]},

    { type: 'heading', level: 3, text: 'When the interviewer pushes back', emphasize: 'pushes back' },
    { type: 'steps', ordered: false, items: [
      { title: 'If they are right', md: '"Fair — that changes my read. Let me reorient." Then genuinely reorient. Fast, ego-free updating is pure coachability signal.' },
      { title: 'If you have a reason to hold', md: '"I hear that — my reason for X was Y, but I\'m happy to flip if you think Z is more fruitful." Coachable and confident at once.' },
      { title: 'If you simply do not know', md: '"I\'m not sure — my instinct is X, but I\'d want to pressure-test that. Can I reason through it?" Honesty plus a path beats a confident bluff.' },
    ]},

    { type: 'heading', level: 3, text: 'When you stumble or lose your thread', emphasize: 'lose your thread' },
    { type: 'steps', ordered: false, items: [
      { title: 'Forgot mid-sentence', md: '"Let me restart that thought more cleanly." — far better than trailing off. Resets without apology.' },
      { title: 'Realise you went down a dead end', md: '"This branch isn\'t leading anywhere useful — let me come back up and try cost instead." Naming the dead end is control, not failure.' },
      { title: 'Made a visible error', md: '"Let me correct that — I dropped a zero. The figure should be X." One breath, fix it, move on.' },
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Handling the silent interviewer', emphasize: 'silent interviewer' },

    { type: 'prose', md: 'Some interviewers go quiet — no nods, no encouragement, no reaction. This rattles candidates who are feeding on cues. It is often deliberate: a test of whether you can drive without reassurance. Do not read silence as disapproval, and do not fill it by talking faster or seeking validation ("…does that make sense?" every thirty seconds). Keep driving with the same structured calm you would use with a warm interviewer.' },

    { type: 'comparison', title: 'Reacting to a stone-faced interviewer', headers: ['Seek reassurance (C)', 'Speed up nervously (B)', 'Drive calmly (A)'], rows: [
      { cells: [
        'Ends every point with "…right?" or "…does that make sense?", visibly fishing for a nod that never comes.',
        'Reads silence as disapproval, rushes to cover more ground, quality drops as pace rises.',
        'Treats silence as neutral, keeps the same deliberate pace, signposts clearly, and drives the case as if the interviewer were nodding along.',
      ]},
    ]},

    { type: 'callout', variant: 'pitfall', title: 'The validation-seeking tic', md: 'Ending statements with "right?" or "does that make sense?" is the most common nervous tell, and it quietly costs you. It reads as needing approval to proceed — the opposite of the self-directed problem-solver the firm wants to hire. Replace it with a confident transition: instead of "…so revenue is the issue, does that make sense?", say "…so revenue is the issue. Let me dig into why." State, then move.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Drill 1: rewrite it top-down', emphasize: 'top-down' },

    { type: 'drill', title: 'Flip these bottom-up answers', instructions: 'Each answer below is delivered bottom-up — the point arrives last. Rewrite each so the headline comes first, then the support. Then compare to a model. There is no single right wording; check whether your version leads with the conclusion.', items: [
      { prompt: '"I looked at the three customer segments. The premium segment is shrinking, the mid segment is flat, and the value segment is growing fast. The value segment is now the biggest. So I think the company\'s customer base is shifting down-market."', answer: '**Top-down:** "The company\'s customer base is shifting down-market. The fast-growing value segment is now the largest, while premium is shrinking and mid is flat. That shift is what\'s dragging blended margin — so I\'d look at whether to defend premium or lean into value." (Headline first, then the segment evidence, then the implication.)' },
      { prompt: '"We could cut costs, or we could raise prices, or we could enter a new market. Cost-cutting is hard because they\'re already lean. Price increases risk volume. New markets take time. So maybe a price increase is the least-bad option."', answer: '**Top-down:** "My recommendation is a targeted price increase — it\'s the least-bad of the three levers. Cost-cutting is largely exhausted since they\'re already lean, and new-market entry is too slow for the timeline. A selective price rise risks some volume, but it\'s the fastest profit lever and the risk can be managed by segmenting which products to reprice." (Decision first, then why the alternatives lose, then the caveat.)' },
      { prompt: '"The market is growing at 8%. Our client is growing at 3%. Competitors are growing at 10%. So our client is losing share."', answer: '**Top-down:** "Our client is losing share. They\'re growing 3% in a market growing 8%, while competitors grow 10% — so they\'re not just lagging the market, they\'re actively ceding ground to rivals. I\'d want to find where that share is leaking." (The "losing share" conclusion leads; the three growth rates support it.)' },
    ], revealLabel: 'Show model rewrites' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'Drill 2: what would you say?', emphasize: 'what would you say' },

    { type: 'drill', title: 'Pick the line for the moment', instructions: 'For each situation, decide what you would actually say before reading the model. These are the recurring pressure-moments where the right stock line keeps you in control.', items: [
      { prompt: 'The interviewer hands you an assumption that sounds clearly too optimistic. What do you say?', answer: '"I\'ll use that figure since you\'ve given it — I\'ll just flag it looks high to me, because [reason]. If the recommendation turns out sensitive to it, I\'d want to stress-test a more conservative value." (Use it, flag it, offer a sensitivity.)' },
      { prompt: 'You\'ve been deep in one branch for several minutes and realise you\'ve lost the bigger picture. What do you say?', answer: '"Let me step back from the detail for a second. On the cost side I\'ve established X. Before going deeper, I want to check the revenue side, because the two together tell a different story than either alone." (Step-back signpost + re-prioritise.)' },
      { prompt: 'The interviewer asks a question you genuinely cannot answer. What do you say?', answer: '"I\'m not sure of the precise answer — let me reason toward it. My instinct is X because Y, though I\'d want to test that." (Honesty + a reasoning path beats both bluffing and freezing.)' },
      { prompt: 'You\'re about to give your final recommendation. How do you open it?', answer: '"Pulling this together — my recommendation is [the action], for three reasons, and I\'ll flag two risks." (Signpost the close, lead with the decision, preview the structure.)' },
    ], revealLabel: 'Show model lines' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'How to practise', emphasize: 'practise' },

    { type: 'steps', ordered: true, items: [
      { title: 'Record and listen back', md: 'Record yourself on every practice case and listen at 1.25–1.5×. Painful, and the fastest way to hear your own filler words, trailing sentences, and validation tics. You cannot fix what you cannot hear.' },
      { title: 'Drill the close in isolation', md: 'Take cases you\'ve already solved and deliver only the recommendation, cold, in 60 seconds — decision, three reasons, two risks. Rehearse the *shape* until it is automatic under pressure.' },
      { title: 'Practise the pause on purpose', md: 'In mock cases, deliberately insert a three-second silence before hard questions. It will feel unbearable and sound fine. Build the tolerance now, not in the real interview.' },
      { title: 'Kill one tic at a time', md: 'Pick your worst verbal habit (usually "does that make sense?" or "um, so") and consciously eliminate just that one for a week. Then the next. Trying to fix all your speech habits at once fixes none.' },
    ]},

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'A case is graded on the spoken part. The same analysis delivered two ways earns two different scores — communication is mechanics, not personality, and the mechanics are learnable.',
      'Speak top-down every time: headline first, support second. A senior listener forms a verdict on your first sentence, so lead with the thesis.',
      'Use the two-to-three-second pause. It plays as composure, prevents filler, and signals thinking. Make it explicit ("let me think that through") when it runs long.',
      'Signpost every transition. The interviewer is tracking your logic; clear navigation buys forgiveness for your weaker moments.',
      'Keep a dialogue bank for recurring moments — needing time, missing data, pushback, stumbling. Internalise the patterns so you stop improvising where improvising fails.',
      'Treat a silent interviewer as neutral, not hostile. Drive calmly; never fish for reassurance with "right?" or "does that make sense?"',
      'Practise by recording and listening back, drilling the close in isolation, rehearsing the pause, and killing one verbal tic at a time.',
    ]},
  ],
};
