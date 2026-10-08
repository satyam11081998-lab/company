import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import PipelinesAdmin from '@/components/crm/setup/pipelines-admin';

export const dynamic = 'force-dynamic';

export default async function PipelinesSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_setup')) notFound();
  const meta = await loadMeta();
  return <PipelinesAdmin pipelines={meta.pipelines.map((p) => ({ id: p.id, name: p.name, active: p.active, config: p.config }))} />;
}
