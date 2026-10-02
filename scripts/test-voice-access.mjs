#!/usr/bin/env node
/**
 * Gate for voice access (2026-10-03). Transpiles lib/voice/access.ts with the
 * repo's tsc and checks that a refused voice session is answered with the right
 * prompt (sign in / upgrade / minutes) and that only real failures are treated
 * as a connection problem.
 *   node scripts/test-voice-access.mjs
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'voice-access-'));
try {
  execSync(`npx tsc --ignoreConfig lib/voice/access.ts --outDir ${out} --module commonjs --target es2020 --skipLibCheck`, { cwd: root, stdio: 'pipe' });
} catch { /* output checked below */ }
const built = join(out, 'access.js');
if (!existsSync(built)) { console.error('tsc did not emit access.js'); process.exit(1); }
const require = createRequire(import.meta.url);
const v = require(built);
rmSync(out, { recursive: true, force: true });

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ok', name); };

console.log('server refusals -> prompt');
// The exact strings the backend sends today (routes/realtime_gemini.py, speak.py, realtime.py).
ok('guest (Gemini / speak) -> sign in', () => assert.equal(v.voiceAccessKind(403, 'Create an account to use voice interview mode.'), 'signin'));
ok('not Pro on Gemini -> upgrade', () => assert.equal(v.voiceAccessKind(403, 'Voice interview is a Pro feature.'), 'upgrade'));
ok('Pro out of minutes -> credits', () => assert.equal(v.voiceAccessKind(402, "You're out of real-time interview minutes. Buy a minute pack, or use the standard voice mode — it's unlimited on Pro."), 'credits'));
ok('free trial used -> credits', () => assert.equal(v.voiceAccessKind(402, "You've used your free voice interviews. Upgrade to Pro to keep talking through cases out loud."), 'credits'));

console.log('real failures stay a connection problem');
ok('503 not configured', () => assert.equal(v.voiceAccessKind(503, 'Gemini voice is not configured on the server.'), 'connection'));
ok('500 no detail', () => assert.equal(v.voiceAccessKind(500, undefined), 'connection'));
ok('404 case not found', () => assert.equal(v.voiceAccessKind(404, 'Case not found'), 'connection'));
ok('403 of another kind (region)', () => assert.equal(v.voiceAccessKind(403, "This case isn't available in your region"), 'connection'));
ok('non-string detail', () => assert.equal(v.voiceAccessKind(403, { msg: 'x' }), 'connection'));

console.log('what a new account gets (no over-promising)');
ok('Gemini -> Pro', () => assert.equal(v.voicePlanFor('gemini'), 'pro'));
ok('pipeline -> Pro', () => assert.equal(v.voicePlanFor('pipeline'), 'pro'));
ok('OpenAI Realtime -> free trial', () => assert.equal(v.voicePlanFor('realtime'), 'trial'));
ok('unknown -> Pro', () => assert.equal(v.voicePlanFor(undefined), 'pro'));

console.log('return path');
ok('back to the case', () => assert.equal(v.voiceReturnPath('abc-123'), '/cases/abc-123'));
ok('id is encoded', () => assert.equal(v.voiceReturnPath('a/b?c'), '/cases/a%2Fb%3Fc'));

console.log(`\n${n} checks passed.`);
