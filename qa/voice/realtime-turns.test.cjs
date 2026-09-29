/**
 * Realtime voice turn control - regression tests for the brief's section 57 I-L and
 * invariants 6/7 on the browser side (no microphone needed; pure logic with a fake clock).
 *   node --require ./qa/ts-register.cjs --test qa/voice/*.test.cjs
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { RealtimeTurnController, timingReport, HOLD_RELEASE_MS, HOLD_MAX_AGE_MS } = require('@/lib/voice/realtime-turns');
const { isLikelyNoise } = require('@/lib/voice/noise-guard');
const { isEchoOfLine, voiceLine } = require('@/lib/voice/v11-voice');

function make() {
  let now = 1_000_000;
  const clock = { now: () => now, advance: (ms) => { now += ms; } };
  const c = new RealtimeTurnController({ isNoise: isLikelyNoise, isEcho: isEchoOfLine }, clock.now);
  return { c, clock };
}

test('one completed item -> exactly one decision (duplicate / replayed transcription ignored)', () => {
  const { c } = make();
  const a = c.onTranscriptCompleted('item_1', 'What population should I use?');
  assert.deepEqual(a, [{ type: 'decide', turnId: 'item_1', text: 'What population should I use?' }]);
  const b = c.onTranscriptCompleted('item_1', 'What population should I use?');
  assert.deepEqual(b, [{ type: 'drop', turnId: 'item_1', reason: 'duplicate' }]);
});

test('I: nothing is spoken without an application decision; NO_OUTPUT speaks nothing', () => {
  const { c } = make();
  c.onSpeechStopped();
  c.onTranscriptCompleted('item_1', 'let me think');
  assert.deepEqual(c.onDecision('item_1', null), [{ type: 'drop', turnId: 'item_1', reason: 'silence' }]);
  assert.equal(voiceLine({ lane: 'SILENCE', say: null }), null);
  assert.equal(voiceLine({ lane: 'SUBSTANTIVE', say: '  ' }), null);
});

test('J: candidate talks over the interviewer -> barge-in (cancel + clear)', () => {
  const { c } = make();
  c.onInterviewerAudio(true);
  assert.deepEqual(c.onSpeechStarted(), [{ type: 'bargeIn' }]);
  c.onInterviewerAudio(false);
  assert.deepEqual(c.onSpeechStarted(), []);
});

test('J: a decision arriving while the candidate is speaking again is held, never spoken over them', () => {
  const { c, clock } = make();
  c.onSpeechStopped();
  c.onTranscriptCompleted('item_1', 'Can you give me a hint?');
  c.onSpeechStarted();                                  // candidate starts again before the reply lands
  assert.deepEqual(c.onDecision('item_1', 'Think about households first.'), [{ type: 'hold', turnId: 'item_1' }]);
  // they keep talking and finish a NEW turn -> the old line is dropped, never replayed
  c.onSpeechStopped();
  const acts = c.onTranscriptCompleted('item_2', 'Actually, I will start from households.');
  assert.deepEqual(acts[0], { type: 'drop', turnId: 'item_1', reason: 'superseded' });
  clock.advance(HOLD_RELEASE_MS + 10);
  assert.deepEqual(c.tick(), []);
  assert.deepEqual(c.onDecision('item_2', null), [{ type: 'drop', turnId: 'item_2', reason: 'silence' }]);
});

test('a held line is released if the "speech" produced no new turn (a cough)', () => {
  const { c, clock } = make();
  c.onSpeechStopped();
  c.onTranscriptCompleted('item_1', 'Can you give me a hint?');
  c.onSpeechStarted();
  c.onDecision('item_1', 'Think about households first.');
  c.onSpeechStopped();
  assert.deepEqual(c.tick(), []);                      // too soon
  clock.advance(HOLD_RELEASE_MS + 1);
  assert.deepEqual(c.tick(), [{ type: 'speak', turnId: 'item_1', line: 'Think about households first.' }]);
});

test('a held line that went stale is dropped, not said late', () => {
  const { c, clock } = make();
  c.onSpeechStopped();
  c.onTranscriptCompleted('item_1', 'hint please');
  c.onSpeechStarted();
  c.onDecision('item_1', 'Consider affordability.');
  clock.advance(HOLD_MAX_AGE_MS + 1);
  assert.deepEqual(c.tick(), [{ type: 'drop', turnId: 'item_1', reason: 'stale' }]);
});

test('a decision for an older turn than the latest is never spoken', () => {
  const { c } = make();
  c.onTranscriptCompleted('item_1', 'What population should I use?');
  c.onTranscriptCompleted('item_2', 'Actually, what time period?');
  assert.deepEqual(c.onDecision('item_1', 'Use 1.4 billion.'), [{ type: 'drop', turnId: 'item_1', reason: 'superseded' }]);
  assert.deepEqual(c.onDecision('item_2', 'Annual figures.'), [{ type: 'speak', turnId: 'item_2', line: 'Annual figures.' }]);
});

test('K / invariant 7: the interviewer\'s own line heard by the mic never becomes a turn', () => {
  const { c, clock } = make();
  c.onTranscriptCompleted('item_1', 'What population should I use?');
  c.onDecision('item_1', 'Take India at about 1.4 billion people.');
  clock.advance(1500);
  const echo = c.onTranscriptCompleted('item_2', 'Take India at about 1.4 billion people.');
  assert.deepEqual(echo, [{ type: 'drop', turnId: 'item_2', reason: 'echo' }]);
  const partialEcho = c.onTranscriptCompleted('item_3', 'about 1.4 billion people');
  assert.equal(partialEcho[0].reason, 'echo');
  const real = c.onTranscriptCompleted('item_4', 'Okay, 1.4 billion, so households are about 31 crore.');
  assert.equal(real[0].type, 'decide');
});

test('whisper silence artefacts never become turns', () => {
  const { c } = make();
  for (const t of ['Thank you.', 'you', 'Thanks for watching!', '.']) {
    const a = c.onTranscriptCompleted('x' + t, t);
    assert.equal(a[0].type, 'drop', t);
  }
});

test('L: a reconnect that replays the final item does not duplicate the response', () => {
  const { c } = make();
  c.onTranscriptCompleted('item_7', 'Can I assume India only?');
  assert.deepEqual(c.onDecision('item_7', 'Yes, India only.'), [{ type: 'speak', turnId: 'item_7', line: 'Yes, India only.' }]);
  assert.equal(c.onTranscriptCompleted('item_7', 'Can I assume India only?')[0].reason, 'duplicate');
});

test('timing report carries T1..T4 relative to T0 and never any text', () => {
  const r = timingReport({ turnId: 'item_1', t0: 1000, t1: 1400, t2: 1900, t3: 1910, t4: 2300, lane: 'PRESENCE' });
  assert.equal(r.t1_ms, 400); assert.equal(r.t2_ms, 900); assert.equal(r.t3_ms, 910); assert.equal(r.t4_ms, 1300);
  assert.ok(!Object.values(r).some((v) => typeof v === 'string' && v.includes(' ')));
});

test('short numeric turns and explicit yes/no are candidate turns, not noise (brief 3/14)', () => {
  for (const t of ['3', '50%', '3%', '1.5x', '0.5%', '1 crore', '0.46B', '460 million', '₹10,000', 'yes', 'no', 'Yes.']) {
    assert.equal(isLikelyNoise(t), false, t);
  }
  for (const t of ['Thank you.', 'you', '.', '...', 'hmm', 'ok', 'Thanks for watching!', 'uh']) {
    assert.equal(isLikelyNoise(t), true, t);
  }
});
