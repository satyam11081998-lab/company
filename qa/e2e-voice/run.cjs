/**
 * Browser E2E for realtime voice (headless Chromium, fake microphone, real WebRTC).
 *
 *   real VoiceInterviewRealtime component  <--WebRTC + data channel-->  mock realtime peer (werift)
 *                 |  fetch                                                 ^ scripted candidate
 *                 v                                                        | (control API)
 *   real FastAPI routes (/realtime/session, /attempts/*) with the unified brain ON,
 *   in-memory DB and a scripted interviewer model (tools/e2e_voice_backend.py)
 *
 * What this proves: mic permission + a real WebRTC session in a real browser, the
 * client's data-channel handling, one decision per transcription item, no spoken
 * response before the application decides (and none for NO_OUTPUT), out-of-band
 * response.create, barge-in (response.cancel + output_audio_buffer.clear), held
 * lines not spoken over the candidate, duplicate/replayed items ignored, echo of the
 * interviewer's own line ignored, idempotent persistence, telemetry emission.
 *
 * What it cannot prove (needs the real provider): model audio quality, real latency,
 * real transcription accuracy, real acoustic echo. See MECE_INTERVIEWER_REALTIME_REPORT.md.
 *
 * Usage (from the frontend repo root):
 *   E2E_DEPS=<dir with werift, esbuild, playwright-core> BACKEND_DIR=../consilio-backend \
 *   PYTHON=python CHROME=/path/to/chrome node qa/e2e-voice/run.cjs
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEPS = process.env.E2E_DEPS || process.cwd();
const req = (m) => require(require.resolve(m, { paths: [DEPS] }));
const { chromium } = req('playwright-core');

const HERE = __dirname;
const BACKEND = path.resolve(process.env.BACKEND_DIR || path.join(HERE, '..', '..', '..', 'consilio-backend'));
const PY = process.env.PYTHON || 'python3';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const API = 'http://127.0.0.1:8765';
const MOCK = 'http://127.0.0.1:8766';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function http(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}
async function waitFor(fn, ms = 8000, step = 50) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const v = await fn();
    if (v) return v;
    await sleep(step);
  }
  return null;
}

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || !detail ? '' : `   [${detail}]`}`);
}

(async () => {
  // build the harness bundle
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(HERE, 'build-harness.cjs'), API], { env: { ...process.env, ESBUILD_DIR: DEPS }, stdio: 'inherit' });
    p.on('exit', (c) => (c === 0 ? resolve() : reject(new Error('harness build failed'))));
  });
  const mock = spawn(process.execPath, [path.join(HERE, 'mock-realtime-server.cjs'), '8766', HERE], {
    env: { ...process.env, NODE_PATH: path.join(DEPS, 'node_modules') }, stdio: ['ignore', 'inherit', 'inherit'] });
  const backend = spawn(PY, ['-m', 'tools.e2e_voice_backend', '--port', '8765', '--mock', MOCK], {
    cwd: BACKEND, env: { ...process.env, INTERVIEWER_TELEMETRY: 'off' }, stdio: ['ignore', 'inherit', 'inherit'] });
  const cleanup = () => { try { mock.kill(); } catch {} try { backend.kill(); } catch {} };
  process.on('exit', cleanup);

  const up = await waitFor(async () => {
    try { await http('GET', `${API}/__e2e/db`); await http('GET', `${MOCK}/control/state`); return true; } catch { return false; }
  }, 30000, 250);
  if (!up) { console.error('servers did not start'); cleanup(); process.exit(2); }

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
           '--disable-features=WebRtcHideLocalIpsWithMdns', '--autoplay-policy=no-user-gesture-required'],
  });
  const context = await browser.newContext();
  await context.grantPermissions(['microphone'], { origin: MOCK });
  const page = await context.newPage();
  const apiCalls = [];
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  if (process.env.E2E_DEBUG) {
    page.on('console', (m) => console.log('[page]', m.type(), m.text()));
    page.on('pageerror', (e) => console.log('[pageerror]', e.message));
    page.on('requestfailed', (r) => console.log('[reqfail]', r.url(), r.failure() && r.failure().errorText));
    page.on('response', (r) => console.log('[resp]', r.status(), r.url().slice(0, 90)));
  }
  page.on('request', (r) => { if (r.url().startsWith(API)) apiCalls.push({ at: Date.now(), method: r.method(), url: r.url().replace(API, ''), body: r.postData() }); });
  // Instrument the data channel inside the page: when did the client RECEIVE each server
  // event and SEND each client event (performance clock). Lets us split client-side
  // reaction time from transport time.
  await page.addInitScript(() => {
    window.__dc = [];
    const orig = RTCPeerConnection.prototype.createDataChannel;
    RTCPeerConnection.prototype.createDataChannel = function (...args) {
      const ch = orig.apply(this, args);
      ch.addEventListener('message', (e) => { try { window.__dc.push({ dir: 'in', type: JSON.parse(e.data).type, t: performance.now() }); } catch {} });
      const send = ch.send.bind(ch);
      ch.send = (d) => { try { window.__dc.push({ dir: 'out', type: JSON.parse(d).type, t: performance.now() }); } catch {} return send(d); };
      return ch;
    };
  });
  // The client posts its SDP to api.openai.com; route it to the mock peer instead.
  await page.route('https://api.openai.com/v1/realtime/calls*', async (route) => {
    const res = await fetch(`${MOCK}/v1/realtime/calls`, { method: 'POST', body: route.request().postData(), headers: { 'Content-Type': 'application/sdp' } });
    await route.fulfill({ status: res.status, headers: { 'Content-Type': 'application/sdp', 'Access-Control-Allow-Origin': '*' }, body: await res.text() });
  });

  await http('POST', `${API}/__e2e/reset`);
  await page.goto(`${MOCK}/harness.html`);

  // 1. microphone + WebRTC session
  const connected = await waitFor(async () => (await http('GET', `${MOCK}/control/state`)).connected, 15000);
  check('browser: mic permission + real WebRTC session + data channel open', connected);
  const listening = await waitFor(async () => (await page.textContent('body')).includes('Listening'), 8000);
  check('browser: UI reaches Listening', listening);
  const st0 = await http('GET', `${MOCK}/control/state`);
  const td = st0.lastSessionConfig?.session?.audio?.input?.turn_detection || {};
  check('session: create_response=false, interrupt_response=true (app controls every response)',
    td.create_response === false && td.interrupt_response === true, JSON.stringify(td));
  const rtpOk = await waitFor(async () => (await http('GET', `${MOCK}/control/state`)).rtp > 10, 6000);
  check('browser: fake-microphone audio flows to the far end (RTP packets received)', rtpOk);

  const creates = async () => (await http('GET', `${MOCK}/control/state`)).events.filter((e) => e.type === 'response.create');
  const decisions = () => apiCalls.filter((c) => c.url.endsWith('/voice-decision'));

  // 2. NO_OUTPUT: thinking aloud -> a decision, no response.create, no assistant row
  await http('POST', `${MOCK}/control/say`, { text: 'let me think', itemId: 'item_think' });
  await waitFor(() => decisions().length >= 1, 5000);
  await sleep(700);
  check('NO_OUTPUT: exactly one decision request for the item', decisions().length === 1, String(decisions().length));
  check('NO_OUTPUT: the voice model is never asked to speak', (await creates()).length === 0);
  let db = await http('GET', `${API}/__e2e/db`);
  check('NO_OUTPUT: candidate row saved with idempotency key, no assistant row',
    db.messages.some((m) => m.role === 'user' && m.client_turn_id === 'u:item_think') && !db.messages.some((m) => m.role === 'assistant'),
    JSON.stringify(db.messages.map((m) => [m.role, m.client_turn_id])));

  // 3. help -> hint spoken out-of-band, only after the decision
  await http('POST', `${MOCK}/control/say`, { text: 'Can you give me a hint?', itemId: 'item_help' });
  const c1 = await waitFor(async () => { const c = await creates(); return c.length >= 1 ? c : null; }, 6000);
  check('help: exactly one response.create for the hint', c1 && c1.length === 1, JSON.stringify(c1 && c1.length));
  const resp = c1 && c1[0].response;
  check('help: out-of-band response (conversation none, empty input, audio only)',
    resp && resp.conversation === 'none' && Array.isArray(resp.input) && resp.input.length === 0 && JSON.stringify(resp.output_modalities) === '["audio"]',
    JSON.stringify(resp));
  const helpDecision = decisions().find((d) => (d.body || '').includes('item_help'));
  check('help: response.create sent only after the decision request', helpDecision && c1 && c1[0].at >= helpDecision.at);
  check('help: the spoken line is a hint, not a refusal',
    resp && /SAY: /.test(resp.instructions) && !/exercise|next step\?|no hints/i.test(resp.instructions), resp && resp.instructions.slice(-120));
  await waitFor(async () => (await http('GET', `${API}/__e2e/db`)).messages.some((m) => m.role === 'assistant'), 6000);
  db = await http('GET', `${API}/__e2e/db`);
  check('help: interviewer line persisted once with key a:item_help',
    db.messages.filter((m) => m.role === 'assistant' && m.client_turn_id === 'a:item_help').length === 1,
    JSON.stringify(db.messages.map((m) => [m.role, m.client_turn_id])));

  // 4. replayed / duplicate transcription event -> ignored
  const before = decisions().length;
  await http('POST', `${MOCK}/control/raw`, { type: 'conversation.item.input_audio_transcription.completed', item_id: 'item_help', transcript: 'Can you give me a hint?' });
  await sleep(800);
  check('duplicate item: no second decision, no second response', decisions().length === before && (await creates()).length === 1);

  // 5. echo of the interviewer's own line -> not a candidate turn
  const line = resp ? resp.instructions.replace(/^[\s\S]*SAY:\s*/, '') : 'x';
  await http('POST', `${MOCK}/control/raw`, { type: 'conversation.item.input_audio_transcription.completed', item_id: 'item_echo', transcript: line });
  await sleep(800);
  check("echo: the interviewer's own words never reach the brain", decisions().length === before);

  // 6. barge-in: candidate talks over a line -> response.cancel + output_audio_buffer.clear
  await http('POST', `${MOCK}/control/config`, { audioMs: 4000 });
  await http('POST', `${MOCK}/control/say`, { text: 'What population should I use?', itemId: 'item_pop' });
  await waitFor(async () => (await creates()).length >= 2, 6000);
  await sleep(250);
  const t0 = Date.now();
  await http('POST', `${MOCK}/control/speech_start`);
  const cancelled = await waitFor(async () => {
    const ev = (await http('GET', `${MOCK}/control/state`)).events.filter((e) => e.at >= t0);
    return ev.some((e) => e.type === 'response.cancel') && ev.some((e) => e.type === 'output_audio_buffer.clear') ? ev : null;
  }, 3000, 10);
  check('barge-in: client sends response.cancel + output_audio_buffer.clear', !!cancelled);
  if (cancelled) {
    const first = cancelled.find((e) => e.type === 'response.cancel');
    const stNow = await http('GET', `${MOCK}/control/state`);
    const emitted = stNow.sent.filter((e) => e.type === 'input_audio_buffer.speech_started' && e.at >= t0)[0];
    const rt = emitted ? first.at - emitted.at : first.at - t0;
    check(`barge-in: speech_started -> response.cancel round trip ${rt} ms (loopback data channel incl. mock SCTP stack; excludes audio devices and the provider)`, rt < 500, String(rt));
    const dc = await page.evaluate(() => window.__dc);
    const inAt = [...dc].reverse().find((e) => e.dir === 'in' && e.type === 'input_audio_buffer.speech_started');
    const outAt = inAt && dc.find((e) => e.dir === 'out' && e.type === 'response.cancel' && e.t >= inAt.t);
    const clientMs = inAt && outAt ? Math.round((outAt.t - inAt.t) * 10) / 10 : null;
    check(`barge-in: client-side reaction (event received -> cancel sent) ${clientMs} ms`, clientMs !== null && clientMs < 50, String(clientMs));
  }
  await http('POST', `${MOCK}/control/speech_stop`);
  await http('POST', `${MOCK}/control/config`, { audioMs: 900 });
  await sleep(1500);

  // 7. decision lands while the candidate is talking again -> held, then dropped for the newer turn
  await http('POST', `${API}/__e2e/llm`, { mode: 'good', delay_ms: 1200 });
  const createsBefore = (await creates()).length;
  await http('POST', `${MOCK}/control/say`, { text: 'Can you help me?', itemId: 'item_slow' });
  await sleep(300);
  await http('POST', `${MOCK}/control/speech_start`);            // candidate carries on before the reply lands
  await sleep(1500);
  check('held line: nothing spoken over a candidate who is talking', (await creates()).length === createsBefore);
  await http('POST', `${API}/__e2e/llm`, { mode: 'good', delay_ms: 0 });
  await http('POST', `${MOCK}/control/say`, { text: 'Actually I will start from households, 31 crore.', itemId: 'item_new' });
  await sleep(2500);
  const afterCreates = await creates();
  check('held line: the stale line is dropped for the newer turn (never replayed late)',
    afterCreates.length === createsBefore, `${createsBefore} -> ${afterCreates.length}`);

  // 8. telemetry: client timing reports reach the backend, with no content
  const tel = await http('GET', `${API}/__e2e/telemetry`);
  const reports = tel.timing || [];
  check('telemetry: per-turn timing reports received (T1/T2 relative to speech end)',
    reports.some((r) => typeof r.t1_ms === 'number' && typeof r.t2_ms === 'number'), JSON.stringify(reports.slice(0, 2)));
  check('telemetry: interruption latency reported', reports.some((r) => typeof r.interruption_ms === 'number'));
  check('telemetry: no transcript text in any telemetry record',
    !JSON.stringify(tel).match(/give me a hint|population should I use|let me think/i));

  // 8b. repeated barge-in (N = BARGE_N, default 30) for percentiles. Loopback + mock SCTP:
  //     the client reaction is meaningful, the round trip is a property of this harness.
  const BARGE_N = Number(process.env.BARGE_N || 30);
  const clientMsAll = [];
  const roundTripAll = [];
  await http('POST', `${MOCK}/control/config`, { audioMs: 4000 });
  const askTexts = ['Can you give me a hint?', 'What time period?', 'Are we talking new cars only?', 'I am stuck.'];
  for (let i = 0; i < BARGE_N; i++) {
    const n0 = (await creates()).length;
    await http('POST', `${MOCK}/control/say`, { text: askTexts[i % askTexts.length], itemId: `item_b${i}` });
    const spoke = await waitFor(async () => (await creates()).length > n0, 6000);
    if (!spoke) continue;
    await sleep(250);
    const tb = Date.now();
    await http('POST', `${MOCK}/control/speech_start`);
    const ev = await waitFor(async () => {
      const e = (await http('GET', `${MOCK}/control/state`)).events.filter((x) => x.at >= tb);
      return e.some((x) => x.type === 'response.cancel') ? e : null;
    }, 3000, 10);
    if (ev) {
      const st = await http('GET', `${MOCK}/control/state`);
      const emitted = st.sent.filter((x) => x.type === 'input_audio_buffer.speech_started' && x.at >= tb)[0];
      const cancel = ev.find((x) => x.type === 'response.cancel');
      if (emitted) roundTripAll.push(cancel.at - emitted.at);
      const dc = await page.evaluate(() => window.__dc);
      const inAt = [...dc].reverse().find((x) => x.dir === 'in' && x.type === 'input_audio_buffer.speech_started');
      const outAt = inAt && dc.find((x) => x.dir === 'out' && x.type === 'response.cancel' && x.t >= inAt.t);
      if (inAt && outAt) clientMsAll.push(outAt.t - inAt.t);
    }
    await http('POST', `${MOCK}/control/speech_stop`);
    await sleep(900);
  }
  const pct = (xs, p) => { const s = [...xs].sort((a, b) => a - b); return s.length ? Math.round(s[Math.min(s.length - 1, Math.max(0, Math.round(p / 100 * (s.length - 1))))] * 10) / 10 : null; };
  const bargeStats = {
    n: clientMsAll.length,
    client_reaction_ms: { p50: pct(clientMsAll, 50), p90: pct(clientMsAll, 90), p95: pct(clientMsAll, 95) },
    loopback_round_trip_ms: { p50: pct(roundTripAll, 50), p90: pct(roundTripAll, 90), p95: pct(roundTripAll, 95) },
  };
  check(`barge-in x${BARGE_N}: every line cancelled; client reaction P95 ${bargeStats.client_reaction_ms.p95} ms`,
    clientMsAll.length === BARGE_N && bargeStats.client_reaction_ms.p95 < 50, JSON.stringify(bargeStats));
  await http('POST', `${MOCK}/control/config`, { audioMs: 900 });

  // 9. no page errors
  const errs = (await page.evaluate(() => (window).__errors || [])).concat(pageErrors);
  check('browser: no uncaught page errors', errs.length === 0, JSON.stringify(errs));

  const out = { when: new Date().toISOString(), chrome: await browser.version(), results, bargeStats,
                decisions: decisions().length, responseCreates: (await creates()).length };
  fs.writeFileSync(path.join(HERE, 'last-run.json'), JSON.stringify(out, null, 1));
  await browser.close();
  cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(3); });
