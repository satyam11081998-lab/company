/**
 * MECE CRM — shared types. Pure: no imports from Next, Supabase or '@/…', so
 * every module that only depends on this file can be unit-tested with plain
 * `tsx`. See docs/crm/DESIGN.md.
 */

export const FIELD_TYPES = [
  'text', 'textarea', 'email', 'phone', 'url',
  'integer', 'decimal', 'currency', 'percent',
  'date', 'datetime', 'boolean',
  'picklist', 'multipicklist',
  'lookup',       // options.module — one record of another module
  'related',      // options.modules — polymorphic "Related To" (module + id)
  'user',         // a CRM user (users.id)
  'autonumber',   // options.prefix, options.pad
  'formula',      // options.expr, options.returns
  'rollup',       // options.{module, via, fn, field?, criteria?}
  'line_items',   // inventory subform (quotes / orders / invoices / price books)
  'json',         // system-only structured value, never user-editable
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export interface PicklistOption {
  value: string;
  label?: string;
  color?: string;
}

export interface FieldOptions {
  picklist?: PicklistOption[];
  /** lookup: target module api name */
  module?: string;
  /** related: allowed target modules */
  modules?: string[];
  maxLength?: number;
  min?: number;
  max?: number;
  precision?: number;
  prefix?: string;
  pad?: number;
  expr?: string;
  returns?: 'number' | 'currency' | 'text' | 'date' | 'boolean' | 'percent';
  /** rollup */
  via?: string;            // field on the child module that points at this record
  fn?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  field?: string;
  criteria?: Criteria;
  defaultValue?: unknown;
  help?: string;
  /** line_items: 'sale' (qty/price/discount/tax) or 'pricebook' (product + list price) */
  mode?: 'sale' | 'pricebook';
  /** text shown when the value is synced from MECE */
  syncedFrom?: string;
}

export interface FieldDef {
  module: string;
  api_name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  is_unique?: boolean;
  readonly?: boolean;
  /** system fields are written only by the engine (formulas, sync, conversion …) */
  system?: boolean;
  /** written by MECE sync: read-only on synced records, editable on manual ones */
  synced?: boolean;
  options?: FieldOptions;
  section?: string;
  position?: number;
  active?: boolean;
  id?: string;
}

export type SharingLevel = 'private' | 'public_read' | 'public_rw' | 'public_rwd';

export interface ModuleSettings {
  /** fields whose values (joined by a space) make the record name */
  nameFields: string[];
  sharing?: SharingLevel;
  kanbanField?: string;
  supports?: {
    convert?: boolean;
    lineItems?: boolean;
    activities?: boolean;
    pipelines?: boolean;
    campaigns?: boolean;
    email?: boolean;
  };
  /** primary email field for duplicate checks, consent and email */
  emailField?: string;
  phoneField?: string;
  /** list view default columns */
  defaultColumns?: string[];
  description?: string;
}

export interface ModuleDef {
  api_name: string;
  label: string;
  singular: string;
  kind: 'standard' | 'custom';
  icon?: string;
  position: number;
  settings: ModuleSettings;
  active?: boolean;
}

export interface CrmRecord {
  id: string;
  module: string;
  name: string;
  owner_id: string | null;
  data: Record<string, unknown>;
  tags: string[];
  external_key: string | null;
  mece_user_id: string | null;
  source: string | null;
  source_ref: string | null;
  score: number | null;
  last_activity_at: string | null;
  locked: { kind: string; reason?: string; by?: string; at?: string } | null;
  approval_status: string | null;
  blueprint: { id: string; state: string; entered_at: string } | null;
  shared_with: Array<{ user_id: string; access: AccessLevel }>;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  merged_into: string | null;
}

/** Record columns that criteria/views/reports may address directly. */
export const RECORD_COLUMNS = [
  'name', 'owner_id', 'tags', 'created_at', 'updated_at', 'created_by', 'updated_by',
  'last_activity_at', 'score', 'source', 'approval_status',
] as const;
export type RecordColumn = (typeof RECORD_COLUMNS)[number];

// ---------------------------------------------------------------------------
// Criteria (views, rules, segments, reports)
// ---------------------------------------------------------------------------

export const OPERATORS = [
  'eq', 'neq', 'contains', 'not_contains', 'starts_with', 'ends_with',
  'empty', 'not_empty',
  'gt', 'gte', 'lt', 'lte', 'between',
  'in', 'not_in',
  'before', 'after', 'on',
  'in_last_days', 'in_next_days', 'older_than_days',
  'today', 'this_week', 'this_month', 'last_month', 'this_quarter', 'this_year',
  'has_tag', 'not_has_tag',
  // edit-trigger operators: need the previous record
  'changed', 'changed_to', 'changed_from',
] as const;
export type Operator = (typeof OPERATORS)[number];

export interface Condition {
  field: string;
  op: Operator;
  value?: unknown;
  value2?: unknown;
}

export interface Criteria {
  match: 'all' | 'any';
  conditions: Array<Condition | Criteria>;
}

export function isCriteria(x: unknown): x is Criteria {
  return !!x && typeof x === 'object' && 'match' in (x as object) && Array.isArray((x as Criteria).conditions);
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export const MODULE_PERMS = ['view', 'create', 'edit', 'delete', 'import', 'export', 'email', 'convert'] as const;
export type ModulePerm = (typeof MODULE_PERMS)[number];

export const SETUP_PERMS = [
  'manage_setup',        // modules, fields, layouts, pipelines, views
  'manage_users',        // CRM users, roles, profiles, sharing
  'manage_automation',   // workflows, blueprints, approvals, assignment, scoring, cadences, macros
  'approve_outbox',      // approve customer-facing messages
  'manage_marketing',    // templates, campaigns, segments, web forms, surveys
  'view_analytics',
  'manage_reports',
  'manage_ai',
  'manage_privacy',      // DPDP consents, requests, blocklist, breaches
  'view_audit',
  'manage_data',         // import undo, backup, recycle-bin purge, sync
] as const;
export type SetupPerm = (typeof SETUP_PERMS)[number];

export type FieldAccess = 'rw' | 'ro' | 'hidden';

export interface ProfileConfig {
  modules: Record<string, Partial<Record<ModulePerm, boolean>>>;
  setup: Partial<Record<SetupPerm, boolean>>;
  fields: Record<string, Record<string, FieldAccess>>;
  /** default for modules not listed in `modules` */
  allModules?: Partial<Record<ModulePerm, boolean>>;
}

export interface RoleConfig {
  parentId: string | null;
  shareWithPeers?: boolean;
}

export interface SharingRuleConfig {
  /** records owned by users in these roles (and optionally subordinates) … */
  ownerRoleIds?: string[];
  includeSubordinates?: boolean;
  /** … or records matching these criteria */
  criteria?: Criteria;
  /** are shared with users in these roles */
  toRoleIds: string[];
  toSubordinates?: boolean;
  access: 'read' | 'rw' | 'rwd';
}

export interface TerritoryConfig {
  parentId: string | null;
  /** module the criteria apply to (set from crm_config.module) */
  module?: string;
  criteria?: Criteria;
  memberIds: string[];
  managerId?: string | null;
  access: 'read' | 'rw' | 'rwd';
}

export interface CrmContext {
  userId: string;
  /** MECE admin → CRM Administrator: every permission, all data */
  superAdmin: boolean;
  profileId: string | null;
  roleId: string | null;
  profile: ProfileConfig;
  /** role ids strictly below this user's role */
  subordinateRoleIds: string[];
  /** user ids whose records this user sees through the role hierarchy */
  subordinateUserIds: string[];
  /** user ids sharing this user's role when share-with-peers is on */
  peerUserIds: string[];
  /** sharing rules that grant this user access */
  sharingRules: Array<SharingRuleConfig & { module: string }>;
  /** territories this user belongs to (criteria-based visibility) */
  territories: Array<TerritoryConfig & { id: string }>;
  /** role id of every CRM user, for owner-role sharing rules */
  userRoles: Record<string, string | null>;
}

export type AccessLevel = 'read' | 'rw' | 'rwd';

// ---------------------------------------------------------------------------
// Line items (inventory subform)
// ---------------------------------------------------------------------------

export interface LineItem {
  product_id: string | null;
  product_name: string;
  description?: string;
  quantity: number;
  list_price: number;
  discount: number;      // absolute, in document currency
  tax_pct: number;       // 0–100
  total?: number;        // computed
}

export interface LineTotals {
  sub_total: number;
  discount_total: number;
  tax_total: number;
  adjustment: number;
  grand_total: number;
}

// ---------------------------------------------------------------------------
// Pipelines
// ---------------------------------------------------------------------------

export type ForecastCategory = 'Pipeline' | 'Best Case' | 'Commit' | 'Closed Won' | 'Omitted';

export interface PipelineStage {
  key: string;
  label: string;
  probability: number;
  forecast: ForecastCategory;
  state: 'open' | 'won' | 'lost';
}

export interface PipelineConfig {
  stages: PipelineStage[];
  isDefault?: boolean;
  description?: string;
}

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export interface ViewConfig {
  criteria?: Criteria | null;
  columns?: string[];
  sort?: { field: string; dir: 'asc' | 'desc' };
  /** system views are generated, never stored */
  system?: boolean;
}

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
