import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { can, canSetup } from '@/lib/crm/permissions';
import { loadMeta } from '@/lib/crm/server/meta';
import { loadServiceSettings, loadSla, serviceDashboard, stampMissingSla } from '@/lib/crm/server/service';
import { createServiceClient } from '@/lib/crm/server/svc';
import { listConfig } from '@/lib/crm/server/setup';
import { loadMembers } from '@/lib/crm/server/members';
import ServiceConsole from '@/components/crm/service-console';

export const dynamic = 'force-dynamic';

export default async function ServicePage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !can(ctx, 'cases', 'view')) notFound();
  const meta = await loadMeta();
  const svc = createServiceClient();
  await stampMissingSla(svc);
  const [dash, sla, settings, surveys, members] = await Promise.all([
    serviceDashboard(ctx, meta), loadSla(svc), loadServiceSettings(svc), listConfig('survey'), loadMembers(),
  ]);
  const names = Object.fromEntries(members.map((m) => [m.id, m.name]));
  return (
    <ServiceConsole
      dash={JSON.parse(JSON.stringify(dash))}
      sla={sla}
      settings={settings}
      surveys={surveys.filter((s) => (s.config as { kind?: string }).kind === 'csat' || (s.config as { kind?: string }).kind === 'ces').map((s) => ({ id: s.id, name: s.name }))}
      names={names}
      canConfigure={canSetup(ctx, 'manage_setup')}
      canKb={can(ctx, 'solutions', 'view')}
    />
  );
}
