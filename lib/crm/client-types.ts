/**
 * Serializable shapes passed from CRM server components to client components.
 * Hidden fields never appear here; read-only ones carry `ro`.
 */
import type { CrmContext, FieldDef, ModuleDef, PipelineConfig } from './types';
import { fieldAccess } from './permissions';
import { syncedFieldLocked } from './engine';

export interface ClientField {
  api: string;
  label: string;
  type: FieldDef['type'];
  required: boolean;
  /** not editable by this user (field security, system, synced on a synced record) */
  ro: boolean;
  system: boolean;
  synced: boolean;
  section: string;
  picklist?: string[];
  lookup?: string;
  related?: string[];
  mode?: 'sale' | 'pricebook';
  help?: string;
  returns?: string;
}

export interface ClientModule {
  api: string;
  label: string;
  singular: string;
  kind: string;
  nameFields: string[];
  emailField?: string;
  kanbanField?: string;
  supports: NonNullable<ModuleDef['settings']['supports']>;
  description?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  owner_id: string | null;
  data: Record<string, unknown>;
  tags: string[];
  external_key: string | null;
  mece_user_id: string | null;
  score: number | null;
  locked: { kind: string; reason?: string } | null;
  approval_status: string | null;
  blueprint: { id: string; state: string } | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
  deleted_at?: string | null;
  shared_with: Array<{ user_id: string; access: 'read' | 'rw' | 'rwd' }>;
}

export interface ClientPipeline {
  name: string;
  stages: PipelineConfig['stages'];
}

export function toClientFields(ctx: CrmContext, module: string, fields: FieldDef[], externalKey: string | null = null): ClientField[] {
  return fields
    .filter((f) => f.active !== false && fieldAccess(ctx, module, f.api_name) !== 'hidden')
    .map((f) => {
      const computed = ['autonumber', 'formula', 'rollup', 'json'].includes(f.type);
      return {
        api: f.api_name,
        label: f.label,
        type: f.type,
        required: !!f.required,
        ro: fieldAccess(ctx, module, f.api_name) !== 'rw' || !!f.system || !!f.readonly || computed || (!!externalKey && !!f.synced && syncedFieldLocked(module, externalKey, f.api_name)),
        system: !!f.system || computed,
        synced: !!f.synced,
        section: f.section ?? 'Details',
        picklist: f.options?.picklist?.map((p) => p.value),
        lookup: f.options?.module,
        related: f.options?.modules,
        mode: f.options?.mode,
        help: f.options?.help,
        returns: f.options?.returns,
      };
    });
}

export function toClientModule(m: ModuleDef): ClientModule {
  return {
    api: m.api_name, label: m.label, singular: m.singular, kind: m.kind, nameFields: m.settings.nameFields,
    emailField: m.settings.emailField, kanbanField: m.settings.kanbanField, supports: m.settings.supports ?? {}, description: m.settings.description,
  };
}

export function toClientRecord(r: {
  id: string; name: string; owner_id: string | null; data: Record<string, unknown>; tags: string[]; external_key: string | null; mece_user_id: string | null;
  score: number | null; locked: { kind: string; reason?: string } | null; approval_status: string | null; blueprint: { id: string; state: string } | null;
  created_at: string; updated_at: string; last_activity_at: string | null; deleted_at?: string | null;
  shared_with?: Array<{ user_id: string; access: 'read' | 'rw' | 'rwd' }>;
}): ClientRecord {
  return {
    id: r.id, name: r.name, owner_id: r.owner_id, data: r.data, tags: r.tags, external_key: r.external_key, mece_user_id: r.mece_user_id,
    score: r.score, locked: r.locked ? { kind: r.locked.kind, reason: r.locked.reason } : null, approval_status: r.approval_status,
    blueprint: r.blueprint ? { id: r.blueprint.id, state: r.blueprint.state } : null, created_at: r.created_at, updated_at: r.updated_at,
    last_activity_at: r.last_activity_at, deleted_at: r.deleted_at ?? null,
    shared_with: Array.isArray(r.shared_with) ? r.shared_with : [],
  };
}
