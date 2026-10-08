/**
 * Automation engine (server half). Called by the records engine on every
 * save (beforeSave / layoutRequired / afterSave / afterDelete), by the
 * scheduler (runScheduled / runDaily), and by server actions (transitions,
 * approvals, macros, cadences, assignment).
 *
 * Order on a save, as in Zoho: assignment (at create) → workflow rules →
 * approval → blueprint, then scoring and cadences. Every automated write goes
 * through updateRecord/createRecord with source 'automation', a depth and the
 * chain of rules that caused it, so loops stop (chainAllows) and every change
 * is audited. Automated emails always go to the Outbox for approval.
 */
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type Action, type ApprovalConfig, type AssignmentConfig, type BlueprintConfig, type CadenceConfig, type LayoutRuleConfig, type MacroConfig,
  type ScoringConfig, type Touches, type ValidationConfig, type WorkflowConfig, AUTOMATION_KINDS, availableTransitions, assignmentEntry,
  cadenceDue, chainAllows, computeScore, dateFireDay, isTerminal, layoutEffect, matchCondition, orderActions, resolveValue, roundRobin,
  stageApprovers, triggerFires, validationErrors,
} from '@/lib/crm/automation';
import { evaluate } from '@/lib/crm/criteria';
import { isEmpty, isUuid } from '@/lib/crm/fields';
import { allows, can, canSetup } from '@/lib/crm/permissions';
import { caseStamps, isClosedCase } from '@/lib/crm/sla';
import { validateTemplate } from '@/lib/crm/templates';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { createServiceClient } from './svc';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, normalizeRecord } from './db';
import type { Meta } from './meta';

export interface SaveEvent {
  ctx: CrmContext | null;
  actorId: string | null;
  meta: Meta;
  module: string;
  before: CrmRecord | null;
  after: CrmRecord;
  event: 'create' | 'edit';
  source: string;
  depth: number;
  chain?: string[];
}

// ---------------------------------------------------------------------------
// Loading rules (once per request)
// ---------------------------------------------------------------------------

export interface Rule<T> { id: string; kind: string; module: string | null; name: string; position: number; config: T }
interface RuleSet {
  workflows: Rule<WorkflowConfig>[];
  blueprints: Rule<BlueprintConfig>[];
  approvals: Rule<ApprovalConfig>[];
  assignment: Rule<AssignmentConfig>[];
  scoring: Rule<ScoringConfig>[];
  validation: Rule<ValidationConfig>[];
  layout: Rule<LayoutRuleConfig>[];
  macros: Rule<MacroConfig>[];
  cadences: Rule<CadenceConfig>[];
}

async function fetchRules(svc: SupabaseClient): Promise<RuleSet> {
  const { data, error } = await svc.from('crm_config').select('id, kind, module, name, position, config').in('kind', AUTOMATION_KINDS as unknown as string[]).eq('active', true).order('position').order('name').limit(2000);
  const rows = error ? [] : ((data ?? []) as Array<Rule<unknown>>);
  const of = <T>(k: string) => rows.filter((r) => r.kind === k) as Rule<T>[];
  return {
    workflows: of('workflow'), blueprints: of('blueprint'), approvals: of('approval_process'), assignment: of('assignment_rule'),
    scoring: of('scoring_rule'), validation: of('validation_rule'), layout: of('layout_rule'), macros: of('macro'), cadences: of('cadence'),
  };
}

export const loadRules = cache(async (): Promise<RuleSet> => fetchRules(createServiceClient()));

const forModule = <T>(list: Rule<T>[], module: string) => list.filter((r) => r.module === module || (r.config as { module?: string })?.module === module);

// ---------------------------------------------------------------------------
// Save hooks
// ---------------------------------------------------------------------------

const NO_VALIDATION = new Set(['sync', 'automation', 'system']);

export async function beforeSave(e: Omit<SaveEvent, 'after'> & { data: Record<string, unknown> }): Promise<Array<{ field: string; message: string }>> {
  const errors: Array<{ field: string; message: string }> = [];
  if (e.module === 'cases') {
    const { loadSla } = await import('./service');
    const policy = await loadSla(createServiceClient());
    const created = e.before ? new Date(e.before.created_at) : new Date();
    Object.assign(e.data, caseStamps(e.before?.data ?? null, e.data, created, policy));
  }
  const rules = await loadRules();
  // Blueprint: the state field changes only through a transition
  const bpState = e.before?.blueprint as (CrmRecord['blueprint'] & { done?: boolean }) | null | undefined;
  if (bpState && !bpState.done && e.source !== 'blueprint' && e.source !== 'sync') {
    const bp = rules.blueprints.find((b) => b.id === bpState.id);
    if (bp && JSON.stringify(e.before!.data[bp.config.field] ?? null) !== JSON.stringify(e.data[bp.config.field] ?? null)) {
      errors.push({ field: bp.config.field, message: `This record follows the “${bp.name}” Blueprint — use a transition button to change it.` });
    }
  }
  if (!NO_VALIDATION.has(e.source)) {
    const vr = forModule(rules.validation, e.module).map((r) => r.config);
    errors.push(...validationErrors(vr, e.data, e.event, { owner_id: e.before?.owner_id ?? e.actorId, tags: e.before?.tags ?? [] }));
  }
  return errors;
}

export async function layoutRequired(_meta: Meta, module: string, data: Record<string, unknown>): Promise<string[]> {
  const rules = forModule((await loadRules()).layout, module).map((r) => r.config);
  return rules.length ? layoutEffect(rules, data).required : [];
}

/** Layout rules for the record form (client hides/requires fields live). */
export async function layoutRulesFor(module: string): Promise<LayoutRuleConfig[]> {
  return forModule((await loadRules()).layout, module).map((r) => r.config);
}

