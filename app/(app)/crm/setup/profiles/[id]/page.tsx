import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup, cleanProfile } from '@/lib/crm/permissions';
import { listConfig } from '@/lib/crm/server/setup';
import { isUuid } from '@/lib/crm/fields';
import ProfileEditor from '@/components/crm/setup/profile-editor';
import { EMPTY_PROFILE } from '@/lib/crm/permissions';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_users')) notFound();
  const meta = await loadMeta();
  const profiles = await listConfig('profile');
  const isNew = params.id === 'new';
  const p = isNew ? null : profiles.find((x) => x.id === params.id && isUuid(params.id));
  if (!isNew && !p) notFound();
  const modules = meta.modules.map((m) => m.api_name);
  const config = p ? cleanProfile(p.config, modules) : EMPTY_PROFILE;
  return (
    <ProfileEditor
      id={p?.id ?? null}
      name={p?.name ?? ''}
      description={String((p?.config as { description?: string } | undefined)?.description ?? '')}
      config={config}
      modules={meta.modules.map((m) => ({
        api: m.api_name, label: m.label,
        fields: meta.fields(m.api_name).filter((f) => f.active !== false).map((f) => ({ api: f.api_name, label: f.label, required: !!f.required })),
      }))}
    />
  );
}
