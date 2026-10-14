'use server';

/**
 * Second half of the staff sign-in. The browser signs in with Supabase
 * directly (so Supabase sees the visitor's own IP for its sign-in rate limit,
 * and CAPTCHA works exactly as on /login); this action then decides, on the
 * server, whether the account that just signed in is staff.
 *
 * Not staff → the session that was just created is signed out again, so this
 * page only ever leaves an admin or a CRM team member signed in.
 */
import { createClient } from '@/lib/supabase/server';
import { staffKind } from '@/lib/staff-access';
import { staffDestination } from '@/lib/staff-paths';

export type StaffSignInResult = { ok: true; dest: string } | { ok: false; error: string };

export async function finishStaffSignIn(next: unknown): Promise<StaffSignInResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) {
    return { ok: false, error: 'Sign-in did not complete. Please try again.' };
  }
  const kind = await staffKind(user.id);
  if (!kind) {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* the browser signs out too */ }
    return { ok: false, error: "That account doesn't have admin access, so it was signed out here. Use your admin email and password." };
  }
  return { ok: true, dest: staffDestination(typeof next === 'string' ? next : null, kind) };
}
