import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-less anon Supabase client for STATIC / ISR pages (e.g. the landing
 * page). Unlike `lib/supabase/server`, it never touches `cookies()`, so pages
 * using it stay statically renderable and CDN-cacheable.
 *
 * Runs as the anon role — RLS applies exactly as it does for a logged-out
 * visitor. Use it only for public, published content (testimonials,
 * endorsements, team). Never for user-scoped data.
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
