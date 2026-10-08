/**
 * Customer service: SLA policy, case stamps, escalation, the service
 * dashboard, and the knowledge base (Solutions).
 *
 *  - Case stamps (sla_due_at, first_response_at, resolved_at) are applied in
 *    the save path (automation.beforeSave → caseStamps), so they are right on
 *    every write, from the UI, import, web-to-case or sync.
 *  - Escalation runs from the scheduler: an open case past its SLA is marked
 *    escalated, moved to "Escalated", and its owner and the owner's managers
 *    are notified. Once per case.
 *  - CSAT after resolution is optional (service settings) and, like every
 *    customer email, waits in the Outbox for approval.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { canSetup, can, ancestors } from '@/lib/crm/permissions';
import { caseStamps, cleanSla, DEFAULT_SLA, isClosedCase, type SlaPolicy } from '@/lib/crm/sla';
import { summarize } from '@/lib/crm/surveys';
import { isUuid } from '@/lib/crm/fields';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, ilikeEscape, normalizeRecord } from './db';
import { notify, queryAll, updateRecord } from './records';
import type { Meta } from './meta';

export interface ServiceSettings {
  csatOnResolve: boolean;
  csatSurveyId: string | null;
}

export async function loadSla(svc: SupabaseClient = createServiceClient()): Promise<SlaPolicy> {
  const { data } = await svc.from('crm_settings').select('value').eq('key', 'service.sla').maybeSingle();
  return data ? cleanSla((data as { value: unknown }).value) : DEFAULT_SLA;
}

export async function loadServiceSettings(svc: SupabaseClient = createServiceClient()): Promise<ServiceSettings> {
  const { data } = await svc.from('crm_settings').select('value').eq('key', 'service.settings').maybeSingle();
  const v = ((data as { value?: Partial<ServiceSettings> } | null)?.value ?? {}) as Partial<ServiceSettings>;
  return { csatOnResolve: !!v.csatOnResolve, csatSurveyId: isUuid(v.csatSurveyId) ? v.csatSurveyId : null };
}

export async function saveServiceConfig(ctx: CrmContext, input: { sla?: unknown; settings?: Partial<ServiceSettings> }) {
  if (!canSetup(ctx, 'manage_setup')) throw new CrmAccessError('You don’t have permission for service settings.');
  const svc = createServiceClient();
  const now = new Date().toISOString();
  if (input.sla !== undefined) {
    const sla = cleanSla(input.sla);
    if (!sla.hours.days.length && !sla.hours.twentyFourSeven) throw new CrmUserError('Pick at least one working day, or switch on 24×7.');
    await svc.from('crm_settings').upsert({ key: 'service.sla', value: sla, updated_at: now, updated_by: ctx.userId });
  }
  if (input.settings) {
    const s = input.settings;
    let surveyId: string | null = null;
    if (s.csatSurveyId) {
      if (!isUuid(s.csatSurveyId)) throw new CrmUserError('Pick a survey.');
      const { data } = await svc.from('crm_config').select('id').eq('id', s.csatSurveyId).eq('kind', 'survey').maybeSingle();
      if (!data) throw new CrmUserError('That survey no longer exists.');
      surveyId = s.csatSurveyId;
    }
    if (s.csatOnResolve && !surveyId) throw new CrmUserError('Pick which survey to send when a case is resolved.');
    await svc.from('crm_settings').upsert({ key: 'service.settings', value: { csatOnResolve: !!s.csatOnResolve, csatSurveyId: surveyId }, updated_at: now, updated_by: ctx.userId });
  }
  await audit(svc, { actor_id: ctx.userId, action: 'service_settings', meta: { sla: input.sla !== undefined, settings: !!input.settings } });
}

/** Managers of a user: CRM users whose role is an ancestor of this user's role. */
async function managersOf(svc: SupabaseClient, userId: string): Promise<string[]> {
  const [{ data: me }, { data: roles }, { data: users }] = await Promise.all([
    svc.from('crm_users').select('role_id').eq('user_id', userId).maybeSingle(),
    svc.from('crm_config').select('id, config').eq('kind', 'role'),
    svc.from('crm_users').select('user_id, role_id, active').eq('active', true),
  ]);
  const roleId = (me as { role_id?: string | null } | null)?.role_id;
  if (!roleId) return [];
  const parents: Record<string, string | null> = {};
  for (const r of (roles ?? []) as Array<{ id: string; config: { parentId?: string | null } }>) parents[r.id] = r.config?.parentId ?? null;
  const up = ancestors(parents, roleId);
  return ((users ?? []) as Array<{ user_id: string; role_id: string | null }>).filter((u) => u.role_id && up.includes(u.role_id)).map((u) => u.user_id);
}

