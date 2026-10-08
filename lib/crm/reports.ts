/**
 * Reports (Zoho: tabular, summary, matrix) — pure. The server fetches the rows
 * the user may see (sharing + field security) and this file groups and
 * aggregates them, so a report can never total records the user can't see.
 */
import { getValue, validateCriteria } from './criteria';
import type { Criteria, CrmRecord, FieldDef } from './types';
import { RECORD_COLUMNS } from './types';

export type Agg = 'count' | 'sum' | 'avg' | 'min' | 'max';
export type Bucket = 'day' | 'week' | 'month' | 'quarter' | 'year';
export interface Grouping { field: string; bucket?: Bucket }
export interface Measure { fn: Agg; field?: string }

export interface ReportConfig {
  module: string;
  type: 'tabular' | 'summary' | 'matrix';
  columns: string[];
  criteria: Criteria | null;
  groupBy?: Grouping | null;
  groupBy2?: Grouping | null;
  measures: Measure[];
  sort?: { by: 'group' | 'value'; dir: 'asc' | 'desc' };
  limit?: number;
  chart?: 'bar' | 'line' | 'pie' | 'funnel' | 'none';
  description?: string;
}

const NUMERIC = new Set(['integer', 'decimal', 'currency', 'percent', 'rollup', 'formula']);
const DATE = new Set(['date', 'datetime']);

export function cleanReport(raw: unknown, fields: FieldDef[]): ReportConfig {
  const r = (raw ?? {}) as Partial<ReportConfig>;
  const known = new Map<string, FieldDef | undefined>([...RECORD_COLUMNS.map((c) => [c, undefined] as const), ...fields.map((f) => [f.api_name, f] as const)]);
  const has = (f: unknown): f is string => typeof f === 'string' && known.has(f);
  const type = r.type === 'summary' || r.type === 'matrix' ? r.type : 'tabular';
  const grouping = (g: unknown): Grouping | null => {
    const x = (g ?? null) as Partial<Grouping> | null;
    if (!x || !has(x.field)) return null;
    const def = known.get(x.field);
    const isDate = x.field === 'created_at' || x.field === 'updated_at' || x.field === 'last_activity_at' || (def && DATE.has(def.type));
    return { field: x.field, bucket: isDate ? (['day', 'week', 'month', 'quarter', 'year'].includes(String(x.bucket)) ? x.bucket : 'month') : undefined };
  };
  const measures = (Array.isArray(r.measures) ? r.measures : []).slice(0, 4).map((m) => {
    const fn = (['count', 'sum', 'avg', 'min', 'max'] as const).includes(m?.fn as Agg) ? m.fn : 'count';
    if (fn === 'count') return { fn } as Measure;
    const def = has(m.field) ? known.get(m.field) : undefined;
    if (!def || !NUMERIC.has(def.type)) throw new Error(`“${m.field}” is not a number field.`);
    return { fn, field: m.field } as Measure;
  });
  const groupBy = type === 'tabular' ? null : grouping(r.groupBy);
  if (type !== 'tabular' && !groupBy) throw new Error('Pick a field to group by.');
  const groupBy2 = type === 'matrix' ? grouping(r.groupBy2) : null;
  if (type === 'matrix' && !groupBy2) throw new Error('A matrix needs a second grouping.');
  return {
    module: String(r.module ?? ''),
    type,
    columns: (Array.isArray(r.columns) ? r.columns : []).filter(has).slice(0, 15),
    criteria: r.criteria ? validateCriteria(r.criteria, fields) : null,
    groupBy, groupBy2,
    measures: measures.length ? measures : [{ fn: 'count' }],
    sort: r.sort && (r.sort.by === 'value' || r.sort.by === 'group') ? { by: r.sort.by, dir: r.sort.dir === 'asc' ? 'asc' : 'desc' } : { by: 'group', dir: 'asc' },
    limit: Math.min(Math.max(Number(r.limit) || 0, 0), 500) || undefined,
    chart: ['bar', 'line', 'pie', 'funnel', 'none'].includes(String(r.chart)) ? r.chart : type === 'tabular' ? 'none' : 'bar',
    description: typeof r.description === 'string' ? r.description.slice(0, 300) : undefined,
  };
}

/** All fields a report reads (for the hidden-field check). */
export function reportFields(c: ReportConfig): string[] {
  const out = new Set<string>(c.columns);
  if (c.groupBy) out.add(c.groupBy.field);
  if (c.groupBy2) out.add(c.groupBy2.field);
  for (const m of c.measures) if (m.field) out.add(m.field);
  return [...out];
}

