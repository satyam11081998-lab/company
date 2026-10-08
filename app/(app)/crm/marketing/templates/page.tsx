import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { ensureDefaultTemplates, listTemplates } from '@/lib/crm/server/marketing';
import TemplatesAdmin from '@/components/crm/marketing/templates-admin';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_marketing')) notFound();
  await ensureDefaultTemplates();
  const rows = await listTemplates();
  return <TemplatesAdmin templates={JSON.parse(JSON.stringify(rows))} />;
}
