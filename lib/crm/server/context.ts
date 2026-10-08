/**
 * CRM request context: who is asking, and what may they do.
 *
 * `getCrmContext()` returns null for anyone who is not a CRM user. That means
 * not signed in, a guest, or a non-admin who isn't an active crm_users member.
 * `requireCrm()` turns that into a thrown CrmAccessError, so a server action
 * can't fall through to a service-role query by mistake.
 *
 * Server-only. Never import from a client component.
 */
import { cache } from 'react';
import { getCachedAuthUser } from '@/lib/supabase/auth-cached';
import { createServiceClient } from '@/lib/crm/server/svc';
import { EMPTY_PROFILE, ancestors, can, canSetup, cleanProfile, descendants } from '@/lib/crm/permissions';
import type {
  CrmContext, ModulePerm, ProfileConfig, RoleConfig, SetupPerm, SharingRuleConfig, TerritoryConfig,
} from '@/lib/crm/types';
import { MODULE_PERMS } from '@/lib/crm/types';

export class CrmAccessError extends Error {
  constructor(message = 'Not found') {
    super(message);
    this.name = 'CrmAccessError';
  }
}

/** True when the error is "table does not exist" (migration not run yet). */
export function isMissingTable(err: { code?: string; message?: string } | null | undefined): boolean {
  if (!err) return false;
  return err.code === '42P01' || err.code === 'PGRST205' || /does not exist|schema cache/i.test(err.message ?? '');
}

export const getCrmContext = cache(async (): Promise<CrmContext | null> => {
  const user = await getCachedAuthUser();
  if (!user || (user as { is_anonymous?: boolean }).is_anonymous) return null;
  return buildCrmContext(user.id);
});

/**
 * The CRM context of one user id (session users above; REST API keys act as
 * the user who owns the key). Returns null unless the user is a CRM user.
 */
