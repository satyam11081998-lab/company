#!/usr/bin/env node
/**
 * Gate for the broadcast market audience (2026-10-02). Transpiles the pure
 * module with the repo's tsc and checks the rules that decide who gets an
 * admin email and whether its practice links can be opened.
 *   node scripts/test-broadcast-audience.mjs
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = mkdtempSync(join(tmpdir(), 'bcast-aud-'));
try {
  execSync(`npx tsc --ignoreConfig lib/market.ts lib/broadcast-audience.ts --outDir ${out} --module commonjs --target es2020 --skipLibCheck`, { cwd: root, stdio: 'pipe' });
} catch { /* outputs checked below */ }
for (const f of ['market.js', 'broadcast-audience.js']) {
  if (!existsSync(join(out, f))) { console.error('tsc did not emit', f); process.exit(1); }
}
const require = createRequire(import.meta.url);
const a = require(join(out, 'broadcast-audience.js'));
rmSync(out, { recursive: true, force: true });

let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('  ✓', name); };

console.log('who is in the audience');
ok('India audience: IN accounts', () => assert.equal(a.inAudience('IN', 'IN'), true));
ok('India audience: legacy NULL account counts as India', () => assert.equal(a.inAudience(null, 'IN'), true));
ok('India audience: excludes US', () => assert.equal(a.inAudience('US', 'IN'), false));
ok('India audience: excludes Europe', () => assert.equal(a.inAudience('EU', 'IN'), false));
ok('US & Europe audience: US', () => assert.equal(a.inAudience('US', 'US'), true));
ok('US & Europe audience: Europe', () => assert.equal(a.inAudience('EU', 'US'), true));
ok('US & Europe audience: excludes India', () => assert.equal(a.inAudience('IN', 'US'), false));
ok('US & Europe audience: excludes NULL (India)', () => assert.equal(a.inAudience(undefined, 'US'), false));
ok('Both: everyone', () => assert.ok(['IN', 'US', 'EU', null].every((m) => a.inAudience(m, 'all'))));

console.log('practice links vs audience');
ok('plain announcement fits any audience', () => assert.ok(a.AUDIENCES.every((x) => a.audienceProblem(x, []) === null)));
ok('India links to India: allowed', () => assert.equal(a.audienceProblem('IN', ['IN']), null));
ok('US links to US & Europe: allowed', () => assert.equal(a.audienceProblem('US', ['US', 'US']), null));
ok('India links to US & Europe: refused', () => assert.match(a.audienceProblem('US', ['IN']), /India practice, but the audience is US & Europe/));
ok('US links to India: refused', () => assert.match(a.audienceProblem('IN', ['US']), /US & Europe practice, but the audience is India/));
ok('India links to both: refused', () => assert.match(a.audienceProblem('all', ['IN']), /US & Europe users can’t open/));
ok('mixed links: refused for every audience', () => assert.ok(a.AUDIENCES.every((x) => /mixes India and US & Europe/.test(a.audienceProblem(x, ['IN', 'US'])))));

console.log('parsing untrusted input');
ok('parseAudience accepts IN/US/all', () => assert.deepEqual(['IN', 'US', 'all'].map(a.parseAudience), ['IN', 'US', 'all']));
ok('parseAudience refuses missing / unknown', () => {
  assert.throws(() => a.parseAudience(undefined));
  assert.throws(() => a.parseAudience('EU'));
  assert.throws(() => a.parseAudience('in'));
});
ok('parseContentMarket: empty → undefined', () => assert.equal(a.parseContentMarket(''), undefined));
ok('parseContentMarket refuses unknown', () => assert.throws(() => a.parseContentMarket('UK')));

console.log(`\n${n} checks passed.`);
