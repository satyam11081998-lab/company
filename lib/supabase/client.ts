import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in browser/client components.
 * Reads URL and anon key from public env vars.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}
