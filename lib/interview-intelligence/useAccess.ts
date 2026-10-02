'use client';

import { useEffect, useState } from 'react';
import { ii } from './api';

/**
 * Should the app nav show the Interview Intelligence link?
 *
 * Asks II (`/v1/access`) once per page load per user, shared by the desktop "More" menu and
 * the mobile "More" sheet. So a test user an admin adds sees the link after a refresh, and
 * loses it after a refresh once removed (or disabled). II makes the decision — this only
 * mirrors it, and the page itself re-checks. Any error (II off, network, guest) → hidden.
 */
let cache: { userId: string; result: Promise<boolean> } | null = null;

function check(userId: string): Promise<boolean> {
  if (!cache || cache.userId !== userId) {
    cache = { userId, result: ii.access().then((a) => a.allowed === true).catch(() => false) };
  }
  return cache.result;
}

export function useIIAccess(userId: string | null | undefined): boolean {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (!userId) {
      setAllowed(false);
      return;
    }
    let live = true;
    check(userId).then((v) => { if (live) setAllowed(v); });
    return () => { live = false; };
  }, [userId]);
  return allowed;
}
