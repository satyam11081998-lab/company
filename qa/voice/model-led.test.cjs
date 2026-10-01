/**
 * Model-led realtime voice: unit tests with no browser and no network.
 *   node --test qa/voice/model-led.test.cjs
 * TypeScript sources are transpiled on the fly with the repo's own `typescript`.
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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  });
  mod._compile(out.outputText, filename);
};

const ml = require(path.join(ROOT, 'lib/voice/model-led.ts'));

test('guardrail: a stated final answer with a number trips before the answer is allowed', () => {
  assert.equal(ml.answerLeakTripwire('Okay. So the final answer is about 48,000 scooters.', false), true);
  assert.equal(ml.answerLeakTripwire('Your estimate would be 48 thousand', false), true);
  assert.equal(ml.answerLeakTripwire("Here's the full solution: start from households", false), true);
});

test('guardrail: hints with numbers, and answers once allowed, do not trip', () => {
  assert.equal(ml.answerLeakTripwire('Start from about 1.1 crore people and narrow it to households.', false), false);
  assert.equal(ml.answerLeakTripwire('Yes, splitting by urban and rural is the right way in.', false), false);
  assert.equal(ml.answerLeakTripwire('What do you think the answer is?', false), false);
  assert.equal(ml.answerLeakTripwire('So the final answer is about 48,000.', true), false);
});

test('tool calls are read from response.output_item.done only when complete', () => {
  const evt = { type: 'response.output_item.done', item: { type: 'function_call', name: 'get_hint', call_id: 'c1', arguments: '{"reason":"stuck"}' } };
  assert.deepEqual(ml.toolCallFromEvent(evt), { name: 'get_hint', callId: 'c1', arguments: '{"reason":"stuck"}' });
  assert.equal(ml.toolCallFromEvent({ type: 'response.output_item.done', item: { type: 'message' } }), null);
  assert.equal(ml.toolCallFromEvent({ type: 'response.created' }), null);
});

// ---- realtime-session.ts against a fake WebRTC stack -------------------------
function fakeBrowser(interviewer) {
  const sent = [];
  const listeners = {};
  const dc = {
    readyState: 'open',
    send: (s) => sent.push(JSON.parse(s)),
    close() {},
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  };
  global.RTCPeerConnection = class {
    addTrack() {} createDataChannel() { return dc; } addEventListener() {}
    async createOffer() { return { sdp: 'offer' }; } async setLocalDescription() {} async setRemoteDescription() {} close() {}
  };
  Object.defineProperty(global, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => ({ getAudioTracks: () => [], getTracks: () => [] }) } } });
  global.document = { createElement: () => ({ style: {}, setAttribute() {}, play: async () => {}, pause() {}, remove() {} }), body: { appendChild() {} } };
  global.fetch = async (url) => {
    if (String(url).includes('/realtime/session')) {
      return { ok: true, json: async () => ({ client_secret: 'ek', model: 'gpt-realtime-2.1', ...(interviewer ? { interviewer } : {}) }) };
    }
    return { ok: true, text: async () => 'answer' };
  };
  const emit = (evt) => (listeners.message || []).forEach((fn) => fn({ data: JSON.stringify(evt) }));
  return { sent, emit };
}

test('session: renderer stays the default when the backend does not say otherwise', async () => {
  fakeBrowser(undefined);
  const { startRealtimeSession } = require(path.join(ROOT, 'lib/voice/realtime-session.ts'));
  let who = null;
  const h = await startRealtimeSession({ caseId: 'c', attemptId: 'a', token: 't' }, { onInterviewer: (w) => { who = w; } });
  assert.equal(h.interviewer, 'renderer');
  assert.equal(who, 'renderer');
});

test('session: model-led tool call -> result + continue; instructions update; guardrail cut', async () => {
  const { sent, emit } = fakeBrowser('model_led');
  const { startRealtimeSession } = require(path.join(ROOT, 'lib/voice/realtime-session.ts'));
  const calls = [];
  const h = await startRealtimeSession({ caseId: 'c', attemptId: 'a', token: 't' }, { onToolCall: (c) => calls.push(c) });
  assert.equal(h.interviewer, 'model_led');
  emit({ type: 'response.output_item.done', item: { type: 'function_call', name: 'answer_request', call_id: 'x9', arguments: '{}' } });
  assert.deepEqual(calls, [{ name: 'answer_request', callId: 'x9', arguments: '{}' }]);
  h.sendToolResult('x9', 'Offer a framework.');
  assert.deepEqual(sent.slice(-2), [
    { type: 'conversation.item.create', item: { type: 'function_call_output', call_id: 'x9', output: 'Offer a framework.' } },
    { type: 'response.create' },
  ]);
  h.updateInstructions('NEW INSTRUCTIONS');
  assert.deepEqual(sent.at(-1), { type: 'session.update', session: { type: 'realtime', instructions: 'NEW INSTRUCTIONS' } });
  h.cancelAndSteer(ml.ANSWER_LEAK_STEER);
  assert.deepEqual(sent.slice(-4).map((e) => e.type), ['response.cancel', 'output_audio_buffer.clear', 'conversation.item.create', 'response.create']);
  assert.equal(sent.at(-2).item.role, 'system');
});

test('voice protocol label: never spoken from the instructions, never shown or saved', () => {
  const v = require(path.join(ROOT, 'lib/voice/v11-voice.ts'));
  const ins = v.openaiSayInstructions("That's a sensible start.");
  assert.equal(ins.includes('SAY:'), false);
  assert.ok(ins.endsWith("That's a sensible start."));
  assert.equal(v.stripSayLabel("SAY: That's an interesting perspective."), "That's an interesting perspective.");
  assert.equal(v.stripSayLabel('say:   The data confirms that.'), 'The data confirms that.');
  assert.equal(v.stripSayLabel('SAY: SAY: Go ahead.'), 'Go ahead.');
  assert.equal(v.stripSayLabel('Say, what about costs?'), 'Say, what about costs?');
  assert.equal(v.stripSayLabel('Saying that, carry on.'), 'Saying that, carry on.');
});
