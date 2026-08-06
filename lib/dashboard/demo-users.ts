import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * Demo / showcase accounts (users.is_demo = true, migration 0044).
 *
 * These are real, fully-functional logins seeded with a rich history so the
 * product can be demoed or filmed. They must never appear on the public
 * leaderboard, be counted in "N aspirants ranked", or feed the cohort
 * benchmark every real user is scored against — otherwise a seeded account
 * sits near rank 1 and quietly moves the average everyone is compared to.
 *
 * Deliberately fail-open: if migration 0044 has not been run yet the column
 * does not exist, the query errors, and this returns [] — every caller then
 * behaves exactly as it did before. No leaderboard can be blanked by this.
 */
export async function getDemoUserIds(svc: SupabaseClient): Promise<string[]> {
  try {
    const { data, error } = await svc.from('users').select('id').eq('is_demo', true);
    if (error || !data) return [];
    return (data as Array<{ id: string }>).map((r) => r.id);
  } catch {
    return [];
  }
}

/**
 * Request-scoped version. One dashboard render asks four different modules
 * (rank, benchmark, peer proximity, activity tape) the same question, so
 * without this the hot path pays four identical round-trips. React's cache()
 * memoises for the lifetime of ONE server request.
 *
 * Takes no client argument on purpose: arguments are the cache key, and a
 * fresh Supabase client object each call would defeat the memo. Every caller
 * is already a service-role server context, so building one here is safe.
 */
export const getDemoUserIdsCached = cache(async (): Promise<string[]> => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    return await getDemoUserIds(createServiceClient());
  } catch {
    return [];
  }
});

/**
 * Postgrest `in` list literal, e.g. `(uuid-a,uuid-b)`. Returns null when there
 * is nothing to exclude, so callers can skip the filter entirely rather than
 * emit a malformed empty `()`.
 */
export function notInList(ids: string[]): string | null {
  return ids.length ? `(${ids.join(',')})` : null;
}
