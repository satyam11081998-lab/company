// SERVER ONLY. This module reads next/headers and uses Buffer — importing it
// from a client component will fail the build. (The `server-only` package is
// not a dependency of this repo, so the boundary is documented, not enforced.)
import { headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * One active device per account.
 *
 * Model (deliberately Netflix-shaped, not a hard lockout):
 *   - A login is a row in `user_sessions` keyed by the Supabase JWT
 *     `session_id` claim, live while `revoked_at IS NULL`.
 *   - Sessions never time out on their own. They end when the user signs out,
 *     when they claim the account on another device, or when an admin revokes.
 *   - A SECOND concurrent login is not refused at the auth layer (that would
 *     leave a user whose laptop died locked out with no path back). Instead the
 *     app shell bounces it to /session-conflict, which names the other device
 *     and offers one explicit button to sign that device out and continue.
 *
 * Enforcement lives in the (app) layout, NOT middleware: the layout runs on the
 * Node runtime where the service-role client is available, and keeping it out
 * of middleware means the existing auth/onboarding path is untouched.
 */

export interface LiveSession {
  id: string;
  session_id: string;
  device_label: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  ip: string | null;
  last_seen_at: string;
  created_at: string;
}

/**
 * The `session_id` claim out of a Supabase access token.
 *
 * We do NOT verify the signature here and we do not need to: the caller has
 * already established identity with `auth.getUser()` (which does verify against
 * the auth server). This only reads which *login* the verified user is on.
 * Returns null on anything unexpected so a malformed token degrades to
 * "no session tracking" rather than locking someone out.
 */
export function sessionIdFromAccessToken(accessToken: string | null | undefined): string | null {
  if (!accessToken) return null;
  try {
    const part = accessToken.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const claims = JSON.parse(json) as { session_id?: string };
    return typeof claims.session_id === 'string' && claims.session_id ? claims.session_id : null;
  } catch {
    return null;
  }
}

/** Human-readable device from a user-agent string. Best effort, never throws. */
export function deviceLabelFrom(ua: string | null): string {
  if (!ua) return 'Unknown device';
  const os =
    /Windows NT/i.test(ua) ? 'Windows' :
    /iPhone/i.test(ua) ? 'iPhone' :
    /iPad/i.test(ua) ? 'iPad' :
    /Android/i.test(ua) ? 'Android' :
    /Mac OS X/i.test(ua) ? 'Mac' :
    /Linux/i.test(ua) ? 'Linux' : 'Unknown OS';
  const browser =
    /Edg\//i.test(ua) ? 'Edge' :
    /OPR\//i.test(ua) ? 'Opera' :
    /Chrome\//i.test(ua) ? 'Chrome' :
    /Firefox\//i.test(ua) ? 'Firefox' :
    /Safari\//i.test(ua) ? 'Safari' : 'Browser';
  return `${browser} on ${os}`;
}

/** Request context for a session row. Vercel injects the geo headers. */
export function requestContext(): {
  ip: string | null; city: string | null; region: string | null;
  country: string | null; userAgent: string | null; deviceLabel: string;
} {
  let h: Headers | null = null;
  try { h = headers(); } catch { /* outside a request scope */ }
  const get = (k: string) => (h?.get(k) || null);
  const ip = (get('x-forwarded-for') || '').split(',')[0].trim() || get('x-real-ip');
  const userAgent = get('user-agent');
  const dec = (v: string | null) => {
    if (!v) return null;
    try { return decodeURIComponent(v); } catch { return v; }
  };
  return {
    ip: ip || null,
    city: dec(get('x-vercel-ip-city')),
    region: dec(get('x-vercel-ip-country-region')),
    country: dec(get('x-vercel-ip-country')),
    userAgent,
    deviceLabel: deviceLabelFrom(userAgent),
  };
}

export type SessionState =
  | { status: 'ok' }
  | { status: 'untracked' }              // no session_id claim / table missing
  | { status: 'conflict'; other: LiveSession };

/**
 * Register (or touch) this login, and report whether another device holds the
 * account. NEVER throws: if `user_sessions` does not exist yet, or any query
 * fails, this returns `untracked` and the app behaves exactly as it did before
 * migration 0044. Losing device tracking must never lock anyone out.
 */
export async function touchSession(
  svc: SupabaseClient,
  userId: string,
  sessionId: string | null,
): Promise<SessionState> {
  if (!sessionId) return { status: 'untracked' };

  try {
    const { data, error } = await svc
      .from('user_sessions')
      .select('id, session_id, device_label, city, region, country, ip, last_seen_at, created_at')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('last_seen_at', { ascending: false })
      .limit(10);
    if (error) return { status: 'untracked' };

    const live = (data as LiveSession[] | null) ?? [];
    const mine = live.find((s) => s.session_id === sessionId) ?? null;
    const other = live.find((s) => s.session_id !== sessionId) ?? null;

    // Someone else holds the account and we are not already registered.
    if (!mine && other) return { status: 'conflict', other };

    const ctx = requestContext();
    if (mine) {
      // Throttle the write: one heartbeat per 5 minutes is plenty for the
      // admin "last seen" column and keeps this off the hot path.
      if (Date.now() - new Date(mine.last_seen_at).getTime() > 5 * 60 * 1000) {
        await svc
          .from('user_sessions')
          .update({ last_seen_at: new Date().toISOString(), ip: ctx.ip, city: ctx.city, region: ctx.region, country: ctx.country })
          .eq('id', mine.id);
      }
      return { status: 'ok' };
    }

    // First page view of a brand-new login → claim the account.
    await svc.from('user_sessions').insert({
      user_id: userId,
      session_id: sessionId,
      ip: ctx.ip,
      city: ctx.city,
      region: ctx.region,
      country: ctx.country,
      user_agent: ctx.userAgent,
      device_label: ctx.deviceLabel,
    });
    return { status: 'ok' };
  } catch {
    return { status: 'untracked' };
  }
}

/**
 * Take over the account: revoke every other live session and claim this one.
 * Used by the explicit "sign out my other device" button.
 */
export async function claimSession(
  svc: SupabaseClient,
  userId: string,
  sessionId: string | null,
): Promise<boolean> {
  if (!sessionId) return false;
  try {
    await svc
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString(), revoked_by: 'user' })
      .eq('user_id', userId)
      .is('revoked_at', null)
      .neq('session_id', sessionId);

    const ctx = requestContext();
    const { data: existing } = await svc
      .from('user_sessions').select('id').eq('session_id', sessionId).maybeSingle();
    if (existing) {
      await svc
        .from('user_sessions')
        .update({ revoked_at: null, last_seen_at: new Date().toISOString() })
        .eq('id', (existing as { id: string }).id);
    } else {
      await svc.from('user_sessions').insert({
        user_id: userId,
        session_id: sessionId,
        ip: ctx.ip,
        city: ctx.city,
        region: ctx.region,
        country: ctx.country,
        user_agent: ctx.userAgent,
        device_label: ctx.deviceLabel,
      });
    }
    return true;
  } catch {
    return false;
  }
}

/** Close this login's session row on an explicit sign-out. Never throws. */
export async function endSession(
  svc: SupabaseClient,
  userId: string,
  sessionId: string | null,
): Promise<void> {
  if (!sessionId) return;
  try {
    await svc
      .from('user_sessions')
      .update({ revoked_at: new Date().toISOString(), revoked_by: 'user' })
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .is('revoked_at', null);
  } catch { /* sign-out must never fail on bookkeeping */ }
}
