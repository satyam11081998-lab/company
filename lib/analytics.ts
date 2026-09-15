/**
 * Shared client-side analytics utilities.
 *
 * Used by both `components/analytics/page-tracker.tsx` (page views) and
 * `hooks/use-track-action.ts` (user action events). Extracted here to
 * avoid duplicating session-ID generation and beacon logic.
 *
 * These helpers are purely client-side and must never throw — a failed
 * beacon must never break the page.
 *
 * BEACON COALESCING (perf): instead of one network request per event, events
 * are pushed onto a tiny in-memory queue and flushed together as a single
 * `{ events: [...] }` POST to /api/track. In a typical multi-page session the
 * "leave" of the current page and the "view" of the next page fire in the same
 * tick (SPA route change) and batch into ONE request — roughly halving the
 * number of serverless invocations the site makes, with NO change to which
 * events get stored. The /api/track route already accepts an `events` array.
 *
 * NO-LOSS ON UNLOAD: a `pagehide` / `visibilitychange:hidden` listener flushes
 * the queue SYNCHRONOUSLY via sendBeacon, and any event enqueued while the page
 * is hidden/unloading is flushed immediately instead of debounced — so nothing
 * is dropped when the tab closes or is backgrounded. Duration is captured when
 * the event is created (not at flush time), so batching never skews time-on-page.
 */

const SID_KEY = 'mece:sid';
const TRACK_URL = '/api/track';
const FLUSH_DEBOUNCE_MS = 800; // coalesce events fired close together (SPA nav)
const MAX_BATCH = 20; // /api/track ingests at most 20 events per request

/** Get or create an anonymous session ID stored in localStorage.
 *  Kept short and readable (~8 chars) so the admin dashboard can show a tidy
 *  "Anon-XXXX" code instead of a 25-char blob. */
export function getSid(): string {
  try {
    let v = localStorage.getItem(SID_KEY);
    if (!v) {
      v = Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 5);
      localStorage.setItem(SID_KEY, v);
    }
    return v;
  } catch {
    return 'anon';
  }
}

/** A short, stable, human-readable label for an anonymous visitor's session,
 *  e.g. "Anon-7F3A". Derived from the session id so it is consistent per visitor
 *  and works for both new short ids and older long ones. */
export function anonLabel(sessionId: string): string {
  const tail = (sessionId || 'anon').replace(/[^a-z0-9]/gi, '').slice(-4).toUpperCase();
  return `Anon-${tail || 'XXXX'}`;
}

/** Detect whether the visitor is on mobile or desktop. */
export function getDevice(): 'mobile' | 'desktop' | null {
  if (typeof navigator === 'undefined') return null;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

// ── Batched beacon queue ──────────────────────────────────────────────────
type Payload = Record<string, unknown>;

let queue: Payload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let unloading = false;
let listenersBound = false;

/** POST a single chunk of events. sendBeacon first (survives unload); fetch
 *  keepalive as the fallback when sendBeacon is unavailable or refuses the
 *  payload. Never throws. */
function post(events: Payload[]): void {
  if (!events.length) return;
  try {
    const body = JSON.stringify({ events });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const queued = navigator.sendBeacon(TRACK_URL, new Blob([body], { type: 'application/json' }));
      if (queued) return; // accepted by the browser's background-send queue
      // sendBeacon can refuse (payload too large / send-queue full) → fall through.
    }
    if (typeof fetch === 'function') {
      fetch(TRACK_URL, {
        method: 'POST',
        body,
        keepalive: true,
        headers: { 'content-type': 'application/json' },
      }).catch(() => {});
    }
  } catch {
    /* analytics must never break the page */
  }
}

/** Drain the queue now, in chunks of at most MAX_BATCH events per request. */
function flush(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;
  const pending = queue;
  queue = []; // swap out before sending so nothing can be posted twice
  for (let i = 0; i < pending.length; i += MAX_BATCH) {
    post(pending.slice(i, i + MAX_BATCH));
  }
}

/** Bind the unload flush listeners exactly once. Called lazily from sendEvent
 *  so the module never touches window/document at import time (SSR-safe). */
function bindUnloadFlush(): void {
  if (listenersBound || typeof window === 'undefined' || typeof document === 'undefined') return;
  listenersBound = true;
  const hide = () => {
    unloading = true;
    flush();
  };
  const show = () => {
    unloading = false; // bfcache restore / tab refocus → resume batching
  };
  // `pagehide` is the reliable unload signal (real navigations away + bfcache);
  // `visibilitychange:hidden` covers mobile tab-switch/kill where pagehide may
  // not fire. Both just flush what's queued — idempotent and cheap.
  window.addEventListener('pagehide', hide);
  window.addEventListener('pageshow', show);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') hide();
    else show();
  });
}

/**
 * Fire-and-forget analytics event. Coalesces into batched POSTs to /api/track.
 * Never throws, never blocks the UI.
 *
 * An event enqueued while the page is hidden or unloading is flushed
 * immediately (synchronously, via sendBeacon) rather than debounced, so the
 * final "leave" on tab close is never lost regardless of listener order.
 */
export function sendEvent(payload: Payload): void {
  try {
    bindUnloadFlush();
    queue.push(payload);

    const hidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
    if (unloading || hidden || queue.length >= MAX_BATCH || typeof window === 'undefined') {
      flush();
      return;
    }
    if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DEBOUNCE_MS);
  } catch {
    /* analytics must never break the page */
  }
}
