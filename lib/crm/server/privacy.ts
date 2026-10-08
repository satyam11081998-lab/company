/**
 * DPDP Act 2023 tooling (server half). Pure rules are in lib/crm/privacy.ts.
 *
 *  - Consent ledger: every grant/withdrawal is a new crm_consents row (never
 *    edited); the record's consent fields mirror the latest state so views,
 *    segments, workflows and the outbox can use it.
 *  - Rights requests (s.11–14): access export, correction task, erasure,
 *    restriction, consent withdrawal, grievance and nomination — each with a
 *    due date and an audited resolution.
 *  - Erasure: personal fields blanked (financial facts kept for tax law),
 *    notes/attachments deleted, audit rows redacted, outbox redacted, email
 *    hash blocklisted so sync/import/email can't bring the person back.
 *  - Breach register with the 72-hour clock.
 *
 * Everything here needs the `manage_privacy` setup permission, except
 * recording a consent withdrawal, which anyone who can edit the record may do
 * (withdrawing must be as easy as giving — s.6(4)).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/crm/server/svc';
import { isUuid } from '@/lib/crm/fields';
import { allows, canSetup } from '@/lib/crm/permissions';
import {
  PURPOSES, REQUEST_KINDS, breachClock, consentState, dueAt, erasurePatch, type Purpose, type RequestKind,
} from '@/lib/crm/privacy';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { blocklistHash } from './blocklist';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, normalizeRecord } from './db';
import { isActiveMember, loadMembers } from './members';
import type { Meta } from './meta';
import { accessTo, createRecord, loadRecordRaw, notify } from './records';

const PERSON_MODULES = ['contacts', 'leads'];
const FIELD_OF: Partial<Record<Purpose, string>> = { marketing: 'consent_marketing', ai_profiling: 'consent_profiling' };
const LABEL_OF = { given: 'Given', withdrawn: 'Withdrawn', pending: 'Pending' } as const;
const AI_FIELDS: Record<string, string[]> = { contacts: ['health_score', 'churn_risk', 'next_best_action'], leads: ['conversion_probability'] };
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function need(ctx: CrmContext) {
  if (!canSetup(ctx, 'manage_privacy')) throw new CrmAccessError('You don’t have permission to manage privacy.');
}

// ---------------------------------------------------------------------------
// Consent ledger
// ---------------------------------------------------------------------------

export interface ConsentInput {
  recordId?: string | null;
  email?: string | null;
  purpose: Purpose;
  status: 'given' | 'withdrawn' | 'pending';
  notice?: string | null;
  noticeVersion?: string | null;
  channel: 'webform' | 'manual' | 'import' | 'email' | 'in_app' | 'api' | 'survey';
  evidence?: Record<string, unknown>;
  actorId?: string | null;
}

/** Trusted writer (callers have authorised). Appends to the ledger and mirrors the record's consent field. */
export async function recordConsent(svc: SupabaseClient, input: ConsentInput) {
  if (!(PURPOSES as readonly string[]).includes(input.purpose)) throw new CrmUserError('Unknown purpose.');
  if (!['given', 'withdrawn', 'pending'].includes(input.status)) throw new CrmUserError('Unknown consent status.');
  const rec = input.recordId ? await loadRecordRaw(svc, input.recordId) : null;
  const email = (input.email ?? (rec ? (rec.data.email as string | undefined) : null) ?? null) || null;
  await svc.from('crm_consents').insert({
    record_id: rec?.id ?? null,
    email_hash: email ? blocklistHash(email) : null,
    purpose: input.purpose,
    status: input.status,
    notice: input.notice?.slice(0, 2000) ?? null,
    notice_version: input.noticeVersion?.slice(0, 40) ?? null,
    channel: input.channel,
    evidence: input.evidence ?? {},
    created_by: input.actorId ?? null,
  });
  if (!rec) return;
  const patch: Record<string, unknown> = {};
  const field = FIELD_OF[input.purpose];
  if (field && PERSON_MODULES.includes(rec.module)) patch[field] = LABEL_OF[input.status];
  if (input.status === 'given' && rec.data.data_basis !== 'Consent' && rec.data.data_basis !== 'Legitimate use (s.7)') patch.data_basis = 'Consent';
  if (input.purpose === 'ai_profiling' && input.status === 'withdrawn') for (const f of AI_FIELDS[rec.module] ?? []) patch[f] = null;
  if (Object.keys(patch).length) await svc.rpc('crm_merge_data', { p_rows: [{ id: rec.id, data: patch }] });
  if (input.purpose === 'marketing' && input.status === 'withdrawn') {
    // pending/approved marketing mail for this person is cancelled now, not just at send time
    await svc.from('crm_outbox').update({ status: 'cancelled', status_reason: 'marketing consent withdrawn' }).eq('record_id', rec.id).eq('category', 'marketing').in('status', ['pending', 'approved']);
    await svc.from('crm_cadence_enrollments').update({ status: 'exited' }).eq('record_id', rec.id).eq('status', 'active');
    // ...and the app's own broadcasts stop too (they read users.marketing_opt_out). Never switched back on automatically.
    if (rec.mece_user_id) await svc.from('users').update({ marketing_opt_out: true }).eq('id', rec.mece_user_id);
  }
  await audit(svc, { actor_id: input.actorId ?? null, actor_kind: input.actorId ? 'user' : input.channel === 'webform' ? 'public' : 'system', action: 'consent', module: rec.module, record_id: rec.id, meta: { purpose: input.purpose, status: input.status, channel: input.channel } });
}

