/**
 * Import (CSV, undoable), export (CSV, formula-safe, audited) and global search.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { parseCsv, toCsv } from '@/lib/crm/csv';
import { prepareRecord } from '@/lib/crm/engine';
import { formatValue, isEmpty, isUuid } from '@/lib/crm/fields';
import { can, fieldAccess } from '@/lib/crm/permissions';
import type { Criteria, CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, fetchAll, ilikeEscape, normalizeRecord, orSafe } from './db';
import { loadMembers } from './members';
import { accessTo, getModuleOrThrow, present, queryAll, updateRecord } from './records';
import { assignOwnerFor, loadRules } from './automation';
import { validationErrors } from '@/lib/crm/automation';
import type { Meta } from './meta';
import { blockedHashes, blocklistHash } from './blocklist';

export interface ImportOptions {
  mapping: Record<number, string>;
  dupMode: 'skip' | 'update' | 'add';
  matchBy: 'email' | 'name';
  ownerId?: string | null;
  /** owner each new row by the module's assignment rule (round robin) instead of one owner */
  useAssignment?: boolean;
}

export interface ImportResult {
  importId: string;
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
}

export async function importCsv(ctx: CrmContext, meta: Meta, module: string, text: string, filename: string, opts: ImportOptions): Promise<ImportResult> {
  const mod = getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'import') || !can(ctx, module, 'create')) throw new CrmAccessError(`You can’t import ${mod.label.toLowerCase()}.`);
  if (opts.dupMode === 'update' && !can(ctx, module, 'edit')) throw new CrmAccessError('Updating existing records needs edit permission.');
  const { header, rows } = parseCsv(text);
  const fields = meta.fields(module);
  const mapping: Record<number, string> = {};
  for (const [k, v] of Object.entries(opts.mapping ?? {})) {
    const idx = Number(k);
    const f = fields.find((x) => x.api_name === v);
    if (!Number.isInteger(idx) || idx < 0 || idx >= header.length || !f) continue;
    if (fieldAccess(ctx, module, v) !== 'rw') throw new CrmUserError(`You can’t write to ${f.label}.`);
    mapping[idx] = v;
  }
  if (!Object.keys(mapping).length) throw new CrmUserError('Map at least one column to a field.');
  const owners = new Set((await loadMembers()).filter((m) => m.active).map((m) => m.id));
  const ownerId = opts.ownerId && owners.has(opts.ownerId) ? opts.ownerId : ctx.userId;
  if (!ctx.superAdmin && ownerId !== ctx.userId && !ctx.subordinateUserIds.includes(ownerId)) throw new CrmUserError('You can assign imported records only to yourself or your team.');

  const svc = createServiceClient();
  const { data: imp, error: impErr } = await svc.from('crm_imports').insert({ module, filename: filename.slice(0, 200), total: rows.length, created_by: ctx.userId }).select('id').single();
  if (impErr) throw impErr;
  const importId = (imp as { id: string }).id;

  // Existing records for duplicate matching
  const matchField = opts.matchBy === 'email' ? mod.settings.emailField : null;
  const existing = await fetchAll<Record<string, unknown>>((o) => svc.from('crm_records').select(RECORD_COLS, o).eq('module', module).is('deleted_at', null).order('id'), 50_000);
  const index = new Map<string, CrmRecord>();
  for (const r of existing.rows.map(normalizeRecord)) {
    const key = matchField ? String(r.data[matchField] ?? '').toLowerCase() : r.name.toLowerCase();
    if (key) index.set(key, r);
  }
  const uniqueFields = fields.filter((f) => f.is_unique && f.active !== false);
  const uniqueSeen = new Map<string, Set<string>>(uniqueFields.map((f) => [f.api_name, new Set(existing.rows.map((r) => String(((r.data as Record<string, unknown>) ?? {})[f.api_name] ?? '').toLowerCase()).filter(Boolean))]));

  const res: ImportResult = { importId, total: rows.length, created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  const validation = (await loadRules()).validation.filter((r) => r.config.module === module).map((r) => r.config);
  const inserts: Array<{ data: Record<string, unknown>; name: string; row: number }> = [];
  const blocked = mod.settings.emailField ? await blockedHashes(svc) : new Set<string>();
  for (let i = 0; i < rows.length; i++) {
    const patch: Record<string, unknown> = {};
    for (const [idx, field] of Object.entries(mapping)) {
      const v = rows[i][Number(idx)];
      if (!isEmpty(v)) patch[field] = v;
    }
    if (!Object.keys(patch).length) { res.skipped++; continue; }
    // people whose data was erased (DPDP) are not re-imported
    const em = mod.settings.emailField ? patch[mod.settings.emailField] : null;
    if (typeof em === 'string' && blocked.has(blocklistHash(em))) { res.skipped++; res.errors.push({ row: i + 2, message: 'Skipped: this person’s data was erased under a privacy request.' }); continue; }
    const key = matchField ? String(patch[matchField] ?? '').trim().toLowerCase() : '';
    const match = opts.dupMode !== 'add' ? (matchField ? (key ? index.get(key) : undefined) : undefined) : undefined;
    const nameMatch = !matchField && opts.dupMode !== 'add' ? findByName(index, mod.settings.nameFields, patch) : undefined;
    const hit = match ?? nameMatch;
    if (hit) {
      if (opts.dupMode === 'skip') { res.skipped++; continue; }
      try {
        if (!accessTo(ctx, meta, hit)) throw new CrmUserError('no access to the matching record');
        await updateRecord(ctx, meta, module, hit.id, patch, { source: 'import', sourceRef: importId, skipAutomation: true, allowDuplicate: true });
        res.updated++;
      } catch (e) {
        res.failed++;
        res.errors.push({ row: i + 2, message: (e as Error).message.slice(0, 300) });
      }
      continue;
    }
    const prep = prepareRecord({ module: mod, fields, existing: null, patch, ctx, pipelines: meta.pipelines, defaultPipeline: meta.defaultPipeline()?.name });
    const dupErr = uniqueFields.find((f) => !isEmpty(prep.data[f.api_name]) && uniqueSeen.get(f.api_name)!.has(String(prep.data[f.api_name]).toLowerCase()));
    // validation rules apply to imported rows too
    const ruleErr = prep.errors.length || dupErr ? [] : validationErrors(validation, prep.data, 'create', { owner_id: ownerId });
    if (prep.errors.length || dupErr || ruleErr.length) {
      res.failed++;
      res.errors.push({ row: i + 2, message: prep.errors.length ? prep.errors.map((e) => e.message).join(' ') : dupErr ? `${dupErr.label} must be unique.` : ruleErr.map((e) => e.message).join(' ') });
      continue;
    }
    for (const f of uniqueFields) if (!isEmpty(prep.data[f.api_name])) uniqueSeen.get(f.api_name)!.add(String(prep.data[f.api_name]).toLowerCase());
    if (key) index.set(key, { name: prep.name, data: prep.data } as CrmRecord); // later rows in the same file match it
    inserts.push({ data: prep.data, name: prep.name, row: i + 2 });
  }

  // Auto-numbers for new rows, reserved as one block per field
  for (const f of fields.filter((x) => x.type === 'autonumber')) {
    if (!inserts.length) break;
    const { data: start, error } = await svc.rpc('crm_reserve_numbers', { p_key: `${module}.${f.api_name}`, p_n: inserts.length });
    if (error) throw error;
    inserts.forEach((r, i) => { r.data[f.api_name] = `${f.options?.prefix ?? ''}${String(Number(start) + i).padStart(f.options?.pad ?? 1, '0')}`; });
  }
  // assignment rule (round robin) per row, when asked for
  const owners2: Array<string | null> = [];
  for (const r of inserts) owners2.push(opts.useAssignment ? (await assignOwnerFor(module, r.data, 'import'))?.ownerId ?? ownerId : ownerId);
  for (let i = 0; i < inserts.length; i += 500) {
    const batch = inserts.slice(i, i + 500);
    const { error } = await svc.from('crm_records').insert(batch.map((r, k) => ({
      module, name: r.name, owner_id: owners2[i + k], data: r.data, source: 'import', source_ref: importId, created_by: ctx.userId, updated_by: ctx.userId,
    })));
    if (error) {
      res.failed += batch.length;
      res.errors.push({ row: batch[0].row, message: `Rows ${batch[0].row}–${batch[batch.length - 1].row} could not be saved.` });
    } else res.created += batch.length;
  }
  res.errors = res.errors.slice(0, 500);
  await svc.from('crm_imports').update({ created: res.created, updated: res.updated, skipped: res.skipped, failed: res.failed, errors: res.errors }).eq('id', importId);
  await audit(svc, { actor_id: ctx.userId, action: 'import', module, meta: { importId, filename, created: res.created, updated: res.updated, skipped: res.skipped, failed: res.failed } });
  return res;
}

