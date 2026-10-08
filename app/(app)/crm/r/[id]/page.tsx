import { notFound, redirect } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { accessTo, loadRecordRaw } from '@/lib/crm/server/records';
import { createServiceClient } from '@/lib/crm/server/svc';
import { can } from '@/lib/crm/permissions';

export const dynamic = 'force-dynamic';

/** /crm/r/<id> → the record's page, for links that only know the id. Same checks as the record page. */
export default async function RecordById({ params }: { params: { id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const rec = await loadRecordRaw(createServiceClient(), params.id);
  if (!rec || !can(ctx, rec.module, 'view') || !accessTo(ctx, await loadMeta(), rec)) notFound();
  redirect(`/crm/m/${rec.module}/${rec.id}`);
}