/** A CRM user records consent captured elsewhere (call, email, paper). */
export async function setConsent(ctx: CrmContext, meta: Meta, input: { recordId: string; purpose: string; status: string; notice?: string; channel?: string }) {
  if (!isUuid(input.recordId)) throw new CrmAccessError('Record not found.');
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, input.recordId);
  if (!rec || rec.deleted_at || !PERSON_MODULES.includes(rec.module)) throw new CrmAccessError('Record not found.');
  const access = accessTo(ctx, meta, rec);
  if (!access) throw new CrmAccessError('Record not found.');
  if (rec.locked?.kind === 'dpdp_erased') throw new CrmUserError('This person’s data was erased.');
  const status = input.status as ConsentInput['status'];
  if (!['given', 'withdrawn', 'pending'].includes(status)) throw new CrmUserError('Pick a consent status.');
  if (!(PURPOSES as readonly string[]).includes(input.purpose)) throw new CrmUserError('Pick a purpose.');
  // withdrawing is open to anyone who can edit the record; granting needs evidence and the privacy permission or edit access
  if (!allows(access, 'rw') && !canSetup(ctx, 'manage_privacy')) throw new CrmAccessError('You can only view this record.');
  const notice = String(input.notice ?? '').trim();
  if (status === 'given' && notice.length < 10) throw new CrmUserError('Note how and when consent was given (the notice shown or the conversation).');
  const channel = (['manual', 'email', 'in_app'].includes(String(input.channel)) ? input.channel : 'manual') as ConsentInput['channel'];
  await recordConsent(svc, { recordId: rec.id, purpose: input.purpose as Purpose, status, notice: notice || null, channel, actorId: ctx.userId });
}

export async function consentHistory(ctx: CrmContext, meta: Meta, recordId: string) {
  if (!isUuid(recordId)) throw new CrmAccessError('Record not found.');
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, recordId);
  if (!rec || !accessTo(ctx, meta, rec)) throw new CrmAccessError('Record not found.');
  const { data } = await svc.from('crm_consents').select('id, purpose, status, notice, notice_version, channel, created_by, created_at').eq('record_id', recordId).order('created_at', { ascending: false }).limit(200);
  const rows = (data ?? []) as Array<{ purpose: string; status: string; created_at: string; created_by: string | null }>;
  const members = await loadMembers();
  const { data: reqs } = canSetup(ctx, 'manage_privacy')
    ? await svc.from('crm_privacy_requests').select('id, kind, status, due_at, created_at').eq('record_id', recordId).order('created_at', { ascending: false }).limit(20)
    : { data: [] };
  return {
    state: consentState(rows),
    ledger: rows.map((r) => ({ ...r, by: r.created_by ? members.find((m) => m.id === r.created_by)?.name ?? 'Former user' : null })),
    restricted: rec.locked?.kind === 'dpdp_restricted',
    erased: rec.locked?.kind === 'dpdp_erased',
    basis: rec.data.data_basis ?? null,
    requests: reqs ?? [],
    canManage: canSetup(ctx, 'manage_privacy'),
  };
}

// ---------------------------------------------------------------------------
// Rights requests
// ---------------------------------------------------------------------------

interface RequestRow {
  id: string; kind: RequestKind; status: string; requester_email: string | null; record_id: string | null; details: string | null;
  due_at: string | null; resolution: string | null; created_at: string; updated_at: string; completed_at: string | null; created_by: string | null; completed_by: string | null;
}

