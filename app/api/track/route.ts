import { NextResponse } from 'next/server';

// Runs on the EDGE runtime, pinned to bom1 next to Supabase. `force-dynamic`
// keeps the endpoint from ever being cached.
//
// 2026-10-07: the inserts are two plain PostgREST POSTs instead of a
// @supabase/supabase-js service client. Vercel now bills this route on Fluid
// Active CPU (14s per 12h, ~80ms a call), and most of that was the client:
// loading the library on a cold start, then building auth + realtime clients
// and reading a (non-existent) session on every insert. The requests are the
// ones supabase-js sent for `.from(t).insert(rows)` — same URL and `columns`
// list, same service-role apikey/Authorization headers, same Content-Profile —
// so the rows written are identical. Failures are still swallowed and the
// response is still `{ ok: true }`, exactly as before.
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
 * The request supabase-js makes for `.from(table).insert(rows)` with a
 * service-role client: POST /rest/v1/<table>?columns="a","b",… with the key as
 * both apikey and Bearer token. Errors are swallowed, as supabase-js did (it
 * returned `{ error }` instead of throwing), so one failed table never stops
 * the other or changes the response.
 */
async function insertRows(
  supabaseUrl: string,
  serviceKey: string,
  table: 'page_events' | 'user_actions',
  rows: object[],
): Promise<void> {
  try {
    const endpoint = new URL(`rest/v1/${table}`, supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`);
    const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    if (columns.length) endpoint.searchParams.set('columns', columns.map((c) => `"${c}"`).join(','));
    const res = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Content-Profile': 'public',
      },
      body: JSON.stringify(rows),
    });
    // Drain the (empty) body so the connection is released.
    await res.text().catch(() => '');
  } catch {
    // Best-effort, like before.
  }
}

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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    // supabase-js threw here when either was missing → the catch below.
    if (!url || !key) return NextResponse.json({ ok: false });

    // Insert page events (view/leave) and action events. Independent tables,
    // so the two writes run side by side.
    await Promise.all([
      pageEvents.length ? insertRows(url, key, 'page_events', pageEvents) : null,
      actionEvents.length ? insertRows(url, key, 'user_actions', actionEvents) : null,
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    // Never break the page over analytics.
    return NextResponse.json({ ok: false });
  }
}
