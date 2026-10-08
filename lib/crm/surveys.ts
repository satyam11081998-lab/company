/**
 * Customer surveys: NPS, CSAT and CES. Pure (no I/O) so the scoring maths is
 * unit-tested.
 *
 *  NPS  (0–10)  "How likely are you to recommend…"  promoters 9–10,
 *               passives 7–8, detractors 0–6. NPS = %promoters − %detractors.
 *  CSAT (1–5)   "How satisfied…"  CSAT % = share of 4s and 5s.
 *  CES  (1–7)   "How easy…" (7 = very easy). CES = mean; % easy = share of 5–7.
 */

export type SurveyKind = 'nps' | 'csat' | 'ces';

export const SCALES: Record<SurveyKind, { min: number; max: number; low: string; high: string }> = {
  nps: { min: 0, max: 10, low: 'Not at all likely', high: 'Extremely likely' },
  csat: { min: 1, max: 5, low: 'Very dissatisfied', high: 'Very satisfied' },
  ces: { min: 1, max: 7, low: 'Very difficult', high: 'Very easy' },
};

export interface SurveyConfig {
  kind: SurveyKind;
  question: string;
  followUp: string;
  thankYou: string;
  /** subject + body of the invite email; {{survey_link}} is the answer link */
  inviteSubject: string;
  inviteBody: string;
  /** marketing surveys respect opt-outs; service surveys follow a support case */
  category: 'marketing' | 'service';
  description?: string;
}

export const DEFAULT_SURVEYS: Array<{ name: string; config: SurveyConfig }> = [
  {
    name: 'NPS — relationship (quarterly)',
    config: {
      kind: 'nps',
      question: 'How likely are you to recommend MECE to a friend preparing for placement interviews?',
      followUp: 'What is the main reason for your score?',
      thankYou: 'Thank you — this goes straight to the team that builds MECE.',
      inviteSubject: '{{first_name}}, one quick question about MECE',
      inviteBody: 'Hi {{first_name}},\n\nCould you spare 10 seconds? One question, one tap — it tells us what to fix next.\n\nThanks,\n{{owner_name}}',
      category: 'marketing',
      description: 'Relationship NPS for every active user. Feeds the loyalty dashboard.',
    },
  },
  {
    name: 'CSAT — after a support case',
    config: {
      kind: 'csat',
      question: 'How satisfied were you with how we handled your request?',
      followUp: 'Anything we could have done better?',
      thankYou: 'Thanks for telling us. If something is still wrong, just reply to our last email.',
      inviteSubject: 'How did we do? (case {{case_number}})',
      inviteBody: 'Hi {{first_name}},\n\nWe marked your request **{{subject}}** as resolved. How did we do?\n\nTeam MECE',
      category: 'service',
      description: 'Sent when a case is resolved (if switched on in the service console).',
    },
  },
  {
    name: 'CES — effort to get help',
    config: {
      kind: 'ces',
      question: 'How easy was it to get your issue resolved?',
      followUp: 'What made it easy or hard?',
      thankYou: 'Thank you — we use this to remove friction from support.',
      inviteSubject: 'One question about your recent support request',
      inviteBody: 'Hi {{first_name}},\n\nOne tap: how easy was it to get help from us?\n\nTeam MECE',
      category: 'service',
    },
  },
];

export function cleanSurvey(raw: unknown): SurveyConfig {
  const r = (raw ?? {}) as Partial<SurveyConfig>;
  const kind: SurveyKind = r.kind === 'csat' || r.kind === 'ces' ? r.kind : 'nps';
  const s = (v: unknown, max: number, d: string) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : d);
  const def = DEFAULT_SURVEYS.find((x) => x.config.kind === kind)!.config;
  const body = s(r.inviteBody, 4000, def.inviteBody);
  return {
    kind,
    question: s(r.question, 300, def.question),
    followUp: s(r.followUp, 300, def.followUp),
    thankYou: s(r.thankYou, 500, def.thankYou),
    inviteSubject: s(r.inviteSubject, 200, def.inviteSubject).replace(/[\r\n]+/g, ' '),
    inviteBody: body,
    category: r.category === 'service' ? 'service' : r.category === 'marketing' ? 'marketing' : def.category,
    description: r.description ? String(r.description).slice(0, 300) : undefined,
  };
}

