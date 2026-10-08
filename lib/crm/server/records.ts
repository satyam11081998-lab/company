/**
 * Records engine (server half). Every read and write of crm_records goes
 * through here, and every function takes the caller's CrmContext:
 *  - module permission (view/create/edit/delete) from the profile,
 *  - record access (owner, hierarchy, sharing rules, territories, shares),
 *  - field security (hidden fields stripped, read-only fields refused),
 *  - locks (manual/record-lock rules, conversion, approval, blueprint),
 *  - optimistic concurrency on update,
 *  - audit + stage history + automation hooks.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { criteriaFields, evaluate, validateCriteria } from '@/lib/crm/criteria';
import { diff, isSyncedRecord, prepareRecord } from '@/lib/crm/engine';
import { isEmpty, isUuid } from '@/lib/crm/fields';
import { allows, can, fieldAccess, recordAccess, visibleData } from '@/lib/crm/permissions';
import type { AccessLevel, Criteria, CrmContext, CrmRecord, FieldDef, ModuleDef } from '@/lib/crm/types';
import { RECORD_COLUMNS } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, ilikeEscape, normalizeRecord, orSafe } from './db';
import { afterDelete, afterSave, assignmentFollowUp, assignOwnerFor, beforeSave, layoutRequired } from './automation';
import { isActiveMember } from './members';
import type { Meta } from './meta';

export type Source = 'ui' | 'import' | 'webform' | 'api' | 'automation' | 'sync' | 'convert' | 'merge' | 'system' | 'blueprint';

export interface SaveOptions {
  source?: Source;
  sourceRef?: string | null;
  expectedUpdatedAt?: string | null;
  skipAutomation?: boolean;
  depth?: number;
  allowSystem?: string[];
  allowSynced?: boolean;
  allowDuplicate?: boolean;
  /** for internal writes that are not a person (automation, public forms) */
  actorKind?: 'user' | 'automation' | 'api' | 'public' | 'system';
  /** rules that led to this write (loop guard) */
  chain?: string[];
  /** a person acting through a system write (blueprint transition, assignment run): audit + updated_by */
  actorIdOverride?: string | null;
}

/** Fields whose changes are written to crm_stage_history. */
const STAGE_FIELDS: Record<string, string> = { deals: 'stage', cases: 'status', leads: 'lead_status', quotes: 'quote_stage' };
const ACTIVITY_MODULES = new Set(['tasks', 'calls', 'meetings']);

export function getModuleOrThrow(meta: Meta, module: string): ModuleDef {
  const m = meta.module(module);
  if (!m || m.active === false) {
    if (process.env.CRM_DEBUG) console.log('[crm] module not found', module, meta.modules.length);
    throw new CrmAccessError('Module not found.');
  }
  return m;
}

function sharingOf(m: ModuleDef) {
  return m.settings.sharing ?? 'public_rw';
}

/** Access + module permission in one: may this user do `need` on `rec`? */
export function accessTo(ctx: CrmContext, meta: Meta, rec: CrmRecord): AccessLevel | null {
  const m = meta.module(rec.module);
  if (!m) return null;
  return recordAccess(ctx, rec, sharingOf(m));
}

/** Strip hidden fields; never expose shared_with to non-owners/admins. */
export function present(ctx: CrmContext, rec: CrmRecord): CrmRecord {
  return { ...rec, data: visibleData(ctx, rec.module, rec.data) };
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getRecord(ctx: CrmContext, meta: Meta, module: string, id: string, opts: { includeDeleted?: boolean } = {}): Promise<CrmRecord> {
  getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'view')) throw new CrmAccessError();
  if (!isUuid(id)) throw new CrmAccessError('Record not found.');
  const svc = createServiceClient();
  const { data, error } = await svc.from('crm_records').select(RECORD_COLS).eq('id', id).eq('module', module).maybeSingle();
  if (error) throw error;
  if (!data) throw new CrmAccessError('Record not found.');
  const rec = normalizeRecord(data as Record<string, unknown>);
  if (rec.deleted_at && !opts.includeDeleted) throw new CrmAccessError('This record is in the recycle bin.');
  if (!accessTo(ctx, meta, rec)) throw new CrmAccessError('Record not found.');
  await computeRollups(svc, meta, rec);
  return present(ctx, rec);
}

