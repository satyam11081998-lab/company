/**
 * Reports, dashboards and forecasts (server half).
 *  - A report runs through queryAll with the viewer's context, so sharing and
 *    field security apply to every number; a report that reads a field the
 *    viewer can't see is refused, not silently blanked.
 *  - Saved reports/dashboards are crm_config rows (kind report / dashboard),
 *    private to their owner unless shared (shared needs manage_reports).
 *  - Forecasts: per period and owner, targets (kind forecast_target) vs closed
 *    won, commit, best case and pipeline from the deals' forecast categories.
 */
import { createServiceClient } from '@/lib/crm/server/svc';

import { isUuid } from '@/lib/crm/fields';
import { canSetup, fieldAccess } from '@/lib/crm/permissions';
import { cleanDashboard, cleanReport, measureLabel, reportFields, runSummary, type DashboardComponent, type ReportConfig } from '@/lib/crm/reports';
import { toCsv } from '@/lib/crm/csv';
import { formatValue } from '@/lib/crm/fields';
import type { CrmContext, CrmRecord, Criteria } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { loadMembers } from './members';
import { getModuleOrThrow, queryAll } from './records';
import type { Meta } from './meta';

function needView(ctx: CrmContext) {
  if (!canSetup(ctx, 'view_analytics') && !canSetup(ctx, 'manage_reports')) throw new CrmAccessError('You don’t have access to reports.');
}

export async function listReports(ctx: CrmContext, kind: 'report' | 'dashboard') {
  needView(ctx);
  const { data } = await createServiceClient().from('crm_config').select('id, name, module, config, shared, owner_id, updated_at').eq('kind', kind).order('name');
  return ((data ?? []) as Array<{ id: string; name: string; module: string | null; config: Record<string, unknown>; shared: boolean; owner_id: string | null; updated_at: string }>)
    .filter((r) => r.shared || r.owner_id === ctx.userId || ctx.superAdmin);
}

async function loadOne(ctx: CrmContext, kind: 'report' | 'dashboard', id: string) {
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const { data } = await createServiceClient().from('crm_config').select('id, name, module, config, shared, owner_id').eq('id', id).eq('kind', kind).maybeSingle();
  const r = data as { id: string; name: string; module: string | null; config: Record<string, unknown>; shared: boolean; owner_id: string | null } | null;
  if (!r || !(r.shared || r.owner_id === ctx.userId || ctx.superAdmin)) throw new CrmAccessError('Not found.');
  return r;
}

export async function saveReport(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; shared?: boolean; config: unknown }) {
  needView(ctx);
  const mod = getModuleOrThrow(meta, String((input.config as { module?: string })?.module ?? ''));
  let config: ReportConfig;
  try { config = cleanReport({ ...(input.config as object), module: mod.api_name }, meta.fields(mod.api_name)); } catch (e) { throw new CrmUserError((e as Error).message); }
  for (const f of reportFields(config)) if (fieldAccess(ctx, mod.api_name, f) === 'hidden') throw new CrmUserError('The report uses a field you can’t see.');
  return saveConfig(ctx, 'report', input, config as unknown as Record<string, unknown>, mod.api_name);
}

async function saveConfig(ctx: CrmContext, kind: 'report' | 'dashboard', input: { id?: string | null; name: string; shared?: boolean }, config: Record<string, unknown>, module: string | null) {
  const name = String(input.name ?? '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give it a name.');
  const shared = !!input.shared;
  if (shared && !canSetup(ctx, 'manage_reports')) throw new CrmAccessError('Only people who manage reports can share them.');
  const svc = createServiceClient();
  const now = new Date().toISOString();
  if (input.id) {
    const cur = await loadOne(ctx, kind, input.id);
    if (cur.owner_id !== ctx.userId && !canSetup(ctx, 'manage_reports')) throw new CrmAccessError('Only the owner can change this.');
    await svc.from('crm_config').update({ name, config, module, shared, updated_by: ctx.userId, updated_at: now }).eq('id', cur.id);
    return cur.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind, name, config, module, shared, owner_id: ctx.userId, created_by: ctx.userId }).select('id').single();
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: `${kind}_create`, module, meta: { name } });
  return (data as { id: string }).id;
}