/** Runs after a successful write. Never throws. */
export async function afterSave(e: SaveEvent): Promise<void> {
  const chain = e.chain ?? [];
  const svc = createServiceClient();
  let rules: RuleSet;
  try { rules = await loadRules(); } catch { return; }
  let rec = e.after;
  const scoreBefore = e.before?.score ?? null;
  const facts = { event: e.event, before: e.before, after: rec } as const;

  // 1. workflow rules
  for (const w of forModule(rules.workflows, e.module)) {
    if (w.config.trigger.type === 'score' || w.config.trigger.type === 'date') continue;
    try {
      const fires = triggerFires(w.config, facts);
      const ci = fires || w.config.trigger.type !== 'delete' ? matchCondition(w.config, rec, e.before) : -1;
      // Zoho: a record that no longer meets the criteria loses its pending scheduled actions
      if (e.event === 'edit' && ci === -1) await cancelJobs(svc, { ruleId: w.id, recordId: rec.id, kind: 'workflow_action' });
      if (!fires || ci < 0 || !chainAllows(chain, w.id)) continue;
      await runWorkflow(svc, e.meta, w, ci, rec, chain, e.depth, e.event === 'create' ? 'create' : rec.updated_at);
    } catch (err) {
      console.error('[crm] workflow failed', w.id, err);
    }
  }
  rec = (await reload(svc, rec.id)) ?? rec;
  if (rec.deleted_at) return;

  // 2. approval processes (auto-submit). Only edits by people start an approval: an on-approve
  // field update, a sync or a scheduled action must never put the record straight back in the queue.
  if (rec.approval_status !== 'pending' && !['automation', 'sync', 'system'].includes(e.source)) {
    for (const p of forModule(rules.approvals, e.module)) {
      const t = p.config.trigger;
      if (t === 'manual' || (t === 'create' && e.event !== 'create') || (t === 'edit' && e.event !== 'edit')) continue;
      if (p.config.criteria && !evaluate(rec, p.config.criteria)) continue;
      // a record approved (or rejected) earlier is re-submitted only when edited again with matching criteria
      try { await submitApproval(svc, e.meta, p, rec, e.actorId); } catch (err) { console.error('[crm] approval submit failed', err); }
      break;
    }
  }

  // 3. blueprint entry
  if (!rec.blueprint) {
    for (const b of forModule(rules.blueprints, e.module)) {
      const v = rec.data[b.config.field];
      if (typeof v !== 'string' || !b.config.states.includes(v)) continue;
      if (b.config.criteria && !evaluate(rec, b.config.criteria)) continue;
      await enterBlueprint(svc, b, rec, v);
      break;
    }
  }

  // 4. scoring (and score-triggered workflows)
  try {
    const scored = await rescore(svc, rules, rec);
    if (scored !== null && scored !== scoreBefore) {
      rec = { ...rec, score: scored };
      for (const w of forModule(rules.workflows, e.module).filter((x) => x.config.trigger.type === 'score')) {
        if (!chainAllows(chain, w.id)) continue;
        if (!triggerFires(w.config, { event: e.event, before: e.before, after: rec, scoreBefore, scoreAfter: scored })) continue;
        const ci = matchCondition(w.config, rec, e.before);
        if (ci >= 0) await runWorkflow(svc, e.meta, w, ci, rec, chain, e.depth, `score:${scored}:${rec.updated_at}`);
      }
    }
  } catch (err) {
    console.error('[crm] scoring failed', err);
  }

  // 5. cadences: exit checks, then auto-enrol
  try { await cadenceOnSave(svc, rules, rec); } catch (err) { console.error('[crm] cadence hook failed', err); }

  // 6. service: CSAT when a case is resolved (if switched on)
  try {
    if (e.module === 'cases' && isClosedCase(rec.data.status) && (!e.before || !isClosedCase(e.before.data.status))) {
      const { loadServiceSettings } = await import('./service');
      const s = await loadServiceSettings(svc);
      if (s.csatOnResolve && s.csatSurveyId) {
        const { sendSurvey } = await import('./surveys');
        await sendSurvey(null, e.meta, { surveyId: s.csatSurveyId, module: 'cases', recordIds: [rec.id] });
      }
    }
  } catch (err) {
    console.error('[crm] CSAT hook failed:', err);
  }
}

/** Runs after a soft delete. Never throws. */
export async function afterDelete(e: { actorId: string | null; meta: Meta; module: string; record: CrmRecord }): Promise<void> {
  const svc = createServiceClient();
  try {
    await cancelJobs(svc, { recordId: e.record.id });
    await svc.from('crm_cadence_enrollments').update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: 'record deleted', next_at: null }).eq('record_id', e.record.id).eq('status', 'active');
    await svc.from('crm_approvals').update({ status: 'cancelled', decided_at: new Date().toISOString(), comment: 'record deleted' }).eq('record_id', e.record.id).eq('status', 'pending');
    const rules = await loadRules();
    for (const w of forModule(rules.workflows, e.module).filter((x) => x.config.trigger.type === 'delete')) {
      const ci = matchCondition(w.config, e.record, null);
      if (ci >= 0) await runWorkflow(svc, e.meta, w, ci, e.record, [], 0, 'delete');
    }
  } catch (err) {
    console.error('[crm] afterDelete failed', err);
  }
}

async function reload(svc: SupabaseClient, id: string): Promise<CrmRecord | null> {
  const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('id', id).maybeSingle();
  return data ? normalizeRecord(data as Record<string, unknown>) : null;
}

async function cancelJobs(svc: SupabaseClient, f: { ruleId?: string; recordId?: string; kind?: string }) {
  let q = svc.from('crm_jobs').update({ status: 'cancelled', finished_at: new Date().toISOString() }).eq('status', 'pending');
  if (f.ruleId) q = q.eq('rule_id', f.ruleId);
  if (f.recordId) q = q.eq('record_id', f.recordId);
  if (f.kind) q = q.eq('kind', f.kind);
  await q;
}

// ---------------------------------------------------------------------------
// Workflows and actions
// ---------------------------------------------------------------------------

async function runWorkflow(svc: SupabaseClient, meta: Meta, w: Rule<WorkflowConfig>, ci: number, rec: CrmRecord, chain: string[], depth: number, runKey: string) {
  const cond = w.config.conditions[ci];
  const results = await executeActions(svc, meta, cond.actions, rec, { chain: [...chain, w.id], depth, ruleId: w.id, source: 'workflow', runKey });
  // scheduled actions: one job per (rule, condition, slot, record, firing)
  const jobs = cond.scheduled.map((sc, k) => ({
    kind: 'workflow_action', rule_id: w.id, record_id: rec.id, run_at: new Date(Date.now() + sc.delayMinutes * 60_000).toISOString(),
    payload: { condition: ci, slot: k, runKey }, dedupe_key: `wf:${w.id}:${rec.id}:${ci}:${k}:${runKey}`,
  }));
  if (jobs.length) await svc.from('crm_jobs').upsert(jobs, { onConflict: 'dedupe_key', ignoreDuplicates: true });
  await audit(svc, { actor_id: null, actor_kind: 'automation', action: 'workflow_run', module: rec.module, record_id: rec.id, meta: { rule: w.id, name: w.name, condition: ci, actions: results, scheduled: jobs.length } });
}

export interface ActionRun {
  chain: string[];
  depth: number;
  ruleId: string;
  source: 'workflow' | 'blueprint' | 'approval' | 'macro' | 'cadence' | 'sla' | 'assignment';
  runKey: string;
  /** macros run as the person who pressed the button */
  ctx?: CrmContext | null;
}