async function loadRequest(svc: SupabaseClient, id: string): Promise<RequestRow> {
  if (!isUuid(id)) throw new CrmAccessError('Request not found.');
  const { data } = await svc.from('crm_privacy_requests').select('*').eq('id', id).maybeSingle();
  if (!data) throw new CrmAccessError('Request not found.');
  return data as RequestRow;
}

export async function createRequest(ctx: CrmContext, meta: Meta, input: { kind: string; requesterEmail?: string; recordId?: string | null; details?: string }) {
  need(ctx);
  const kind = input.kind as RequestKind;
  if (!(REQUEST_KINDS as readonly string[]).includes(kind)) throw new CrmUserError('Pick the type of request.');
  const email = String(input.requesterEmail ?? '').trim().toLowerCase().slice(0, 254) || null;
  if (email && !EMAIL_RE.test(email)) throw new CrmUserError('That email address doesn’t look right.');
  const svc = createServiceClient();
  let recordId: string | null = null;
  if (input.recordId) {
    const rec = isUuid(input.recordId) ? await loadRecordRaw(svc, input.recordId) : null;
    if (!rec || !PERSON_MODULES.includes(rec.module)) throw new CrmUserError('Link the request to a contact or lead.');
    recordId = rec.id;
  } else if (email) {
    const { data } = await svc.from('crm_records').select('id').in('module', PERSON_MODULES).is('deleted_at', null).eq('data->>email', email).order('module').limit(1);
    recordId = (data?.[0] as { id?: string } | undefined)?.id ?? null;
  }
  if (!email && !recordId) throw new CrmUserError('Give the requester’s email or link a contact.');
  const details = String(input.details ?? '').trim().slice(0, 4000) || null;
  const { data, error } = await svc.from('crm_privacy_requests').insert({ kind, requester_email: email, record_id: recordId, details, due_at: dueAt(kind), created_by: ctx.userId }).select('id').single();
  if (error) throw error;
  const id = (data as { id: string }).id;
  await audit(svc, { actor_id: ctx.userId, action: 'privacy_request', module: 'privacy', record_id: recordId, meta: { id, kind } });
  void meta;
  return id;
}

export async function listRequests(ctx: CrmContext, filter: { status?: string } = {}) {
  need(ctx);
  const svc = createServiceClient();
  let q = svc.from('crm_privacy_requests').select('*').order('created_at', { ascending: false }).limit(500);
  if (filter.status && ['open', 'in_progress', 'completed', 'rejected'].includes(filter.status)) q = q.eq('status', filter.status);
  const { data } = await q;
  const rows = (data ?? []) as RequestRow[];
  const recIds = [...new Set(rows.map((r) => r.record_id).filter(Boolean))] as string[];
  const { data: recs } = recIds.length ? await svc.from('crm_records').select('id, module, name').in('id', recIds) : { data: [] };
  const byId = new Map(((recs ?? []) as Array<{ id: string; module: string; name: string }>).map((r) => [r.id, r]));
  const now = Date.now();
  return rows.map((r) => ({ ...r, record: r.record_id ? byId.get(r.record_id) ?? null : null, overdue: !['completed', 'rejected'].includes(r.status) && !!r.due_at && new Date(r.due_at).getTime() < now }));
}

export async function updateRequest(ctx: CrmContext, id: string, patch: { status?: string; resolution?: string }) {
  need(ctx);
  const svc = createServiceClient();
  const req = await loadRequest(svc, id);
  const status = patch.status && ['open', 'in_progress', 'completed', 'rejected'].includes(patch.status) ? patch.status : req.status;
  const resolution = patch.resolution !== undefined ? String(patch.resolution).trim().slice(0, 4000) || null : req.resolution;
  if ((status === 'completed' || status === 'rejected') && !resolution) throw new CrmUserError('Write the resolution sent to the person before closing the request.');
  const done = status === 'completed' || status === 'rejected';
  await svc.from('crm_privacy_requests').update({ status, resolution, updated_at: new Date().toISOString(), completed_at: done ? req.completed_at ?? new Date().toISOString() : null, completed_by: done ? req.completed_by ?? ctx.userId : null }).eq('id', id);
  // closing a restriction lifts it
  if (done && req.kind === 'restrict') await liftRestriction(svc, ctx.userId, req);
  await audit(svc, { actor_id: ctx.userId, action: 'privacy_request_update', module: 'privacy', record_id: req.record_id, meta: { id, status } });
}

