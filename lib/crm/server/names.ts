/**
 * Resolve lookup / related / user ids to display names for a page of records.
 * A referenced record the viewer can't access shows as "Restricted" — its
 * name is never sent to the browser.
 */
import { createServiceClient } from '@/lib/crm/server/svc';
import { isUuid } from '@/lib/crm/fields';
import type { CrmContext, CrmRecord } from '@/lib/crm/types';
import { RECORD_COLS, normalizeRecord } from './db';
import { loadMembers } from './members';
import { accessTo } from './records';
import type { Meta } from './meta';

export type RefMap = Record<string, { name: string; module?: string; restricted?: boolean }>;

export async function resolveRefs(ctx: CrmContext, meta: Meta, records: CrmRecord[]): Promise<RefMap> {
  const ids = new Set<string>();
  const users = new Set<string>();
  for (const r of records) {
    if (r.owner_id) users.add(r.owner_id);
    if (r.created_by) users.add(r.created_by);
    for (const f of meta.fields(r.module)) {
      const v = r.data[f.api_name];
      if (f.type === 'lookup' && isUuid(v)) ids.add(v);
      else if (f.type === 'related' && v && typeof v === 'object' && isUuid((v as { id?: unknown }).id)) ids.add((v as { id: string }).id);
      else if (f.type === 'user' && isUuid(v)) users.add(v);
      else if (f.type === 'line_items' && Array.isArray(v)) for (const li of v as Array<{ product_id?: unknown }>) if (isUuid(li?.product_id)) ids.add(li.product_id as string);
    }
  }
  const out: RefMap = {};
  if (ids.size) {
    const svc = createServiceClient();
    const list = [...ids];
    for (let i = 0; i < list.length; i += 200) {
      const { data } = await svc.from('crm_records').select(RECORD_COLS).in('id', list.slice(i, i + 200));
      for (const row of ((data ?? []) as Record<string, unknown>[]).map(normalizeRecord)) {
        out[row.id] = accessTo(ctx, meta, row) && !row.deleted_at
          ? { name: row.name || '(no name)', module: row.module }
          : { name: row.deleted_at ? 'Deleted record' : 'Restricted', restricted: true };
      }
    }
  }
  if (users.size) {
    const members = await loadMembers();
    for (const u of users) {
      const m = members.find((x) => x.id === u);
      out[u] = { name: m?.name ?? 'Former user' };
    }
  }
  return out;
}