export async function executeActions(svc: SupabaseClient, meta: Meta, actions: Action[], recIn: CrmRecord, run: ActionRun): Promise<Array<{ type: string; ok: boolean; error?: string }>> {
  const { updateRecord, createRecord, notify } = await import('./records');
  const out: Array<{ type: string; ok: boolean; error?: string }> = [];
  let rec = recIn;
  const ordered = orderActions(actions);
  const asUser = run.ctx ?? null;
  const base = { actorKind: (asUser ? 'user' : 'automation') as 'user' | 'automation', source: (asUser ? 'ui' : 'automation') as 'ui' | 'automation', depth: run.depth + 1, chain: run.chain, allowDuplicate: true };

  // all field updates in one write
  const fu = ordered.filter((a) => a.type === 'field_update');
  if (fu.length) {
    const patch: Record<string, unknown> = {};
    for (const a of fu) patch[a.field!] = resolveValue(a.value, { ownerId: rec.owner_id });
    try {
      rec = await updateRecord(asUser, meta, rec.module, rec.id, patch, { ...base, skipAutomation: run.depth + 1 >= 3 });
      out.push({ type: 'field_update', ok: true });
    } catch (e) {
      out.push({ type: 'field_update', ok: false, error: (e as Error).message.slice(0, 200) });
    }
  }
  for (const a of ordered) {
    if (a.type === 'field_update') continue;
    try {
      switch (a.type) {
        case 'assign': {
          const { loadMembers } = await import('./members');
          const members = await loadMembers();
          const { data: n } = await svc.rpc('crm_next_number', { p_key: rrKey(run.ruleId, 'a') });
          const to = roundRobin(a.userIds ?? [], Number(n ?? 1) - 1, (id) => members.some((m) => m.id === id && m.active));
          if (!to) throw new Error('no active user to assign to');
          rec = await updateRecord(asUser, meta, rec.module, rec.id, {}, { ...base, ownerId: to, skipAutomation: true });
          break;
        }
        case 'tag': {
          const { normalizeTags } = await import('./records');
          const next = normalizeTags([...rec.tags.filter((t) => !(a.remove ?? []).some((r) => r.toLowerCase() === t.toLowerCase())), ...(a.add ?? [])]);
          if (JSON.stringify(next) !== JSON.stringify(rec.tags)) rec = await updateRecord(asUser, meta, rec.module, rec.id, {}, { ...base, tags: next, skipAutomation: true });
          break;
        }
        case 'email': {
          const { data: t } = await svc.from('crm_config').select('id, config, active').eq('id', a.templateId!).eq('kind', 'email_template').maybeSingle();
          if (!t || !(t as { active: boolean }).active) throw new Error('template missing or off');
          const { queueEmails } = await import('./outbox');
          const src = run.source === 'macro' ? 'macro' : run.source === 'cadence' ? 'cadence' : 'workflow';
          const r = await queueEmails(asUser, meta, {
            module: rec.module, recordIds: [rec.id], template: validateTemplate((t as { config: unknown }).config), templateId: a.templateId!, source: src, sourceId: run.ruleId,
            dedupe: (rid) => `${src}:${run.ruleId}:${a.templateId}:${rid}:${run.runKey}`,
          });
          if (r.noEmail) throw new Error('record has no email');
          break;
        }
        case 'notify': {
          const to = await recipients(svc, a.to ?? 'owner', rec.owner_id);
          for (const u of to) await notify(svc, u, 'automation', a.title ?? 'Automation', rec.name, `/crm/m/${rec.module}/${rec.id}`);
          break;
        }
        case 'task':
        case 'call': {
          const [owner] = await recipients(svc, a.to ?? 'owner', rec.owner_id);
          const due = resolveValue(`{{today+${a.dueInDays ?? 1}}}`, { ownerId: null }) as string;
          const data: Record<string, unknown> = a.type === 'task'
            ? { subject: a.subject, due_date: due, priority: a.priority ?? 'Normal', related_to: { module: rec.module, id: rec.id }, description: a.description }
            : { subject: a.subject, call_type: 'Outbound', call_status: 'Scheduled', call_start_time: `${due}T05:30:00.000Z`, related_to: { module: rec.module, id: rec.id }, description: a.description };
          if (!meta.module(a.type === 'task' ? 'tasks' : 'calls')?.settings) throw new Error('module missing');
          await createRecord(null, meta, a.type === 'task' ? 'tasks' : 'calls', stripEmpty(data), { actorKind: 'automation', source: 'automation', ownerId: owner ?? null, depth: run.depth + 1, chain: run.chain, allowDuplicate: true });
          break;
        }
        case 'create_record': {
          const values: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(a.values ?? {})) values[k] = typeof v === 'string' ? v.replace(/\{\{\s*([a-z][a-z0-9_]{0,50})\s*\}\}/g, (_, f: string) => (f === 'name' ? rec.name : String(rec.data[f] ?? ''))) : v;
          await createRecord(null, meta, a.module!, values, { actorKind: 'automation', source: 'automation', ownerId: rec.owner_id, depth: run.depth + 1, chain: run.chain, allowDuplicate: true });
          break;
        }
        case 'add_to_campaign': {
          const { data: c } = await svc.from('crm_records').select('id').eq('id', a.campaignId!).eq('module', 'campaigns').is('deleted_at', null).maybeSingle();
          if (!c) throw new Error('campaign missing');
          await svc.from('crm_links').upsert({ from_id: a.campaignId, to_id: rec.id, kind: 'campaign_member', data: { status: 'Planned', module: rec.module } }, { onConflict: 'from_id,to_id,kind', ignoreDuplicates: true });
          break;
        }
        case 'enroll_cadence':
          await enrollCadence(svc, a.cadenceId!, rec, null);
          break;
        case 'unenroll_cadence':
          await svc.from('crm_cadence_enrollments').update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: 'removed by automation', next_at: null }).eq('cadence_id', a.cadenceId!).eq('record_id', rec.id).eq('status', 'active');
          break;
        case 'webhook': {
          const { callWebhook } = await import('./webhooks');
          const r = await callWebhook(svc, a.webhookId!, rec, `${run.source}:${rec.module}`);
          if (r && !r.ok) throw new Error(r.error ?? `status ${r.status}`);
          break;
        }
      }
      out.push({ type: a.type, ok: true });
    } catch (e) {
      out.push({ type: a.type, ok: false, error: (e as Error).message.slice(0, 200) });
    }
  }
  return out;
}

/** Round-robin counter key (crm_counters.key allows only [a-z0-9_.:]). */
export const rrKey = (ruleId: string, slot: string) => `rr:${ruleId.replace(/[^a-z0-9]/gi, '').toLowerCase()}:${slot}`;

const stripEmpty = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => !isEmpty(v)));

/** 'owner' | 'owner_managers' | user id → active CRM user ids. */
async function recipients(svc: SupabaseClient, to: string, ownerId: string | null): Promise<string[]> {
  const { loadMembers } = await import('./members');
  const members = await loadMembers();
  const active = (id: string | null | undefined): id is string => !!id && members.some((m) => m.id === id && m.active);
  if (to === 'owner') return active(ownerId) ? [ownerId] : [];
  if (to === 'owner_managers') {
    if (!ownerId) return [];
    const { data: roles } = await svc.from('crm_config').select('id, config').eq('kind', 'role');
    const parents: Record<string, string | null> = {};
    for (const r of (roles ?? []) as Array<{ id: string; config: { parentId?: string | null } }>) parents[r.id] = r.config?.parentId ?? null;
    return stageApprovers({ approvers: { type: 'manager' }, mode: 'any' }, ownerId, members.map((m) => ({ id: m.id, roleId: m.roleId, active: m.active })), parents);
  }
  return active(to) ? [to] : [];
}

// ---------------------------------------------------------------------------
// Blueprints
// ---------------------------------------------------------------------------

async function enterBlueprint(svc: SupabaseClient, b: Rule<BlueprintConfig>, rec: CrmRecord, state: string) {
  const now = new Date().toISOString();
  const { data } = await svc.from('crm_records').update({ blueprint: { id: b.id, state, entered_at: now } }).eq('id', rec.id).is('blueprint', null).select('id');
  if (!data?.length) return;
  await scheduleBlueprintSla(svc, b, rec.id, state, now);
  await audit(svc, { actor_id: null, actor_kind: 'automation', action: 'blueprint_enter', module: rec.module, record_id: rec.id, meta: { blueprint: b.name, state } });
}