/** People records (by link and by email) and their dependent records. */
async function scopeOf(svc: SupabaseClient, meta: Meta, req: RequestRow, includeDeleted: boolean) {
  const primaries = new Map<string, CrmRecord>();
  if (req.record_id) { const r = await loadRecordRaw(svc, req.record_id); if (r) primaries.set(r.id, r); }
  const emails = new Set<string>();
  if (req.requester_email) emails.add(req.requester_email.toLowerCase());
  for (const r of primaries.values()) if (typeof r.data.email === 'string' && r.data.email) emails.add(r.data.email.toLowerCase());
  for (const e of emails) {
    let q = svc.from('crm_records').select(RECORD_COLS).in('module', PERSON_MODULES).ilike('data->>email', e.replace(/[\\%_]/g, (c) => '\\' + c)).limit(50);
    if (!includeDeleted) q = q.is('deleted_at', null);
    const { data } = await q;
    for (const row of (data ?? []) as Array<Record<string, unknown>>) { const r = normalizeRecord(row); primaries.set(r.id, r); }
  }
  for (const r of primaries.values()) if (typeof r.data.email === 'string' && r.data.email) emails.add(r.data.email.toLowerCase());

  // dependents: anything that looks up a primary, activities related to one, and cases filed from one of the emails
  const lookupFields = new Map<string, string[]>();
  for (const m of meta.modules) {
    const fs = meta.fields(m.api_name).filter((f) => (f.type === 'lookup' && PERSON_MODULES.includes(String(f.options?.module))) || f.type === 'related').map((f) => (f.type === 'related' ? `data->${f.api_name}->>id` : `data->>${f.api_name}`));
    if (fs.length) lookupFields.set(m.api_name, fs);
  }
  const dependents = new Map<string, CrmRecord>();
  const ids = [...primaries.keys()];
  const meceIds = [...new Set([...primaries.values()].map((r) => r.mece_user_id).filter(Boolean))] as string[];
  for (const [module, fs] of lookupFields) {
    for (const path of fs) {
      if (!ids.length) break;
      let q = svc.from('crm_records').select(RECORD_COLS).eq('module', module).in(path, ids).limit(2000);
      if (!includeDeleted) q = q.is('deleted_at', null);
      const { data } = await q;
      for (const row of (data ?? []) as Array<Record<string, unknown>>) { const r = normalizeRecord(row); if (!primaries.has(r.id)) dependents.set(r.id, r); }
    }
  }
  if (meceIds.length) {
    let q = svc.from('crm_records').select(RECORD_COLS).in('mece_user_id', meceIds).limit(5000);
    if (!includeDeleted) q = q.is('deleted_at', null);
    const { data } = await q;
    for (const row of (data ?? []) as Array<Record<string, unknown>>) { const r = normalizeRecord(row); if (!primaries.has(r.id)) dependents.set(r.id, r); }
  }
  for (const e of emails) {
    const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('module', 'cases').ilike('data->>reporter_email', e.replace(/[\\%_]/g, (c) => '\\' + c)).limit(500);
    for (const row of (data ?? []) as Array<Record<string, unknown>>) { const r = normalizeRecord(row); if (!primaries.has(r.id)) dependents.set(r.id, r); }
  }
  return { primaries: [...primaries.values()], dependents: [...dependents.values()], emails: [...emails] };
}

async function markInProgress(svc: SupabaseClient, req: RequestRow) {
  if (req.status === 'open') await svc.from('crm_privacy_requests').update({ status: 'in_progress', updated_at: new Date().toISOString() }).eq('id', req.id);
}

