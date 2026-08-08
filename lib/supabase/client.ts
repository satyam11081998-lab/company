import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in browser/client components.
 * Reads URL and anon key from public env vars.
 *
 * ── Why this is not a one-liner (STATE blocker 1, 2026-07-17 → 2026-08-08) ──
 *
 * `next build` prerenders client components on the SERVER. Several of ours call
 * `createClient()` in the component BODY rather than inside an event handler —
 * `components/auth-cta.tsx:42` (rendered on `/`), `components/auth-form.tsx`
 * (`/signup`), and the `/forgot-password` and `/reset-password` pages.
 *
 * `@supabase/ssr` throws when url/key are empty. So if the `NEXT_PUBLIC_*` vars
 * are not inlined at build time, those four pages fail to export and the ENTIRE
 * deployment fails — which is why the live site served pre-deck-vault code for
 * three weeks while the owner correctly insisted the variables "all exist".
 *
 * The split below separates the two failure modes, which deserve opposite
 * treatment:
 *
 *   • SERVER (build/prerender): fall back to a placeholder. These pages'
 *     static shells do not depend on a live Supabase connection — the client is
 *     only ever *used* after hydration. A missing var must not be able to block
 *     every deploy.
 *   • BROWSER (runtime): throw loudly. If the vars really are absent the app
 *     genuinely cannot work, and a hard error naming the cause is far easier to
 *     diagnose than auth silently failing against a placeholder host.
 *
 * THIS IS A SAFETY NET, NOT THE FIX. If you are seeing the browser error, the
 * real cause is the Vercel env configuration — `NEXT_PUBLIC_*` variables must be
 * PLAIN (not "Sensitive") and scoped to Production + Preview, because Next
 * inlines them into the client bundle at build time and Vercel withholds
 * Sensitive values from that step.
 */

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    return createBrowserClient(url, key);
  }

  if (typeof window !== 'undefined') {
    throw new Error(
      'Supabase client env vars are missing at runtime. NEXT_PUBLIC_SUPABASE_URL / ' +
        'NEXT_PUBLIC_SUPABASE_ANON_KEY were not inlined into the client bundle at build ' +
        'time. In Vercel, ensure both are PLAIN variables (not "Sensitive") and are ' +
        'scoped to Production and Preview, then redeploy.',
    );
  }

  // Server-side during `next build` — keep the export alive.
  console.warn(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set at ' +
      'build time; prerendering auth pages against a placeholder client. Static shells are ' +
      'unaffected, but the deployed app WILL fail in the browser until the vars are fixed.',
  );
  return createBrowserClient(PLACEHOLDER_URL, PLACEHOLDER_KEY);
}
