import { notFound } from 'next/navigation';
import { CrmAccessError, requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { customerAnalytics } from '@/lib/crm/server/analytics';
import AnalyticsView from '@/components/crm/insights/analytics-view';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'view_analytics')) notFound();
  try {
    const data = await customerAnalytics(ctx, await loadMeta());
    return <AnalyticsView data={JSON.parse(JSON.stringify(data))} canEdit={canSetup(ctx, 'manage_setup') || canSetup(ctx, 'manage_reports')} />;
  } catch (e) {
    if (e instanceof CrmAccessError) return <div className="rounded-lg border border-border bg-card p-6 text-sm">{e.message}</div>;
    throw e;
  }
}
