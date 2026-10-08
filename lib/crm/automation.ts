/**
 * Automation — pure half. Config shapes and validators for every rule kind
 * (workflow, blueprint, approval process, assignment, scoring, validation,
 * layout, macro, cadence, webhook), plus the decisions that don't need I/O:
 * which workflow condition matches, which blueprint transitions a user may
 * run, layout effects, scores with explanations, loop guards, value tokens,
 * and the private-address check behind webhook SSRF protection.
 *
 * Behaviour follows Zoho CRM where it is documented (see docs/crm/DESIGN.md):
 *  - workflow conditions are tried in order; the first match runs, later
 *    ones are not tested;
 *  - within an action set: field updates → assignment → tags → emails, then
 *    the rest;
 *  - a rule re-triggered by its own update runs at most twice; a chain stops
 *    at depth 3;
 *  - a record in a Blueprint can change the Blueprint field only through a
 *    transition;
 *  - a record waiting for approval is locked;
 *  - assignment rules apply to records created by web forms, imports and the
 *    API (not manual entry); macros are manual only.
 */
import { evaluate, validateCriteria } from './criteria';
import { coerceValue, isUuid } from './fields';
import type { Criteria, CrmRecord, FieldDef } from './types';

export const AUTOMATION_KINDS = ['workflow', 'blueprint', 'approval_process', 'assignment_rule', 'scoring_rule', 'validation_rule', 'layout_rule', 'macro', 'cadence', 'webhook'] as const;
export type AutomationKind = (typeof AUTOMATION_KINDS)[number];

/** Minimal metadata the validators need (Meta satisfies this). */
export interface MetaLike {
  module: (api: string) => { api_name: string; label: string; settings: { emailField?: string } } | undefined;
  fields: (api: string) => FieldDef[];
}

export class RuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleError';
  }
}

