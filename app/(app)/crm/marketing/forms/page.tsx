import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { loadMeta } from '@/lib/crm/server/meta';
import { listConfig } from '@/lib/crm/server/setup';
import { formStats } from '@/lib/crm/server/forms';
import { listTemplates } from '@/lib/crm/server/marketing';
import { loadMembers } from '@/lib/crm/server/members';
import FormsAdmin from '@/components/crm/marketing/forms-admin';

export const dynamic = 'force-dynamic';

const FORM_TYPES = new Set(['text', 'textarea', 'email', 'phone', 'url', 'integer', 'decimal', 'currency', 'percent', 'date', 'boolean', 'picklist', 'multipicklist']);

export default async function FormsPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_marketing')) notFound();
  const meta = await loadMeta();
  const forms = await listConfig('webform');
  const stats = Object.fromEntries(await Promise.all(forms.map(async (f) => [f.id, await formStats(f.id)] as const)));
  const modules = meta.modules.filter((m) => m.active !== false && !['tasks', 'calls', 'meetings', 'products', 'price_books', 'quotes', 'sales_orders', 'invoices', 'vendors', 'purchase_orders', 'solutions', 'campaigns', 'deals'].includes(m.api_name));
  const fields = Object.fromEntries(modules.map((m) => [m.api_name, meta.fields(m.api_name)
    .filter((f) => f.active !== false && !f.system && !f.readonly && FORM_TYPES.has(f.type))
    .map((f) => ({ api: f.api_name, label: f.label, type: f.type, required: !!f.required }))]));
  const templates = (await listTemplates()).filter((t) => t.active).map((t) => ({ id: t.id, name: t.name }));
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mece.in').replace(/\/$/, '');
  return <FormsAdmin forms={JSON.parse(JSON.stringify(forms))} stats={stats} modules={modules.map((m) => ({ api: m.api_name, label: m.label }))} fields={fields} templates={templates} members={members} site={site} />;
}
