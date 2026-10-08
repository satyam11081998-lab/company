'use server';

/**
 * Insights, AI, privacy and developer server actions (phase 4). Each
 * resolves the caller's CRM context; the lib functions re-check every
 * permission and validate every input again.
 */
import { requireCrm, CrmUserError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { run, obj, str } from '@/lib/crm/server/action-util';
import { saveAnalyticsSettings } from '@/lib/crm/server/analytics';
import { deleteReportOrDashboard, exportReportCsv, forecast, runReportConfig, saveDashboard, saveReport, setTargets } from '@/lib/crm/server/reports';
import { aiDraft, aiFeedback, askCrm, recordInsights, savePrediction, trainModel, refreshScores } from '@/lib/crm/server/ai';
import { accessExport, consentHistory, correctionTask, createRequest, erase, restrict, saveBreach, setConsent, updateRequest, withdrawFor } from '@/lib/crm/server/privacy';
import { createApiKey, revokeApiKey } from '@/lib/crm/server/api-keys';
import { deleteConfig } from '@/lib/crm/server/setup';
import { cleanReport } from '@/lib/crm/reports';
import { getRecord, loadRecordRaw } from '@/lib/crm/server/records';
import { can, canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import { createServiceClient } from '@/lib/crm/server/svc';
import { CrmAccessError } from '@/lib/crm/server/context';

// ---- analytics ---------------------------------------------------------------
export async function anSaveSettings(input: unknown) {
  return run(async () => saveAnalyticsSettings(await requireCrm(), obj(input) as never));
}

// ---- reports / dashboards / forecasts ---------------------------------------
export async function repRun(config: unknown) {
  return run(async () => {
    const meta = await loadMeta();
    const c = obj(config);
    let cfg;
    try { cfg = cleanReport(c, meta.fields(str(c.module, 60))); } catch (e) { throw new CrmUserError((e as Error).message); }
    return JSON.parse(JSON.stringify(await runReportConfig(await requireCrm(), meta, cfg)));
  });
}
export async function repSave(input: { id?: string | null; name: string; shared?: boolean; config: unknown }) {
  return run(async () => saveReport(await requireCrm(), await loadMeta(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 120), shared: !!input?.shared, config: input?.config }));
}
export async function repDelete(kind: 'report' | 'dashboard', id: string) {
  return run(async () => {
    if (kind !== 'report' && kind !== 'dashboard') throw new CrmUserError('Not allowed.');
    await deleteReportOrDashboard(await requireCrm(), kind, str(id, 40));
    return null;
  });
}
export async function repExport(config: unknown) {
  return run(async () => {
    const meta = await loadMeta();
    const ctx = await requireCrm();
    const c = obj(config);
    // exporting a report exports the module's data: the profile must allow export of that module
    if (!can(ctx, str(c.module, 60), 'export')) throw new CrmAccessError('You can’t export this module.');
    let cfg;
    try { cfg = cleanReport(c, meta.fields(str(c.module, 60))); } catch (e) { throw new CrmUserError((e as Error).message); }
    return exportReportCsv(ctx, meta, cfg);
  });
}
export async function dashSave(input: { id?: string | null; name: string; shared?: boolean; config: unknown }) {
  return run(async () => saveDashboard(await requireCrm(), await loadMeta(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 120), shared: !!input?.shared, config: input?.config }));
}
export async function fcLoad(period: string) {
  return run(async () => JSON.parse(JSON.stringify(await forecast(await requireCrm(), await loadMeta(), str(period, 10)))));
}
export async function fcSetTargets(period: string, targets: Record<string, number>) {
  return run(async () => setTargets(await requireCrm(), str(period, 10), obj(targets) as Record<string, number>));
}

// ---- AI ----------------------------------------------------------------------
export async function aiTrain(kind: string, configId?: string | null) {
  return run(async () => {
    if (!['churn', 'conversion', 'prediction'].includes(kind)) throw new CrmUserError('Unknown model.');
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const res = await trainModel(ctx, meta, kind as 'churn', isUuid(configId) ? configId : undefined);
    // scores use the new model straight away
    if (res.ok && kind !== 'prediction') await refreshScores(createServiceClient(), meta);
    return JSON.parse(JSON.stringify(res));
  });
}
export async function aiRefreshScores() {
  return run(async () => {
    const ctx = await requireCrm();
    if (!canSetup(ctx, 'manage_ai')) throw new CrmAccessError('You can’t run AI scoring.');
    return refreshScores(createServiceClient(), await loadMeta());
  });
}
export async function aiSavePrediction(input: { id?: string | null; name: string; config: unknown }) {
  return run(async () => savePrediction(await requireCrm(), await loadMeta(), { id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 120), config: input?.config }));
}
export async function aiDeletePrediction(id: string) {
  return run(async () => { await deleteConfig(await requireCrm(), str(id, 40), 'prediction'); return null; });
}
export async function aiAsk(question: string) {
  return run(async () => JSON.parse(JSON.stringify(await askCrm(await requireCrm(), await loadMeta(), str(question, 300)))));
}
export async function aiInsights(recordId: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const raw = await loadRecordRaw(createServiceClient(), str(recordId, 40));
    if (!raw) throw new CrmAccessError('Record not found.');
    const rec = await getRecord(ctx, meta, raw.module, raw.id); // access + field security
    return JSON.parse(JSON.stringify(await recordInsights(ctx, meta, { ...raw, data: { ...raw.data, ...rec.data } })));
  });
}
export async function aiGiveFeedback(input: { recordId: string; kind: string; verdict: string; value?: unknown; reason?: string }) {
  return run(async () => aiFeedback(await requireCrm(), await loadMeta(), { recordId: str(input?.recordId, 40), kind: str(input?.kind, 40), verdict: str(input?.verdict, 20), value: input?.value, reason: str(input?.reason, 1000) }));
}
export async function aiEmailDraft(recordId: string, purpose: string) {
  return run(async () => aiDraft(await requireCrm(), await loadMeta(), str(recordId, 40), str(purpose, 200)));
}