/** Raw load for internal callers that have already authorised the action. */
export async function loadRecordRaw(svc: SupabaseClient, id: string): Promise<CrmRecord | null> {
  if (!isUuid(id)) return null;
  const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('id', id).maybeSingle();
  return data ? normalizeRecord(data as Record<string, unknown>) : null;
}

async function computeRollups(svc: SupabaseClient, meta: Meta, rec: CrmRecord) {
  const rollups = meta.fields(rec.module).filter((f) => f.type === 'rollup' && f.active !== false && f.options?.module && f.options?.via);
  for (const f of rollups) {
    const o = f.options!;
    const childFields = meta.fields(o.module!);
    if (!childFields.some((x) => x.api_name === o.via)) continue;
    const { data } = await svc.from('crm_records').select('data, owner_id, tags, created_at, updated_at, name')
      .eq('module', o.module!).is('deleted_at', null).eq(`data->>${o.via}`, rec.id).limit(5000);
    const rows = ((data ?? []) as Array<Record<string, unknown>>).map((r) => ({ ...r, data: (r.data ?? {}) as Record<string, unknown> }));
    const kept = o.criteria ? rows.filter((r) => evaluate(r as unknown as CrmRecord, o.criteria)) : rows;
    const nums = kept.map((r) => Number((r.data as Record<string, unknown>)[o.field ?? ''])).filter((n) => Number.isFinite(n));
    let v: number | null = null;
    switch (o.fn) {
      case 'count': v = kept.length; break;
      case 'sum': v = nums.reduce((a, b) => a + b, 0); break;
      case 'avg': v = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null; break;
      case 'min': v = nums.length ? Math.min(...nums) : null; break;
      case 'max': v = nums.length ? Math.max(...nums) : null; break;
    }
    rec.data[f.api_name] = v === null ? null : Math.round(v * 100) / 100;
  }
}

export interface ListQuery {
  criteria?: Criteria | null;
  search?: string;
  sort?: { field: string; dir: 'asc' | 'desc' };
  page?: number;
  pageSize?: number;
  columns?: string[];
  bin?: boolean;
  /** owner shortcut used by "My …" views */
  mine?: boolean;
}

export interface ListResult {
  rows: CrmRecord[];
  total: number;
  truncated: boolean;
  page: number;
  pageSize: number;
}

const TEXTY = new Set(['text', 'email', 'phone', 'url', 'picklist', 'textarea', 'lookup', 'user', 'autonumber']);

/**
 * List records. Simple conjunctive text filters, search, deletion state and
 * owner are pushed to Postgres; everything else (dates, numbers, OR groups,
 * private-module sharing, numeric sorts) is evaluated here over the
 * pre-filtered set, so the result is always exactly what `evaluate` says.
 */