async function scheduleBlueprintSla(svc: SupabaseClient, b: Rule<BlueprintConfig>, recordId: string, state: string, enteredAt: string) {
  const jobs = b.config.sla.map((s, i) => ({ s, i })).filter(({ s }) => s.state === state).map(({ s, i }) => ({
    kind: 'blueprint_sla', rule_id: b.id, record_id: recordId, run_at: new Date(new Date(enteredAt).getTime() + s.hours * 3_600_000).toISOString(),
    payload: { state, enteredAt, sla: i }, dedupe_key: `bp:${b.id}:${recordId}:${state}:${enteredAt}:${i}`,
  }));
  if (jobs.length) await svc.from('crm_jobs').upsert(jobs, { onConflict: 'dedupe_key', ignoreDuplicates: true });
}

export async function blueprintInfo(ctx: CrmContext, rec: CrmRecord) {
  const bp = rec.blueprint as (CrmRecord['blueprint'] & { done?: boolean }) | null;
  if (!bp) return null;
  const b = (await loadRules()).blueprints.find((x) => x.id === bp.id);
  if (!b) return null;
  const transitions = bp.done ? [] : availableTransitions(b.config, rec, bp.state, { userId: ctx.userId, roleId: ctx.roleId, superAdmin: ctx.superAdmin });
  return {
    id: b.id, name: b.name, field: b.config.field, state: bp.state, enteredAt: bp.entered_at, done: !!bp.done,
    transitions: transitions.map((t) => ({ id: t.id, name: t.name, to: t.to, requiredFields: t.requiredFields, noteRequired: t.noteRequired, message: t.message })),
  };
}

export async function runTransition(ctx: CrmContext, meta: Meta, recordId: string, transitionId: string, input: { fields?: Record<string, unknown>; note?: string }) {
  const { accessTo, updateRecord, loadRecordRaw } = await import('./records');
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, recordId);
  if (!rec || rec.deleted_at || !can(ctx, rec.module, 'view')) throw new CrmAccessError('Record not found.');
  const bp = rec.blueprint as (CrmRecord['blueprint'] & { done?: boolean }) | null;
  if (!bp || bp.done) throw new CrmUserError('This record is not in a Blueprint.');
  const b = (await loadRules()).blueprints.find((x) => x.id === bp.id);
  if (!b) throw new CrmUserError('That Blueprint is no longer active.');
  const t = availableTransitions(b.config, rec, bp.state, { userId: ctx.userId, roleId: ctx.roleId, superAdmin: ctx.superAdmin }).find((x) => x.id === transitionId);
  if (!t) throw new CrmUserError('That transition is not available to you right now.');
  // explicit transition owners may act without record access (Zoho); everyone else needs edit access
  const named = t.owners.type === 'users' || t.owners.type === 'roles';
  if (!ctx.superAdmin && !named && !allows(accessTo(ctx, meta, rec), 'rw')) throw new CrmAccessError('Record not found.');
  if (rec.approval_status === 'pending') throw new CrmUserError('This record is waiting for approval.');
  if (rec.locked) throw new CrmUserError(rec.locked.kind === 'converted' ? 'This lead has been converted.' : 'This record is locked.');
  const fields = (input.fields && typeof input.fields === 'object' ? input.fields : {}) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const f of t.requiredFields) {
    const v = f in fields ? fields[f] : rec.data[f];
    if (isEmpty(v)) missing.push(meta.field(rec.module, f)?.label ?? f);
    else if (f in fields) patch[f] = fields[f];
  }
  if (missing.length) throw new CrmUserError(`Fill in: ${missing.join(', ')}.`);
  const note = typeof input.note === 'string' ? input.note.trim().slice(0, 4000) : '';
  if (t.noteRequired && !note) throw new CrmUserError('This transition needs a note.');
  patch[b.config.field] = t.to;
  const after = await updateRecord(null, meta, rec.module, rec.id, patch, { source: 'blueprint', actorKind: 'system', actorIdOverride: ctx.userId, allowSynced: true, chain: [b.id], depth: 0 });
  const now = new Date().toISOString();
  const done = isTerminal(b.config, t.to);
  await svc.from('crm_records').update({ blueprint: { id: b.id, state: t.to, entered_at: now, ...(done ? { done: true } : {}) } }).eq('id', rec.id);
  await cancelJobs(svc, { recordId: rec.id, kind: 'blueprint_sla' });
  if (!done) await scheduleBlueprintSla(svc, b, rec.id, t.to, now);
  if (note) await svc.from('crm_notes').insert({ record_id: rec.id, body: `[${t.name}] ${note}`, created_by: ctx.userId });
  const results = await executeActions(svc, meta, t.after, after, { chain: [b.id], depth: 0, ruleId: b.id, source: 'blueprint', runKey: `${t.id}:${now}` });
  await audit(svc, { actor_id: ctx.userId, action: 'blueprint_transition', module: rec.module, record_id: rec.id, meta: { blueprint: b.name, transition: t.name, from: bp.state, to: t.to, actions: results } });
  return { state: t.to, done };
}

// ---------------------------------------------------------------------------
// Approvals
// ---------------------------------------------------------------------------

async function roleMap(svc: SupabaseClient) {
  const { data } = await svc.from('crm_config').select('id, config').eq('kind', 'role');
  const parents: Record<string, string | null> = {};
  for (const r of (data ?? []) as Array<{ id: string; config: { parentId?: string | null } }>) parents[r.id] = r.config?.parentId ?? null;
  return parents;
}

async function approversFor(svc: SupabaseClient, p: ApprovalConfig, stage: number, ownerId: string | null) {
  const { loadMembers } = await import('./members');
  const members = (await loadMembers()).map((m) => ({ id: m.id, roleId: m.roleId, active: m.active }));
  return stageApprovers(p.stages[stage], ownerId, members, await roleMap(svc));
}

export async function submitApproval(svc: SupabaseClient, meta: Meta, p: Rule<ApprovalConfig>, rec: CrmRecord, requestedBy: string | null): Promise<'pending' | 'approved' | 'exists'> {
  let stage = 0;
  let approvers = await approversFor(svc, p.config, 0, rec.owner_id);
  // a stage with nobody in it approves itself (Zoho); move on until someone must decide
  while (!approvers.length && stage < p.config.stages.length - 1) { stage++; approvers = await approversFor(svc, p.config, stage, rec.owner_id); }
  if (!approvers.length) {
    await svc.from('crm_records').update({ approval_status: 'approved' }).eq('id', rec.id);
    await audit(svc, { actor_id: requestedBy, actor_kind: requestedBy ? 'user' : 'automation', action: 'approval_auto', module: rec.module, record_id: rec.id, meta: { process: p.name } });
    await executeActions(svc, meta, p.config.onApprove, rec, { chain: [p.id], depth: 0, ruleId: p.id, source: 'approval', runKey: `auto:${rec.updated_at}` });
    return 'approved';
  }
  const { error } = await svc.from('crm_approvals').insert({ process_id: p.id, record_id: rec.id, stage, approvers, requested_by: requestedBy, history: [{ at: new Date().toISOString(), event: 'submitted', by: requestedBy }] });
  if (error) { if (error.code === '23505') return 'exists'; throw error; }
  await svc.from('crm_records').update({ approval_status: 'pending' }).eq('id', rec.id);
  const { notify } = await import('./records');
  for (const u of approvers) await notify(svc, u, 'approval', `Approval needed: ${rec.name}`, p.name, `/crm/m/${rec.module}/${rec.id}`);
  await audit(svc, { actor_id: requestedBy, actor_kind: requestedBy ? 'user' : 'automation', action: 'approval_submit', module: rec.module, record_id: rec.id, meta: { process: p.name, stage, approvers: approvers.length } });
  return 'pending';
}

