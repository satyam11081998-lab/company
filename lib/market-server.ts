import { detectRegion, normalizeMarket, isMarket, TZ_COOKIE, type Market } from '@/lib/market';

/**
 * Server-side reads/writes of `users.market` (migration 0070).
 *
 * The account's market is STAMPED ONCE, server-side, from request signals the
 * browser cannot set directly (Vercel's IP-country header) plus the timezone
 * cookie, and is then LOCKED: `market` is not in the column-level UPDATE grant
 * that 0054 gives the `authenticated` role, and the 0070 guard trigger reverts
 * it for any non-service-role writer. Only the service role (this module, the
 * admin panel) can ever change it.
 *
 * DEPLOY-ORDER SAFETY: before 0070 runs there is no `market` column. Selecting
 * it makes PostgREST return an error; every read here treats exactly that
 * error as "legacy India" — which is what every pre-0070 account is. Any OTHER
 * error is surfaced to the caller (a transient outage must not silently price
 * someone in the wrong currency).
 */

type Svc = {
  from: (t: string) => any;
};

export type MarketRead =
  | { ok: true; market: Market | null; columnMissing: boolean }
  | { ok: false; error: string };

function isMissingMarketColumn(err: { message?: string; code?: string } | null | undefined): boolean {
  const m = (err?.message || '').toLowerCase();
  // 42703 = undefined_column (Postgres); PGRST204 = column not in schema cache.
  return (err?.code === '42703' || err?.code === 'PGRST204' || m.includes('does not exist') || m.includes('schema cache'))
    && m.includes('market');
}

/** Raw read: `market: null` means "not stamped yet". */
export async function readUserMarket(svc: Svc, userId: string): Promise<MarketRead> {
  try {
    const { data, error } = await svc.from('users').select('market').eq('id', userId).maybeSingle();
    if (error) {
      if (isMissingMarketColumn(error)) return { ok: true, market: 'IN', columnMissing: true };
      return { ok: false, error: error.message || 'users read failed' };
    }
    const raw = (data as { market?: unknown } | null)?.market;
    return { ok: true, market: isMarket(raw) ? raw : null, columnMissing: false };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Region signals from an incoming request (route handlers / middleware). */
export function signalsFromRequest(req: { headers: Headers; cookies?: { get: (n: string) => { value: string } | undefined } }): {
  ipCountry: string | null;
  timeZone: string | null;
} {
  const ipCountry = req.headers.get('x-vercel-ip-country');
  let timeZone: string | null = null;
  if (req.cookies) {
    timeZone = req.cookies.get(TZ_COOKIE)?.value ?? null;
  } else {
    const raw = req.headers.get('cookie') || '';
    const m = raw.match(new RegExp(`(?:^|;\\s*)${TZ_COOKIE}=([^;]+)`));
    timeZone = m ? m[1] : null;
  }
  if (timeZone) {
    try { timeZone = decodeURIComponent(timeZone); } catch { /* keep raw */ }
  }
  return { ipCountry, timeZone };
}

/**
 * Stamp `users.market` if (and only if) it is still NULL, then return the
 * account's market. The conditional update (`.is('market', null)`) makes two
 * racing requests converge on whichever wrote first — a stamp is never
 * overwritten by a later, differently-located request.
 */
export async function ensureUserMarket(
  svc: Svc,
  userId: string,
  signals: { ipCountry?: string | null; timeZone?: string | null },
): Promise<MarketRead> {
  const read = await readUserMarket(svc, userId);
  if (!read.ok) return read;
  if (read.market !== null) return read;

  const decided = detectRegion(signals).market;
  try {
    const { error } = await svc.from('users').update({ market: decided }).eq('id', userId).is('market', null);
    if (error) return { ok: false, error: error.message || 'market stamp failed' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
  // Re-read so a concurrent stamp that won the race is what we report.
  const after = await readUserMarket(svc, userId);
  if (!after.ok) return after;
  return { ok: true, market: after.market ?? decided, columnMissing: false };
}

/** Convenience: the market to use for money decisions, or an error string. */
export async function marketForCheckout(
  svc: Svc,
  userId: string,
  req: { headers: Headers },
): Promise<{ ok: true; market: Market } | { ok: false; error: string }> {
  const r = await ensureUserMarket(svc, userId, signalsFromRequest(req));
  if (!r.ok) return r;
  return { ok: true, market: normalizeMarket(r.market) };
}