export async function buildCrmContext(userId: string): Promise<CrmContext | null> {
  const user = { id: userId };
  const svc = createServiceClient();
  const { data: urow } = await svc.from('users').select('id, is_admin, is_guest').eq('id', user.id).maybeSingle();
  const u = urow as { id: string; is_admin: boolean | null; is_guest: boolean | null } | null;
  if (!u || u.is_guest) return null;

  if (u.is_admin) {
    return {
      userId: user.id, superAdmin: true, profileId: null, roleId: null,
      profile: { allModules: Object.fromEntries(MODULE_PERMS.map((p) => [p, true])), modules: {}, setup: {}, fields: {} },
      subordinateRoleIds: [], subordinateUserIds: [], peerUserIds: [], sharingRules: [], territories: [], userRoles: {},
    };
  }

  const { data: cu, error } = await svc.from('crm_users').select('user_id, profile_id, role_id, active').eq('user_id', user.id).maybeSingle();
  if (error || !cu || !(cu as { active: boolean }).active) return null;
  const member = cu as { user_id: string; profile_id: string | null; role_id: string | null };

  const [{ data: configs }, { data: members }] = await Promise.all([
    svc.from('crm_config').select('id, kind, module, active, config').in('kind', ['profile', 'role', 'sharing_rule', 'territory']).limit(2000),
    svc.from('crm_users').select('user_id, role_id, active').limit(5000),
  ]);
  const cfg = (configs ?? []) as Array<{ id: string; kind: string; module: string | null; active: boolean; config: Record<string, unknown> }>;
  const memberRows = (members ?? []) as Array<{ user_id: string; role_id: string | null; active: boolean }>;

  const profileRow = cfg.find((c) => c.kind === 'profile' && c.id === member.profile_id && c.active);
  const stored = (profileRow?.config ?? {}) as unknown as Partial<ProfileConfig>;
  // cleanProfile keeps only the modules it is told about: every module named in the stored config.
  const named = [...Object.keys(stored.modules ?? {}), ...Object.keys(stored.fields ?? {})].filter((m) => /^[a-z][a-z0-9_]{1,40}$/.test(m));
  const profile: ProfileConfig = profileRow ? cleanProfile(stored, named) : EMPTY_PROFILE;

  const roleParents: Record<string, string | null> = {};
  const roleCfg: Record<string, RoleConfig> = {};
  for (const c of cfg.filter((x) => x.kind === 'role')) {
    const rc = c.config as unknown as RoleConfig;
    roleParents[c.id] = typeof rc.parentId === 'string' ? rc.parentId : null;
    roleCfg[c.id] = rc;
  }
  const roleId = member.role_id && roleParents[member.role_id] !== undefined ? member.role_id : null;
  const subordinateRoleIds = roleId ? descendants(roleParents, roleId) : [];
  const userRoles: Record<string, string | null> = {};
  for (const m of memberRows) userRoles[m.user_id] = m.role_id;
  const activeMembers = memberRows.filter((m) => m.active);
  const subordinateUserIds = activeMembers.filter((m) => m.role_id && subordinateRoleIds.includes(m.role_id)).map((m) => m.user_id);
  const peerUserIds = roleId && roleCfg[roleId]?.shareWithPeers
    ? activeMembers.filter((m) => m.role_id === roleId && m.user_id !== user.id).map((m) => m.user_id)
    : [];

  // A rule shared "to role R and subordinates" reaches this user if R is
  // their role or one of their role's ancestors.
  const myRoleChain = roleId ? [roleId, ...ancestors(roleParents, roleId)] : [];
  const sharingRules: CrmContext['sharingRules'] = [];
  for (const c of cfg.filter((x) => x.kind === 'sharing_rule' && x.active && x.module)) {
    const r = c.config as unknown as SharingRuleConfig;
    if (!Array.isArray(r.toRoleIds) || !roleId) continue;
    const direct = r.toRoleIds.includes(roleId);
    const viaParent = r.toSubordinates && r.toRoleIds.some((t) => myRoleChain.includes(t));
    if (direct || viaParent) sharingRules.push({ ...r, module: c.module as string });
  }
  // Territories: the ones the user belongs to (member or manager) and every
  // territory below them (Zoho: a parent territory sees its children's records).
  const allTerr = cfg
    .filter((x) => x.kind === 'territory' && x.active)
    .map((x) => ({ id: x.id, ...(x.config as unknown as TerritoryConfig), module: x.module ?? undefined }));
  const terrParents: Record<string, string | null> = Object.fromEntries(allTerr.map((t) => [t.id, typeof t.parentId === 'string' ? t.parentId : null]));
  const mine = allTerr.filter((t) => (Array.isArray(t.memberIds) && t.memberIds.includes(user.id)) || t.managerId === user.id).map((t) => t.id);
  // Reaching a child territory through a parent never grants more than the parent's own access level.
  const RANK = { read: 1, rw: 2, rwd: 3 } as const;
  const lower = (a: TerritoryConfig['access'], b: TerritoryConfig['access']) => ((RANK[a] ?? 1) <= (RANK[b] ?? 1) ? a : b);
  const territories: CrmContext['territories'] = [];
  for (const id of mine) {
    const own = allTerr.find((t) => t.id === id)!;
    territories.push(own);
    for (const d of descendants(terrParents, id)) {
      const child = allTerr.find((t) => t.id === d);
      if (child) territories.push({ ...child, access: lower(own.access, child.access) });
    }
  }

  return {
    userId: user.id, superAdmin: false, profileId: member.profile_id, roleId,
    profile, subordinateRoleIds, subordinateUserIds, peerUserIds, sharingRules, territories, userRoles,
  };
}

export async function requireCrm(): Promise<CrmContext> {
  const ctx = await getCrmContext();
  if (!ctx) throw new CrmAccessError();
  return ctx;
}

export async function requireModulePerm(module: string, perm: ModulePerm): Promise<CrmContext> {
  const ctx = await requireCrm();
  if (!can(ctx, module, perm)) throw new CrmAccessError(`You don't have permission to ${perm} ${module.replace(/_/g, ' ')}.`);
  return ctx;
}

export async function requireSetup(perm: SetupPerm): Promise<CrmContext> {
  const ctx = await requireCrm();
  if (!canSetup(ctx, perm)) throw new CrmAccessError('You don’t have permission for this setting.');
  return ctx;
}

/** Wrap a server action body: never leak stack traces or DB messages to the browser. */
export async function safeAction<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    const err = e as Error & { expose?: boolean };
    if (err instanceof CrmAccessError) return { ok: false, error: err.message };
    if (err?.name === 'CrmUserError' || err?.expose) return { ok: false, error: err.message };
    console.error('[crm] action failed:', err);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

/** An error whose message is safe and useful to show the CRM user. */
export class CrmUserError extends Error {
  expose = true;
  constructor(message: string) {
    super(message);
    this.name = 'CrmUserError';
  }
}
