import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { can, canSetup } from '@/lib/crm/permissions';
import { forecast } from '@/lib/crm/server/reports';
import { loadMembers } from '@/lib/crm/server/members';
import ForecastView from '@/components/crm/insights/forecast-view';

export const dynamic = 'force-dynamic';

export default async function ForecastsPage({ searchParams }: { searchParams: { period?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !can(ctx, 'deals', 'view') || !(canSetup(ctx, 'view_analytics') || canSetup(ctx, 'manage_reports'))) notFound();
  const meta = await loadMeta();
  const ist = new Date(Date.now() + 330 * 60_000);
  const thisMonth = ist.toISOString().slice(0, 7);
  const period = /^\d{4}-(\d{2}|Q[1-4])$/.test(searchParams.period ?? '') ? searchParams.period! : thisMonth;
  const data = await forecast(ctx, meta, period);
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  const y = ist.getUTCFullYear();
  const periods = [
    ...Array.from({ length: 18 }, (_, i) => { const d = new Date(Date.UTC(y, ist.getUTCMonth() - 6 + i, 1)); return d.toISOString().slice(0, 7); }),
    ...[y - 1, y, y + 1].flatMap((yy) => [1, 2, 3, 4].map((q) => `${yy}-Q${q}`)),
  ];
  return <ForecastView data={JSON.parse(JSON.stringify(data))} periods={periods} members={members} />;
}
