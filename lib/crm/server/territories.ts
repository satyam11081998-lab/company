/**
 * Territory management (Zoho: Territories). A territory gives its members
 * (and its manager) access to the records of one module that match its
 * criteria; a parent territory sees everything its child territories see.
 * Requires the `manage_users` setup permission.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { validateCriteria } from '@/lib/crm/criteria';
import { isUuid } from '@/lib/crm/fields';
import { canSetup } from '@/lib/crm/permissions';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { loadMembers } from './members';
import type { Meta } from './meta';
import { getModuleOrThrow } from './records';

export async function saveTerritory(ctx: CrmContext, meta: Meta, input: { id?: string | null; name: string; module: string; parentId?: string | null; criteria?: unknown; memberIds?: string[]; managerId?: string | null; access?: string; active?: boolean }) {
  if (!canSetup(ctx, 'manage_users')) throw new CrmAccessError('You don’t have permission for this setting.');
  getModuleOrThrow(meta, input.module);
  const name = String(input.name ?? '').trim().slice(0, 80);
  if (!name) throw new CrmUserError('Name the territory.');
  const access = ['read', 'rw', 'rwd'].includes(String(input.access)) ? input.access : 'read';
  if (!input.criteria) throw new CrmUserError('Add at least one condition — which records belong to this territory?');
  const criteria = validateCriteria(input.criteria, meta.fields(input.module));
  if (!criteria || !criteria.conditions.length) throw new CrmUserError('Add at least one condition — which records belong to this territory?');
  const members = await loadMembers();
  const active = new Set(members.filter((m) => m.active).map((m) => m.id));
  const memberIds = [...new Set((input.memberIds ?? []).filter((id) => active.has(id)))].slice(0, 200);
  const managerId = input.managerId && active.has(input.managerId) ? input.managerId : null;
  if (!memberIds.length && !managerId) throw new CrmUserError('Add at least one member or a manager.');
  const svc = createServiceClient();
  const { data: all } = await svc.from('crm_config').select('id, config').eq('kind', 'territory');
  const parents = new Map(((all ?? []) as Array<{ id: string; config: { parentId?: string | null } }>).map((t) => [t.id, t.config?.parentId ?? null]));
  let parentId = input.parentId && parents.has(input.parentId) ? input.parentId : null;
  if (input.id && parentId) {
    // no cycles: the new parent may not be this territory or one of its descendants
    let p: string | null = parentId;
    for (let i = 0; p && i < 50; i++) { if (p === input.id) throw new CrmUserError('A territory can’t sit under itself or one of its children.'); p = parents.get(p) ?? null; }
  }
  if (parentId === input.id) parentId = null;
  const config = { parentId, criteria, memberIds, managerId, access };
  const row = { kind: 'territory', module: input.module, name, active: input.active !== false, config, updated_by: ctx.userId, updated_at: new Date().toISOString() };
  let id = input.id ?? null;
  if (id) {
    if (!isUuid(id)) throw new CrmAccessError('Territory not found.');
    const { data, error } = await svc.from('crm_config').update(row).eq('id', id).eq('kind', 'territory').select('id');
    if (error) throw error;
    if (!data?.length) throw new CrmAccessError('Territory not found.');
  } else {
    const { data, error } = await svc.from('crm_config').insert({ ...row, created_by: ctx.userId }).select('id').single();
    if (error) throw error.code === '23505' ? new CrmUserError('A territory with this name exists.') : error;
    id = (data as { id: string }).id;
  }
  await audit(svc, { actor_id: ctx.userId, action: 'territory_save', module: input.module, meta: { id, name, members: memberIds.length, access } });
  return id;
}