function bucketKey(v: unknown, b: Bucket): string | null {
  if (typeof v !== 'string' || !v) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00:00+05:30` : v);
  if (!Number.isFinite(d.getTime())) return null;
  const ist = new Date(d.getTime() + 330 * 60_000);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  switch (b) {
    case 'day': return ist.toISOString().slice(0, 10);
    case 'week': { const day = (ist.getUTCDay() + 6) % 7; const mon = new Date(Date.UTC(y, m, ist.getUTCDate() - day)); return `wk ${mon.toISOString().slice(0, 10)}`; }
    case 'month': return `${y}-${String(m + 1).padStart(2, '0')}`;
    case 'quarter': return `${y}-Q${Math.floor(m / 3) + 1}`;
    case 'year': return String(y);
  }
}

export function groupKey(rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, g: Grouping): string {
  const v = getValue(rec, g.field);
  if (g.bucket) return bucketKey(v, g.bucket) ?? '(none)';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '(none)';
  return v === null || v === undefined || v === '' ? '(none)' : String(v);
}

function aggregate(rows: Array<Pick<CrmRecord, 'data'> & Partial<CrmRecord>>, m: Measure): number | null {
  if (m.fn === 'count') return rows.length;
  const xs = rows.map((r) => getValue(r, m.field!)).map((v) => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : NaN)).filter((x) => Number.isFinite(x));
  if (!xs.length) return null;
  const r2 = (x: number) => Math.round(x * 100) / 100;
  switch (m.fn) {
    case 'sum': return r2(xs.reduce((a, b) => a + b, 0));
    case 'avg': return r2(xs.reduce((a, b) => a + b, 0) / xs.length);
    case 'min': return Math.min(...xs);
    case 'max': return Math.max(...xs);
  }
  return null;
}

export const measureLabel = (m: Measure, label: (f: string) => string) => (m.fn === 'count' ? 'Count' : `${m.fn === 'avg' ? 'Average' : m.fn[0].toUpperCase() + m.fn.slice(1)} of ${label(m.field!)}`);

export interface SummaryResult {
  groups: Array<{ key: string; values: Array<number | null>; count: number }>;
  totals: Array<number | null>;
  matrix?: { cols: string[]; cells: Record<string, Record<string, number | null>> };
}

export function runSummary(rows: Array<Pick<CrmRecord, 'data'> & Partial<CrmRecord>>, c: ReportConfig): SummaryResult {
  const g1 = c.groupBy!;
  const by = new Map<string, typeof rows>();
  for (const r of rows) { const k = groupKey(r, g1); by.set(k, [...(by.get(k) ?? []), r]); }
  let groups = [...by.entries()].map(([key, list]) => ({ key, values: c.measures.map((m) => aggregate(list, m)), count: list.length }));
  const dir = c.sort?.dir === 'asc' ? 1 : -1;
  if (c.sort?.by === 'value') groups.sort((a, b) => ((a.values[0] ?? -Infinity) - (b.values[0] ?? -Infinity)) * dir);
  else groups.sort((a, b) => (a.key === '(none)' ? 1 : b.key === '(none)' ? -1 : a.key.localeCompare(b.key, 'en', { numeric: true }) * (c.sort?.dir === 'desc' && !g1.bucket ? -1 : 1)));
  if (c.limit) groups = groups.slice(0, c.limit);
  const out: SummaryResult = { groups, totals: c.measures.map((m) => aggregate(rows, m)) };
  if (c.type === 'matrix' && c.groupBy2) {
    const cols = [...new Set(rows.map((r) => groupKey(r, c.groupBy2!)))].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    const cells: Record<string, Record<string, number | null>> = {};
    for (const g of groups) {
      const list = by.get(g.key) ?? [];
      cells[g.key] = {};
      for (const col of cols) cells[g.key][col] = aggregate(list.filter((r) => groupKey(r, c.groupBy2!) === col), c.measures[0]);
    }
    out.matrix = { cols, cells };
  }
  return out;
}

export interface DashboardComponent {
  id: string;
  type: 'kpi' | 'target' | 'chart' | 'table' | 'funnel';
  title: string;
  reportId?: string;
  /** kpi / target: one number from a module */
  module?: string;
  criteria?: Criteria | null;
  measure?: Measure;
  target?: number;
  /** compare with the previous period of this length (days) */
  compareDays?: number;
  size?: 1 | 2 | 3;
}

export function cleanDashboard(raw: unknown, fieldsOf: (m: string) => FieldDef[], hasModule: (m: string) => boolean, reportIds: Set<string>): { components: DashboardComponent[]; description?: string } {
  const r = (raw ?? {}) as { components?: unknown[]; description?: string };
  const components = (Array.isArray(r.components) ? r.components : []).slice(0, 20).map((x, i) => {
    const c = (x ?? {}) as Partial<DashboardComponent>;
    const type = (['kpi', 'target', 'chart', 'table', 'funnel'] as const).includes(c.type as never) ? c.type! : 'kpi';
    const title = String(c.title ?? '').slice(0, 80) || `Component ${i + 1}`;
    const base: DashboardComponent = { id: typeof c.id === 'string' && /^[a-z0-9_-]{1,30}$/i.test(c.id) ? c.id : `c${i + 1}`, type, title, size: c.size === 2 || c.size === 3 ? c.size : 1 };
    if (type === 'kpi' || type === 'target') {
      if (!c.module || !hasModule(c.module)) throw new Error(`“${title}”: pick a module.`);
      const fields = fieldsOf(c.module);
      const fn = (['count', 'sum', 'avg', 'min', 'max'] as const).includes(c.measure?.fn as Agg) ? c.measure!.fn : 'count';
      const fld = fn === 'count' ? undefined : fields.find((f) => f.api_name === c.measure?.field && NUMERIC.has(f.type))?.api_name;
      if (fn !== 'count' && !fld) throw new Error(`“${title}”: pick a number field.`);
      return { ...base, module: c.module, criteria: c.criteria ? validateCriteria(c.criteria, fields) : null, measure: { fn, field: fld }, target: type === 'target' ? Math.max(0, Number(c.target) || 0) : undefined, compareDays: [7, 30, 90].includes(Number(c.compareDays)) ? Number(c.compareDays) : undefined };
    }
    if (!c.reportId || !reportIds.has(c.reportId)) throw new Error(`“${title}”: pick a report.`);
    return { ...base, reportId: c.reportId };
  });
  return { components, description: typeof r.description === 'string' ? r.description.slice(0, 300) : undefined };
}