export function validScore(kind: SurveyKind, v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^\d{1,2}$/.test(v) ? Number(v) : NaN;
  const sc = SCALES[kind];
  return Number.isInteger(n) && n >= sc.min && n <= sc.max ? n : null;
}

export type NpsBucket = 'promoter' | 'passive' | 'detractor';
export function npsBucket(score: number): NpsBucket {
  return score >= 9 ? 'promoter' : score >= 7 ? 'passive' : 'detractor';
}

export interface SurveySummary {
  kind: SurveyKind;
  responses: number;
  /** NPS (−100…100), CSAT % (0…100) or CES mean (1…7) */
  score: number | null;
  /** NPS: promoter/passive/detractor counts; CSAT/CES: count per scale value */
  breakdown: Record<string, number>;
  /** CES only: share answering 5–7 */
  easyPct?: number | null;
}

const r1 = (x: number) => Math.round(x * 10) / 10;

export function summarize(kind: SurveyKind, scores: number[]): SurveySummary {
  const valid = scores.filter((s) => validScore(kind, s) !== null);
  const n = valid.length;
  if (kind === 'nps') {
    const b = { promoter: 0, passive: 0, detractor: 0 };
    for (const s of valid) b[npsBucket(s)]++;
    return { kind, responses: n, score: n ? Math.round(((b.promoter - b.detractor) / n) * 100) : null, breakdown: b };
  }
  const sc = SCALES[kind];
  const breakdown: Record<string, number> = {};
  for (let v = sc.min; v <= sc.max; v++) breakdown[String(v)] = 0;
  for (const s of valid) breakdown[String(s)]++;
  if (kind === 'csat') {
    const sat = valid.filter((s) => s >= 4).length;
    return { kind, responses: n, score: n ? r1((sat / n) * 100) : null, breakdown };
  }
  const mean = n ? r1(valid.reduce((a, b) => a + b, 0) / n) : null;
  return { kind, responses: n, score: mean, breakdown, easyPct: n ? r1((valid.filter((s) => s >= 5).length / n) * 100) : null };
}

/**
 * Very small lexicon sentiment for free-text comments (English + common
 * Hinglish). Deliberately conservative and explainable: returns the words it
 * matched so a person can see why. Not a model; the score is the evidence.
 */
const POS = ['good', 'great', 'love', 'loved', 'excellent', 'helpful', 'amazing', 'awesome', 'useful', 'easy', 'fast', 'quick', 'clear', 'best', 'nice', 'thanks', 'thank', 'perfect', 'recommend', 'accha', 'badhiya', 'mast', 'superb'];
const NEG = ['bad', 'poor', 'slow', 'bug', 'bugs', 'broken', 'error', 'expensive', 'confusing', 'hard', 'difficult', 'useless', 'worst', 'hate', 'refund', 'crash', 'crashes', 'late', 'never', 'not', 'disappointed', 'wrong', 'issue', 'issues', 'problem', 'bekaar', 'bakwas'];

export function sentiment(text: string | null | undefined): { label: 'positive' | 'negative' | 'neutral'; score: number; matched: string[] } {
  const words = String(text ?? '').toLowerCase().match(/[a-z']+/g) ?? [];
  let s = 0;
  const matched: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const negated = i > 0 && ['not', 'never', "don't", "didn't", 'no', "isn't", "wasn't"].includes(words[i - 1]);
    if (POS.includes(w)) { s += negated ? -1 : 1; matched.push(negated ? `not ${w}` : w); }
    else if (NEG.includes(w) && w !== 'not' && w !== 'never') { s -= negated ? -1 : 1; matched.push(negated ? `not ${w}` : w); }
  }
  return { label: s > 0 ? 'positive' : s < 0 ? 'negative' : 'neutral', score: s, matched: matched.slice(0, 8) };
}