export async function submitManually(ctx: CrmContext, meta: Meta, recordId: string) {
  const { getRecord, accessTo } = await import('./records');
  const svc = createServiceClient();
  const raw = await (await import('./records')).loadRecordRaw(svc, recordId);
  if (!raw) throw new CrmAccessError('Record not found.');
  const rec = await getRecord(ctx, meta, raw.module, recordId);
  if (!allows(accessTo(ctx, meta, rec), 'rw')) throw new CrmAccessError('You can only view this record.');
  if (rec.approval_status === 'pending') throw new CrmUserError('Already waiting for approval.');
  const p = forModule((await loadRules()).approvals, rec.module).find((x) => x.config.trigger === 'manual' && (!x.config.criteria || evaluate(raw, x.config.criteria)));
  if (!p) throw new CrmUserError('No approval process applies to this record.');
  return submitApproval(svc, meta, p, raw, ctx.userId);
}

export async function myApprovals(ctx: CrmContext) {
  const svc = createServiceClient();
  let q = svc.from('crm_approvals').select('id, process_id, record_id, stage, approvers, approved_by, requested_by, requested_at, history').eq('status', 'pending').order('requested_at');
  if (!ctx.superAdmin && !canSetup(ctx, 'manage_automation')) q = q.contains('approvers', [ctx.userId]);
  const { data } = await q.limit(200);
  return (data ?? []) as Array<{ id: string; process_id: string | null; record_id: string; stage: number; approvers: string[]; approved_by: string[]; requested_by: string | null; requested_at: string; history: unknown[] }>;
}

export async function approvalFor(recordId: string) {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_approvals').select('id, process_id, status, stage, approvers, approved_by, requested_by, requested_at, decided_by, decided_at, comment, history').eq('record_id', recordId).order('requested_at', { ascending: false }).limit(1);
  return ((data ?? [])[0] ?? null) as null | { id: string; process_id: string | null; status: string; stage: number; approvers: string[]; approved_by: string[]; requested_by: string | null; requested_at: string; decided_by: string | null; decided_at: string | null; comment: string | null; history: Array<{ at: string; event: string; by: string | null; comment?: string }> };
}

export async function decideApproval(ctx: CrmContext, meta: Meta, approvalId: string, approve: boolean, comment: string) {
  if (!isUuid(approvalId)) throw new CrmAccessError('Not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_approvals').select('*').eq('id', approvalId).maybeSingle();
  const a = data as { id: string; process_id: string | null; record_id: string; status: string; stage: number; approvers: string[]; approved_by: string[]; history: unknown[] } | null;
  if (!a || a.status !== 'pending') throw new CrmUserError('This request is no longer waiting.');
  const isApprover = a.approvers.includes(ctx.userId);
  const isAdmin = ctx.superAdmin || canSetup(ctx, 'manage_automation');
  if (!isApprover && !isAdmin) throw new CrmAccessError('You are not an approver for this request.');
  const { data: pr } = await svc.from('crm_config').select('id, kind, module, name, position, config').eq('id', a.process_id ?? '').maybeSingle();
  const p = pr as Rule<ApprovalConfig> | null;
  const rec = await reload(svc, a.record_id);
  if (!rec) throw new CrmAccessError('Record not found.');
  const now = new Date().toISOString();
  const cmt = String(comment ?? '').trim().slice(0, 1000);
  if (!approve && !cmt) throw new CrmUserError('Say why you are rejecting it.');
  const history = [...(Array.isArray(a.history) ? a.history : []), { at: now, event: approve ? 'approved' : 'rejected', by: ctx.userId, stage: a.stage, comment: cmt || undefined, asAdmin: !isApprover || undefined }];
  const { notify } = await import('./records');
  const tell = async (title: string) => {
    for (const u of new Set([rec.owner_id, ...(history as Array<{ by?: string | null }>).map((h) => h.by ?? null)].filter((x): x is string => !!x && x !== ctx.userId))) {
      await notify(svc, u, 'approval', title, cmt || null, `/crm/m/${rec.module}/${rec.id}`);
    }
  };
  // optimistic guard: only the version we read may be changed
  const guard = (q: any) => q.eq('id', a.id).eq('status', 'pending').eq('stage', a.stage);
  if (!approve) {
    const { data: u } = await guard(svc.from('crm_approvals').update({ status: 'rejected', decided_by: ctx.userId, decided_at: now, comment: cmt, history })).select('id');
    if (!u?.length) throw new CrmUserError('Someone decided this a moment ago. Reload.');
    await svc.from('crm_records').update({ approval_status: 'rejected' }).eq('id', rec.id);
    await audit(svc, { actor_id: ctx.userId, action: 'approval_reject', module: rec.module, record_id: rec.id, meta: { process: p?.name, comment: cmt } });
    if (p) await executeActions(svc, meta, p.config.onReject, rec, { chain: [p.id], depth: 0, ruleId: p.id, source: 'approval', runKey: `reject:${a.id}` });
    await tell(`Rejected: ${rec.name}`);
    return { status: 'rejected' as const };
  }
  const approvedBy = [...new Set([...(a.approved_by ?? []), ctx.userId])];
  const stageCfg = p?.config.stages[a.stage];
  const stageDone = isAdmin && !isApprover ? true : stageCfg?.mode === 'all' ? a.approvers.every((u) => approvedBy.includes(u)) : true;
  if (!stageDone) {
    const { data: u } = await guard(svc.from('crm_approvals').update({ approved_by: approvedBy, history })).select('id');
    if (!u?.length) throw new CrmUserError('Someone decided this a moment ago. Reload.');
    await audit(svc, { actor_id: ctx.userId, action: 'approval_vote', module: rec.module, record_id: rec.id, meta: { process: p?.name, stage: a.stage } });
    return { status: 'pending' as const, waitingFor: a.approvers.filter((x) => !approvedBy.includes(x)).length };
  }
  // next stage (skipping empty ones), or final approval
  let next = a.stage + 1;
  let nextApprovers: string[] = [];
  while (p && next < p.config.stages.length) {
    nextApprovers = await approversFor(svc, p.config, next, rec.owner_id);
    if (nextApprovers.length) break;
    next++;
  }
  if (p && next < p.config.stages.length) {
    const { data: u } = await guard(svc.from('crm_approvals').update({ stage: next, approvers: nextApprovers, approved_by: [], history })).select('id');
    if (!u?.length) throw new CrmUserError('Someone decided this a moment ago. Reload.');
    for (const x of nextApprovers) await notify(svc, x, 'approval', `Approval needed: ${rec.name}`, `${p.name} — stage ${next + 1}`, `/crm/m/${rec.module}/${rec.id}`);
    await audit(svc, { actor_id: ctx.userId, action: 'approval_stage', module: rec.module, record_id: rec.id, meta: { process: p.name, stage: next } });
    return { status: 'pending' as const, stage: next };
  }
  const { data: u } = await guard(svc.from('crm_approvals').update({ status: 'approved', approved_by: approvedBy, decided_by: ctx.userId, decided_at: now, comment: cmt || null, history })).select('id');
  if (!u?.length) throw new CrmUserError('Someone decided this a moment ago. Reload.');
  await svc.from('crm_records').update({ approval_status: 'approved' }).eq('id', rec.id);
  await audit(svc, { actor_id: ctx.userId, action: 'approval_approve', module: rec.module, record_id: rec.id, meta: { process: p?.name } });
  if (p) await executeActions(svc, meta, p.config.onApprove, rec, { chain: [p.id], depth: 0, ruleId: p.id, source: 'approval', runKey: `approve:${a.id}` });
  await tell(`Approved: ${rec.name}`);
  return { status: 'approved' as const };
}