/** s.11 — a summary of the personal data held and how it was processed. Returns a JSON document to send to the person. */
export async function accessExport(ctx: CrmContext, meta: Meta, requestId: string) {
  need(ctx);
  const svc = createServiceClient();
  const req = await loadRequest(svc, requestId);
  const { primaries, dependents } = await scopeOf(svc, meta, req, false);
  if (!primaries.length && !dependents.length) throw new CrmUserError('No records match this request.');
  const all = [...primaries, ...dependents];
  const ids = all.map((r) => r.id);
  const label = (m: string, f: string) => meta.field(m, f)?.label ?? f;
  const show = (r: CrmRecord) => ({
    type: meta.module(r.module)?.singular ?? r.module,
    name: r.name,
    created: r.created_at,
    updated: r.updated_at,
    fields: Object.fromEntries(Object.entries(r.data).filter(([, v]) => v !== null && v !== '' && v !== undefined).map(([k, v]) => [label(r.module, k), v])),
  });
  const [notes, consents, outbox, surveys, forms] = await Promise.all([
    svc.from('crm_notes').select('record_id, body, created_at').in('record_id', ids).is('deleted_at', null).limit(2000),
    svc.from('crm_consents').select('record_id, purpose, status, notice, channel, created_at').in('record_id', ids).order('created_at').limit(2000),
    svc.from('crm_outbox').select('record_id, subject, category, status, sent_at, created_at').in('record_id', ids).order('created_at').limit(2000),
    svc.from('crm_survey_responses').select('record_id, kind, score, comment, answered_at').in('record_id', ids).not('answered_at', 'is', null).limit(500),
    svc.from('crm_form_submissions').select('record_id, created_at, consent').in('record_id', ids).limit(500),
  ]);
  const doc = {
    title: 'Personal data held by MECE (CRM)',
    generated_at: new Date().toISOString(),
    request: { id: req.id, kind: req.kind, received: req.created_at },
    purposes: 'Providing the MECE service, support, billing records, and — only where consent was given — marketing emails and AI-based recommendations.',
    shared_with: 'Service providers who process data for MECE: Supabase (database), Vercel (website hosting), Resend / Google Workspace (email), Razorpay (payments), OpenAI / Google (AI features in the product).',
    records: all.map(show),
    notes: (notes.data ?? []).map((n) => ({ ...(n as object) })),
    consent_history: consents.data ?? [],
    emails_sent: outbox.data ?? [],
    survey_answers: surveys.data ?? [],
    web_form_submissions: forms.data ?? [],
  };
  await markInProgress(svc, req);
  await audit(svc, { actor_id: ctx.userId, action: 'privacy_access_export', module: 'privacy', record_id: req.record_id, meta: { id: req.id, records: all.length } });
  return { filename: `personal-data-${req.id.slice(0, 8)}.json`, json: JSON.stringify(doc, null, 2) };
}

/** s.12 — erasure. Irreversible: the caller must type ERASE. */
export async function erase(ctx: CrmContext, meta: Meta, requestId: string, confirm: string) {
  need(ctx);
  if (confirm !== 'ERASE') throw new CrmUserError('Type ERASE to confirm. This can’t be undone.');
  const svc = createServiceClient();
  const req = await loadRequest(svc, requestId);
  if (req.kind !== 'erasure') throw new CrmUserError('This is not an erasure request.');
  if (req.status === 'completed' || req.status === 'rejected') throw new CrmUserError('This request is already closed.');
  const { primaries, dependents, emails } = await scopeOf(svc, meta, req, true);
  if (!primaries.length && !dependents.length && !emails.length) throw new CrmUserError('No records match this request.');
  const now = new Date().toISOString();
  const all = [...primaries, ...dependents];
  for (const r of all) {
    const mod = meta.module(r.module);
    const fields = meta.fields(r.module);
    const nameFields = mod?.settings.nameFields ?? [];
    const patch = erasurePatch(fields, r.data, nameFields);
    const data = { ...r.data, ...patch };
    for (const f of AI_FIELDS[r.module] ?? []) data[f] = null;
    if (PERSON_MODULES.includes(r.module)) { data.consent_marketing = 'Withdrawn'; data.consent_profiling = 'Withdrawn'; }
    const name = nameFields.map((k) => data[k]).filter((v) => v !== null && v !== undefined && v !== '').join(' ').trim() || '[erased]';
    const { error } = await svc.from('crm_records').update({
      data, name: name.slice(0, 255), tags: [], shared_with: [], updated_at: now, updated_by: ctx.userId,
      locked: { kind: 'dpdp_erased', reason: `Erased under privacy request ${req.id.slice(0, 8)}`, by: ctx.userId, at: now },
    }).eq('id', r.id);
    if (error) throw error;
  }
  const ids = all.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { data: atts } = await svc.from('crm_attachments').select('id, storage_path').in('record_id', chunk);
    const paths = ((atts ?? []) as Array<{ storage_path: string }>).map((a) => a.storage_path);
    if (paths.length) await svc.storage.from('crm-attachments').remove(paths);
    await svc.from('crm_attachments').delete().in('record_id', chunk);
    await svc.from('crm_notes').delete().in('record_id', chunk);
    await svc.from('crm_ai_feedback').delete().in('record_id', chunk);
    await svc.from('crm_outbox').update({ status: 'cancelled', status_reason: 'erased (privacy request)' }).in('record_id', chunk).in('status', ['pending', 'approved']);
    await svc.from('crm_outbox').update({ to_email: '[erased]', to_name: null, subject: '[erased]', html: '', text_body: null }).in('record_id', chunk);
    await svc.from('crm_survey_responses').update({ comment: null }).in('record_id', chunk);
    await svc.from('crm_cadence_enrollments').update({ status: 'exited' }).in('record_id', chunk).eq('status', 'active');
    await svc.from('crm_jobs').update({ status: 'cancelled' }).in('record_id', chunk).eq('status', 'pending');
    await svc.from('crm_approvals').update({ status: 'cancelled' }).in('record_id', chunk).eq('status', 'pending');
    await svc.from('crm_records').update({ approval_status: null }).in('id', chunk).eq('approval_status', 'pending');
    // audit history keeps who/when/what-action but loses the values
    await svc.from('crm_audit').update({ changes: null, meta: null, redacted: true }).in('record_id', chunk).eq('redacted', false);
  }
  for (const e of emails) await svc.from('crm_blocklist').upsert({ email_hash: blocklistHash(e), reason: 'erasure', request_id: req.id }, { onConflict: 'email_hash' });
  // no more app broadcasts to an erased person who still has an app account
  const erasedUsers = [...new Set(primaries.map((p) => p.mece_user_id).filter(Boolean))] as string[];
  if (erasedUsers.length) await svc.from('users').update({ marketing_opt_out: true }).in('id', erasedUsers);
  const resolution = `Erased ${primaries.length} person record(s) and personal details on ${dependents.length} related record(s) on ${now.slice(0, 10)}. Amounts, dates and invoice numbers on billing records are kept as required by tax law. Notes, attachments and email contents were deleted; the email address is blocked from re-import. If the person also has a MECE app account, delete it from the app as well.`;
  await svc.from('crm_privacy_requests').update({ status: 'completed', resolution, completed_at: now, completed_by: ctx.userId, updated_at: now, requester_email: null, details: req.details ? '[erased]' : null }).eq('id', req.id);
  await audit(svc, { actor_id: ctx.userId, action: 'privacy_erasure', module: 'privacy', meta: { id: req.id, people: primaries.length, related: dependents.length } });
  return { people: primaries.length, related: dependents.length, blocked: emails.length };
}

