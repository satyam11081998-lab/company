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
 * Proves: the session lets the model answer by itself and offers the tools; no
 * per-turn /voice-decision; turns saved; the coach refreshes instructions with
 * session.update; tool calls go to /voice-tool and come back as function_call_output +
 * response.create; the answer rule (framework first, answer on insisting); the live
 * guardrail cuts a reply that starts stating the answer, and stops cutting once the
 * answer is allowed.
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
    { match: 'households', say: 'Yes, starting from households is the right way in, carry on.' },
    { match: 'stuck', tool: 'get_hint', args: '{"reason":"asked_for_help","where_stuck":"what comes after households"}' },
    { match: 'what is the total', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
    { match: 'tell me the answer', tool: 'answer_request', args: '{}' },
    { match: 'just give it', tool: 'answer_request', args: '{}' },
    { match: 'repeat the total', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
  ]);
  await page.goto(`${MOCK}/harness.html`);

  const state = () => http('GET', `${MOCK}/control/state`);
  const clientEvents = async (type) => (await state()).events.filter((e) => e.type === type);
  const db = () => http('GET', `${API}/__e2e/db`);

  // 1. session
  check('browser: real WebRTC session + data channel open', await waitFor(async () => (await state()).connected, 15000));
  check('browser: UI reaches Listening', await waitFor(async () => (await page.textContent('body')).includes('Listening'), 8000));
  const cfg = (await state()).lastSessionConfig?.session || {};
  const td = cfg.audio?.input?.turn_detection || {};
  check('session: the model answers by itself (create_response on), barge-in kept',
    td.create_response === true && td.interrupt_response === true, JSON.stringify(td));
  check('session: hint + answer tools offered', JSON.stringify((cfg.tools || []).map((t) => t.name)) === '["get_hint","answer_request"]');
  check('session: case in the instructions, solution not', (cfg.instructions || '').includes('electric scooters currently operating in Chennai')
    && !(cfg.instructions || '').includes('48,000'));

  // 2. a substantive turn: the model replies itself; turn saved; coach consulted
  await http('POST', `${MOCK}/control/say`, { text: 'I would start from households in Chennai, about 27 lakh, then two-wheeler ownership.' });
  const saidOk = await waitFor(async () => (await db()).messages.some((m) => m.role === 'assistant' && m.content.startsWith('Yes, starting from households')), 6000);
  check('model reply spoken by the model itself and saved as the interviewer turn', saidOk);
  check('no per-turn /voice-decision round trip in model-led mode', !apiCalls.some((c) => c.url.endsWith('/voice-decision')));
  check('candidate turn saved via /realtime-turn', (await db()).messages.some((m) => m.role === 'user' && m.content.includes('27 lakh')));
  check('server coach consulted after the saved turn', await waitFor(async () => apiCalls.some((c) => c.url.endsWith('/voice-coach')), 4000));

  // 3. stuck -> get_hint tool -> /voice-tool -> function_call_output + response.create
  await http('POST', `${MOCK}/control/say`, { text: "I'm stuck, I don't know what comes next" });
  const out = await waitFor(async () => (await clientEvents('conversation.item.create')).find((e) => e.item?.type === 'function_call_output'), 8000);
  check('tool call relayed to /voice-tool', apiCalls.some((c) => c.url.endsWith('/voice-tool') && (c.body || '').includes('get_hint')));
  check('hint returned to the model as function_call_output', out && String(out.item.output).includes('Look at households before scooters'), out && out.item.output);
  check('model continues speaking after the tool result',
    await waitFor(async () => (await db()).messages.some((m) => m.role === 'assistant' && m.content.startsWith('TOOL_SAID: Hint to give')), 6000));
  const updates = await waitFor(async () => {
    const u = await clientEvents('session.update');
    return u.find((e) => {
      const ins = e.session?.instructions || '';
      const notes = ins.split('LIVE COACH NOTES')[1] || '';
      return notes.includes('get_hint') && ins.includes('electric scooters currently operating in Chennai');
    }) || null;
  }, 6000);
  check('coach notes pushed into the live session (session.update)', updates);
  check('hint level saved on the attempt', ((await db()).session_state?.voice || {}).hint_level === 1);

  // 4. live guardrail: the model starts stating the answer before it is allowed -> cut + steer
  await http('POST', `${MOCK}/control/say`, { text: 'so what is the total then' });
  const cut = await waitFor(async () => (await clientEvents('response.cancel')).length > 0, 6000);
  const ev = (await state()).events.map((e) => e.type);
  const i = ev.indexOf('response.cancel');
  check('guardrail: answer-leak reply cut mid-speech (response.cancel + output_audio_buffer.clear)',
    cut && ev[i + 1] === 'output_audio_buffer.clear', ev.slice(i, i + 4).join(','));
  check('guardrail: model steered with a system note, then continues',
    ev.slice(i, i + 4).join(',') === 'response.cancel,output_audio_buffer.clear,conversation.item.create,response.create');
  check('guardrail: the steered reply follows', await waitFor(async () => (await db()).messages.some((m) => m.content.startsWith('STEERED:')), 6000));

  // 5. answer rule: first ask -> framework, no answer; asking again -> answer + caveat
  await http('POST', `${MOCK}/control/say`, { text: 'please just tell me the answer' });
  const first = await waitFor(async () => {
    const o = (await clientEvents('conversation.item.create')).filter((e) => e.item?.type === 'function_call_output');
    return o.length >= 2 ? o[1] : null;
  }, 8000);
  check('first answer request: a way of thinking + results page, no answer',
    first && first.item.output.includes('results page') && first.item.output.includes('funnel') && !first.item.output.includes('48,000'), first && first.item.output);
  await sleep(800);
  await http('POST', `${MOCK}/control/say`, { text: 'no, just give it to me' });
  const second = await waitFor(async () => {
    const o = (await clientEvents('conversation.item.create')).filter((e) => e.item?.type === 'function_call_output');
    return o.length >= 3 ? o[2] : null;
  }, 8000);
  check('insisting: the worked answer with the honest results caveat',
    second && second.item.output.includes('48,000') && second.item.output.includes('results will show'), second && second.item.output);
  check('answer recorded on the attempt', ((await db()).session_state?.voice || {}).answer_revealed === true);

  // 6. once the answer is allowed, the guardrail no longer cuts it
  await sleep(800);
  const cancelsBefore = (await clientEvents('response.cancel')).length;
  await http('POST', `${MOCK}/control/say`, { text: 'can you repeat the total' });
  const spoke = await waitFor(async () => (await db()).messages.filter((m) => m.content.startsWith('So the final answer is about 48,000')).length >= 1, 8000);
  check('after the answer is allowed, it is spoken in full (no cut)', spoke && (await clientEvents('response.cancel')).length === cancelsBefore);
  check('no page errors', pageErrors.length === 0, pageErrors.join(' | '));

  await browser.close();
  cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