// ---------------------------------------------------------------------------
// Assignment rules
// ---------------------------------------------------------------------------

/** Owner for a new record created by a web form / import / API, if a rule applies. */
export async function assignOwnerFor(module: string, data: Record<string, unknown>, source: string): Promise<{ ownerId: string; ruleId: string; followUp: AssignmentConfig['followUp'] } | null> {
  const rules = forModule((await loadRules()).assignment, module).filter((r) => r.config.applyTo.includes(source as never));
  if (!rules.length) return null;
  const r = rules[0];
  const svc = createServiceClient();
  const { loadMembers } = await import('./members');
  const members = await loadMembers();
  const isActive = (id: string) => members.some((m) => m.id === id && m.active);
  const ei = assignmentEntry(r.config, { data });
  const users = ei >= 0 ? r.config.entries[ei].userIds : r.config.fallbackUserId ? [r.config.fallbackUserId] : [];
  if (!users.length) return null;
  const { data: n } = await svc.rpc('crm_next_number', { p_key: rrKey(r.id, ei < 0 ? 'f' : String(ei)) });
  const owner = roundRobin(users, Number(n ?? 1) - 1, isActive) ?? (r.config.fallbackUserId && isActive(r.config.fallbackUserId) ? r.config.fallbackUserId : null);
  return owner ? { ownerId: owner, ruleId: r.id, followUp: r.config.followUp ?? null } : null;
}

export async function assignmentFollowUp(meta: Meta, rec: CrmRecord, followUp: AssignmentConfig['followUp']) {
  if (!followUp || !rec.owner_id) return;
  const { createRecord } = await import('./records');
  try {
    await createRecord(null, meta, 'tasks', {
      subject: followUp.subject, due_date: resolveValue(`{{today+${followUp.dueInDays}}}`, { ownerId: null }), priority: 'High', related_to: { module: rec.module, id: rec.id },
    }, { actorKind: 'automation', source: 'automation', ownerId: rec.owner_id, skipAutomation: true, allowDuplicate: true });
  } catch (e) {
    console.error('[crm] follow-up task failed', e);
  }
}