export async function listRecords(ctx: CrmContext, meta: Meta, module: string, q: ListQuery = {}): Promise<ListResult> {
  const mod = getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'view')) throw new CrmAccessError();
  const fields = meta.fields(module);
  const criteria = q.criteria ? validateCriteria(q.criteria, fields) : null;
  for (const fld of criteriaFields(criteria)) {
    if (fieldAccess(ctx, module, fld) === 'hidden') throw new CrmUserError('This view filters on a field you can’t see.');
  }
  const pageSize = Math.min(Math.max(q.pageSize ?? 50, 1), 200);
  const page = Math.max(q.page ?? 1, 1);
  const sort = q.sort && (RECORD_COLUMNS as readonly string[]).concat(fields.map((f) => f.api_name)).includes(q.sort.field) ? q.sort : { field: 'updated_at', dir: 'desc' as const };
  if (fieldAccess(ctx, module, sort.field) === 'hidden') throw new CrmUserError('You can’t sort by a field you can’t see.');

  const svc = createServiceClient();
  const byName = new Map(fields.map((f) => [f.api_name, f]));
  const pushable: Array<(qb: any) => any> = [];
  let needsMemory = false;
  if (criteria) {
    const top = criteria.match === 'all' ? criteria.conditions : [];
    if (criteria.match !== 'all' || criteria.conditions.some((c) => 'match' in c)) needsMemory = true;
    for (const c of top) {
      if ('match' in c) continue;
      const f = byName.get(c.field);
      const v = typeof c.value === 'string' ? c.value : typeof c.value === 'number' ? String(c.value) : null;
      if (c.field === 'owner_id' && c.op === 'eq' && isUuid(c.value)) { pushable.push((qb) => qb.eq('owner_id', c.value)); continue; }
      if (f && TEXTY.has(f.type) && v !== null && ['eq', 'contains', 'starts_with', 'ends_with'].includes(c.op)) {
        const e = ilikeEscape(v);
        const pat = c.op === 'eq' ? e : c.op === 'contains' ? `%${e}%` : c.op === 'starts_with' ? `${e}%` : `%${e}`;
        pushable.push((qb) => qb.ilike(`data->>${c.field}`, pat));
        continue;
      }
      if (c.field === 'name' && v !== null && c.op === 'contains') {
        pushable.push((qb) => qb.ilike('name', `%${ilikeEscape(v)}%`));
        continue;
      }
      needsMemory = true;
    }
  }
  if (!ctx.superAdmin && sharingOf(mod) === 'private') needsMemory = true;
  if (!(RECORD_COLUMNS as readonly string[]).includes(sort.field) && !TEXTY.has(byName.get(sort.field)?.type ?? '')) needsMemory = true;
  if (sort.field === 'tags') needsMemory = true;

  const term = q.search ? orSafe(q.search) : '';
  const emailField = mod.settings.emailField;
  const build = (opts?: { count: 'exact' }) => {
    let qb: any = svc.from('crm_records').select(RECORD_COLS, opts).eq('module', module).is('merged_into', null);
    qb = q.bin ? qb.not('deleted_at', 'is', null) : qb.is('deleted_at', null);
    if (q.mine) qb = qb.eq('owner_id', ctx.userId);
    for (const p of pushable) qb = p(qb);
    if (term) {
      const pat = `%${ilikeEscape(term)}%`;
      qb = emailField ? qb.or(`name.ilike.${pat},data->>${emailField}.ilike.${pat}`) : qb.ilike('name', pat);
    }
    if (!needsMemory) {
      const col = (RECORD_COLUMNS as readonly string[]).includes(sort.field) ? sort.field : `data->>${sort.field}`;
      qb = qb.order(col, { ascending: sort.dir === 'asc', nullsFirst: false });
    } else {
      qb = qb.order('updated_at', { ascending: false });
    }
    return qb.order('id', { ascending: true });
  };

  if (!needsMemory) {
    const from = (page - 1) * pageSize;
    const res = await build({ count: 'exact' }).range(from, from + pageSize - 1);
    if (res.error) throw res.error;
    const rows = ((res.data ?? []) as Record<string, unknown>[]).map(normalizeRecord);
    return { rows: rows.map((r) => present(ctx, r)), total: res.count ?? rows.length, truncated: false, page, pageSize };
  }

  const all = await fetchAll<Record<string, unknown>>(build);
  let rows = all.rows.map(normalizeRecord);
  rows = rows.filter((r) => accessTo(ctx, meta, r) && (!criteria || evaluate(r, criteria)));
  const dir = sort.dir === 'asc' ? 1 : -1;
  const key = (r: CrmRecord): unknown => ((RECORD_COLUMNS as readonly string[]).includes(sort.field) ? (r as unknown as Record<string, unknown>)[sort.field] : r.data[sort.field]);
  rows.sort((a, b) => {
    const x = key(a);
    const y = key(b);
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
    return String(x).localeCompare(String(y)) * dir;
  });
  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize).map((r) => present(ctx, r)), total, truncated: all.truncated, page, pageSize };
}

