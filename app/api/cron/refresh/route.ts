import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Hobby-safe cap. This route is a resilient "kick", not the worker.

/**
 * Vercel Cron → daily content refresh. Independent, redundant trigger alongside
 * the GitHub Actions `daily-news.yml` schedule (both idempotent, safe to double-fire).
 *
 * Scheduled in vercel.json at 00:30 UTC (06:00 IST). Vercel sends
 * `Authorization: Bearer <CRON_SECRET>`; we also accept `x-cron-secret` so an
 * uptime pinger or manual curl can trigger it.
 *
 * Design for the sleep-prone free-tier Render backend:
 *   1. WARM-UP LOOP — poll /health until 200 (bounded), so we don't fire work
 *      into a cold dyno. Cold starts are 30-60s; we spend the budget waking it.
 *   2. RETRIED KICKS — POST the jobs with a short timeout + one retry. A timeout
 *      is NOT treated as failure: the backend endpoints are idempotent and run
 *      to completion server-side (and GitHub Actions covers the long tail), so a
 *      slow-but-working backend must never surface as a "failed cron".
 *   3. ALWAYS 200 (unless unauthorised) with a JSON summary for observability.
 */

const HEALTH_TIMEOUT_MS = 8_000;
const WARM_BUDGET_MS = 34_000;
const WARM_GAP_MS = 3_000;
const KICK_TIMEOUT_MS = 18_000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function warmBackend(api: string) {
  const deadline = Date.now() + WARM_BUDGET_MS;
  let attempts = 0;
  while (Date.now() < deadline) {
    attempts++;
    try {
      const r = await fetch(`${api}/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
      });
      if (r.ok) return { warm: true, attempts };
    } catch {
      /* cold start / asleep — keep polling */
    }
    if (Date.now() + WARM_GAP_MS < deadline) await sleep(WARM_GAP_MS);
  }
  return { warm: false, attempts };
}

async function kick(api: string, secret: string, path: string, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(`${api}${path}`, {
        method: 'POST',
        headers: { 'x-cron-secret': secret, 'content-type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(KICK_TIMEOUT_MS),
      });
      return { path, status: r.status, ok: r.ok, attempt: i + 1 };
    } catch (e: unknown) {
      // Timeout/abort here usually means the backend is awake and STILL WORKING
      // (idempotent, completes server-side). Only the last failure is reported,
      // and as `kicked` rather than a hard error so the cron isn't a false-fail.
      if (i === retries) {
        return { path, kicked: true, note: 'no response in budget (work continues server-side)', error: String((e as Error)?.message || e) };
      }
      await sleep(4_000);
    }
  }
}

export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  const auth = req.headers.get('authorization') || '';
  const headerSecret = (req.headers.get('x-cron-secret') || '').trim();
  const authorized = !!secret && (auth === `Bearer ${secret}` || headerSecret === secret);
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const api = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (!api) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL not set' }, { status: 500 });
  }

  const warm = await warmBackend(api);
  const results = await Promise.all([
    kick(api, secret, '/cron/fetch-news'),
    kick(api, secret, '/cron/schedule-daily'),
  ]);

  // Always 200: the kick was delivered. Completion is guaranteed by the
  // backend's idempotency + the GitHub Actions long-timeout runner.
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), warm, results });
}
