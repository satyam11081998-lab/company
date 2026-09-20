import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/guest/claim
 *
 * Moves work done in an anonymous (guest) session onto the permanent account
 * that is signed in RIGHT NOW.
 *
 * ── The gap this closes ──────────────────────────────────────────────
 * Guest conversion via `updateUser({ email })` / `linkIdentity()` upgrades the
 * SAME auth.users row, so that path never needed a merge. But a visitor who
 * practises anonymously and then signs in to an account they ALREADY had ends
 * up with two different uuids, and every attempt, message, submission and score
 * stays parented to the throwaway guest row — invisible to them, and deleted by
 * the 30-day guest cleanup. That is the "my conversation disappeared when I
 * logged in" case.
 *
 * ── Security model ───────────────────────────────────────────────────
 * The dangerous version of this endpoint takes a guest uuid and trusts it —
 * that would let any logged-in user vacuum up any guest's work by guessing ids.
 * Instead the caller must prove possession of BOTH sessions:
 *
 *   1. the TARGET session, via the normal auth cookie (and it must not itself
 *      be anonymous — claiming a guest onto a guest is meaningless and would
 *      let someone launder ownership through a chain of throwaway sessions);
 *   2. the GUEST session, by presenting its access token in the body. The token
 *      is verified against Supabase (`getUser(token)`), not merely decoded, so
 *      an expired or forged one is rejected, and the user it resolves to must
 *      actually be anonymous.
 *
 * Only then does the service role call `claim_guest_data` (migration 0068),
 * which is itself revoked from anon/authenticated for the same reason.
 *
 * Idempotent in practice: a second call finds nothing left under the guest id
 * and reports zeroes.
 */
export async function POST(req: NextRequest) {
  // ── 1 · The target: whoever is signed in on this request ──────────
  const supabase = createClient();
  const { data: { user: target } } = await supabase.auth.getUser();
  if (!target) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  // A guest cannot be the destination of a claim.
  if ((target as { is_anonymous?: boolean }).is_anonymous === true) {
    return NextResponse.json({ error: 'Target session is still a guest' }, { status: 400 });
  }

  // ── 2 · The source: prove possession of the guest session ─────────
  let guestAccessToken: string | undefined;
  try {
    const body = await req.json();
    guestAccessToken = typeof body?.guestAccessToken === 'string' ? body.guestAccessToken : undefined;
  } catch {
    /* fall through to the 400 below */
  }
  if (!guestAccessToken) {
    return NextResponse.json({ error: 'guestAccessToken required' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  // Verified against Supabase, not decoded locally — an expired or tampered
  // token must not be able to name a victim.
  const verifier = createSupabaseJsClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: guestData, error: guestErr } = await verifier.auth.getUser(guestAccessToken);
  const guest = guestData?.user;
  if (guestErr || !guest) {
    return NextResponse.json({ error: 'Guest session could not be verified' }, { status: 401 });
  }
  if ((guest as { is_anonymous?: boolean }).is_anonymous !== true) {
    return NextResponse.json({ error: 'That session is not a guest session' }, { status: 400 });
  }
  if (guest.id === target.id) {
    // The converted-in-place path (updateUser / linkIdentity). Nothing to move —
    // it is the same row. Report success so the caller has no special case.
    return NextResponse.json({ claimed: false, reason: 'same_user', moved: null });
  }

  // ── 3 · Move it ───────────────────────────────────────────────────
  const svc = createServiceClient();
  const { data, error } = await svc.rpc('claim_guest_data', {
    p_guest_id: guest.id,
    p_target_id: target.id,
  });

  if (error) {
    // A missing function means migration 0068 has not been run. That is an
    // operator problem, not a user problem: say so in the log, and fail soft so
    // a fresh login is never blocked by it.
    console.error('[guest-claim] claim_guest_data failed:', error.message, error);
    const missing = /could not find the function|does not exist/i.test(error.message || '');
    return NextResponse.json(
      {
        claimed: false,
        error: missing
          ? 'Guest claim is not available yet (run migration 0068).'
          : 'Could not move your guest practice across.',
      },
      { status: missing ? 501 : 500 },
    );
  }

  const moved = Array.isArray(data) ? data[0] : data;
  const attempts = Number(moved?.attempts_moved ?? 0);
  const submissions = Number(moved?.submissions_moved ?? 0);

  return NextResponse.json({
    claimed: attempts > 0 || submissions > 0,
    moved: {
      attempts,
      submissions,
      case_attempts: Number(moved?.case_attempts_moved ?? 0),
      events: Number(moved?.events_moved ?? 0),
    },
  });
}
