'use client';

import { useEffect } from 'react';
import { marketForTimeZone, REGION_COOKIE, TZ_COOKIE } from '@/lib/market';

function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!m) return null;
  try { return decodeURIComponent(m[1]); } catch { return m[1]; }
}

/**
 * Hands the server the one region signal a VPN cannot change: the browser's
 * timezone. Renders nothing.
 *
 * 1. Writes the IANA zone to the `mece_tz` cookie, so every later request is
 *    placed by IP country AND clock (lib/market.ts detectRegion).
 * 2. On the very first visit the server had to decide on IP alone (cookie
 *    `mece_rg` ends in `.ip`). If that decision was India but the clock is
 *    foreign — the signature of a VPN into India — reload ONCE so the server
 *    re-decides with the clock and routes to the international site.
 *
 * Loop-proof: at most one reload per tab session, and none when cookies are
 * disabled (the reload could never change the outcome).
 */
export default function RegionProbe() {
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.cookieEnabled === false) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return;

      if (readCookie(TZ_COOKIE) !== tz) {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
      }

      const rg = readCookie(REGION_COOKIE);
      if (!rg) return;
      const [decided, basis] = rg.split('.');
      if (basis !== 'ip' || decided !== 'IN') return;
      const byClock = marketForTimeZone(tz);
      if (!byClock || byClock === 'IN') return;
      // The cookie write must have stuck, or a reload cannot change anything.
      if (readCookie(TZ_COOKIE) !== tz) return;
      if (window.sessionStorage.getItem('mece_rg_reloaded')) return;
      window.sessionStorage.setItem('mece_rg_reloaded', '1');
      window.location.reload();
    } catch {
      // Never let a region hint break a page.
    }
  }, []);
  return null;
}
