import { notFound } from 'next/navigation';
import { requireCrm, CrmAccessError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { getRecord, accessTo } from '@/lib/crm/server/records';
import { relatedLists, timeline } from '@/lib/crm/server/related';
import { listAttachments, listNotes } from '@/lib/crm/server/notes';
import { resolveRefs } from '@/lib/crm/server/names';
import { loadMembers } from '@/lib/crm/server/members';
import { allows, can, canSetup } from '@/lib/crm/permissions';
import { listTemplates, recordEmails } from '@/lib/crm/server/marketing';
import { campaignMembers, campaignStats } from '@/lib/crm/server/campaigns';
import CampaignPanel from '@/components/crm/campaign-panel';
import { approvalFor, blueprintInfo, cadencesFor, layoutRulesFor, loadRules, macrosFor } from '@/lib/crm/server/automation';
import { createServiceClient } from '@/lib/crm/server/svc';
import { evaluate } from '@/lib/crm/criteria';
import { RecordAutomationActions, RecordAutomationPanel } from '@/components/crm/automation/record-automation';
import { toClientFields, toClientModule, toClientRecord } from '@/lib/crm/client-types';
import RecordView from '@/components/crm/record-view';
import { AiPanel, PrivacyPanel } from '@/components/crm/record-insights';
import AccountPanel from '@/components/crm/account-panel';

export const dynamic = 'force-dynamic';

export default async function RecordPage({ params }: { params: { module: string; id: string } }) {
  const ctx = await requireCrm().catch(() => null);
  if (!ctx) notFound();
  const meta = await loadMeta();
  const mod = meta.module(params.module);
  if (!mod || mod.active === false || !can(ctx, mod.api_name, 'view')) notFound();
  let rec;
  try {
    rec = await getRecord(ctx, meta, mod.api_name, params.id, { includeDeleted: true });
  } catch (e) {
    if (e instanceof CrmAccessError) notFound();
    throw e;
  }
  const level = accessTo(ctx, meta, rec);
  const [related, events, notes, files] = await Promise.all([
    relatedLists(ctx, meta, rec),
    timeline(ctx, meta, rec),
    listNotes(ctx, meta, rec.id),
    listAttachments(ctx, meta, rec.id),
  ]);
  const refs = await resolveRefs(ctx, meta, [rec, ...related.flatMap((l) => l.rows)]);
  const members = (await loadMembers()).filter((m) => m.active).map((m) => ({ id: m.id, name: m.name }));
  for (const m of await loadMembers()) refs[m.id] = { name: m.name };

  // Email: modules that support it, for people allowed to email them
  let email = null;
  if (mod.settings.supports?.email && mod.settings.emailField && can(ctx, mod.api_name, 'email') && !rec.deleted_at) {
    const to = typeof rec.data[mod.settings.emailField] === 'string' ? (rec.data[mod.settings.emailField] as string) : null;
    const [templates, history] = await Promise.all([listTemplates(), recordEmails(ctx, meta, mod.api_name, rec.id)]);
    email = {
      to,
      templates: templates.filter((t) => t.active).map((t) => ({ id: t.id, name: t.name, config: t.config })),
      history: JSON.parse(JSON.stringify(history)),
      canSendNow: canSetup(ctx, 'approve_outbox'),
    };
  }
  let extra: React.ReactNode = null;
  if (mod.api_name === 'campaigns' && !rec.deleted_at) {
    const [stats, mem, templates] = await Promise.all([campaignStats(ctx, meta, rec.id), campaignMembers(ctx, meta, rec.id), listTemplates()]);
    extra = (
      <CampaignPanel campaignId={rec.id} stats={stats} members={mem.rows} total={mem.total}
        templates={templates.filter((t) => t.active && t.config.category !== 'service').map((t) => ({ id: t.id, name: t.name }))}
        fields={{ contacts: toClientFields(ctx, 'contacts', meta.fields('contacts')), leads: toClientFields(ctx, 'leads', meta.fields('leads')) }}
        people={members} canEdit={can(ctx, 'campaigns', 'edit') && allows(level, 'rw')} />
    );
  }

  // Automation: blueprint, approval, macros, cadences, score
  const rules = await loadRules();
  const [bp, approval, macros, cadences, layoutRules] = await Promise.all([
    blueprintInfo(ctx, rec), approvalFor(rec.id), macrosFor(ctx, mod.api_name), cadencesFor(mod.api_name), layoutRulesFor(mod.api_name),
  ]);
  const canEditRec = can(ctx, mod.api_name, 'edit') && allows(level, 'rw') && !rec.deleted_at;
  const canDecide = !!approval && approval.status === 'pending' && (approval.approvers.includes(ctx.userId) || ctx.superAdmin || canSetup(ctx, 'manage_automation'));
  const canSubmit = canEditRec && !rec.locked && rules.approvals.some((p) => (p.config.module === mod.api_name) && p.config.trigger === 'manual' && (!p.config.criteria || evaluate(rec, p.config.criteria)));
  const stageLabels: Record<string, string> = Object.fromEntries(meta.pipelines.flatMap((p) => p.config.stages.map((st) => [st.key, st.label])));
  const bpRule = bp ? rules.blueprints.find((b) => b.id === bp.id) : null;
  const { data: ens } = await createServiceClient().from('crm_cadence_enrollments').select('cadence_id, status, step, next_at, exit_reason').eq('record_id', rec.id);
  const cadenceNames = new Map(rules.cadences.map((c) => [c.id, { name: c.name, steps: c.config.steps.length }]));
  const enrollments = ((ens ?? []) as Array<{ cadence_id: string; status: string; step: number; next_at: string | null; exit_reason: string | null }>)
    .map((e) => ({ ...e, name: cadenceNames.get(e.cadence_id)?.name ?? 'Cadence', steps: cadenceNames.get(e.cadence_id)?.steps ?? 0 }));
  const hasScoring = rules.scoring.some((r) => r.config.module === mod.api_name);
  const memberNames = Object.fromEntries((await loadMembers()).map((m) => [m.id, m.name]));
  let clientFields = toClientFields(ctx, mod.api_name, meta.fields(mod.api_name), rec.external_key);
  if (bp && !bp.done) clientFields = clientFields.map((f) => (f.api === bp.field ? { ...f, ro: true, help: 'Changed by Blueprint transitions only.' } : f));
  const automationPanel = (
    <RecordAutomationPanel recordId={rec.id} blueprint={bp} approval={approval ? JSON.parse(JSON.stringify(approval)) : null} names={memberNames}
      enrollments={enrollments} score={hasScoring ? rec.score ?? 0 : null} stateLabels={stageLabels} states={bpRule?.config.states ?? []} />
  );
  const automationActions = !rec.deleted_at ? (
    <RecordAutomationActions recordId={rec.id} module={mod.api_name} blueprint={bp} approval={approval ? JSON.parse(JSON.stringify(approval)) : null}
      canDecide={canDecide} canSubmit={canSubmit} macros={canEditRec && !rec.locked ? macros : []} cadences={canEditRec && !rec.locked ? cadences : []}
      fields={clientFields} members={members} stateLabels={stageLabels} />
  ) : null;

  const childFields = Object.fromEntries(related.map((l) => [l.module, toClientFields(ctx, l.module, meta.fields(l.module))]));
  const childModules = Object.fromEntries(related.map((l) => [l.module, toClientModule(meta.module(l.module)!)]));

  return (
    <RecordView
      module={toClientModule(mod)}
      fields={clientFields}
      layoutRules={layoutRules}
      record={toClientRecord(rec)}
      refs={refs}
      related={related.map((l) => ({ module: l.module, label: l.label, via: l.via, total: l.total, rows: l.rows.map(toClientRecord) }))}
      childFields={childFields}
      childModules={childModules}
      timeline={events}
      notes={notes}
      files={files}
      members={members}
      pipelines={meta.pipelines.filter((p) => p.active).map((p) => ({ name: p.name, stages: p.config.stages }))}
      canCreate={Object.fromEntries(meta.modules.map((m) => [m.api_name, can(ctx, m.api_name, 'create')]))}
      perms={{
        edit: can(ctx, mod.api_name, 'edit') && allows(level, 'rw'),
        delete: can(ctx, mod.api_name, 'delete') && allows(level, 'rwd'),
        full: allows(level, 'rwd'),
        convert: can(ctx, mod.api_name, 'convert'),
        superAdmin: ctx.superAdmin,
      }}
      userId={ctx.userId}
      email={email}
      extra={<>{automationPanel}{!rec.deleted_at && ctx.superAdmin && mod.api_name === 'contacts' && rec.mece_user_id && rec.locked?.kind !== 'dpdp_erased' && <AccountPanel recordId={rec.id} />}{!rec.deleted_at && <AiPanel recordId={rec.id} module={mod.api_name} />}{!rec.deleted_at && <PrivacyPanel recordId={rec.id} module={mod.api_name} canEdit={canEditRec || canSetup(ctx, 'manage_privacy')} />}{extra}</>}
      actions={automationActions}
    />
  );
}
