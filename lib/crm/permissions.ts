/**
 * Who may do what — profiles (module + setup + field permissions) and data
 * sharing (owner, role hierarchy, peers, org-wide defaults, sharing rules,
 * territories, manual shares). Pure; the server builds a CrmContext once per
 * request and every read/write path asks these functions.
 */
import { evaluate } from './criteria';
import type {
  AccessLevel, CrmContext, CrmRecord, FieldAccess, FieldDef, ModulePerm, ProfileConfig, SetupPerm, SharingLevel,
} from './types';
import { MODULE_PERMS, SETUP_PERMS } from './types';

const RANK: Record<AccessLevel, number> = { read: 1, rw: 2, rwd: 3 };

export function maxAccess(a: AccessLevel | null, b: AccessLevel | null): AccessLevel | null {
  if (!a) return b;
  if (!b) return a;
  return RANK[a] >= RANK[b] ? a : b;
}

export function allows(level: AccessLevel | null, need: AccessLevel): boolean {
  return !!level && RANK[level] >= RANK[need];
}

export function can(ctx: CrmContext, module: string, perm: ModulePerm): boolean {
  if (ctx.superAdmin) return true;
  const m = ctx.profile.modules?.[module];
  if (m && typeof m[perm] === 'boolean') return m[perm] as boolean;
  return ctx.profile.allModules?.[perm] === true;
}

export function canSetup(ctx: CrmContext, perm: SetupPerm): boolean {
  if (ctx.superAdmin) return true;
  return ctx.profile.setup?.[perm] === true;
}

export function fieldAccess(ctx: CrmContext, module: string, field: string): FieldAccess {
  if (ctx.superAdmin) return 'rw';
  const a = ctx.profile.fields?.[module]?.[field];
  return a === 'ro' || a === 'hidden' ? a : 'rw';
}

const SHARING_GRANT: Record<SharingLevel, AccessLevel | null> = {
  private: null,
  public_read: 'read',
  public_rw: 'rw',
  public_rwd: 'rwd',
};

/**
 * Highest access this user has to `rec`, or null for none. Module-level CRUD
 * permission is checked separately (`can`): a record you can see is still
 * not editable if your profile can't edit the module.
 */
export function recordAccess(
  ctx: CrmContext,
  rec: { owner_id: string | null; data: Record<string, unknown>; module: string; tags?: string[]; shared_with?: unknown },
  moduleSharing: SharingLevel = 'private',
): AccessLevel | null {
  if (ctx.superAdmin) return 'rwd';
  if (!can(ctx, rec.module, 'view')) return null;
  let level: AccessLevel | null = null;
  const owner = rec.owner_id;
  if (owner && owner === ctx.userId) return 'rwd';
  if (owner && ctx.subordinateUserIds.includes(owner)) level = maxAccess(level, 'rwd');
  if (owner && ctx.peerUserIds.includes(owner)) level = maxAccess(level, 'rw');
  level = maxAccess(level, SHARING_GRANT[moduleSharing] ?? null);
  if (level === 'rwd') return level;

  for (const rule of ctx.sharingRules) {
    if (rule.module !== rec.module) continue;
    let hit = false;
    if (rule.criteria) hit = evaluate(rec as unknown as CrmRecord, rule.criteria);
    else if (rule.ownerRoleIds?.length && owner) {
      const ownerRole = ctx.userRoles[owner] ?? null;
      hit = !!ownerRole && rule.ownerRoleIds.includes(ownerRole);
    }
    if (hit) level = maxAccess(level, rule.access);
  }
  for (const t of ctx.territories) {
    if (t.module && t.module !== rec.module) continue;
    if (t.criteria && evaluate(rec as unknown as CrmRecord, t.criteria)) level = maxAccess(level, t.access);
  }
  if (Array.isArray(rec.shared_with)) {
    for (const s of rec.shared_with as Array<{ user_id?: unknown; access?: unknown }>) {
      if (s && s.user_id === ctx.userId && (s.access === 'read' || s.access === 'rw' || s.access === 'rwd')) {
        level = maxAccess(level, s.access);
      }
    }
  }
  return level;
}

/** Copy of `data` without the fields this user may not see. */
export function visibleData(ctx: CrmContext, module: string, data: Record<string, unknown>): Record<string, unknown> {
  if (ctx.superAdmin) return { ...data };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (fieldAccess(ctx, module, k) !== 'hidden') out[k] = v;
  }
  return out;
}

export function visibleFields<T extends Pick<FieldDef, 'api_name'>>(ctx: CrmContext, module: string, fields: T[]): T[] {
  return fields.filter((f) => fieldAccess(ctx, module, f.api_name) !== 'hidden');
}

// ---------------------------------------------------------------------------
// Profiles and roles
// ---------------------------------------------------------------------------

const ALL = Object.fromEntries(MODULE_PERMS.map((p) => [p, true])) as Record<ModulePerm, boolean>;
const NONE = Object.fromEntries(MODULE_PERMS.map((p) => [p, false])) as Record<ModulePerm, boolean>;
const pick = (...perms: ModulePerm[]) => Object.fromEntries(MODULE_PERMS.map((p) => [p, perms.includes(p)])) as Record<ModulePerm, boolean>;

export const EMPTY_PROFILE: ProfileConfig = { modules: {}, setup: {}, fields: {}, allModules: { ...NONE } };

