import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { loadMeta } from '@/lib/crm/server/meta';
import { listConfig } from '@/lib/crm/server/setup';
import { listTemplates } from '@/lib/crm/server/marketing';
import { loadMembers } from '@/lib/crm/server/members';
import { queryAll } from '@/lib/crm/server/records';
import { automationOverview } from '@/lib/crm/server/automation-admin';
import { toClientFields } from '@/lib/crm/client-types';
import AutomationAdmin from '@/components/crm/automation/automation-admin';
import { TABS } from '@/components/crm/automation/tabs';

export const dynamic = 'force-dynamic';

export default async function AutomationPage({ searchParams }: { searchParams: { tab?: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !canSetup(ctx, 'manage_automation')) notFound();
  const meta = await loadMeta();
  const tab = TABS.some((t) => t.key === searchParams.tab) ? searchParams.tab! : 'workflow';
  const kinds = tab === 'rules' ? ['validation_rule', 'layout_rule'] : tab === 'activity' ? [] : [tab];
  const rules = (await Promise.all(kinds.map((k) => listConfig(k)))).flat();
  const modules = meta.modules.filter((m) => m.active !== false);
  const [templates, members, roles, cadences, webhooks, campaigns] = await Promise.all([
    listTemplates(), loadMembers(), listConfig('role'), listConfig('cadence'), listConfig('webhook'),
    queryAll(ctx, meta, 'campaigns', null, 500).then((r) => r.rows).catch(() => []),
  ]);
  const stageKeys = [...new Map(meta.pipelines.flatMap((p) => p.config.stages.map((s) => [s.key, { key: s.key, label: `${s.label} (${p.name})` }]))).values()];
  const refs = {
    modules: modules.map((m) => ({ api: m.api_name, label: m.label, emailField: m.settings.emailField })),
    fields: Object.fromEntries(modules.map((m) => [m.api_name, toClientFields(ctx, m.api_name, meta.fields(m.api_name))])),
    members: members.filter((m) => m.active).map((m) => ({ id: m.id, name: m.name })),
    roles: roles.map((r) => ({ id: r.id, name: r.name })),
    templates: templates.filter((t) => t.active).map((t) => ({ id: t.id, name: t.name, category: t.config.category ?? 'marketing' })),
    campaigns: campaigns.map((c) => ({ id: c.id, name: c.name })),
    cadences: cadences.map((c) => ({ id: c.id, name: c.name, module: String((c.config as { module?: string }).module ?? c.module ?? '') })),
    webhooks: webhooks.map((w) => ({ id: w.id, name: w.name, module: String((w.config as { module?: string }).module ?? '') })),
    stageKeys,
  };
  const overview = tab === 'activity' || tab === 'cadence' || tab === 'webhook' ? await automationOverview(ctx) : null;
  return <AutomationAdmin tab={tab} rules={JSON.parse(JSON.stringify(rules))} refs={refs} overview={JSON.parse(JSON.stringify(overview))} />;
}