/**
 * Cases written by MECE sync (in-app problem reports) bypass the save path,
 * so they arrive without SLA stamps. Stamp every open case that has none.
 */
export async function stampMissingSla(svc: SupabaseClient): Promise<number> {
  const policy = await loadSla(svc);
  const { rows } = await fetchAll<{ id: string; created_at: string; data: Record<string, unknown> }>(
    (o) => svc.from('crm_records').select('id, created_at, data', o).eq('module', 'cases').is('deleted_at', null).is('data->>sla_due_at', null).order('id'),
    5000,
  );
  const patch = rows
    .filter((r) => !isClosedCase(r.data?.status))
    .map((r) => ({ id: r.id, data: caseStamps(null, r.data ?? {}, new Date(r.created_at), policy) }))
    .filter((p) => Object.keys(p.data).length);
  for (let i = 0; i < patch.length; i += 500) await svc.rpc('crm_merge_data', { p_rows: patch.slice(i, i + 500) });
  return patch.length;
}

/** Mark overdue open cases escalated (once each) and notify. Returns how many. */
export async function escalateOverdue(svc: SupabaseClient, meta: Meta, max = 50): Promise<number> {
  const nowIso = new Date().toISOString();
  const { rows } = await fetchAll<Record<string, unknown>>(
    (o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', 'cases').is('deleted_at', null).is('merged_into', null)
      .lt('data->>sla_due_at', nowIso).not('data->>sla_due_at', 'is', null).order('id'),
    5000,
  );
  let n = 0;
  for (const rec of rows.map(normalizeRecord)) {
    if (isClosedCase(rec.data.status) || rec.data.escalated === true) continue;
    if (n >= max) break; // the next tick picks up the rest
    const patch: Record<string, unknown> = { escalated: true };
    if (['New', 'Open', 'In progress'].includes(String(rec.data.status ?? ''))) patch.status = 'Escalated';
    try {
      await updateRecord(null, meta, 'cases', rec.id, patch, { actorKind: 'system', source: 'automation', allowSystem: ['escalated'], allowSynced: true, skipAutomation: false, depth: 1 });
    } catch (e) {
      console.error('[crm] escalation failed for', rec.id, e);
      continue;
    }
    n++;
    const title = `SLA breached: ${String(rec.data.case_number ?? '')} ${rec.name}`.trim();
    const link = `/crm/m/cases/${rec.id}`;
    const recipients = new Set<string>();
    if (rec.owner_id) {
      recipients.add(rec.owner_id);
      for (const m of await managersOf(svc, rec.owner_id)) recipients.add(m);
    } else {
      const { data: admins } = await svc.from('users').select('id').eq('is_admin', true).limit(20);
      for (const a of (admins ?? []) as Array<{ id: string }>) recipients.add(a.id);
    }
    for (const u of recipients) await notify(svc, u, 'sla', title, `Priority ${String(rec.data.priority ?? 'Medium')} · was due ${new Date(String(rec.data.sla_due_at)).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, link);
  }
  if (n) await audit(svc, { actor_id: null, actor_kind: 'system', action: 'sla_escalate', module: 'cases', meta: { escalated: n } });
  return n;
}

// ---------------------------------------------------------------------------
// Service dashboard
// ---------------------------------------------------------------------------

const hoursBetween = (a: unknown, b: unknown) => {
  const x = new Date(String(a)).getTime();
  const y = new Date(String(b)).getTime();
  return Number.isFinite(x) && Number.isFinite(y) && y >= x ? (y - x) / 3_600_000 : null;
};
const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return Math.round((s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) * 10) / 10;
};

export async function serviceDashboard(ctx: CrmContext, meta: Meta) {
  if (!can(ctx, 'cases', 'view')) throw new CrmAccessError();
  const { rows } = await queryAll(ctx, meta, 'cases', null, 20_000);
  const now = Date.now();
  const open = rows.filter((r) => !isClosedCase(r.data.status));
  const overdue = open.filter((r) => r.data.sla_due_at && new Date(String(r.data.sla_due_at)).getTime() < now);
  const dueSoon = open.filter((r) => {
    const t = new Date(String(r.data.sla_due_at ?? '')).getTime();
    return Number.isFinite(t) && t >= now && t - now < 4 * 3_600_000;
  });
  const since = now - 30 * 86_400_000;
  const recent = rows.filter((r) => new Date(r.created_at).getTime() >= since);
  const resolved30 = rows.filter((r) => r.data.resolved_at && new Date(String(r.data.resolved_at)).getTime() >= since);
  const frt = recent.map((r) => hoursBetween(r.created_at, r.data.first_response_at)).filter((x): x is number => x !== null);
  const ttr = resolved30.map((r) => hoursBetween(r.created_at, r.data.resolved_at)).filter((x): x is number => x !== null);
  const metSla = resolved30.filter((r) => r.data.sla_due_at && new Date(String(r.data.resolved_at)).getTime() <= new Date(String(r.data.sla_due_at)).getTime()).length;
  const count = (list: CrmRecord[], f: string) => {
    const m: Record<string, number> = {};
    for (const r of list) { const k = String(r.data[f] ?? '—'); m[k] = (m[k] ?? 0) + 1; }
    return m;
  };
  const csatScores = rows.map((r) => r.data.csat_score).filter((x): x is number => typeof x === 'number');
  const byDay = new Map<string, { opened: number; resolved: number }>();
  for (let i = 13; i >= 0; i--) byDay.set(new Date(now - i * 86_400_000 + 330 * 60_000).toISOString().slice(0, 10), { opened: 0, resolved: 0 });
  for (const r of rows) {
    const o = new Date(new Date(r.created_at).getTime() + 330 * 60_000).toISOString().slice(0, 10);
    if (byDay.has(o)) byDay.get(o)!.opened++;
    if (r.data.resolved_at) {
      const d = new Date(new Date(String(r.data.resolved_at)).getTime() + 330 * 60_000).toISOString().slice(0, 10);
      if (byDay.has(d)) byDay.get(d)!.resolved++;
    }
  }
  return {
    total: rows.length,
    open: open.length,
    overdue: overdue.map((r) => ({ id: r.id, name: r.name, number: String(r.data.case_number ?? ''), priority: String(r.data.priority ?? ''), due: String(r.data.sla_due_at), owner: r.owner_id })).slice(0, 50),
    overdueCount: overdue.length,
    dueSoon: dueSoon.length,
    byStatus: count(open, 'status'),
    byPriority: count(open, 'priority'),
    byOrigin: count(recent, 'case_origin'),
    byType: count(recent, 'type'),
    medianFirstResponseH: median(frt),
    medianResolutionH: median(ttr),
    slaMetPct: resolved30.length ? Math.round((metSla / resolved30.length) * 1000) / 10 : null,
    resolved30: resolved30.length,
    csat: summarize('csat', csatScores),
    trend: [...byDay.entries()].map(([day, v]) => ({ day, ...v })),
  };
}

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------

export async function searchSolutions(ctx: CrmContext, term: string, opts: { publishedOnly?: boolean } = {}) {
  if (!can(ctx, 'solutions', 'view')) throw new CrmAccessError();
  const svc = createServiceClient();
  const t = String(term ?? '').replace(/[,()"'\\*:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  let qb = svc.from('crm_records').select('id, name, data, updated_at').eq('module', 'solutions').is('deleted_at', null);
  if (opts.publishedOnly !== false) qb = qb.eq('data->>status', 'Published');
  if (t) {
    const pat = `%${ilikeEscape(t)}%`;
    qb = qb.or(`name.ilike.${pat},data->>question.ilike.${pat},data->>answer.ilike.${pat},data->>category.ilike.${pat}`);
  }
  const { data } = await qb.order('updated_at', { ascending: false }).limit(30);
  return ((data ?? []) as Array<{ id: string; name: string; data: Record<string, unknown>; updated_at: string }>).map((r) => ({
    id: r.id, title: r.name, category: String(r.data.category ?? ''), status: String(r.data.status ?? ''),
    question: String(r.data.question ?? ''), answer: String(r.data.answer ?? ''), helpful: Number(r.data.helpful_count ?? 0), updated_at: r.updated_at,
  }));
}

export async function markHelpful(ctx: CrmContext, solutionId: string) {
  if (!can(ctx, 'solutions', 'view')) throw new CrmAccessError();
  if (!isUuid(solutionId)) throw new CrmAccessError('Solution not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_records').select('data').eq('id', solutionId).eq('module', 'solutions').is('deleted_at', null).maybeSingle();
  if (!data) throw new CrmAccessError('Solution not found.');
  // one vote per CRM user per solution (the audit log is the ledger)
  const { count } = await svc.from('crm_audit').select('id', { count: 'exact', head: true }).eq('action', 'kb_helpful').eq('record_id', solutionId).eq('actor_id', ctx.userId);
  if (count) throw new CrmUserError('You already marked this helpful.');
  await audit(svc, { actor_id: ctx.userId, action: 'kb_helpful', module: 'solutions', record_id: solutionId });
  const { count: votes } = await svc.from('crm_audit').select('id', { count: 'exact', head: true }).eq('action', 'kb_helpful').eq('record_id', solutionId);
  await svc.rpc('crm_merge_data', { p_rows: [{ id: solutionId, data: { helpful_count: votes ?? 0 } }] });
  return votes ?? 0;
}
