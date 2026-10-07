import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * On-demand refresh of the home page ("/") — 2026-10-07.
 *
 * "/" is a cached (ISR) page whose only time-sensitive content is today's
 * daily case + guesstimate. It used to re-render every 5 minutes just in case
 * that pair had changed (~0.4s of Vercel Active CPU per render). Now it is
 * re-rendered when the pair actually changes:
 *   - the backend calls this right after it writes today's daily_schedule row
 *     (consilio-backend services/daily_scheduler.py, _refresh_frontend_home);
 *   - the daily Vercel cron calls revalidatePath('/', 'page') itself when its kick
 *     completes (app/api/cron/refresh).
 * Testimonial edits already refresh "/" from their admin action. The page's
 * own `revalidate` (1 hour) remains as the fallback.
 *
 * Auth: the shared CRON_SECRET, accepted the same two ways as the cron route.
 * It can only mark "/" stale — no data in or out.
 */
export async function POST(req: Request) {
  const secret = (process.env.CRON_SECRET || '').trim();
  const auth = req.headers.get('authorization') || '';
  const headerSecret = (req.headers.get('x-cron-secret') || '').trim();
  const authorized = !!secret && (auth === `Bearer ${secret}` || headerSecret === secret);
  if (!authorized) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  // 'page' = the home page only (tag "_N_T_/page", which no other page has).
  // A bare revalidatePath('/') targets "_N_T_/", and on Vercel that appeared to
  // clear every other cached page too: after the first call on 2026-10-07 even
  // /llms.txt, which nothing else refreshes, came back REVALIDATED.
  revalidatePath('/', 'page');
  return NextResponse.json({ ok: true, revalidated: '/' });
}
