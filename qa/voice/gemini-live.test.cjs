/**
 * Gemini Live, LIVE mode: turn bookkeeping (lib/voice/gemini-live.ts).
 *   node --test qa/voice/gemini-live.test.cjs
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '..', '..');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, ...rest) {
  if (request.startsWith('@/')) {
    const base = path.join(ROOT, request.slice(2));
    for (const ext of ['.ts', '.tsx', '/index.ts']) if (fs.existsSync(base + ext)) return base + ext;
  }
  return origResolve.call(this, request, parent, ...rest);
};
require.extensions['.ts'] = function (mod, filename) {
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }, fileName: filename,
  });
  mod._compile(out.outputText, filename);
};
const { GeminiLiveTurns, LATE_WORDS_MS, GEMINI_OPEN_TURN } = require(path.join(ROOT, 'lib/voice/gemini-live.ts'));

const audio = (d = 'AAAA') => ({ modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: d } }] } });
const types = (acts) => acts.map((a) => a.type);
const finals = (acts) => acts.filter((a) => a.type === 'candidateTurn' || a.type === 'interviewerTurn').map((a) => [a.type, a.text]);

test('the interviewer opening: audio plays, its words are saved at turnComplete', () => {
  const g = new GeminiLiveTurns();
  let out = g.handle({ ...audio(), outputTranscription: { text: 'Hi, let us size' } }, 0);
  assert.deepEqual(types(out), ['play', 'interviewerDraft']);
  out = g.handle({ outputTranscription: { text: ' scooters in Chennai.' }, turnComplete: true }, 50);
  assert.deepEqual(finals(out), [['interviewerTurn', 'Hi, let us size scooters in Chennai.']]);
  assert.ok(GEMINI_OPEN_TURN.realtimeInput.text.length > 0);
});

test('a normal exchange is saved in speaking order: candidate, then interviewer', () => {
  const g = new GeminiLiveTurns();
  g.handle({ inputTranscription: { text: 'I would start' } }, 0);
  g.handle({ inputTranscription: { text: ' from households' } }, 100);
  let out = g.handle({ ...audio(), outputTranscription: { text: 'Yes, households' } }, 1000);
  assert.ok(types(out).includes('play'));
  out = g.handle({ inputTranscription: { text: ' first' } }, 1000 + LATE_WORDS_MS - 100); // late words, same turn
  out = g.handle({ outputTranscription: { text: ' is the right way in.' }, turnComplete: true }, 3000);
  assert.deepEqual(finals(out), [
    ['candidateTurn', 'I would start from households first'],
    ['interviewerTurn', 'Yes, households is the right way in.'],
  ]);
});

test('barge-in: the voice stops, the cut-off line is kept, the new words start the next turn', () => {
  const g = new GeminiLiveTurns();
  g.handle({ inputTranscription: { text: 'How big is it' } }, 0);
  g.handle({ ...audio(), outputTranscription: { text: 'Take the population as' } }, 500);
  g.handle({ inputTranscription: { text: 'Wait, actually' } }, 500 + LATE_WORDS_MS + 200);
  const out = g.handle({ interrupted: true }, 2000);
  assert.equal(out[0].type, 'stopPlayback');
  assert.deepEqual(finals(out), [['candidateTurn', 'How big is it'], ['interviewerTurn', 'Take the population as']]);
  assert.equal(g.candidateSoFar, 'Wait, actually');
});

test('guardrail cut: voice stops now, rest of the turn is dropped, what was said is kept', () => {
  const g = new GeminiLiveTurns();
  g.handle({ inputTranscription: { text: 'so what is the total' } }, 0);
  g.handle({ ...audio(), outputTranscription: { text: 'So the final answer is about 48,000' } }, 500);
  const cut = g.cut();
  assert.deepEqual(types(cut).slice(0, 1), ['stopPlayback']);
  assert.deepEqual(finals(cut), [['candidateTurn', 'so what is the total'], ['interviewerTurn', 'So the final answer is about 48,000']]);
  const rest = g.handle({ ...audio('BBBB'), outputTranscription: { text: ' scooters.' } }, 700);
  assert.deepEqual(types(rest), [], 'audio and words after the cut are dropped');
  const end = g.handle({ turnComplete: true }, 900);
  assert.deepEqual(finals(end), []);
  assert.deepEqual(types(end), ['readyForSteer'], 'the steer goes once the cut turn is over');
  // the steered reply plays normally
  assert.deepEqual(types(g.handle({ ...audio('CCCC'), outputTranscription: { text: 'Think of it as a funnel.' } }, 1200)), ['play', 'interviewerDraft']);
});

test('closing flushes what is still open, in order', () => {
  const g = new GeminiLiveTurns();
  g.handle({ inputTranscription: { text: 'My final answer is 50,000' } }, 0);
  assert.deepEqual(finals(g.flush()), [['candidateTurn', 'My final answer is 50,000']]);
});

test('guardrail fallback: if the cut turn never ends, releaseCut stops dropping and steers', () => {
  const g = new GeminiLiveTurns();
  g.handle({ ...audio(), outputTranscription: { text: 'The final answer is 48,000' } }, 0);
  g.cut();
  assert.deepEqual(types(g.releaseCut()), ['readyForSteer']);
  assert.deepEqual(types(g.releaseCut()), [], 'only once');
  assert.deepEqual(types(g.handle({ ...audio(), outputTranscription: { text: 'Think of a funnel.' } }, 3000)), ['play', 'interviewerDraft']);
});