/** Stop processing (restrict) while a request is handled: records are locked, mail stops, scoring stops. */
export async function restrict(ctx: CrmContext, meta: Meta, requestId: string) {
  need(ctx);
  const svc = createServiceClient();
  const req = await loadRequest(svc, requestId);
  if (req.status === 'completed' || req.status === 'rejected') throw new CrmUserError('This request is already closed.');
  const { primaries } = await scopeOf(svc, meta, req, false);
  if (!primaries.length) throw new CrmUserError('No contact or lead matches this request.');
  const now = new Date().toISOString();
  let n = 0;
  for (const r of primaries) {
    if (r.locked?.kind === 'dpdp_erased' || r.locked?.kind === 'converted') continue;
    // app broadcasts pause too; the previous opt-out setting is kept with the lock and restored when it lifts
    let prevOptOut: boolean | null = null;
    if (r.mece_user_id) {
      const { data: u } = await svc.from('users').select('marketing_opt_out').eq('id', r.mece_user_id).maybeSingle();
      prevOptOut = (u as { marketing_opt_out?: boolean } | null)?.marketing_opt_out ?? null;
      await svc.from('users').update({ marketing_opt_out: true }).eq('id', r.mece_user_id);
    }
    await svc.from('crm_records').update({ locked: { kind: 'dpdp_restricted', reason: `Privacy request ${req.id.slice(0, 8)}`, by: ctx.userId, at: now, prev: r.locked ?? null, request: req.id, prevOptOut }, updated_at: now }).eq('id', r.id);
    await svc.from('crm_outbox').update({ status: 'cancelled', status_reason: 'processing restricted (privacy request)' }).eq('record_id', r.id).in('status', ['pending', 'approved']);
    await svc.from('crm_cadence_enrollments').update({ status: 'paused' }).eq('record_id', r.id).eq('status', 'active');
    await audit(svc, { actor_id: ctx.userId, action: 'privacy_restrict', module: r.module, record_id: r.id, meta: { request: req.id } });
    n++;
  }
  await markInProgress(svc, req);
  return { restricted: n };
}

