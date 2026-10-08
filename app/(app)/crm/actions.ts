'use server';

/**
 * CRM server actions. Every one resolves the caller's CRM context first
 * (requireCrm → null for anyone who isn't a CRM user) and passes it to the
 * lib functions, which check module, record and field permissions again.
 * Inputs are untrusted: the lib layer validates every shape.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { requireCrm, requireSetup, CrmAccessError, CrmUserError } from '@/lib/crm/server/context';
import { loadMeta } from '@/lib/crm/server/meta';
import {
  SaveError, createRecord, deleteRecords, purgeRecords, restoreRecords, setLock, setShares, setTags, updateRecord, listRecords,
} from '@/lib/crm/server/records';
import { convertDocument, convertLead, type ConvertLeadInput } from '@/lib/crm/server/convert';
import { findDuplicates, mergeRecords } from '@/lib/crm/server/merge';
import { addAttachment, addNote, attachmentUrl, deleteAttachment, deleteNote } from '@/lib/crm/server/notes';
import { exportCsv, importCsv, searchAll, undoImport, type ImportOptions } from '@/lib/crm/server/data';
import { deleteConfig, saveView } from '@/lib/crm/server/setup';
import { runSync } from '@/lib/crm/server/sync';
import { can, canSetup } from '@/lib/crm/permissions';
import { isUuid } from '@/lib/crm/fields';
import type { AccessLevel, Criteria, ViewConfig } from '@/lib/crm/types';

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; duplicateOf?: { id: string; name: string } };

async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    if (e instanceof SaveError) {
      const dup = e.errors.find((x) => x.duplicateOf)?.duplicateOf;
      return { ok: false, error: e.message, fieldErrors: Object.fromEntries(e.errors.map((x) => [x.field, x.message])), duplicateOf: dup };
    }
    if (e instanceof CrmAccessError || e instanceof CrmUserError) return { ok: false, error: e.message };
    const msg = (e as Error)?.message ?? '';
    if (/File is larger|more than \d+ rows|unclosed quote|file is empty|Too many columns/i.test(msg)) return { ok: false, error: msg };
    console.error('[crm] action failed:', e);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isUuid).slice(0, 500) : []);

// ---- records ---------------------------------------------------------------

export async function crmCreate(module: string, input: unknown, opts?: { ownerId?: string | null; tags?: string[]; allowDuplicate?: boolean }) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const rec = await createRecord(ctx, meta, String(module), obj(input), {
      source: 'ui', ownerId: opts?.ownerId === undefined ? undefined : opts.ownerId, tags: Array.isArray(opts?.tags) ? opts!.tags : [], allowDuplicate: !!opts?.allowDuplicate,
    });
    return { id: rec.id };
  });
}

export async function crmUpdate(module: string, id: string, patch: unknown, expectedUpdatedAt?: string | null, opts?: { ownerId?: string | null; allowDuplicate?: boolean }) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const rec = await updateRecord(ctx, meta, String(module), String(id), obj(patch), {
      source: 'ui', expectedUpdatedAt: expectedUpdatedAt ?? null, ownerId: opts?.ownerId, allowDuplicate: !!opts?.allowDuplicate,
    });
    return { id: rec.id, updated_at: rec.updated_at };
  });
}

export async function crmDelete(module: string, recordIds: string[]) {
  return run(async () => deleteRecords(await requireCrm(), await loadMeta(), String(module), ids(recordIds)));
}

export async function crmRestore(recordIds: string[]) {
  return run(async () => restoreRecords(await requireCrm(), await loadMeta(), ids(recordIds)));
}

export async function crmPurge(recordIds: string[]) {
  return run(async () => {
    const ctx = await requireSetup('manage_data');
    return purgeRecords(createServiceClient(), ctx.userId, ids(recordIds));
  });
}

export async function crmMassUpdate(module: string, recordIds: string[], field: string, value: unknown) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    const list = ids(recordIds);
    let done = 0;
    const failed: string[] = [];
    for (const id of list) {
      try {
        await updateRecord(ctx, meta, String(module), id, { [String(field)]: value }, { source: 'ui', skipAutomation: list.length > 1000 });
        done++;
      } catch (e) {
        failed.push((e as Error).message);
      }
    }
    return { done, failed: failed.length, firstError: failed[0] ?? null };
  });
}

export async function crmTransfer(module: string, recordIds: string[], ownerId: string | null) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    let done = 0;
    let firstError: string | null = null;
    for (const id of ids(recordIds)) {
      try {
        await updateRecord(ctx, meta, String(module), id, {}, { source: 'ui', ownerId: ownerId && isUuid(ownerId) ? ownerId : null });
        done++;
      } catch (e) {
        firstError ??= (e as Error).message;
      }
    }
    return { done, firstError };
  });
}

export async function crmTags(module: string, recordIds: string[], add: string[], remove: string[]) {
  return run(async () => setTags(await requireCrm(), await loadMeta(), String(module), ids(recordIds), Array.isArray(add) ? add : [], Array.isArray(remove) ? remove : []));
}

export async function crmLock(module: string, id: string, lock: boolean, reason: string) {
  return run(async () => setLock(await requireCrm(), await loadMeta(), String(module), String(id), !!lock, String(reason ?? '')));
}

export async function crmShare(module: string, id: string, shares: Array<{ user_id: string; access: AccessLevel }>) {
  return run(async () => setShares(await requireCrm(), await loadMeta(), String(module), String(id), Array.isArray(shares) ? shares : []));
}

export async function crmLookupSearch(module: string, term: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const meta = await loadMeta();
    if (!can(ctx, String(module), 'view')) return [];
    const res = await listRecords(ctx, meta, String(module), { search: String(term ?? '').slice(0, 100), pageSize: 12 });
    return res.rows.map((r) => ({ id: r.id, name: r.name || '(no name)', sub: String(r.data.email ?? r.data.company ?? r.data.account_type ?? r.data.product_code ?? '') }));
  });
}

export async function crmSearch(term: string) {
  return run(async () => {
    const ctx = await requireCrm();
    const res = await searchAll(ctx, await loadMeta(), String(term ?? ''));
    return res.map((g) => ({ module: g.module, label: g.label, rows: g.rows.map((r) => ({ id: r.id, name: r.name })) }));
  });
}

// ---- conversion / merge ---------------------------------------------------

export async function crmConvertLead(input: ConvertLeadInput) {
  return run(async () => convertLead(await requireCrm(), await loadMeta(), {
    leadId: String(input?.leadId), createDeal: !!input?.createDeal,
    deal: input?.deal ? {
      name: input.deal.name ? String(input.deal.name).slice(0, 255) : undefined,
      amount: typeof input.deal.amount === 'number' && Number.isFinite(input.deal.amount) ? input.deal.amount : null,
      closing_date: input.deal.closing_date ? String(input.deal.closing_date).slice(0, 10) : null,
      pipeline: input.deal.pipeline ? String(input.deal.pipeline) : undefined,
      stage: input.deal.stage ? String(input.deal.stage) : undefined,
    } : undefined,
    contactId: isUuid(input?.contactId) ? input.contactId : null,
    accountId: isUuid(input?.accountId) ? input.accountId : null,
  }));
}

export async function crmConvertDoc(from: 'quotes' | 'sales_orders', id: string) {
  return run(async () => {
    if (from !== 'quotes' && from !== 'sales_orders') throw new CrmUserError('Unknown conversion.');
    return convertDocument(await requireCrm(), await loadMeta(), from, String(id));
  });
}

export async function crmFindDuplicates(module: string, id: string) {
  return run(async () => {
    const rows = await findDuplicates(await requireCrm(), await loadMeta(), String(module), String(id));
    return rows.map((r) => ({ id: r.id, name: r.name, data: r.data, external_key: r.external_key, updated_at: r.updated_at }));
  });
}

export async function crmMerge(module: string, masterId: string, otherIds: string[], picks: Record<string, string>) {
  return run(async () => mergeRecords(await requireCrm(), await loadMeta(), String(module), String(masterId), ids(otherIds), Object.fromEntries(Object.entries(obj(picks)).filter(([, v]) => isUuid(v)) as Array<[string, string]>)));
}

// ---- notes / attachments ----------------------------------------------------

export async function crmAddNote(recordId: string, body: string) {
  return run(async () => addNote(await requireCrm(), await loadMeta(), String(recordId), String(body ?? '')));
}

export async function crmDeleteNote(noteId: string) {
  return run(async () => deleteNote(await requireCrm(), await loadMeta(), String(noteId)));
}

export async function crmUpload(form: FormData) {
  return run(async () => {
    const file = form.get('file');
    const recordId = String(form.get('recordId') ?? '');
    if (!(file instanceof File)) throw new CrmUserError('Choose a file.');
    return addAttachment(await requireCrm(), await loadMeta(), recordId, file);
  });
}

export async function crmAttachmentUrl(id: string) {
  return run(async () => attachmentUrl(await requireCrm(), await loadMeta(), String(id)));
}

export async function crmDeleteAttachment(id: string) {
  return run(async () => deleteAttachment(await requireCrm(), await loadMeta(), String(id)));
}

// ---- views / import / export -----------------------------------------------

export async function crmSaveView(input: { id?: string | null; module: string; name: string; shared?: boolean; config: ViewConfig }) {
  return run(async () => saveView(await requireCrm(), await loadMeta(), {
    id: isUuid(input?.id) ? input.id : null, module: String(input?.module), name: String(input?.name ?? ''), shared: !!input?.shared, config: obj(input?.config) as ViewConfig,
  }));
}

export async function crmDeleteView(id: string) {
  return run(async () => deleteConfig(await requireCrm(), String(id), 'view'));
}

export async function crmExport(module: string, criteria: Criteria | null) {
  return run(async () => exportCsv(await requireCrm(), await loadMeta(), String(module), criteria ?? null));
}

export async function crmImport(module: string, text: string, filename: string, opts: ImportOptions) {
  return run(async () => {
    if (typeof text !== 'string') throw new CrmUserError('Upload a CSV file.');
    const o = obj(opts);
    return importCsv(await requireCrm(), await loadMeta(), String(module), text, String(filename ?? 'import.csv'), {
      mapping: obj(o.mapping) as Record<number, string>,
      dupMode: o.dupMode === 'update' || o.dupMode === 'add' ? o.dupMode : 'skip',
      matchBy: o.matchBy === 'name' ? 'name' : 'email',
      ownerId: isUuid(o.ownerId) ? (o.ownerId as string) : null,
      useAssignment: o.useAssignment === true,
    });
  });
}

export async function crmUndoImport(importId: string) {
  return run(async () => undoImport(await requireCrm(), await loadMeta(), String(importId)));
}

// ---- sync / notifications ---------------------------------------------------

export async function crmSyncNow() {
  return run(async () => {
    const ctx = await requireCrm();
    if (!canSetup(ctx, 'manage_data')) throw new CrmAccessError('Only admins can run the sync.');
    return runSync(createServiceClient(), 'manual', ctx.userId);
  });
}

export async function crmMarkNotificationsRead() {
  return run(async () => {
    const ctx = await requireCrm();
    await createServiceClient().from('crm_notifications').update({ read_at: new Date().toISOString() }).eq('user_id', ctx.userId).is('read_at', null);
    return null;
  });
}
