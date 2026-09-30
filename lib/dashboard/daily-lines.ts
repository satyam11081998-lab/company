/**
 * The India dashboard's line of the day — the handwritten note in the focus
 * card (2026-09-30).
 *
 * Short maxims about how to think through a case, written for MECE in Indian
 * English. None is a quotation of a real person, so none carries an
 * attribution. Do not add famous quotes here: they would need an accurate
 * source, and most "famous business quotes" online are misattributed.
 *
 * Related to the day: each line has a theme, and the line comes from the theme
 * of today's case (a profitability case gets a line about drivers and levers,
 * a guesstimate a line about magnitudes and sanity checks). Within the theme
 * it rotates one line per IST calendar day, walking the list in order, so the
 * same day shows the same line to everyone, on every reload.
 */

import { dayNumber } from '@/lib/us-market/assets';

type Theme = 'profit' | 'growth' | 'numbers' | 'general';

const LINES: Record<Theme, readonly string[]> = {
  profit: [
    'Revenue or cost? Split it before you solve it.',
    'Ask why the number moved before asking how much.',
    'Pull the biggest lever first.',
    'Think in drivers, not in lists.',
    'Find where the money leaks before you plug it.',
    'Price, volume, cost. Then ask what changed.',
    'Every number should move the decision.',
    'If it will not change the decision, skip the maths.',
  ],
  growth: [
    'Growth, cost or risk: know which one you are solving.',
    'Name the objective before you name the framework.',
    'A new market needs a reason to win, not just a reason to enter.',
    'Make the trade-off explicit.',
    'A recommendation needs a next step and a risk.',
    'Recommendations beat observations.',
    'The best framework is the one built for this problem.',
    'Know the question before you chase the answer.',
  ],
  numbers: [
    'Round the numbers, never the logic.',
    'Estimate boldly, then check humbly.',
    'Lakhs or crores? Sanity-check the order of magnitude.',
    'Check the units before you check the totals.',
    'Segment until the pieces are countable.',
    'Assumptions are fine. Hidden ones are not.',
    'Label your maths so the interviewer can follow it.',
    'Be precise where it matters and approximate everywhere else.',
  ],
  general: [
    'Structure first. Numbers second. The story, always.',
    'Say the answer first, then earn it.',
    'A clear hypothesis beats a long list.',
    'Break it down until the next step is obvious.',
    'Listen for what the client is really asking.',
    'Slow down to structure. Speed up to solve.',
    'Synthesise as you go, not only at the end.',
    'One insight, clearly said, beats five hedged ones.',
    'When you are stuck, go back to the objective.',
    'Confidence comes from repetitions, not from luck.',
    'Numbers tell you what. Judgement tells you so what.',
    'Consistency today, confidence on placement day.',
    'Pause, structure, then speak.',
    'Every chart has one headline. Find it.',
    'Treat every case as a conversation, not a viva.',
    'Small daily repetitions compound.',
    'Lead with the so-what.',
    'A good structure fits on the back of a napkin.',
    'Think out loud. It is how the interviewer sees you think.',
    'Get to eighty per cent fast, then decide what the rest is worth.',
    'A case is a problem to solve, not a script to recite.',
    'Pressure-test the answer before the partner does.',
    'Show your structure before you show your maths.',
    'Clarify, structure, solve, synthesise. Repeat.',
    'A sharp question saves ten minutes of analysis.',
    'Practise before you feel ready.',
    'Mutually exclusive, collectively exhaustive, calmly delivered.',
  ],
};

/** Every line, for tests and reviews. */
export const IN_DAILY_LINES: readonly string[] = Object.values(LINES).flat();

function themeOf(caseType: string | null | undefined, cluster?: string | null): Theme {
  const t = `${caseType ?? ''} ${cluster ?? ''}`.toLowerCase();
  if (/guesstimate|market[_ ]sizing|sizing/.test(t)) return 'numbers';
  if (/profit|cost|pricing|operations/.test(t)) return 'profit';
  if (/growth|entry|m&a|go[- ]to[- ]market|strategy/.test(t)) return 'growth';
  return 'general';
}

/** The line for an IST calendar day (YYYY-MM-DD), themed by today's case. */
export function dailyLineIN(dayKey: string, caseType?: string | null, cluster?: string | null): string {
  const pool = LINES[themeOf(caseType, cluster)];
  return pool[dayNumber(dayKey) % pool.length];
}
