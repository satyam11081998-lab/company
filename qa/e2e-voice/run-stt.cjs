/**
 * Browser E2E for STT talk mode (pipeline): headless Chromium with a fake microphone that
 * plays a generated speech-like WAV. Exercises the REAL VoiceInterview component: VAD
 * endpointing on real audio frames, MediaRecorder, /transcribe, the unified brain via
 * /messages channel=stt, sentence-level TTS via /speak, playback, and mic reopening.
 *
 * Transcription is scripted (the backend fake returns a queued text per /transcribe call),
 * so this proves the pipeline and the silence semantics, not recognition accuracy.
 *
 *   E2E_DEPS=<dir> BACKEND_DIR=../consilio-backend PYTHON=python CHROME=<chrome> node qa/e2e-voice/run-stt.cjs
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
const STATIC = 'http://127.0.0.1:8766';
const WAV = process.env.SPEECH_WAV || path.join(DEPS, 'speech.wav');
const SCRIPT = ['let me think', 'Shall I proceed?', 'Can you give me a hint?', '50%'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function http(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}
async function waitFor(fn, ms, step = 200) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = await fn(); if (v) return v; await sleep(step); }
  return null;
}
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok || !detail ? '' : `   [${detail}]`}`);
};

(async () => {
  if (!fs.existsSync(WAV)) {
    await new Promise((res) => spawn(process.execPath, [path.join(HERE, 'make-speech-wav.cjs'), WAV, '6'], { stdio: 'inherit' }).on('exit', res));
  }
  await new Promise((resolve, reject) => spawn(process.execPath, [path.join(HERE, 'build-harness.cjs'), API],
    { env: { ...process.env, ESBUILD_DIR: DEPS }, stdio: 'inherit' }).on('exit', (c) => (c === 0 ? resolve() : reject(new Error('build')))));
  const stat = spawn(process.execPath, [path.join(HERE, 'mock-realtime-server.cjs'), '8766', HERE], {
    env: { ...process.env, NODE_PATH: path.join(DEPS, 'node_modules') }, stdio: ['ignore', 'inherit', 'inherit'] });
  const backend = spawn(PY, ['-m', 'tools.e2e_voice_backend', '--port', '8765', '--mock', STATIC], {
    cwd: BACKEND, env: { ...process.env, INTERVIEWER_TELEMETRY: 'off' }, stdio: ['ignore', 'inherit', 'inherit'] });
  const cleanup = () => { try { stat.kill(); } catch {} try { backend.kill(); } catch {} };
  process.on('exit', cleanup);
  await waitFor(async () => { try { await http('GET', `${API}/__e2e/stt`); return true; } catch { return false; } }, 30000, 250);
  await http('POST', `${API}/__e2e/reset`);
  await http('POST', `${API}/__e2e/stt-script`, { texts: SCRIPT });

  const browser = await chromium.launch({
    executablePath: CHROME, headless: true,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${WAV}`,
           '--autoplay-policy=no-user-gesture-required'],
  });
  const context = await browser.newContext();
  await context.grantPermissions(['microphone'], { origin: STATIC });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  if (process.env.E2E_DEBUG) page.on('console', (m) => console.log('[page]', m.text()));
  await page.goto(`${STATIC}/stt.html`);

  const listening = await waitFor(async () => (await page.textContent('body')).includes('Listening'), 15000);
  check('stt: mic opens, VAD calibrates, UI reaches Listening', listening);

  const done = await waitFor(async () => (await page.evaluate(() => window.__sends.length)) >= SCRIPT.length ? true : null, 120000, 500);
  const sends = await page.evaluate(() => window.__sends);
  check(`stt: VAD endpointed ${sends.length} spoken turns from the fake mic (real audio frames)`, !!done, JSON.stringify(sends));
  const stt = await http('GET', `${API}/__e2e/stt`);
  check('stt: every turn went through /transcribe with a real recorded blob', stt.transcribe_calls >= SCRIPT.length && stt.sizes.every((n) => n > 1000), JSON.stringify(stt.sizes));
  const byText = Object.fromEntries(sends.map((s) => [s.text, s]));
  check('stt NO_OUTPUT: "let me think" -> explicit silence, no reply text', byText['let me think'] && byText['let me think'].silent && !byText['let me think'].reply);
  check('stt NO_OUTPUT: "50%" -> explicit silence', byText['50%'] && byText['50%'].silent);
  check('stt presence: "Shall I proceed?" -> "Yes, go ahead."', byText['Shall I proceed?'] && byText['Shall I proceed?'].reply.trim() === 'Yes, go ahead.');
  check('stt help: hint streamed, not a refusal', byText['Can you give me a hint?'] && byText['Can you give me a hint?'].reply && !/exercise|next step\?/i.test(byText['Can you give me a hint?'].reply));
  const spoken = stt.speak_texts;
  check('stt: TTS requested only for real interviewer lines (never for silence, never empty)',
    spoken.length >= 2 && spoken.every((t) => t && t.trim()) && spoken.includes('Yes, go ahead.') &&
    !spoken.some((t) => /listening/i.test(t)), JSON.stringify(spoken));
  const db = await http('GET', `${API}/__e2e/db`);
  const asst = db.messages.filter((m) => m.role === 'assistant');
  check('stt persistence: 4 candidate rows, 2 interviewer rows, no empty rows',
    db.messages.filter((m) => m.role === 'user').length === 4 && asst.length === 2 && asst.every((m) => (m.content || '').trim()),
    JSON.stringify(db.messages.map((m) => [m.role, (m.content || '').slice(0, 30)])));
  const back = await waitFor(async () => (await page.textContent('body')).includes('Listening'), 10000);
  check('stt: mic reopens after the last turn', back);
  const tel = await http('GET', `${API}/__e2e/telemetry`);
  const sttT = (tel.timing || []).filter((r) => r.channel === 'stt');
  check('stt telemetry: per-turn T1 (speech end -> final transcript) reported', sttT.some((r) => typeof r.t1_ms === 'number'), JSON.stringify(sttT.slice(0, 3)));
  check('stt telemetry: first-audio T4 reported for spoken turns, SILENCE lane for silent turns',
    sttT.some((r) => typeof r.t4_ms === 'number') && sttT.some((r) => r.lane === 'SILENCE'));
  check('browser: no uncaught page errors', pageErrors.length === 0, JSON.stringify(pageErrors));

  fs.writeFileSync(path.join(HERE, 'last-run-stt.json'), JSON.stringify({ when: new Date().toISOString(), results, sends, spoken, timing: sttT }, null, 1));
  await browser.close();
  cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(3); });