const COMPUTED = new Set(['autonumber', 'formula', 'rollup', 'json', 'line_items']);
const s = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim().slice(0, max) : '');
const int = (v: unknown, min: number, max: number, d: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : d;
};
const crit = (raw: unknown, fields: FieldDef[]): Criteria | null => {
  if (!raw) return null;
  const c = validateCriteria(raw, fields);
  return c.conditions.length ? c : null;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export const ACTION_TYPES = ['field_update', 'assign', 'tag', 'email', 'notify', 'task', 'call', 'create_record', 'add_to_campaign', 'enroll_cadence', 'unenroll_cadence', 'webhook'] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export interface Action {
  type: ActionType;
  /** field_update */
  field?: string;
  value?: unknown;
  /** task / call */
  subject?: string;
  dueInDays?: number;
  priority?: string;
  description?: string;
  /** task / call / notify: 'owner' | 'owner_managers' | user id */
  to?: string;
  /** email */
  templateId?: string;
  /** notify */
  title?: string;
  /** tag */
  add?: string[];
  remove?: string[];
  /** assign: one user, or several → round robin */
  userIds?: string[];
  /** webhook */
  webhookId?: string;
  /** create_record */
  module?: string;
  values?: Record<string, unknown>;
  /** add_to_campaign */
  campaignId?: string;
  /** enroll_cadence / unenroll_cadence */
  cadenceId?: string;
}

/** Execution order inside one action set (Zoho: field updates, then tags, then emails, then the rest). */
export const ACTION_ORDER: ActionType[] = ['field_update', 'assign', 'tag', 'email', 'notify', 'task', 'call', 'create_record', 'add_to_campaign', 'enroll_cadence', 'unenroll_cadence', 'webhook'];
export const orderActions = (a: Action[]) => [...a].sort((x, y) => ACTION_ORDER.indexOf(x.type) - ACTION_ORDER.indexOf(y.type));

/** Per-set limits (Zoho Enterprise). */
const SET_LIMITS: Partial<Record<ActionType, number>> = { email: 5, task: 5, call: 5, field_update: 5, webhook: 1, create_record: 1, notify: 5, tag: 1, assign: 1, add_to_campaign: 3, enroll_cadence: 1, unenroll_cadence: 1 };

const TOKEN_RE = /^\{\{\s*(now|today|owner)\s*(?:([+-])\s*(\d{1,4}))?\s*\}\}$/;

/** Is this field writable by automation? (not system/computed/read-only; synced only where people may edit it) */
export function automatable(f: FieldDef | undefined, unlockedSynced: string[] = []): boolean {
  if (!f || f.active === false) return false;
  if (f.system || f.readonly || COMPUTED.has(f.type)) return false;
  if (f.synced && !unlockedSynced.includes(f.api_name)) return false;
  return true;
}

/** Synced fields people may still edit (see engine.SYNC_UNLOCKED). Kept here so this file stays pure. */
const UNLOCKED_SYNCED: Record<string, string[]> = { deals: ['stage', 'lost_reason', 'probability'], cases: ['status', 'type', 'contact_id'] };

export interface ActionContext {
  meta: MetaLike;
  module: string;
  /** ids of existing configs the action may reference, by kind */
  known?: { templates?: Set<string>; webhooks?: Set<string>; cadences?: Set<string>; campaigns?: Set<string>; users?: Set<string> };
  allow?: ActionType[];
}

export function cleanAction(raw: unknown, c: ActionContext): Action {
  const r = (raw ?? {}) as Partial<Action>;
  const type = r.type as ActionType;
  if (!ACTION_TYPES.includes(type)) throw new RuleError('Unknown action.');
  if (c.allow && !c.allow.includes(type)) throw new RuleError(`“${type.replace(/_/g, ' ')}” can't be used here.`);
  const fields = c.meta.fields(c.module);
  const userRef = (v: unknown, label: string) => {
    if (v === 'owner' || v === 'owner_managers') return v;
    if (isUuid(v) && (!c.known?.users || c.known.users.has(v))) return v;
    throw new RuleError(`${label}: pick the record owner, their managers or a CRM user.`);
  };
  switch (type) {
    case 'field_update': {
      const f = fields.find((x) => x.api_name === r.field);
      if (!automatable(f, UNLOCKED_SYNCED[c.module])) throw new RuleError(`Field “${String(r.field)}” can't be updated by automation.`);
      let value = r.value;
      if (typeof value === 'string' && TOKEN_RE.test(value)) {
        const t = value.match(TOKEN_RE)![1];
        if (t === 'owner' && f!.type !== 'user') throw new RuleError('{{owner}} only fits a user field.');
        if ((t === 'now' || t === 'today') && !['date', 'datetime'].includes(f!.type)) throw new RuleError(`{{${t}}} only fits a date field.`);
      } else if (value !== null && value !== '' && value !== undefined) {
        try { value = coerceValue(f!, value); } catch { throw new RuleError(`“${f!.label}”: that value is not valid.`); }
      } else value = null;
      return { type, field: f!.api_name, value };
    }
    case 'assign': {
      const ids = (Array.isArray(r.userIds) ? r.userIds : []).filter((x) => isUuid(x) && (!c.known?.users || c.known.users.has(x))).slice(0, 25);
      if (!ids.length) throw new RuleError('Assign: pick at least one CRM user.');
      return { type, userIds: [...new Set(ids)] };
    }
    case 'tag': {
      const clean = (a: unknown) => (Array.isArray(a) ? a.map((x) => s(x, 40)).filter(Boolean).slice(0, 10) : []);
      const add = clean(r.add);
      const remove = clean(r.remove);
      if (!add.length && !remove.length) throw new RuleError('Tag: add or remove at least one tag.');
      return { type, add, remove };
    }
    case 'email': {
      if (!c.meta.module(c.module)?.settings.emailField) throw new RuleError(`${c.meta.module(c.module)?.label ?? c.module} have no email field to send to.`);
      if (!isUuid(r.templateId) || (c.known?.templates && !c.known.templates.has(r.templateId))) throw new RuleError('Email: pick a template.');
      return { type, templateId: r.templateId };
    }
    case 'notify': {
      const title = s(r.title, 200);
      if (!title) throw new RuleError('Notification: write a title.');
      return { type, to: userRef(r.to ?? 'owner', 'Notification'), title };
    }
    case 'task':
    case 'call': {
      const subject = s(r.subject, 250);
      if (!subject) throw new RuleError(`${type === 'task' ? 'Task' : 'Call'}: write a subject.`);
      return { type, subject, dueInDays: int(r.dueInDays, 0, 365, 1), priority: ['High', 'Normal', 'Low'].includes(String(r.priority)) ? String(r.priority) : 'Normal', to: userRef(r.to ?? 'owner', type), description: s(r.description, 2000) || undefined };
    }
    case 'create_record': {
      const m = c.meta.module(String(r.module));
      if (!m) throw new RuleError('Create record: pick a module.');
      const target = c.meta.fields(m.api_name);
      const values: Record<string, unknown> = {};
      for (const [k, v] of Object.entries((r.values ?? {}) as Record<string, unknown>).slice(0, 30)) {
        const f = target.find((x) => x.api_name === k);
        if (!automatable(f)) throw new RuleError(`Create record: “${k}” can't be set.`);
        values[k] = typeof v === 'string' ? s(v, 2000) : v;
      }
      return { type, module: m.api_name, values };
    }
    case 'add_to_campaign': {
      if (!['leads', 'contacts'].includes(c.module)) throw new RuleError('Only leads and contacts can join campaigns.');
      if (!isUuid(r.campaignId) || (c.known?.campaigns && !c.known.campaigns.has(r.campaignId))) throw new RuleError('Pick a campaign.');
      return { type, campaignId: r.campaignId };
    }
    case 'enroll_cadence':
    case 'unenroll_cadence': {
      if (!isUuid(r.cadenceId) || (c.known?.cadences && !c.known.cadences.has(r.cadenceId))) throw new RuleError('Pick a cadence.');
      return { type, cadenceId: r.cadenceId };
    }
    case 'webhook': {
      if (!isUuid(r.webhookId) || (c.known?.webhooks && !c.known.webhooks.has(r.webhookId))) throw new RuleError('Pick a webhook.');
      return { type, webhookId: r.webhookId };
    }
  }
  throw new RuleError('Unknown action.');
}

export function cleanActions(raw: unknown, c: ActionContext, max = 20): Action[] {
  const list = (Array.isArray(raw) ? raw : []).slice(0, max).map((a) => cleanAction(a, c));
  const counts: Partial<Record<ActionType, number>> = {};
  for (const a of list) {
    counts[a.type] = (counts[a.type] ?? 0) + 1;
    const lim = SET_LIMITS[a.type];
    if (lim && counts[a.type]! > lim) throw new RuleError(`At most ${lim} “${a.type.replace(/_/g, ' ')}” action(s) per set.`);
  }
  return list;
}

/** Resolve {{now}}, {{today±N}} (IST dates) and {{owner}} in a field-update value. */
export function resolveValue(v: unknown, ctx: { ownerId: string | null; now?: Date }): unknown {
  if (typeof v !== 'string') return v;
  const m = v.match(TOKEN_RE);
  if (!m) return v;
  const now = ctx.now ?? new Date();
  const shift = m[2] ? (m[2] === '-' ? -1 : 1) * Number(m[3]) : 0;
  if (m[1] === 'owner') return ctx.ownerId;
  if (m[1] === 'now') return new Date(now.getTime() + shift * 86_400_000).toISOString();
  const ist = new Date(now.getTime() + 330 * 60_000 + shift * 86_400_000);
  return ist.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Loop guard
// ---------------------------------------------------------------------------

export const MAX_CHAIN = 3;
/** May rule `id` run now, given the chain of rules that led to this save? */
export function chainAllows(chain: string[], id: string): boolean {
  return chain.length < MAX_CHAIN && chain.filter((x) => x === id).length < 2;
}

// ---------------------------------------------------------------------------
// Workflow rules
// ---------------------------------------------------------------------------

export type TriggerType = 'create' | 'edit' | 'create_or_edit' | 'field_update' | 'delete' | 'date' | 'score';

export interface WorkflowCondition {
  criteria: Criteria | null;
  actions: Action[];
  scheduled: Array<{ delayMinutes: number; actions: Action[] }>;
}

export interface WorkflowConfig {
  module: string;
  trigger: {
    type: TriggerType;
    fields?: string[];
    date?: { field: string; offsetDays: number; repeat: 'once' | 'yearly' };
    score?: 'increase' | 'decrease' | 'any';
  };
  conditions: WorkflowCondition[];
  description?: string;
  lastScan?: string;
}

export function cleanWorkflow(raw: unknown, meta: MetaLike, known?: ActionContext['known']): WorkflowConfig {
  const r = (raw ?? {}) as Partial<WorkflowConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const t = (r.trigger ?? {}) as WorkflowConfig['trigger'];
  const type = (['create', 'edit', 'create_or_edit', 'field_update', 'delete', 'date', 'score'] as TriggerType[]).includes(t.type) ? t.type : null;
  if (!type) throw new RuleError('Pick when the rule runs.');
  const trigger: WorkflowConfig['trigger'] = { type };
  if (type === 'field_update') {
    const fs = (Array.isArray(t.fields) ? t.fields : []).filter((f) => fields.some((x) => x.api_name === f)).slice(0, 5);
    if (!fs.length) throw new RuleError('Pick up to 5 fields whose change runs the rule.');
    trigger.fields = [...new Set(fs)];
  }
  if (type === 'date') {
    const f = fields.find((x) => x.api_name === t.date?.field && ['date', 'datetime'].includes(x.type));
    if (!f) throw new RuleError('Pick a date field for a date-based rule.');
    trigger.date = { field: f.api_name, offsetDays: int(t.date?.offsetDays, -365, 365, 0), repeat: t.date?.repeat === 'yearly' ? 'yearly' : 'once' };
  }
  if (type === 'score') trigger.score = t.score === 'increase' || t.score === 'decrease' ? t.score : 'any';
  // delete rules: the record is gone, so only notifications and webhooks make sense (Zoho: email alert, webhook, function)
  const allow: ActionType[] | undefined = type === 'delete' ? ['notify', 'webhook'] : undefined;
  const ac: ActionContext = { meta, module, known, allow };
  const conds = (Array.isArray(r.conditions) ? r.conditions : []).slice(0, 10).map((cnd) => {
    const c = (cnd ?? {}) as Partial<WorkflowCondition>;
    const actions = cleanActions(c.actions, ac);
    const scheduled = type === 'delete' ? [] : (Array.isArray(c.scheduled) ? c.scheduled : []).slice(0, 5).map((sc) => ({
      delayMinutes: int(sc?.delayMinutes, 1, 365 * 24 * 60, 60),
      actions: cleanActions(sc?.actions, ac),
    })).filter((sc) => sc.actions.length);
    if (!actions.length && !scheduled.length) throw new RuleError('Each condition needs at least one action.');
    return { criteria: crit(c.criteria, fields), actions, scheduled };
  });
  if (!conds.length) throw new RuleError('Add at least one condition with an action.');
  return { module, trigger, conditions: conds, description: s(r.description, 300) || undefined, lastScan: typeof r.lastScan === 'string' ? r.lastScan : undefined };
}

export interface SaveFacts {
  event: 'create' | 'edit' | 'delete';
  before: Pick<CrmRecord, 'data'> & Partial<CrmRecord> | null;
  after: Pick<CrmRecord, 'data'> & Partial<CrmRecord>;
  scoreBefore?: number | null;
  scoreAfter?: number | null;
}

/** Does this save fire the rule's trigger? (conditions are checked separately) */
export function triggerFires(w: WorkflowConfig, f: SaveFacts): boolean {
  const t = w.trigger;
  switch (t.type) {
    case 'create': return f.event === 'create';
    case 'edit': return f.event === 'edit';
    case 'create_or_edit': return f.event === 'create' || f.event === 'edit';
    case 'delete': return f.event === 'delete';
    case 'field_update':
      if (f.event === 'create') return (t.fields ?? []).some((k) => f.after.data[k] !== undefined && f.after.data[k] !== null && f.after.data[k] !== '');
      return f.event === 'edit' && (t.fields ?? []).some((k) => JSON.stringify(f.before?.data[k] ?? null) !== JSON.stringify(f.after.data[k] ?? null));
    case 'score': {
      if (f.event === 'delete' || f.scoreAfter === undefined || f.scoreAfter === f.scoreBefore) return false;
      const up = (f.scoreAfter ?? 0) > (f.scoreBefore ?? 0);
      return t.score === 'any' || (t.score === 'increase' ? up : !up);
    }
    default: return false; // date rules fire from the scheduler
  }
}

/** First matching condition (Zoho: later conditions are not tested once one matches). */
export function matchCondition(w: WorkflowConfig, rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, before?: (Pick<CrmRecord, 'data'> & Partial<CrmRecord>) | null): number {
  for (let i = 0; i < w.conditions.length; i++) {
    const c = w.conditions[i].criteria;
    const prev = before ? { data: before.data, owner_id: before.owner_id ?? null, tags: before.tags ?? [], name: before.name ?? '' } : null;
    if (!c || evaluate(rec, c, { prev })) return i;
  }
  return -1;
}

/** IST calendar date (YYYY-MM-DD) a date rule fires for this record, or null. */
export function dateFireDay(w: WorkflowConfig, rec: Pick<CrmRecord, 'data'>, now: Date = new Date()): string | null {
  const d = w.trigger.date;
  if (!d) return null;
  const raw = rec.data[d.field];
  if (typeof raw !== 'string' || !raw) return null;
  const base = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00+05:30`) : new Date(raw);
  if (!Number.isFinite(base.getTime())) return null;
  const istDay = (t: Date) => new Date(t.getTime() + 330 * 60_000).toISOString().slice(0, 10);
  const fire = new Date(base.getTime() + d.offsetDays * 86_400_000);
  if (d.repeat === 'yearly') {
    const thisYear = new Date(now.getTime() + 330 * 60_000).getUTCFullYear();
    const md = istDay(fire).slice(5);
    if (md === '02-29' && !((thisYear % 4 === 0 && thisYear % 100 !== 0) || thisYear % 400 === 0)) return `${thisYear}-02-28`;
    return `${thisYear}-${md}`;
  }
  return istDay(fire);
}

// ---------------------------------------------------------------------------
// Blueprints
// ---------------------------------------------------------------------------

export interface Transition {
  id: string;
  name: string;
  from: string[];
  /** available from every state */
  common?: boolean;
  to: string;
  owners: { type: 'owner' | 'users' | 'roles' | 'any'; ids?: string[] };
  showWhen?: Criteria | null;
  requiredFields: string[];
  noteRequired: boolean;
  message?: string;
  after: Action[];
}

export interface BlueprintConfig {
  module: string;
  field: string;
  criteria: Criteria | null;
  states: string[];
  transitions: Transition[];
  sla: Array<{ state: string; hours: number; actions: Action[] }>;
  description?: string;
}

export function cleanBlueprint(raw: unknown, meta: MetaLike, known?: ActionContext['known']): BlueprintConfig {
  const r = (raw ?? {}) as Partial<BlueprintConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const field = fields.find((f) => f.api_name === r.field && f.type === 'picklist');
  if (!field) throw new RuleError('A Blueprint runs on one picklist field (e.g. Stage or Status).');
  const values = (field.options?.picklist ?? []).map((p) => p.value);
  // deal stages come from pipelines, not the picklist: accept any non-empty keys for deals.stage
  const okState = (v: unknown) => typeof v === 'string' && v.length > 0 && v.length <= 60 && (module === 'deals' && field.api_name === 'stage' ? /^[a-z0-9_]+$/.test(v) : values.includes(v));
  const states = [...new Set((Array.isArray(r.states) ? r.states : []).filter(okState))].slice(0, 50);
  if (states.length < 2) throw new RuleError('Pick at least two states.');
  const ac: ActionContext = { meta, module, known };
  const ids = new Set<string>();
  const transitions = (Array.isArray(r.transitions) ? r.transitions : []).slice(0, 100).map((tr, i) => {
    const t = (tr ?? {}) as Partial<Transition>;
    const name = s(t.name, 60);
    if (!name) throw new RuleError(`Transition ${i + 1} needs a name.`);
    const to = String(t.to ?? '');
    if (!states.includes(to)) throw new RuleError(`“${name}”: pick a destination state.`);
    const common = !!t.common;
    const from = common ? [] : [...new Set((Array.isArray(t.from) ? t.from : []).filter((x) => states.includes(x)))];
    if (!common && !from.length) throw new RuleError(`“${name}”: pick the state(s) it starts from.`);
    const id = typeof t.id === 'string' && /^[a-z0-9_-]{1,40}$/i.test(t.id) && !ids.has(t.id) ? t.id : `t${i + 1}`;
    ids.add(id);
    const ownerType = (['owner', 'users', 'roles', 'any'] as const).includes(t.owners?.type as never) ? t.owners!.type : 'owner';
    const req = (Array.isArray(t.requiredFields) ? t.requiredFields : []).filter((f) => automatable(fields.find((x) => x.api_name === f), UNLOCKED_SYNCED[module]) && f !== field.api_name).slice(0, 10);
    return {
      id, name, from, common, to,
      owners: { type: ownerType, ids: ownerType === 'users' || ownerType === 'roles' ? (t.owners?.ids ?? []).filter(isUuid).slice(0, 50) : undefined },
      showWhen: crit(t.showWhen, fields),
      requiredFields: [...new Set(req)],
      noteRequired: !!t.noteRequired,
      message: s(t.message, 500) || undefined,
      after: cleanActions(t.after, ac),
    };
  });
  if (!transitions.length) throw new RuleError('Add at least one transition.');
  if (transitions.filter((t) => t.common).length > 10) throw new RuleError('At most 10 common transitions.');
  const sla = (Array.isArray(r.sla) ? r.sla : []).slice(0, 50).map((x) => ({
    state: String(x?.state ?? ''), hours: int(x?.hours, 1, 24 * 365, 24), actions: cleanActions(x?.actions, ac),
  })).filter((x) => states.includes(x.state) && x.actions.length);
  return { module, field: field.api_name, criteria: crit(r.criteria, fields), states, transitions, sla, description: s(r.description, 300) || undefined };
}

export interface Actor { userId: string; roleId: string | null; superAdmin: boolean }

/** Transitions this actor may run on this record right now. */
export function availableTransitions(bp: BlueprintConfig, rec: Pick<CrmRecord, 'data' | 'owner_id'> & Partial<CrmRecord>, state: string, who: Actor): Transition[] {
  return bp.transitions.filter((t) => {
    if (!(t.common || t.from.includes(state))) return false;
    if (t.common && t.to === state) return false;
    if (t.showWhen && !evaluate(rec, t.showWhen)) return false;
    if (who.superAdmin) return true;
    switch (t.owners.type) {
      case 'any': return true;
      case 'owner': return rec.owner_id === who.userId;
      case 'users': return (t.owners.ids ?? []).includes(who.userId);
      case 'roles': return !!who.roleId && (t.owners.ids ?? []).includes(who.roleId);
    }
    return false;
  });
}

/** States with no way out are terminal: the record finishes the Blueprint there. */
export function isTerminal(bp: BlueprintConfig, state: string): boolean {
  return !bp.transitions.some((t) => (t.common && t.to !== state) || t.from.includes(state));
}

// ---------------------------------------------------------------------------
// Approval processes
// ---------------------------------------------------------------------------

export interface ApprovalStage { name?: string; approvers: { type: 'users' | 'roles' | 'manager'; ids?: string[] }; mode: 'any' | 'all' }
export interface ApprovalConfig {
  module: string;
  trigger: 'create' | 'edit' | 'create_or_edit' | 'manual';
  criteria: Criteria | null;
  stages: ApprovalStage[];
  onApprove: Action[];
  onReject: Action[];
  description?: string;
}

export function cleanApproval(raw: unknown, meta: MetaLike, known?: ActionContext['known']): ApprovalConfig {
  const r = (raw ?? {}) as Partial<ApprovalConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const trigger = (['create', 'edit', 'create_or_edit', 'manual'] as const).includes(r.trigger as never) ? r.trigger! : 'create_or_edit';
  const stages = (Array.isArray(r.stages) ? r.stages : []).slice(0, 5).map((st, i) => {
    const type = (['users', 'roles', 'manager'] as const).includes(st?.approvers?.type as never) ? st.approvers.type : 'manager';
    const ids = type === 'manager' ? undefined : (st.approvers.ids ?? []).filter(isUuid).slice(0, 20);
    if (type !== 'manager' && !ids?.length) throw new RuleError(`Stage ${i + 1}: pick approvers.`);
    return { name: s(st?.name, 60) || undefined, approvers: { type, ids }, mode: st?.mode === 'all' ? 'all' as const : 'any' as const };
  });
  if (!stages.length) throw new RuleError('Add at least one approval stage.');
  const ac: ActionContext = { meta, module, known };
  return { module, trigger, criteria: crit(r.criteria, fields), stages, onApprove: cleanActions(r.onApprove, ac), onReject: cleanActions(r.onReject, ac), description: s(r.description, 300) || undefined };
}

/** Resolve a stage's approvers to user ids. */
export function stageApprovers(
  st: ApprovalStage,
  ownerId: string | null,
  members: Array<{ id: string; roleId: string | null; active: boolean }>,
  roleParents: Record<string, string | null>,
): string[] {
  const active = members.filter((m) => m.active);
  if (st.approvers.type === 'users') return active.filter((m) => st.approvers.ids?.includes(m.id)).map((m) => m.id);
  if (st.approvers.type === 'roles') return active.filter((m) => m.roleId && st.approvers.ids?.includes(m.roleId)).map((m) => m.id);
  // manager: people in the owner's parent role (walk up until someone is there)
  const ownerRole = members.find((m) => m.id === ownerId)?.roleId ?? null;
  let role = ownerRole ? roleParents[ownerRole] ?? null : null;
  for (let guard = 0; role && guard < 20; guard++) {
    const people = active.filter((m) => m.roleId === role && m.id !== ownerId).map((m) => m.id);
    if (people.length) return people;
    role = roleParents[role] ?? null;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Assignment rules
// ---------------------------------------------------------------------------

export type AssignSource = 'webform' | 'import' | 'api' | 'ui';
export interface AssignmentConfig {
  module: string;
  entries: Array<{ criteria: Criteria | null; userIds: string[] }>;
  fallbackUserId: string | null;
  applyTo: AssignSource[];
  followUp?: { subject: string; dueInDays: number } | null;
}

export function cleanAssignment(raw: unknown, meta: MetaLike, users?: Set<string>): AssignmentConfig {
  const r = (raw ?? {}) as Partial<AssignmentConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const okUser = (u: unknown): u is string => isUuid(u) && (!users || users.has(u));
  const entries = (Array.isArray(r.entries) ? r.entries : []).slice(0, 25).map((e, i) => {
    const ids = [...new Set((e?.userIds ?? []).filter(okUser))].slice(0, 25);
    if (!ids.length) throw new RuleError(`Entry ${i + 1}: pick at least one user (several = round robin).`);
    return { criteria: crit(e?.criteria, fields), userIds: ids };
  });
  if (!entries.length) throw new RuleError('Add at least one entry.');
  const applyTo = [...new Set((Array.isArray(r.applyTo) ? r.applyTo : ['webform', 'import', 'api']).filter((x): x is AssignSource => ['webform', 'import', 'api', 'ui'].includes(x as string)))];
  const fu = r.followUp && s(r.followUp.subject, 250) ? { subject: s(r.followUp.subject, 250), dueInDays: int(r.followUp.dueInDays, 0, 60, 1) } : null;
  return { module, entries, fallbackUserId: okUser(r.fallbackUserId) ? r.fallbackUserId : null, applyTo: applyTo.length ? applyTo : ['webform', 'import', 'api'], followUp: fu };
}

/** Which entry matches (first wins); -1 = fallback. */
export function assignmentEntry(cfg: AssignmentConfig, rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>): number {
  return cfg.entries.findIndex((e) => !e.criteria || evaluate(rec, e.criteria));
}

/** Round robin: the n-th assignment (0-based) of an entry goes to users[n mod len], skipping inactive users. */
export function roundRobin(users: string[], n: number, isActive: (id: string) => boolean = () => true): string | null {
  const live = users.filter(isActive);
  if (!live.length) return null;
  return live[((n % live.length) + live.length) % live.length];
}

// ---------------------------------------------------------------------------
// Scoring rules
// ---------------------------------------------------------------------------

export interface ScoringConfig {
  module: string;
  rules: Array<{ criteria: Criteria; points: number; label?: string }>;
  touchpoints: { email_open: number; email_click: number; form_submit: number; survey_answer: number };
}

export function cleanScoring(raw: unknown, meta: MetaLike): ScoringConfig {
  const r = (raw ?? {}) as Partial<ScoringConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const rules = (Array.isArray(r.rules) ? r.rules : []).slice(0, 50).map((x, i) => {
    const c = crit(x?.criteria, fields);
    if (!c) throw new RuleError(`Rule ${i + 1} needs a condition.`);
    const points = int(x?.points, -100, 100, 0);
    if (!points) throw new RuleError(`Rule ${i + 1}: points must be between −100 and 100 (not 0).`);
    return { criteria: c, points, label: s(x?.label, 80) || undefined };
  });
  const tp = (r.touchpoints ?? {}) as Partial<ScoringConfig['touchpoints']>;
  const touchpoints = { email_open: int(tp.email_open, -50, 50, 0), email_click: int(tp.email_click, -50, 50, 0), form_submit: int(tp.form_submit, -50, 50, 0), survey_answer: int(tp.survey_answer, -50, 50, 0) };
  if (!rules.length && !Object.values(touchpoints).some(Boolean)) throw new RuleError('Add at least one rule or touchpoint.');
  return { module, rules, touchpoints };
}

export interface Touches { email_open: number; email_click: number; form_submit: number; survey_answer: number }

export function computeScore(cfg: ScoringConfig, rec: Pick<CrmRecord, 'data'> & Partial<CrmRecord>, touches: Touches = { email_open: 0, email_click: 0, form_submit: 0, survey_answer: 0 }) {
  const matched: Array<{ label: string; points: number }> = [];
  for (const r of cfg.rules) if (evaluate(rec, r.criteria)) matched.push({ label: r.label ?? 'Rule', points: r.points });
  for (const [k, per] of Object.entries(cfg.touchpoints) as Array<[keyof Touches, number]>) {
    const n = Math.min(touches[k] ?? 0, 10); // cap each touchpoint at 10 occurrences
    if (per && n) matched.push({ label: `${k.replace('_', ' ')} ×${n}`, points: per * n });
  }
  const positive = matched.filter((m) => m.points > 0).reduce((a, m) => a + m.points, 0);
  const negative = matched.filter((m) => m.points < 0).reduce((a, m) => a + m.points, 0);
  return { total: positive + negative, positive, negative, matched };
}

// ---------------------------------------------------------------------------
// Validation and layout rules
// ---------------------------------------------------------------------------

export interface ValidationConfig { module: string; criteria: Criteria; field: string; message: string; on: 'create' | 'edit' | 'both' }

export function cleanValidation(raw: unknown, meta: MetaLike): ValidationConfig {
  const r = (raw ?? {}) as Partial<ValidationConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const c = crit(r.criteria, fields);
  if (!c) throw new RuleError('Say when the record is invalid (at least one condition).');
  const field = fields.find((f) => f.api_name === r.field)?.api_name ?? c.conditions.map((x) => ('field' in x ? x.field : '')).find((f) => fields.some((y) => y.api_name === f)) ?? fields[0]?.api_name;
  const message = s(r.message, 200);
  if (!message) throw new RuleError('Write the error message people will see.');
  return { module, criteria: c, field: field ?? 'name', message, on: r.on === 'create' || r.on === 'edit' ? r.on : 'both' };
}

export function validationErrors(rules: ValidationConfig[], data: Record<string, unknown>, event: 'create' | 'edit', extra: Partial<CrmRecord> = {}): Array<{ field: string; message: string }> {
  const out: Array<{ field: string; message: string }> = [];
  for (const r of rules) {
    if (r.on !== 'both' && r.on !== event) continue;
    if (evaluate({ ...extra, data }, r.criteria)) out.push({ field: r.field, message: r.message });
  }
  return out;
}

export interface LayoutRuleConfig { module: string; when: Criteria; show: string[]; require: string[] }

export function cleanLayoutRule(raw: unknown, meta: MetaLike): LayoutRuleConfig {
  const r = (raw ?? {}) as Partial<LayoutRuleConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const when = crit(r.when, fields);
  if (!when) throw new RuleError('Say when the rule applies.');
  const okF = (f: unknown) => typeof f === 'string' && automatable(fields.find((x) => x.api_name === f), UNLOCKED_SYNCED[module]);
  const show = [...new Set((Array.isArray(r.show) ? r.show : []).filter(okF))].slice(0, 30) as string[];
  const require = [...new Set((Array.isArray(r.require) ? r.require : []).filter(okF))].slice(0, 30) as string[];
  if (!show.length && !require.length) throw new RuleError('Pick fields to show or make required.');
  return { module, when, show, require };
}

/** Fields hidden by layout rules (shown only when their rule matches) and fields required right now. */
export function layoutEffect(rules: LayoutRuleConfig[], data: Record<string, unknown>) {
  const hidden = new Set<string>();
  const required = new Set<string>();
  for (const r of rules) for (const f of r.show) hidden.add(f);
  for (const r of rules) {
    if (!evaluate({ data }, r.when)) continue;
    for (const f of r.show) hidden.delete(f);
    for (const f of r.require) required.add(f);
  }
  for (const f of hidden) required.delete(f);
  return { hidden: [...hidden], required: [...required] };
}

// ---------------------------------------------------------------------------
// Macros and cadences
// ---------------------------------------------------------------------------

export interface MacroConfig { module: string; actions: Action[]; roleIds: string[]; description?: string }

export function cleanMacro(raw: unknown, meta: MetaLike, known?: ActionContext['known']): MacroConfig {
  const r = (raw ?? {}) as Partial<MacroConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const actions = cleanActions(r.actions, { meta, module, known, allow: ['field_update', 'task', 'call', 'email', 'tag', 'notify', 'enroll_cadence', 'add_to_campaign'] }, 10);
  if (!actions.length) throw new RuleError('Add at least one action.');
  const n = (t: ActionType) => actions.filter((a) => a.type === t).length;
  if (n('email') > 1 || n('task') > 3 || n('field_update') > 3) throw new RuleError('A macro holds at most 1 email, 3 tasks and 3 field updates.');
  return { module, actions, roleIds: (Array.isArray(r.roleIds) ? r.roleIds : []).filter(isUuid).slice(0, 50), description: s(r.description, 300) || undefined };
}

export interface CadenceStep { id: string; type: 'email' | 'task' | 'call'; templateId?: string; subject?: string; delayDays: number }
export interface CadenceConfig { module: string; steps: CadenceStep[]; exitCriteria: Criteria | null; autoEnroll: Criteria | null; businessDays: boolean; description?: string }

export function cleanCadence(raw: unknown, meta: MetaLike, known?: ActionContext['known']): CadenceConfig {
  const r = (raw ?? {}) as Partial<CadenceConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const fields = meta.fields(module);
  const steps = (Array.isArray(r.steps) ? r.steps : []).slice(0, 70).map((st, i) => {
    const type = st?.type === 'task' || st?.type === 'call' ? st.type : 'email';
    const base = { id: `s${i + 1}`, type, delayDays: int(st?.delayDays, 0, 365, i === 0 ? 0 : 2) } as CadenceStep;
    if (type === 'email') {
      if (!meta.module(module)?.settings.emailField) throw new RuleError('This module has no email field; use task or call steps.');
      if (!isUuid(st?.templateId) || (known?.templates && !known.templates.has(st.templateId))) throw new RuleError(`Step ${i + 1}: pick an email template.`);
      base.templateId = st.templateId;
    } else {
      base.subject = s(st?.subject, 250);
      if (!base.subject) throw new RuleError(`Step ${i + 1}: write a subject.`);
    }
    return base;
  });
  if (!steps.length) throw new RuleError('Add at least one step.');
  return { module, steps, exitCriteria: crit(r.exitCriteria, fields), autoEnroll: crit(r.autoEnroll, fields), businessDays: !!r.businessDays, description: s(r.description, 300) || undefined };
}

/** When the next cadence step is due (business days skip Sunday — MECE works Mon–Sat). */
export function cadenceDue(from: Date, delayDays: number, businessDays: boolean): Date {
  if (!businessDays) return new Date(from.getTime() + delayDays * 86_400_000);
  let t = from.getTime();
  let left = delayDays;
  while (left > 0) {
    t += 86_400_000;
    if (new Date(t + 330 * 60_000).getUTCDay() !== 0) left--;
  }
  return new Date(t);
}

// ---------------------------------------------------------------------------
// Webhooks (SSRF guard is here; the request itself is in server/webhooks.ts)
// ---------------------------------------------------------------------------

export interface WebhookConfig { url: string; module: string; fields: string[]; secret: string; description?: string }

export function cleanWebhook(raw: unknown, meta: MetaLike, existingSecret?: string): WebhookConfig {
  const r = (raw ?? {}) as Partial<WebhookConfig>;
  const module = String(r.module ?? '');
  if (!meta.module(module)) throw new RuleError('Pick a module.');
  const url = s(r.url, 500);
  let u: URL;
  try { u = new URL(url); } catch { throw new RuleError('Enter a full https:// URL.'); }
  if (u.protocol !== 'https:') throw new RuleError('Webhooks must use https://');
  if (u.username || u.password) throw new RuleError('Put credentials in a header on the receiving side, not in the URL.');
  if (u.port && u.port !== '443') throw new RuleError('Only the standard https port (443) is allowed.');
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || !host.includes('.')) throw new RuleError('That address is not reachable from the internet.');
  if (isIpLiteral(host) && isPrivateIp(host.replace(/^\[|\]$/g, ''))) throw new RuleError('Private and internal addresses are not allowed.');
  const fields = meta.fields(module);
  const keep = (Array.isArray(r.fields) ? r.fields : []).filter((f) => fields.some((x) => x.api_name === f)).slice(0, 50);
  const secret = typeof existingSecret === 'string' && existingSecret.length >= 32 ? existingSecret : typeof r.secret === 'string' && /^[A-Za-z0-9_-]{32,64}$/.test(r.secret) ? r.secret : '';
  return { url: u.toString(), module, fields: [...new Set(keep)], secret, description: s(r.description, 300) || undefined };
}

export function isIpLiteral(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, '');
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(':');
}

/** Loopback, private, link-local, CGNAT, metadata, multicast, reserved, unspecified (v4 and v6, incl. v4-mapped). */
export function isPrivateIp(ip: string): boolean {
  let a = ip.toLowerCase().replace(/^\[|\]$/g, '');
  const mapped = a.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) a = mapped[1];
  const hexMapped = a.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16);
    const lo = parseInt(hexMapped[2], 16);
    a = `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(a)) {
    const [p, q] = a.split('.').map(Number);
    if (a.split('.').some((x) => Number(x) > 255)) return true;
    return p === 0 || p === 10 || p === 127 || (p === 169 && q === 254) || (p === 172 && q >= 16 && q <= 31) || (p === 192 && q === 168)
      || (p === 100 && q >= 64 && q <= 127) || (p === 192 && q === 0) || (p === 198 && (q === 18 || q === 19)) || p >= 224;
  }
  if (a === '::' || a === '::1') return true;
  if (/^f[cd][0-9a-f]{2}:/.test(a)) return true; // fc00::/7 unique local
  if (/^fe[89ab][0-9a-f]:/.test(a)) return true; // fe80::/10 link-local
  if (/^ff/.test(a)) return true; // multicast
  if (/^::ffff:/.test(a) || /^64:ff9b:/.test(a) || /^2001:db8:/.test(a)) return true; // other mapped/NAT64/doc ranges
  return false;
}
