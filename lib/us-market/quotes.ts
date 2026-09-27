/**
 * The dashboard's line of the day (US app, v3).
 *
 * Short maxims about how to think through a case, written for MECE. None is a
 * quotation of a real person, so none carries an attribution; do not add
 * famous quotes here (they would need an accurate source, and most "famous
 * business quotes" online are misattributed).
 *
 * Rotation: one line per calendar day in the viewer's timezone, walking the
 * list in order so no line repeats until every line has been shown.
 */

import { dayNumber } from './assets';

export const US_DAILY_LINES: readonly string[] = [
  'Better questions lead to better thinking.',
  'Structure first. Numbers second. The story always.',
  'A clear hypothesis beats a long list.',
  'Say the answer first, then earn it.',
  'Every number should move the decision.',
  'Clarity is a kindness to your interviewer.',
  'Break it down until the next step is obvious.',
  'Assumptions are fine. Hidden ones are not.',
  'Sanity-check the estimate before you defend it.',
  'Listen for what the client is really asking.',
  'Slow down to structure. Speed up to solve.',
  'The best framework is the one built for this problem.',
  'Round the numbers, never the logic.',
  'Synthesize as you go, not only at the end.',
  'Good judgment is a practiced habit.',
  'One insight, clearly said, beats five hedged ones.',
  'Practice the process and the scores will follow.',
  'When you are stuck, go back to the objective.',
  'Ask why the number moved before asking how much.',
  'A recommendation needs a next step and a risk.',
  'Think in drivers, not in lists.',
  'Great answers are simple, not easy.',
  'Label your math so others can follow it.',
  'Confidence comes from repetitions, not from luck.',
  'Name the objective before you name the framework.',
  'Numbers tell you what. Judgment tells you so what.',
  'Consistency today, confidence on interview day.',
  'Pause, structure, then speak.',
  'Make the tradeoff explicit.',
  'Every chart has one headline. Find it.',
  'Estimate boldly, then check humbly.',
  'Clients remember the answer, not the effort.',
  'Pull the biggest lever first.',
  'Treat every case as a conversation.',
  'Small daily repetitions compound.',
  'If it will not change the decision, skip the math.',
  'Segment until the pieces are countable.',
  'Lead with the so-what.',
  'Curiosity is the most useful framework.',
  'Test the hypothesis you would least like to be wrong about.',
  'A good structure fits on the back of a napkin.',
  'Be precise where it matters and approximate everywhere else.',
  'Your first idea is a starting point, not an answer.',
  'Think out loud. It is how the interviewer sees you think.',
  'Check the units before you check the totals.',
  'Growth, cost or risk: know which one you are solving.',
  'Get to eighty percent fast, then decide what the rest is worth.',
  'Recommendations beat observations.',
  'A case is a problem to solve, not a script to recite.',
  'Progress is built one clear answer at a time.',
  'Pressure-test the answer before the partner does.',
  'Show your structure before you show your math.',
  'Simple drivers, honest assumptions, a clear call.',
  'Make every sentence earn its place.',
  'Clarify, structure, solve, synthesize. Repeat.',
  'A sharp question saves ten minutes of analysis.',
  'Sanity checks are where judgment shows.',
  'The best time to practice is before you feel ready.',
  'Mutually exclusive, collectively exhaustive, calmly delivered.',
  'Know the question before you chase the answer.',
];

/** The line for a calendar day (YYYY-MM-DD). */
export function dailyLine(dayKey: string): string {
  return US_DAILY_LINES[dayNumber(dayKey) % US_DAILY_LINES.length];
}
