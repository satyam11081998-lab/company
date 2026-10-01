/**
 * Mock OpenAI Realtime far end for the browser E2E (qa/e2e-voice/run.cjs).
 *
 * A REAL WebRTC peer (werift) that the unmodified browser client connects to, plus a
 * control API the test uses to script the candidate's side. It implements only the
 * event contract the client uses (verified against developers.openai.com on
 * 2026-09-29): client_secrets, the /v1/realtime/calls SDP exchange, and the data
 * channel events speech_started/stopped, input_audio_buffer.committed,
 * conversation.item.input_audio_transcription.completed, response.created,
 * output_audio_buffer.started/stopped/cleared, response.output_audio_transcript.delta,
 * response.done. It is NOT a model: it never speaks unless the client sends
 * response.create, which is exactly the property under test.
 *
 * Usage: node mock-realtime-server.cjs <port> <static-dir>
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { RTCPeerConnection } = require('werift');

const PORT = Number(process.argv[2] || 8766);
const STATIC = process.argv[3] || __dirname;

const state = {
  events: [],            // client -> server events, in order (with receive timestamps)
  sent: [],              // server -> client events
  dc: null,
  pc: null,
  itemSeq: 0,
  activeResponse: null,  // { id, timer, cancelled }
  responseDelayMs: 150,
  audioMs: 900,
  // The mock sends no interviewer audio, so the client's drain detector (quiet for ~600 ms after
  // response.done) ends "speaking" early. A real provider keeps audio flowing; doneDelayMs lets a
  // test hold response.done back for long lines so timing on a busy CI box cannot end it early.
  doneDelayMs: 0,
  connected: false,
};

function emit(obj) {
  const evt = { event_id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...obj };
  state.sent.push({ at: Date.now(), ...evt });
  if (state.dc && state.dc.readyState === 'open') state.dc.send(JSON.stringify(evt));
}

function lineFrom(instructions) {
  const m = /SAY:\s*([\s\S]*)$/.exec(instructions || '');
  return (m ? m[1] : '').trim();
}

function onClientEvent(raw) {
  let evt;
  try { evt = JSON.parse(raw); } catch { return; }
  state.events.push({ at: Date.now(), ...evt });
  if (evt.type === 'response.create') {
    if (state.activeResponse) {
      emit({ type: 'error', error: { type: 'invalid_request_error', code: 'conversation_already_has_active_response', message: 'active response' } });
      return;
    }
    const id = `resp_${state.events.length}`;
    const line = lineFrom(evt.response && evt.response.instructions);
    const r = { id, cancelled: false, timers: [] };
    state.activeResponse = r;
    const meta = (evt.response && evt.response.metadata) || {};
    r.timers.push(setTimeout(() => {
      emit({ type: 'response.created', response: { id, status: 'in_progress', metadata: meta } });
      emit({ type: 'output_audio_buffer.started', response_id: id });
      const words = line.split(' ');
      words.forEach((w, i) => r.timers.push(setTimeout(() => {
        if (!r.cancelled) emit({ type: 'response.output_audio_transcript.delta', response_id: id, delta: (i ? ' ' : '') + w });
      }, 20 * i)));
      r.timers.push(setTimeout(() => {
        if (r.cancelled) return;
        emit({ type: 'response.done', response: { id, status: 'completed', metadata: meta,
          output: [{ type: 'message', content: [{ type: 'output_audio', transcript: line }] }],
          usage: { input_token_details: { audio_tokens: 0 }, output_token_details: { audio_tokens: 40 } } } });
        r.timers.push(setTimeout(() => {
          if (!r.cancelled) emit({ type: 'output_audio_buffer.stopped', response_id: id });
          if (state.activeResponse === r) state.activeResponse = null;
        }, state.audioMs));
      }, Math.max(20 * words.length + 30, state.doneDelayMs || 0)));
    }, state.responseDelayMs));
  } else if (evt.type === 'response.cancel' || evt.type === 'output_audio_buffer.clear') {
    const r = state.activeResponse;
    if (!r) {
      if (evt.type === 'response.cancel') emit({ type: 'error', error: { code: 'response_cancel_not_active', message: 'no active response' } });
      return;
    }
    if (!r.cancelled) {
      r.cancelled = true;
      r.timers.forEach(clearTimeout);
      emit({ type: 'response.done', response: { id: r.id, status: 'cancelled', status_details: { reason: 'client_cancelled' }, output: [] } });
      emit({ type: 'output_audio_buffer.cleared', response_id: r.id });
      state.activeResponse = null;
    }
  }
}

async function answer(offerSdp) {
  if (state.pc) { try { await state.pc.close(); } catch { /* ignore */ } }
  const pc = new RTCPeerConnection({});
  state.pc = pc;
  pc.onDataChannel.subscribe((dc) => {
    state.dc = dc;
    dc.stateChanged.subscribe((s) => { if (s === 'open') { state.connected = true; emit({ type: 'session.created', session: { id: 'sess_mock_1' } }); } });
    dc.onMessage.subscribe((m) => onClientEvent(typeof m === 'string' ? m : m.toString()));
    if (dc.readyState === 'open') { state.connected = true; emit({ type: 'session.created', session: { id: 'sess_mock_1' } }); }
  });
  pc.onTrack.subscribe((track) => { track.onReceiveRtp.subscribe(() => { state.rtp = (state.rtp || 0) + 1; }); });
  await pc.setRemoteDescription({ type: 'offer', sdp: offerSdp });
  await pc.setLocalDescription(await pc.createAnswer());
  return pc.localDescription.sdp;
}

