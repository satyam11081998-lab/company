/**
 * Formula fields — a small, safe expression language (no eval, no Function).
 *
 *   amount * probability / 100
 *   IF(stage == "closed_won", amount, 0)
 *   DAYS_BETWEEN(created_at, TODAY())
 *   CONCAT(first_name, " ", last_name)
 *
 * Recursive-descent parser with hard limits on length, tokens and depth.
 * Field references resolve only to fields of the record; anything else is a
 * parse error at definition time. Runtime errors (divide by zero, bad types)
 * yield null rather than throwing.
 */

type Tok =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'id'; v: string }
  | { t: 'op'; v: string }
  | { t: 'eof' };

const MAX_LEN = 1000;
const MAX_TOKENS = 400;
const MAX_DEPTH = 40;

export class FormulaError extends Error {}

function tokenize(src: string): Tok[] {
  if (src.length > MAX_LEN) throw new FormulaError(`Formula is longer than ${MAX_LEN} characters.`);
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      const m = /^\d*\.?\d+(?:[eE][+-]?\d+)?/.exec(src.slice(i));
      if (!m) throw new FormulaError(`Bad number at ${i + 1}.`);
      out.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = '';
      while (j < src.length && src[j] !== c) {
        if (src[j] === '\\' && j + 1 < src.length) { s += src[j + 1]; j += 2; continue; }
        s += src[j++];
      }
      if (j >= src.length) throw new FormulaError('Unclosed quote.');
      out.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i))!;
      out.push({ t: 'id', v: m[0] });
      i += m[0].length;
      continue;
    }
    const two = src.slice(i, i + 2);
    if (['==', '!=', '>=', '<=', '&&', '||'].includes(two)) { out.push({ t: 'op', v: two }); i += 2; continue; }
    if ('+-*/%(),<>!'.includes(c)) { out.push({ t: 'op', v: c }); i++; continue; }
    throw new FormulaError(`Unexpected character "${c}" at ${i + 1}.`);
    }
  if (out.length > MAX_TOKENS) throw new FormulaError('Formula is too complex.');
  out.push({ t: 'eof' });
  return out;
}

export type Node =
  | { k: 'lit'; v: unknown }
  | { k: 'ref'; name: string }
  | { k: 'un'; op: string; a: Node }
  | { k: 'bin'; op: string; a: Node; b: Node }
  | { k: 'call'; fn: string; args: Node[] };

const FUNCS: Record<string, [number, number]> = {
  IF: [3, 3], AND: [1, 20], OR: [1, 20], NOT: [1, 1], ROUND: [1, 2], ABS: [1, 1], MIN: [1, 20], MAX: [1, 20],
  FLOOR: [1, 1], CEIL: [1, 1], CONCAT: [1, 20], LEN: [1, 1], UPPER: [1, 1], LOWER: [1, 1], TODAY: [0, 0], NOW: [0, 0],
  DAYS_BETWEEN: [2, 2], ADD_DAYS: [2, 2], YEAR: [1, 1], MONTH: [1, 1], ISBLANK: [1, 1], COALESCE: [1, 20],
};