/** Every visible record matching criteria (reports, exports, segments). Capped. */
export async function queryAll(ctx: CrmContext, meta: Meta, module: string, criteria: Criteria | null, cap = 20_000): Promise<{ rows: CrmRecord[]; truncated: boolean }> {
  getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'view')) throw new CrmAccessError();
  const crit = criteria ? validateCriteria(criteria, meta.fields(module)) : null;
  for (const fld of criteriaFields(crit)) {
    if (fieldAccess(ctx, module, fld) === 'hidden') throw new CrmUserError('This filter uses a field you can’t see.');
  }
  const svc = createServiceClient();
  const all = await fetchAll<Record<string, unknown>>(
    (o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', module).is('deleted_at', null).is('merged_into', null).order('id'),
    cap,
  );
  const rows = all.rows.map(normalizeRecord).filter((r) => accessTo(ctx, meta, r) && (!crit || evaluate(r, crit)));
  return { rows: rows.map((r) => present(ctx, r)), truncated: all.truncated };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function lockReason(rec: CrmRecord, ctx: CrmContext | null): string | null {
  if (rec.deleted_at) return 'This record is in the recycle bin.';
  if (rec.locked) {
    if (rec.locked.kind === 'converted') return 'This lead has been converted and is read-only.';
    if (rec.locked.kind === 'dpdp_restricted') return 'Processing of this person’s data is restricted (privacy request).';
    if (rec.locked.kind === 'dpdp_erased') return 'This person’s data was erased under a privacy request.';
    if (!ctx?.superAdmin) return `This record is locked${rec.locked.reason ? `: ${rec.locked.reason}` : '.'}`;
  }
  if (rec.approval_status === 'pending' && !ctx?.superAdmin) return 'This record is waiting for approval and can’t be edited.';
  return null;
}

async function uniqueErrors(svc: SupabaseClient, meta: Meta, mod: ModuleDef, data: Record<string, unknown>, selfId: string | null, changed: string[], allowDuplicate: boolean) {
  const errors: Array<{ field: string; message: string; duplicateOf?: { id: string; name: string } }> = [];
  const checks: FieldDef[] = meta.fields(mod.api_name).filter((f) => f.is_unique && f.active !== false);
  const emailField = mod.settings.emailField;
  for (const f of checks) {
    if (!changed.includes(f.api_name) || isEmpty(data[f.api_name])) continue;
    let qb = svc.from('crm_records').select('id, name').eq('module', mod.api_name).is('deleted_at', null)
      .ilike(`data->>${f.api_name}`, ilikeEscape(String(data[f.api_name]))).limit(1);
    if (selfId) qb = qb.neq('id', selfId);
    const { data: hit } = await qb;
    if (hit?.length) errors.push({ field: f.api_name, message: `${f.label} must be unique — "${(hit[0] as { name: string }).name}" already has it.`, duplicateOf: hit[0] as { id: string; name: string } });
  }
  if (!allowDuplicate && emailField && changed.includes(emailField) && !isEmpty(data[emailField]) && !checks.some((c) => c.api_name === emailField)) {
    let qb = svc.from('crm_records').select('id, name').eq('module', mod.api_name).is('deleted_at', null)
      .ilike(`data->>${emailField}`, ilikeEscape(String(data[emailField]))).limit(1);
    if (selfId) qb = qb.neq('id', selfId);
    const { data: hit } = await qb;
    if (hit?.length) errors.push({ field: emailField, message: `Possible duplicate: "${(hit[0] as { name: string }).name}" has this email.`, duplicateOf: hit[0] as { id: string; name: string } });
  }
  return errors;
}

async function assignAutonumbers(svc: SupabaseClient, meta: Meta, module: string, data: Record<string, unknown>) {
  for (const f of meta.fields(module).filter((x) => x.type === 'autonumber')) {
    if (!isEmpty(data[f.api_name])) continue;
    const { data: n, error } = await svc.rpc('crm_next_number', { p_key: `${module}.${f.api_name}` });
    if (error) throw error;
    data[f.api_name] = `${f.options?.prefix ?? ''}${String(n).padStart(f.options?.pad ?? 1, '0')}`;
  }
}

export class SaveError extends CrmUserError {
  constructor(public errors: Array<{ field: string; message: string; duplicateOf?: { id: string; name: string } }>) {
    super(errors.map((e) => e.message).join(' '));
  }
}

function requireCtx(ctx: CrmContext | null, actorKind: SaveOptions['actorKind']): void {
  if (!ctx && !(actorKind === 'automation' || actorKind === 'public' || actorKind === 'system' || actorKind === 'api')) {
    throw new CrmAccessError();
  }
}

/** System context for trusted internal writers (automation, public forms, sync). */
export const SYSTEM_CTX: CrmContext = {
  userId: '00000000-0000-0000-0000-000000000000', superAdmin: true, profileId: null, roleId: null,
  profile: { modules: {}, setup: {}, fields: {} }, subordinateRoleIds: [], subordinateUserIds: [], peerUserIds: [],
  sharingRules: [], territories: [], userRoles: {},
};

export async function createRecord(
  ctx: CrmContext | null,
  meta: Meta,
  module: string,
  input: Record<string, unknown>,
  opts: SaveOptions & { ownerId?: string | null; tags?: string[]; externalKey?: string | null; meceUserId?: string | null } = {},
): Promise<CrmRecord> {
  requireCtx(ctx, opts.actorKind);
  const mod = getModuleOrThrow(meta, module);
  const c = ctx ?? SYSTEM_CTX;
  if (ctx && !can(ctx, module, 'create')) throw new CrmAccessError(`You can't create ${mod.label.toLowerCase()}.`);
  const svc = createServiceClient();
  const extraRequired = await layoutRequired(meta, module, input);
  const prep = prepareRecord({
    module: mod, fields: meta.fields(module), existing: null, patch: input, ctx: c, allowSystem: opts.allowSystem,
    allowSynced: opts.allowSynced, pipelines: meta.pipelines, defaultPipeline: meta.defaultPipeline()?.name, extraRequired,
  });
  if (prep.errors.length) throw new SaveError(prep.errors);
  const more = await uniqueErrors(svc, meta, mod, prep.data, null, prep.changed, !!opts.allowDuplicate);
  if (more.length) throw new SaveError(more);
  const actorId = ctx?.userId ?? opts.actorIdOverride ?? null;
  const vErr = await beforeSave({ ctx, actorId, meta, module, before: null, event: 'create', source: opts.source ?? 'ui', depth: opts.depth ?? 0, data: prep.data, chain: opts.chain });
  if (vErr.length) throw new SaveError(vErr);

  let ownerId: string | null = actorId;
  if (opts.ownerId !== undefined) {
    if (opts.ownerId !== null && !(await isActiveMember(opts.ownerId))) throw new CrmUserError('Owner must be an active CRM user.');
    ownerId = opts.ownerId;
  }
  // Assignment rules: records from web forms, imports and the API that arrive without an owner (Zoho)
  let assigned: Awaited<ReturnType<typeof assignOwnerFor>> = null;
  if (!ownerId && ['webform', 'import', 'api'].includes(opts.source ?? '')) {
    assigned = await assignOwnerFor(module, prep.data, opts.source!);
    if (assigned) ownerId = assigned.ownerId;
  }
  if (ctx && !ctx.superAdmin && ownerId !== ctx.userId && !ctx.subordinateUserIds.includes(ownerId ?? '')) {
    // A rep may assign to themselves or their team, not to anyone above them.
    if (ownerId !== null) throw new CrmUserError('You can assign records only to yourself or your team.');
  }
  await assignAutonumbers(svc, meta, module, prep.data);
  const row = {
    module,
    name: prep.name,
    owner_id: ownerId,
    data: prep.data,
    tags: normalizeTags(opts.tags ?? []),
    external_key: opts.externalKey ?? null,
    mece_user_id: opts.meceUserId ?? null,
    source: opts.source ?? 'ui',
    source_ref: opts.sourceRef ?? null,
    created_by: actorId,
    updated_by: actorId,
  };
  const { data, error } = await svc.from('crm_records').insert(row).select(RECORD_COLS).single();
  if (error) throw error;
  const rec = normalizeRecord(data as Record<string, unknown>);
  await afterWrite(svc, meta, null, rec, actorId, opts);
  if (assigned) await assignmentFollowUp(meta, rec, assigned.followUp);
  if (!opts.skipAutomation) await afterSave({ ctx, actorId, meta, module, before: null, after: rec, event: 'create', source: opts.source ?? 'ui', depth: opts.depth ?? 0, chain: opts.chain });
  return ctx ? present(ctx, rec) : rec;
}

export async function updateRecord(
  ctx: CrmContext | null,
  meta: Meta,
  module: string,
  id: string,
  patch: Record<string, unknown>,
  opts: SaveOptions & { ownerId?: string | null; tags?: string[] } = {},
): Promise<CrmRecord> {
  requireCtx(ctx, opts.actorKind);
  const mod = getModuleOrThrow(meta, module);
  const c = ctx ?? SYSTEM_CTX;
  if (ctx && !can(ctx, module, 'edit')) throw new CrmAccessError(`You can't edit ${mod.label.toLowerCase()}.`);
  const svc = createServiceClient();
  const existing = await loadRecordRaw(svc, id);
  if (!existing || existing.module !== module) throw new CrmAccessError('Record not found.');
  if (ctx && !allows(accessTo(ctx, meta, existing), 'rw')) throw new CrmAccessError(existing && accessTo(ctx, meta, existing) ? 'You can only view this record.' : 'Record not found.');
  const locked = lockReason(existing, ctx);
  if (locked && opts.source !== 'sync' && opts.actorKind !== 'system') throw new CrmUserError(locked);
  if (opts.expectedUpdatedAt && new Date(opts.expectedUpdatedAt).getTime() !== new Date(existing.updated_at).getTime()) {
    throw new CrmUserError('Someone else changed this record while you were editing. Reload to see the latest.');
  }

  const extraRequired = await layoutRequired(meta, module, { ...existing.data, ...patch });
  const prep = prepareRecord({
    module: mod, fields: meta.fields(module), existing, patch, ctx: c, allowSystem: opts.allowSystem,
    allowSynced: opts.allowSynced, pipelines: meta.pipelines, defaultPipeline: meta.defaultPipeline()?.name, extraRequired,
  });
  if (prep.errors.length) throw new SaveError(prep.errors);
  const more = await uniqueErrors(svc, meta, mod, prep.data, id, prep.changed, !!opts.allowDuplicate);
  if (more.length) throw new SaveError(more);
  const actorId = ctx?.userId ?? opts.actorIdOverride ?? null;
  const vErr = await beforeSave({ ctx, actorId, meta, module, before: existing, event: 'edit', source: opts.source ?? 'ui', depth: opts.depth ?? 0, data: prep.data, chain: opts.chain });
  if (vErr.length) throw new SaveError(vErr);

  const update: Record<string, unknown> = { data: prep.data, name: prep.name, updated_by: actorId, updated_at: new Date().toISOString() };
  if (opts.ownerId !== undefined && opts.ownerId !== existing.owner_id) {
    if (opts.ownerId !== null && !(await isActiveMember(opts.ownerId))) throw new CrmUserError('Owner must be an active CRM user.');
    if (ctx && !ctx.superAdmin && opts.ownerId !== ctx.userId && !ctx.subordinateUserIds.includes(opts.ownerId ?? '')) {
      throw new CrmUserError('You can assign records only to yourself or your team.');
    }
    update.owner_id = opts.ownerId;
  }
  if (opts.tags) update.tags = normalizeTags(opts.tags);
  const ownerChanged = 'owner_id' in update;
  if (!prep.changed.length && !ownerChanged && !opts.tags && prep.name === existing.name) return ctx ? present(ctx, existing) : existing;

  // Optimistic concurrency at the row: the update applies only if nobody
  // wrote since we read.
  const { data, error } = await svc.from('crm_records').update(update).eq('id', id).eq('updated_at', existing.updated_at).select(RECORD_COLS);
  if (error) throw error;
  if (!data?.length) throw new CrmUserError('Someone else changed this record at the same moment. Reload and try again.');
  const rec = normalizeRecord(data[0] as Record<string, unknown>);
  await afterWrite(svc, meta, existing, rec, actorId, opts);
  if (!opts.skipAutomation) await afterSave({ ctx, actorId, meta, module, before: existing, after: rec, event: 'edit', source: opts.source ?? 'ui', depth: opts.depth ?? 0, chain: opts.chain });
  return ctx ? present(ctx, rec) : rec;
}

async function afterWrite(svc: SupabaseClient, meta: Meta, before: CrmRecord | null, after: CrmRecord, actorId: string | null, opts: SaveOptions) {
  const changedKeys = Object.keys({ ...(before?.data ?? {}), ...after.data })
    .filter((k) => JSON.stringify(before?.data?.[k] ?? null) !== JSON.stringify(after.data[k] ?? null));
  const colChanges: Record<string, { from: unknown; to: unknown }> = {};
  if (before && before.owner_id !== after.owner_id) colChanges.owner_id = { from: before.owner_id, to: after.owner_id };
  if (before && JSON.stringify(before.tags) !== JSON.stringify(after.tags)) colChanges.tags = { from: before.tags, to: after.tags };
  await audit(svc, {
    actor_id: actorId,
    actor_kind: opts.actorIdOverride ? 'user' : opts.actorKind ?? (opts.source === 'sync' ? 'sync' : opts.source === 'automation' ? 'automation' : 'user'),
    action: before ? 'update' : 'create',
    module: after.module,
    record_id: after.id,
    changes: before ? { ...diff(before.data, after.data, changedKeys), ...colChanges } : { name: { from: null, to: after.name } },
    meta: { source: opts.source ?? 'ui' },
  });

  const sf = STAGE_FIELDS[after.module];
  if (sf && (before ? before.data[sf] !== after.data[sf] : !isEmpty(after.data[sf]))) {
    let seconds: number | null = null;
    if (before) {
      const { data: last } = await svc.from('crm_stage_history').select('changed_at').eq('record_id', after.id).eq('field', sf)
        .order('changed_at', { ascending: false }).limit(1);
      const since = (last?.[0] as { changed_at?: string } | undefined)?.changed_at ?? before.created_at;
      seconds = Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 1000));
    }
    await svc.from('crm_stage_history').insert({
      record_id: after.id, field: sf, from_value: before ? (before.data[sf] as string | null) ?? null : null, to_value: (after.data[sf] as string | null) ?? null,
      amount: typeof after.data.amount === 'number' ? after.data.amount : null,
      probability: typeof after.data.probability === 'number' ? Math.round(after.data.probability) : null,
      changed_by: actorId, seconds_in_from: seconds,
    });
  }

  // Activities touch their parent's "last activity"
  if (ACTIVITY_MODULES.has(after.module)) {
    const rel = after.data.related_to as { id?: string } | null | undefined;
    if (rel?.id && isUuid(rel.id)) {
      await svc.from('crm_records').update({ last_activity_at: new Date().toISOString() }).eq('id', rel.id);
    }
  }
  if (before && before.owner_id !== after.owner_id && after.owner_id && after.owner_id !== actorId) {
    await notify(svc, after.owner_id, 'assigned', `${meta.module(after.module)?.singular ?? 'Record'} assigned to you: ${after.name}`, null, `/crm/m/${after.module}/${after.id}`);
  }
}

