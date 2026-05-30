import type { Page } from '@/lib/casebook/types';

export const diagnosticAndPlan: Page = {
  slug: 'getting-started/diagnostic-and-plan',
  title: 'Your diagnostic & a 14-day plan',
  titleEmphasize: '14-day plan',
  subtitle: 'A worksheet, not a read. Score yourself after every mock, fix one weakness at a time, and follow a day-by-day plan that uses the rest of this casebook in the right order.',
  kind: 'concept',
  meta: { readingTimeMin: 6, tags: ['foundations', 'practice'] },
  blocks: [
    { type: 'hook', md: 'You do not improve at cases by reading about cases. You improve by doing them, diagnosing what broke, and fixing one thing at a time. This page is the loop: a ranked checklist to find your real weakness after each mock, and a fourteen-day plan that sequences everything else in this casebook so you are not guessing what to study next. Keep it open while you practise.', emphasize: 'fix one thing at a time' },

    { type: 'prose', md: 'Most candidates practise inefficiently — they do random cases, feel vaguely better or worse, and never isolate what is actually capping them. The fix is a disciplined loop: after every case, run the diagnostic, find your single biggest failure mode, and target only that in the next case. Repeat. Weaknesses fall faster when you hunt them one at a time than when you flail at "getting better at cases" in general.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The post-case diagnostic', emphasize: 'diagnostic' },

    { type: 'prose', md: 'After every practice case, run this checklist. Do not score yourself on a vague overall feeling — check each item honestly. The failure modes are grouped by stage and listed roughly in order of how often they decide outcomes, so the ones near the top of each group are the ones to fix first.' },

    { type: 'table', headers: ['Stage', 'Did I…', 'Failure if not'], firstColHeader: false, rows: [
      ['Clarify', 'Play back the prompt and pin down the objective before structuring?', 'Solved the wrong question'],
      ['Clarify', 'Limit clarifying questions to ones that change my structure?', 'Stalled / fished for the answer'],
      ['Structure', 'Build a structure for *this* prompt, not a generic tree?', 'Recited a framework instead of thinking'],
      ['Structure', 'Take thinking time and present top-down in 30–45 seconds?', 'Improvised, lost the room early'],
      ['Analyse', 'Drive the case — announce where I wanted to go next?', 'Waited passively to be fed data'],
      ['Analyse', 'Hypothesise *before* asking for or computing a number?', 'No visible business judgement'],
      ['Analyse', 'Attach meaning to every number, not just report it?', 'Facts without insight'],
      ['Analyse', 'Surface back up every few minutes to re-prioritise?', 'Got lost deep in one branch'],
      ['Analyse', 'Treat the interviewer\'s questions as redirects, not asides?', 'Missed a steer, kept going wrong'],
      ['Math', 'Lay calculations out in labelled rows on paper?', 'Unrecoverable when a slip happened'],
      ['Math', 'Round aggressively, then sharpen only if needed?', 'Ground out false precision slowly'],
      ['Math', 'Sanity-check the result before announcing it?', 'Said an implausible number aloud'],
      ['Communicate', 'Speak top-down — headline before support — throughout?', 'Buried the point, made them wait'],
      ['Communicate', 'Signpost transitions so the interviewer never got lost?', 'Hard to follow, lost forgiveness'],
      ['Communicate', 'Avoid validation tics ("right?", "does that make sense?")?', 'Read as needing reassurance'],
      ['Recommend', 'Lead with the answer, then 2–3 reasons, then 1–2 risks?', 'Hedged instead of deciding'],
      ['Recommend', 'Synthesise in three sentences, not recap the journey?', 'Summarised instead of concluding'],
      ['Overall', 'Stay calm, audible, and coachable when challenged?', 'Lost composure / dug in'],
    ]},

    { type: 'callout', variant: 'tip', title: 'The one-weakness rule', md: 'Do not try to fix all eighteen at once — you will fix none. After each case, pick the *single* failure mode you fell into hardest and commit to not repeating it in the next case. Track it: write the one weakness at the top of your notes before the next mock. Over a dozen cases this way, the list visibly shortens, and you will find your failures cluster around two or three habits — those are your real targets.' },

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The four habits that prevent most failures', emphasize: 'four habits' },

    { type: 'prose', md: 'If the eighteen items above are what to stop doing, these four habits are what to build instead. Each one, installed, automatically prevents a whole cluster of failure modes — so building the habit is more efficient than fighting the symptoms individually.' },

    { type: 'columns', columns: [
      [
        { type: 'callout', variant: 'insight', title: 'Habit 1 · Play back, then think', md: 'Open every case the same way: play back the prompt, pin the objective, take explicit thinking time. Prevents the four clarify/structure failures at the top of the diagnostic.' },
        { type: 'callout', variant: 'insight', title: 'Habit 2 · Hypothesise, then ask', md: 'Never request a number without first saying what you expect and why. Prevents the judgement failures and signals business sense on every branch.' },
      ],
      [
        { type: 'callout', variant: 'insight', title: 'Habit 3 · Surface every few minutes', md: 'Set an internal clock: every 2–3 minutes, step back and re-prioritise. Prevents getting lost in a branch — the most common analysis failure.' },
        { type: 'callout', variant: 'insight', title: 'Habit 4 · Land the plane', md: 'Close every case top-down: answer, three reasons, two risks. Rehearse the shape until automatic. Prevents the two recommendation failures that cost cases at the buzzer.' },
      ],
    ]},

    { type: 'divider' },

    { type: 'heading', level: 2, text: 'The 14-day plan', emphasize: '14-day plan' },

    { type: 'prose', md: 'Two weeks of focused preparation, assuming roughly 1–2 hours a day, that sequences the rest of this casebook in the order that builds fastest. If you have more time, stretch each phase; if less, compress the case-practice days but never skip the daily math. Adjust the specific case types to match your target firm and sector.' },

    { type: 'heading', level: 3, text: 'Days 1–4 · Foundations', emphasize: 'Foundations' },
    { type: 'steps', ordered: true, items: [
      { title: 'Day 1', md: 'Read all of Getting Started (these pages). Do the shape-spotting drills. Start the daily 5×5 math drill today and do not miss a day from here on.' },
      { title: 'Day 2', md: 'Read the Structuring Fundamentals and Profitability framework pages. Do one full profitability case, untimed, focusing only on building a clean structure. Record it.' },
      { title: 'Day 3', md: 'Read the Market Entry and Growth framework pages. Do one market-entry case, untimed. Listen back to Day 2\'s recording and note your single biggest failure mode.' },
      { title: 'Day 4', md: 'Read the Pricing and M&A framework pages. Do one case of each remaining type at a relaxed pace. You have now seen all six shapes in practice.' },
    ]},

    { type: 'heading', level: 3, text: 'Days 5–9 · Volume & feedback', emphasize: 'Volume & feedback' },
    { type: 'steps', ordered: true, items: [
      { title: 'Days 5–7', md: 'One full timed case per day, ideally with a partner. Run the diagnostic after each. Each day, target the one weakness you identified the day before. Keep the daily math going.' },
      { title: 'Day 8', md: 'Skim the Toolkit pages (Porter\'s, 4 P\'s, BCG, etc.) so the supporting frameworks are familiar enough to deploy. Do one guesstimate-heavy case.' },
      { title: 'Day 9', md: 'Two cases today if you can — one of your strongest type to build confidence, one of your weakest to confront it. Diagnostic after each.' },
    ]},

    { type: 'heading', level: 3, text: 'Days 10–14 · Sharpen & simulate', emphasize: 'Sharpen & simulate' },
    { type: 'steps', ordered: true, items: [
      { title: 'Days 10–12', md: 'One timed case per day under realistic conditions — dressed as you would be, with a stranger if possible. Focus shifts from "getting it right" to "delivering it well": top-down speaking, signposting, the clean close. Drill the recommendation in isolation each day.' },
      { title: 'Day 13', md: 'Tackle the harder material: the Signature cases and any case type still shaky. Practise braiding and recovery explicitly — Navigating Tricky & Blended Cases.' },
      { title: 'Day 14', md: 'Light day. One easy case to stay warm, review your diagnostic history to confirm your weaknesses have shrunk, re-read the four habits and the dialogue bank. Rest. Do not cram.' },
    ]},

    { type: 'callout', variant: 'pitfall', title: 'The over-correction trap', md: 'Once you start applying advice like "drive the case" and "be decisive," watch for over-correcting: interrupting the interviewer, steamrolling their redirects, refusing to update because you have decided that "confidence" means never bending. The cure for passivity is not aggression — it is calm, responsive control. If a mock partner says you have become hard to interrupt or quick to dismiss pushback, you have swung too far.' },

    { type: 'callout', variant: 'tip', title: 'On the day', md: 'In the interview itself, run nothing new. Trust the loop you have built: clarify, structure, drive with hypotheses, surface periodically, land the plane. Take the pause when you need it. Treat the interviewer as a colleague to convince, not an examiner to satisfy. The preparation is done — the interview is just one more case, with the same five moves you have run dozens of times.' },

    { type: 'keyTakeaways', title: 'Key Takeaways', items: [
      'Improvement comes from a loop: do a case, run the diagnostic, fix the single biggest failure mode, repeat. Not from reading more.',
      'Use the post-case diagnostic after every mock. The eighteen failure modes are grouped by stage and ordered by how often they decide outcomes.',
      'Apply the one-weakness rule: fix one failure mode per case, not all at once. Your failures will cluster around two or three habits — those are the real targets.',
      'Build four habits — play back then think, hypothesise then ask, surface every few minutes, land the plane — and whole clusters of failures self-correct.',
      'Follow the 14-day plan: foundations (1–4), volume and feedback (5–9), sharpen and simulate (10–14), with daily math throughout.',
      'Watch for over-correction — the cure for passivity is calm control, not aggression. On the day, run nothing new; trust the loop.',
    ]},
  ],
};
