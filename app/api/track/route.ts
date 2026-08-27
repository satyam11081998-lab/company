import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// The service client needs the Node runtime, and analytics must always read
// through — never a cached response.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RawEvent {
  kind?: string;
  sid?: string;
  uid?: string | null;
  path?: string;
  ref?: string | null;
  dur?: number;
  dev?: string;
  ua?: string | null;
}

interface CleanEvent {
  session_id: string;
  user_id: string | null;
  kind: 'view' | 'leave';
  path: string;
  referrer: string | null;
  duration_ms: number | null;
  device: 'mobile' | 'desktop' | null;
  ua: string | null;
}

const s = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length ? v.slice(0, max) : null;

/**
 * Best-effort ingest for PageTracker. Public endpoint (guests are tracked too),
 * but writes go through the SERVICE client server-side — the `page_events` table
 * has RLS on with no policies, so it is unreadable/unwritable from any client.
 * Always returns 200-ish; a tracking failure must never surface to the visitor.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false });

    const raw: RawEvent[] = Array.isArray((body as { events?: unknown }).events)
      ? ((body as { events: RawEvent[] }).events)
      : [body as RawEvent];

    const clean: CleanEvent[] = raw.slice(0, 20).map((e) => ({
      session_id: (s(e.sid, 64) ?? 'anon'),
      user_id: s(e.uid, 64),
      kind: e.kind === 'leave' ? 'leave' : 'view',
      path: s(e.path, 512) ?? '/',
      referrer: s(e.ref, 512),
      duration_ms:
        typeof e.dur === 'number' && Number.isFinite(e.dur)
          ? Math.max(0, Math.min(3_600_000, Math.round(e.dur)))
          : null,
      device: e.dev === 'mobile' ? 'mobile' : e.dev === 'desktop' ? 'desktop' : null,
      ua: s(e.ua, 256),
    }));

    if (!clean.length) return NextResponse.json({ ok: true });

    const svc = createServiceClient();
    await svc.from('page_events').insert(clean);
    return NextResponse.json({ ok: true });
  } catch {
    // Never break the page over analytics.
    return NextResponse.json({ ok: false });
  }
}