export async function deleteReportOrDashboard(ctx: CrmContext, kind: 'report' | 'dashboard', id: string) {
  const cur = await loadOne(ctx, kind, id);
  if (cur.owner_id !== ctx.userId && !canSetup(ctx, 'manage_reports')) throw new CrmAccessError('Only the owner can delete this.');
  await createServiceClient().from('crm_config').delete().eq('id', cur.id);
}

export interface ReportResult {
  name: string;
  config: ReportConfig;
  rowsTotal: number;
  truncated: boolean;
  columns?: Array<{ api: string; label: string }>;
  rows?: Array<{ id: string; cells: string[] }>;
  summary?: ReturnType<typeof runSummary> & { measureLabels: string[]; groupLabel: string; group2Label?: string };
}

export async function runReportConfig(ctx: CrmContext, meta: Meta, config: ReportConfig, name = 'Report'): Promise<ReportResult> {
  needView(ctx);
  const mod = getModuleOrThrow(meta, config.module);
  for (const f of reportFields(config)) if (fieldAccess(ctx, mod.api_name, f) === 'hidden') throw new CrmUserError('This report uses a field you can’t see.');
  const { rows, truncated } = await queryAll(ctx, meta, mod.api_name, config.criteria, 50_000);
  const fields = meta.fields(mod.api_name);
  const label = (f: string) => fields.find((x) => x.api_name === f)?.label ?? ({ name: 'Name', owner_id: 'Owner', created_at: 'Created', updated_at: 'Modified', last_activity_at: 'Last activity', score: 'Score', tags: 'Tags' } as Record<string, string>)[f] ?? f;
  const members = await loadMembers();
  const owner = (id: unknown) => members.find((m) => m.id === id)?.name ?? (id ? 'Former user' : 'Unassigned');
  // a stage key can mean different things in different pipelines (closed_won = "Closed won" in B2C, "Renewed" in Renewals)
  const stageLabel = (pipeline: unknown, key: string) => meta.pipelines.find((p) => p.name === pipeline)?.config.stages.find((s) => s.key === key)?.label
    ?? meta.pipelines.flatMap((p) => p.config.stages).find((s) => s.key === key)?.label ?? key;
  const display = (rec: CrmRecord, f: string): string => {
    if (f === 'name') return rec.name;
    if (f === 'owner_id') return owner(rec.owner_id);
    if (['created_at', 'updated_at', 'last_activity_at'].includes(f)) return (rec as unknown as Record<string, string | null>)[f]?.slice(0, 10) ?? '';
    if (f === 'tags') return rec.tags.join(', ');
    if (f === 'score') return rec.score === null ? '' : String(rec.score);
    if (f === 'stage' && typeof rec.data.stage === 'string') return stageLabel(rec.data.pipeline, rec.data.stage);
    return formatValue(fields.find((x) => x.api_name === f), rec.data[f], String(rec.data.currency ?? 'INR'));
  };
  if (config.type === 'tabular') {
    const cols = (config.columns.length ? config.columns : ['name', 'owner_id', 'created_at']);
    const list = rows.slice(0, config.limit ?? 500);
    return { name, config, rowsTotal: rows.length, truncated, columns: cols.map((c) => ({ api: c, label: label(c) })), rows: list.map((r) => ({ id: r.id, cells: cols.map((c) => display(r, c)) })) };
  }
  const groupsByStage = config.groupBy?.field === 'stage' || config.groupBy2?.field === 'stage';
  const sum = runSummary(groupsByStage && mod.api_name === 'deals'
    ? rows.map((r) => (typeof r.data.stage === 'string' ? { ...r, data: { ...r.data, stage: stageLabel(r.data.pipeline, r.data.stage) } } : r))
    : rows, config);
  // owner ids → names for display (stages were labelled per pipeline above)
  const pretty = (g: string, field: string) => (field === 'owner_id' ? owner(g === '(none)' ? null : g) : g);
  sum.groups = sum.groups.map((g) => ({ ...g, key: pretty(g.key, config.groupBy!.field) }));
  if (sum.matrix && config.groupBy2) {
    const cells: Record<string, Record<string, number | null>> = {};
    const oldKeys = Object.keys(sum.matrix.cells);
    oldKeys.forEach((k) => { cells[pretty(k, config.groupBy!.field)] = Object.fromEntries(Object.entries(sum.matrix!.cells[k]).map(([c, v]) => [pretty(c, config.groupBy2!.field), v])); });
    sum.matrix = { cols: sum.matrix.cols.map((c) => pretty(c, config.groupBy2!.field)), cells };
  }
  return { name, config, rowsTotal: rows.length, truncated, summary: { ...sum, measureLabels: config.measures.map((m) => measureLabel(m, label)), groupLabel: label(config.groupBy!.field), group2Label: config.groupBy2 ? label(config.groupBy2.field) : undefined } };
}

