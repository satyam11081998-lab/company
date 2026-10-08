import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { aiOverview, anomalies } from '@/lib/crm/server/ai';
import { createServiceClient } from '@/lib/crm/server/svc';
import { builderModules } from '@/lib/crm/server/ui-data';
import { loadMembers } from '@/lib/crm/server/members';
import AiConsole from '@/components/crm/insights/ai-console';

export const dynamic = 'force-dynamic';

export default async function AiPage({ searchParams }: { searchParams: { tab?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'manage_ai') || canSetup(ctx, 'view_analytics'))) notFound();
  const meta = await loadMeta();
  const [overview, anom, members] = await Promise.all([
    aiOverview(ctx, meta).catch((e: Error) => ({ error: e.message })),
    canSetup(ctx, 'view_analytics') ? anomalies(createServiceClient()) : Promise.resolve({ anomalies: [], series: [] }),
    loadMembers(),
  ]);
  const names = Object.fromEntries(members.map((m) => [m.id, m.name]));
  return (
    <AiConsole
      overview={JSON.parse(JSON.stringify(overview))}
      anomalies={JSON.parse(JSON.stringify(anom))}
      modules={canSetup(ctx, 'manage_ai') ? builderModules(ctx, meta) : []}
      names={names}
      initialTab={['ask', 'models', 'predictions', 'anomalies', 'feedback'].includes(searchParams.tab ?? '') ? searchParams.tab! : 'ask'}
    />
  );
}
