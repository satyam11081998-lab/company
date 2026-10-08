/**
 * Module + field metadata, effective per request.
 *
 * Standard modules/fields are defined in code (lib/crm/modules.ts). Their DB
 * rows hold only the parts an admin may change (label, position, section,
 * required, active, extra picklist values, sharing). Custom modules/fields are
 * fully defined by their DB rows. `ensureMetadata` seeds the DB the first time
 * the CRM is opened and again whenever META_VERSION changes; it never
 * overwrites an admin's changes.
 */
import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { DEFAULT_PIPELINES, STANDARD_FIELDS, STANDARD_MODULES } from '@/lib/crm/modules';
import { DEFAULT_PROFILES, DEFAULT_ROLES } from '@/lib/crm/permissions';
import type { FieldDef, ModuleDef, ModuleSettings, PicklistOption, PipelineConfig, SharingLevel } from '@/lib/crm/types';

export const META_VERSION = 3;

export interface Pipeline {
  id: string;
  name: string;
  active: boolean;
  config: PipelineConfig;
}

export interface Meta {
  modules: ModuleDef[];
  module: (api: string) => ModuleDef | undefined;
  fields: (api: string) => FieldDef[];
  field: (api: string, field: string) => FieldDef | undefined;
  pipelines: Pipeline[];
  defaultPipeline: () => Pipeline | undefined;
}

const STD_MODULE = new Map(STANDARD_MODULES.map((m) => [m.api_name, m]));
const STD_FIELD = new Map(STANDARD_FIELDS.map((f) => [`${f.module}.${f.api_name}`, f]));

const EDITABLE_SETTINGS: Array<keyof ModuleSettings> = ['sharing', 'kanbanField', 'defaultColumns', 'description'];

interface ModuleRow { api_name: string; label: string; singular: string; kind: string; icon: string | null; position: number; settings: Record<string, unknown>; active: boolean }
interface FieldRow { id: string; module: string; api_name: string; label: string; type: string; required: boolean; is_unique: boolean; readonly: boolean; system: boolean; options: Record<string, unknown>; section: string; position: number; active: boolean }

function mergeModule(row: ModuleRow): ModuleDef {
  const std = STD_MODULE.get(row.api_name);
  if (!std) {
    const s = row.settings as Partial<ModuleSettings>;
    return {
      api_name: row.api_name, label: row.label, singular: row.singular, kind: 'custom', icon: row.icon ?? 'Boxes',
      position: row.position, active: row.active,
      settings: { nameFields: Array.isArray(s.nameFields) && s.nameFields.length ? s.nameFields : ['record_name'], sharing: (s.sharing as SharingLevel) ?? 'public_rw',
        kanbanField: s.kanbanField, defaultColumns: s.defaultColumns, description: s.description, supports: { activities: true } },
    };
  }
  const settings: ModuleSettings = { ...std.settings };
  for (const k of EDITABLE_SETTINGS) {
    const v = (row.settings as Record<string, unknown>)[k];
    if (v !== undefined && v !== null) (settings as unknown as Record<string, unknown>)[k] = v;
  }
  return { ...std, label: row.label || std.label, singular: row.singular || std.singular, position: row.position, active: row.active, settings };
}

function mergeField(row: FieldRow): FieldDef {
  const std = STD_FIELD.get(`${row.module}.${row.api_name}`);
  if (!std) {
    return {
      id: row.id, module: row.module, api_name: row.api_name, label: row.label, type: row.type as FieldDef['type'],
      required: row.required, is_unique: row.is_unique, readonly: row.readonly, system: row.system,
      options: row.options as FieldDef['options'], section: row.section, position: row.position, active: row.active,
    };
  }
  const opts = { ...(std.options ?? {}) };
  const rowPick = (row.options as { picklist?: PicklistOption[] }).picklist;
  if (std.type === 'picklist' || std.type === 'multipicklist') {
    if (Array.isArray(rowPick) && rowPick.length) {
      if (std.synced || std.system) {
        // keep every code value (sync writes them); admins may only ADD
        const have = new Set((opts.picklist ?? []).map((p) => p.value));
        opts.picklist = [...(opts.picklist ?? []), ...rowPick.filter((p) => p && typeof p.value === 'string' && !have.has(p.value))];
      } else {
        opts.picklist = rowPick.filter((p) => p && typeof p.value === 'string');
      }
    }
  }
  const nameField = STD_MODULE.get(row.module)?.settings.nameFields.includes(row.api_name);
  return {
    ...std,
    id: row.id,
    label: row.label || std.label,
    // A standard field that is required in code stays required; admins may make others required.
    required: !!std.required || !!row.required,
    section: row.section || std.section,
    position: row.position,
    // name fields and system fields can't be switched off
    active: nameField || std.system ? true : row.active,
    options: opts,
  };
}

