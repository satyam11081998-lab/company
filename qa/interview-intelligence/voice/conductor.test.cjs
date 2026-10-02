const test = require('node:test');
const assert = require('node:assert');
const { Conductor } = require('./out/conductor.js');
const text = require('./out/text.js');

// ---------- fake clock + transport ----------
function harness(opts = {}, submitImpl, kind = 'realtime') {
  let now = 0; let seq = 0; const timers = new Map();
  const log = [];
  const clock = {
    now: () => now,
    setTimeout: (fn, ms) => { const id = ++seq; timers.set(id, { at: now + ms, fn }); return id; },
    clearTimeout: (id) => timers.delete(id),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        let next = null;
        for (const [id, t] of timers) if (t.at <= end && (!next || t.at < next[1].at)) next = [id, t];
        if (!next) break;
        timers.delete(next[0]); now = next[1].at; next[1].fn();
      }
      now = end;
    },
  };
  const said = [];
  const t = {
    kind, userSpeaking: false, _busy: false, listening: null, muted: false, stopped: false, interrupted: 0,
    get busy() { return this._busy; },
    start: async () => {}, say(txt, kind) { said.push({ txt, kind }); this._busy = true; ev.onSpeaking(true, kind, txt); },
    finishSpeaking() { this._busy = false; ev.onSpeaking(false, null); },
    interrupt() { this.interrupted++; if (this._busy) { this._busy = false; ev.onSpeaking(false, null); } },
    setListening(on) { this.listening = on; }, setMuted(m) { this.muted = m; }, levels: () => ({ mic: 0, out: 0 }), stop() { this.stopped = true; },
  };
  const submits = [];
  const hooks = {
    submit: (txt, ms, id, kind) => { submits.push({ txt, ms, id, kind }); return submitImpl ? submitImpl(txt, submits.length) : Promise.resolve({ lines: ['Next question?'], status: 'active' }); },
    onPhase: (p) => log.push(['phase', p]), onCaption: (l, k) => log.push(['caption', l, k]), onPartial: (p) => log.push(['partial', p]),
    onCandidateTurn: (txt, kind) => log.push(['cand', txt, kind]), onInterviewerTurn: (l) => log.push(['int', l]),
    onNotice: (m) => log.push(['notice', m]), onError: (m, retry) => { log.push(['error', m]); hooks._retry = retry; },
    onEnded: () => log.push(['ended']), onIdle: () => log.push(['idle']), newTurnId: () => `turn-${submits.length + 1}`,
    ...clock,
  };
  const c = new Conductor(hooks, { graceMs: 1000, ackMinWords: 8, nudgeAfterMs: 45000, idleAfterMs: 240000, maxSubmitRetries: 2, transcriptTimeoutMs: 7000, ...opts });
  const ev = c.events({ onFatal: () => {} });
  c.attach(t);
  const flush = () => new Promise((r) => setImmediate(r));
  return { c, t, ev, said, submits, log, clock, hooks, flush, phases: () => log.filter((x) => x[0] === 'phase').map((x) => x[1]) };
}
const LONG = 'I led the relaunch myself and grew revenue eighteen percent in two quarters';

test('opening line is spoken, then the mic opens', async () => {
  const h = harness();
  h.c.begin(['Hello, tell me about yourself.']);
  assert.equal(h.said[0].txt, 'Hello, tell me about yourself.');
  assert.equal(h.c.phase, 'speaking');
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'listening');
  assert.equal(h.t.listening, true);
});

