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
    console.error('[guest] signInAnonymously failed:', error.message);
    return null;
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