function findByName(index: Map<string, CrmRecord>, nameFields: string[], patch: Record<string, unknown>) {
  const name = nameFields.map((k) => patch[k]).filter((v) => !isEmpty(v)).join(' ').trim().toLowerCase();
  return name ? index.get(name) : undefined;
}

/** Undo an import: move the records it created to the recycle bin. */
export async function undoImport(ctx: CrmContext, meta: Meta, importId: string) {
  if (!isUuid(importId)) throw new CrmAccessError('Import not found.');
  const svc = createServiceClient();
  const { data } = await svc.from('crm_imports').select('id, module, created_by, undone_at').eq('id', importId).maybeSingle();
  const imp = data as { id: string; module: string; created_by: string | null; undone_at: string | null } | null;
  if (!imp) throw new CrmAccessError('Import not found.');
  if (!ctx.superAdmin && imp.created_by !== ctx.userId) throw new CrmAccessError('Only the person who ran the import (or an admin) can undo it.');
  if (imp.undone_at) throw new CrmUserError('This import was already undone.');
  getModuleOrThrow(meta, imp.module);
  const now = new Date().toISOString();
  const { data: rows } = await svc.from('crm_records').update({ deleted_at: now, deleted_by: ctx.userId, updated_at: now })
    .eq('source', 'import').eq('source_ref', importId).is('deleted_at', null).select('id');
  await svc.from('crm_imports').update({ undone_at: now }).eq('id', importId);
  await audit(svc, { actor_id: ctx.userId, action: 'import_undo', module: imp.module, meta: { importId, removed: (rows ?? []).length } });
  return (rows ?? []).length;
}

