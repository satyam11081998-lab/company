import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { listConfig } from '@/lib/crm/server/setup';
import { loadMembers } from '@/lib/crm/server/members';
import { builderModules } from '@/lib/crm/server/ui-data';
import TerritoriesAdmin from '@/components/crm/setup/territories-admin';

export const dynamic = 'force-dynamic';

export default async function TerritoriesSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_users')) notFound();
  const meta = await loadMeta();
  const [rows, members] = await Promise.all([listConfig('territory'), loadMembers()]);
  return (
    <TerritoriesAdmin
      territories={rows.map((r) => ({ id: r.id, name: r.name, module: r.module ?? '', active: r.active, config: r.config as never }))}
      modules={builderModules(ctx, meta).filter((m) => ['leads', 'contacts', 'accounts', 'deals', 'cases', 'quotes', 'sales_orders', 'invoices'].includes(m.api) || meta.module(m.api)?.kind === 'custom')}
      members={members.filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }))}
    />
  );
}
