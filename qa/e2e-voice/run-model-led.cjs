/**
 * Browser E2E for the MODEL-LED realtime voice interviewer (headless Chromium, fake
 * microphone, real WebRTC).
 *
 *   real VoiceInterviewRealtime  <--WebRTC + data channel-->  mock realtime peer (werift)
 *            | fetch                                            (answers by itself, calls tools)
 *            v
 *   real backend routes (/realtime/session, /realtime-turn, /voice-coach, /voice-tool)
 *   on an in-memory DB with a scripted hint model (consilio-backend tools/e2e_voice_model_led.py)
 *
 * Proves: the session is prompt-led (the model answers by itself, eagerness medium,
 * no tools, case on top of the prompt with private notes and the playbook); the
 * interviewer opens the call; the candidate sees a live transcript while speaking;
 * nothing runs in the reply path (no /voice-decision, /voice-coach or /voice-tool);
 * turns are saved; the guardrail cuts an answer volunteered before any ask; the
 * answer rule (framework first, the answer once they insist) is not cut even when
 * the candidate's transcript lands after the model has started speaking.
 * Cannot prove (needs the real provider): how well the real model converses, latency,
 * transcription accuracy.
 *
 *   E2E_DEPS=<dir with werift, esbuild, playwright-core> BACKEND_DIR=../consilio-backend \
 *   PYTHON=python CHROME=/path/to/chrome node qa/e2e-voice/run-model-led.cjs
 */
