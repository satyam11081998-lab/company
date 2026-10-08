/**
 * Notes and attachments on a record. Both require access to the parent
 * record; editing/deleting a note is limited to its author (or an admin).
 * Attachments live in the private `crm-attachments` bucket and are served
 * only through short-lived signed URLs, as downloads.
 */
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/crm/server/svc';
import { isUuid } from '@/lib/crm/fields';
import { allows } from '@/lib/crm/permissions';
import type { CrmContext } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { audit } from './db';
import { accessTo, loadRecordRaw } from './records';
import type { Meta } from './meta';

const MAX_ATTACHMENT = 10 * 1024 * 1024;
const BLOCKED_EXT = /\.(exe|bat|cmd|com|scr|msi|js|vbs|ps1|sh|jar|apk|dll|html?|svg|xhtml)$/i;

async function parent(ctx: CrmContext, meta: Meta, recordId: string, need: 'read' | 'rw') {
  if (!isUuid(recordId)) throw new CrmAccessError('Record not found.');
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, recordId);
  if (!rec || rec.deleted_at) throw new CrmAccessError('Record not found.');
  const level = accessTo(ctx, meta, rec);
  if (!level) throw new CrmAccessError('Record not found.');
  if (!allows(level, need)) throw new CrmAccessError('You can only view this record.');
  return { svc, rec };
}

export async function listNotes(ctx: CrmContext, meta: Meta, recordId: string) {
  const { svc } = await parent(ctx, meta, recordId, 'read');
  const { data } = await svc.from('crm_notes').select('id, body, created_by, created_at, updated_at').eq('record_id', recordId).is('deleted_at', null).order('created_at', { ascending: false }).limit(200);
  return (data ?? []) as Array<{ id: string; body: string; created_by: string | null; created_at: string; updated_at: string }>;
}

export async function addNote(ctx: CrmContext, meta: Meta, recordId: string, body: string) {
  const text = String(body ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (!text) throw new CrmUserError('Write something first.');
  if (text.length > 32000) throw new CrmUserError('Notes can be at most 32,000 characters.');
  const { svc, rec } = await parent(ctx, meta, recordId, 'rw');
  const { data, error } = await svc.from('crm_notes').insert({ record_id: recordId, body: text, created_by: ctx.userId }).select('id').single();
  if (error) throw error;
  await svc.from('crm_records').update({ last_activity_at: new Date().toISOString() }).eq('id', recordId);
  await audit(svc, { actor_id: ctx.userId, action: 'note_add', module: rec.module, record_id: recordId });
  return (data as { id: string }).id;
}

export async function deleteNote(ctx: CrmContext, meta: Meta, noteId: string) {
  if (!isUuid(noteId)) throw new CrmAccessError('Note not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_notes').select('id, record_id, created_by').eq('id', noteId).is('deleted_at', null).maybeSingle();
  const n = data as { id: string; record_id: string; created_by: string | null } | null;
  if (!n) throw new CrmAccessError('Note not found.');
  const { rec } = await parent(ctx, meta, n.record_id, 'rw');
  if (!ctx.superAdmin && n.created_by !== ctx.userId) throw new CrmAccessError('Only the author or an admin can delete a note.');
  await svc.from('crm_notes').update({ deleted_at: new Date().toISOString() }).eq('id', noteId);
  await audit(svc, { actor_id: ctx.userId, action: 'note_delete', module: rec.module, record_id: n.record_id });
}

export async function listAttachments(ctx: CrmContext, meta: Meta, recordId: string) {
  const { svc } = await parent(ctx, meta, recordId, 'read');
  const { data } = await svc.from('crm_attachments').select('id, filename, mime, size_bytes, created_by, created_at').eq('record_id', recordId).is('deleted_at', null).order('created_at', { ascending: false });
  return (data ?? []) as Array<{ id: string; filename: string; mime: string | null; size_bytes: number; created_by: string | null; created_at: string }>;
}

export async function addAttachment(ctx: CrmContext, meta: Meta, recordId: string, file: File) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new CrmUserError('Choose a file.');
  if (file.size > MAX_ATTACHMENT) throw new CrmUserError('Files can be at most 10 MB.');
  const safeName = String(file.name || 'file').replace(/[^\w.\- ]+/g, '_').slice(-120) || 'file';
  if (BLOCKED_EXT.test(safeName)) throw new CrmUserError('That file type can’t be attached (executables, scripts and web pages are blocked).');
  const { svc, rec } = await parent(ctx, meta, recordId, 'rw');
  const path = `${recordId}/${randomUUID()}-${safeName}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await svc.storage.from('crm-attachments').upload(path, buf, { contentType: 'application/octet-stream', upsert: false });
  if (up.error) throw up.error;
  const { error } = await svc.from('crm_attachments').insert({ record_id: recordId, storage_path: path, filename: safeName, mime: file.type?.slice(0, 100) || null, size_bytes: file.size, created_by: ctx.userId });
  if (error) throw error;
  await audit(svc, { actor_id: ctx.userId, action: 'attachment_add', module: rec.module, record_id: recordId, meta: { filename: safeName, size: file.size } });
}

export async function attachmentUrl(ctx: CrmContext, meta: Meta, attachmentId: string) {
  if (!isUuid(attachmentId)) throw new CrmAccessError('File not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_attachments').select('record_id, storage_path, filename').eq('id', attachmentId).is('deleted_at', null).maybeSingle();
  const a = data as { record_id: string; storage_path: string; filename: string } | null;
  if (!a) throw new CrmAccessError('File not found.');
  await parent(ctx, meta, a.record_id, 'read');
  const { data: signed, error } = await svc.storage.from('crm-attachments').createSignedUrl(a.storage_path, 60, { download: a.filename });
  if (error || !signed) throw new CrmUserError('Could not open the file.');
  return signed.signedUrl;
}

export async function deleteAttachment(ctx: CrmContext, meta: Meta, attachmentId: string) {
  if (!isUuid(attachmentId)) throw new CrmAccessError('File not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_attachments').select('record_id, storage_path, created_by').eq('id', attachmentId).is('deleted_at', null).maybeSingle();
  const a = data as { record_id: string; storage_path: string; created_by: string | null } | null;
  if (!a) throw new CrmAccessError('File not found.');
  const { rec } = await parent(ctx, meta, a.record_id, 'rw');
  if (!ctx.superAdmin && a.created_by !== ctx.userId) throw new CrmAccessError('Only the uploader or an admin can remove a file.');
  await svc.from('crm_attachments').update({ deleted_at: new Date().toISOString() }).eq('id', attachmentId);
  await svc.storage.from('crm-attachments').remove([a.storage_path]);
  await audit(svc, { actor_id: ctx.userId, action: 'attachment_delete', module: rec.module, record_id: a.record_id });
}
