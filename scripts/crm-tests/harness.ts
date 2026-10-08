/* Minimal test harness for the CRM's pure modules: `npm run test:crm` (scripts/crm-tests). */
type Fn = () => void | Promise<void>;
const tests: Array<{ name: string; fn: Fn }> = [];

export function test(name: string, fn: Fn) {
  tests.push({ name, fn });
}

export function eq(actual: unknown, expected: unknown, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e}, got ${a}`);
}

export function ok(cond: unknown, msg = 'expected truthy') {
  if (!cond) throw new Error(msg);
}

export function throws(fn: () => unknown, re?: RegExp, msg = '') {
  try {
    fn();
  } catch (e) {
    if (re && !re.test(String((e as Error).message))) throw new Error(`${msg} threw "${(e as Error).message}", expected ${re}`);
    return;
  }
  throw new Error(`${msg} expected to throw`);
}

export function near(a: number, b: number, tol = 1e-6, msg = '') {
  if (!(Math.abs(a - b) <= tol)) throw new Error(`${msg} expected ≈${b}, got ${a}`);
}

export async function run() {
  let pass = 0;
  const failed: string[] = [];
  for (const t of tests) {
    try {
      await t.fn();
      pass++;
    } catch (e) {
      failed.push(`✗ ${t.name}: ${(e as Error).message}`);
    }
  }
  for (const f of failed) console.log(f);
  console.log(`\n${pass}/${tests.length} passed`);
  if (failed.length) process.exitCode = 1;
}
