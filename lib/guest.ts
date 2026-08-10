'use client';

/**
 * Guest-mode helpers (client-side only).
 *
 * `ensureGuestSession()` creates a Supabase anonymous auth session if none
 * exists and the feature flag is enabled. It runs AFTER first paint so `/`
 * stays statically rendered with `revalidate = 300` (the CWV invariant).
 *
 * `isGuestUser()` / `isGuestRow()` are thin type-safe checks so call sites
 * don't scatter raw property access.
 */

import { createClient } from '@/lib/supabase/client';
// Shared with every other Supabase auth call — see lib/turnstile.ts for why the
// helper cannot live in this file.
import { getCaptchaToken } from '@/lib/turnstile';
import type { UserRow } from '@/lib/types';

/** True when the guest-mode feature flag is enabled. */
export function isGuestModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_GUEST_MODE === 'true';
}

/**
 * Ensure a Supabase session exists. If none does and guest mode is enabled,
 * create an anonymous session. Returns the user (or null if guest mode is off
 * and there is no session).
 *
 * Safe to call multiple times — `signInAnonymously()` is a no-op when a
 * session already exists.
 */
export async function ensureGuestSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) return session.user;

  if (!isGuestModeEnabled()) return null;

  const captchaToken = await getCaptchaToken();
  const { data, error } = await supabase.auth.signInAnonymously(
    captchaToken ? { options: { captchaToken } } : undefined,
  );
  if (error) {
    // Log the raw error AND throw a diagnosable one. The three ways this fails
    // in practice are all configuration, not user error, and a generic "could
    // not start" message sends you hunting through code for a dashboard toggle:
    //   • Anonymous sign-ins not enabled in Supabase → "disabled"
    //   • Migration 0045 not run → the handle_new_user trigger hits the
    //     NOT NULL constraint on public.users.email (anonymous users have no
    //     email) and Supabase returns a 500 / unexpected_failure
    //   • CAPTCHA protection on with no site key deployed → "captcha"
    console.error('[guest] signInAnonymously failed:', error.status, error.message, error);
    const m = (error.message || '').toLowerCase();
    if (m.includes('anonymous') && m.includes('disabl')) {
      throw new Error('Guest practice is not enabled yet. (Supabase: turn on Anonymous sign-ins.)');
    }
    if (m.includes('captcha')) {
      throw new Error('Verification failed. (Supabase CAPTCHA is on but no Turnstile site key is deployed.)');
    }
    if (error.status === 500 || m.includes('unexpected')) {
      throw new Error('Could not create a practice session. (Server: has migration 0045 been run?)');
    }
    throw new Error(error.message || 'Could not start a practice session.');
  }
  return data.user;
}

/** Check if a Supabase User object is an anonymous guest. */
export function isGuestUser(user: { is_anonymous?: boolean } | null): boolean {
  return user?.is_anonymous === true;
}

/** Check if a UserRow from the DB is a guest. */
export function isGuestRow(row: Pick<UserRow, 'is_guest'> | null): boolean {
  return row?.is_guest === true;
}
