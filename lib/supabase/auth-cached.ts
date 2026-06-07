import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { UserRow } from '@/lib/types';

/**
 * Request-scoped auth + user row helpers.
 *
 * Why: prior to this, three places in every dashboard request called
 * `supabase.auth.getUser()` independently — middleware, app layout, and each
 * page — and two of them ALSO ran a `users` table SELECT. Each `getUser()`
 * call is a real network round-trip to Supabase (~100–250ms), so a single
 * dashboard navigation paid that cost three times. The user perception was
 * "click does nothing for 1–2 seconds."
 *
 * React's `cache()` memoises the wrapped function for the lifetime of one
 * server request. Layout calls `getCachedAuthUser()`, the page calls it
 * again — Supabase is only hit once.
 *
 * Middleware still does its own `getUser()` (it has to — it runs in the
 * Edge runtime before React even boots). But middleware + page caching
 * together cut the per-navigation auth cost roughly in half.
 *
 * Usage:
 *   const user = await getCachedAuthUser();        // auth.getUser() result
 *   const row  = await getCachedUserRow(user.id);  // users-table SELECT
 *
 * Drop-in replacement for the previous inline calls in app/(app)/layout.tsx
 * and app/(app)/dashboard/page.tsx (and any other route paying the same tax).
 */

export const getCachedAuthUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCachedUserRow = cache(async (userId: string): Promise<UserRow | null> => {
  const supabase = createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return (data as UserRow | null) ?? null;
});
