/**
 * CRM members: everyone who can own a record. Admins (users.is_admin) plus
 * active crm_users. Used for owner pickers, assignment and validation that an
 * owner id is a real CRM user (never an arbitrary MECE customer).
 */
import { cache } from 'react';
import { createServiceClient } from '@/lib/crm/server/svc';

export interface CrmMember {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  roleId: string | null;
  profileId: string | null;
  active: boolean;
}

export const loadMembers = cache(async (): Promise<CrmMember[]> => {
  const svc = createServiceClient();
  const [{ data: admins }, { data: crm }] = await Promise.all([
    svc.from('users').select('id, name, full_name, email').eq('is_admin', true).limit(200),
    svc.from('crm_users').select('user_id, role_id, profile_id, active').limit(2000),
  ]);
  const crmRows = (crm ?? []) as Array<{ user_id: string; role_id: string | null; profile_id: string | null; active: boolean }>;
  const ids = crmRows.map((r) => r.user_id).filter((id) => !((admins ?? []) as Array<{ id: string }>).some((a) => a.id === id));
  const { data: others } = ids.length
    ? await svc.from('users').select('id, name, full_name, email').in('id', ids.slice(0, 1000))
    : { data: [] as unknown[] };
  const people = new Map<string, { name: string | null; full_name: string | null; email: string | null }>();
  for (const u of [...((admins ?? []) as any[]), ...((others ?? []) as any[])]) people.set(u.id, u);
  const out: CrmMember[] = [];
  for (const a of (admins ?? []) as Array<{ id: string }>) {
    const p = people.get(a.id)!;
    const c = crmRows.find((r) => r.user_id === a.id);
    out.push({ id: a.id, name: p.full_name || p.name || p.email || 'Admin', email: p.email ?? '', isAdmin: true, roleId: c?.role_id ?? null, profileId: c?.profile_id ?? null, active: true });
  }
  for (const r of crmRows) {
    if (out.some((o) => o.id === r.user_id)) continue;
    const p = people.get(r.user_id);
    if (!p) continue;
    out.push({ id: r.user_id, name: p.full_name || p.name || p.email || 'Member', email: p.email ?? '', isAdmin: false, roleId: r.role_id, profileId: r.profile_id, active: r.active });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
});

export async function isActiveMember(id: string | null | undefined): Promise<boolean> {
  if (!id) return false;
  return (await loadMembers()).some((m) => m.id === id && m.active);
}

export async function memberName(id: string | null | undefined): Promise<string> {
  if (!id) return '';
  return (await loadMembers()).find((m) => m.id === id)?.name ?? '';
}