export async function notify(svc: SupabaseClient, userId: string, kind: string, title: string, body: string | null, link: string | null) {
  await svc.from('crm_notifications').insert({ user_id: userId, kind, title: title.slice(0, 200), body: body?.slice(0, 2000) ?? null, link: link && link.startsWith('/crm') ? link : null });
}

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = [];
  for (const t of tags) {
    if (typeof t !== 'string') continue;
    const s = t.replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 40);
    if (s && !out.some((x) => x.toLowerCase() === s.toLowerCase())) out.push(s);
    if (out.length >= 20) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Delete / restore / purge
// ---------------------------------------------------------------------------

export async function deleteRecords(ctx: CrmContext, meta: Meta, module: string, ids: string[]): Promise<{ deleted: number; skipped: string[] }> {
  const mod = getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'delete')) throw new CrmAccessError(`You can't delete ${mod.label.toLowerCase()}.`);
  const svc = createServiceClient();
  const skipped: string[] = [];
  let deleted = 0;
  for (const id of ids.slice(0, 500)) {
    const rec = await loadRecordRaw(svc, id);
    if (!rec || rec.module !== module || rec.deleted_at) { skipped.push(id); continue; }
    if (!allows(accessTo(ctx, meta, rec), 'rwd')) { skipped.push(rec.name || id); continue; }
    if (isSyncedRecord(rec)) { skipped.push(`${rec.name} (mirrors MECE data)`); continue; }
    // Zoho: a record waiting for approval can't be deleted by anyone (decide or cancel first)
    if (lockReason(rec, ctx) || rec.approval_status === 'pending') { skipped.push(`${rec.name} (locked)`); continue; }
    const now = new Date().toISOString();
    const { error } = await svc.from('crm_records').update({ deleted_at: now, deleted_by: ctx.userId, updated_at: now }).eq('id', id).is('deleted_at', null);
    if (error) throw error;
    deleted++;
    await audit(svc, { actor_id: ctx.userId, action: 'delete', module, record_id: id, changes: { name: { from: rec.name, to: null } } });
    await afterDelete({ actorId: ctx.userId, meta, module, record: rec });
  }
  return { deleted, skipped };
}

