import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { loadMeta } from '@/lib/crm/server/meta';
import { ensureDefaultSegments } from '@/lib/crm/server/segments';
import { listConfig } from '@/lib/crm/server/setup';
import { loadMembers } from '@/lib/crm/server/members';
import { queryAll } from '@/lib/crm/server/records';
import { toClientFields } from '@/lib/crm/client-types';
import SegmentsAdmin from '@/components/crm/marketing/segments-admin';

export const dynamic = 'force-dynamic';

export default async function SegmentsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_marketing')) notFound();
  const meta = await loadMeta();
  await ensureDefaultSegments();
  const segments = await listConfig('segment');
  const modules = ['contacts', 'leads', 'accounts', 'deals'].filter((m) => meta.module(m));
  const fields = Object.fromEntries(modules.map((m) => [m, toClientFields(ctx, m, meta.fields(m))]));
  const campaigns = (await queryAll(ctx, meta, 'campaigns', null, 500)).rows.map((c) => ({ id: c.id, name: c.name }));
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  return <SegmentsAdmin segments={JSON.parse(JSON.stringify(segments))} fields={fields} modules={modules.map((m) => ({ api: m, label: meta.module(m)!.label }))} campaigns={campaigns} members={members} />;
}
