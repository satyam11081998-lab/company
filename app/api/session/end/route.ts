import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sessionIdFromAccessToken, endSession } from '@/lib/sessions';

export const dynamic = 'force-dynamic';

/**
 * POST /api/session/end — close THIS browser's device row.
 *
 * Called by the sign-out button just before `auth.signOut()`, so the account
 * is immediately free for the next device instead of holding the single-session
 * slot until someone takes it over. Best effort: always returns 200, because a
 * failure here must never block a sign-out.
 */
export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ ok: true });

    const { data } = await supabase.auth.getSession();
    const sessionId = sessionIdFromAccessToken(data.session?.access_token ?? null);

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await endSession(createServiceClient(), user.id, sessionId);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