/** "Run assignment rule" on existing records (admin mass action). */
export async function applyAssignment(ctx: CrmContext, meta: Meta, module: string, ids: string[], onlyUnassigned = true) {
  if (!canSetup(ctx, 'manage_automation')) throw new CrmAccessError('You can’t run assignment rules.');
  const rule = forModule((await loadRules()).assignment, module)[0];
  if (!rule) throw new CrmUserError('There is no active assignment rule for this module.');
  const { updateRecord, loadRecordRaw } = await import('./records');
  const svc = createServiceClient();
  let n = 0;
  for (const id of ids.filter(isUuid).slice(0, 500)) {
    const rec = await loadRecordRaw(svc, id);
    if (!rec || rec.module !== module || rec.deleted_at || rec.locked || rec.approval_status === 'pending' || (onlyUnassigned && rec.owner_id)) continue;
    const pick = await assignOwnerFor(module, rec.data, rule.config.applyTo[0]);
    if (!pick) continue;
    try {
      const after = await updateRecord(null, meta, module, id, {}, { ownerId: pick.ownerId, actorKind: 'system', actorIdOverride: ctx.userId, source: 'automation', skipAutomation: true });
      await assignmentFollowUp(meta, after, pick.followUp);
      n++;
    } catch (e) {
      console.error('[crm] assignment failed for', id, e);
    }
  }
  await audit(svc, { actor_id: ctx.userId, action: 'assignment_run', module, meta: { rule: rule.name, assigned: n } });
  return n;
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

async function touchesFor(svc: SupabaseClient, ids: string[]): Promise<Map<string, Touches>> {
  const m = new Map<string, Touches>(ids.map((id) => [id, { email_open: 0, email_click: 0, form_submit: 0, survey_answer: 0 }]));
  for (let i = 0; i < ids.length; i += 300) {
    const chunk = ids.slice(i, i + 300);
    const [ob, fs, sv] = await Promise.all([
      svc.from('crm_outbox').select('record_id, opened_at, clicked_at').in('record_id', chunk).eq('status', 'sent').limit(20_000),
      svc.from('crm_form_submissions').select('record_id').in('record_id', chunk).eq('status', 'accepted').limit(20_000),
      svc.from('crm_survey_responses').select('record_id').in('record_id', chunk).not('answered_at', 'is', null).limit(20_000),
    ]);
    for (const o of (ob.data ?? []) as Array<{ record_id: string; opened_at: string | null; clicked_at: string | null }>) {
      const t = m.get(o.record_id); if (!t) continue;
      if (o.opened_at) t.email_open++;
      if (o.clicked_at) t.email_click++;
    }
    for (const f of (fs.data ?? []) as Array<{ record_id: string }>) { const t = m.get(f.record_id); if (t) t.form_submit++; }
    for (const s of (sv.data ?? []) as Array<{ record_id: string }>) { const t = m.get(s.record_id); if (t) t.survey_answer++; }
  }
  return m;
}

async function rescore(svc: SupabaseClient, rules: RuleSet, rec: CrmRecord): Promise<number | null> {
  const cfg = forModule(rules.scoring, rec.module)[0];
  if (!cfg) return null;
  const t = (await touchesFor(svc, [rec.id])).get(rec.id);
  const { total } = computeScore(cfg.config, rec, t);
  if (total !== rec.score) await svc.from('crm_records').update({ score: total }).eq('id', rec.id);
  return total;
}

export async function scoreExplanation(rec: CrmRecord) {
  const cfg = forModule((await loadRules()).scoring, rec.module)[0];
  if (!cfg) return null;
  const t = (await touchesFor(createServiceClient(), [rec.id])).get(rec.id);
  return { rule: cfg.name, ...computeScore(cfg.config, rec, t) };
}

export async function rescoreAll(svc: SupabaseClient): Promise<number> {
  const rules = await fetchRules(svc);
  let changed = 0;
  for (const r of rules.scoring) {
    const { rows } = await fetchAll<Record<string, unknown>>((o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', r.config.module).is('deleted_at', null).order('id'), 50_000);
    const recs = rows.map(normalizeRecord);
    const touches = await touchesFor(svc, recs.map((x) => x.id));
    const patch = recs.map((x) => ({ id: x.id, score: computeScore(r.config, x, touches.get(x.id)).total })).filter((p, i) => p.score !== recs[i].score);
    for (let i = 0; i < patch.length; i += 500) {
      const { data } = await svc.rpc('crm_set_scores', { p_rows: patch.slice(i, i + 500) });
      changed += Number(data ?? 0);
    }
  }
  return changed;
}

// ---------------------------------------------------------------------------
// Cadences
// ---------------------------------------------------------------------------

export async function enrollCadence(svc: SupabaseClient, cadenceId: string, rec: CrmRecord, by: string | null): Promise<boolean> {
  const { data } = await svc.from('crm_config').select('id, name, active, module, config').eq('id', cadenceId).eq('kind', 'cadence').maybeSingle();
  const c = data as { id: string; name: string; active: boolean; module: string | null; config: CadenceConfig } | null;
  if (!c || !c.active || c.config.module !== rec.module) throw new CrmUserError('That cadence is not active for this module.');
  if (rec.locked?.kind === 'converted') throw new CrmUserError('Converted leads can’t be enrolled.');
  if (c.config.exitCriteria && evaluate(rec, c.config.exitCriteria)) throw new CrmUserError('This record already meets the cadence’s exit criteria.');
  const next = cadenceDue(new Date(), c.config.steps[0]?.delayDays ?? 0, c.config.businessDays).toISOString();
  const { data: ex } = await svc.from('crm_cadence_enrollments').select('id, status').eq('cadence_id', c.id).eq('record_id', rec.id).maybeSingle();
  if (ex && (ex as { status: string }).status === 'active') return false;
  const row = { cadence_id: c.id, record_id: rec.id, status: 'active', step: 0, next_at: next, enrolled_at: new Date().toISOString(), enrolled_by: by, exited_at: null, exit_reason: null, history: [] };
  if (ex) await svc.from('crm_cadence_enrollments').update(row).eq('id', (ex as { id: string }).id);
  else {
    const { error } = await svc.from('crm_cadence_enrollments').insert(row);
    if (error && error.code !== '23505') throw error;
  }
  await audit(svc, { actor_id: by, actor_kind: by ? 'user' : 'automation', action: 'cadence_enroll', module: rec.module, record_id: rec.id, meta: { cadence: c.name } });
  return true;
}

async function cadenceOnSave(svc: SupabaseClient, rules: RuleSet, rec: CrmRecord) {
  const mine = forModule(rules.cadences, rec.module);
  if (!mine.length) return;
  const { data } = await svc.from('crm_cadence_enrollments').select('id, cadence_id, status').eq('record_id', rec.id);
  const enrolled = (data ?? []) as Array<{ id: string; cadence_id: string; status: string }>;
  for (const c of mine) {
    const e = enrolled.find((x) => x.cadence_id === c.id);
    const exit = (c.config.exitCriteria && evaluate(rec, c.config.exitCriteria)) || rec.locked?.kind === 'converted';
    if (e?.status === 'active' && exit) {
      await svc.from('crm_cadence_enrollments').update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: rec.locked?.kind === 'converted' ? 'lead converted' : 'exit criteria met', next_at: null }).eq('id', e.id);
      continue;
    }
    if (!e && !exit && c.config.autoEnroll && evaluate(rec, c.config.autoEnroll)) {
      try { await enrollCadence(svc, c.id, rec, null); } catch { /* not eligible */ }
    }
  }
}

async function runCadenceSteps(svc: SupabaseClient, meta: Meta): Promise<number> {
  const { data } = await svc.rpc('crm_claim_cadence_steps', { p_limit: 50 });
  const due = (data ?? []) as Array<{ id: string; cadence_id: string; record_id: string; step: number; history: unknown[] }>;
  const { createRecord } = await import('./records');
  const { queueEmails } = await import('./outbox');
  let n = 0;
  for (const en of due) {
    const done = (status: string, reason?: string) => svc.from('crm_cadence_enrollments').update({ status, exited_at: new Date().toISOString(), exit_reason: reason ?? null, next_at: null }).eq('id', en.id);
    const { data: cfgRow } = await svc.from('crm_config').select('id, name, active, config').eq('id', en.cadence_id).maybeSingle();
    const c = cfgRow as { id: string; name: string; active: boolean; config: CadenceConfig } | null;
    if (!c || !c.active) { await svc.from('crm_cadence_enrollments').update({ status: 'paused', next_at: null }).eq('id', en.id); continue; }
    const rec = await reload(svc, en.record_id);
    if (!rec || rec.deleted_at) { await done('exited', 'record deleted'); continue; }
    if (rec.locked?.kind === 'converted') { await done('exited', 'lead converted'); continue; }
    if (rec.locked?.kind === 'dpdp_restricted') { await done('exited', 'privacy restriction'); continue; }
    if (c.config.exitCriteria && evaluate(rec, c.config.exitCriteria)) { await done('exited', 'exit criteria met'); continue; }
    const step = c.config.steps[en.step];
    if (!step) { await done('completed'); continue; }
    let ok = true;
    let err: string | undefined;
    try {
      if (step.type === 'email') {
        const { data: t } = await svc.from('crm_config').select('config, active').eq('id', step.templateId!).eq('kind', 'email_template').maybeSingle();
        if (!t || !(t as { active: boolean }).active) throw new Error('template missing or off');
        await queueEmails(null, meta, { module: rec.module, recordIds: [rec.id], template: validateTemplate((t as { config: unknown }).config), templateId: step.templateId!, source: 'cadence', sourceId: c.id, dedupe: (rid) => `cadence:${en.id}:${en.step}:${rid}` });
      } else {
        const due = resolveValue('{{today}}', { ownerId: null }) as string;
        await createRecord(null, meta, step.type === 'task' ? 'tasks' : 'calls',
          step.type === 'task' ? { subject: step.subject, due_date: due, priority: 'Normal', related_to: { module: rec.module, id: rec.id } } : { subject: step.subject, call_type: 'Outbound', call_status: 'Scheduled', call_purpose: 'Follow-up', related_to: { module: rec.module, id: rec.id } },
          { actorKind: 'automation', source: 'automation', ownerId: rec.owner_id, skipAutomation: true, allowDuplicate: true });
      }
    } catch (e) {
      ok = false;
      err = (e as Error).message.slice(0, 200);
    }
    const history = [...(Array.isArray(en.history) ? en.history : []), { at: new Date().toISOString(), step: en.step, type: step.type, ok, error: err }].slice(-100);
    const nextStep = c.config.steps[en.step + 1];
    if (!nextStep) await svc.from('crm_cadence_enrollments').update({ status: 'completed', step: en.step + 1, next_at: null, exited_at: new Date().toISOString(), history }).eq('id', en.id);
    else await svc.from('crm_cadence_enrollments').update({ step: en.step + 1, next_at: cadenceDue(new Date(), nextStep.delayDays, c.config.businessDays).toISOString(), history }).eq('id', en.id);
    n++;
  }
  return n;
}

async function autoEnrollScan(svc: SupabaseClient): Promise<number> {
  const rules = await fetchRules(svc);
  let n = 0;
  for (const c of rules.cadences.filter((x) => x.config.autoEnroll)) {
    const { rows } = await fetchAll<Record<string, unknown>>((o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', c.config.module).is('deleted_at', null).order('id'), 20_000);
    const { data: ens } = await svc.from('crm_cadence_enrollments').select('record_id').eq('cadence_id', c.id).limit(50_000);
    const have = new Set(((ens ?? []) as Array<{ record_id: string }>).map((x) => x.record_id));
    for (const rec of rows.map(normalizeRecord)) {
      if (have.has(rec.id) || !evaluate(rec, c.config.autoEnroll!) || (c.config.exitCriteria && evaluate(rec, c.config.exitCriteria))) continue;
      try { if (await enrollCadence(svc, c.id, rec, null)) n++; } catch { /* skip */ }
      if (n >= 500) return n;
    }
  }
  return n;
}

// ---------------------------------------------------------------------------
// Macros
// ---------------------------------------------------------------------------

export async function runMacro(ctx: CrmContext, meta: Meta, macroId: string, recordIds: string[]) {
  const m = (await loadRules()).macros.find((x) => x.id === macroId);
  if (!m) throw new CrmUserError('That macro is not active.');
  if (!ctx.superAdmin && m.config.roleIds.length && !(ctx.roleId && m.config.roleIds.includes(ctx.roleId))) throw new CrmAccessError('This macro is not shared with you.');
  if (!can(ctx, m.config.module, 'edit')) throw new CrmAccessError('You can’t edit these records.');
  const { accessTo, loadRecordRaw } = await import('./records');
  const svc = createServiceClient();
  const out = { done: 0, skipped: 0, failed: 0 };
  for (const id of recordIds.filter(isUuid).slice(0, 200)) {
    const rec = await loadRecordRaw(svc, id);
    if (!rec || rec.module !== m.config.module || rec.deleted_at || !allows(accessTo(ctx, meta, rec), 'rw')) { out.skipped++; continue; }
    const res = await executeActions(svc, meta, m.config.actions, rec, { chain: [m.id], depth: 0, ruleId: m.id, source: 'macro', runKey: `${ctx.userId}:${Date.now()}`, ctx });
    if (res.every((r) => r.ok)) out.done++; else out.failed++;
    await audit(svc, { actor_id: ctx.userId, action: 'macro_run', module: rec.module, record_id: rec.id, meta: { macro: m.name, actions: res } });
  }
  return out;
}

export async function macrosFor(ctx: CrmContext, module: string) {
  return forModule((await loadRules()).macros, module)
    .filter((m) => ctx.superAdmin || !m.config.roleIds.length || (ctx.roleId && m.config.roleIds.includes(ctx.roleId)))
    .map((m) => ({ id: m.id, name: m.name, description: m.config.description ?? '' }));
}

export async function cadencesFor(module: string) {
  return forModule((await loadRules()).cadences, module).map((c) => ({ id: c.id, name: c.name, steps: c.config.steps.length }));
}

// ---------------------------------------------------------------------------
// Scheduler entry points (jobs.ts)
// ---------------------------------------------------------------------------

/** Due scheduled actions, blueprint SLA timers and cadence steps. */
export async function runScheduled(svc: SupabaseClient, meta: Meta) {
  const out = { jobs: 0, cancelled: 0, failed: 0, cadenceSteps: 0, dateFired: 0 };
  const rules = await fetchRules(svc);
  const { data } = await svc.rpc('crm_claim_jobs', { p_limit: 50 });
  for (const j of (data ?? []) as Array<{ id: string; kind: string; rule_id: string | null; record_id: string | null; payload: Record<string, unknown>; attempts: number }>) {
    const finish = (status: string, err?: string) => svc.from('crm_jobs').update({ status, finished_at: new Date().toISOString(), last_error: err ?? null }).eq('id', j.id);
    try {
      const rec = j.record_id ? await reload(svc, j.record_id) : null;
      if (!rec || rec.deleted_at || rec.locked?.kind === 'converted') { await finish('cancelled', 'record gone or converted'); out.cancelled++; continue; }
      if (j.kind === 'workflow_action') {
        const w = rules.workflows.find((x) => x.id === j.rule_id);
        const ci = Number(j.payload.condition);
        const slot = Number(j.payload.slot);
        const cond = w?.config.conditions[ci];
        if (!w || !cond || !cond.scheduled[slot]) { await finish('cancelled', 'rule changed or off'); out.cancelled++; continue; }
        // Zoho: only if the record still meets that condition
        if (cond.criteria && !evaluate(rec, cond.criteria)) { await finish('cancelled', 'criteria no longer met'); out.cancelled++; continue; }
        const res = await executeActions(svc, meta, cond.scheduled[slot].actions, rec, { chain: [w.id], depth: 0, ruleId: w.id, source: 'workflow', runKey: `job:${j.id}` });
        await audit(svc, { actor_id: null, actor_kind: 'automation', action: 'workflow_scheduled', module: rec.module, record_id: rec.id, meta: { rule: w.id, name: w.name, actions: res } });
      } else if (j.kind === 'blueprint_sla') {
        const b = rules.blueprints.find((x) => x.id === j.rule_id);
        const bp = rec.blueprint as (CrmRecord['blueprint'] & { done?: boolean }) | null;
        const sla = b?.config.sla[Number(j.payload.sla)];
        if (!b || !sla || !bp || bp.id !== b.id || bp.state !== j.payload.state || bp.entered_at !== j.payload.enteredAt) { await finish('cancelled', 'record moved on'); out.cancelled++; continue; }
        const res = await executeActions(svc, meta, sla.actions, rec, { chain: [b.id], depth: 0, ruleId: b.id, source: 'sla', runKey: `bpsla:${j.id}` });
        await audit(svc, { actor_id: null, actor_kind: 'automation', action: 'blueprint_sla', module: rec.module, record_id: rec.id, meta: { blueprint: b.name, state: sla.state, hours: sla.hours, actions: res } });
      }
      await finish('done');
      out.jobs++;
    } catch (e) {
      out.failed++;
      await svc.from('crm_jobs').update({ status: j.attempts >= 3 ? 'failed' : 'pending', last_error: (e as Error).message.slice(0, 300), run_at: new Date(Date.now() + 10 * 60_000).toISOString() }).eq('id', j.id);
    }
  }
  out.cadenceSteps = await runCadenceSteps(svc, meta);
  out.dateFired = await runDateRules(svc, meta, rules);
  return out;
}

/** Date-based workflow rules: fire once per record per fire day (dedupe in crm_jobs). */
async function runDateRules(svc: SupabaseClient, meta: Meta, rules: RuleSet): Promise<number> {
  const today = new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10);
  let fired = 0;
  for (const w of rules.workflows.filter((x) => x.config.trigger.type === 'date')) {
    const last = w.config.lastScan ?? null;
    if (last === today) continue;
    const { rows } = await fetchAll<Record<string, unknown>>((o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', w.config.module).is('deleted_at', null).order('id'), 50_000);
    for (const rec of rows.map(normalizeRecord)) {
      const day = dateFireDay(w.config, rec);
      if (!day || day > today || (last ? day <= last : day < today)) continue;
      const ci = matchCondition(w.config, rec, null);
      if (ci < 0) continue;
      const key = `date:${w.id}:${rec.id}:${day}`;
      const { data: ins } = await svc.from('crm_jobs').upsert({ kind: 'date_trigger', rule_id: w.id, record_id: rec.id, run_at: new Date().toISOString(), status: 'done', finished_at: new Date().toISOString(), dedupe_key: key, payload: { day } }, { onConflict: 'dedupe_key', ignoreDuplicates: true }).select('id');
      if (!ins?.length) continue;
      await runWorkflow(svc, meta, w, ci, rec, [], 0, `date:${day}`);
      fired++;
      if (fired >= 1000) break;
    }
    await svc.from('crm_config').update({ config: { ...w.config, lastScan: today } }).eq('id', w.id);
  }
  return fired;
}

/** Once a day: full rescore and cadence auto-enrolment. */
export async function runDaily(svc: SupabaseClient, _meta: Meta) {
  return { rescored: await rescoreAll(svc), autoEnrolled: await autoEnrollScan(svc) };
}
