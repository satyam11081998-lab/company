import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client for the CRM, with Next.js fetch memoization turned off.
 *
 * During a server-component render Next.js memoizes identical GET requests,
 * so a read → write → re-read in one render (e.g. seeding metadata on the
 * first visit, then loading it) would get the stale first response. Each
 * request gets its own AbortSignal (which opts it out of memoization) and
 * `cache: 'no-store'`. Server-only: never import from a client component.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store', signal: init?.signal ?? new AbortController().signal }),
      },
    },
  );
}
