/**
 * Live progress helpers. No browser APIs, so they are unit-tested in Node.
 *
 * The server reports real steps and real findings; the only estimate is how far the CURRENT step
 * is along (a model call cannot report its own progress). Between polls the bar keeps moving on
 * that estimate, never backwards, and never reaches 100 % until the work really is done.
 */

import type { LiveProgress, LiveStep } from './types';

/** Same cap as the server: a running step never shows more than this share of itself as done. */
export const STEP_CAP = 0.92;

/** Percentage to show `msSincePoll` after `p` arrived. */
export function estimatePct(p: LiveProgress | null | undefined, msSincePoll: number): number {
  if (!p) return 0;
  if (p.done) return 100;
  const eta = p.step_eta_s;
  if (!eta || eta <= 0 || !p.step_weight) return Math.min(99, p.pct);
  const at = (s: number) => Math.min(STEP_CAP, Math.max(0, s) / eta);
  const extra = 100 * p.step_weight * (at(p.step_elapsed_s + msSincePoll / 1000) - at(p.step_elapsed_s));
  return Math.min(99, Math.floor(p.pct + Math.max(0, extra)));
}

/** Never let the number go backwards (a new poll can land a hair below the local estimate). */
export function monotonic(prev: number, next: number, done: boolean): number {
  if (done) return 100;
  return Math.min(99, Math.max(prev, next));
}

const todo = (id: string, label: string): LiveStep => ({ id, label, state: 'todo', detail: '', facts: [] });

/** What the page shows before the background job has started (same labels as the server). */
export function waitingProgress(kind: 'prep' | 'report'): LiveProgress {
  const steps = kind === 'prep'
    ? [todo('inputs', 'Reading your CV and the job description'), todo('role', 'Identifying the role and its level'),
      todo('match', 'Matching your CV to what the role needs'), todo('rubrics', 'Writing a scoring guide for each skill'),
      todo('questions', 'Writing your questions'), todo('check', 'Checking the plan for repeats, fairness and coverage')]
    : [todo('evidence', 'Pulling the evidence out of your answers'), todo('score', 'Scoring each skill against its guide'),
      todo('check', 'Double-checking the scores'), todo('feedback', 'Writing your feedback and practice plan'),
      todo('assemble', 'Putting your report together')];
  steps[0] = { ...steps[0], state: 'waiting', detail: 'Starting in a moment…' };
  return { steps, pct: 2, done: false, step_elapsed_s: 0, step_eta_s: 0, step_weight: 0 };
}

export function activeStep(p: LiveProgress | null | undefined): LiveStep | null {
  if (!p) return null;
  return p.steps.find((s) => s.state === 'active') || p.steps.find((s) => s.state === 'waiting') || null;
}

// ------------------------------------------------------------------ JD keywords vs the CV

function norm(s: string): string {
  return (s || '').toLowerCase().replace(/[^\p{L}\p{N}+#&./ ]/gu, ' ').replace(/\s+/g, ' ').trim();
}

const STOP = new Set(['and', 'the', 'for', 'with', 'of', 'in', 'to', 'a', 'an', 'on', 'or', 'at', 'by', 'as', 'skills',
  'experience', 'ability', 'knowledge', 'strong', 'good', 'excellent']);
/** Words that are never a key term on their own (JD boilerplate). */
const GENERIC = new Set(['requirements', 'requirement', 'responsibilities', 'responsibility', 'experience', 'strong',
  'skills', 'skill', 'ability', 'knowledge', 'role', 'team', 'company', 'work', 'years', 'year', 'candidate', 'job',
  'own', 'good', 'excellent', 'preferred', 'required', 'plus', 'must']);

function cvCorpus(cv: Record<string, any>): string {
  const parts: string[] = [cv.headline, cv.current_title, ...(cv.functions || []), ...(cv.industries || [])];
  const sk = cv.skills || {};
  for (const g of ['technical', 'tools', 'domain', 'soft', 'languages']) parts.push(...(sk[g] || []));
  for (const x of cv.experience || []) parts.push(x.title, x.organization, x.function, ...(x.responsibilities || []));
  for (const c of cv.claims || []) parts.push(c.text);
  for (const pr of cv.projects || []) parts.push(pr.name, pr.description, ...(pr.technologies || []));
  for (const c of cv.certifications || []) parts.push(c.name);
  for (const e of cv.education || []) parts.push(e.degree, e.field);
  return ` ${norm(parts.filter(Boolean).join(' \n '))} `;
}

/**
 * Which of the JD's key terms the CV actually mentions — a literal check, worded as such in the UI
 * ("your CV mentions"), never as "skills you have". Missing terms are what an interviewer is
 * likely to ask about, so they are useful to see before the interview.
 */
export function keywordCoverage(jd: Record<string, any> | undefined, cv: Record<string, any> | undefined, max = 10):
  { found: string[]; missing: string[] } {
  if (!jd || !cv) return { found: [], missing: [] };
  const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const seen = new Set<string>();
  const terms = [...(jd.keywords || [])]
    .sort((a, b) => (rank[a?.weight] ?? 1) - (rank[b?.weight] ?? 1))
    .map((k) => String(k?.term || '').replace(/\s+/g, ' ').trim())
    .filter((t) => t.length > 1 && t.length <= 40 && !norm(t).split(' ').every((w) => GENERIC.has(w) || STOP.has(w)))
    .filter((t) => !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()))
    .slice(0, max);
  const corpus = cvCorpus(cv);
  const found: string[] = [];
  const missing: string[] = [];
  for (const t of terms) {
    const n = norm(t);
    const words = n.split(' ').filter((w) => w.length > 2 && !STOP.has(w));
    const hit = mentions(corpus, n) || (words.length > 1 && words.every((w) => mentions(corpus, w)));
    (hit ? found : missing).push(t);
  }
  return { found, missing };
}

/** Whole-word (or simple plural) mention: "SQL" is not found in "SQLite", "PR" not in "pricing". */
function mentions(corpus: string, phrase: string): boolean {
  if (!phrase) return false;
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${esc}(?:s|es)?(?=\\s|[./]|$)`, 'u').test(corpus);
}
