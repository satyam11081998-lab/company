import { notFound } from 'next/navigation';
import { requireCrm } from '@/lib/crm/server/context';
import { canSetup } from '@/lib/crm/permissions';
import { loadMeta } from '@/lib/crm/server/meta';
import { listConfig } from '@/lib/crm/server/setup';
import { ensureDefaultSurveys, surveyResults } from '@/lib/crm/server/surveys';
import { loadMembers } from '@/lib/crm/server/members';
import { toClientFields } from '@/lib/crm/client-types';
import SurveysAdmin from '@/components/crm/marketing/surveys-admin';

export const dynamic = 'force-dynamic';

export default async function SurveysPage() {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx || !(canSetup(ctx, 'manage_marketing') || canSetup(ctx, 'view_analytics'))) notFound();
  const meta = await loadMeta();
  await ensureDefaultSurveys();
  const surveys = await listConfig('survey');
  const results = Object.fromEntries(await Promise.all(surveys.map(async (s) => [s.id, await surveyResults(ctx, s.id)] as const)));
  const fields = { contacts: toClientFields(ctx, 'contacts', meta.fields('contacts')), leads: toClientFields(ctx, 'leads', meta.fields('leads')) };
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  return <SurveysAdmin surveys={JSON.parse(JSON.stringify(surveys))} results={JSON.parse(JSON.stringify(results))} fields={fields} members={members} canManage={canSetup(ctx, 'manage_marketing')} />;
}
