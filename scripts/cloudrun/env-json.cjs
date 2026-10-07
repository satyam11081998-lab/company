/**
 * The MECE frontend's environment, as ONE JSON object (Google Cloud Run, 2026-10-08).
 *
 * On Vercel every variable is set in the dashboard. On Cloud Run the same set
 * lives in a single Secret Manager secret (`mece-frontend-env`) holding a JSON
 * object `{"NAME": "value", ...}`:
 *   - the image build reads it through a BuildKit secret mount (never written
 *     into an image layer) — NEXT_PUBLIC_* values are inlined at build time,
 *     exactly as on Vercel;
 *   - the running service gets it mounted as a file and start.cjs loads it.
 * JSON rather than a .env file on purpose: values are taken literally (no
 * `$VAR` expansion, which would silently change a password containing `$`),
 * multi-line keys need no special quoting, and parsing cannot differ between
 * the build and the server.
 *
 * Dependency-free: used by the build (scripts/cloudrun/build.cjs), by the
 * server launcher (start.cjs, copied into the image) and by the converter
 * (dotenv-to-json.cjs) the owner runs once to create the secret.
 */
'use strict';

const fs = require('fs');

/** Never taken from the file: set by the platform / the image, or Vercel-only. */
const DROP = /^(VERCEL|VERCEL_.*|TURBO_.*|NX_.*|NODE_ENV|PORT|HOSTNAME|K_SERVICE|K_REVISION|K_CONFIGURATION)$/;
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Read and validate the JSON env file. Throws with a clear message. */
function readEnvJson(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (e) {
    throw new Error(`env file not readable at ${file}: ${e.code || e.message}`);
  }
  let obj;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error(`env file at ${file} is not valid JSON (create it with scripts/cloudrun/dotenv-to-json.cjs)`);
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(`env file at ${file} must be a JSON object of NAME: "value"`);
  }
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!NAME.test(k) || DROP.test(k)) continue;
    if (typeof v !== 'string') throw new Error(`env file: ${k} must be a string`);
    out[k] = v;
  }
  return out;
}

/** Copy into process.env; anything already set (a Cloud Run env var) wins. */
function applyEnv(env, target = process.env) {
  let n = 0;
  for (const [k, v] of Object.entries(env)) {
    if (target[k] === undefined) {
      target[k] = v;
      n++;
    }
  }
  return n;
}

module.exports = { readEnvJson, applyEnv, DROP, NAME };
