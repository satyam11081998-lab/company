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

test('talking over the interviewer interrupts it (barge-in) once real words are heard', async () => {
  const h = harness();
  h.c.begin(['A long question about your background and choices?']);
  assert.equal(h.t.busy, true);
  h.ev.onSpeechStart();
  assert.equal(h.t.interrupted, 0, 'a sound alone (maybe our own echo) does not cut the interviewer off');
  h.ev.onPartial('sorry can');
  assert.equal(h.t.interrupted, 1);
  assert.equal(h.c.phase, 'hearing');
  h.ev.onSpeechStop(); h.ev.onFinal('Sorry, can you say that again slowly please?', { durationMs: 2500 });
  h.clock.advance(1000);
  assert.equal(h.submits[0].txt, 'Sorry, can you say that again slowly please?');
});

test('the interviewer\'s own voice leaking into the mic never cuts it off or becomes an answer', async () => {
  const LINE = 'Tell me about a time you led a team through a crisis and what you changed afterwards.';
  const h = harness();
  h.c.begin([LINE]);
  h.ev.onSpeechStart();
  h.ev.onPartial('tell me about a time');
  h.ev.onPartial('tell me about a time you led a team trough a crisis');   // mis-heard echo
  assert.equal(h.t.interrupted, 0);
  assert.equal(h.c.phase, 'speaking');
  h.ev.onSpeechStop(); h.ev.onFinal('Tell me about a time you led a team trough a crisis.', { durationMs: 3000 });
  assert.equal(h.t.interrupted, 0);
  assert.equal(h.c.phase, 'speaking');
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'listening');
  // the tail of the echo arriving just after the line finished is dropped too
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('and what you changed afterwards', { durationMs: 1800 });
  h.clock.advance(8000);
  assert.equal(h.submits.length, 0);
  assert.equal(h.c.phase, 'listening');
  // a final transcript with real words during speech is a barge-in (no live partials on some engines)
  h.c.repeat();
  h.ev.onSpeechStart(); h.ev.onFinal('I was the one who stepped in when our vendor failed', { durationMs: 3000 });
  assert.equal(h.t.interrupted, 1);
  h.clock.advance(1000);
  assert.equal(h.submits[0].txt, 'I was the one who stepped in when our vendor failed');
});

test('one answer is capped: a warning, then it is sent and the interview moves on', async () => {
  const h = harness({ maxAnswerMs: 300000, answerWarnMs: 270000 });
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart();
  h.ev.onPartial('so the first thing we did was');
  h.clock.advance(269000);
  assert.ok(!h.log.some((x) => x[0] === 'notice'));
  h.clock.advance(1000);
  assert.match(h.log.filter((x) => x[0] === 'notice').pop()[1], /30 seconds/);
  h.ev.onPartial('so the first thing we did was rebuild the whole pipeline and');
  h.clock.advance(30000);
  assert.match(h.log.filter((x) => x[0] === 'notice').pop()[1], /five minutes/);
  assert.equal(h.submits.length, 1);
  assert.equal(h.submits[0].txt, 'so the first thing we did was rebuild the whole pipeline and');
  assert.equal(h.c.phase, 'thinking');
  assert.equal(h.t.listening, false, 'mic closed while II answers');
});

test('the answer cap spans pauses inside one answer and resets for the next answer', async () => {
  const h = harness({ maxAnswerMs: 300000, answerWarnMs: 270000 });
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('First part of the answer here.', { durationMs: 2000 });
  h.ev.onSpeechStart();                       // carried on within the grace window
  h.clock.advance(200000);
  h.ev.onSpeechStop(); h.ev.onFinal('second part.', { durationMs: 2000 });
  h.ev.onSpeechStart();
  h.clock.advance(100000);
  assert.equal(h.submits.length, 1, 'capped at five minutes from the first word');
  await h.flush(); h.t.finishSpeaking();     // ack
  h.t.finishSpeaking();                       // next question
  assert.equal(h.c.phase, 'listening');
  h.ev.onSpeechStart();
  h.clock.advance(290000);
  assert.equal(h.submits.length, 1, 'a fresh five minutes for the next answer');
});