// ---- candidate-side script -------------------------------------------------------
function candidateSays({ text, itemId, gapMs = 60, noStop = false }) {
  const id = itemId || `item_${++state.itemSeq}`;
  emit({ type: 'input_audio_buffer.speech_started', audio_start_ms: 0, item_id: id });
  if (noStop) return id;
  setTimeout(() => {
    emit({ type: 'input_audio_buffer.speech_stopped', audio_end_ms: 900, item_id: id });
    emit({ type: 'input_audio_buffer.committed', item_id: id });
    setTimeout(() => emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: id, content_index: 0, transcript: text }), gapMs);
  }, 80);
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
      return json(200, { value: 'ek_mock_secret', expires_at: Math.floor(Date.now() / 1000) + 600, session: body.session });
    }
    if (req.method === 'POST' && url.pathname === '/v1/realtime/calls') {
      const sdp = await answer(await readBody(req));
      res.writeHead(201, { 'Content-Type': 'application/sdp' });
      return res.end(sdp);
    }
    if (url.pathname === '/control/say') { const b = JSON.parse((await readBody(req)) || '{}'); return json(200, { itemId: candidateSays(b) }); }
    if (url.pathname === '/control/speech_start') { emit({ type: 'input_audio_buffer.speech_started', audio_start_ms: 0 }); return json(200, { ok: true }); }
    if (url.pathname === '/control/speech_stop') { emit({ type: 'input_audio_buffer.speech_stopped', audio_end_ms: 0 }); return json(200, { ok: true }); }
    if (url.pathname === '/control/raw') { const b = JSON.parse((await readBody(req)) || '{}'); emit(b); return json(200, { ok: true }); }
    if (url.pathname === '/control/config') { const b = JSON.parse((await readBody(req)) || '{}'); Object.assign(state, b); return json(200, { ok: true }); }
    if (url.pathname === '/control/state') {
      return json(200, { connected: state.connected, rtp: state.rtp || 0, events: state.events, sent: state.sent.map((e) => ({ at: e.at, type: e.type })), lastSessionConfig: state.lastSessionConfig || null });
    }
    if (url.pathname === '/control/reset') { state.events = []; state.sent = []; return json(200, { ok: true }); }
    const file = path.join(STATIC, url.pathname === '/' ? 'harness.html' : url.pathname.slice(1));
    if (file.startsWith(STATIC) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const type = file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      return res.end(fs.readFileSync(file));
    }
    json(404, { error: 'not found' });
  } catch (e) {
    json(500, { error: String(e && e.stack || e) });
  }
}).listen(PORT, '127.0.0.1', () => console.log(`[mock-realtime] listening on ${PORT}`));
