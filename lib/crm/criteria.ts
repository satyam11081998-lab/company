/**
 * Criteria: validation + evaluation. Used by views, workflow/assignment/
 * scoring/validation rules, segments, sharing rules, territories and reports.
 * Pure. Evaluation never throws on odd data — a condition that can't be
 * evaluated is simply false.
 */
import type { Condition, Criteria, CrmRecord, FieldDef, Operator } from './types';
import { OPERATORS, RECORD_COLUMNS, isCriteria } from './types';

export const MAX_CRITERIA_DEPTH = 3;
export const MAX_CONDITIONS = 25;

export interface EvalOptions {
  now?: Date;
  /** minutes east of UTC for "today"/"this month" (IST = 330) */
  tzOffsetMin?: number;
  /** previous version of the record, for changed / changed_to / changed_from */
  prev?: Pick<CrmRecord, 'data' | 'owner_id' | 'tags' | 'name'> | null;
}

/** Read a field from a record: record columns first, then data. */
export function getValue(rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, field: string): unknown {
  if ((RECORD_COLUMNS as readonly string[]).includes(field)) return (rec as Record<string, unknown>)[field] ?? null;
  const v = rec.data && Object.prototype.hasOwnProperty.call(rec.data, field) ? rec.data[field] : undefined;
  if (v && typeof v === 'object' && !Array.isArray(v) && 'id' in (v as object)) return (v as { id: unknown }).id; // related
  return v === undefined ? null : v;
}

const asStr = (v: unknown) => (v === null || v === undefined ? '' : Array.isArray(v) ? v.join(', ') : String(v)).toLowerCase();

