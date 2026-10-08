/**
 * Setting up automation: save / delete / switch rules on and off, the
 * activity log, job and webhook health, and webhook tests. Everything here
 * needs the manage_automation permission.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import {
  type ActionContext, type AutomationKind, AUTOMATION_KINDS, RuleError, cleanApproval, cleanAssignment, cleanBlueprint, cleanCadence,
  cleanLayoutRule, cleanMacro, cleanScoring, cleanValidation, cleanWebhook, cleanWorkflow,
} from '@/lib/crm/automation';
import { canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { loadMembers } from './members';
import { deleteConfig } from './setup';
import { callWebhook, newWebhookSecret } from './webhooks';
import type { Meta } from './meta';

function need(ctx: CrmContext) {
  if (!canSetup(ctx, 'manage_automation')) throw new CrmAccessError('You don’t have permission to manage automation.');
}

async function knownRefs(svc: SupabaseClient): Promise<NonNullable<ActionContext['known']>> {
  const [{ data: cfg }, { data: camps }, members] = await Promise.all([
    svc.from('crm_config').select('id, kind').in('kind', ['email_template', 'webhook', 'cadence']).limit(5000),
    svc.from('crm_records').select('id').eq('module', 'campaigns').is('deleted_at', null).limit(5000),
    loadMembers(),
  ]);
  const rows = (cfg ?? []) as Array<{ id: string; kind: string }>;
  return {
    templates: new Set(rows.filter((r) => r.kind === 'email_template').map((r) => r.id)),
    webhooks: new Set(rows.filter((r) => r.kind === 'webhook').map((r) => r.id)),
    cadences: new Set(rows.filter((r) => r.kind === 'cadence').map((r) => r.id)),
    campaigns: new Set(((camps ?? []) as Array<{ id: string }>).map((r) => r.id)),
    users: new Set(members.filter((m) => m.active).map((m) => m.id)),
  };
}

export async function saveRule(ctx: CrmContext, meta: Meta, kind: string, input: { id?: string | null; name: string; active?: boolean; config: unknown; rotateSecret?: boolean }) {
  need(ctx);
  if (!(AUTOMATION_KINDS as readonly string[]).includes(kind)) throw new CrmUserError('Unknown rule type.');
  const k = kind as AutomationKind;
  const svc = createServiceClient();
  const name = String(input.name ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 120);
  if (!name) throw new CrmUserError('Give it a name.');
  const known = await knownRefs(svc);
  let existing: { config: Record<string, unknown> } | null = null;
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Not found.');
    const { data } = await svc.from('crm_config').select('config').eq('id', input.id).eq('kind', k).maybeSingle();
    if (!data) throw new CrmAccessError('Not found.');
    existing = data as { config: Record<string, unknown> };
    if (k === 'cadence') known.cadences!.add(input.id);
  }
  let config: Record<string, unknown>;
  try {
    switch (k) {
      case 'workflow': config = cleanWorkflow(input.config, meta, known) as unknown as Record<string, unknown>; break;
      case 'blueprint': config = cleanBlueprint(input.config, meta, known) as unknown as Record<string, unknown>; break;
      case 'approval_process': config = cleanApproval(input.config, meta, known) as unknown as Record<string, unknown>; break;
      case 'assignment_rule': config = cleanAssignment(input.config, meta, known.users) as unknown as Record<string, unknown>; break;
      case 'scoring_rule': config = cleanScoring(input.config, meta) as unknown as Record<string, unknown>; break;
      case 'validation_rule': config = cleanValidation(input.config, meta) as unknown as Record<string, unknown>; break;
      case 'layout_rule': config = cleanLayoutRule(input.config, meta) as unknown as Record<string, unknown>; break;
      case 'macro': config = cleanMacro(input.config, meta, known) as unknown as Record<string, unknown>; break;
      case 'cadence': config = cleanCadence(input.config, meta, known) as unknown as Record<string, unknown>; break;
      case 'webhook': {
        const keep = !input.rotateSecret && typeof existing?.config?.secret === 'string' ? (existing.config.secret as string) : newWebhookSecret();
        config = cleanWebhook(input.config, meta, keep) as unknown as Record<string, unknown>;
        break;
      }
    }
  } catch (e) {
    if (e instanceof RuleError) throw new CrmUserError(e.message);
    throw e;
  }
  // workflow date-rule scans keep their bookmark
  if (k === 'workflow' && existing?.config?.lastScan) config.lastScan = existing.config.lastScan;
  const active = input.active !== false;
  const module = String((config as { module?: string }).module ?? '') || null;
  if (k === 'scoring_rule' && active) {
    let q = svc.from('crm_config').select('id').eq('kind', 'scoring_rule').eq('module', module ?? '').eq('active', true);
    if (input.id) q = q.neq('id', input.id);
    const { data: other } = await q.limit(1);
    if (other?.length) throw new CrmUserError('This module already has an active scoring rule. Switch it off first.');
  }
  const now = new Date().toISOString();
  if (input.id) {
    const { data: cur } = await svc.from('crm_config').select('version').eq('id', input.id).maybeSingle();
    const { error } = await svc.from('crm_config').update({ name, active, module, config, updated_by: ctx.userId, updated_at: now, version: Number((cur as { version?: number } | null)?.version ?? 1) + 1 }).eq('id', input.id).eq('kind', k);
    if (error) throw error.code === '23505' ? new CrmUserError('Something with this name already exists.') : error;
    await audit(svc, { actor_id: ctx.userId, action: `${k}_save`, module, meta: { name, active } });
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ kind: k, name, active, module, config, created_by: ctx.userId, owner_id: ctx.userId }).select('id').single();
  if (error) throw error.code === '23505' ? new CrmUserError('Something with this name already exists.') : error;
  await audit(svc, { actor_id: ctx.userId, action: `${k}_create`, module, meta: { name, active } });
  return (data as { id: string }).id;
}

export async function setRuleActive(ctx: CrmContext, id: string, active: boolean) {
  need(ctx);
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, kind, module, name').eq('id', id).in('kind', AUTOMATION_KINDS as unknown as string[]).maybeSingle();
  const row = data as { id: string; kind: string; module: string | null; name: string } | null;
  if (!row) throw new CrmAccessError('Not found.');
  if (row.kind === 'scoring_rule' && active) {
    const { data: other } = await svc.from('crm_config').select('id').eq('kind', 'scoring_rule').eq('module', row.module ?? '').eq('active', true).neq('id', id).limit(1);
    if (other?.length) throw new CrmUserError('This module already has an active scoring rule.');
  }
  await svc.from('crm_config').update({ active, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', id);
  if (!active) await svc.from('crm_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString(), last_error: 'rule switched off' }).eq('rule_id', id).eq('status', 'pending');
  if (!active && row.kind === 'cadence') await svc.from('crm_cadence_enrollments').update({ status: 'paused', next_at: null }).eq('cadence_id', id).eq('status', 'active');
  await audit(svc, { actor_id: ctx.userId, action: active ? 'rule_on' : 'rule_off', module: row.module, meta: { kind: row.kind, name: row.name } });
}

export async function deleteRule(ctx: CrmContext, kind: string, id: string) {
  need(ctx);
  if (!(AUTOMATION_KINDS as readonly string[]).includes(kind)) throw new CrmUserError('Unknown rule type.');
  const svc = createServiceClient();
  if (kind === 'blueprint' && isUuid(id)) {
    const { count } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('blueprint->>id', id).is('deleted_at', null);
    if (count) throw new CrmUserError(`${count} record(s) are in this Blueprint. Switch it off instead.`);
  }
  await deleteConfig(ctx, id, kind);
  await svc.from('crm_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString(), last_error: 'rule deleted' }).eq('rule_id', id).eq('status', 'pending');
}

export async function automationOverview(ctx: CrmContext) {
  need(ctx);
  const svc = createServiceClient();
  const actions = ['workflow_run', 'workflow_scheduled', 'blueprint_transition', 'blueprint_enter', 'blueprint_sla', 'approval_submit', 'approval_approve', 'approval_reject', 'approval_auto', 'macro_run', 'cadence_enroll', 'assignment_run'];
  const [{ data: runs }, { data: jobs }, { data: hooks }, { data: ens }] = await Promise.all([
    svc.from('crm_audit').select('id, at, action, module, record_id, actor_id, meta').in('action', actions).order('at', { ascending: false }).limit(100),
    svc.from('crm_jobs').select('kind, status, last_error, run_at').in('status', ['pending', 'failed', 'running']).order('run_at').limit(500),
    svc.from('crm_webhook_log').select('webhook_id, host, status, ok, ms, error, at').order('at', { ascending: false }).limit(50),
    svc.from('crm_cadence_enrollments').select('cadence_id, status').limit(50_000),
  ]);
  const enrollment: Record<string, Record<string, number>> = {};
  for (const e of (ens ?? []) as Array<{ cadence_id: string; status: string }>) {
    enrollment[e.cadence_id] ??= {};
    enrollment[e.cadence_id][e.status] = (enrollment[e.cadence_id][e.status] ?? 0) + 1;
  }
  const j = (jobs ?? []) as Array<{ kind: string; status: string; last_error: string | null; run_at: string }>;
  return {
    runs: runs ?? [],
    jobs: { pending: j.filter((x) => x.status === 'pending').length, failed: j.filter((x) => x.status === 'failed').map((x) => ({ kind: x.kind, error: x.last_error, at: x.run_at })).slice(0, 20), next: j.find((x) => x.status === 'pending')?.run_at ?? null },
    webhooks: hooks ?? [],
    enrollment,
  };
}

export async function testWebhook(ctx: CrmContext, id: string) {
  need(ctx);
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const r = await callWebhook(createServiceClient(), id, null, 'test');
  if (!r) throw new CrmUserError('The webhook is off, rate-limited, or missing.');
  return r;
}
