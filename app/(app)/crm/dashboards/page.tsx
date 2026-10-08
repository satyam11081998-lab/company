import { notFound, redirect } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { ensureDefaultReports, listReports } from '@/lib/crm/server/reports';
import { builderModules } from '@/lib/crm/server/ui-data';
import DashboardEditor from '@/components/crm/insights/dashboard-editor';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardsPage({ searchParams }: { searchParams: { new?: string; list?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'view_analytics') || canSetup(ctx, 'manage_reports'))) notFound();
  const meta = await loadMeta();
  await ensureDefaultReports(meta);
  const [dashboards, reports] = await Promise.all([listReports(ctx, 'dashboard'), listReports(ctx, 'report')]);
  const creating = searchParams.new === '1';
  if (!creating && !searchParams.list && dashboards.length === 1) redirect(`/crm/dashboards/${dashboards[0].id}`);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Dashboards</h1>
          <p className="text-sm text-muted-foreground">KPIs, targets and charts from saved reports.</p>
        </div>
        {!creating && <Link href="/crm/dashboards?new=1" className="inline-flex h-8 items-center rounded-md bg-navy px-3 text-sm text-navy-foreground">New dashboard</Link>}
      </div>
      {creating ? (
        <DashboardEditor modules={builderModules(ctx, meta)} reports={reports.map((r) => ({ id: r.id, name: r.name }))} canShare={canSetup(ctx, 'manage_reports')} />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboards.map((d) => (
            <Link key={d.id} href={`/crm/dashboards/${d.id}`} className="rounded-lg border border-border bg-card p-4 hover:border-navy/40">
              <p className="font-medium">{d.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{(d.config.description as string) || `${((d.config.components as unknown[]) ?? []).length} component(s)`}</p>
            </Link>
          ))}
          {!dashboards.length && <p className="text-sm text-muted-foreground">No dashboards yet.</p>}
        </div>
      )}
    </div>
  );
}
