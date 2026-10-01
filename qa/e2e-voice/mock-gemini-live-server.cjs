/**
 * Mock Gemini Live (BidiGenerateContent) server for the browser E2E
 * (qa/e2e-voice/run-gemini-live.cjs). Implements only what the client uses:
 * setup -> setupComplete; realtimeInput.audio (counted); realtimeInput.text
 * (the opening turn / a steer) -> a scripted model reply; serverContent with
 * modelTurn audio, outputTranscription, inputTranscription, interrupted, turnComplete.
 * Control API (HTTP): /control/say {text}, /control/script [...], /control/state.
 *
 * Usage: node mock-gemini-live-server.cjs <httpPort> <wsPort> <static-dir>
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const HTTP_PORT = Number(process.argv[2] || 8767);
const WS_PORT = Number(process.argv[3] || 8768);
const STATIC = process.argv[4] || __dirname;
const state = { sock: null, received: [], audioIn: 0, script: [], replying: null, noTurnComplete: false, connections: 0 };
const PCM = Buffer.alloc(2400 * 2).toString('base64');  // 50 ms of 24 kHz silence

function send(obj) { if (state.sock && state.sock.readyState === 1) state.sock.send(JSON.stringify(obj)); }

function reply(text, wordMs = 15) {
  if (state.replying) { state.replying.cancelled = true; state.replying.timers.forEach(clearTimeout); }
  const r = { cancelled: false, timers: [] };
  state.replying = r;
  const words = text.split(' ');
  words.forEach((w, i) => r.timers.push(setTimeout(() => {
    if (r.cancelled) return;
    send({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: PCM } }] },
      outputTranscription: { text: (i ? ' ' : '') + w } } });
  }, wordMs * (i + 1))));
  r.timers.push(setTimeout(() => {
    if (r.cancelled) return;
    if (!state.noTurnComplete) send({ serverContent: { turnComplete: true } });  // a lost turnComplete when set
    state.replying = null;
  }, wordMs * (words.length + 2)));
}

function onClient(msg) {
  if (msg.setup) { state.received.push({ at: Date.now(), type: 'setup' }); send({ setupComplete: {} }); return; }
  if (msg.realtimeInput && msg.realtimeInput.audio) { state.audioIn += 1; return; }
  if (msg.realtimeInput && typeof msg.realtimeInput.text === 'string') {
    const t = msg.realtimeInput.text;
    state.received.push({ at: Date.now(), type: 'text', text: t });
    if (/joined the call/i.test(t)) reply('Hi, the case is on your screen. Take a moment to read it and tell me your approach.');
    else if (/back on the call/i.test(t)) reply('Welcome back, you were on your 27 lakh households, carry on.');
    else reply('Think of it as a funnel from households to scooters; the full worked answer is on your results page.');
  }
}

function candidateSays(text) {
  const words = text.split(' ');
  words.forEach((w, i) => setTimeout(() => send({ serverContent: { inputTranscription: { text: (i ? ' ' : '') + w } } }), 10 * i));
  setTimeout(() => {
    const rule = state.script.find((s) => text.toLowerCase().includes(String(s.match).toLowerCase()));
    if (rule) reply(rule.say || rule.slow, rule.slow ? 120 : 15);
  }, 10 * words.length + 80);
}

const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', (sock) => {
  state.sock = sock;
  state.connections += 1;
  sock.on('message', (data) => { try { onClient(JSON.parse(data.toString())); } catch { /* ignore */ } });
});

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${HTTP_PORT}`);
  const json = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
  const body = () => new Promise((r) => { let b = ''; req.on('data', (c) => { b += c; }); req.on('end', () => r(b)); });
  if (url.pathname === '/control/say') { candidateSays(JSON.parse((await body()) || '{}').text); return json(200, { ok: true }); }
  if (url.pathname === '/control/script') { state.script = JSON.parse((await body()) || '[]'); return json(200, { ok: true }); }
  if (url.pathname === '/control/config') { Object.assign(state, JSON.parse((await body()) || '{}')); return json(200, { ok: true }); }
  if (url.pathname === '/control/state') return json(200, { connected: !!state.sock, audioIn: state.audioIn, received: state.received, connections: state.connections });
  const file = path.join(STATIC, url.pathname === '/' ? 'harness-gemini.html' : url.pathname.slice(1));
  if (file.startsWith(STATIC) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': file.endsWith('.html') ? 'text/html' : 'text/javascript' });
    return res.end(fs.readFileSync(file));
  }
  json(404, { error: 'not found' });
}).listen(HTTP_PORT, '127.0.0.1', () => console.log(`[mock-gemini] http ${HTTP_PORT}, ws ${WS_PORT}`));