export async function loadMetaWith(svc: SupabaseClient): Promise<Meta> {
  const fetchAll = () => Promise.all([
    svc.from('crm_modules').select('api_name, label, singular, kind, icon, position, settings, active').order('position'),
    svc.from('crm_fields').select('id, module, api_name, label, type, required, is_unique, readonly, system, options, section, position, active').limit(5000),
    svc.from('crm_config').select('id, name, active, config, position').eq('kind', 'pipeline').order('position'),
    svc.from('crm_settings').select('value').eq('key', 'meta.version').maybeSingle(),
  ]);
  let [m, f, p, v] = await fetchAll();
  if (m.error) throw m.error;
  const version = Number((v.data as { value?: { v?: number } } | null)?.value?.v ?? 0);
  if (!m.data?.length || version < META_VERSION) {
    await ensureMetadata(svc);
    [m, f, p, v] = await fetchAll();
    if (m.error) throw m.error;
  }
  const modules = ((m.data ?? []) as ModuleRow[]).map(mergeModule).sort((a, b) => a.position - b.position);
  if (process.env.CRM_DEBUG) console.log('[crm] meta loaded', modules.length, 'modules', (f.data ?? []).length, 'fields', 'version', version);
  const byModule = new Map<string, FieldDef[]>();
  for (const row of (f.data ?? []) as FieldRow[]) {
    const def = mergeField(row);
    byModule.set(def.module, [...(byModule.get(def.module) ?? []), def]);
  }
  for (const [k, list] of byModule) byModule.set(k, list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)));
  const pipelines = ((p.data ?? []) as Array<{ id: string; name: string; active: boolean; config: PipelineConfig }>);
  const modMap = new Map(modules.map((x) => [x.api_name, x]));
  return {
    modules,
    module: (api) => modMap.get(api),
    fields: (api) => byModule.get(api) ?? [],
    field: (api, field) => (byModule.get(api) ?? []).find((x) => x.api_name === field),
    pipelines,
    defaultPipeline: () => pipelines.find((x) => x.active && x.config?.isDefault) ?? pipelines.find((x) => x.active),
  };
}

/** Request-scoped metadata. */
export const loadMeta = cache(async (): Promise<Meta> => loadMetaWith(createServiceClient()));

/**
 * Seed standard metadata. Inserts only what is missing (ON CONFLICT DO
 * NOTHING), so admin edits survive every run.
 */
export async function ensureMetadata(svc: SupabaseClient): Promise<void> {
  const mods = STANDARD_MODULES.map((m) => ({
    api_name: m.api_name, label: m.label, singular: m.singular, kind: 'standard', icon: m.icon ?? null,
    position: m.position, settings: { sharing: m.settings.sharing ?? 'public_rw' }, active: true,
  }));
  const r1 = await svc.from('crm_modules').upsert(mods, { onConflict: 'api_name', ignoreDuplicates: true });
  if (r1.error) throw r1.error;

  const fields = STANDARD_FIELDS.map((x) => ({
    module: x.module, api_name: x.api_name, label: x.label, type: x.type, required: !!x.required, is_unique: !!x.is_unique,
    readonly: !!x.readonly, system: !!x.system, options: x.type === 'picklist' || x.type === 'multipicklist' ? { picklist: x.options?.picklist ?? [] } : {},
    section: x.section ?? 'Details', position: x.position ?? 100, active: true,
  }));
  for (let i = 0; i < fields.length; i += 200) {
    const r = await svc.from('crm_fields').upsert(fields.slice(i, i + 200), { onConflict: 'module,api_name', ignoreDuplicates: true });
    if (r.error) throw r.error;
  }

  const { data: existing } = await svc.from('crm_config').select('kind, name').in('kind', ['pipeline', 'profile', 'role']);
  const have = new Set(((existing ?? []) as Array<{ kind: string; name: string }>).map((x) => `${x.kind}:${x.name}`));
  const hasKind = (k: string) => ((existing ?? []) as Array<{ kind: string }>).some((x) => x.kind === k);

  if (!hasKind('pipeline')) {
    const rows = DEFAULT_PIPELINES.map((p, i) => ({ kind: 'pipeline', module: 'deals', name: p.name, position: (i + 1) * 10, config: p.config }));
    const r = await svc.from('crm_config').insert(rows);
    if (r.error && r.error.code !== '23505') throw r.error; // 23505: a parallel request seeded it
  }
  if (!hasKind('profile')) {
    const rows = DEFAULT_PROFILES.map((p, i) => ({ kind: 'profile', name: p.name, position: (i + 1) * 10, config: { ...p.config, description: p.description } }));
    const r = await svc.from('crm_config').insert(rows);
    if (r.error && r.error.code !== '23505') throw r.error;
  }
  if (!hasKind('role')) {
    // insert parents first so children can reference real ids
    const ids: Record<string, string> = {};
    for (const role of DEFAULT_ROLES) {
      if (have.has(`role:${role.name}`)) continue;
      const { data, error } = await svc.from('crm_config')
        .insert({ kind: 'role', name: role.name, config: { parentId: role.parent ? ids[role.parent] ?? null : null, shareWithPeers: false } })
        .select('id').single();
      if (error && error.code !== '23505') throw error;
      if (data) ids[role.key] = (data as { id: string }).id;
      else {
        const { data: ex } = await svc.from('crm_config').select('id').eq('kind', 'role').eq('name', role.name).maybeSingle();
        if (ex) ids[role.key] = (ex as { id: string }).id;
      }
    }
  }
  await svc.from('crm_settings').upsert({ key: 'meta.version', value: { v: META_VERSION }, updated_at: new Date().toISOString() });
}

export function pipelineFor(meta: Meta, name: unknown): Pipeline | undefined {
  if (typeof name !== 'string' || !name) return meta.defaultPipeline();
  return meta.pipelines.find((p) => p.name === name || p.id === name);
}

export function stageOf(p: Pipeline | undefined, stage: unknown) {
  if (!p || typeof stage !== 'string') return undefined;
  return p.config.stages.find((s) => s.key === stage || s.label === stage);
}
