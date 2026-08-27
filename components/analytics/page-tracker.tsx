'use client';

/**
 * PageTracker — lightweight page + time-on-page analytics.
 *
 * Records a 'view' on every route change, and a 'leave' with the time spent when
 * the visitor navigates away or backgrounds the tab (via sendBeacon, which is
 * reliable on unload). An anonymous id in localStorage stitches one visitor's
 * journey; the signed-in user id is attached when available. Admin pages are
 * skipped so your own browsing doesn't pollute the data. It never throws — a
 * failed beacon must never break the page — and it stays entirely client-side,
 * so it does not affect static rendering of "/".
 */

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const SID_KEY = 'mece:sid';

function getSid(): string {
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

function getDevice(): 'mobile' | 'desktop' | null {
  if (typeof navigator === 'undefined') return null;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function send(payload: Record<string, unknown>) {
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

export default function PageTracker() {
  const pathname = usePathname();
  const uidRef = useRef<string | null>(null);

  // Resolve the signed-in user id once (reads the local session, no network).
  useEffect(() => {
    let alive = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (alive) uidRef.current = data.session?.user?.id ?? null;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const sid = getSid();
    const dev = getDevice();
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : null;
    const ref = typeof document !== 'undefined' ? document.referrer || null : null;
    const start = Date.now();

    send({ kind: 'view', sid, uid: uidRef.current, path: pathname, ref, dev, ua });

    let left = false;
    const leave = () => {
      if (left) return;
      left = true;
      send({ kind: 'leave', sid, uid: uidRef.current, path: pathname, dur: Date.now() - start, dev });
    };
    const onVis = () => {
      if (document.visibilityState === 'hidden') leave();
    };
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      leave();
      window.removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [pathname]);

  return null;
}
