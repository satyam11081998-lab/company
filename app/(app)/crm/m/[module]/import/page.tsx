import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { loadMembers } from '@/lib/crm/server/members';
import { can } from '@/lib/crm/permissions';
import { toClientFields, toClientModule } from '@/lib/crm/client-types';
import { createServiceClient } from '@/lib/crm/server/svc';
import ImportWizard from '@/components/crm/import-wizard';

export const dynamic = 'force-dynamic';

export default async function ImportPage({ params }: { params: { module: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const mod = meta.module(params.module);
  if (!mod || mod.active === false || !can(ctx, mod.api_name, 'view')) notFound();
  if (!can(ctx, mod.api_name, 'import')) return <p className="rounded-lg border border-border bg-card p-6 text-sm">You don’t have permission to import {mod.label.toLowerCase()}.</p>;
  const fields = toClientFields(ctx, mod.api_name, meta.fields(mod.api_name)).filter((f) => !f.ro && f.type !== 'line_items' && f.type !== 'related');
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  let q = createServiceClient().from('crm_imports').select('id, filename, total, created, updated, skipped, failed, created_at, undone_at, created_by').eq('module', mod.api_name).order('created_at', { ascending: false }).limit(10);
  if (!ctx.superAdmin) q = q.eq('created_by', ctx.userId);
  const { data: past } = await q;
  return <ImportWizard module={toClientModule(mod)} fields={fields} members={members} past={(past ?? []) as never} />;
}