function asNum(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function asTime(v: unknown): number | null {
  if (typeof v !== 'string' && !(v instanceof Date)) return null;
  const s = typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v + 'T00:00:00Z' : v;
  const t = new Date(s as string).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Local calendar day number (days since epoch) in the given offset. */
function dayNum(t: number, tz: number): number {
  return Math.floor((t + tz * 60_000) / 86_400_000);
}

function localParts(t: number, tz: number) {
  const d = new Date(t + tz * 60_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), dow: d.getUTCDay() };
}

function isEmptyVal(v: unknown) {
  return v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
}

function equals(a: unknown, b: unknown): boolean {
  if (Array.isArray(a)) return a.map((x) => String(x).toLowerCase()).includes(asStr(b));
  if (typeof a === 'boolean' || typeof b === 'boolean') return String(a) === String(b);
  const na = asNum(a);
  const nb = asNum(b);
  if (na !== null && nb !== null && typeof a !== 'string') return na === nb;
  return asStr(a) === asStr(b);
}

export function evalCondition(rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, c: Condition, opts: EvalOptions = {}): boolean {
  const now = (opts.now ?? new Date()).getTime();
  const tz = opts.tzOffsetMin ?? 330;
  const v = getValue(rec, c.field);
  try {
    switch (c.op) {
      case 'eq': return equals(v, c.value);
      case 'neq': return !equals(v, c.value);
      case 'contains': return asStr(v).includes(asStr(c.value));
      case 'not_contains': return !asStr(v).includes(asStr(c.value));
      case 'starts_with': return asStr(v).startsWith(asStr(c.value));
      case 'ends_with': return asStr(v).endsWith(asStr(c.value));
      case 'empty': return isEmptyVal(v);
      case 'not_empty': return !isEmptyVal(v);
      case 'gt': case 'gte': case 'lt': case 'lte': {
        const a = asNum(v) ?? asTime(v);
        const b = asNum(c.value) ?? asTime(c.value);
        if (a === null || b === null) return false;
        return c.op === 'gt' ? a > b : c.op === 'gte' ? a >= b : c.op === 'lt' ? a < b : a <= b;
      }
      case 'between': {
        const a = asNum(v) ?? asTime(v);
        const lo = asNum(c.value) ?? asTime(c.value);
        const hi = asNum(c.value2) ?? asTime(c.value2);
        if (a === null || lo === null || hi === null) return false;
        return a >= lo && a <= hi;
      }
      case 'in': case 'not_in': {
        const list = Array.isArray(c.value) ? c.value : String(c.value ?? '').split(',');
        const hit = Array.isArray(v)
          ? v.some((x) => list.some((y) => equals(x, y)))
          : list.some((y) => equals(v, typeof y === 'string' ? y.trim() : y));
        return c.op === 'in' ? hit : !hit;
      }
      case 'before': case 'after': case 'on': {
        const a = asTime(v);
        const b = asTime(c.value);
        if (a === null || b === null) return false;
        if (c.op === 'on') return dayNum(a, tz) === dayNum(b, tz);
        return c.op === 'before' ? dayNum(a, tz) < dayNum(b, tz) : dayNum(a, tz) > dayNum(b, tz);
      }
      case 'in_last_days': case 'in_next_days': case 'older_than_days': {
        const a = asTime(v);
        const n = asNum(c.value);
        if (a === null || n === null || n < 0) return false;
        const d = dayNum(a, tz) - dayNum(now, tz);
        if (c.op === 'in_last_days') return d <= 0 && d >= -n;
        if (c.op === 'in_next_days') return d >= 0 && d <= n;
        return d < -n;
      }
      case 'today': {
        const a = asTime(v);
        return a !== null && dayNum(a, tz) === dayNum(now, tz);
      }
      case 'this_week': {
        const a = asTime(v);
        if (a === null) return false;
        // Monday-start weeks
        const start = dayNum(now, tz) - ((localParts(now, tz).dow + 6) % 7);
        const d = dayNum(a, tz);
        return d >= start && d < start + 7;
      }
      case 'this_month': case 'last_month': case 'this_quarter': case 'this_year': {
        const a = asTime(v);
        if (a === null) return false;
        const p = localParts(a, tz);
        const n = localParts(now, tz);
        if (c.op === 'this_year') return p.y === n.y;
        if (c.op === 'this_quarter') return p.y === n.y && Math.floor(p.m / 3) === Math.floor(n.m / 3);
        if (c.op === 'this_month') return p.y === n.y && p.m === n.m;
        const lm = n.m === 0 ? { y: n.y - 1, m: 11 } : { y: n.y, m: n.m - 1 };
        return p.y === lm.y && p.m === lm.m;
      }
      case 'has_tag': case 'not_has_tag': {
        const tags = (rec.tags ?? []).map((t) => t.toLowerCase());
        const hit = tags.includes(asStr(c.value));
        return c.op === 'has_tag' ? hit : !hit;
      }
      case 'changed': case 'changed_to': case 'changed_from': {
        if (!opts.prev) return false;
        const before = getValue(opts.prev as CrmRecord, c.field);
        const changed = JSON.stringify(before ?? null) !== JSON.stringify(v ?? null);
        if (c.op === 'changed') return changed;
        if (c.op === 'changed_to') return changed && equals(v, c.value);
        return changed && equals(before, c.value);
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
}

export function evaluate(rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, crit: Criteria | null | undefined, opts: EvalOptions = {}): boolean {
  if (!crit || !crit.conditions?.length) return true;
  const results = crit.conditions.map((c) => (isCriteria(c) ? evaluate(rec, c, opts) : evalCondition(rec, c, opts)));
  return crit.match === 'any' ? results.some(Boolean) : results.every(Boolean);
}

/**
 * Validate criteria shape against the module's fields. Returns a cleaned copy
 * (unknown keys dropped) or throws with a readable message. Criteria arrive
 * from the browser, so nothing in them is trusted.
 */
export function validateCriteria(raw: unknown, fields: Pick<FieldDef, 'api_name'>[], depth = 1): Criteria {
  if (!isCriteria(raw)) throw new Error('Criteria must be { match, conditions }.');
  if (depth > MAX_CRITERIA_DEPTH) throw new Error('Criteria are nested too deeply.');
  const match = raw.match === 'any' ? 'any' : 'all';
  if (raw.conditions.length > MAX_CONDITIONS) throw new Error(`At most ${MAX_CONDITIONS} conditions.`);
  const known = new Set<string>([...fields.map((f) => f.api_name), ...RECORD_COLUMNS]);
  const conditions: Array<Condition | Criteria> = raw.conditions.map((c) => {
    if (isCriteria(c)) return validateCriteria(c, fields, depth + 1);
    const cc = c as Condition;
    if (!cc || typeof cc.field !== 'string' || !known.has(cc.field)) throw new Error(`Unknown field "${String(cc?.field)}".`);
    if (!(OPERATORS as readonly string[]).includes(cc.op)) throw new Error(`Unknown operator "${String(cc.op)}".`);
    const out: Condition = { field: cc.field, op: cc.op as Operator };
    if (cc.value !== undefined) out.value = cleanScalar(cc.value);
    if (cc.value2 !== undefined) out.value2 = cleanScalar(cc.value2);
    return out;
  });
  return { match, conditions };
}

function cleanScalar(v: unknown): unknown {
  if (v === null || typeof v === 'boolean') return v;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') return v.slice(0, 500);
  if (Array.isArray(v)) return v.slice(0, 100).map((x) => (typeof x === 'string' ? x.slice(0, 200) : typeof x === 'number' || typeof x === 'boolean' ? x : String(x).slice(0, 200)));
  return String(v).slice(0, 500);
}

/** Every field referenced by criteria (for permission checks on hidden fields). */
export function criteriaFields(crit: Criteria | null | undefined): string[] {
  if (!crit) return [];
  const out: string[] = [];
  for (const c of crit.conditions) {
    if (isCriteria(c)) out.push(...criteriaFields(c));
    else out.push(c.field);
  }
  return [...new Set(out)];
}

export const OPERATOR_LABELS: Record<Operator, string> = {
  eq: 'is', neq: "isn't", contains: 'contains', not_contains: "doesn't contain", starts_with: 'starts with',
  ends_with: 'ends with', empty: 'is empty', not_empty: 'is not empty', gt: '>', gte: '≥', lt: '<', lte: '≤',
  between: 'between', in: 'is any of', not_in: 'is none of', before: 'before', after: 'after', on: 'on',
  in_last_days: 'in the last N days', in_next_days: 'in the next N days', older_than_days: 'more than N days ago',
  today: 'is today', this_week: 'this week', this_month: 'this month', last_month: 'last month',
  this_quarter: 'this quarter', this_year: 'this year', has_tag: 'has tag', not_has_tag: "doesn't have tag",
  changed: 'is changed', changed_to: 'changed to', changed_from: 'changed from',
};

/** Operators that take no value. */
export const NO_VALUE_OPS: Operator[] = ['empty', 'not_empty', 'today', 'this_week', 'this_month', 'last_month', 'this_quarter', 'this_year', 'changed'];
