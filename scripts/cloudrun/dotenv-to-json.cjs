#!/usr/bin/env node
/**
 * Turn the PRODUCTION .env file into the JSON the Cloud Run build and service
 * read (see env-json.cjs). Run once, locally, when creating or changing the
 * `mece-frontend-env` secret:
 *
 *   node scripts/cloudrun/dotenv-to-json.cjs <production .env file> <output .json>
 *
 * Writes the output file itself (UTF-8) instead of printing it: PowerShell's
 * `>` would save UTF-16, which the build could not read. Prints only variable
 * NAMES, never values. Vercel-only variables (VERCEL*, TURBO_*, NX_*) and
 * NODE_ENV / PORT / HOSTNAME are left out; the platform sets those.
 *
 * Parsing follows dotenv (what Vercel's `vercel env pull` writes): `KEY=value`,
 * optional quotes, `\n` in double quotes becomes a newline, `#` comments.
 * Like Vercel — and unlike Next.js's own .env loading — `$NAME` is NOT
 * expanded, so a secret containing `$` is kept exactly.
 */
'use strict';

const fs = require('fs');
const { DROP, NAME } = require('./env-json.cjs');

// dotenv v16's line grammar.
const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

function parseDotenv(src) {
  const out = {};
  const lines = String(src).replace(/^﻿/, '').replace(/\r\n?/gm, '\n');
  let m;
  while ((m = LINE.exec(lines)) !== null) {
    let value = (m[2] || '').trim();
    const quote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');
    if (quote === '"') value = value.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    out[m[1]] = value;
  }
  return out;
}

function main() {
  const [src, dest] = process.argv.slice(2);
  if (!src || !dest) {
    console.error('usage: node scripts/cloudrun/dotenv-to-json.cjs <production .env file> <output .json>');
    process.exit(2);
  }
  const parsed = parseDotenv(fs.readFileSync(src, 'utf8'));
  const kept = {};
  const dropped = [];
  for (const [k, v] of Object.entries(parsed)) {
    if (!NAME.test(k) || DROP.test(k)) dropped.push(k);
    else kept[k] = v;
  }
  const names = Object.keys(kept).sort();
  const warn = [];
  for (const k of ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_SITE_URL']) {
    if (!kept[k]) warn.push(`${k} is missing`);
  }
  for (const [k, v] of Object.entries(kept)) {
    if (/^NEXT_PUBLIC_.*URL$/.test(k) && /localhost|127\.0\.0\.1/.test(v)) warn.push(`${k} points at localhost — is this the PRODUCTION file?`);
    if (v === '') warn.push(`${k} is empty`);
  }
  fs.writeFileSync(dest, JSON.stringify(kept, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 });
  console.log(`Wrote ${names.length} settings to ${dest}:`);
  console.log('  ' + names.join(', '));
  if (dropped.length) console.log(`Left out (platform / Vercel-only): ${dropped.sort().join(', ')}`);
  if (warn.length) {
    console.log('\nCHECK BEFORE UPLOADING:');
    for (const w of warn) console.log('  - ' + w);
  }
}

if (require.main === module) main();
module.exports = { parseDotenv };
