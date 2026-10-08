import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import { listConfig } from '@/lib/crm/server/setup';
import { toClientFields } from '@/lib/crm/client-types';
import SharingAdmin from '@/components/crm/setup/sharing-admin';

export const dynamic = 'force-dynamic';

export default async function SharingSetup() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_users')) notFound();
  const meta = await loadMeta();
  const [rules, roles] = await Promise.all([listConfig('sharing_rule'), listConfig('role')]);
  return (
    <SharingAdmin
      modules={meta.modules.map((m) => ({ api: m.api_name, label: m.label, sharing: m.settings.sharing ?? 'public_rw', fields: toClientFields(ctx, m.api_name, meta.fields(m.api_name)) }))}
      rules={rules.map((r) => ({ id: r.id, module: r.module ?? '', name: r.name, active: r.active, config: r.config as never }))}
      roles={roles.map((r) => ({ id: r.id, name: r.name }))}
    />
  );
}
