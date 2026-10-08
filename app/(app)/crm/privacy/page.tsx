import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { complianceOverview, listBreaches, listRequests } from '@/lib/crm/server/privacy';
import { loadMembers } from '@/lib/crm/server/members';
import PrivacyConsole from '@/components/crm/insights/privacy-console';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage({ searchParams }: { searchParams: { tab?: string; record?: string; kind?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_privacy')) notFound();
  const [overview, requests, breaches, members] = await Promise.all([complianceOverview(ctx), listRequests(ctx), listBreaches(ctx), loadMembers()]);
  return (
    <PrivacyConsole
      overview={overview}
      requests={JSON.parse(JSON.stringify(requests))}
      breaches={JSON.parse(JSON.stringify(breaches))}
      names={Object.fromEntries(members.map((m) => [m.id, m.name]))}
      initialTab={['overview', 'requests', 'breaches', 'guide'].includes(searchParams.tab ?? '') ? searchParams.tab! : searchParams.record ? 'requests' : 'overview'}
      prefill={searchParams.record ? { recordId: searchParams.record, kind: searchParams.kind ?? 'access' } : null}
    />
  );
}
