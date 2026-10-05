'use client';

import { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { REGION_COOKIE } from '@/lib/market';

/**
 * Thin mobile-only banner suggesting desktop for the best experience.
 * Dismisses on tap of the ✕ and stays hidden for the rest of the session
 * (sessionStorage). Reappears on a fresh tab / next visit.
 * Hidden at xl: breakpoint (≥1280 px) via CSS — zero JS on desktop.
 */
export default function MobileDesktopBanner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() || '';

  useEffect(() => {
    // The US / Europe experience (2026-09-26 redesign) is designed for phones
    // on purpose, so it never asks people to switch device: skip the /us pages
    // and any browser the middleware placed in the US or Europe.
    // MECE Insights articles are built for reading on a phone (most readers arrive from a shared link).
    if (pathname === '/us' || pathname.startsWith('/us/') || pathname === '/insights' || pathname.startsWith('/insights/')) {
      setVisible(false);
      return;
    }
    try {
      const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${REGION_COOKIE}=([^;]*)`));
      const rg = m ? decodeURIComponent(m[1]) : '';
      if (rg.startsWith('US') || rg.startsWith('EU')) {
        setVisible(false);
        return;
      }
    } catch {
      /* no cookie access: fall through to the India behaviour */
    }
    // Only show if not previously dismissed this session
    if (!sessionStorage.getItem('desktop-banner-dismissed')) {
      setVisible(true);
    }
  }, [pathname]);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem('desktop-banner-dismissed', '1');
    setVisible(false);
  };

  return (
    <div
      className="flex xl:hidden items-center justify-center"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'var(--red)',
        color: '#fff',
        gap: 6,
        padding: '6px 36px 6px 12px',
        fontSize: 12,
        fontWeight: 500,
        lineHeight: 1.3,
        letterSpacing: '0.01em',
        textAlign: 'center',
      }}
    >
      <Monitor style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.9 }} />
      <span>For the best experience, switch to desktop</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss banner"
        style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.8,
        }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
