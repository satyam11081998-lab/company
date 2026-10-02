const test = require('node:test');
const assert = require('node:assert');
const g = require('./out/gemini.js');

const flush = () => new Promise((r) => setImmediate(r));
const b64audio = (samples) => Buffer.from(new Int16Array(samples).fill(1000).buffer).toString('base64');
const AUDIO = (samples = 2400) => ({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: b64audio(samples) } }] } } });

function harness({ refuse = 0, unreachable = 0, startTier } = {}) {
  const sockets = [];
  class FakeWS {
    constructor(url) {
      this.url = url; this.sent = []; this.readyState = 0; sockets.push(this);
      setImmediate(() => { this.readyState = 1; this.onopen && this.onopen(); });
    }
    send(d) { this.sent.push(JSON.parse(d)); }
    close() { this.readyState = 3; this.onclose && this.onclose({ code: 1000 }); }
    emit(obj) { this.onmessage({ data: JSON.stringify(obj) }); }
    drop() { this.readyState = 3; this.onclose && this.onclose({ code: 1011, reason: 'gone' }); }
  }
  let now = 0; const intervals = [];
  const clock = {
    now: () => now,
    setInterval: (fn, ms) => { const t = { fn, ms, next: now + ms }; intervals.push(t); return t; },
    clearInterval: (t) => { const i = intervals.indexOf(t); if (i >= 0) intervals.splice(i, 1); },
  };
  const advance = (ms) => {
    const end = now + ms;
    for (;;) {
      const due = intervals.filter((t) => t.next <= end).sort((a, b) => a.next - b.next)[0];
      if (!due) break;
      now = due.next; due.next += due.ms; due.fn();
    }
    now = end;
  };
  const player = {
    played: 0, active: false, stops: 0, idle: null,
    play(pcm) { this.played += pcm.length; this.active = true; },
    stop() { this.active = false; this.stops++; },
    finish() { this.active = false; this.idle(); },
    level: () => 0, dispose() {},
  };
  let vadCb = null;
  const vad = { speaking: false, paused: false, start() {}, stop() {}, pause() { this.paused = true; }, resume() { this.paused = false; },
    get isSpeaking() { return this.speaking; } };
  let micFn = null;
  const mints = []; const usage = [];
  const log = [];
  const ev = {
    onSpeechStart: () => log.push(['start']), onSpeechStop: () => log.push(['stop']),
    onPartial: (t) => log.push(['partial', t]), onFinal: (t, m) => log.push(['final', t, m.durationMs]),
    onSpeaking: (on, kind, text) => log.push(['speaking', on, kind, text]),
    onFatal: (m, code) => log.push(['fatal', code]), onWarning: (m) => log.push(['warn', m]),
  };
  let refusals = refuse;
  const t = new g.GeminiLiveTransport({
    ctx: {}, stream: { getAudioTracks: () => [] },
    mint: async (tier) => { mints.push(tier); return { token: 'tk', ws_url: `wss://fake/${tier}`, model: 'models/m', voice: 'Aoede', setup: { model: 'models/m' }, tier, tiers: 3, max_session_s: 1800 }; },
    usage: (i, o) => usage.push([i, o]),
    WebSocketImpl: function (url) {
      if (unreachable > 0) {
        unreachable--;
        const s = { url, sent: [], readyState: 0, send() {}, close() {} };
        sockets.push(s);
        setImmediate(() => { s.readyState = 3; s.onclose && s.onclose({ code: 1006 }); });
        return s;
      }
      return new FakeWS(url);
    },
    startTier,
    capture: (fn) => { micFn = fn; return { stop() {} }; },
    player: (idle) => { player.idle = idle; return player; },
    vad: (cb) => { vadCb = cb; return vad; },
    clock,
  }, ev);
  const ws = () => sockets[sockets.length - 1];
  async function connect() {
    const p = t.start();
    for (;;) {
      await flush();
      const s = ws();
      if (s && s.readyState === 1 && s.sent.length && !s.setupAnswered) {
        s.setupAnswered = true;
        if (refusals > 0) { refusals--; s.drop(); continue; }
        s.emit({ setupComplete: {} });
        break;
      }
    }
    await p;
  }
  const talk = (n = 5) => { for (let i = 0; i < n; i++) micFn(new Int16Array(1600)); }; // 100 ms chunks
  const sentOf = (type) => ws().sent.filter((m) => m.realtimeInput && type in m.realtimeInput);
  return { t, ws, sockets, connect, advance, player, vad, vadCb: () => vadCb, talk, mints, usage, log, sentOf, flush,
    speaking: () => log.filter((x) => x[0] === 'speaking') };
}

test('connects with the minted token; a config Google refuses at setup steps down to the next one', async () => {
  const h = harness({ refuse: 1 });
  await h.connect();
  assert.deepStrictEqual(h.mints, [0, 1]);
  assert.equal(h.sockets[0].url, 'wss://fake/0');
  assert.deepStrictEqual(h.sockets[0].sent[0], { setup: { model: 'models/m' } });
  assert.equal(h.t.tier, 1);
  assert.ok(!h.log.some((x) => x[0] === 'fatal'));
});

