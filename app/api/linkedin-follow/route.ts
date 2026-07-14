import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * POST /api/linkedin-follow — claim the one-time LinkedIn follow perk
 * (+1 lifetime bank case, +1 lifetime bank guesstimate for free users).
 *
 * Honor-system BY DESIGN: LinkedIn has no API to verify that a member
 * follows a company page. Do not add OAuth or scraping. The blast radius
 * of a dishonest claim is +1/+1, once, per account.
 *
 * Service-role write: guard_user_privileged_cols (0006, extended in 0040)
 * reverts this column for any non-service-role writer, so the browser
 * client cannot set it directly — this route is the only door.
 *
 * Idempotent: the conditional `.is('linkedin_follow_claimed_at', null)`
 * makes double-clicks, two open tabs, and replayed requests a no-op.
 */
export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = createServiceClient();

  const { data: row, error: readError } = await db
    .from('users')
    .select('linkedin_follow_claimed_at')
    .eq('id', user.id)
    .maybeSingle();
  if (readError || !row) {
    return NextResponse.json({ error: 'user not found' }, { status: 404 });
  }
  if (row.linkedin_follow_claimed_at) {
    return NextResponse.json({ claimed: true, alreadyClaimed: true });
  }

  const { data: updated, error: updateError } = await db
    .from('users')
    .update({ linkedin_follow_claimed_at: new Date().toISOString() })
    .eq('id', user.id)
    .is('linkedin_follow_claimed_at', null) // race-safe: second writer no-ops
    .select('id');
  if (updateError) {
    console.error('[linkedin-follow] claim failed:', updateError);
    return NextResponse.json({ error: 'claim failed' }, { status: 500 });
  }
  return NextResponse.json({ claimed: true, alreadyClaimed: !updated?.length });
}
