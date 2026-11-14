import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { runLifecycle } from '@/lib/lifecycle/run';

export const dynamic = 'force-dynamic';
// Node, not edge: the send path uses nodemailer and crypto.
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * The nightly lifecycle mail.
 *
 * Safe to call as often as you like — every minute, if you want. The job decides
 * for itself whether this is the right hour and whether today's mail has already
 * gone out, and `crm_outbox.dedupe_key` is UNIQUE, so a duplicate can't be sent
 * even if two pingers fire at once. That is why this is a GET with no body: point
 * any scheduler at it and forget about it.
 *
 * Mode lives in the CRM settings, not here. Until somebody sets it to `auto` in
 * /admin/daily-email, this endpoint only ever mails the test address.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` (what Vercel Cron sends) or
 * `x-cron-secret: <CRON_SECRET>`. Fails closed when CRON_SECRET isn't set.
 *
 * Query:
 *   ?market=IN|US   restrict to one market
 *   ?dry=1          build and report, send nothing, write nothing
 *   ?force=1        ignore the hour window and the already-ran ledger
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') ?? '';
  const alt = req.headers.get('x-cron-secret') ?? '';
  const same = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
  };
  if (!secret || (!same(auth, `Bearer ${secret}`) && !same(alt, secret))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const q = new URL(req.url).searchParams;
  const m = (q.get('market') || '').toUpperCase();
  try {
    const result = await runLifecycle({
      only: m === 'US' ? 'US' : m === 'IN' ? 'IN' : undefined,
      dryRun: q.get('dry') === '1',
      force: q.get('force') === '1',
    });
    const errors = [...result.digests, ...result.nudges].filter((r) => r.error).map((r) => `${r.market}: ${r.error}`);
    return NextResponse.json({ ok: errors.length === 0, ...result, ...(errors.length ? { errors } : {}) });
  } catch (e) {
    console.error('[cron/daily-email] failed:', e);
    return NextResponse.json({ ok: false, error: String((e as Error)?.message ?? e).slice(0, 300) }, { status: 500 });
  }
}
