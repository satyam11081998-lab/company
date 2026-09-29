/**
 * Bundle harness-entry.tsx (the real component + its real imports) for the browser E2E.
 *   ESBUILD_DIR=<dir with esbuild installed> node build-harness.cjs <apiUrl>
 */
const path = require('path');
const esbuild = require(require.resolve('esbuild', { paths: [process.env.ESBUILD_DIR || process.cwd()] }));
const api = process.argv[2] || 'http://127.0.0.1:8765';
for (const [entry, out] of [['harness-entry.tsx', 'harness.js'], ['stt-entry.tsx', 'stt.js']]) esbuild.buildSync({
  entryPoints: [path.join(__dirname, entry)],
  bundle: true,
  outfile: path.join(__dirname, out),
  platform: 'browser',
  format: 'iife',
  jsx: 'automatic',
  target: 'es2020',
  tsconfig: path.join(__dirname, '..', '..', 'tsconfig.json'),
  define: {
    'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(api),
    'process.env.NODE_ENV': '"production"',
    'process.env.NEXT_PUBLIC_STT_TRANSPORT': '"whisper"',
  },
  banner: { js: 'var process = globalThis.process || { env: {} };' },
  logLevel: 'warning',
});
console.log('[build-harness] ok');
