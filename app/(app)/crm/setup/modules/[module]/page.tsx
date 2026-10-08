import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { canSetup } from '@/lib/crm/permissions';
import FieldsAdmin from '@/components/crm/setup/fields-admin';

export const dynamic = 'force-dynamic';

export default async function ModuleFieldsSetup({ params }: { params: { module: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_setup')) notFound();
  const meta = await loadMeta();
  const mod = meta.module(params.module);
  if (!mod) notFound();
  const fields = meta.fields(mod.api_name).map((f) => ({
    id: f.id ?? '', api: f.api_name, label: f.label, type: f.type, required: !!f.required, unique: !!f.is_unique, section: f.section ?? 'Details',
    position: f.position ?? 0, active: f.active !== false, system: !!f.system, synced: !!f.synced, custom: f.api_name.startsWith('cf_') || mod.kind === 'custom',
    picklist: f.options?.picklist?.map((p) => p.value) ?? [], expr: f.options?.expr ?? '', help: f.options?.help ?? '',
  }));
  const lookupTargets = meta.modules.map((m) => ({ api: m.api_name, label: m.label }));
  const rollupSources = meta.modules.flatMap((m) => meta.fields(m.api_name).filter((f) => f.type === 'lookup' && f.options?.module === mod.api_name).map((f) => ({
    module: m.api_name, moduleLabel: m.label, via: f.api_name, viaLabel: f.label,
    numbers: meta.fields(m.api_name).filter((x) => ['integer', 'decimal', 'currency', 'percent'].includes(x.type)).map((x) => ({ api: x.api_name, label: x.label })),
  })));
  return <FieldsAdmin module={{ api: mod.api_name, label: mod.label, singular: mod.singular, kind: mod.kind, sharing: mod.settings.sharing ?? 'public_rw' }} fields={fields} lookupTargets={lookupTargets} rollupSources={rollupSources} />;
}
