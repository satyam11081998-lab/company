import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { ensureDefaultReports, listReports } from '@/lib/crm/server/reports';
import { builderModules } from '@/lib/crm/server/ui-data';
import { loadMembers } from '@/lib/crm/server/members';
import ReportsHome from '@/components/crm/insights/reports-home';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'view_analytics') || canSetup(ctx, 'manage_reports'))) notFound();
  const meta = await loadMeta();
  await ensureDefaultReports(meta);
  const [reports, members] = await Promise.all([listReports(ctx, 'report'), loadMembers()]);
  const names = Object.fromEntries(members.map((m) => [m.id, m.name]));
  return (
    <ReportsHome
      reports={reports.map((r) => ({ id: r.id, name: r.name, module: meta.module(r.module ?? '')?.label ?? r.module ?? '', type: String(r.config.type ?? 'tabular'), shared: r.shared, owner: r.owner_id ? names[r.owner_id] ?? 'Former user' : 'MECE', updated: r.updated_at, description: (r.config.description as string) ?? '' }))}
      modules={builderModules(ctx, meta)}
      canShare={canSetup(ctx, 'manage_reports')}
    />
  );
}