// ---- privacy -----------------------------------------------------------------
export async function pvConsentHistory(recordId: string) {
  return run(async () => JSON.parse(JSON.stringify(await consentHistory(await requireCrm(), await loadMeta(), str(recordId, 40)))));
}
export async function pvSetConsent(input: { recordId: string; purpose: string; status: string; notice?: string; channel?: string }) {
  return run(async () => setConsent(await requireCrm(), await loadMeta(), { recordId: str(input?.recordId, 40), purpose: str(input?.purpose, 20), status: str(input?.status, 20), notice: str(input?.notice, 2000), channel: str(input?.channel, 20) }));
}
export async function pvCreateRequest(input: { kind: string; requesterEmail?: string; recordId?: string | null; details?: string }) {
  return run(async () => createRequest(await requireCrm(), await loadMeta(), { kind: str(input?.kind, 30), requesterEmail: str(input?.requesterEmail, 254), recordId: isUuid(input?.recordId) ? input.recordId : null, details: str(input?.details, 4000) }));
}
export async function pvUpdateRequest(id: string, patch: { status?: string; resolution?: string }) {
  return run(async () => updateRequest(await requireCrm(), str(id, 40), { status: patch?.status ? str(patch.status, 20) : undefined, resolution: patch?.resolution !== undefined ? str(patch.resolution, 4000) : undefined }));
}
export async function pvAccessExport(id: string) {
  return run(async () => accessExport(await requireCrm(), await loadMeta(), str(id, 40)));
}
export async function pvErase(id: string, confirm: string) {
  return run(async () => erase(await requireCrm(), await loadMeta(), str(id, 40), str(confirm, 10)));
}
export async function pvRestrict(id: string) {
  return run(async () => restrict(await requireCrm(), await loadMeta(), str(id, 40)));
}
export async function pvWithdraw(id: string, purposes: string[]) {
  return run(async () => withdrawFor(await requireCrm(), await loadMeta(), str(id, 40), Array.isArray(purposes) ? purposes.map((p) => str(p, 20)).slice(0, 4) : []));
}
export async function pvCorrection(id: string) {
  return run(async () => correctionTask(await requireCrm(), await loadMeta(), str(id, 40)));
}
export async function pvSaveBreach(input: Record<string, unknown>) {
  return run(async () => {
    const i = obj(input);
    return saveBreach(await requireCrm(), {
      id: isUuid(i.id) ? (i.id as string) : null, title: str(i.title, 200), description: str(i.description, 8000), detectedAt: str(i.detectedAt, 40),
      dataCategories: Array.isArray(i.dataCategories) ? i.dataCategories.map((x) => str(x, 40)) : [], peopleAffected: i.peopleAffected === '' || i.peopleAffected === null || i.peopleAffected === undefined ? null : Number(i.peopleAffected),
      severity: str(i.severity, 10), status: str(i.status, 10), boardNotifiedAt: str(i.boardNotifiedAt, 40) || null, principalsNotifiedAt: str(i.principalsNotifiedAt, 40) || null, actionsTaken: str(i.actionsTaken, 8000),
    });
  });
}

// ---- developer: API keys -------------------------------------------------------
export async function apiCreateKey(input: { name: string; userId?: string | null; scopes?: string[]; expiresDays?: number | null }) {
  return run(async () => createApiKey(await requireCrm(), { name: str(input?.name, 80), userId: isUuid(input?.userId) ? input.userId : null, scopes: Array.isArray(input?.scopes) ? input.scopes.map((s) => str(s, 10)) : ['read'], expiresDays: input?.expiresDays === null || input?.expiresDays === undefined ? null : Number(input.expiresDays) }));
}
export async function apiRevokeKey(id: string) {
  return run(async () => revokeApiKey(await requireCrm(), str(id, 40)));
}
