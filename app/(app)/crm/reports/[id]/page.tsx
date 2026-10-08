import { notFound } from 'next/navigation';
import { CrmAccessError, CrmUserError, requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { listReports, runSavedReport } from '@/lib/crm/server/reports';
import { builderModules } from '@/lib/crm/server/ui-data';
import SavedReport from '@/components/crm/insights/saved-report';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'view_analytics') || canSetup(ctx, 'manage_reports'))) notFound();
  const meta = await loadMeta();
  const all = await listReports(ctx, 'report');
  const row = all.find((r) => r.id === params.id);
  if (!row) notFound();
  let result = null;
  let error: string | null = null;
  try {
    result = JSON.parse(JSON.stringify(await runSavedReport(ctx, meta, params.id)));
  } catch (e) {
    if (e instanceof CrmUserError || e instanceof CrmAccessError) error = e.message;
    else throw e;
  }
  const canEdit = row.owner_id === ctx.userId || canSetup(ctx, 'manage_reports');
  return (
    <SavedReport
      id={row.id} name={row.name} shared={row.shared} config={row.config as never} result={result} error={error}
      canEdit={canEdit} canShare={canSetup(ctx, 'manage_reports')} modules={canEdit ? builderModules(ctx, meta) : []}
    />
  );
}
