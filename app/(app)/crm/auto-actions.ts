'use server';

/**
 * Automation server actions (phase 3): rule admin, Blueprint transitions,
 * approvals, macros, cadences, assignment. Each resolves the caller's CRM
 * context first; the lib layer re-checks every permission and validates every
 * shape.
 */
import { requireCrm, CrmUserError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import { createServiceClient } from '@/lib/crm/server/svc';
import { run, obj, ids, str } from '@/lib/crm/server/action-util';
import { deleteRule, saveRule, setRuleActive, testWebhook } from '@/lib/crm/server/automation-admin';
import {
  applyAssignment, decideApproval, enrollCadence, runMacro, runScheduled, runTransition, scoreExplanation, submitManually,
} from '@/lib/crm/server/automation';
import { accessTo, loadRecordRaw } from '@/lib/crm/server/records';
import { allows, can, canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';

export async function autoSaveRule(kind: string, input: { id?: string | null; name: string; active?: boolean; config: unknown; rotateSecret?: boolean }) {
  return run(async () => saveRule(await requireCrm(), await loadMeta(), str(kind, 40), {
    id: isUuid(input?.id) ? input.id : null, name: str(input?.name, 120), active: input?.active !== false, config: input?.config, rotateSecret: !!input?.rotateSecret,
  }));
}
export async function autoDeleteRule(kind: string, id: string) {
  return run(async () => { await deleteRule(await requireCrm(), str(kind, 40), str(id, 40)); return null; });
}
export async function autoSetActive(id: string, active: boolean) {
  return run(async () => { await setRuleActive(await requireCrm(), str(id, 40), !!active); return null; });
}
export async function autoTestWebhook(id: string) {
  return run(async () => testWebhook(await requireCrm(), str(id, 40)));
}
export async function autoRunNow() {
  return run(async () => {
    const ctx = await requireCrm();
    if (!canSetup(ctx, 'manage_automation')) throw new CrmUserError('You don’t have permission to manage automation.');
    return runScheduled(createServiceClient(), await loadMeta());
  });
}

export async function crmTransition(recordId: string, transitionId: string, input: { fields?: Record<string, unknown>; note?: string }) {
  return run(async () => runTransition(await requireCrm(), await loadMeta(), str(recordId, 40), str(transitionId, 40), { fields: obj(input?.fields), note: str(input?.note, 4000) }));
}
export async function crmSubmitApproval(recordId: string) {
  return run(async () => submitManually(await requireCrm(), await loadMeta(), str(recordId, 40)));
}
export async function crmDecideApproval(approvalId: string, approve: boolean, comment: string) {
  return run(async () => decideApproval(await requireCrm(), await loadMeta(), str(approvalId, 40), !!approve, str(comment, 1000)));
}
export async function crmRunMacro(macroId: string, recordIds: string[]) {
  return run(async () => runMacro(await requireCrm(), await loadMeta(), str(macroId, 40), ids(recordIds, 200)));
}
export async function crmEnrollCadence(cadenceId: string, recordIds: string[]) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const svc = createServiceClient();
    let n = 0;
    const errors: string[] = [];
    for (const id of ids(recordIds, 200)) {
      const rec = await loadRecordRaw(svc, id);
      if (!rec || rec.deleted_at || !can(ctx, rec.module, 'edit') || !allows(accessTo(ctx, meta, rec), 'rw')) continue;
      try { if (await enrollCadence(svc, str(cadenceId, 40), rec, ctx.userId)) n++; } catch (e) { errors.push((e as Error).message); }
    }
    if (!n && errors.length) throw new CrmUserError(errors[0]);
    return n;
  });
}
export async function crmUnenrollCadence(cadenceId: string, recordId: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const svc = createServiceClient();
    const rec = await loadRecordRaw(svc, str(recordId, 40));
    if (!rec || !allows(accessTo(ctx, meta, rec), 'rw')) throw new CrmUserError('Record not found.');
    await svc.from('crm_cadence_enrollments').update({ status: 'exited', exited_at: new Date().toISOString(), exit_reason: 'removed by a person', next_at: null }).eq('cadence_id', str(cadenceId, 40)).eq('record_id', rec.id).eq('status', 'active');
    return null;
  });
}
export async function crmApplyAssignment(module: string, recordIds: string[]) {
  return run(async () => applyAssignment(await requireCrm(), await loadMeta(), str(module, 60), ids(recordIds, 500)));
}
export async function crmScoreWhy(recordId: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const rec = await loadRecordRaw(createServiceClient(), str(recordId, 40));
    if (!rec || !accessTo(ctx, meta, rec)) throw new CrmUserError('Record not found.');
    return scoreExplanation(rec);
  });
}