test('a pause inside an answer does not end it; the answer is sent once, whole', async () => {
  const h = harness();
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.clock.advance(2000);
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('I led the relaunch myself', { durationMs: 3000 });
  assert.equal(h.c.phase, 'finishing');
  h.clock.advance(600);                       // thinking pause shorter than the grace window
  h.ev.onSpeechStart();                       // they carry on
  assert.equal(h.c.phase, 'hearing');
  h.ev.onSpeechStop(); h.ev.onFinal('and grew revenue eighteen percent in two quarters', { durationMs: 4000 });
  assert.equal(h.submits.length, 0);
  h.clock.advance(1000);
  assert.equal(h.submits.length, 1);
  assert.equal(h.submits[0].txt, LONG);
  assert.equal(h.submits[0].kind, 'voice');
  assert.ok(h.submits[0].ms >= 2600, 'answer time measured from the end of the question');
  assert.equal(h.c.phase, 'thinking');
  assert.equal(h.t.listening, false, 'mic closed while II thinks');
  assert.equal(h.said[1].kind, 'ack', 'a neutral acknowledgement fills the silence');
  assert.ok(text.ACKS.includes(h.said[1].txt));
});

test('the reply is spoken after the ack and the next question opens the mic again', async () => {
  const h = harness();
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000);
  await h.flush();
  const last = h.said[h.said.length - 1];
  assert.equal(last.txt, 'Next question?'); assert.equal(last.kind, 'line');
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'listening');
  assert.equal(h.t.listening, true);
});

test('short answers get no acknowledgement', async () => {
  const h = harness();
  h.c.begin(['Did you lead it?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('No.', { durationMs: 2000 });
  h.clock.advance(1000);
  assert.equal(h.submits[0].txt, 'No.');
  assert.equal(h.said.filter((s) => s.kind === 'ack').length, 0);
});

test('talking over the interviewer interrupts it (barge-in)', async () => {
  const h = harness();
  h.c.begin(['A long question about your background and choices?']);
  assert.equal(h.t.busy, true);
  h.ev.onSpeechStart();
  assert.equal(h.t.interrupted, 1);
  assert.equal(h.c.phase, 'hearing');
});

test('echo of the interviewer and recogniser noise never become an answer', async () => {
  const h = harness();
  h.c.begin(['Tell me about a decision you owned.']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('Tell me about a decision you owned.', { durationMs: 2500 });
  h.clock.advance(3000);
  assert.equal(h.submits.length, 0); assert.equal(h.c.phase, 'listening');
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('Thanks for watching!', { durationMs: 900 });
  h.clock.advance(3000);
  assert.equal(h.submits.length, 0);
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('Thank you.', { durationMs: 700 });
  h.clock.advance(3000);
  assert.equal(h.submits.length, 0, 'short "thank you" on a tiny clip is a hallucination');
});

test('real speech that could not be transcribed gets a polite "say again"', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('', { durationMs: 4000 });
  assert.match(h.said[h.said.length - 1].txt, /didn't catch/);
  assert.equal(h.submits.length, 0);
});

test('no transcript at all after speech -> "say again", nothing sent, then listening', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop();
  h.clock.advance(7000);
  assert.equal(h.submits.length, 0);
  assert.match(h.said[h.said.length - 1].txt, /didn't catch/);
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'listening');
});

test('a network blip is retried with the SAME turn id; a hard failure asks, retry reuses the id', async () => {
  let n = 0;
  const h = harness({}, () => { n++; return n <= 3 ? Promise.reject(Object.assign(new Error('Network down'), { status: 0 })) : Promise.resolve({ lines: ['Q2?'], status: 'active' }); });
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000); await h.flush();
  h.clock.advance(1200); await h.flush();
  h.clock.advance(2400); await h.flush();
  assert.equal(h.c.phase, 'error');
  assert.equal(new Set(h.submits.map((s) => s.id)).size, 1, 'all retries reuse one turn id');
  h.hooks._retry(); await h.flush();
  assert.equal(h.submits.length, 4); assert.equal(h.submits[3].id, h.submits[0].id);
  assert.equal(h.said[h.said.length - 1].txt, 'Q2?');
});

test('a 4xx (e.g. not entitled) is not retried', async () => {
  const h = harness({}, () => Promise.reject(Object.assign(new Error('Not allowed'), { status: 403 })));
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000); await h.flush();
  assert.equal(h.submits.length, 1); assert.equal(h.c.phase, 'error');
});

