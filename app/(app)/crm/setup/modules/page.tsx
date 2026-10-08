import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import ModulesAdmin from '@/components/crm/setup/modules-admin';

export const dynamic = 'force-dynamic';

export default async function ModulesSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_setup')) notFound();
  const meta = await loadMeta();
  return (
    <ModulesAdmin modules={meta.modules.map((m) => ({
      api: m.api_name, label: m.label, singular: m.singular, kind: m.kind, sharing: m.settings.sharing ?? 'public_rw', active: m.active !== false,
      fields: meta.fields(m.api_name).length, custom: meta.fields(m.api_name).filter((f) => f.api_name.startsWith('cf_')).length,
    }))} />
  );
}
