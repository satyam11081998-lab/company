import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for trusted server-only contexts (e.g. the
 * Razorpay webhook, which has no user session and must bypass RLS).
 * NEVER import this into a client component — SUPABASE_SERVICE_ROLE_KEY must
 * stay server-side (do not prefix it with NEXT_PUBLIC).
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
