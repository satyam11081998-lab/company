/**
 * CRM home: the numbers a founder checks every morning, all through the
 * same permission-aware list path (a rep sees their own world).
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { can } from '@/lib/crm/permissions';
import type { Criteria, CrmContext, CrmRecord } from '@/lib/crm/types';
import { listRecords, queryAll } from './records';
import type { Meta } from './meta';

const all = (...conditions: Criteria['conditions']): Criteria => ({ match: 'all', conditions });

async function count(ctx: CrmContext, meta: Meta, module: string, criteria: Criteria | null, mine = false) {
  if (!meta.module(module) || !can(ctx, module, 'view')) return null;
  try {
    return (await listRecords(ctx, meta, module, { criteria, pageSize: 1, mine })).total;
  } catch {
    return null;
  }
}

export interface HomeData {
  kpis: Array<{ label: string; value: string; hint?: string; href?: string }>;
  pipelines: Array<{ name: string; open: number; openValue: number; wonMonth: number; wonMonthValue: number }>;
  tasks: CrmRecord[];
  lastSync: { at: string | null; error: string | null; stats: Record<string, unknown> | null };
}

export async function homeData(ctx: CrmContext, meta: Meta): Promise<HomeData> {
  const [newLeads, openLeads, paying, lapsed, activatedFree, openCases, breached, expiring] = await Promise.all([
    count(ctx, meta, 'leads', all({ field: 'created_at', op: 'in_last_days', value: 7 })),
    count(ctx, meta, 'leads', all({ field: 'lead_status', op: 'not_in', value: ['Converted', 'Unqualified', 'Closed - lost'] })),
    count(ctx, meta, 'contacts', all({ field: 'lifecycle_stage', op: 'eq', value: 'Paying' })),
    count(ctx, meta, 'contacts', all({ field: 'lifecycle_stage', op: 'eq', value: 'Lapsed' })),
    count(ctx, meta, 'contacts', all({ field: 'lifecycle_stage', op: 'eq', value: 'Activated' })),
    count(ctx, meta, 'cases', all({ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] })),
    count(ctx, meta, 'cases', all({ field: 'status', op: 'not_in', value: ['Resolved', 'Closed'] }, { field: 'sla_due_at', op: 'older_than_days', value: 0 })),
    count(ctx, meta, 'contacts', all({ field: 'mece_tier_expires_at', op: 'in_next_days', value: 14 })),
  ]);
  const kpis: HomeData['kpis'] = [];
  const add = (label: string, v: number | null, href: string, hint?: string) => { if (v !== null) kpis.push({ label, value: v.toLocaleString('en-IN'), href, hint }); };
  add('New leads (7 days)', newLeads, '/crm/m/leads?view=recent');
  add('Open leads', openLeads, '/crm/m/leads?view=open');
  add('Paying customers', paying, '/crm/m/contacts?view=paying');
  add('Plans expiring in 14 days', expiring, '/crm/m/contacts?view=expiring', 'renewal pipeline');
  add('Lapsed (win-back)', lapsed, '/crm/m/contacts?view=lapsed');
  add('Active free users', activatedFree, '/crm/m/contacts?view=activated_free', 'upsell candidates');
  add('Open cases', openCases, '/crm/m/cases?view=open');
  add('SLA breached', breached, '/crm/m/cases?view=sla_breached');

  const pipelines: HomeData['pipelines'] = [];
  if (can(ctx, 'deals', 'view')) {
    const { rows } = await queryAll(ctx, meta, 'deals', all({ field: 'internal_test', op: 'neq', value: true }), 20_000);
    const now = new Date(Date.now() + 330 * 60_000);
    const ym = now.toISOString().slice(0, 7);
    for (const p of meta.pipelines.filter((x) => x.active)) {
      const mine = rows.filter((r) => r.data.pipeline === p.name);
      const stage = (r: CrmRecord) => p.config.stages.find((s) => s.key === r.data.stage);
      const open = mine.filter((r) => stage(r)?.state === 'open');
      const won = mine.filter((r) => stage(r)?.state === 'won' && String(r.data.closing_date ?? '').startsWith(ym));
      const inr = (r: CrmRecord) => ((r.data.currency ?? 'INR') === 'INR' && typeof r.data.amount === 'number' ? (r.data.amount as number) : 0);
      pipelines.push({ name: p.name, open: open.length, openValue: open.reduce((n, r) => n + inr(r), 0), wonMonth: won.length, wonMonthValue: won.reduce((n, r) => n + inr(r), 0) });
    }
  }

  let tasks: CrmRecord[] = [];
  if (can(ctx, 'tasks', 'view')) {
    tasks = (await listRecords(ctx, meta, 'tasks', { criteria: all({ field: 'status', op: 'neq', value: 'Completed' }), mine: true, sort: { field: 'due_date', dir: 'asc' }, pageSize: 8 })).rows;
  }

  const svc = createServiceClient();
  const { data: run } = await svc.from('crm_sync_runs').select('finished_at, started_at, error, stats').order('started_at', { ascending: false }).limit(1).maybeSingle();
  const r = run as { finished_at: string | null; started_at: string; error: string | null; stats: Record<string, unknown> } | null;
  return { kpis, pipelines, tasks, lastSync: { at: r?.finished_at ?? r?.started_at ?? null, error: r?.error ?? null, stats: r?.stats ?? null } };
}
