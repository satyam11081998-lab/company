import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { listOutbox } from '@/lib/crm/server/marketing';
import OutboxAdmin from '@/components/crm/outbox-admin';

export const dynamic = 'force-dynamic';

export default async function OutboxPage({ searchParams }: { searchParams: { status?: string; page?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'approve_outbox') || canSetup(ctx, 'manage_marketing'))) notFound();
  const data = await listOutbox(ctx, searchParams.status ?? 'pending', Math.max(1, Number(searchParams.page) || 1));
  return <OutboxAdmin data={JSON.parse(JSON.stringify(data))} canApprove={canSetup(ctx, 'approve_outbox')} />;
}
