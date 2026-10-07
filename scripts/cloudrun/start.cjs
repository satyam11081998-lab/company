/**
 * Cloud Run entry point for the MECE frontend (2026-10-08).
 *
 * Loads the environment from the Secret Manager file mounted at
 * /secrets/frontend-env.json (see env-json.cjs), then starts Next.js's
 * standalone server. Fails fast when the file is missing: a site started
 * without its Supabase / backend settings would serve broken pages, while a
 * container that exits fails Cloud Run's startup check, so the previous
 * revision keeps serving.
 */
'use strict';

const path = require('path');
const { readEnvJson, applyEnv } = require('./env-json.cjs');

const file = process.env.MECE_ENV_FILE || '/secrets/frontend-env.json';
try {
  const n = applyEnv(readEnvJson(file));
  console.log(`[start] loaded ${n} settings from ${file}`);
} catch (e) {
  console.error(`[start] ${e.message}`);
  process.exit(1);
}

require(path.join(__dirname, '..', 'server.js'));
