/**
 * `next build` for the Cloud Run image, with the production environment
 * (2026-10-08). Run by the Dockerfile as:
 *   node scripts/cloudrun/build.cjs /run/secrets/frontend_env
 * where the path is a BuildKit secret mount of the `mece-frontend-env` secret:
 * present only while this command runs, never stored in an image layer.
 *
 * Vercel builds with the project's environment variables; NEXT_PUBLIC_* are
 * inlined into the browser code at this step and the prerendered pages are
 * fetched with them. Building without them would produce a site that looks
 * fine and talks to nothing — so a missing file or a missing core setting
 * stops the build.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const { readEnvJson, applyEnv } = require('./env-json.cjs');

const REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SITE_URL',
];

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/cloudrun/build.cjs <env.json>');
  process.exit(2);
}

let env;
try {
  env = readEnvJson(file);
} catch (e) {
  console.error(`[build] ${e.message}`);
  process.exit(1);
}
const missing = REQUIRED.filter((k) => !env[k] && !process.env[k]);
if (missing.length) {
  console.error(`[build] missing in the env secret: ${missing.join(', ')}`);
  process.exit(1);
}
applyEnv(env);
console.log(`[build] ${Object.keys(env).length} settings loaded (names only): ${Object.keys(env).sort().join(', ')}`);

const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const r = spawnSync(process.execPath, [nextBin, 'build'], { stdio: 'inherit', env: process.env });
process.exit(r.status === null ? 1 : r.status);