export const DEFAULT_PROFILES: Array<{ name: string; config: ProfileConfig; description: string }> = [
  {
    name: 'Administrator',
    description: 'Everything, including setup, users and privacy.',
    config: {
      allModules: { ...ALL },
      modules: {},
      setup: Object.fromEntries(SETUP_PERMS.map((p) => [p, true])),
      fields: {},
    },
  },
  {
    name: 'Sales Representative',
    description: 'Works leads, contacts, accounts and deals; quotes; no delete, import or export.',
    config: {
      allModules: pick('view'),
      modules: {
        leads: pick('view', 'create', 'edit', 'convert', 'email'),
        contacts: pick('view', 'create', 'edit', 'email'),
        accounts: pick('view', 'create', 'edit'),
        deals: pick('view', 'create', 'edit'),
        tasks: pick('view', 'create', 'edit', 'delete'),
        calls: pick('view', 'create', 'edit', 'delete'),
        meetings: pick('view', 'create', 'edit', 'delete'),
        quotes: pick('view', 'create', 'edit', 'convert', 'email'),
        sales_orders: pick('view', 'create', 'edit'),
        invoices: pick('view'),
        purchase_orders: { ...NONE },
        vendors: { ...NONE },
      },
      setup: { view_analytics: true },
      fields: { contacts: { mece_ai_cost_usd: 'hidden' } },
    },
  },
  {
    name: 'Support Agent',
    description: 'Cases and the knowledge base; reads customers; logs activities.',
    config: {
      allModules: { ...NONE },
      modules: {
        cases: pick('view', 'create', 'edit', 'email'),
        solutions: pick('view', 'create', 'edit'),
        contacts: pick('view', 'edit'),
        accounts: pick('view'),
        tasks: pick('view', 'create', 'edit', 'delete'),
        calls: pick('view', 'create', 'edit', 'delete'),
        meetings: pick('view', 'create', 'edit'),
        products: pick('view'),
      },
      setup: {},
      fields: {
        contacts: { mece_revenue_inr: 'hidden', mece_revenue_intl: 'hidden', mece_ai_cost_usd: 'hidden', lead_source: 'ro' },
      },
    },
  },
  {
    name: 'Marketing',
    description: 'Leads, contacts and campaigns, with import, export and email; templates, segments, forms and surveys.',
    config: {
      allModules: pick('view'),
      modules: {
        leads: pick('view', 'create', 'edit', 'import', 'export', 'email'),
        contacts: pick('view', 'edit', 'export', 'email'),
        campaigns: pick('view', 'create', 'edit', 'delete', 'export'),
        tasks: pick('view', 'create', 'edit'),
        purchase_orders: { ...NONE },
        vendors: { ...NONE },
        invoices: { ...NONE },
      },
      setup: { manage_marketing: true, view_analytics: true, manage_reports: true },
      fields: {},
    },
  },
  {
    name: 'Read only',
    description: 'Sees every module it is shared; changes nothing.',
    config: { allModules: pick('view'), modules: {}, setup: { view_analytics: true }, fields: {} },
  },
];

/** Role tree helpers. `roles`: id → parentId. */
export function descendants(roles: Record<string, string | null>, rootId: string): string[] {
  const out: string[] = [];
  const children = new Map<string, string[]>();
  for (const [id, parent] of Object.entries(roles)) {
    if (!parent) continue;
    children.set(parent, [...(children.get(parent) ?? []), id]);
  }
  const seen = new Set<string>([rootId]);
  const stack = [...(children.get(rootId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue; // cycle guard
    seen.add(id);
    out.push(id);
    stack.push(...(children.get(id) ?? []));
  }
  return out;
}

export function ancestors(roles: Record<string, string | null>, id: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>([id]);
  let cur = roles[id] ?? null;
  while (cur && !seen.has(cur)) {
    out.push(cur);
    seen.add(cur);
    cur = roles[cur] ?? null;
  }
  return out;
}

/** True if setting `parentId` as the parent of `id` would create a cycle. */
export function wouldCycle(roles: Record<string, string | null>, id: string, parentId: string | null): boolean {
  if (!parentId) return false;
  if (parentId === id) return true;
  return ancestors(roles, parentId).includes(id);
}

export const DEFAULT_ROLES: Array<{ key: string; name: string; parent: string | null }> = [
  { key: 'ceo', name: 'Founder (CEO)', parent: null },
  { key: 'sales_manager', name: 'Sales Manager', parent: 'ceo' },
  { key: 'sales_rep', name: 'Sales Representative', parent: 'sales_manager' },
  { key: 'support_manager', name: 'Support Manager', parent: 'ceo' },
  { key: 'support_agent', name: 'Support Agent', parent: 'support_manager' },
  { key: 'marketing_manager', name: 'Marketing Manager', parent: 'ceo' },
];

/** Validate a profile config arriving from the setup UI. */
export function cleanProfile(raw: unknown, moduleNames: string[]): ProfileConfig {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<ProfileConfig>;
  const bools = <K extends string>(o: unknown, keys: readonly K[]) => {
    const src = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>;
    const out: Partial<Record<K, boolean>> = {};
    for (const k of keys) if (typeof src[k] === 'boolean') out[k] = src[k] as boolean;
    return out;
  };
  const modules: ProfileConfig['modules'] = {};
  for (const m of moduleNames) {
    const v = (r.modules as Record<string, unknown> | undefined)?.[m];
    if (v) modules[m] = bools(v, MODULE_PERMS);
  }
  const fields: ProfileConfig['fields'] = {};
  for (const m of moduleNames) {
    const v = (r.fields as Record<string, Record<string, unknown>> | undefined)?.[m];
    if (!v || typeof v !== 'object') continue;
    const fm: Record<string, FieldAccess> = {};
    for (const [k, a] of Object.entries(v)) {
      if (/^[a-z][a-z0-9_]{0,50}$/.test(k) && (a === 'rw' || a === 'ro' || a === 'hidden')) fm[k] = a;
    }
    fields[m] = fm;
  }
  return { allModules: bools(r.allModules, MODULE_PERMS), modules, setup: bools(r.setup, SETUP_PERMS), fields };
}
