import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-less anon Supabase client for STATIC / ISR pages (e.g. the landing
 * page). Unlike `lib/supabase/server`, it never touches `cookies()`, so pages
 * using it stay statically renderable and CDN-cacheable.
 *
 * Runs as the anon role — RLS applies exactly as it does for a logged-out
 * visitor. Use it only for public, published content (testimonials,
 * endorsements, team). Never for user-scoped data.
 *
 * ── Why this mirrors lib/supabase/client.ts (STATE blocker 1, 2026-08-13) ──
 *
 * `lib/supabase/client.ts` was hardened on 2026-08-08 so a missing
 * `NEXT_PUBLIC_*` var could not fail the export of the auth pages. THIS file
 * was missed, and it is the one the LANDING PAGE uses — via `app/page.tsx:63`
 * and `lib/daily-server.ts:63`. So `/` kept hard-failing on its own while the
 * auth pages degraded gracefully, and because a single unexportable route fails
 * the whole build, one absent variable still blocked every deployment.
 *
 * That is exactly what happened: production was missing
 * `NEXT_PUBLIC_SUPABASE_URL` entirely (it existed only in Preview), so every
 * production build died here and the live site served weeks-old code while the
 * variables "all existed" — just never both in the same environment.
 *
 * The split is identical to client.ts, and the reasoning is the same:
 *
 *   • SERVER (build/prerender): fall back to a placeholder. The landing page's
 *     static shell does not need live data — the queries below return empty and
 *     the page renders its zero-state. A missing var must not be able to take
 *     down an entire deployment.
 *   • BROWSER (runtime): throw loudly, naming the cause. This module is
 *     server-only today, but if it is ever imported into a client component a
 *     silent placeholder would be far worse than a hard error.
 *
 * THIS IS A SAFETY NET, NOT THE FIX. Seeing the warning below means the Vercel
 * env config is still wrong: `NEXT_PUBLIC_*` variables must be PLAIN (not
 * "Sensitive") and scoped to Production AND Preview. Next inlines them into the
 * bundle at build time, and a variable present in only one environment is the
 * same as absent in the other.
 */

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

const STATIC_OPTS = { auth: { persistSession: false, autoRefreshToken: false } };

export function createStaticClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return createClient(url, key, STATIC_OPTS);
  }

  if (typeof window !== 'undefined') {
    throw new Error(
      'Supabase static client env vars are missing at runtime. ' +
        'NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY were not inlined into the ' +
        'bundle at build time. In Vercel, ensure both are PLAIN variables (not "Sensitive") ' +
        'and scoped to Production AND Preview, then redeploy.',
    );
  }

  // Server-side during `next build` — keep the export alive. Queries made
  // through this client will fail and their callers fall back to empty data,
  // which renders the page's zero-state rather than failing the deployment.
  console.warn(
    '[supabase/static] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set ' +
      'at build time; prerendering static/ISR pages against a placeholder client. The landing ' +
      'page will render with EMPTY data until the vars are fixed in Vercel.',
  );
  return createClient(PLACEHOLDER_URL, PLACEHOLDER_KEY, STATIC_OPTS);
}
