/**
 * Field value coercion, validation, line-item maths and display formatting.
 * Pure. Every value that reaches crm_records.data passes through `coerceValue`.
 */
import type { FieldDef, LineItem, LineTotals } from './types';

export class FieldError extends Error {
  constructor(public field: string, message: string) {
    super(message);
  }
}

// RFC-5322-lite: one @, a dot in the domain, no spaces/controls, sane length.
const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24}$/;
const PHONE_RE = /^\+?[0-9 ()\-.]{6,20}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Control characters except tab/newline/carriage-return.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const DEFAULT_MAX: Record<string, number> = { text: 255, textarea: 32000, email: 254, phone: 30, url: 2000 };

export function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
}

function cleanString(v: unknown, max: number, field: string): string {
  if (typeof v !== 'string' && typeof v !== 'number') throw new FieldError(field, 'must be text');
  const s = String(v).replace(CONTROL_RE, '').trim();
  if (s.length > max) throw new FieldError(field, `must be at most ${max} characters`);
  return s;
}

function toNumber(v: unknown, field: string): number {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new FieldError(field, 'must be a number');
    return v;
  }
  if (typeof v === 'string') {
    const s = v.replace(/[,\s₹$€]/g, '');
    if (!/^-?\d+(\.\d+)?$/.test(s)) throw new FieldError(field, 'must be a number');
    const n = Number(s);
    if (!Number.isFinite(n)) throw new FieldError(field, 'must be a number');
    return n;
  }
  throw new FieldError(field, 'must be a number');
}

function validDate(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID_RE.test(v);
}

/**
 * Coerce a user-supplied value into the stored representation for `field`.
 * Returns null for empty input. Throws FieldError on invalid input.
 * Does NOT check `required`, permissions or uniqueness — the engine does.
 */