const { spawn } = require('child_process');
const path = require('path');

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
async function waitFor(fn, ms = 8000, step = 60) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(step); }
  return null;
}
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || !detail ? '' : `   [${String(detail).slice(0, 300)}]`}`);
}

(async () => {
  await new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [path.join(HERE, 'build-harness.cjs'), API], { env: { ...process.env, ESBUILD_DIR: DEPS }, stdio: 'inherit' });
    p.on('exit', (c) => (c === 0 ? resolve() : reject(new Error('harness build failed'))));
  });
  const mock = spawn(process.execPath, [path.join(HERE, 'mock-realtime-server.cjs'), '8766', HERE], {
    env: { ...process.env, NODE_PATH: path.join(DEPS, 'node_modules') }, stdio: ['ignore', 'inherit', 'inherit'] });
  const backend = spawn(PY, ['-m', 'tools.e2e_voice_model_led', '--port', '8765', '--mock', MOCK], {
    cwd: BACKEND, env: { ...process.env }, stdio: ['ignore', 'inherit', 'inherit'] });
  const cleanup = () => { try { mock.kill(); } catch {} try { backend.kill(); } catch {} };
  process.on('exit', cleanup);
  const up = await waitFor(async () => {
    try { await http('GET', `${API}/__e2e/db`); await http('GET', `${MOCK}/control/state`); return true; } catch { return false; }
  }, 30000, 250);
  if (!up) { console.error('servers did not start'); cleanup(); process.exit(2); }

  const browser = await chromium.launch({ executablePath: CHROME, headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext();
  await context.grantPermissions(['microphone'], { origin: MOCK });
  const page = await context.newPage();
  const apiCalls = [];
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('request', (r) => { if (r.url().startsWith(API)) apiCalls.push({ at: Date.now(), url: r.url().replace(API, ''), body: r.postData() }); });
  if (process.env.E2E_DEBUG) page.on('console', (m) => console.log('[page]', m.text()));
  await page.route('https://api.openai.com/v1/realtime/calls*', async (route) => {
    const res = await fetch(`${MOCK}/v1/realtime/calls`, { method: 'POST', body: route.request().postData(), headers: { 'Content-Type': 'application/sdp' } });
    await route.fulfill({ status: res.status, headers: { 'Content-Type': 'application/sdp', 'Access-Control-Allow-Origin': '*' }, body: await res.text() });
  });

  await http('POST', `${API}/__e2e/reset`);
  await http('POST', `${MOCK}/control/script`, [
    { match: 'households', say: 'Yes, starting from your 27 lakh households is the right way in, carry on.' },
    { match: 'what is the total', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
    { match: 'tell me the answer', say: 'I would rather you think of it as a funnel, households to scooters; the full worked answer is on your results page.' },
    { match: 'just give it', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
  ]);
  await page.goto(`${MOCK}/harness.html`);

  const state = () => http('GET', `${MOCK}/control/state`);
  const clientEvents = async (type) => (await state()).events.filter((e) => e.type === type);
  const db = () => http('GET', `${API}/__e2e/db`);
  const said = (prefix) => db().then((d) => d.messages.some((m) => m.role === 'assistant' && m.content.startsWith(prefix)));

  // 1. session: prompt-led, nothing in the reply path
  check('browser: real WebRTC session + data channel open', await waitFor(async () => (await state()).connected, 15000));
  check('browser: UI reaches Listening or Speaking', await waitFor(async () => /Listening|Interviewer speaking/.test(await page.textContent('body')), 8000));
  const cfg = (await state()).lastSessionConfig?.session || {};
  const td = cfg.audio?.input?.turn_detection || {};
  const ins = cfg.instructions || '';
  check('session: the model answers by itself, barge-in kept, eagerness medium',
    td.create_response === true && td.interrupt_response === true && td.eagerness === 'medium', JSON.stringify(td));
  check('session: no tools (no round trip in a reply)', !cfg.tools);
  check('session: case on top, then private notes, then the playbook',
    ins.startsWith('=== THE CASE') && ins.indexOf('PRIVATE INTERVIEWER NOTES') > 0 && ins.indexOf('HOW A STRUCTURED THINKER') > ins.indexOf('PRIVATE INTERVIEWER NOTES'));

  // 2. the interviewer opens the call by itself
  check('interviewer opens the call (response.create on connect, greeting spoken and saved)',
    (await waitFor(() => said('GREETING:'), 6000)) && (await clientEvents('response.create')).length >= 1);

  // 3. a turn: live transcript while speaking, model reply, nothing else in the path
  await http('POST', `${MOCK}/control/config`, { deltaHoldMs: 700 });
  await http('POST', `${MOCK}/control/say`, { text: 'I would start from households in Chennai, about 27 lakh, then two-wheeler ownership.' });
  check('live transcript: the candidate sees their words while speaking',
    await waitFor(async () => (await page.textContent('body')).includes('I would start from households'), 1500));
  await http('POST', `${MOCK}/control/config`, { deltaHoldMs: 60 });
  check('model reply (in their words) spoken by the model itself and saved',
    await waitFor(() => said('Yes, starting from your 27 lakh households'), 6000));
  check('no per-turn /voice-decision', !apiCalls.some((c) => c.url.endsWith('/voice-decision')));
  check('no per-turn /voice-coach or /voice-tool (coach and tools off)',
    !apiCalls.some((c) => c.url.endsWith('/voice-coach') || c.url.endsWith('/voice-tool')));
  check('candidate turn saved via /realtime-turn', (await db()).messages.some((m) => m.role === 'user' && m.content.includes('27 lakh')));

  // 4. guardrail: the model volunteers the answer before any ask -> cut + steer
  await http('POST', `${MOCK}/control/say`, { text: 'so what is the total then' });
  const cut = await waitFor(async () => (await clientEvents('response.cancel')).length > 0, 6000);
  const ev = (await state()).events.map((e) => e.type);
  const i = ev.indexOf('response.cancel');
  check('guardrail: a volunteered answer is cut mid-speech and steered',
    cut && ev.slice(i, i + 4).join(',') === 'response.cancel,output_audio_buffer.clear,conversation.item.create,response.create',
    ev.slice(i, i + 4).join(','));
  check('guardrail: the steered reply follows', await waitFor(() => said('STEERED:'), 6000));

  // 5. answer rule: the first ask gets the framework (from the prompt)...
  await sleep(500);
  await http('POST', `${MOCK}/control/say`, { text: 'please just tell me the answer' });
  check('first ask: the model offers a way of thinking + results page', await waitFor(() => said('I would rather you think of it as a funnel'), 6000));
  // ...and when they insist, the answer is spoken in full - even if the model starts
  // before the candidate's transcript lands (the guardrail must not cut it).
  await sleep(500);
  const cancelsBefore = (await clientEvents('response.cancel')).length;
  await http('POST', `${MOCK}/control/config`, { holdTranscriptMs: 900 });
  await http('POST', `${MOCK}/control/say`, { text: 'no, just give it to me' });
  const full = await waitFor(async () => (await db()).messages.filter((m) => m.content.startsWith('So the final answer is about 48,000')).length >= 1, 9000);
  check('insisting: the answer is spoken in full (no cut), even with a late transcript',
    full && (await clientEvents('response.cancel')).length === cancelsBefore);
  await http('POST', `${MOCK}/control/config`, { holdTranscriptMs: 0 });
  // 6. difficulty: switching to Hard reconnects with the hard style and resumes
  await page.getByRole('radio', { name: 'Hard' }).click();
  const hardCfg = await waitFor(async () => {
    const c = (await state()).lastSessionConfig?.session?.instructions || '';
    return c.includes('DIFFICULTY: HARD') ? c : null;
  }, 8000);
  check('Hard: reconnects with the hard style and RESUMES the conversation',
    hardCfg && hardCfg.includes('You are RESUMING this interview') && hardCfg.includes('CANDIDATE: I would start from households'));
  check('Hard: the call is live again', await waitFor(async () => (await state()).connected, 8000));
  check('no page errors', pageErrors.length === 0, pageErrors.join(' | '));

  await browser.close();
  cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
