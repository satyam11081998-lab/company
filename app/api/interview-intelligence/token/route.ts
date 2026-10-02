import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { effectiveTier } from '@/lib/tier-core';
import { normalisePem, signAssertion } from '@/lib/interview-intelligence/assertion';

/**
 * Interview Intelligence — entitlement assertion issuer (proposed CONTRACTS.md C10).
 *
 * This is the ONLY thing MECE does for Interview Intelligence: say who the user is, whether
 * they are an admin, and what their effective tier is right now — signed and short-lived.
 * The independent II service verifies the signature and decides access itself.
 *
 * - Identity: the Supabase session, verified server-side (getUser calls Supabase Auth).
 * - Guests (anonymous Supabase users) are refused: II needs a durable identity.
 * - The email claim is included only when the address is confirmed, because II matches
 *   admin-managed test grants by email.
 * - Signed with Ed25519 (alg EdDSA); the private key lives only in server env.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function fail(status: number, error: string, message: string) {
  return NextResponse.json({ error, message }, { status, headers: NO_STORE });
}

type TierRow = {
  subscription_tier: 'free' | 'lite' | 'pro';
  subscription_expires_at: string | null;
  is_admin?: boolean | null;
  is_guest?: boolean | null;
};

export async function GET() {
  const pem = normalisePem(process.env.II_ASSERTION_PRIVATE_KEY);
  if (!pem) return fail(503, 'not_configured', 'Interview Intelligence is not configured yet.');

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail(401, 'unauthorized', 'Please sign in.');
  if ((user as { is_anonymous?: boolean }).is_anonymous) {
    return fail(403, 'guest', 'Create a free account to use Interview Intelligence.');
  }

  const { data } = await supabase
    .from('users')
    .select('subscription_tier, subscription_expires_at, is_admin, is_guest')
    .eq('id', user.id)
    .maybeSingle();
  const row = data as TierRow | null;
  if (!row) return fail(403, 'no_profile', 'Finish setting up your account first.');
  if (row.is_guest) return fail(403, 'guest', 'Create a free account to use Interview Intelligence.');

  const confirmed = Boolean((user as { email_confirmed_at?: string | null }).email_confirmed_at);
  try {
    const { token, exp } = signAssertion({
      sub: user.id,
      email: confirmed ? (user.email || '').toLowerCase() : '',
      tier: effectiveTier(row),
      subExp: row.subscription_expires_at ?? null,
      admin: Boolean(row.is_admin),
    }, pem, process.env.II_ASSERTION_KID || 'k1');
    return NextResponse.json({ token, expires_at: exp }, { headers: NO_STORE });
  } catch {
    return fail(503, 'not_configured', 'Interview Intelligence signing key is invalid.');
  }
}
