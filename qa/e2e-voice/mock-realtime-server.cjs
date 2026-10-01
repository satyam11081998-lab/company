/**
 * Mock OpenAI Realtime far end for the browser E2E (qa/e2e-voice/run-model-led.cjs).
 *
 * A REAL WebRTC peer (werift) that the unmodified browser client connects to, plus a
 * control API the test uses to script the candidate's side and the "model's" replies.
 * It implements only the event contract the client uses: client_secrets, the
 * /v1/realtime/calls SDP exchange, transcription.completed, response.created,
 * response.output_audio_transcript.delta/.done, response.output_item.done (function
 * calls), response.done, and response.cancel / output_audio_buffer.clear.
 *
 * Model-led sessions (turn_detection.create_response=true) answer each candidate turn
 * BY THEMSELVES from a script: { match, say } | { match, tool, args } | { match, slow }.
 * After a function_call_output + response.create it says "TOOL_SAID: <output>"; after
 * a system message + response.create it says "STEERED: <first words>".
 *
 * Usage: node mock-realtime-server.cjs <port> <static-dir>
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { RTCPeerConnection } = require('werift');

const PORT = Number(process.argv[2] || 8766);
const STATIC = process.argv[3] || __dirname;

const state = { events: [], dc: null, pc: null, itemSeq: 0, active: null, script: [], connected: false,
  lastSessionConfig: null, modelLed: false, callSeq: 0 };

function emit(obj) {
  const evt = { event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...obj };
  if (state.dc && state.dc.readyState === 'open') state.dc.send(JSON.stringify(evt));
}

/** Speak `text` as one response, word by word (`wordMs` apart). */
function speak(text, wordMs = 15) {
  if (state.active) return;
  const id = `resp_${Date.now()}`;
  const r = { id, cancelled: false, timers: [] };
  state.active = r;
  emit({ type: 'response.created', response: { id, status: 'in_progress' } });
  const words = text.split(' ');
  words.forEach((w, i) => r.timers.push(setTimeout(() => {
    if (!r.cancelled) emit({ type: 'response.output_audio_transcript.delta', response_id: id, delta: (i ? ' ' : '') + w });
  }, wordMs * (i + 1))));
  r.timers.push(setTimeout(() => {
    if (r.cancelled) return;
    emit({ type: 'response.output_audio_transcript.done', response_id: id, transcript: text });
    emit({ type: 'response.done', response: { id, status: 'completed',
      usage: { input_token_details: { audio_tokens: 10 }, output_token_details: { audio_tokens: 40 } } } });
    state.active = null;
  }, wordMs * (words.length + 2)));
}

function callTool(name, args) {
  const id = `resp_${Date.now()}`;
  const callId = `call_${++state.callSeq}`;
  emit({ type: 'response.created', response: { id, status: 'in_progress' } });
  emit({ type: 'response.output_item.done', response_id: id,
    item: { type: 'function_call', name, call_id: callId, arguments: args || '{}' } });
  emit({ type: 'response.done', response: { id, status: 'completed' } });
}

function onCandidateTurn(text) {
  if (!state.modelLed) return;
  const rule = state.script.find((s) => text.toLowerCase().includes(String(s.match).toLowerCase()));
  if (!rule) return;
  setTimeout(() => {
    if (rule.tool) callTool(rule.tool, rule.args);
    else if (rule.slow) speak(rule.slow, 120);
    else if (rule.say) speak(rule.say);
  }, 60);
}

function onClientEvent(raw) {
  let evt;
  try { evt = JSON.parse(raw); } catch { return; }
  state.events.push({ at: Date.now(), ...evt });
  if (evt.type === 'response.cancel' || evt.type === 'output_audio_buffer.clear') {
    const r = state.active;
    if (r && !r.cancelled) {
      r.cancelled = true;
      r.timers.forEach(clearTimeout);
      emit({ type: 'response.done', response: { id: r.id, status: 'cancelled' } });
      state.active = null;
    }
  } else if (evt.type === 'response.create' && !(evt.response && evt.response.instructions)) {
    // A bare response.create continues after a tool result or a system steer.
    const items = state.events.filter((e) => e.type === 'conversation.item.create');
    const last = items[items.length - 1];
    if (!last && state.events.filter((e) => e.type === 'response.create').length === 1) {
      // The very first response.create with nothing in the conversation: the
      // interviewer opening the call.
      setTimeout(() => speak('GREETING: Hi, let us size electric scooters in Chennai. How would you like to start?'), 30);
    } else if (last && last.item && last.item.type === 'function_call_output') {
      setTimeout(() => speak(`TOOL_SAID: ${String(last.item.output).slice(0, 80)}`), 30);
    } else if (last && last.item && last.item.role === 'system') {
      setTimeout(() => speak('STEERED: think of it as a funnel, the full answer is on your results page.'), 30);
    }
  }
}