export function coerceValue(field: FieldDef, raw: unknown): unknown {
  const name = field.label || field.api_name;
  if (isEmpty(raw)) return null;
  const o = field.options ?? {};
  switch (field.type) {
    case 'text':
    case 'textarea': {
      const max = Math.min(o.maxLength ?? DEFAULT_MAX[field.type], DEFAULT_MAX[field.type]);
      return cleanString(raw, max, name);
    }
    case 'email': {
      const s = cleanString(raw, DEFAULT_MAX.email, name).toLowerCase();
      if (!EMAIL_RE.test(s)) throw new FieldError(name, 'is not a valid email address');
      return s;
    }
    case 'phone': {
      const s = cleanString(raw, DEFAULT_MAX.phone, name);
      if (!PHONE_RE.test(s)) throw new FieldError(name, 'is not a valid phone number');
      return s;
    }
    case 'url': {
      let s = cleanString(raw, DEFAULT_MAX.url, name);
      if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
      let u: URL;
      try {
        u = new URL(s);
      } catch {
        throw new FieldError(name, 'is not a valid link');
      }
      // Only web links. javascript:, data:, file: … would turn a stored value
      // into script when rendered as an <a href>.
      if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new FieldError(name, 'must be an http(s) link');
      return u.toString();
    }
    case 'integer': {
      const n = toNumber(raw, name);
      if (!Number.isInteger(n)) throw new FieldError(name, 'must be a whole number');
      if (Math.abs(n) > 9_007_199_254_740_991) throw new FieldError(name, 'is too large');
      checkRange(n, o, name);
      return n;
    }
    case 'decimal':
    case 'currency':
    case 'percent': {
      const n = toNumber(raw, name);
      if (Math.abs(n) > 1e15) throw new FieldError(name, 'is too large');
      checkRange(n, field.type === 'percent' ? { min: o.min ?? 0, max: o.max ?? 100 } : o, name);
      const p = o.precision ?? (field.type === 'decimal' ? 4 : 2);
      return Math.round(n * 10 ** p) / 10 ** p;
    }
    case 'date': {
      const s = typeof raw === 'string' ? raw.trim().slice(0, 10) : raw instanceof Date ? raw.toISOString().slice(0, 10) : '';
      if (!validDate(s)) throw new FieldError(name, 'must be a date (YYYY-MM-DD)');
      return s;
    }
    case 'datetime': {
      const d = raw instanceof Date ? raw : typeof raw === 'string' || typeof raw === 'number' ? new Date(raw) : new Date(NaN);
      if (Number.isNaN(d.getTime())) throw new FieldError(name, 'must be a date and time');
      const y = d.getUTCFullYear();
      if (y < 1900 || y > 2200) throw new FieldError(name, 'is out of range');
      return d.toISOString();
    }
    case 'boolean': {
      if (typeof raw === 'boolean') return raw;
      const s = String(raw).trim().toLowerCase();
      if (['true', 'yes', 'y', '1', 'on'].includes(s)) return true;
      if (['false', 'no', 'n', '0', 'off'].includes(s)) return false;
      throw new FieldError(name, 'must be yes or no');
    }
    case 'picklist': {
      const s = cleanString(raw, 255, name);
      const values = (o.picklist ?? []).map((p) => p.value);
      // Deal stages are validated against the pipeline by the engine.
      if (values.length && !values.includes(s)) {
        const ci = values.find((v) => v.toLowerCase() === s.toLowerCase());
        if (ci) return ci;
        throw new FieldError(name, `must be one of: ${values.slice(0, 12).join(', ')}`);
      }
      return s;
    }
    case 'multipicklist': {
      const arr = Array.isArray(raw) ? raw : String(raw).split(/[;,]/);
      const values = (o.picklist ?? []).map((p) => p.value);
      const out: string[] = [];
      for (const item of arr) {
        if (isEmpty(item)) continue;
        const s = cleanString(item, 255, name);
        const match = values.length ? values.find((v) => v.toLowerCase() === s.toLowerCase()) : s;
        if (!match) throw new FieldError(name, `"${s}" is not an allowed value`);
        if (!out.includes(match)) out.push(match);
      }
      if (out.length > 50) throw new FieldError(name, 'has too many values');
      return out.length ? out : null;
    }
    case 'lookup':
    case 'user': {
      if (!isUuid(raw)) throw new FieldError(name, 'must reference a record');
      return String(raw).toLowerCase();
    }
    case 'related': {
      if (typeof raw !== 'object' || raw === null) throw new FieldError(name, 'must reference a record');
      const r = raw as { module?: unknown; id?: unknown };
      const mods = o.modules ?? [];
      if (typeof r.module !== 'string' || !mods.includes(r.module)) throw new FieldError(name, 'has an unsupported module');
      if (!isUuid(r.id)) throw new FieldError(name, 'must reference a record');
      return { module: r.module, id: String(r.id).toLowerCase() };
    }
    case 'line_items':
      return coerceLineItems(raw, name, o.mode ?? 'sale');
    case 'autonumber':
    case 'formula':
    case 'rollup':
    case 'json':
      // engine-computed; user input is never accepted
      throw new FieldError(name, 'is calculated automatically');
    default:
      throw new FieldError(name, 'has an unknown type');
  }
}

function checkRange(n: number, o: { min?: number; max?: number }, name: string) {
  if (o.min !== undefined && n < o.min) throw new FieldError(name, `must be at least ${o.min}`);
  if (o.max !== undefined && n > o.max) throw new FieldError(name, `must be at most ${o.max}`);
}

// ---------------------------------------------------------------------------
// Line items
// ---------------------------------------------------------------------------

