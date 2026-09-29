/**
 * gpt-live-transcribe event handling (the documented realtime-transcription event schema),
 * plus the text-channel SSE contract of postMessageStream (explicit silence event).
 *   node --require ./qa/ts-register.cjs --test qa/voice/*.test.cjs
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const { LiveTranscriptAssembler } = require('@/lib/voice/live-transcribe');

test('partials drive the draft only; the completed event is the turn boundary', () => {
  const a = new LiveTranscriptAssembler();
  assert.deepEqual(a.onEvent({ type: 'conversation.item.input_audio_transcription.delta', item_id: 'i1', delta: 'I think ' }),
    { type: 'delta', itemId: 'i1', text: 'I think ' });
  a.onEvent({ type: 'conversation.item.input_audio_transcription.delta', item_id: 'i1', delta: '1.4 billion' });
  assert.equal(a.latestPartial(), 'I think 1.4 billion');
  const ticket = a.openCommit();
  assert.equal(a.finalFor(ticket), null);
  a.onEvent({ type: 'input_audio_buffer.committed', item_id: 'i1' });
  assert.equal(a.finalFor(ticket), null);                     // committed but not transcribed yet
  a.onEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'i1', transcript: 'I think 1.4 billion.' });
  assert.equal(a.finalFor(ticket), 'I think 1.4 billion.');
});

test('out-of-order completions are reconciled by item_id', () => {
  const a = new LiveTranscriptAssembler();
  const t1 = a.openCommit();
  a.onEvent({ type: 'input_audio_buffer.committed', item_id: 'i1' });
  const t2 = a.openCommit();
  a.onEvent({ type: 'input_audio_buffer.committed', item_id: 'i2' });
  a.onEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'i2', transcript: 'second' });
  assert.equal(a.finalFor(t1), null);
  assert.equal(a.finalFor(t2), 'second');
  a.onEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'i1', transcript: 'first' });
  assert.equal(a.finalFor(t1), 'first');
});

test('duplicate completion and late deltas are ignored', () => {
  const a = new LiveTranscriptAssembler();
  a.onEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'i1', transcript: 'done' });
  assert.equal(a.onEvent({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'i1', transcript: 'done' }), null);
  assert.equal(a.onEvent({ type: 'conversation.item.input_audio_transcription.delta', item_id: 'i1', delta: 'x' }), null);
});

test('an empty commit resolves to an empty turn (no speech), and a failed item resolves empty', () => {
  const a = new LiveTranscriptAssembler();
  const t = a.openCommit();
  a.onEvent({ type: 'error', error: { code: 'input_audio_buffer_commit_empty', message: 'buffer too small' } });
  assert.equal(a.finalFor(t), '');
  const t2 = a.openCommit();
  a.onEvent({ type: 'input_audio_buffer.committed', item_id: 'i9' });
  a.onEvent({ type: 'conversation.item.input_audio_transcription.failed', item_id: 'i9' });
  assert.equal(a.finalFor(t2), '');
});

// ------------------------------------------------------------------ text channel SSE contract
function sseResponse(chunks) {
  const enc = new TextEncoder();
  let i = 0;
  return {
    ok: true,
    headers: { get: () => 'text/event-stream' },
    body: { getReader: () => ({ read: async () => (i < chunks.length ? { value: enc.encode(chunks[i++]), done: false } : { value: undefined, done: true }) }) },
  };
}

test('NO_OUTPUT on the text channel: explicit silence, no text, message_id null', async () => {
  const api = require('@/lib/interview-api');
  const calls = { silence: 0, tokens: [], done: null };
  global.fetch = async () => sseResponse([
    'event: meta\ndata: {"clarification_remaining": 20, "is_clarification": false, "clarifications_spent": false}\n\n',
    'event: silence\ndata: {}\n\n',
    'event: done\ndata: {"message_id": null, "silent": true}\n\n',
  ]);
  const r = await api.postMessageStream('a1', 't', { content: '50%', kind: 'text', channel: 'text', turn_id: 'x' }, {
    onSilence: () => { calls.silence += 1; },
    onToken: (t) => calls.tokens.push(t),
    onDone: (d) => { calls.done = d; },
  });
  assert.equal(r.silent, true);
  assert.equal(r.assistantText, '');
  assert.equal(calls.silence, 1);
  assert.deepEqual(calls.tokens, []);
  assert.equal(calls.done.message_id, null);
});

test('an interviewer reply streams tokens and is not silent', async () => {
  const api = require('@/lib/interview-api');
  global.fetch = async () => sseResponse([
    'event: meta\ndata: {"clarification_remaining": 20}\n\n',
    'event: token\ndata: Yes, go ahead.\n\n',
    'event: done\ndata: {"message_id": "m9"}\n\n',
  ]);
  const r = await api.postMessageStream('a1', 't', { content: 'Shall I proceed?', kind: 'text' });
  assert.equal(r.silent, false);
  assert.equal(r.assistantText, 'Yes, go ahead.');
});

test('newTurnId is unique', () => {
  const { newTurnId } = require('@/lib/interview-api');
  const ids = new Set(Array.from({ length: 1000 }, () => newTurnId()));
  assert.equal(ids.size, 1000);
});
