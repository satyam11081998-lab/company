const test = require('node:test');
const assert = require('node:assert');
const p = require('./out/progress.js');

const live = (o = {}) => ({ steps: [], pct: 40, done: false, step_elapsed_s: 2, step_eta_s: 10, step_weight: 0.5, ...o });

test('between polls the bar moves on the current step\'s estimate, capped below 100', () => {
  assert.equal(p.estimatePct(live(), 0), 40);
  assert.equal(p.estimatePct(live(), 4000), 40 + Math.floor(100 * 0.5 * 0.4));
  assert.ok(p.estimatePct(live(), 600000) <= 40 + 100 * 0.5 * (p.STEP_CAP - 0.2) + 1, 'a step that overruns never completes itself');
  assert.equal(p.estimatePct(live({ pct: 98, step_weight: 1 }), 600000), 99);
  assert.equal(p.estimatePct(live({ done: true }), 0), 100);
  assert.equal(p.estimatePct(live({ step_eta_s: 0 }), 5000), 40);
  assert.equal(p.estimatePct(null, 1000), 0);
});

test('the number never goes backwards and only reaches 100 when done', () => {
  assert.equal(p.monotonic(57, 55, false), 57);
  assert.equal(p.monotonic(57, 63, false), 63);
  assert.equal(p.monotonic(99, 120, false), 99);
  assert.equal(p.monotonic(12, 0, true), 100);
});

test('before the job starts the page shows the real step list, first one waiting', () => {
  const w = p.waitingProgress('prep');
  assert.deepStrictEqual(w.steps.map((s) => s.id), ['inputs', 'role', 'match', 'rubrics', 'questions', 'check']);
  assert.equal(p.activeStep(w).state, 'waiting');
  assert.deepStrictEqual(p.waitingProgress('report').steps.map((s) => s.id), ['evidence', 'score', 'check', 'feedback', 'assemble']);
});

test('JD keywords the CV mentions — whole words, plurals, multi-word terms', () => {
  const jd = { keywords: [
    { term: 'SQL', weight: 'high' }, { term: 'P&L', weight: 'high' }, { term: 'Brand strategy', weight: 'medium' },
    { term: 'PR', weight: 'low' }, { term: 'Nielsen', weight: 'medium' }, { term: 'Trade marketing', weight: 'high' },
    { term: 'sql', weight: 'low' }, { term: 'Snacks\nCompany', weight: 'low' }, { term: 'x', weight: 'high' },
    { term: 'Requirements', weight: 'high' }, { term: 'Strong', weight: 'high' }, { term: 'Experience', weight: 'medium' },
  ] };
  const cv = {
    skills: { technical: ['SQLite'], tools: ['Nielsen'], domain: ['Pricing'] },
    claims: [{ text: 'Owned the P&L for a 40 crore portfolio' }, { text: 'Rebuilt our strategy for the brand in two quarters' }],
    experience: [{ title: 'Assistant Brand Manager', responsibilities: ['Trade marketings with distributors'] }],
  };
  const r = p.keywordCoverage(jd, cv);
  assert.deepStrictEqual(r.found.sort(), ['Brand strategy', 'Nielsen', 'P&L', 'Trade marketing'].sort());
  assert.deepStrictEqual(r.missing.sort(), ['PR', 'SQL', 'Snacks Company'].sort(), 'SQL is not SQLite; PR is not pricing; boilerplate words are not key terms');
  assert.deepStrictEqual(p.keywordCoverage(undefined, cv), { found: [], missing: [] });
});