export async function runSavedReport(ctx: CrmContext, meta: Meta, id: string) {
  const r = await loadOne(ctx, 'report', id);
  let config: ReportConfig;
  try { config = cleanReport(r.config, meta.fields(String(r.config.module ?? ''))); } catch (e) { throw new CrmUserError(`This report no longer matches the module’s fields: ${(e as Error).message}`); }
  return runReportConfig(ctx, meta, config, r.name);
}

export async function exportReportCsv(ctx: CrmContext, meta: Meta, config: ReportConfig) {
  const res = await runReportConfig(ctx, meta, config);
  const svc = createServiceClient();
  await audit(svc, { actor_id: ctx.userId, action: 'report_export', module: config.module, meta: { rows: res.rowsTotal } });
  if (res.rows && res.columns) return toCsv(res.columns.map((c) => c.label), res.rows.map((r) => r.cells));
  const s = res.summary!;
  if (s.matrix) return toCsv([s.groupLabel, ...s.matrix.cols], s.groups.map((g) => [g.key, ...s.matrix!.cols.map((c) => s.matrix!.cells[g.key]?.[c] ?? '')]));
  return toCsv([s.groupLabel, ...s.measureLabels], [...s.groups.map((g) => [g.key, ...g.values.map((v) => v ?? '')]), ['Total', ...s.totals.map((v) => v ?? '')]]);
}

// ---------------------------------------------------------------------------
// Dashboards
// ---------------------------------------------------------------------------

export async function saveDashboard(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; shared?: boolean; config: unknown }) {
  needView(ctx);
  const reports = await listReports(ctx, 'report');
  let cfg;
  try { cfg = cleanDashboard(input.config, (m) => meta.fields(m), (m) => !!meta.module(m), new Set(reports.map((r) => r.id))); } catch (e) { throw new CrmUserError((e as Error).message); }
  for (const c of cfg.components) {
    if (c.module && c.measure?.field && fieldAccess(ctx, c.module, c.measure.field) === 'hidden') throw new CrmUserError(`“${c.title}” uses a field you can’t see.`);
  }
  return saveConfig(ctx, 'dashboard', input, cfg as unknown as Record<string, unknown>, null);
}

async function kpiValue(ctx: CrmContext, meta: Meta, c: DashboardComponent, extra?: Criteria): Promise<number | null> {
  const crit: Criteria | null = c.criteria && extra ? { match: 'all', conditions: [c.criteria, extra] } : (c.criteria ?? extra ?? null);
  const { rows } = await queryAll(ctx, meta, c.module!, crit, 50_000);
  if (c.measure?.fn === 'count' || !c.measure?.field) return rows.length;
  const xs = rows.map((r) => Number(r.data[c.measure!.field!])).filter((x) => Number.isFinite(x));
  if (!xs.length) return null;
  const r2 = (x: number) => Math.round(x * 100) / 100;
  switch (c.measure.fn) {
    case 'sum': return r2(xs.reduce((a, b) => a + b, 0));
    case 'avg': return r2(xs.reduce((a, b) => a + b, 0) / xs.length);
    case 'min': return Math.min(...xs);
    case 'max': return Math.max(...xs);
  }
  return null;
}

