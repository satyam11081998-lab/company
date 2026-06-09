import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/college-email/send
 *
 * Sends a verification link to the user's claimed college email using
 * Supabase Auth's email infrastructure (`admin.generateLink`), then stores
 * a hash of the token so the verify route can match it.
 *
 * Flow:
 *   1. Auth check
 *   2. Generate random 32-byte token (raw stays only in the email URL)
 *   3. Hash the token (sha256), insert into college_email_verifications
 *      with 24h expiry
 *   4. Call Supabase admin.generateLink with type=magiclink — this triggers
 *      Supabase Auth to send an email using the SMTP configured in the
 *      Supabase dashboard (Auth → Email Templates → SMTP Settings). The
 *      redirectTo carries our own token + user id so the verify endpoint
 *      can finish the flow WITHOUT logging the user in as a new identity.
 *
 * Requires:
 *   - SUPABASE_SERVICE_ROLE_KEY set in env
 *   - SMTP configured in Supabase dashboard (default Supabase email works
 *     for testing; for production point it at Resend / SendGrid / etc.)
 *   - "Magic link" email template enabled in Supabase Auth settings
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = (await req.json().catch(() => ({}))) as { email?: string };
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Domain guard: only academic domains may receive a verification link.
    // Stops this endpoint from being used to spam arbitrary inboxes via our
    // sending reputation. (.ac.in / .edu / .edu.in / .ac.* cover Indian + intl.)
    const domain = email.toLowerCase().split('@')[1] || '';
    const isAcademic = /(^|\.)(ac|edu)\.[a-z.]+$/.test(domain) || domain.endsWith('.edu');
    if (!isAcademic) {
      return NextResponse.json(
        { error: 'Please use your official college email (e.g. an .ac.in or .edu address).' },
        { status: 400 },
      );
    }

    // Throttle: one verification email per user per 60s (persistent, so it
    // holds across serverless instances unlike an in-memory limiter).
    const sixtySecAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from('college_email_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sixtySecAgo);
    if ((recentCount ?? 0) > 0) {
      return NextResponse.json(
        { error: 'A verification email was just sent — please wait a minute before retrying.' },
        { status: 429 },
      );
    }

    // Don't allow re-sending if already verified for this user with this email.
    const { data: existing } = await supabase
      .from('users')
      .select('college_email, college_email_verified_at')
      .eq('id', user.id)
      .maybeSingle();
    if (
      existing?.college_email_verified_at &&
      existing?.college_email?.toLowerCase() === email.toLowerCase()
    ) {
      return NextResponse.json({ ok: true, already: true });
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Email verification not configured (server is missing SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 500 },
      );
    }

    // Generate the token & its hash. Raw token only travels in the email URL.
    const rawToken = crypto.randomBytes(24).toString('hex'); // 48 hex chars
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    const admin = createServiceClient();

    // Drop any prior pending tokens for this user (one outstanding at a time).
    await admin.from('college_email_verifications').delete().eq('user_id', user.id);

    const { error: insertErr } = await admin.from('college_email_verifications').insert({
      user_id: user.id,
      email,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });
    if (insertErr) {
      return NextResponse.json(
        { error: `Could not store verification token: ${insertErr.message}` },
        { status: 500 },
      );
    }

    // Build the verify URL we want the user to land on when they click the email.
    const origin =
      req.headers.get('origin') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000';
    const verifyUrl = `${origin}/api/college-email/verify?token=${rawToken}&uid=${user.id}`;

    // Use Supabase Auth's magiclink generator. This will trigger the email
    // through the SMTP configured in the Supabase dashboard. The redirect
    // carries our verifyUrl so when the user clicks, they go through our
    // server route (which marks verified) rather than logging in.
    const { error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: verifyUrl },
    });
    if (linkErr) {
      return NextResponse.json(
        { error: `Email send failed: ${linkErr.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('college-email/send fatal', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
