'use client';

/**
 * Activity bar for the CRM: a thin bar across the top of the screen while the
 * CRM is waiting on the server — page navigations, refreshes and every server
 * action (save, delete, send, sync …). It watches same-origin fetches that
 * Next.js makes for those (RSC navigations carry `RSC: 1`; server actions carry
 * `Next-Action`), ignoring background prefetches, plus clicks on internal
 * links (which can wait on a prefetch first), so every button and link gets
 * feedback without each one wiring its own spinner. Shows only after 120 ms to avoid
 * flicker; respects prefers-reduced-motion. The original fetch is restored on
 * unmount, and nothing about the request or response is changed.
 */
import { useEffect, useRef, useState } from 'react';

type HeaderBag = Headers | Record<string, string> | Array<[string, string]> | undefined;

function header(h: HeaderBag, name: string): string | null {
  if (!h) return null;
  if (typeof Headers !== 'undefined' && h instanceof Headers) return h.get(name);
  if (Array.isArray(h)) return h.find(([k]) => k.toLowerCase() === name.toLowerCase())?.[1] ?? null;
  const k = Object.keys(h).find((x) => x.toLowerCase() === name.toLowerCase());
  return k ? (h as Record<string, string>)[k] : null;
}

/** Does this fetch represent work the user is waiting for? */
function isTracked(input: RequestInfo | URL, init?: RequestInit): boolean {
  try {
    const req = typeof Request !== 'undefined' && input instanceof Request ? input : null;
    const url = new URL(req ? req.url : String(input), window.location.href);
    if (url.origin !== window.location.origin) return false;
    const h = (init?.headers ?? req?.headers) as HeaderBag;
    if (header(h, 'next-router-prefetch')) return false;
    return !!header(h, 'next-action') || header(h, 'rsc') === '1';
  } catch {
    return false;
  }
}

export default function NavProgress() {
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const active = useRef(0);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const original = window.fetch;
    const begin = () => {
      active.current += 1;
      if (active.current > 1) return;
      if (showTimer.current) clearTimeout(showTimer.current);
      showTimer.current = setTimeout(() => {
        setVisible(true);
        setWidth(12);
        if (tick.current) clearInterval(tick.current);
        // creep toward 90% and never get there until the work is done
        tick.current = setInterval(() => setWidth((w) => (w < 90 ? w + (90 - w) * 0.08 : w)), 180);
      }, 120);
    };
    const end = () => {
      active.current = Math.max(0, active.current - 1);
      if (active.current > 0) return;
      if (showTimer.current) clearTimeout(showTimer.current);
      if (tick.current) clearInterval(tick.current);
      setWidth(100);
      setTimeout(() => { if (active.current === 0) { setVisible(false); setWidth(0); } }, 250);
    };
    const wrapped: typeof window.fetch = (input, init) => {
      if (!isTracked(input, init)) return original(input, init);
      begin();
      return original(input, init).finally(end);
    };
    window.fetch = wrapped;

    // A click on an internal link starts the bar at once — Next.js may first
    // fetch the page's loading shell (a prefetch, which we don't track above),
    // and that wait must not feel like nothing happened. It ends when the URL
    // changes, or after 15 s at most.
    let navTimer: ReturnType<typeof setInterval> | null = null;
    let navActive = false;
    const endNav = () => { if (!navActive) return; navActive = false; if (navTimer) clearInterval(navTimer); navTimer = null; end(); };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (url.origin !== window.location.origin) return;
      const here = window.location;
      if (url.pathname === here.pathname && url.search === here.search) return; // same page / hash link
      if (navActive) endNav();
      navActive = true;
      begin();
      const from = here.href;
      const started = Date.now();
      navTimer = setInterval(() => { if (window.location.href !== from || Date.now() - started > 15_000) endNav(); }, 80);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (navTimer) clearInterval(navTimer);
      if (window.fetch === wrapped) window.fetch = original;
      if (showTimer.current) clearTimeout(showTimer.current);
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px]">
      <div
        aria-hidden
        className="h-full bg-gradient-to-r from-[#C8102E] to-navy shadow-[0_0_8px_rgba(200,16,46,0.45)] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
      {visible && <span className="sr-only" role="status">Loading…</span>}
    </div>
  );
}