async function liftRestriction(svc: SupabaseClient, actorId: string, req: RequestRow) {
  const { data } = await svc.from('crm_records').select('id, module, locked, mece_user_id').eq('locked->>kind', 'dpdp_restricted').eq('locked->>request', req.id).limit(100);
  for (const r of (data ?? []) as Array<{ id: string; module: string; mece_user_id: string | null; locked: { prev?: unknown; prevOptOut?: boolean | null } }>) {
    await svc.from('crm_records').update({ locked: r.locked?.prev ?? null, updated_at: new Date().toISOString() }).eq('id', r.id);
    // restore the app's email setting only if the restriction was what turned it off
    if (r.mece_user_id && r.locked?.prevOptOut === false) await svc.from('users').update({ marketing_opt_out: false }).eq('id', r.mece_user_id);
    await svc.from('crm_cadence_enrollments').update({ status: 'active' }).eq('record_id', r.id).eq('status', 'paused');
    await audit(svc, { actor_id: actorId, action: 'privacy_unrestrict', module: r.module, record_id: r.id, meta: { request: req.id } });
  }
}

/** s.6(4) — withdraw consent for the chosen purposes on every matching record. */
export async function withdrawFor(ctx: CrmContext, meta: Meta, requestId: string, purposes: string[]) {
  need(ctx);
  const svc = createServiceClient();
  const req = await loadRequest(svc, requestId);
  const ps = purposes.filter((p) => (PURPOSES as readonly string[]).includes(p)) as Purpose[];
  if (!ps.length) throw new CrmUserError('Pick at least one purpose.');
  const { primaries, emails } = await scopeOf(svc, meta, req, false);
  for (const r of primaries) for (const p of ps) await recordConsent(svc, { recordId: r.id, purpose: p, status: 'withdrawn', channel: 'email', notice: `Withdrawn on request ${req.id.slice(0, 8)}`, actorId: ctx.userId, evidence: { request: req.id } });
  if (!primaries.length) for (const e of emails) for (const p of ps) await recordConsent(svc, { email: e, purpose: p, status: 'withdrawn', channel: 'email', actorId: ctx.userId, evidence: { request: req.id } });
  await markInProgress(svc, req);
  return { records: primaries.length };
}

/** s.12 — correction: a task for the record owner with what to fix. */
export async function correctionTask(ctx: CrmContext, meta: Meta, requestId: string) {
  need(ctx);
  const svc = createServiceClient();
  const req = await loadRequest(svc, requestId);
  const { primaries } = await scopeOf(svc, meta, req, false);
  const target = primaries[0];
  if (!target) throw new CrmUserError('Link the request to a contact or lead first.');
  const due = new Date(Math.min(new Date(req.due_at ?? Date.now() + 7 * 86_400_000).getTime(), Date.now() + 7 * 86_400_000)).toISOString().slice(0, 10);
  const task = await createRecord(null, meta, 'tasks', {
    subject: `Privacy: correct personal data for ${target.name}`.slice(0, 255), due_date: due, priority: 'High', status: 'Not started',
    related_to: { module: target.module, id: target.id }, description: `Correction request ${req.id.slice(0, 8)}:\n${req.details ?? '(see request)'}`,
  }, { actorKind: 'system', source: 'system', ownerId: (await isActiveMember(target.owner_id)) ? target.owner_id : (await isActiveMember(ctx.userId)) ? ctx.userId : null, allowDuplicate: true, actorIdOverride: ctx.userId });
  if (target.owner_id && target.owner_id !== ctx.userId) await notify(svc, target.owner_id, 'privacy', 'Privacy correction request', target.name, `/crm/m/tasks/${task.id}`);
  await markInProgress(svc, req);
  return { taskId: task.id };
}

