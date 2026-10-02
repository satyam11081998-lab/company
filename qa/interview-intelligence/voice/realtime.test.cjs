const test = require('node:test');
const assert = require('node:assert');

// ---- minimal browser stand-ins ----
class FakeDC {
  constructor() { this.readyState = 'connecting'; this.sent = []; this.l = {}; }
  addEventListener(t, f) { (this.l[t] ||= []).push(f); }
  send(s) { this.sent.push(JSON.parse(s)); }
  emit(t, data) { (this.l[t] || []).forEach((f) => f(data !== undefined ? { data: JSON.stringify(data) } : {})); }
  close() { this.readyState = 'closed'; }
}
let lastPC = null;
global.RTCPeerConnection = class {
  constructor() { lastPC = this; this.dc = new FakeDC(); this.connectionState = 'new'; this.l = {}; }
  addTrack() {}
  createDataChannel() { return this.dc; }
  async createOffer() { return { sdp: 'offer-sdp' }; }
  async setLocalDescription() {}
  async setRemoteDescription() { setTimeout(() => { this.dc.readyState = 'open'; this.dc.emit('open'); }, 5); }
  addEventListener(t, f) { (this.l[t] ||= []).push(f); }
  close() {}
};
const fetched = [];
global.fetch = async (url, init) => { fetched.push({ url, init }); return { ok: true, status: 201, text: async () => 'answer-sdp' }; };
global.document = { createElement: () => ({ setAttribute() {}, style: {}, play: () => Promise.resolve(), pause() {}, remove() {} }), body: { appendChild() {} } };
let level = 0;
const ctx = {
  createMediaStreamSource: () => ({ connect() {}, disconnect() {} }),
  createAnalyser: () => ({ fftSize: 512, smoothingTimeConstant: 0, getByteTimeDomainData(b) { for (let i = 0; i < b.length; i++) b[i] = 128 + Math.round((i % 2 ? 1 : -1) * level * 100); }, disconnect() {} }),
};
const track = { enabled: true };
const stream = { getAudioTracks: () => [track], getTracks: () => [track] };

const { RealtimeTransport } = require('./out/realtime.js');

