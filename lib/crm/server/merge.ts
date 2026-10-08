/**
 * Find & merge duplicates (Zoho: up to 3 records). The master keeps the field
 * values the user picked; notes, attachments, activities, child lookups,
 * links and tags move to the master; the others are soft-deleted with
 * merged_into set (restorable from the recycle bin is deliberately NOT
 * offered for merged rows — they'd re-split history).
 *
 * Two synced MECE customers are never merged (they are two real accounts).
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { isUuid } from '@/lib/crm/fields';
import { allows, can } from '@/lib/crm/permissions';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { CrmAccessError, CrmUserError } from './context';
import { RECORD_COLS, audit, ilikeEscape, normalizeRecord } from './db';
import { accessTo, loadRecordRaw, normalizeTags, present, updateRecord } from './records';
import type { Meta } from './meta';

export async function findDuplicates(ctx: CrmContext, meta: Meta, module: string, id: string): Promise<CrmRecord[]> {
  if (!can(ctx, module, 'view')) throw new CrmAccessError();
  const svc = createServiceClient();
  const rec = await loadRecordRaw(svc, id);
  if (!rec || rec.module !== module || !accessTo(ctx, meta, rec)) throw new CrmAccessError('Record not found.');
  const mod = meta.module(module)!;
  const out = new Map<string, CrmRecord>();
  const probes: Array<[string, string]> = [];
  if (rec.name) probes.push(['name', rec.name]);
  const ef = mod.settings.emailField;
  if (ef && typeof rec.data[ef] === 'string') probes.push([`data->>${ef}`, rec.data[ef] as string]);
  const pf = mod.settings.phoneField;
  if (pf && typeof rec.data[pf] === 'string') probes.push([`data->>${pf}`, rec.data[pf] as string]);
  for (const [col, v] of probes) {
    const { data } = await svc.from('crm_records').select(RECORD_COLS).eq('module', module).is('deleted_at', null).neq('id', id).ilike(col, ilikeEscape(v)).limit(10);
    for (const r of ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord)) if (accessTo(ctx, meta, r)) out.set(r.id, present(ctx, r));
  }
  return [...out.values()].slice(0, 10);
}

export async function mergeRecords(ctx: CrmContext, meta: Meta, module: string, masterId: string, otherIds: string[], picks: Record<string, string>) {
  if (!can(ctx, module, 'edit') || !can(ctx, module, 'delete')) throw new CrmAccessError('Merging needs edit and delete permission.');
  const ids = [...new Set(otherIds)].filter((x) => isUuid(x) && x !== masterId);
  if (!ids.length || ids.length > 2) throw new CrmUserError('Pick one or two records to merge into this one.');
  const svc = createServiceClient();
  const master = await loadRecordRaw(svc, masterId);
  if (!master || master.module !== module || master.deleted_at) throw new CrmAccessError('Record not found.');
  const others: CrmRecord[] = [];
  for (const id of ids) {
    const r = await loadRecordRaw(svc, id);
    if (!r || r.module !== module || r.deleted_at) throw new CrmAccessError('Record not found.');
    others.push(r);
  }
  for (const r of [master, ...others]) if (!allows(accessTo(ctx, meta, r), 'rwd')) throw new CrmAccessError('You need full access to every record you merge.');
  if (others.some((o) => o.external_key)) throw new CrmUserError('A record that mirrors MECE data can only be the one you keep, not one you merge away.');

  // Field picks: the value from the chosen record, if the user may edit it.
  const byId = new Map([master, ...others].map((r) => [r.id, r]));
  const patch: Record<string, unknown> = {};
  for (const [field, fromId] of Object.entries(picks)) {
    const src = byId.get(fromId);
    const f = meta.field(module, field);
    if (!src || !f || src.id === master.id) continue;
    if (f.system || f.readonly || ['autonumber', 'formula', 'rollup', 'json'].includes(f.type)) continue;
    if (f.synced && master.external_key) continue;
    patch[field] = src.data[field] ?? null;
  }
  const tags = normalizeTags([...master.tags, ...others.flatMap((o) => o.tags)]);
  await updateRecord(ctx, meta, module, master.id, patch, { source: 'merge', tags, allowDuplicate: true });

  // Re-point children
  const otherSet = others.map((o) => o.id);
  await svc.from('crm_notes').update({ record_id: master.id }).in('record_id', otherSet);
  await svc.from('crm_attachments').update({ record_id: master.id }).in('record_id', otherSet);
  for (const m of meta.modules) {
    for (const f of meta.fields(m.api_name)) {
      const pointsHere = (f.type === 'lookup' && f.options?.module === module) || (f.type === 'related' && f.options?.modules?.includes(module));
      if (!pointsHere) continue;
      const path = f.type === 'related' ? `data->${f.api_name}->>id` : `data->>${f.api_name}`;
      const { data: kids } = await svc.from('crm_records').select('id, data').eq('module', m.api_name).in(path, otherSet).limit(5000);
      for (const k of (kids ?? []) as Array<{ id: string; data: Record<string, unknown> }>) {
        const nd = { ...k.data, [f.api_name]: f.type === 'related' ? { module, id: master.id } : master.id };
        await svc.from('crm_records').update({ data: nd, updated_at: new Date().toISOString() }).eq('id', k.id);
      }
    }
  }
  for (const col of ['from_id', 'to_id'] as const) {
    const { data: links } = await svc.from('crm_links').select('id, from_id, to_id, kind, data').in(col, otherSet);
    for (const l of (links ?? []) as Array<{ id: string; from_id: string; to_id: string; kind: string; data: unknown }>) {
      const moved = { from_id: col === 'from_id' ? master.id : l.from_id, to_id: col === 'to_id' ? master.id : l.to_id, kind: l.kind, data: l.data };
      await svc.from('crm_links').upsert(moved, { onConflict: 'from_id,to_id,kind', ignoreDuplicates: true });
      await svc.from('crm_links').delete().eq('id', l.id);
    }
  }
  const now = new Date().toISOString();
  await svc.from('crm_records').update({ deleted_at: now, deleted_by: ctx.userId, merged_into: master.id, updated_at: now }).in('id', otherSet);
  await audit(svc, { actor_id: ctx.userId, action: 'merge', module, record_id: master.id, meta: { merged: others.map((o) => ({ id: o.id, name: o.name })) } });
  return { masterId: master.id, merged: otherSet.length };
}
