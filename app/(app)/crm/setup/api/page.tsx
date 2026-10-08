import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { listApiKeys } from '@/lib/crm/server/api-keys';
import { loadMembers } from '@/lib/crm/server/members';
import ApiAdmin from '@/components/crm/setup/api-admin';

export const dynamic = 'force-dynamic';

export default async function ApiSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'manage_setup') || canSetup(ctx, 'manage_data'))) notFound();
  const canKeys = canSetup(ctx, 'manage_setup');
  const [keys, members] = await Promise.all([canKeys ? listApiKeys(ctx) : Promise.resolve([]), loadMembers()]);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/$/, '');
  return (
    <ApiAdmin
      keys={JSON.parse(JSON.stringify(keys))}
      members={members.filter((m) => m.active && (ctx.superAdmin || m.id === ctx.userId || ctx.subordinateUserIds.includes(m.id))).map((m) => ({ id: m.id, name: m.name }))}
      me={ctx.userId}
      canKeys={canKeys}
      canBackup={canSetup(ctx, 'manage_data')}
      base={`${site}/api/crm/v1`}
    />
  );
}
