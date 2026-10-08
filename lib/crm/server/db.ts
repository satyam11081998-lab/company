/**
 * Small DB helpers for the CRM server layer.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CrmRecord } from '@/lib/crm/types';

/** Supabase caps a single response (max_rows, 1000 by default). */
export const PAGE = 1000;

/**
 * Fetch every row of a query in pages: the first with an exact count, the
 * rest in parallel. `build(opts)` must return a fresh query whose `.select()`
 * received `opts`, fully filtered and DETERMINISTICALLY ordered (end with an
 * order on `id`), or pages may overlap. Stops at `cap` rows.
 */
export async function fetchAll<T>(
  build: (opts?: { count: 'exact' }) => any,
  cap = 20_000,
): Promise<{ rows: T[]; total: number; truncated: boolean }> {
  const res = await build({ count: 'exact' }).range(0, PAGE - 1);
  if (res.error) throw res.error;
  const rows: T[] = [...((res.data as T[]) ?? [])];
  const total: number = typeof res.count === 'number' ? res.count : rows.length;
  const want = Math.min(total, cap);
  if (rows.length >= PAGE && want > rows.length) {
    const starts: number[] = [];
    for (let s = PAGE; s < want; s += PAGE) starts.push(s);
    // at most 8 requests in flight
    for (let i = 0; i < starts.length; i += 8) {
      const pages = await Promise.all(starts.slice(i, i + 8).map((s) => build().range(s, Math.min(s + PAGE, want) - 1)));
      for (const p of pages) {
        if (p.error) throw p.error;
        rows.push(...((p.data as T[]) ?? []));
      }
    }
  }
  return { rows: rows.slice(0, cap), total, truncated: total > cap };
}

export const RECORD_COLS =
  'id, module, name, owner_id, data, tags, external_key, mece_user_id, source, source_ref, score, last_activity_at, locked, approval_status, blueprint, shared_with, created_by, created_at, updated_by, updated_at, deleted_at, deleted_by, merged_into';

export const RECORD_META_COLS =
  'id, module, name, owner_id, tags, external_key, mece_user_id, source, score, last_activity_at, locked, approval_status, blueprint, shared_with, created_by, created_at, updated_by, updated_at';

export function normalizeRecord(r: Record<string, unknown>): CrmRecord {
  return {
    id: r.id as string,
    module: r.module as string,
    name: (r.name as string) ?? '',
    owner_id: (r.owner_id as string) ?? null,
    data: (r.data && typeof r.data === 'object' ? r.data : {}) as Record<string, unknown>,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    external_key: (r.external_key as string) ?? null,
    mece_user_id: (r.mece_user_id as string) ?? null,
    source: (r.source as string) ?? null,
    source_ref: (r.source_ref as string) ?? null,
    score: typeof r.score === 'number' ? r.score : null,
    last_activity_at: (r.last_activity_at as string) ?? null,
    locked: (r.locked as CrmRecord['locked']) ?? null,
    approval_status: (r.approval_status as string) ?? null,
    blueprint: (r.blueprint as CrmRecord['blueprint']) ?? null,
    shared_with: Array.isArray(r.shared_with) ? (r.shared_with as CrmRecord['shared_with']) : [],
    created_by: (r.created_by as string) ?? null,
    created_at: r.created_at as string,
    updated_by: (r.updated_by as string) ?? null,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
    deleted_by: (r.deleted_by as string) ?? null,
    merged_into: (r.merged_into as string) ?? null,
  };
}

/** Escape a user string for use inside a PostgREST ilike pattern. */
export function ilikeEscape(s: string): string {
  return s.replace(/[\\%_]/g, (c) => '\\' + c);
}

/** A search term safe to embed in a PostgREST `.or()` filter string. */
export function orSafe(s: string): string {
  return s.replace(/[,()"'\\*:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

export async function audit(
  svc: SupabaseClient,
  row: { actor_id: string | null; actor_kind?: string; action: string; module?: string | null; record_id?: string | null; changes?: unknown; meta?: unknown },
): Promise<void> {
  const { error } = await svc.from('crm_audit').insert({
    actor_id: row.actor_id,
    actor_kind: row.actor_kind ?? 'user',
    action: row.action.slice(0, 60),
    module: row.module ?? null,
    record_id: row.record_id ?? null,
    changes: row.changes ?? null,
    meta: row.meta ?? null,
  });
  if (error) console.error('[crm] audit write failed:', error.message);
}