export function parseFormula(src: string, knownFields: string[]): Node {
  const toks = tokenize(src);
  let p = 0;
  let depth = 0;
  const peek = () => toks[p];
  const isOp = (v: string) => { const t = peek(); return t.t === 'op' && t.v === v; };
  const expect = (v: string) => { if (!isOp(v)) throw new FormulaError(`Expected "${v}".`); p++; };
  const enter = () => { if (++depth > MAX_DEPTH) throw new FormulaError('Formula is nested too deeply.'); };
  const known = new Set(knownFields);

  const binLevel = (ops: string[], next: () => Node) => (): Node => {
    let a = next();
    while (peek().t === 'op' && ops.includes((peek() as { v: string }).v)) {
      const op = (toks[p++] as { v: string }).v;
      a = { k: 'bin', op, a, b: next() };
    }
    return a;
  };

  const primary = (): Node => {
    enter();
    try {
      const t = toks[p];
      if (t.t === 'num') { p++; return { k: 'lit', v: t.v }; }
      if (t.t === 'str') { p++; return { k: 'lit', v: t.v }; }
      if (t.t === 'id') {
        p++;
        const up = t.v.toUpperCase();
        if (up === 'TRUE') return { k: 'lit', v: true };
        if (up === 'FALSE') return { k: 'lit', v: false };
        if (up === 'NULL') return { k: 'lit', v: null };
        if (isOp('(')) {
          if (!FUNCS[up]) throw new FormulaError(`Unknown function ${t.v}.`);
          p++;
          const args: Node[] = [];
          if (!isOp(')')) {
            args.push(expr());
            while (isOp(',')) { p++; args.push(expr()); }
          }
          expect(')');
          const [lo, hi] = FUNCS[up];
          if (args.length < lo || args.length > hi) throw new FormulaError(`${up} takes ${lo === hi ? lo : `${lo}–${hi}`} argument(s).`);
          return { k: 'call', fn: up, args };
        }
        if (!known.has(t.v)) throw new FormulaError(`Unknown field "${t.v}".`);
        return { k: 'ref', name: t.v };
      }
      if (isOp('(')) { p++; const e = expr(); expect(')'); return e; }
      if (isOp('-') || isOp('!')) { const op = (toks[p++] as { v: string }).v; return { k: 'un', op, a: primary() }; }
      throw new FormulaError('Unexpected end of formula.');
    } finally {
      depth--;
    }
  };
  const mul = binLevel(['*', '/', '%'], primary);
  const add = binLevel(['+', '-'], mul);
  const cmp = binLevel(['==', '!=', '>', '>=', '<', '<='], add);
  const and = binLevel(['&&'], cmp);
  const expr: () => Node = binLevel(['||'], and);

  const tree = expr();
  if (peek().t !== 'eof') throw new FormulaError('Unexpected text after the formula.');
  return tree;
}

const num = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  if (typeof v === 'boolean') return v ? 1 : 0;
  return null;
};
const time = (v: unknown): number | null => {
  if (typeof v !== 'string') return null;
  const t = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? v + 'T00:00:00Z' : v).getTime();
  return Number.isNaN(t) ? null : t;
};
const truthy = (v: unknown) => !(v === null || v === undefined || v === false || v === 0 || v === '');