test('interview completion: closing line is spoken, then the call ends', async () => {
  const h = harness({}, () => Promise.resolve({ lines: ['Thanks, that is all from me.'], status: 'completed' }));
  h.c.begin(['Last question?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000); await h.flush();
  assert.equal(h.said[h.said.length - 1].txt, 'Thanks, that is all from me.');
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'ended');
  assert.ok(h.log.some((x) => x[0] === 'ended'));
});

test('silence: one gentle nudge per question, then the idle hook', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.clock.advance(45000);
  assert.equal(h.said[h.said.length - 1].kind, 'nudge');
  h.t.finishSpeaking();
  h.clock.advance(60000);
  assert.equal(h.said.filter((s) => s.kind === 'nudge').length, 1, 'only one nudge');
  h.clock.advance(240000);
  assert.ok(h.log.some((x) => x[0] === 'idle'));
});

test('mute stops nudges; typed answer goes through the same turn path', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.c.setMuted(true);
  h.clock.advance(300000);
  assert.equal(h.said.filter((s) => s.kind === 'nudge').length, 0);
  h.c.setMuted(false);
  h.c.submitTyped('Revenue was 1.2 crore.');
  assert.equal(h.submits[0].txt, 'Revenue was 1.2 crore.'); assert.equal(h.submits[0].kind, 'text');
  assert.equal(h.said.filter((s) => s.kind === 'ack').length, 0, 'typed answers get no spoken ack');
});

test('repeat speaks the current question without asking II', async () => {
  const h = harness();
  h.c.begin(['Walk me through your biggest decision?']); h.t.finishSpeaking();
  h.c.repeat();
  assert.equal(h.said[h.said.length - 1].txt, 'Walk me through your biggest decision?');
  assert.equal(h.submits.length, 0);
});

test('a multi-line reply is spoken as one item (a barge-in cannot drop the question)', async () => {
  const h = harness({}, () => Promise.resolve({ lines: ['Thanks.', 'Now, tell me about a conflict?'], status: 'active' }));
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000); await h.flush();
  assert.equal(h.said[h.said.length - 1].txt, 'Thanks. Now, tell me about a conflict?');
  assert.equal(h.log.filter((x) => x[0] === 'int').length, 3);
});

test('pause stops everything; speech while paused is ignored', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.c.pause();
  assert.equal(h.c.phase, 'paused'); assert.equal(h.t.listening, false);
  h.ev.onSpeechStart(); h.ev.onFinal(LONG, {});
  h.clock.advance(5000);
  assert.equal(h.submits.length, 0);
  h.c.begin(['Welcome back. Where were we?']);
  assert.equal(h.c.phase, 'speaking');
});

test('text helpers', () => {
  assert.deepStrictEqual(text.splitSentences('Revenue grew 1.5x. Why? Tell me more about the 20.5% margin.'),
    ['Revenue grew 1.5x. Why?', 'Tell me more about the 20.5% margin.']);
  assert.ok(!text.isNoiseTranscript('No.'));
  assert.ok(text.isNoiseTranscript('you'));
  assert.ok(text.isNoiseTranscript('...'));
  assert.ok(text.isEchoOfLine('tell me about a decision', { text: 'Tell me about a decision you owned.', at: 0 }, 1000));
  assert.ok(!text.isEchoOfLine('tell me', { text: 'Tell me about a decision you owned.', at: 0 }, 1000), 'two words are not enough');
  assert.ok(!text.isEchoOfLine('tell me about a decision', { text: 'Tell me about a decision you owned.', at: 0 }, 9000), 'too late to be an echo');
  for (let i = 0; i < 20; i++) { const a = text.pickAck('Okay.'); assert.notEqual(a, 'Okay.'); }
});

test('standard voice uses a shorter grace window (its VAD already waited)', async () => {
  const h = harness({}, undefined, 'standard');
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(460);
  assert.equal(h.submits.length, 1);
});

test('answer time is sent as whole milliseconds (the API takes an integer)', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.clock.advance(0.37); h.t.finishSpeaking();
  h.clock.advance(1234.56);
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000.3);
  assert.ok(Number.isInteger(h.submits[0].ms), String(h.submits[0].ms));
});
