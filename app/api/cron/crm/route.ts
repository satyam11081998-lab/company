import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/crm/server/svc';
import { runSync } from '@/lib/crm/server/sync';
import { purgeRecords } from '@/lib/crm/server/records';
import { isMissingTable } from '@/lib/crm/server/context';
import { loadMetaWith } from '@/lib/crm/server/meta';
import { runDaily, runTick } from '@/lib/crm/server/jobs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Daily CRM job (vercel.json cron, 01:00 UTC = 06:30 IST):
 *   1. MECE → CRM sync (contacts, accounts, deals, invoices, renewals, cases)
 *   2. purge recycle-bin rows older than 60 days
 *   3. segments (RFM) refresh, SLA stamps + escalation, approved emails,
 *      scheduled workflow actions and cadences (lib/crm/server/jobs.ts)
 *
 * `?scope=tick` runs only the light, frequent part (for an external pinger).
 *
 * Auth: Vercel sends `Authorization: Bearer <CRON_SECRET>`; `x-cron-secret` also works.
 * Fails closed when CRON_SECRET isn't set.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization') ?? '';
  const alt = req.headers.get('x-cron-secret') ?? '';
  const same = (a: string, b: string) => { const x = Buffer.from(a); const y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };
  if (!secret || (!same(auth, `Bearer ${secret}`) && !same(alt, secret))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const svc = createServiceClient();
  const out: Record<string, unknown> = {};
  if (new URL(req.url).searchParams.get('scope') === 'tick') {
    try {
      return NextResponse.json({ ok: true, tick: await runTick(svc, await loadMetaWith(svc)) });
    } catch (e) {
      if (isMissingTable(e as { code?: string; message?: string })) return NextResponse.json({ ok: true, skipped: 'crm tables not migrated' });
      return NextResponse.json({ ok: false, error: (e as Error).message?.slice(0, 300) }, { status: 500 });
    }
  }
  try {
    out.sync = await runSync(svc, 'cron');
  } catch (e) {
    if (isMissingTable(e as { code?: string; message?: string })) return NextResponse.json({ ok: true, skipped: 'crm tables not migrated' });
    out.syncError = (e as Error).message?.slice(0, 300);
  }
  try {
    out.purged = await purgeRecords(svc, null, 'expired', 60);
  } catch (e) {
    out.purgeError = (e as Error).message?.slice(0, 300);
  }
  try {
    out.jobs = await runDaily(svc, await loadMetaWith(svc));
  } catch (e) {
    out.jobsError = (e as Error).message?.slice(0, 300);
  }
  return NextResponse.json({ ok: !out.syncError && !out.jobsError, ...out });
}
