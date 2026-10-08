'use server';

/** Setup server actions. Each lib function re-checks the setup permission it needs. */
import { requireCrm, CrmAccessError, CrmUserError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import {
  addCrmUser, createCustomModule, deleteConfig, saveField, saveModuleSettings, savePipeline, saveProfile, saveRole, saveSharingRule, updateCrmUser,
} from '@/lib/crm/server/setup';
import { isUuid } from '@/lib/crm/fields';
import type { SharingLevel } from '@/lib/crm/types';

export type SetupResult<T = null> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>): Promise<SetupResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof CrmAccessError || e instanceof CrmUserError) return { ok: false, error: e.message };
    console.error('[crm setup] failed:', e);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');

export async function setupCreateModule(input: { label: string; singular: string; sharing?: SharingLevel }) {
  return run(async () => createCustomModule(await requireCrm(), await loadMeta(), { label: str(input?.label, 60), singular: str(input?.singular, 60), sharing: input?.sharing }));
}

export async function setupModuleSettings(module: string, input: { label?: string; singular?: string; sharing?: SharingLevel; active?: boolean }) {
  return run(async () => saveModuleSettings(await requireCrm(), await loadMeta(), str(module, 60), {
    label: input?.label ? str(input.label, 60) : undefined, singular: input?.singular ? str(input.singular, 60) : undefined,
    sharing: input?.sharing, active: typeof input?.active === 'boolean' ? input.active : undefined,
  }));
}

export async function setupSaveField(module: string, input: Parameters<typeof saveField>[3]) {
  return run(async () => saveField(await requireCrm(), await loadMeta(), str(module, 60), {
    id: isUuid(input?.id) ? input.id : null,
    label: str(input?.label, 80), type: input?.type, required: !!input?.required, is_unique: !!input?.is_unique,
    section: str(input?.section, 60), position: Number(input?.position ?? 500), active: input?.active !== false,
    picklist: Array.isArray(input?.picklist) ? input.picklist.map((x) => str(x, 100)) : undefined,
    lookupModule: input?.lookupModule ? str(input.lookupModule, 60) : undefined, expr: input?.expr ? str(input.expr, 1000) : undefined,
    returns: input?.returns ? str(input.returns, 20) : undefined, rollup: input?.rollup, help: input?.help ? str(input.help, 300) : undefined,
  }));
}

export async function setupSavePipeline(input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  return run(async () => savePipeline(await requireCrm(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 80), active: input?.active !== false, config: input?.config }));
}

export async function setupDeleteConfig(id: string, kind: 'pipeline' | 'role' | 'profile' | 'sharing_rule' | 'territory') {
  return run(async () => {
    if (!['pipeline', 'role', 'profile', 'sharing_rule', 'territory'].includes(kind)) throw new CrmUserError('Unknown setting.');
    return deleteConfig(await requireCrm(), str(id, 40), kind);
  });
}

export async function setupAddUser(email: string, roleId: string, profileId: string) {
  return run(async () => addCrmUser(await requireCrm(), str(email, 254), str(roleId, 40), str(profileId, 40)));
}

export async function setupUpdateUser(userId: string, patch: { roleId?: string; profileId?: string; active?: boolean }) {
  return run(async () => updateCrmUser(await requireCrm(), str(userId, 40), {
    roleId: patch?.roleId ? str(patch.roleId, 40) : undefined, profileId: patch?.profileId ? str(patch.profileId, 40) : undefined,
    active: typeof patch?.active === 'boolean' ? patch.active : undefined,
  }));
}

export async function setupSaveRole(input: { id?: string | null; name: string; parentId: string | null; shareWithPeers?: boolean }) {
  return run(async () => saveRole(await requireCrm(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 80), parentId: isUuid(input?.parentId) ? input.parentId : null, shareWithPeers: !!input?.shareWithPeers }));
}

export async function setupSaveProfile(input: { id?: string | null; name: string; config: unknown; description?: string }) {
  return run(async () => saveProfile(await requireCrm(), await loadMeta(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 80), config: input?.config, description: str(input?.description, 300) }));
}

export async function setupSaveSharingRule(input: Parameters<typeof saveSharingRule>[2]) {
  return run(async () => saveSharingRule(await requireCrm(), await loadMeta(), {
    id: isUuid(input?.id) ? input.id : null, module: str(input?.module, 60), name: str(input?.name, 80), criteria: input?.criteria,
    ownerRoleIds: Array.isArray(input?.ownerRoleIds) ? input.ownerRoleIds.filter(isUuid) : [], toRoleIds: Array.isArray(input?.toRoleIds) ? input.toRoleIds.filter(isUuid) : [],
    toSubordinates: !!input?.toSubordinates, access: str(input?.access, 4), active: input?.active !== false,
  }));
}

export async function setupSaveTerritory(input: { id?: string | null; name: string; module: string; parentId?: string | null; criteria?: unknown; memberIds?: string[]; managerId?: string | null; access?: string; active?: boolean }) {
  return run(async () => {
    const { saveTerritory } = await import('@/lib/crm/server/territories');
    return saveTerritory(await requireCrm(), await loadMeta(), {
      id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 80), module: str(input?.module, 60),
      parentId: isUuid(input?.parentId) ? input.parentId : null, criteria: input?.criteria,
      memberIds: Array.isArray(input?.memberIds) ? input.memberIds.filter(isUuid).slice(0, 200) : [],
      managerId: isUuid(input?.managerId) ? input.managerId : null, access: str(input?.access, 4), active: input?.active !== false,
    });
  });
}