export async function renderDashboard(ctx: CrmContext, meta: Meta, id: string) {
  const d = await loadOne(ctx, 'dashboard', id);
  const comps = ((d.config.components ?? []) as DashboardComponent[]);
  const out = [];
  for (const c of comps) {
    try {
      if (c.type === 'kpi' || c.type === 'target') {
        if (c.measure?.field && fieldAccess(ctx, c.module!, c.measure.field) === 'hidden') throw new CrmUserError('uses a field you can’t see');
        const value = await kpiValue(ctx, meta, c);
        let previous: number | null = null;
        if (c.compareDays) {
          // same measure over records created in the previous window vs the current one
          const cur = await kpiValue(ctx, meta, c, { match: 'all', conditions: [{ field: 'created_at', op: 'in_last_days', value: c.compareDays }] });
          const both = await kpiValue(ctx, meta, c, { match: 'all', conditions: [{ field: 'created_at', op: 'in_last_days', value: c.compareDays * 2 }] });
          previous = both !== null && cur !== null && c.measure?.fn !== 'avg' ? Math.round((both - cur) * 100) / 100 : null;
          out.push({ ...c, value: cur, previous });
          continue;
        }
        out.push({ ...c, value, previous });
      } else {
        const r = await runSavedReport(ctx, meta, c.reportId!);
        out.push({ ...c, report: r });
      }
    } catch (e) {
      out.push({ ...c, error: e instanceof CrmUserError || e instanceof CrmAccessError ? e.message : 'Could not load' });
    }
  }
  return { id: d.id, name: d.name, description: (d.config.description as string) ?? '', components: out };
}

/** Default reports + dashboards (seeded once, shared). */
export async function ensureDefaultReports(meta: Meta) {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'report').limit(1);
  if (data?.length) return;
  const defs: Array<{ name: string; config: Partial<ReportConfig> }> = [
    { name: 'Deals by stage (pipeline value)', config: { module: 'deals', type: 'summary', groupBy: { field: 'stage' }, measures: [{ fn: 'count' }, { fn: 'sum', field: 'amount' }], criteria: null, chart: 'funnel' } },
    { name: 'Revenue won by month', config: { module: 'deals', type: 'summary', groupBy: { field: 'closing_date', bucket: 'month' }, measures: [{ fn: 'sum', field: 'amount' }, { fn: 'count' }], criteria: { match: 'all', conditions: [{ field: 'stage', op: 'eq', value: 'closed_won' }, { field: 'currency', op: 'eq', value: 'INR' }] }, chart: 'line' } },
    { name: 'Leads by source and status', config: { module: 'leads', type: 'matrix', groupBy: { field: 'lead_source' }, groupBy2: { field: 'lead_status' }, measures: [{ fn: 'count' }], criteria: null, chart: 'bar' } },
    { name: 'New sign-ups by month', config: { module: 'contacts', type: 'summary', groupBy: { field: 'mece_signed_up_at', bucket: 'month' }, measures: [{ fn: 'count' }], criteria: { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }] }, chart: 'bar' } },
    { name: 'Open cases by priority', config: { module: 'cases', type: 'summary', groupBy: { field: 'priority' }, measures: [{ fn: 'count' }], criteria: { match: 'all', conditions: [{ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }] }, chart: 'pie' } },
    { name: 'Customers by plan and market', config: { module: 'contacts', type: 'matrix', groupBy: { field: 'mece_tier' }, groupBy2: { field: 'market' }, measures: [{ fn: 'count' }], criteria: { match: 'all', conditions: [{ field: 'mece_internal', op: 'neq', value: true }] }, chart: 'bar' } },
  ];
  const rows = defs.map((d) => ({ kind: 'report', name: d.name, module: d.config.module, shared: true, config: cleanReport(d.config, meta.fields(d.config.module!)) }));
  const { data: ins, error } = await svc.from('crm_config').insert(rows).select('id, name');
  if (error) { if (error.code === '23505') return; throw error; }
  const id = (n: string) => ((ins ?? []) as Array<{ id: string; name: string }>).find((r) => r.name === n)?.id;
  const dash = {
    description: 'MECE at a glance: pipeline, revenue, growth and service.',
    components: [
      { id: 'k1', type: 'kpi', title: 'Paying customers', module: 'contacts', criteria: { match: 'all', conditions: [{ field: 'mece_payments_count', op: 'gt', value: 0 }, { field: 'mece_internal', op: 'neq', value: true }] }, measure: { fn: 'count' } },
      { id: 'k2', type: 'kpi', title: 'Open pipeline (₹)', module: 'deals', criteria: { match: 'all', conditions: [{ field: 'stage', op: 'not_in', value: ['closed_won', 'closed_lost'] }, { field: 'currency', op: 'eq', value: 'INR' }] }, measure: { fn: 'sum', field: 'amount' } },
      { id: 'k3', type: 'kpi', title: 'New leads (30 days)', module: 'leads', criteria: { match: 'all', conditions: [{ field: 'created_at', op: 'in_last_days', value: 30 }] }, measure: { fn: 'count' }, compareDays: 30 },
      { id: 'k4', type: 'target', title: 'Revenue won this month vs ₹1,00,000', module: 'deals', criteria: { match: 'all', conditions: [{ field: 'stage', op: 'eq', value: 'closed_won' }, { field: 'closing_date', op: 'this_month' }, { field: 'currency', op: 'eq', value: 'INR' }] }, measure: { fn: 'sum', field: 'amount' }, target: 100000 },
      { id: 'c1', type: 'funnel', title: 'Pipeline by stage', reportId: id('Deals by stage (pipeline value)'), size: 2 },
      { id: 'c2', type: 'chart', title: 'Revenue won by month', reportId: id('Revenue won by month'), size: 2 },
      { id: 'c3', type: 'chart', title: 'Sign-ups by month', reportId: id('New sign-ups by month'), size: 2 },
      { id: 'c4', type: 'chart', title: 'Open cases by priority', reportId: id('Open cases by priority') },
    ].filter((c) => c.type === 'kpi' || c.type === 'target' || c.reportId),
  };
  await svc.from('crm_config').insert({ kind: 'dashboard', name: 'MECE overview', shared: true, config: dash });
}