test('a network blip while connecting is retried on the same config; a redial starts from the config that worked', async () => {
  const h = harness({ unreachable: 1, startTier: 2 });
  const started = h.connect();
  await started;
  assert.deepStrictEqual(h.mints, [2, 2], 'same config again, not a step down');
  assert.equal(h.t.tier, 2);
});

test('a line is sent as SAY and only its reply is played; the end is reported once playback ends', async () => {
  const h = harness();
  await h.connect();
  h.t.say('Tell me about yourself.', 'line');
  assert.deepStrictEqual(h.sentOf('text').map((m) => m.realtimeInput.text), ['SAY: Tell me about yourself.']);
  assert.deepStrictEqual(h.speaking()[0], ['speaking', true, 'line', 'Tell me about yourself.']);
  assert.equal(h.t.busy, true);
  h.ws().emit(AUDIO()); h.ws().emit(AUDIO()); await h.flush();
  assert.equal(h.player.played, 4800);
  h.ws().emit({ serverContent: { turnComplete: true } }); await h.flush();
  assert.equal(h.speaking().length, 1, 'still playing');
  h.player.finish();
  assert.deepStrictEqual(h.speaking()[1], ['speaking', false, null, undefined]);
  assert.equal(h.t.busy, false);
});

test('Gemini answering by itself is never played, and the next line waits until that answer is over', async () => {
  const h = harness();
  await h.connect();
  h.ws().emit(AUDIO()); await h.flush();                 // its own answer to the candidate
  assert.equal(h.player.played, 0);
  h.t.say('Next question?', 'line');
  assert.equal(h.sentOf('text').length, 0, 'held');
  h.ws().emit({ serverContent: { turnComplete: true } }); await h.flush();
  assert.deepStrictEqual(h.sentOf('text').map((m) => m.realtimeInput.text), ['SAY: Next question?']);
  h.ws().emit(AUDIO()); await h.flush();
  assert.equal(h.player.played, 2400);
});

test('no spoken acknowledgement on Gemini (a stray answer could be played as the ack)', async () => {
  const h = harness();
  await h.connect();
  h.t.say('Okay.', 'ack');
  assert.equal(h.sentOf('text').length, 0);
  assert.equal(h.t.busy, false);
});

test('mic audio is streamed only while the candidate talks (with pre-roll), never while not listening', async () => {
  const h = harness();
  await h.connect();
  h.talk(20);                                           // 2 s of room noise
  assert.equal(h.sentOf('audio').length, 0, 'silence is not streamed');
  h.vadCb().onSpeechStart();
  const pre = h.sentOf('audio').length;
  assert.ok(pre >= 5 && pre <= 7, `~600 ms of pre-roll, got ${pre}`);
  h.talk(10);
  assert.equal(h.sentOf('audio').length, pre + 10);
  assert.equal(h.sentOf('audio')[0].realtimeInput.audio.mimeType, 'audio/pcm;rate=16000');
  h.vadCb().onSpeechEnd({ durationMs: 1800 });
  assert.equal(h.sentOf('audioStreamEnd').length, 1);
  h.talk(5);
  assert.equal(h.sentOf('audio').length, pre + 10);
  h.t.setListening(false);
  assert.equal(h.vad.paused, true);
  h.vadCb().onSpeechStart();
  h.talk(5);
  assert.equal(h.sentOf('audio').length, pre + 10, 'closed mic while II is thinking');
  assert.ok(!h.log.some((x) => x[0] === 'start' && h.log.indexOf(x) > 1));
});

test('transcripts: words stream as partials; the final waits for late words; carrying on keeps one answer', async () => {
  const h = harness();
  await h.connect();
  h.vadCb().onSpeechStart();
  h.ws().emit({ serverContent: { inputTranscription: { text: 'We cut' } } });
  h.ws().emit({ serverContent: { inputTranscription: { text: ' costs by' } } }); await h.flush();
  assert.deepStrictEqual(h.log.filter((x) => x[0] === 'partial').pop(), ['partial', 'We cut costs by']);
  h.vadCb().onSpeechEnd({ durationMs: 2000 });
  h.advance(300);
  h.vadCb().onSpeechStart();                            // a thinking pause, then more
  h.ws().emit({ serverContent: { inputTranscription: { text: ' thirty percent.' } } }); await h.flush();
  h.vadCb().onSpeechEnd({ durationMs: 1000 });
  h.advance(500);
  h.ws().emit({ serverContent: { inputTranscription: { text: ' In a year.' } } }); await h.flush();   // late words
  h.advance(450);
  assert.equal(h.log.filter((x) => x[0] === 'final').length, 0);
  h.advance(300);
  const finals = h.log.filter((x) => x[0] === 'final');
  assert.deepStrictEqual(finals, [['final', 'We cut costs by thirty percent. In a year.', 3000]]);
});

