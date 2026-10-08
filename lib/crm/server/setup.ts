/**
 * Setup: custom views, pipelines, modules & fields, CRM users, roles,
 * profiles and sharing rules. Every function checks its setup permission
 * itself; nothing here trusts the browser's shape of a config.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { validateCriteria } from '@/lib/crm/criteria';
import { isUuid } from '@/lib/crm/fields';
import { parseFormula } from '@/lib/crm/formula';
import { canSetup, cleanProfile, wouldCycle } from '@/lib/crm/permissions';
import type { CrmContext, FieldType, PipelineConfig, PipelineStage, SharingLevel, ViewConfig } from '@/lib/crm/types';
import { FIELD_TYPES, RECORD_COLUMNS } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { getModuleOrThrow } from './records';
import type { Meta } from './meta';

const RESERVED = new Set(['id', 'name', 'owner_id', 'tags', 'data', 'module', 'created_at', 'updated_at', 'created_by', 'updated_by', 'constructor', 'prototype', '__proto__', 'tostring', 'valueof', 'hasownproperty']);

function need(ctx: CrmContext, perm: Parameters<typeof canSetup>[1]) {
  if (!canSetup(ctx, perm)) throw new CrmAccessError('You don’t have permission for this setting.');
}

const cleanName = (s: unknown, max = 120) => {
  const v = String(s ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
  if (!v) throw new CrmUserError('Give it a name.');
  return v;
};

// ---------------------------------------------------------------------------
// Views (any CRM user may save their own; shared views need manage_setup)
// ---------------------------------------------------------------------------

export async function saveView(ctx: CrmContext, meta: Meta, input: { id?: string | null; module: string; name: string; shared?: boolean; config: ViewConfig }) {
  getModuleOrThrow(meta, input.module);
  const fields = meta.fields(input.module);
  const known = new Set<string>([...fields.map((f) => f.api_name), ...RECORD_COLUMNS]);
  const config: ViewConfig = {
    criteria: input.config.criteria ? validateCriteria(input.config.criteria, fields) : null,
    columns: (input.config.columns ?? []).filter((c) => typeof c === 'string' && known.has(c)).slice(0, 20),
    sort: input.config.sort && known.has(input.config.sort.field) ? { field: input.config.sort.field, dir: input.config.sort.dir === 'asc' ? 'asc' : 'desc' } : undefined,
  };
  const shared = !!input.shared;
  if (shared) need(ctx, 'manage_setup');
  const svc = createServiceClient();
  const row = { kind: 'view', module: input.module, name: cleanName(input.name, 80), config, shared, owner_id: ctx.userId, updated_by: ctx.userId, updated_at: new Date().toISOString() };
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('View not found.');
    const { data: ex } = await svc.from('crm_config').select('owner_id, shared').eq('id', input.id).eq('kind', 'view').maybeSingle();
    const v = ex as { owner_id: string | null; shared: boolean } | null;
    if (!v) throw new CrmAccessError('View not found.');
    if (v.owner_id !== ctx.userId && !canSetup(ctx, 'manage_setup')) throw new CrmAccessError('Only the view’s owner or an admin can change it.');
    const { error } = await svc.from('crm_config').update({ ...row, owner_id: v.owner_id }).eq('id', input.id);
    if (error) throw error;
    return input.id;
  }
  const { data, error } = await svc.from('crm_config').insert({ ...row, created_by: ctx.userId }).select('id').single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function listViews(ctx: CrmContext, module: string) {
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, name, config, shared, owner_id').eq('kind', 'view').eq('module', module).order('name');
  return ((data ?? []) as Array<{ id: string; name: string; config: ViewConfig; shared: boolean; owner_id: string | null }>)
    .filter((v) => v.shared || v.owner_id === ctx.userId);
}

export async function deleteConfig(ctx: CrmContext, id: string, kind: string) {
  if (!isUuid(id)) throw new CrmAccessError('Not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, kind, owner_id, name, module').eq('id', id).eq('kind', kind).maybeSingle();
  const row = data as { id: string; kind: string; owner_id: string | null; name: string; module: string | null } | null;
  if (!row) throw new CrmAccessError('Not found.');
  if (kind === 'view') {
    if (row.owner_id !== ctx.userId && !canSetup(ctx, 'manage_setup')) throw new CrmAccessError('Only the view’s owner or an admin can delete it.');
  } else if (['role', 'profile', 'sharing_rule', 'territory'].includes(kind)) need(ctx, 'manage_users');
  else if (['email_template', 'segment', 'webform', 'survey'].includes(kind)) need(ctx, 'manage_marketing');
  else if (['workflow', 'blueprint', 'approval_process', 'assignment_rule', 'scoring_rule', 'validation_rule', 'layout_rule', 'macro', 'cadence', 'webhook'].includes(kind)) need(ctx, 'manage_automation');
  else if (['report', 'dashboard'].includes(kind)) need(ctx, 'manage_reports');
  else if (['prediction'].includes(kind)) need(ctx, 'manage_ai');
  else need(ctx, 'manage_setup');
  if (kind === 'role' || kind === 'profile') {
    const col = kind === 'role' ? 'role_id' : 'profile_id';
    const { count } = await svc.from('crm_users').select('user_id', { count: 'exact', head: true }).eq(col, id);
    if (count) throw new CrmUserError(`${count} CRM user(s) still use this ${kind}. Move them first.`);
    if (kind === 'role') {
      const { data: kids } = await svc.from('crm_config').select('id').eq('kind', 'role').eq('config->>parentId', id).limit(1);
      if (kids?.length) throw new CrmUserError('Other roles report to this role. Move them first.');
    }
  }
  if (kind === 'territory') {
    const { data: kids } = await svc.from('crm_config').select('id').eq('kind', 'territory').eq('config->>parentId', id).limit(1);
    if (kids?.length) throw new CrmUserError('Other territories sit under this one. Move them first.');
  }
  if (kind === 'pipeline') {
    const { count } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('module', 'deals').is('deleted_at', null).eq('data->>pipeline', row.name);
    if (count) throw new CrmUserError(`${count} deal(s) are in this pipeline. Deactivate it instead, or move the deals first.`);
  }
  const { error } = await svc.from('crm_config').delete().eq('id', id);
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: `config_delete`, module: row.module, meta: { kind, name: row.name } });
}

// ---------------------------------------------------------------------------
// Pipelines
// ---------------------------------------------------------------------------

const FORECASTS = ['Pipeline', 'Best Case', 'Commit', 'Closed Won', 'Omitted'] as const;

export function cleanPipeline(raw: unknown): PipelineConfig {
  const r = (raw ?? {}) as Partial<PipelineConfig>;
  if (!Array.isArray(r.stages) || r.stages.length < 2 || r.stages.length > 20) throw new CrmUserError('A pipeline needs 2–20 stages.');
  const keys = new Set<string>();
  const stages: PipelineStage[] = r.stages.map((s, i) => {
    const label = cleanName(s?.label, 60);
    let key = String(s?.key || label).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || `stage_${i + 1}`;
    while (keys.has(key)) key = `${key}_${i}`;
    keys.add(key);
    const probability = Math.max(0, Math.min(100, Math.round(Number(s?.probability ?? 0)) || 0));
    const state = s?.state === 'won' || s?.state === 'lost' ? s.state : 'open';
    const forecast = (FORECASTS as readonly string[]).includes(String(s?.forecast)) ? (s!.forecast as PipelineStage['forecast']) : state === 'won' ? 'Closed Won' : state === 'lost' ? 'Omitted' : 'Pipeline';
    return { key, label, probability: state === 'won' ? 100 : state === 'lost' ? 0 : probability, forecast, state };
  });
  if (!stages.some((s) => s.state === 'won') || !stages.some((s) => s.state === 'lost')) throw new CrmUserError('A pipeline needs one won stage and one lost stage.');
  return { stages, isDefault: !!r.isDefault, description: r.description ? String(r.description).slice(0, 300) : undefined };
}

export async function savePipeline(ctx: CrmContext, input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  need(ctx, 'manage_setup');
  const svc = createServiceClient();
  const config = cleanPipeline(input.config);
  const name = cleanName(input.name, 80);
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Pipeline not found.');
    const { data: old } = await svc.from('crm_config').select('name, config').eq('id', input.id).eq('kind', 'pipeline').maybeSingle();
    const prev = old as { name: string; config: PipelineConfig } | null;
    if (!prev) throw new CrmAccessError('Pipeline not found.');
    // Stages still used by deals can't disappear
    const removed = prev.config.stages.filter((s) => !config.stages.some((n) => n.key === s.key)).map((s) => s.key);
    if (removed.length) {
      const { count } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('module', 'deals').is('deleted_at', null).eq('data->>pipeline', prev.name).in('data->>stage', removed);
      if (count) throw new CrmUserError(`${count} deal(s) are in a stage you removed. Move them first.`);
    }
    if (prev.name !== name) {
      const { count } = await svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('module', 'deals').eq('data->>pipeline', prev.name);
      if (count) throw new CrmUserError('Deals use this pipeline’s name; rename isn’t possible while it has deals.');
    }
    const { error } = await svc.from('crm_config').update({ name, active: input.active !== false, config, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id);
    if (error) throw error;
  } else {
    const { error } = await svc.from('crm_config').insert({ kind: 'pipeline', module: 'deals', name, active: input.active !== false, config, created_by: ctx.userId });
    if (error) throw error.code === '23505' ? new CrmUserError('A pipeline with this name exists.') : error;
  }
  if (config.isDefault) {
    const { data: all } = await svc.from('crm_config').select('id, name, config').eq('kind', 'pipeline');
    for (const p of (all ?? []) as Array<{ id: string; name: string; config: PipelineConfig }>) {
      if (p.name !== name && p.config.isDefault) await svc.from('crm_config').update({ config: { ...p.config, isDefault: false } }).eq('id', p.id);
    }
  }
  await audit(svc, { actor_id: ctx.userId, action: 'pipeline_save', module: 'deals', meta: { name } });
}

// ---------------------------------------------------------------------------
// Modules and fields
// ---------------------------------------------------------------------------

const API_RE = /^[a-z][a-z0-9_]{1,40}$/;

export async function createCustomModule(ctx: CrmContext, meta: Meta, input: { label: string; singular: string; sharing?: SharingLevel }) {
  need(ctx, 'manage_setup');
  const label = cleanName(input.label, 60);
  const singular = cleanName(input.singular || label, 60);
  const api = 'cm_' + label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30);
  if (!API_RE.test(api) || meta.module(api)) throw new CrmUserError('Pick a different name — that module already exists.');
  if (meta.modules.filter((m) => m.kind === 'custom').length >= 100) throw new CrmUserError('You can have at most 100 custom modules.');
  const svc = createServiceClient();
  const sharing: SharingLevel = ['private', 'public_read', 'public_rw', 'public_rwd'].includes(String(input.sharing)) ? input.sharing! : 'public_rw';
  const { error } = await svc.from('crm_modules').insert({ api_name: api, label, singular, kind: 'custom', icon: 'Boxes', position: 200, settings: { nameFields: ['record_name'], sharing } });
  if (error) throw error;
  await svc.from('crm_fields').insert([
    { module: api, api_name: 'record_name', label: `${singular} name`, type: 'text', required: true, section: 'Details', position: 10 },
    { module: api, api_name: 'description', label: 'Description', type: 'textarea', section: 'Description', position: 1000 },
  ]);
  await audit(svc, { actor_id: ctx.userId, action: 'module_create', module: api, meta: { label } });
  return api;
}

export async function saveField(ctx: CrmContext, meta: Meta, module: string, input: {
  id?: string | null; label: string; type?: FieldType; required?: boolean; is_unique?: boolean; section?: string; position?: number; active?: boolean;
  picklist?: string[]; lookupModule?: string; expr?: string; returns?: string; rollup?: { module: string; via: string; fn: string; field?: string };
  help?: string;
}) {
  need(ctx, 'manage_setup');
  getModuleOrThrow(meta, module);
  const svc = createServiceClient();
  const label = cleanName(input.label, 80);
  const section = String(input.section ?? 'Details').slice(0, 60) || 'Details';
  const position = Math.max(0, Math.min(10_000, Math.round(Number(input.position ?? 500)) || 500));
  const picklist = (input.picklist ?? []).map((v) => String(v).replace(/[\u0000-\u001F]/g, '').trim().slice(0, 100)).filter(Boolean);
  if (picklist.length > 200) throw new CrmUserError('A picklist can have at most 200 values.');
  const uniquePick = [...new Set(picklist)];

  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Field not found.');
    const existing = meta.fields(module).find((f) => f.id === input.id);
    if (!existing) throw new CrmAccessError('Field not found.');
    const opts: Record<string, unknown> = { ...(existing.options ?? {}) };
    if ((existing.type === 'picklist' || existing.type === 'multipicklist') && input.picklist) opts.picklist = uniquePick.map((value) => ({ value }));
    if (input.help !== undefined) opts.help = String(input.help).slice(0, 300);
    const isStd = !existing.api_name.startsWith('cf_') && meta.module(module)?.kind === 'standard';
    if (existing.type === 'formula' && input.expr !== undefined && !isStd) {
      parseFormulaOrThrow(input.expr, meta, module);
      opts.expr = input.expr;
    }
    const { error } = await svc.from('crm_fields').update({
      label, section, position, required: !!input.required, active: input.active !== false,
      is_unique: isStd ? existing.is_unique : !!input.is_unique,
      options: isStd ? { picklist: opts.picklist ?? [] } : opts,
    }).eq('id', input.id).eq('module', module);
    if (error) throw error;
    await audit(svc, { actor_id: ctx.userId, action: 'field_update', module, meta: { field: existing.api_name } });
    return existing.api_name;
  }

  const type = input.type;
  if (!type || !(FIELD_TYPES as readonly string[]).includes(type) || type === 'json' || type === 'line_items' || type === 'related') throw new CrmUserError('Pick a field type.');
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'field';
  const api = `cf_${base}`;
  if (RESERVED.has(base) || meta.fields(module).some((f) => f.api_name === api)) throw new CrmUserError('A field with this name already exists.');
  if (meta.fields(module).filter((f) => f.api_name.startsWith('cf_')).length >= 300) throw new CrmUserError('A module can have at most 300 custom fields.');
  const options: Record<string, unknown> = {};
  if (type === 'picklist' || type === 'multipicklist') {
    if (!uniquePick.length) throw new CrmUserError('Add at least one picklist value.');
    options.picklist = uniquePick.map((value) => ({ value }));
  }
  if (type === 'lookup') {
    if (!input.lookupModule || !meta.module(input.lookupModule)) throw new CrmUserError('Pick the module this field looks up.');
    options.module = input.lookupModule;
  }
  if (type === 'formula') {
    if (!input.expr) throw new CrmUserError('Write the formula.');
    parseFormulaOrThrow(input.expr, meta, module);
    options.expr = input.expr;
    options.returns = ['number', 'currency', 'text', 'date', 'boolean', 'percent'].includes(String(input.returns)) ? input.returns : 'number';
  }
  if (type === 'autonumber') { options.prefix = String(input.expr ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 8); options.pad = 4; }
  if (type === 'rollup') {
    const r = input.rollup;
    if (!r || !meta.module(r.module) || !meta.fields(r.module).some((f) => f.api_name === r.via && f.type === 'lookup' && f.options?.module === module)) {
      throw new CrmUserError('Pick a child module and the lookup field that points here.');
    }
    if (!['count', 'sum', 'avg', 'min', 'max'].includes(r.fn)) throw new CrmUserError('Pick count, sum, average, minimum or maximum.');
    if (r.fn !== 'count' && !meta.fields(r.module).some((f) => f.api_name === r.field && ['integer', 'decimal', 'currency', 'percent'].includes(f.type))) {
      throw new CrmUserError('Pick a number field to summarise.');
    }
    Object.assign(options, { module: r.module, via: r.via, fn: r.fn, field: r.field });
  }
  if (input.help) options.help = String(input.help).slice(0, 300);
  const { error } = await svc.from('crm_fields').insert({
    module, api_name: api, label, type, required: !!input.required && !['formula', 'rollup', 'autonumber', 'boolean'].includes(type),
    is_unique: !!input.is_unique && ['text', 'email', 'phone', 'url'].includes(type), readonly: false,
    system: ['formula', 'rollup', 'autonumber'].includes(type), options, section, position, active: true,
  });
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'field_create', module, meta: { field: api, type } });
  return api;
}

function parseFormulaOrThrow(expr: string, meta: Meta, module: string) {
  try {
    parseFormula(expr, meta.fields(module).map((f) => f.api_name));
  } catch (e) {
    throw new CrmUserError(`Formula: ${(e as Error).message}`);
  }
}

export async function saveModuleSettings(ctx: CrmContext, meta: Meta, module: string, input: { label?: string; singular?: string; sharing?: SharingLevel; active?: boolean }) {
  need(ctx, 'manage_setup');
  const m = getModuleOrThrow(meta, module);
  const svc = createServiceClient();
  const { data } = await svc.from('crm_modules').select('settings').eq('api_name', module).single();
  const settings = { ...((data as { settings: Record<string, unknown> }).settings ?? {}) };
  if (input.sharing) {
    if (!['private', 'public_read', 'public_rw', 'public_rwd'].includes(input.sharing)) throw new CrmUserError('Unknown sharing level.');
    settings.sharing = input.sharing;
  }
  const update: Record<string, unknown> = { settings };
  if (input.label) update.label = cleanName(input.label, 60);
  if (input.singular) update.singular = cleanName(input.singular, 60);
  if (typeof input.active === 'boolean') {
    if (m.kind === 'standard' && ['leads', 'contacts', 'accounts', 'deals'].includes(module) && !input.active) throw new CrmUserError('Core modules can’t be switched off.');
    update.active = input.active;
  }
  const { error } = await svc.from('crm_modules').update(update).eq('api_name', module);
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'module_update', module, meta: input });
}

// ---------------------------------------------------------------------------
// CRM users, roles, profiles, sharing rules
// ---------------------------------------------------------------------------

export async function addCrmUser(ctx: CrmContext, email: string, roleId: string, profileId: string) {
  need(ctx, 'manage_users');
  if (!isUuid(roleId) || !isUuid(profileId)) throw new CrmUserError('Pick a role and a profile.');
  const svc = createServiceClient();
  const { data: u } = await svc.from('users').select('id, is_guest, email').ilike('email', String(email).trim().replace(/[\\%_]/g, (c) => '\\' + c)).maybeSingle();
  const user = u as { id: string; is_guest: boolean | null } | null;
  if (!user || user.is_guest) throw new CrmUserError('No MECE account with that email. Ask them to sign up first.');
  const { data: cfg } = await svc.from('crm_config').select('id, kind').in('id', [roleId, profileId]);
  const kinds = new Map(((cfg ?? []) as Array<{ id: string; kind: string }>).map((c) => [c.id, c.kind]));
  if (kinds.get(roleId) !== 'role' || kinds.get(profileId) !== 'profile') throw new CrmUserError('Pick a valid role and profile.');
  const { error } = await svc.from('crm_users').upsert({ user_id: user.id, role_id: roleId, profile_id: profileId, active: true, created_by: ctx.userId });
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'crm_user_add', meta: { user: user.id, roleId, profileId } });
}

export async function updateCrmUser(ctx: CrmContext, userId: string, patch: { roleId?: string; profileId?: string; active?: boolean }) {
  need(ctx, 'manage_users');
  if (!isUuid(userId)) throw new CrmAccessError('User not found.');
  if (userId === ctx.userId && patch.active === false) throw new CrmUserError('You can’t deactivate yourself.');
  const svc = createServiceClient();
  const update: Record<string, unknown> = {};
  const ids = [patch.roleId, patch.profileId].filter(Boolean) as string[];
  if (ids.some((x) => !isUuid(x))) throw new CrmUserError('Pick a valid role and profile.');
  if (ids.length) {
    const { data: cfg } = await svc.from('crm_config').select('id, kind').in('id', ids);
    const kinds = new Map(((cfg ?? []) as Array<{ id: string; kind: string }>).map((c) => [c.id, c.kind]));
    if (patch.roleId) { if (kinds.get(patch.roleId) !== 'role') throw new CrmUserError('Unknown role.'); update.role_id = patch.roleId; }
    if (patch.profileId) { if (kinds.get(patch.profileId) !== 'profile') throw new CrmUserError('Unknown profile.'); update.profile_id = patch.profileId; }
  }
  if (typeof patch.active === 'boolean') update.active = patch.active;
  const { error } = await svc.from('crm_users').update(update).eq('user_id', userId);
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'crm_user_update', meta: { user: userId, ...patch } });
}

export async function saveRole(ctx: CrmContext, input: { id?: string | null; name: string; parentId: string | null; shareWithPeers?: boolean }) {
  need(ctx, 'manage_users');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id, config').eq('kind', 'role');
  const roles: Record<string, string | null> = {};
  for (const r of (data ?? []) as Array<{ id: string; config: { parentId?: string | null } }>) roles[r.id] = r.config?.parentId ?? null;
  if (input.parentId && !(input.parentId in roles)) throw new CrmUserError('Unknown parent role.');
  const config = { parentId: input.parentId ?? null, shareWithPeers: !!input.shareWithPeers };
  if (input.id) {
    if (!(input.id in roles)) throw new CrmAccessError('Role not found.');
    if (wouldCycle(roles, input.id, input.parentId)) throw new CrmUserError('A role can’t report to itself or to one of its own subordinates.');
    const { error } = await svc.from('crm_config').update({ name: cleanName(input.name, 80), config, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id);
    if (error) throw error;
  } else {
    if (!input.parentId && Object.values(roles).some((p) => p === null)) throw new CrmUserError('There is already a top role. Pick who this role reports to.');
    const { error } = await svc.from('crm_config').insert({ kind: 'role', name: cleanName(input.name, 80), config, created_by: ctx.userId });
    if (error) throw error.code === '23505' ? new CrmUserError('A role with this name exists.') : error;
  }
  await audit(svc, { actor_id: ctx.userId, action: 'role_save', meta: { name: input.name } });
}

export async function saveProfile(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; config: unknown; description?: string }) {
  need(ctx, 'manage_users');
  const svc = createServiceClient();
  const config = { ...cleanProfile(input.config, meta.modules.map((m) => m.api_name)), description: String(input.description ?? '').slice(0, 300) };
  // Mandatory fields can't be hidden or read-only (nobody with this profile could create a record).
  for (const [mod, fmap] of Object.entries(config.fields)) {
    for (const f of Object.keys(fmap)) {
      const def = meta.field(mod, f);
      if (!def || def.required) delete fmap[f];
    }
  }
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Profile not found.');
    const { error } = await svc.from('crm_config').update({ name: cleanName(input.name, 80), config, updated_by: ctx.userId, updated_at: new Date().toISOString() }).eq('id', input.id).eq('kind', 'profile');
    if (error) throw error;
  } else {
    const { error } = await svc.from('crm_config').insert({ kind: 'profile', name: cleanName(input.name, 80), config, created_by: ctx.userId });
    if (error) throw error.code === '23505' ? new CrmUserError('A profile with this name exists.') : error;
  }
  await audit(svc, { actor_id: ctx.userId, action: 'profile_save', meta: { name: input.name } });
}

export async function saveSharingRule(ctx: CrmContext, meta: Meta, input: { id?: string | null; module: string; name: string; criteria?: unknown; ownerRoleIds?: string[]; toRoleIds: string[]; toSubordinates?: boolean; access: string; active?: boolean }) {
  need(ctx, 'manage_users');
  getModuleOrThrow(meta, input.module);
  if (!['read', 'rw', 'rwd'].includes(input.access)) throw new CrmUserError('Pick an access level.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_config').select('id').eq('kind', 'role');
  const roleIds = new Set(((data ?? []) as Array<{ id: string }>).map((r) => r.id));
  const to = (input.toRoleIds ?? []).filter((r) => roleIds.has(r));
  if (!to.length) throw new CrmUserError('Pick at least one role to share with.');
  const owners = (input.ownerRoleIds ?? []).filter((r) => roleIds.has(r));
  const criteria = input.criteria ? validateCriteria(input.criteria, meta.fields(input.module)) : undefined;
  if (!criteria && !owners.length) throw new CrmUserError('Share records by owner role or by criteria.');
  const config = { criteria, ownerRoleIds: owners, toRoleIds: to, toSubordinates: !!input.toSubordinates, access: input.access };
  const row = { kind: 'sharing_rule', module: input.module, name: cleanName(input.name, 80), active: input.active !== false, config, updated_by: ctx.userId, updated_at: new Date().toISOString() };
  if (input.id) {
    if (!isUuid(input.id)) throw new CrmAccessError('Rule not found.');
    const { error } = await svc.from('crm_config').update(row).eq('id', input.id).eq('kind', 'sharing_rule');
    if (error) throw error;
  } else {
    const { error } = await svc.from('crm_config').insert({ ...row, created_by: ctx.userId });
    if (error) throw error;
  }
  await audit(svc, { actor_id: ctx.userId, action: 'sharing_rule_save', module: input.module, meta: { name: input.name } });
}

export async function listConfig(kind: string, module?: string) {
  const svc = createServiceClient();
  let qb = svc.from('crm_config').select('id, kind, module, name, active, position, config, owner_id, shared, updated_at, public_key').eq('kind', kind);
  if (module) qb = qb.eq('module', module);
  const { data } = await qb.order('position').order('name');
  return (data ?? []) as Array<{ id: string; kind: string; module: string | null; name: string; active: boolean; position: number; config: Record<string, unknown>; owner_id: string | null; shared: boolean; updated_at: string; public_key: string | null }>;
}
