'use server';

/**
 * Marketing + service server actions (phase 2). Each resolves the caller's
 * CRM context first; the lib functions re-check every permission.
 */
import { requireCrm, CrmUserError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { createServiceClient } from '@/lib/crm/server/svc';
import { run, obj, ids, str } from '@/lib/crm/server/action-util';
import { composeEmail, outboxPreview, previewTemplate, saveSegment, saveTemplate, setDailyCap } from '@/lib/crm/server/marketing';
import { decide, sendApproved } from '@/lib/crm/server/outbox';
import { refreshSegment, segmentMembers } from '@/lib/crm/server/segments';
import { addMembers, emailMembers, removeMembers, setMemberStatus } from '@/lib/crm/server/campaigns';
import { saveWebform } from '@/lib/crm/server/forms';
import { saveSurvey, sendSurvey } from '@/lib/crm/server/surveys';
import { markHelpful, saveServiceConfig, searchSolutions } from '@/lib/crm/server/service';
import { deleteConfig } from '@/lib/crm/server/setup';
import { canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import { validateTemplate } from '@/lib/crm/templates';
import type { Criteria } from '@/lib/crm/types';

const MKT_KINDS = ['email_template', 'segment', 'webform', 'survey'] as const;

export async function mktSaveTemplate(input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  return run(async () => saveTemplate(await requireCrm(), { id: input?.id ?? null, name: str(input?.name, 120), active: input?.active !== false, config: input?.config }));
}
export async function mktPreviewTemplate(input: { config: unknown; module: string; recordId?: string | null }) {
  return run(async () => previewTemplate(await requireCrm(), await loadMeta(), { config: input?.config, module: str(input?.module, 60), recordId: isUuid(input?.recordId) ? input.recordId : null }));
}
export async function mktDeleteConfig(kind: string, id: string) {
  return run(async () => {
    if (!(MKT_KINDS as readonly string[]).includes(kind)) throw new CrmUserError('Not allowed.');
    await deleteConfig(await requireCrm(), str(id, 40), kind);
    return null;
  });
}
export async function mktSaveSegment(input: { id?: string | null; name: string; config: unknown }) {
  return run(async () => saveSegment(await requireCrm(), await loadMeta(), { id: input?.id ?? null, name: str(input?.name, 120), config: input?.config }));
}
export async function mktRefreshSegment(id: string) {
  return run(async () => refreshSegment(await requireCrm(), await loadMeta(), str(id, 40)));
}
export async function mktSegmentToCampaign(segmentId: string, label: string | null, campaignId: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const rows = await segmentMembers(ctx, meta, str(segmentId, 40), label ? str(label, 40) : null);
    if (!rows.length) return 0;
    const module = rows[0].module;
    return addMembers(ctx, meta, str(campaignId, 40), module, { ids: rows.map((r) => r.id) });
  });
}
export async function mktSaveWebform(input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  return run(async () => saveWebform(await requireCrm(), await loadMeta(), { id: input?.id ?? null, name: str(input?.name, 120), active: input?.active !== false, config: input?.config }));
}
export async function mktSaveSurvey(input: { id?: string | null; name: string; active?: boolean; config: unknown }) {
  return run(async () => saveSurvey(await requireCrm(), { id: input?.id ?? null, name: str(input?.name, 120), active: input?.active !== false, config: input?.config }));
}
export async function mktSendSurvey(input: { surveyId: string; module: 'contacts' | 'leads' | 'cases'; recordIds?: string[]; criteria?: Criteria | null; period?: 'once' | 'month' | 'quarter' }) {
  return run(async () => sendSurvey(await requireCrm(), await loadMeta(), {
    surveyId: str(input?.surveyId, 40), module: input?.module, recordIds: ids(input?.recordIds, 5000),
    criteria: input?.recordIds?.length ? undefined : (input?.criteria ?? null), period: input?.period,
  }));
}

// ---- outbox ------------------------------------------------------------------
export async function outboxDecide(recordIds: string[], approve: boolean, reason?: string) {
  return run(async () => decide(await requireCrm(), ids(recordIds), !!approve, str(reason, 200)));
}
export async function outboxSendDue() {
  return run(async () => {
    const ctx = await requireCrm();
    if (!canSetup(ctx, 'approve_outbox')) throw new CrmUserError('Only people allowed to approve emails can do this.');
    return sendApproved(createServiceClient(), ctx.userId);
  });
}
export async function outboxSetCap(n: number) {
  return run(async () => { await setDailyCap(await requireCrm(), Number(n)); return null; });
}
export async function outboxGetPreview(id: string) {
  return run(async () => outboxPreview(await requireCrm(), str(id, 40)));
}

// ---- campaigns ----------------------------------------------------------------
export async function campaignAddMembers(campaignId: string, module: string, input: { ids?: string[]; criteria?: Criteria | null }) {
  return run(async () => addMembers(await requireCrm(), await loadMeta(), str(campaignId, 40), str(module, 40), {
    ids: input?.ids ? ids(input.ids, 5000) : undefined, criteria: input?.ids ? undefined : (input?.criteria ?? null),
  }));
}
export async function campaignRemoveMembers(campaignId: string, recordIds: string[]) {
  return run(async () => removeMembers(await requireCrm(), await loadMeta(), str(campaignId, 40), ids(recordIds, 5000)));
}
export async function campaignSetStatus(campaignId: string, recordId: string, status: string) {
  return run(async () => { await setMemberStatus(await requireCrm(), await loadMeta(), str(campaignId, 40), str(recordId, 40), str(status, 40)); return null; });
}
export async function campaignEmail(campaignId: string, templateId: string, statuses: string[]) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    if (!isUuid(templateId)) throw new CrmUserError('Pick a template.');
    const { data } = await createServiceClient().from('crm_config').select('id, config').eq('id', templateId).eq('kind', 'email_template').maybeSingle();
    if (!data) throw new CrmUserError('That template no longer exists.');
    let t;
    try { t = validateTemplate((data as { config: unknown }).config); } catch (e) { throw new CrmUserError((e as Error).message); }
    return emailMembers(ctx, meta, str(campaignId, 40), t, templateId, Array.isArray(statuses) ? statuses.map((s) => str(s, 40)).slice(0, 10) : ['Planned']);
  });
}

// ---- one-off email ------------------------------------------------------------
export async function crmComposeEmail(input: { module: string; recordId: string; templateId?: string | null; config?: unknown; sendNow?: boolean }) {
  return run(async () => composeEmail(await requireCrm(), await loadMeta(), {
    module: str(input?.module, 60), recordId: str(input?.recordId, 40), templateId: isUuid(input?.templateId) ? input.templateId : null, config: input?.config, sendNow: !!input?.sendNow,
  }));
}

// ---- service ------------------------------------------------------------------
export async function serviceSaveConfig(input: { sla?: unknown; settings?: { csatOnResolve?: boolean; csatSurveyId?: string | null } }) {
  return run(async () => { await saveServiceConfig(await requireCrm(), { sla: input?.sla, settings: input?.settings ? obj(input.settings) as never : undefined }); return null; });
}
export async function kbSearch(term: string, includeDrafts?: boolean) {
  return run(async () => searchSolutions(await requireCrm(), str(term, 100), { publishedOnly: !includeDrafts }));
}
export async function kbHelpful(id: string) {
  return run(async () => markHelpful(await requireCrm(), str(id, 40)));
}
