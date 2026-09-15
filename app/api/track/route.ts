import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

// Runs on the EDGE runtime, not Node. `createServiceClient` is a plain
// fetch-based @supabase/supabase-js client with no Node built-ins, so it runs
// fine on Edge — and analytics ingestion (by far the highest-frequency route on
// the site: a beacon per page view + leave for every visitor) therefore stays
// OFF the Fluid/Node Active-CPU budget entirely and rides the much-higher Edge
// tier instead. Pinned to bom1 to sit next to the primary/Supabase region.
// `force-dynamic` keeps the endpoint from ever being cached.
export const runtime = 'edge';
export const preferredRegion = 'bom1';
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
  // Action-specific fields
  action?: string;
  category?: string;
  label?: string;
  value?: Record<string, unknown> | null;
}

interface CleanPageEvent {
  session_id: string;
  user_id: string | null;
  kind: 'view' | 'leave';
  path: string;
  referrer: string | null;
  duration_ms: number | null;
  device: 'mobile' | 'desktop' | null;
  ua: string | null;
}

interface CleanActionEvent {
  session_id: string;
  user_id: string | null;
  path: string;
  action: string;
  category: string | null;
  label: string | null;
  value: Record<string, unknown> | null;
  device: 'mobile' | 'desktop' | null;
}

const s = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.length ? v.slice(0, max) : null;

/**
 * Best-effort ingest for PageTracker and useTrackAction.
 *
 * Accepts three event kinds:
 * - `view` / `leave` → inserted into `page_events` (unchanged behaviour)
 * - `action` → inserted into the new `user_actions` table
 *
 * Public endpoint (guests are tracked too), but writes go through the SERVICE
 * client server-side — both tables have RLS on with no policies, so they are
 * unreadable/unwritable from any client.
 *
 * Always returns 200-ish; a tracking failure must never surface to the visitor.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json().catch(() => null)) as unknown;
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false });

    const raw: RawEvent[] = Array.isArray((body as { events?: unknown }).events)
      ? ((body as { events: RawEvent[] }).events)
      : [body as RawEvent];

    const pageEvents: CleanPageEvent[] = [];
    const actionEvents: CleanActionEvent[] = [];

    for (const e of raw.slice(0, 20)) {
      if (e.kind === 'action') {
        // Action event → user_actions table
        const actionName = s(e.action, 128);
        if (!actionName) continue; // skip actions without a name
        actionEvents.push({
          session_id: s(e.sid, 64) ?? 'anon',
          user_id: s(e.uid, 64),
          path: s(e.path, 512) ?? '/',
          action: actionName,
          category: s(e.category, 64),
          label: s(e.label, 256),
          value: e.value && typeof e.value === 'object' ? e.value : null,
          device: e.dev === 'mobile' ? 'mobile' : e.dev === 'desktop' ? 'desktop' : null,
        });
      } else {
        // Page event (view/leave) → page_events table (unchanged)
        pageEvents.push({
          session_id: s(e.sid, 64) ?? 'anon',
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
        });
      }
    }

    const svc = createServiceClient();

    // Insert page events (view/leave)
    if (pageEvents.length) {
      await svc.from('page_events').insert(pageEvents);
    }

    // Insert action events
    if (actionEvents.length) {
      await svc.from('user_actions').insert(actionEvents);
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Never break the page over analytics.
    return NextResponse.json({ ok: false });
  }
}