export async function restoreRecords(ctx: CrmContext, meta: Meta, ids: string[]): Promise<number> {
  const svc = createServiceClient();
  let n = 0;
  for (const id of ids.slice(0, 500)) {
    const rec = await loadRecordRaw(svc, id);
    if (!rec || !rec.deleted_at || rec.merged_into) continue;
    if (!can(ctx, rec.module, 'delete')) continue;
    if (!ctx.superAdmin && rec.deleted_by !== ctx.userId && !allows(accessTo(ctx, meta, rec), 'rwd')) continue;
    const { error } = await svc.from('crm_records').update({ deleted_at: null, deleted_by: null, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    n++;
    await audit(svc, { actor_id: ctx.userId, action: 'restore', module: rec.module, record_id: id });
  }
  return n;
}

/** Permanent delete of records already in the recycle bin (admins / manage_data). */
export async function purgeRecords(svc: SupabaseClient, actorId: string | null, ids: string[] | 'expired', olderThanDays = 60): Promise<number> {
  let qb = svc.from('crm_records').select('id, module, name').not('deleted_at', 'is', null);
  if (ids === 'expired') qb = qb.lt('deleted_at', new Date(Date.now() - olderThanDays * 86_400_000).toISOString());
  else qb = qb.in('id', ids.filter(isUuid).slice(0, 500));
  const { data } = await qb.limit(1000);
  const rows = (data ?? []) as Array<{ id: string; module: string; name: string }>;
  if (!rows.length) return 0;
  const { error } = await svc.from('crm_records').delete().in('id', rows.map((r) => r.id));
  if (error) throw error;
  for (const r of rows) await audit(svc, { actor_id: actorId, actor_kind: actorId ? 'user' : 'system', action: 'purge', module: r.module, record_id: r.id, changes: { name: { from: r.name, to: null } } });
  return rows.length;
}

// ---------------------------------------------------------------------------
// Tags, sharing, locking
// ---------------------------------------------------------------------------

export async function setTags(ctx: CrmContext, meta: Meta, module: string, ids: string[], add: string[], remove: string[]) {
  const svc = createServiceClient();
  let n = 0;
  for (const id of ids.slice(0, 500)) {
    const rec = await loadRecordRaw(svc, id);
    if (!rec || rec.module !== module || rec.deleted_at) continue;
    if (!can(ctx, module, 'edit') || !allows(accessTo(ctx, meta, rec), 'rw')) continue;
    const next = normalizeTags([...rec.tags.filter((t) => !remove.some((r) => r.toLowerCase() === t.toLowerCase())), ...add]);
    if (JSON.stringify(next) === JSON.stringify(rec.tags)) continue;
    await updateRecord(ctx, meta, module, id, {}, { tags: next });
    n++;
  }
  return n;
}

export async function setLock(ctx: CrmContext, meta: Meta, module: string, id: string, lock: boolean, reason: string) {
  if (!ctx.superAdmin && !can(ctx, module, 'edit')) throw new CrmAccessError();
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, id);
  if (!rec || rec.module !== module) throw new CrmAccessError('Record not found.');
  if (!allows(accessTo(ctx, meta, rec), 'rwd')) throw new CrmAccessError('Only the owner, their managers or an admin can lock this record.');
  if (rec.locked && ['converted', 'dpdp_restricted', 'dpdp_erased'].includes(rec.locked.kind)) throw new CrmUserError('This lock is managed by the system.');
  const locked = lock ? { kind: 'manual', reason: reason.slice(0, 200), by: ctx.userId, at: new Date().toISOString() } : null;
  const { error } = await svc.from('crm_records').update({ locked, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: lock ? 'lock' : 'unlock', module, record_id: id, meta: { reason } });
}

export async function setShares(ctx: CrmContext, meta: Meta, module: string, id: string, shares: Array<{ user_id: string; access: AccessLevel }>) {
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, id);
  if (!rec || rec.module !== module) throw new CrmAccessError('Record not found.');
  if (!allows(accessTo(ctx, meta, rec), 'rwd')) throw new CrmAccessError('Only the owner, their managers or an admin can share this record.');
  const clean: Array<{ user_id: string; access: AccessLevel }> = [];
  for (const s of shares.slice(0, 50)) {
    if (!isUuid(s.user_id) || !['read', 'rw', 'rwd'].includes(s.access)) continue;
    if (!(await isActiveMember(s.user_id))) continue;
    if (!clean.some((c) => c.user_id === s.user_id)) clean.push({ user_id: s.user_id, access: s.access });
  }
  const { error } = await svc.from('crm_records').update({ shared_with: clean }).eq('id', id);
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'share', module, record_id: id, changes: { shared_with: { from: rec.shared_with, to: clean } } });
}
