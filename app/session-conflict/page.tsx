import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCachedSessionId } from '@/lib/supabase/auth-cached';
import type { LiveSession } from '@/lib/sessions';
import SessionConflictClient from './session-conflict-client';

/**
 * Shown when an account is already open on another device.
 *
 * Lives OUTSIDE the (app) route group on purpose — the layout in that group is
 * what redirects here, so rendering inside it would loop. Middleware still
 * requires a session to reach this page, and its onboarding gate skips this
 * path (see lib/supabase/middleware.ts).
 */
export const dynamic = 'force-dynamic';

export default async function SessionConflictPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const sessionId = await getCachedSessionId();
  // No session_id claim means the lock is inactive for this login (the layout
  // never redirects here in that case). Reaching this page by typing the URL
  // would otherwise render a conflict screen whose take-over button cannot
  // work — send them back into the app instead.
  if (!sessionId) redirect('/dashboard');

  let other: LiveSession | null = null;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { data } = await createServiceClient()
        .from('user_sessions')
        .select('id, session_id, device_label, city, region, country, ip, last_seen_at, created_at')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .order('last_seen_at', { ascending: false })
        .limit(10);
      const live = (data as LiveSession[] | null) ?? [];
      other = live.find((s) => s.session_id !== sessionId) ?? null;
    } catch { /* fall through to the generic copy */ }
  }

  // The other device signed out while this page was loading — nothing to
  // resolve, so send them straight back into the app.
  if (!other) redirect('/dashboard');

  return (
    <SessionConflictClient
      deviceLabel={other.device_label || 'Another device'}
      location={[other.city, other.country].filter(Boolean).join(', ')}
      lastSeenAt={other.last_seen_at}
    />
  );
}