function make() {
  const ev = { calls: [], push(n, ...a) { this.calls.push([n, ...a]); } };
  const events = {
    onSpeechStart: () => ev.push('start'), onSpeechStop: () => ev.push('stop'), onPartial: (t) => ev.push('partial', t),
    onFinal: (t, m) => ev.push('final', t, m), onSpeaking: (on, k, t) => ev.push('speaking', on, k, t),
    onUsage: (u, k) => ev.push('usage', u, k), onFatal: (m) => ev.push('fatal', m), onWarning: (m) => ev.push('warn', m),
  };
  let minted = 0;
  const t = new RealtimeTransport({ ctx, stream, mint: async () => { minted++; return { client_secret: 'ek_1', model: 'gpt-realtime-x', voice: 'marin', say_prefix: 'PREFIX', max_session_s: 3600 }; } }, events);
  return { t, ev, minted: () => minted };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

test('connects with the minted secret and only speaks the lines it is given', async () => {
  const { t, ev, minted } = make();
  await t.start();
  assert.equal(minted(), 1);
  assert.match(fetched[0].url, /realtime\/calls\?model=gpt-realtime-x/);
  assert.equal(fetched[0].init.headers.Authorization, 'Bearer ek_1');
  const dc = lastPC.dc;
  t.say('Tell me about yourself.');
  t.say('Second line.');
  assert.equal(dc.sent.length, 1, 'one response at a time');
  assert.equal(dc.sent[0].type, 'response.create');
  assert.match(dc.sent[0].response.instructions, /^PREFIX\n\nTell me about yourself\.$/);
  assert.deepStrictEqual(dc.sent[0].response.input, [], 'spoken from the instructions alone, not the whole call');
  dc.emit('message', { type: 'response.created' });
  assert.deepStrictEqual(ev.calls.find((c) => c[0] === 'speaking'), ['speaking', true, 'line', 'Tell me about yourself.']);
  assert.ok(t.busy);
  dc.emit('message', { type: 'output_audio_buffer.started' });
  dc.emit('message', { type: 'response.done', response: { usage: { total_tokens: 5 } } });
  assert.equal(dc.sent.length, 2, 'next line sent when the first is generated');
  assert.ok(ev.calls.some((c) => c[0] === 'usage' && c[2] === 'line'));
  dc.emit('message', { type: 'response.created' });
  dc.emit('message', { type: 'response.done', response: {} });
  dc.emit('message', { type: 'output_audio_buffer.stopped' });
  const ends = ev.calls.filter((c) => c[0] === 'speaking' && c[1] === false);
  assert.equal(ends.length, 1, 'one "finished speaking" when the queue drains');
  assert.equal(t.busy, false);
  t.stop();
});

test('candidate speech, partials and final transcript are relayed; mic follows listening/mute', async () => {
  const { t, ev } = make();
  await t.start();
  const dc = lastPC.dc;
  dc.emit('message', { type: 'input_audio_buffer.speech_started' });
  assert.ok(t.userSpeaking);
  dc.emit('message', { type: 'conversation.item.input_audio_transcription.delta', item_id: 'i1', delta: 'I led ' });
  dc.emit('message', { type: 'conversation.item.input_audio_transcription.delta', item_id: 'i1', delta: 'the team' });
  dc.emit('message', { type: 'input_audio_buffer.speech_stopped' });
  dc.emit('message', { type: 'conversation.item.input_audio_transcription.completed', item_id: 'i1', transcript: ' I led the team. ' });
  assert.deepStrictEqual(ev.calls.filter((c) => c[0] === 'partial').map((c) => c[1]), ['I led ', 'I led the team']);
  const fin = ev.calls.find((c) => c[0] === 'final');
  assert.equal(fin[1], 'I led the team.');
  assert.ok(typeof fin[2].durationMs === 'number');
  assert.deepStrictEqual(ev.calls.filter((c) => c[0] === 'start' || c[0] === 'stop').map((c) => c[0]), ['start', 'stop']);
  t.setListening(false); assert.equal(track.enabled, false);
  t.setListening(true); assert.equal(track.enabled, true);
  t.setMuted(true); assert.equal(track.enabled, false);
  dc.emit('message', { type: 'input_audio_buffer.speech_started' });
  assert.equal(ev.calls.filter((c) => c[0] === 'start').length, 1, 'muted: speech is not a turn');
  t.setMuted(false);
  dc.emit('message', { type: 'conversation.item.input_audio_transcription.failed', item_id: 'i2' });
  assert.equal(ev.calls.filter((c) => c[0] === 'final').pop()[1], '');
  t.stop();
});

test('interrupt cancels the reply and clears queued audio', async () => {
  const { t, ev } = make();
  await t.start();
  const dc = lastPC.dc;
  t.say('A long question?'); t.say('queued');
  dc.emit('message', { type: 'response.created' });
  t.interrupt();
  const types = dc.sent.map((s) => s.type);
  assert.deepStrictEqual(types.slice(-2), ['response.cancel', 'output_audio_buffer.clear']);
  assert.equal(t.busy, false);
  assert.ok(ev.calls.some((c) => c[0] === 'speaking' && c[1] === false));
  dc.emit('message', { type: 'error', error: { code: 'response_cancel_not_active', message: 'x' } });
  assert.ok(!ev.calls.some((c) => c[0] === 'warn'), 'benign cancel race is not reported');
  t.stop();
});

test('without output_audio_buffer events, playback end is detected from silence', async () => {
  const { t, ev } = make();
  await t.start();
  const dc = lastPC.dc;
  t.say('Hello there.');
  dc.emit('message', { type: 'response.created' });
  dc.emit('message', { type: 'response.done', response: {} });
  assert.equal(ev.calls.filter((c) => c[0] === 'speaking' && c[1] === false).length, 0);
  await wait(1000);
  assert.equal(ev.calls.filter((c) => c[0] === 'speaking' && c[1] === false).length, 1);
  t.stop();
});

test('a line that raced another response is re-sent, not lost', async () => {
  const { t } = make();
  await t.start();
  const dc = lastPC.dc;
  t.say('Line A.');
  dc.emit('message', { type: 'error', error: { code: 'conversation_already_has_active_response', message: 'busy' } });
  dc.emit('message', { type: 'response.done', response: {} });
  const creates = dc.sent.filter((s) => s.type === 'response.create');
  assert.equal(creates.length, 2);
  assert.match(creates[1].response.instructions, /Line A\./);
  t.stop();
});

test('a lasting disconnect is fatal; connection failure is fatal at once', async () => {
  const { t, ev } = make();
  await t.start();
  const pc = lastPC;
  pc.connectionState = 'failed';
  pc.l.connectionstatechange.forEach((f) => f());
  assert.ok(ev.calls.some((c) => c[0] === 'fatal'));
  t.stop();
});
