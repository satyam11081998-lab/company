import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { createServiceClient } from '@/lib/crm/server/svc';
import { RECORD_COLS, normalizeRecord } from '@/lib/crm/server/db';
import { accessTo } from '@/lib/crm/server/records';
import { loadMembers } from '@/lib/crm/server/members';
import { can, canSetup } from '@/lib/crm/permissions';
import RecycleBin from '@/components/crm/recycle-bin';

export const dynamic = 'force-dynamic';

export default async function RecycleBinPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const mods = meta.modules.filter((m) => can(ctx, m.api_name, 'delete')).map((m) => m.api_name);
  const { data } = mods.length
    ? await createServiceClient().from('crm_records').select(RECORD_COLS).in('module', mods).not('deleted_at', 'is', null).is('merged_into', null).order('deleted_at', { ascending: false }).limit(500)
    : { data: [] };
  const members = new Map((await loadMembers()).map((m) => [m.id, m.name]));
  const rows = ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord)
    .filter((r) => ctx.superAdmin || r.deleted_by === ctx.userId || accessTo(ctx, meta, r) === 'rwd')
    .map((r) => ({ id: r.id, module: meta.module(r.module)?.singular ?? r.module, moduleApi: r.module, name: r.name, deletedAt: r.deleted_at!, deletedBy: r.deleted_by ? members.get(r.deleted_by) ?? '' : '' }));
  return <RecycleBin rows={rows} canPurge={canSetup(ctx, 'manage_data')} />;
}
