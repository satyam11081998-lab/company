import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { loadMembers } from '@/lib/crm/server/members';
import { can } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import { toClientFields, toClientModule } from '@/lib/crm/client-types';
import { resolveRefs } from '@/lib/crm/server/names';
import RecordForm from '@/components/crm/record-form';
import { layoutRulesFor } from '@/lib/crm/server/automation';

export const dynamic = 'force-dynamic';

export default async function NewRecordPage({ params, searchParams }: { params: { module: string }; searchParams: Record<string, string | undefined> }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const mod = meta.module(params.module);
  if (!mod || mod.active === false || !can(ctx, mod.api_name, 'view')) notFound();
  if (!can(ctx, mod.api_name, 'create')) {
    return <p className="rounded-lg border border-border bg-card p-6 text-sm">You don’t have permission to create {mod.label.toLowerCase()}.</p>;
  }
  const fields = toClientFields(ctx, mod.api_name, meta.fields(mod.api_name));
  // Prefill from ?field=value (e.g. "New deal" from an account: ?account_id=…)
  const initial: Record<string, unknown> = {};
  for (const f of fields) {
    const v = searchParams[f.api];
    if (typeof v !== 'string' || f.ro) continue;
    if (f.type === 'lookup') { if (isUuid(v)) initial[f.api] = v; }
    else if (f.type === 'related') {
      const mod2 = searchParams.related_module;
      if (isUuid(v) && mod2 && f.related?.includes(mod2)) initial[f.api] = { module: mod2, id: v };
    } else initial[f.api] = v.slice(0, 255);
  }
  if (mod.api_name === 'deals' && !initial.pipeline) initial.pipeline = meta.defaultPipeline()?.name;
  const fakeRec = { id: 'new', module: mod.api_name, data: initial } as never;
  const refs = await resolveRefs(ctx, meta, [fakeRec]);
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New {mod.singular.toLowerCase()}</h1>
        <Link href={`/crm/m/${mod.api_name}`} className="text-sm text-muted-foreground hover:underline">Back to {mod.label.toLowerCase()}</Link>
      </div>
      <RecordForm module={toClientModule(mod)} fields={fields} initial={initial} refs={refs} members={members} layoutRules={await layoutRulesFor(mod.api_name)}
        pipelines={meta.pipelines.filter((p) => p.active).map((p) => ({ name: p.name, stages: p.config.stages }))} />
    </div>
  );
}
