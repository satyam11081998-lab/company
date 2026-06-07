'use client';

import { useEffect, useState } from 'react';

/**
 * Client-only viewport check. Returns true under the given breakpoint (default 768px).
 *
 * Inline styles (which the Focus+ dashboard leans on heavily for design
 * fidelity) can't respond to CSS media queries — they're applied unconditionally
 * at render time. Rather than rewrite every layout grid in Tailwind classes,
 * components subscribe to this hook and pick a grid template based on the
 * current viewport width.
 *
 * SSR-safe: starts as `false` on the server, syncs to the real value on mount.
 * That can cause a one-frame mismatch on initial paint at narrow widths, but
 * the dashboard's loading.tsx skeleton hides this from users.
 */
export function useIsMobile(breakpointPx = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    // Use modern .addEventListener; fall back for older Safari versions.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    } else {
      mql.addListener(update);
      return () => mql.removeListener(update);
    }
  }, [breakpointPx]);

  return isMobile;
}