async function answer(offerSdp) {
  if (state.pc) { try { await state.pc.close(); } catch { /* ignore */ } }
  const pc = new RTCPeerConnection({});
  state.pc = pc;
  pc.onDataChannel.subscribe((dc) => {
    state.dc = dc;
    dc.stateChanged.subscribe((s) => { if (s === 'open') state.connected = true; });
    dc.onMessage.subscribe((m) => onClientEvent(typeof m === 'string' ? m : m.toString()));
    if (dc.readyState === 'open') state.connected = true;
  });
  await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
  await pc.setLocalDescription(await pc.createAnswer());
  return pc.localDescription.sdp;
}

function candidateSays(text) {
  const id = `item_${++state.itemSeq}`;
  emit({ type: 'input_audio_buffer.speech_started', item_id: id });
  // Live transcript deltas while they speak (streaming transcription models).
  const words = text.split(' ');
  const half = Math.ceil(words.length / 2);
  setTimeout(() => emit({ type: 'conversation.item.input_audio_transcription.delta', item_id: id, delta: words.slice(0, half).join(' ') + ' ' }), 20);
  setTimeout(() => {
    emit({ type: 'input_audio_buffer.speech_stopped', item_id: id });
    if (state.holdTranscriptMs) {
      // The model answers from audio; the final transcript can land later.
      onCandidateTurn(text);
      setTimeout(() => emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: id, content_index: 0, transcript: text }), state.holdTranscriptMs);
      return;
    }
    emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: id, content_index: 0, transcript: text });
    onCandidateTurn(text);
  }, state.deltaHoldMs || 60);
  return id;
}

function readBody(req) {
  return new Promise((resolve) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => resolve(b)); });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const json = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); res.end(JSON.stringify(obj)); };
  try {
    if (req.method === 'POST' && url.pathname === '/v1/realtime/client_secrets') {
      const body = JSON.parse((await readBody(req)) || '{}');
      state.lastSessionConfig = body;
      state.modelLed = !!(body.session && body.session.audio && body.session.audio.input
        && body.session.audio.input.turn_detection && body.session.audio.input.turn_detection.create_response);
      return json(200, { value: 'ek_mock_secret', expires_at: Math.floor(Date.now() / 1000) + 600 });
    }
    if (req.method === 'POST' && url.pathname === '/v1/realtime/calls') {
      const sdp = await answer(await readBody(req));
      res.writeHead(201, { 'Content-Type': 'application/sdp' });
      return res.end(sdp);
    }
    if (url.pathname === '/control/say') { const b = JSON.parse((await readBody(req)) || '{}'); return json(200, { itemId: candidateSays(b.text) }); }
    if (url.pathname === '/control/config') { Object.assign(state, JSON.parse((await readBody(req)) || '{}')); return json(200, { ok: true }); }
    if (url.pathname === '/control/script') { state.script = JSON.parse((await readBody(req)) || '[]'); return json(200, { ok: true }); }
    if (url.pathname === '/control/state') {
      return json(200, { connected: state.connected, modelLed: state.modelLed, events: state.events, lastSessionConfig: state.lastSessionConfig });
    }
    const file = path.join(STATIC, url.pathname === '/' ? 'harness.html' : url.pathname.slice(1));
    if (file.startsWith(STATIC) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html' : 'text/javascript' });
      return res.end(fs.readFileSync(file));
    }
    json(404, { error: 'not found' });
  } catch (e) {
    json(500, { error: String((e && e.stack) || e) });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`[mock-realtime] listening on ${PORT}`));