// ---------------------------------------------------------------------------
// Forecasts
// ---------------------------------------------------------------------------

export function periodRange(period: string): { from: string; to: string; label: string } | null {
  const m = period.match(/^(\d{4})-(\d{2})$/);
  const q = period.match(/^(\d{4})-Q([1-4])$/);
  if (m) {
    const y = Number(m[1]); const mo = Number(m[2]) - 1;
    return { from: new Date(Date.UTC(y, mo, 1)).toISOString().slice(0, 10), to: new Date(Date.UTC(y, mo + 1, 0)).toISOString().slice(0, 10), label: new Date(Date.UTC(y, mo, 1)).toLocaleString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }) };
  }
  if (q) {
    // Indian financial-year quarters would be Apr–Mar; calendar quarters keep it simple and match Zoho's default
    const y = Number(q[1]); const s = (Number(q[2]) - 1) * 3;
    return { from: new Date(Date.UTC(y, s, 1)).toISOString().slice(0, 10), to: new Date(Date.UTC(y, s + 3, 0)).toISOString().slice(0, 10), label: `Q${q[2]} ${y}` };
  }
  return null;
}

export async function forecast(ctx: CrmContext, meta: Meta, period: string) {
  needView(ctx);
  const range = periodRange(period);
  if (!range) throw new CrmUserError('Pick a month (2026-10) or quarter (2026-Q4).');
  const { rows } = await queryAll(ctx, meta, 'deals', { match: 'all', conditions: [{ field: 'closing_date', op: 'between', value: range.from, value2: range.to }, { field: 'currency', op: 'eq', value: 'INR' }] }, 50_000);
  const members = await loadMembers();
  const svc = createServiceClient();
  const { data: tg } = await svc.from('crm_config').select('config').eq('kind', 'forecast_target').eq('name', period).maybeSingle();
  const targets = ((tg as { config?: { targets?: Record<string, number> } } | null)?.config?.targets ?? {}) as Record<string, number>;
  const byOwner = new Map<string, CrmRecord[]>();
  for (const d of rows) byOwner.set(d.owner_id ?? 'none', [...(byOwner.get(d.owner_id ?? 'none') ?? []), d]);
  const ids = new Set<string>([...byOwner.keys(), ...Object.keys(targets)]);
  const amt = (d: CrmRecord) => (typeof d.data.amount === 'number' ? d.data.amount : 0);
  const sumIf = (list: CrmRecord[], f: (d: CrmRecord) => boolean) => Math.round(list.filter(f).reduce((a, d) => a + amt(d), 0));
  // forecast category from the record, else from its pipeline stage (older synced rows)
  const stageCat = (d: CrmRecord) => meta.pipelines.find((pl) => pl.name === d.data.pipeline)?.config.stages.find((x) => x.key === d.data.stage)?.forecast;
  const stageProb = (d: CrmRecord) => meta.pipelines.find((pl) => pl.name === d.data.pipeline)?.config.stages.find((x) => x.key === d.data.stage)?.probability;
  const cat = (d: CrmRecord) => String(d.data.forecast_category ?? stageCat(d) ?? 'Pipeline');
  const lines = [...ids].map((uid) => {
    const list = byOwner.get(uid) ?? [];
    const won = sumIf(list, (d) => cat(d) === 'Closed Won');
    const commit = sumIf(list, (d) => cat(d) === 'Commit');
    const best = sumIf(list, (d) => cat(d) === 'Best Case');
    const pipeline = sumIf(list, (d) => cat(d) === 'Pipeline');
    const weighted = Math.round(list.filter((d) => !['Closed Won', 'Omitted'].includes(cat(d))).reduce((a, d) => a + amt(d) * ((typeof d.data.probability === 'number' ? d.data.probability : stageProb(d) ?? 0) / 100), 0));
    const target = Number(targets[uid] ?? 0) || 0;
    return {
      ownerId: uid === 'none' ? null : uid, owner: uid === 'none' ? 'Unassigned' : members.find((m) => m.id === uid)?.name ?? 'Former user',
      target, won, commit, bestCase: best, pipeline, weighted, deals: list.length,
      projected: won + commit, gap: target ? won + commit - target : null, attainmentPct: target ? Math.round((won / target) * 1000) / 10 : null,
    };
  }).sort((a, b) => b.won - a.won);
  const total = lines.reduce((a, l) => ({ target: a.target + l.target, won: a.won + l.won, commit: a.commit + l.commit, bestCase: a.bestCase + l.bestCase, pipeline: a.pipeline + l.pipeline, weighted: a.weighted + l.weighted }), { target: 0, won: 0, commit: 0, bestCase: 0, pipeline: 0, weighted: 0 });
  return { period, range, lines, total, canSetTargets: canSetup(ctx, 'manage_reports') };
}

export async function setTargets(ctx: CrmContext, period: string, targets: Record<string, number>) {
  if (!canSetup(ctx, 'manage_reports')) throw new CrmAccessError('Only people who manage reports can set targets.');
  if (!periodRange(period)) throw new CrmUserError('Bad period.');
  const members = new Set((await loadMembers()).map((m) => m.id));
  const clean: Record<string, number> = {};
  for (const [k, v] of Object.entries(targets ?? {})) if (members.has(k) && Number.isFinite(Number(v)) && Number(v) >= 0) clean[k] = Math.round(Number(v));
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'forecast_target').eq('name', period).maybeSingle();
  if (data) await svc.from('crm_config').update({ config: { targets: clean }, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', (data as { id: string }).id);
  else await svc.from('crm_config').insert({ kind: 'forecast_target', name: period, config: { targets: clean }, created_by: ctx.userId });
  await audit(svc, { actor_id: ctx.userId, action: 'forecast_targets', meta: { period, users: Object.keys(clean).length } });
}