export function evalFormula(node: Node, data: Record<string, unknown>, now = new Date()): unknown {
  const ev = (n: Node): unknown => {
    switch (n.k) {
      case 'lit': return n.v;
      case 'ref': { const v = Object.prototype.hasOwnProperty.call(data, n.name) ? data[n.name] : undefined; return v === undefined ? null : v; }
      case 'un': {
        const a = ev(n.a);
        if (n.op === '!') return !truthy(a);
        const x = num(a);
        return x === null ? null : -x;
      }
      case 'bin': {
        if (n.op === '&&') return truthy(ev(n.a)) && truthy(ev(n.b));
        if (n.op === '||') return truthy(ev(n.a)) || truthy(ev(n.b));
        const a = ev(n.a);
        const b = ev(n.b);
        if (n.op === '==') return String(a ?? '') === String(b ?? '');
        if (n.op === '!=') return String(a ?? '') !== String(b ?? '');
        if (n.op === '+' && (typeof a === 'string' || typeof b === 'string') && (num(a) === null || num(b) === null)) {
          return `${a ?? ''}${b ?? ''}`;
        }
        const x = num(a);
        const y = num(b);
        if (x === null || y === null) return null;
        switch (n.op) {
          case '+': return x + y;
          case '-': return x - y;
          case '*': return x * y;
          case '/': return y === 0 ? null : x / y;
          case '%': return y === 0 ? null : x % y;
          case '>': return x > y;
          case '>=': return x >= y;
          case '<': return x < y;
          case '<=': return x <= y;
        }
        return null;
      }
      case 'call': {
        const A = n.args;
        switch (n.fn) {
          case 'IF': return truthy(ev(A[0])) ? ev(A[1]) : ev(A[2]);
          case 'AND': return A.every((a) => truthy(ev(a)));
          case 'OR': return A.some((a) => truthy(ev(a)));
          case 'NOT': return !truthy(ev(A[0]));
          case 'ROUND': {
            const x = num(ev(A[0]));
            const d = A[1] ? Math.max(0, Math.min(10, Math.trunc(num(ev(A[1])) ?? 0))) : 0;
            return x === null ? null : Math.round(x * 10 ** d) / 10 ** d;
          }
          case 'ABS': { const x = num(ev(A[0])); return x === null ? null : Math.abs(x); }
          case 'FLOOR': { const x = num(ev(A[0])); return x === null ? null : Math.floor(x); }
          case 'CEIL': { const x = num(ev(A[0])); return x === null ? null : Math.ceil(x); }
          case 'MIN': case 'MAX': {
            const xs = A.map((a) => num(ev(a))).filter((x): x is number => x !== null);
            if (!xs.length) return null;
            return n.fn === 'MIN' ? Math.min(...xs) : Math.max(...xs);
          }
          case 'CONCAT': return A.map((a) => { const v = ev(a); return v === null || v === undefined ? '' : String(v); }).join('').slice(0, 2000);
          case 'LEN': { const v = ev(A[0]); return v === null || v === undefined ? 0 : String(v).length; }
          case 'UPPER': { const v = ev(A[0]); return v === null ? null : String(v).toUpperCase(); }
          case 'LOWER': { const v = ev(A[0]); return v === null ? null : String(v).toLowerCase(); }
          case 'TODAY': return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
          case 'NOW': return now.toISOString();
          case 'DAYS_BETWEEN': {
            const a = time(ev(A[0]));
            const b = time(ev(A[1]));
            return a === null || b === null ? null : Math.round((b - a) / 86_400_000);
          }
          case 'ADD_DAYS': {
            const a = time(ev(A[0]));
            const d = num(ev(A[1]));
            return a === null || d === null ? null : new Date(a + d * 86_400_000).toISOString().slice(0, 10);
          }
          case 'YEAR': { const a = time(ev(A[0])); return a === null ? null : new Date(a).getUTCFullYear(); }
          case 'MONTH': { const a = time(ev(A[0])); return a === null ? null : new Date(a).getUTCMonth() + 1; }
          case 'ISBLANK': { const v = ev(A[0]); return v === null || v === undefined || v === ''; }
          case 'COALESCE': {
            for (const a of A) { const v = ev(a); if (v !== null && v !== undefined && v !== '') return v; }
            return null;
          }
        }
        return null;
      }
    }
  };
  const out = ev(node);
  if (typeof out === 'number' && !Number.isFinite(out)) return null;
  return out;
}

/** Fields a formula depends on (to order evaluation and to check field security). */
export function formulaRefs(node: Node): string[] {
  const out = new Set<string>();
  const walk = (n: Node) => {
    if (n.k === 'ref') out.add(n.name);
    else if (n.k === 'un') walk(n.a);
    else if (n.k === 'bin') { walk(n.a); walk(n.b); }
    else if (n.k === 'call') n.args.forEach(walk);
  };
  walk(node);
  return [...out];
}

/** Coerce a formula result into the declared return type. */
export function castFormula(v: unknown, returns: string | undefined): unknown {
  if (v === null || v === undefined) return null;
  switch (returns) {
    case 'number': case 'currency': case 'percent': {
      const x = num(v);
      return x === null ? null : Math.round(x * 100) / 100;
    }
    case 'boolean': return truthy(v);
    case 'date': return typeof v === 'string' && time(v) !== null ? v.slice(0, 10) : null;
    default: return String(v).slice(0, 2000);
  }
}
