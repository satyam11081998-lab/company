// Interview Intelligence live-progress helpers (smooth percentage, JD keyword coverage), no browser needed.
//   node qa/interview-intelligence/progress/run.mjs
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const tmp = mkdtempSync(path.join(tmpdir(), 'ii-progress-'));
const files = ['progress.ts', 'types.ts'].map((f) => path.join(root, 'lib/interview-intelligence', f));
execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--outDir', path.join(tmp, 'out'),
  '--ignoreConfig', '--module', 'commonjs', '--target', 'es2020', '--lib', 'es2022,dom', '--strict', '--skipLibCheck', ...files],
{ stdio: 'inherit' });
const tests = readdirSync(here).filter((f) => f.endsWith('.test.cjs'));
for (const t of tests) copyFileSync(path.join(here, t), path.join(tmp, t));
execFileSync(process.execPath, ['--test', ...tests], { cwd: tmp, stdio: 'inherit' });
