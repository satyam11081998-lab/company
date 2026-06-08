import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * GET /api/college-email/verify?token=<raw>&uid=<user-id>
 *
 * The link Supabase emails the user goes through Supabase's own redirect
 * before landing here (Supabase appends `?code=…` for the magiclink session
 * which we ignore — we only care about our own `token` query param). When
 * we match the SHA-256 hash to a non-expired row, we copy the email onto
 * the user, stamp `college_email_verified_at`, and delete the token.
 *
 * Redirects to /profile?college=verified on success and ?college=error on
 * failure, with a `reason` query string for debugging in the UI toast.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const rawToken = url.searchParams.get('token');
  const uid = url.searchParams.get('uid');
  const profileUrl = `${url.origin}/profile`;

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${profileUrl}?college=error&reason=${encodeURIComponent(reason)}`,
    );

  if (!rawToken || !uid) return fail('Missing token or uid');

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fail('Server missing service-role key');
    }
    const admin = createServiceClient();

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const { data: row } = await admin
      .from('college_email_verifications')
      .select('id, email, expires_at')
      .eq('user_id', uid)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (!row) return fail('Invalid or expired link');
    if (new Date(row.expires_at).getTime() < Date.now()) {
      // Clean up expired row.
      await admin.from('college_email_verifications').delete().eq('id', row.id);
      return fail('Link expired — request a new one');
    }

    const { error: updateErr } = await admin
      .from('users')
      .update({
        college_email: row.email,
        college_email_verified_at: new Date().toISOString(),
      })
      .eq('id', uid);
    if (updateErr) return fail(`Could not mark verified: ${updateErr.message}`);

    // Burn the token so it can't be reused.
    await admin.from('college_email_verifications').delete().eq('id', row.id);

    return NextResponse.redirect(`${profileUrl}?college=verified`);
  } catch (err: any) {
    console.error('college-email/verify fatal', err);
    return fail(err?.message ?? 'Server error');
  }
}