test('silence ladder: nudge at 1 min, "still there?" at 3, away at 4 — counted from the question', async () => {
  const h = harness({ nudgeAfterMs: 60000, stillThereAfterMs: 180000, idleAfterMs: 240000 });
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.clock.advance(60000);
  assert.equal(h.said[h.said.length - 1].txt, text.NUDGE);
  h.clock.advance(5000); h.t.finishSpeaking();          // nudge took 5 s to say
  h.clock.advance(115000);                               // t = 180 s
  assert.equal(h.said[h.said.length - 1].txt, text.STILL_THERE);
  h.clock.advance(4000); h.t.finishSpeaking();
  assert.ok(!h.log.some((x) => x[0] === 'idle'));
  h.clock.advance(55000);                                // t = 239 s
  assert.ok(!h.log.some((x) => x[0] === 'idle'));
  h.clock.advance(1000);                                 // t = 240 s
  assert.equal(h.log.filter((x) => x[0] === 'idle').length, 1);
});

test('speaking resets the silence ladder', async () => {
  const h = harness({ nudgeAfterMs: 60000, stillThereAfterMs: 180000, idleAfterMs: 240000 });
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.clock.advance(60000); h.t.finishSpeaking();            // the 1-minute nudge
  h.clock.advance(110000);
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal('', { durationMs: 2000 });   // not caught
  h.t.finishSpeaking();
  h.clock.advance(170000);
  assert.ok(!h.said.some((s) => s.txt === text.STILL_THERE));
  assert.ok(!h.log.some((x) => x[0] === 'idle'));
});

test('swap mid-answer keeps what was heard; swap mid-question re-says it', async () => {
  const h = harness();
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onPartial('we cut costs by thirty percent across');
  const t2 = Object.assign(Object.create(Object.getPrototypeOf(h.t)), h.t, { said: [] });
  h.c.swap(t2);
  h.clock.advance(1000);
  assert.equal(h.submits[0].txt, 'we cut costs by thirty percent across');
  const h2 = harness();
  h2.c.begin(['A question that was cut off?']);
  h2.c.swap(h2.t);
  assert.equal(h2.said.filter((s) => s.txt === 'A question that was cut off?').length, 2);
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
  const Q = { text: 'Tell me about the biggest risk you took in your last role.', at: 0 };
  assert.ok(text.isEchoOfLine('tell me about the biggest risk you took in your lost role', Q, 500), 'a mis-heard echo is still an echo');
  assert.ok(!text.isEchoOfLine('the biggest risk I took was leaving a stable job', Q, 500), 'quoting the question then answering is an answer');
  assert.ok(!text.isEchoOfLine('the biggest risk I took', Q, 500));
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

test('a reply that lands while the line is reconnecting is spoken as soon as it is back', async () => {
  const h = harness();
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000);
  h.t.finishSpeaking();                 // the ack
  h.c.detach();                         // the line dropped while II was thinking
  await h.flush();
  assert.equal(h.c.phase, 'thinking');
  h.c.swap(h.t);
  assert.equal(h.said[h.said.length - 1].txt, 'Next question?');
  h.t.finishSpeaking();
  assert.equal(h.c.phase, 'listening');
});

test('a reply that lands during a break is not spoken over the break', async () => {
  const h = harness();
  h.c.begin(['Q1?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop(); h.ev.onFinal(LONG, { durationMs: 5000 });
  h.clock.advance(1000);
  h.c.pause(); h.c.detach();
  const n = h.said.length;
  await h.flush();
  assert.equal(h.c.phase, 'paused');
  h.c.swap(h.t);
  assert.equal(h.said.length, n, 'nothing spoken until the candidate resumes');
  assert.equal(h.c.question, 'Next question?');
});

test('unmuting (or coming back to the tab) restarts the silence clock', async () => {
  const h = harness({ nudgeAfterMs: 60000, stillThereAfterMs: 180000, idleAfterMs: 240000 });
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.clock.advance(59000);
  h.c.setMuted(true);
  h.clock.advance(300000);
  h.c.setMuted(false);
  h.clock.advance(59000);
  assert.equal(h.said.filter((s) => s.kind === 'nudge').length, 0);
  assert.ok(!h.log.some((x) => x[0] === 'idle'));
  h.clock.advance(1000);
  assert.equal(h.said.filter((s) => s.kind === 'nudge').length, 1);
});

test('a question back to the interviewer gets no "Okay." (it gets an answer)', async () => {
  const h = harness();
  h.c.begin(['Q?']); h.t.finishSpeaking();
  h.ev.onSpeechStart(); h.ev.onSpeechStop();
  h.ev.onFinal('Sorry, do you mean the project at my last company or the current one?', { durationMs: 3000 });
  h.clock.advance(1000);
  assert.equal(h.submits.length, 1);
  assert.equal(h.said.filter((s) => s.kind === 'ack').length, 0);
});
