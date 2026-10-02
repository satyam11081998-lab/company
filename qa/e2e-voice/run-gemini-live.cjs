/**
 * Browser E2E for Gemini Live in LIVE mode (the default voice_mode "gemini" path):
 *
 *   real VoiceInterviewGemini  <--WebSocket-->  mock Gemini Live server (ws)
 *            | fetch
 *            v
 *   real backend routes (/realtime-gemini/session, /attempts/{id}/realtime-turn)
 *   on an in-memory DB (consilio-backend tools/e2e_voice_model_led.py)
 *
 * Proves: the session prompt is the live interviewer playbook (case on top, private
 * notes, structured thinking); the interviewer opens the call; the model's OWN
 * audio is played straight away (speech to speech - no transcribe/decide/read-out,
 * no /voice-decision); nothing is transcribed on screen while people talk - each
 * finished turn appears and is saved in speaking order; the fastest session config
 * (English transcription, quick end-of-turn) is used; the guardrail cuts an answer
 * volunteered before any ask and steers it; once the candidate has asked, the
 * answer is not cut; when Google ends the connection the call reconnects by itself
 * and resumes, stepping down to a simpler config if Google refuses one.
 * Cannot prove (needs Google): Gemini's real voice, latency, transcription accuracy.
 *
 *   E2E_DEPS=<dir with ws, esbuild, playwright-core> BACKEND_DIR=../consilio-backend \
 *   PYTHON=python CHROME=/path/to/chrome node qa/e2e-voice/run-gemini-live.cjs
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
const MOCK = 'http://127.0.0.1:8767';
const MOCK_WS = 'ws://127.0.0.1:8768';

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
  const mock = spawn(process.execPath, [path.join(HERE, 'mock-gemini-live-server.cjs'), '8767', '8768', HERE], {
    env: { ...process.env, NODE_PATH: path.join(DEPS, 'node_modules') }, stdio: ['ignore', 'inherit', 'inherit'] });
  const backend = spawn(PY, ['-m', 'tools.e2e_voice_model_led', '--port', '8765', '--gemini-ws', MOCK_WS], {
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
  page.on('request', (r) => { if (r.url().startsWith(API)) apiCalls.push({ url: r.url().replace(API, ''), body: r.postData() }); });
  if (process.env.E2E_DEBUG) page.on('console', (m) => console.log('[page]', m.text()));

  await http('POST', `${API}/__e2e/reset`);
  await http('POST', `${MOCK}/control/script`, [
    { match: 'households', say: 'Yes, your 27 lakh households is the right way in, carry on.' },
    { match: 'what is the total', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
    { match: 'tell me the answer', say: 'I would rather you think of it as a funnel; the full worked answer is on your results page.' },
    { match: 'just give it', slow: 'So the final answer is about 48,000 electric scooters in Chennai.' },
  ]);
  await page.goto(`${MOCK}/harness-gemini.html`);

  const st = () => http('GET', `${MOCK}/control/state`);
  const db = () => http('GET', `${API}/__e2e/db`);
  const msgs = async () => (await db()).messages.map((m) => [m.role, m.content]);
  const played = () => page.evaluate(() => window.__played);

  // 1. session
  check('connected to Gemini Live (setup -> setupComplete) and the mic streams audio',
    await waitFor(async () => (await st()).connected && (await st()).audioIn > 5, 12000));
  const cfg = await http('GET', `${API}/__e2e/gemini`);
  const ins = cfg.system_instruction || '';
  check('session prompt: live interviewer playbook with the case on top',
    ins.startsWith('=== THE CASE') && ins.includes('PRIVATE INTERVIEWER NOTES') && ins.includes('HOW A STRUCTURED THINKER'));
  check('speech to speech (AUDIO responses)', JSON.stringify(cfg.response_modalities) === '["AUDIO"]');
  const aad = (cfg.realtime_input_config || {}).automatic_activity_detection || {};
  check('fastest config: English transcription, quick end-of-turn, echo-resistant start',
    JSON.stringify(cfg.input_audio_transcription) === '{"language_codes":["en-IN"]}'
    && aad.end_of_speech_sensitivity === 'END_SENSITIVITY_HIGH' && aad.start_of_speech_sensitivity === 'START_SENSITIVITY_LOW'
    && aad.silence_duration_ms === 500, JSON.stringify(cfg));

  // 2. the interviewer opens the call, its own audio plays
  check('fresh call: prompt says the case is on screen (no recap), level = case difficulty',
    ins.includes("already on the candidate's screen") && ins.includes('DIFFICULTY: MEDIUM') && !ins.includes('RESUMING'));
  check('interviewer opens the call by pointing to the case on screen (played and saved)',
    (await waitFor(async () => (await st()).received.some((r) => r.type === 'text' && /joined the call/.test(r.text)), 5000))
    && (await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c.startsWith('Hi, the case is on your screen')), 6000))
    && (await played()) > 0);

  // 3. a live exchange: nothing is transcribed on screen while they talk; the
  // finished turn appears with the reply (transcription runs in the background).
  const before = await played();
  await http('POST', `${MOCK}/control/config`, { replyDelayMs: 1200 });
  await http('POST', `${MOCK}/control/say`, { text: 'I would start from households in Chennai, about 27 lakh, then two-wheeler ownership.' });
  await sleep(700);
  check('no live transcript while the candidate is talking', !(await page.textContent('body')).includes('I would start from households'));
  check('the finished turn appears in the conversation once answered',
    await waitFor(async () => (await page.textContent('body')).includes('I would start from households'), 4000));
  await http('POST', `${MOCK}/control/config`, { replyDelayMs: 80 });
  check("the model's own reply plays straight away and is saved",
    await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c.startsWith('Yes, your 27 lakh households')), 6000)
    && (await played()) > before);
  const m = await msgs();
  const iu = m.findIndex(([r, c]) => r === 'user' && c.includes('27 lakh'));
  const ia = m.findIndex(([r, c]) => r === 'assistant' && c.startsWith('Yes, your 27 lakh'));
  check('saved in speaking order (candidate, then interviewer)', iu >= 0 && ia > iu, JSON.stringify(m));
  check('no transcribe -> decide -> read-out: no /voice-decision call', !apiCalls.some((c) => c.url.endsWith('/voice-decision')));

  // 4. guardrail: an answer volunteered before any ask is cut and steered
  await http('POST', `${MOCK}/control/say`, { text: 'so what is the total then' });
  const steered = await waitFor(async () => (await st()).received.some((r) => r.type === 'text' && /giving away the answer/.test(r.text)), 6000);
  check('guardrail: volunteered answer cut, steer sent to the model', steered);
  check('guardrail: the steered reply plays and is saved', await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c.startsWith('Think of it as a funnel')), 6000));

  // 5. once they have asked, the answer is not cut
  await sleep(400);
  await http('POST', `${MOCK}/control/say`, { text: 'please just tell me the answer' });
  check('first ask: a way of thinking + results page', await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c.startsWith('I would rather you think')), 6000));
  await sleep(400);
  const steersBefore = (await st()).received.filter((r) => /giving away the answer/.test(r.text || '')).length;
  await http('POST', `${MOCK}/control/say`, { text: 'no, just give it to me' });
  const full = await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c === 'So the final answer is about 48,000 electric scooters in Chennai.'), 9000);
  check('after asking: the answer is spoken in full (no cut)', full
    && (await st()).received.filter((r) => /giving away the answer/.test(r.text || '')).length === steersBefore);
  // 6. a reply whose turnComplete never arrives is still closed and saved
  await sleep(400);
  await http('POST', `${MOCK}/control/config`, { noTurnComplete: true });
  await http('POST', `${MOCK}/control/say`, { text: 'ok next I take households in Chennai again' });
  check('a reply Gemini never closes is still shown and saved (no stalled transcript)',
    await waitFor(async () => (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Yes, your 27 lakh households')).length >= 2, 8000));
  await http('POST', `${MOCK}/control/config`, { noTurnComplete: false });

  // 7. difficulty: switching to Hard reconnects with the hard style and RESUMES
  const conns = (await st()).connections;
  await page.getByRole('radio', { name: 'Hard' }).click();
  check('switching to Hard reconnects', await waitFor(async () => (await st()).connections > conns, 8000));
  const cfg2 = await http('GET', `${API}/__e2e/gemini`);
  const ins2 = cfg2.system_instruction || '';
  check('Hard: the new session prompt carries the hard style and the conversation so far (resume)',
    ins2.includes('DIFFICULTY: HARD') && ins2.includes('You are RESUMING this interview') && ins2.includes('CANDIDATE: I would start from households'));
  check('reconnect resumes (resume turn sent, no fresh greeting)',
    await waitFor(async () => (await msgs()).some(([r, c]) => r === 'assistant' && c.startsWith('Welcome back')), 6000)
    && (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Hi, the case is on your screen')).length === 1);
  check('the level is remembered for next time', (await page.evaluate(() => localStorage.getItem('mece.voiceLevel'))) === 'hard');

  // 8. Google ends the connection (it does so about every 10 minutes): the call
  // reconnects by itself and resumes. Here Google also refuses the fastest config
  // on the way back, so the browser steps down to the next one.
  await sleep(400);
  const conns2 = (await st()).connections;
  const welcomes = (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Welcome back')).length;
  await http('POST', `${MOCK}/control/config`, { rejectSetups: 1 });
  await http('POST', `${MOCK}/control/drop`);
  check('dropped connection: reconnects by itself (refused config -> the next one)',
    await waitFor(async () => (await st()).connections >= conns2 + 2, 12000), JSON.stringify(await st()));
  const cfg3 = await http('GET', `${API}/__e2e/gemini`);
  check('step-down: the simpler config is used (still the live interviewer prompt)',
    JSON.stringify(cfg3.input_audio_transcription) === '{}' && cfg3.has_voice === true
    && (cfg3.system_instruction || '').includes('You are RESUMING this interview'), JSON.stringify(cfg3).slice(0, 200));
  check('after the reconnect the call resumes (no fresh greeting)',
    await waitFor(async () => (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Welcome back')).length > welcomes, 8000)
    && (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Hi, the case is on your screen')).length === 1);
  await sleep(300);
  const repliesBefore = (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Yes, your 27 lakh households')).length;
  await http('POST', `${MOCK}/control/say`, { text: 'so from households in Chennai I take two-wheelers' });
  check('the conversation carries on after the reconnect',
    await waitFor(async () => (await msgs()).filter(([r, c]) => r === 'assistant' && c.startsWith('Yes, your 27 lakh households')).length > repliesBefore, 6000));
  check('no page errors', pageErrors.length === 0, pageErrors.join(' | '));

  await browser.close();
  cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