// ---------------------------------------------------------------------------
// Breaches
// ---------------------------------------------------------------------------

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export async function saveBreach(ctx: CrmContext, input: { id?: string | null; title: string; description?: string; detectedAt: string; dataCategories?: string[]; peopleAffected?: number | null; severity?: string; status?: string; boardNotifiedAt?: string | null; principalsNotifiedAt?: string | null; actionsTaken?: string }) {
  need(ctx);
  const title = String(input.title ?? '').trim().slice(0, 200);
  if (title.length < 3) throw new CrmUserError('Give the breach a short title.');
  const t = (v: unknown) => { if (!v) return null; const d = new Date(String(v)); if (Number.isNaN(d.getTime())) throw new CrmUserError('A date is not valid.'); if (d.getTime() > Date.now() + 3_600_000) throw new CrmUserError('Dates can’t be in the future.'); return d.toISOString(); };
  const detected = t(input.detectedAt);
  if (!detected) throw new CrmUserError('When was it detected?');
  const row = {
    title,
    description: String(input.description ?? '').slice(0, 8000) || null,
    detected_at: detected,
    data_categories: (Array.isArray(input.dataCategories) ? input.dataCategories : []).map((x) => String(x).slice(0, 40)).filter(Boolean).slice(0, 20),
    people_affected: input.peopleAffected === null || input.peopleAffected === undefined || (input.peopleAffected as unknown) === '' ? null : Math.max(0, Math.floor(Number(input.peopleAffected))) || 0,
    severity: SEVERITIES.includes(String(input.severity)) ? input.severity : 'medium',
    status: ['open', 'contained', 'closed'].includes(String(input.status)) ? input.status : 'open',
    board_notified_at: t(input.boardNotifiedAt),
    principals_notified_at: t(input.principalsNotifiedAt),
    actions_taken: String(input.actionsTaken ?? '').slice(0, 8000) || null,
    updated_at: new Date().toISOString(),
  };
  if (row.board_notified_at && row.board_notified_at < detected) throw new CrmUserError('The Board can’t be notified before the breach was detected.');
  const svc = createServiceClient();
  let id = input.id ?? null;
  if (id) {
    if (!isUuid(id)) throw new CrmAccessError('Not found.');
    const { data } = await svc.from('crm_breaches').update(row).eq('id', id).select('id');
    if (!data?.length) throw new CrmAccessError('Not found.');
  } else {
    const { data, error } = await svc.from('crm_breaches').insert({ ...row, created_by: ctx.userId }).select('id').single();
    if (error) throw error;
    id = (data as { id: string }).id;
    // everyone who manages privacy hears about a new breach at once
    const { data: admins } = await svc.from('users').select('id').eq('is_admin', true).limit(20);
    for (const a of (admins ?? []) as Array<{ id: string }>) if (a.id !== ctx.userId) await notify(svc, a.id, 'breach', `Data breach logged: ${title}`, 'Report to the Data Protection Board within 72 hours of detection.', '/crm/privacy?tab=breaches');
  }
  await audit(svc, { actor_id: ctx.userId, action: input.id ? 'breach_update' : 'breach_create', module: 'privacy', meta: { id, severity: row.severity, status: row.status } });
  return id;
}

export async function listBreaches(ctx: CrmContext) {
  need(ctx);
  const svc = createServiceClient();
  const { data } = await svc.from('crm_breaches').select('*').order('detected_at', { ascending: false }).limit(200);
  return ((data ?? []) as Array<{ detected_at: string; board_notified_at: string | null }>).map((b) => ({ ...b, clock: breachClock(b.detected_at, b.board_notified_at) }));
}

// ---------------------------------------------------------------------------
// Compliance overview
// ---------------------------------------------------------------------------

export async function complianceOverview(ctx: CrmContext) {
  need(ctx);
  const svc = createServiceClient();
  const now = new Date().toISOString();
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const base = () => svc.from('crm_records').select('id', { count: 'exact', head: true }).in('module', PERSON_MODULES).is('deleted_at', null);
  const [people, basisSet, mGiven, mWithdrawn, pWithdrawn, restricted, erased, openReq, overdue, blocked, openBreaches] = await Promise.all([
    count(base()),
    count(base().in('data->>data_basis', ['Consent', 'Legitimate use (s.7)'])),
    count(base().eq('data->>consent_marketing', 'Given')),
    count(base().eq('data->>consent_marketing', 'Withdrawn')),
    count(base().eq('data->>consent_profiling', 'Withdrawn')),
    count(base().eq('locked->>kind', 'dpdp_restricted')),
    count(svc.from('crm_records').select('id', { count: 'exact', head: true }).eq('locked->>kind', 'dpdp_erased')),
    count(svc.from('crm_privacy_requests').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress'])),
    count(svc.from('crm_privacy_requests').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']).lt('due_at', now)),
    count(svc.from('crm_blocklist').select('email_hash', { count: 'exact', head: true })),
    count(svc.from('crm_breaches').select('id', { count: 'exact', head: true }).neq('status', 'closed')),
  ]);
  const { data: late } = await svc.from('crm_breaches').select('detected_at, board_notified_at').is('board_notified_at', null).neq('status', 'closed').limit(100);
  const breachesLate = ((late ?? []) as Array<{ detected_at: string; board_notified_at: string | null }>).filter((b) => breachClock(b.detected_at, b.board_notified_at).late).length;
  const { rows: mailable } = await fetchAll<{ id: string }>((o) => svc.from('crm_outbox').select('id', o).eq('category', 'marketing').in('status', ['pending', 'approved']).order('id'), 20_000);
  return { people, basisSet, marketingGiven: mGiven, marketingWithdrawn: mWithdrawn, profilingWithdrawn: pWithdrawn, restricted, erased, openRequests: openReq, overdueRequests: overdue, blocked, openBreaches, breachesLate, pendingMarketing: mailable.length };
}
