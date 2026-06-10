import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Vercel Cron → daily content refresh (reliable backup for the GitHub Actions
 * schedules, which silently stop after 60 days of repo inactivity and are the
 * likely reason the daily brief stopped updating).
 *
 * Scheduled in vercel.json at 00:30 UTC (06:00 IST). Vercel automatically sends
 * `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set in the project
 * env — the same secret the admin actions already use to call the backend.
 *
 * It wakes the (free-tier, sleep-prone) Render backend, then fires the two
 * cron jobs: fetch-news (new headlines + a fresh star for the dashboard brief)
 * and schedule-daily (today's case + guesstimate). Both are idempotent.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  const auth = req.headers.get('authorization') || '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL not set' }, { status: 500 });
  }

  // Wake the backend first (Render cold-start guard) so the cron calls don't
  // race the wake-up. Best-effort; ignore failures.
  try {
    await fetch(`${api}/health`, { cache: 'no-store', signal: AbortSignal.timeout(55_000) });
  } catch {
    /* the POSTs below will retry the wake implicitly */
  }

  const hit = async (path: string) => {
    try {
      const r = await fetch(`${api}${path}`, {
        method: 'POST',
        headers: { 'x-cron-secret': secret, 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(55_000),
      });
      return { path, status: r.status, ok: r.ok };
    } catch (e: any) {
      return { path, error: String(e?.message || e) };
    }
  };

  const results = await Promise.all([hit('/cron/fetch-news'), hit('/cron/schedule-daily')]);
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
}
