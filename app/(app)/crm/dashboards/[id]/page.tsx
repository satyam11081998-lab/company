import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { listReports, renderDashboard } from '@/lib/crm/server/reports';
import { builderModules } from '@/lib/crm/server/ui-data';
import DashboardView from '@/components/crm/insights/dashboard-view';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: { id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'view_analytics') || canSetup(ctx, 'manage_reports'))) notFound();
  const meta = await loadMeta();
  const [dashboards, reports] = await Promise.all([listReports(ctx, 'dashboard'), listReports(ctx, 'report')]);
  const row = dashboards.find((d) => d.id === params.id);
  if (!row) notFound();
  const dash = await renderDashboard(ctx, meta, params.id);
  const canEdit = row.owner_id === ctx.userId || canSetup(ctx, 'manage_reports');
  return (
    <DashboardView
      dash={JSON.parse(JSON.stringify(dash))}
      all={dashboards.map((d) => ({ id: d.id, name: d.name }))}
      edit={canEdit ? { modules: builderModules(ctx, meta), reports: reports.map((r) => ({ id: r.id, name: r.name })), config: row.config as never, shared: row.shared, canShare: canSetup(ctx, 'manage_reports') } : null}
    />
  );
}
