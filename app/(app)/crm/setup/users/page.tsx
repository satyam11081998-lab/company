import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { listConfig } from '@/lib/crm/server/setup';
import { loadMembers } from '@/lib/crm/server/members';
import UsersAdmin from '@/components/crm/setup/users-admin';

export const dynamic = 'force-dynamic';

export default async function UsersSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_users')) notFound();
  const [roles, profiles, members] = await Promise.all([listConfig('role'), listConfig('profile'), loadMembers()]);
  return (
    <UsersAdmin
      me={ctx.userId}
      members={members.map((m) => ({ id: m.id, name: m.name, email: m.email, isAdmin: m.isAdmin, roleId: m.roleId, profileId: m.profileId, active: m.active }))}
      roles={roles.map((r) => ({ id: r.id, name: r.name, parentId: (r.config as { parentId?: string | null }).parentId ?? null, shareWithPeers: !!(r.config as { shareWithPeers?: boolean }).shareWithPeers }))}
      profiles={profiles.map((p) => ({ id: p.id, name: p.name, description: String((p.config as { description?: string }).description ?? '') }))}
    />
  );
}