const MAX_LINES = 200;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function coerceLineItems(raw: unknown, name: string, mode: 'sale' | 'pricebook'): LineItem[] | null {
  if (!Array.isArray(raw)) throw new FieldError(name, 'must be a list of items');
  if (raw.length > MAX_LINES) throw new FieldError(name, `can have at most ${MAX_LINES} rows`);
  const out: LineItem[] = [];
  raw.forEach((row, i) => {
    if (!row || typeof row !== 'object') throw new FieldError(name, `row ${i + 1} is invalid`);
    const r = row as Record<string, unknown>;
    const productId = isEmpty(r.product_id) ? null : r.product_id;
    if (productId !== null && !isUuid(productId)) throw new FieldError(name, `row ${i + 1}: bad product`);
    const productName = isEmpty(r.product_name) ? '' : cleanString(r.product_name, 255, name);
    if (!productName && !productId) {
      // fully blank row: skip
      if (isEmpty(r.quantity) && isEmpty(r.list_price)) return;
      throw new FieldError(name, `row ${i + 1}: product name is required`);
    }
    const listPrice = isEmpty(r.list_price) ? 0 : toNumber(r.list_price, name);
    if (listPrice < 0 || listPrice > 1e12) throw new FieldError(name, `row ${i + 1}: price is out of range`);
    if (mode === 'pricebook') {
      out.push({ product_id: productId as string | null, product_name: productName, quantity: 1, list_price: round2(listPrice), discount: 0, tax_pct: 0 });
      return;
    }
    const qty = isEmpty(r.quantity) ? 1 : toNumber(r.quantity, name);
    if (qty <= 0 || qty > 1e6) throw new FieldError(name, `row ${i + 1}: quantity must be between 0 and 1,000,000`);
    const discount = isEmpty(r.discount) ? 0 : toNumber(r.discount, name);
    if (discount < 0 || discount > qty * listPrice + 1e-9) throw new FieldError(name, `row ${i + 1}: discount can't exceed the line amount`);
    const tax = isEmpty(r.tax_pct) ? 0 : toNumber(r.tax_pct, name);
    if (tax < 0 || tax > 100) throw new FieldError(name, `row ${i + 1}: tax must be 0–100%`);
    const description = isEmpty(r.description) ? undefined : cleanString(r.description, 1000, name);
    out.push({
      product_id: productId as string | null,
      product_name: productName,
      description,
      quantity: qty,
      list_price: round2(listPrice),
      discount: round2(discount),
      tax_pct: tax,
    });
  });
  return out.map((l) => ({ ...l, total: lineTotal(l) }));
}

export function lineTotal(l: LineItem): number {
  const net = l.quantity * l.list_price - l.discount;
  return round2(net + (net * l.tax_pct) / 100);
}

export function computeTotals(items: LineItem[] | null | undefined, adjustment = 0): LineTotals {
  let sub = 0;
  let disc = 0;
  let tax = 0;
  for (const l of items ?? []) {
    const gross = l.quantity * l.list_price;
    const net = gross - l.discount;
    sub += gross;
    disc += l.discount;
    tax += (net * l.tax_pct) / 100;
  }
  const adj = Number.isFinite(adjustment) ? adjustment : 0;
  return {
    sub_total: round2(sub),
    discount_total: round2(disc),
    tax_total: round2(tax),
    adjustment: round2(adj),
    grand_total: round2(sub - disc + tax + adj),
  };
}

// ---------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------

const SYMBOL: Record<string, string> = { INR: '₹', USD: '$', EUR: '€' };

export function formatMoney(n: unknown, currency = 'INR'): string {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '';
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return (SYMBOL[currency] ?? currency + ' ') + n.toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 });
}

export function formatValue(field: Pick<FieldDef, 'type' | 'options'> | undefined, v: unknown, currency?: string): string {
  if (v === null || v === undefined || v === '') return '';
  if (!field) return typeof v === 'object' ? JSON.stringify(v) : String(v);
  switch (field.type) {
    case 'currency':
      return formatMoney(v, currency);
    case 'percent':
      return typeof v === 'number' ? `${v}%` : String(v);
    case 'boolean':
      return v === true ? 'Yes' : v === false ? 'No' : '';
    case 'date':
      return typeof v === 'string' ? new Date(v + 'T00:00:00Z').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
    case 'datetime':
      return typeof v === 'string'
        ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
        : '';
    case 'multipicklist':
      return Array.isArray(v) ? v.join(', ') : String(v);
    case 'decimal':
      return typeof v === 'number' ? v.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : String(v);
    case 'integer':
      return typeof v === 'number' ? v.toLocaleString('en-IN') : String(v);
    case 'line_items':
      return Array.isArray(v) ? `${v.length} item${v.length === 1 ? '' : 's'}` : '';
    default:
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
}
