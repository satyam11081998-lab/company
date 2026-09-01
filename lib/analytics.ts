/**
 * Shared client-side analytics utilities.
 *
 * Used by both `components/analytics/page-tracker.tsx` (page views) and
 * `hooks/use-track-action.ts` (user action events). Extracted here to
 * avoid duplicating session-ID generation and beacon logic.
 *
 * These helpers are purely client-side and must never throw — a failed
 * beacon must never break the page.
 */

const SID_KEY = 'mece:sid';

/** Get or create an anonymous session ID stored in localStorage. */
export function getSid(): string {
  try {
    let v = localStorage.getItem(SID_KEY);
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(SID_KEY, v);
    }
    return v;
  } catch {
    return 'anon';
  }
}

/** Detect whether the visitor is on mobile or desktop. */
export function getDevice(): 'mobile' | 'desktop' | null {
  if (typeof navigator === 'undefined') return null;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

/** Fire-and-forget beacon to /api/track. Never throws. */
export function sendEvent(payload: Record<string, unknown>): void {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/track', {
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