test('Gemini deciding the turn is over (its own answer starts) settles the transcript quickly', async () => {
  const h = harness();
  await h.connect();
  h.vadCb().onSpeechStart();
  h.ws().emit({ serverContent: { inputTranscription: { text: 'No.' } } }); await h.flush();
  h.vadCb().onSpeechEnd({ durationMs: 700 });
  h.advance(100);
  h.ws().emit(AUDIO()); await h.flush();
  h.advance(400);                                       // well before the 800 ms settle
  assert.deepStrictEqual(h.log.filter((x) => x[0] === 'final'), [['final', 'No.', 700]]);
  assert.equal(h.player.played, 0);
});

test('a reply that goes off script is cut off and the line is asked for again, once', async () => {
  const h = harness();
  await h.connect();
  const LINE = 'Walk me through how you prioritised the roadmap last quarter.';
  h.t.say(LINE, 'line');
  h.ws().emit(AUDIO());
  h.ws().emit({ serverContent: { outputTranscription: { text: 'That sounds really impressive, great job on all of those achievements!' } } });
  await h.flush();
  assert.equal(h.player.stops, 1);
  h.ws().emit(AUDIO()); await h.flush();
  assert.equal(h.player.played, 2400, 'the rest of the off-script reply is dropped');
  h.ws().emit({ serverContent: { turnComplete: true } }); await h.flush();
  assert.deepStrictEqual(h.sentOf('text').map((m) => m.realtimeInput.text), [`SAY: ${LINE}`, `SAY: ${LINE}`]);
  h.ws().emit({ serverContent: { outputTranscription: { text: 'Walk me through how you prioritised the roadmap last quarter.' } } });
  h.ws().emit(AUDIO()); await h.flush();
  assert.equal(h.player.played, 4800);
});

test('interrupt stops the voice now and drops the rest; the next line waits for that reply to close', async () => {
  const h = harness();
  await h.connect();
  h.t.say('A long question about your background?', 'line');
  h.ws().emit(AUDIO()); await h.flush();
  h.t.interrupt();
  assert.equal(h.player.stops, 1);
  assert.deepStrictEqual(h.speaking().pop(), ['speaking', false, null, undefined]);
  assert.equal(h.t.busy, false);
  h.ws().emit(AUDIO()); await h.flush();
  assert.equal(h.player.played, 2400);
  h.t.say('Sure — what would you like me to repeat?', 'nudge');
  assert.equal(h.sentOf('text').length, 1, 'held until the cut reply closes');
  h.ws().emit({ serverContent: { turnComplete: true } }); await h.flush();
  assert.equal(h.sentOf('text').length, 2);
});

test('a line whose audio never starts is given up on after 8 s (the caption still shows it)', async () => {
  const h = harness();
  await h.connect();
  h.t.say('Q?', 'line');
  h.advance(8200);
  assert.ok(h.log.some((x) => x[0] === 'warn'));
  assert.deepStrictEqual(h.speaking().pop(), ['speaking', false, null, undefined]);
  h.t.say('Q2?', 'line');
  assert.equal(h.sentOf('text').length, 2);
});

test('a dropped connection after setup is reported (the call reconnects); usage is metered each minute and at the end', async () => {
  const h = harness();
  await h.connect();
  h.vadCb().onSpeechStart(); h.talk(30);
  h.t.say('Q?', 'line'); h.ws().emit(AUDIO(24000)); await h.flush();
  h.advance(60000);
  assert.equal(h.usage.length, 1);
  assert.ok(Math.abs(h.usage[0][0] - 3) < 0.01, String(h.usage[0][0]));     // only the 3 s of talking
  assert.ok(Math.abs(h.usage[0][1] - 1) < 0.01);
  h.ws().drop();
  assert.deepStrictEqual(h.log.filter((x) => x[0] === 'fatal'), [['fatal', 'connection']]);
  h.talk(10);
  h.t.stop();
  assert.equal(h.usage.length, 1, 'nothing streamed after the drop');
});

test('PCM helpers: 48 kHz -> 16 kHz, base64 round trip', () => {
  const d = new g.Downsampler(48000, 16000);
  assert.equal(d.push(new Float32Array(4800)).length, 1600);
  const d2 = new g.Downsampler(44100, 16000);
  let n = 0; for (let i = 0; i < 10; i++) n += d2.push(new Float32Array(4410)).length;
  assert.ok(Math.abs(n - 16000) <= 1, String(n));
  const pcm = new Int16Array([0, 1, -1, 32767, -32768, 1234]);
  assert.deepStrictEqual(Array.from(g.base64ToPcm16(g.pcm16ToBase64(pcm))), Array.from(pcm));
  assert.deepStrictEqual(Array.from(g.floatTo16([1, -1, 0])), [32767, -32768, 0]);
});
