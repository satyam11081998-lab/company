'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCachedSessionId } from '@/lib/supabase/auth-cached';
import { claimSession, endSession } from '@/lib/sessions';

/**
 * "Sign out my other device and continue here."
 *
 * Revokes every other live session for the caller and claims the account for
 * this browser. Only ever acts on the CALLER's own sessions — the user id comes
 * from a verified `auth.getUser()`, never from the form.
 */
export async function takeOverSession(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Please sign in again.' };

  const sessionId = await getCachedSessionId();
  if (!sessionId) {
    return { success: false, error: 'Could not identify this browser session. Sign out and log in again.' };
  }

  const ok = await claimSession(createServiceClient(), user.id, sessionId);
  if (!ok) return { success: false, error: 'Could not switch devices. Try again in a moment.' };
  return { success: true };
}

/** Sign out of THIS browser and close its session row. */
export async function signOutHere(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = await getCachedSessionId();
  if (user) {
    await endSession(createServiceClient(), user.id, sessionId);
  }
  await supabase.auth.signOut();
  redirect('/login');
}