export async function exportCsv(ctx: CrmContext, meta: Meta, module: string, criteria: Criteria | null): Promise<{ csv: string; rows: number; truncated: boolean }> {
  const mod = getModuleOrThrow(meta, module);
  if (!can(ctx, module, 'export')) throw new CrmAccessError(`You can’t export ${mod.label.toLowerCase()}.`);
  const { rows, truncated } = await queryAll(ctx, meta, module, criteria, 20_000);
  const fields = meta.fields(module).filter((f) => f.active !== false && f.type !== 'line_items' && fieldAccess(ctx, module, f.api_name) !== 'hidden');
  const members = new Map((await loadMembers()).map((m) => [m.id, m.name]));
  const header = ['Record ID', ...fields.map((f) => f.label), 'Owner', 'Tags', 'Created', 'Modified'];
  const body = rows.map((r) => [
    r.id,
    ...fields.map((f) => (f.type === 'related' ? (r.data[f.api_name] as { id?: string } | null)?.id ?? '' : f.type === 'boolean' ? formatValue(f, r.data[f.api_name]) : r.data[f.api_name] ?? '')),
    r.owner_id ? members.get(r.owner_id) ?? r.owner_id : '',
    r.tags.join('; '),
    r.created_at,
    r.updated_at,
  ]);
  const svc = createServiceClient();
  await audit(svc, { actor_id: ctx.userId, action: 'export', module, meta: { rows: rows.length, truncated, filtered: !!criteria } });
  return { csv: toCsv(header, body), rows: rows.length, truncated };
}

export async function searchAll(ctx: CrmContext, meta: Meta, term: string) {
  const q = orSafe(term);
  if (q.length < 2) return [];
  const svc = createServiceClient();
  const pat = `%${ilikeEscape(q)}%`;
  const mods = meta.modules.filter((m) => m.active !== false && can(ctx, m.api_name, 'view'));
  const results = await Promise.all(mods.map(async (m) => {
    const ef = m.settings.emailField;
    let qb = svc.from('crm_records').select(RECORD_COLS).eq('module', m.api_name).is('deleted_at', null).is('merged_into', null);
    qb = ef && fieldAccess(ctx, m.api_name, ef) !== 'hidden' ? qb.or(`name.ilike.${pat},data->>${ef}.ilike.${pat}`) : qb.ilike('name', pat);
    const { data } = await qb.order('updated_at', { ascending: false }).limit(8);
    const rows = ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord).filter((r) => accessTo(ctx, meta, r)).slice(0, 6);
    return { module: m.api_name, label: m.label, rows: rows.map((r) => present(ctx, r)) };
  }));
  return results.filter((r) => r.rows.length);
}
