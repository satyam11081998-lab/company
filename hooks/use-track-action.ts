'use client';

/**
 * useTrackAction — fire-and-forget user action tracking hook.
 *
 * Usage:
 *   const trackAction = useTrackAction();
 *   trackAction('start_case', 'case', 'Profitability Case #12', { case_id: '...' });
 *
 * Events are sent to /api/track as { kind: 'action', ... } and stored in the
 * `user_actions` table. The hook automatically attaches the current session ID,
 * user ID, page path, and device type.
 *
 * Like PageTracker, this never throws and never blocks the UI.
 */

import { useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getSid, getDevice, sendEvent } from '@/lib/analytics';

type TrackActionFn = (
  action: string,
  category?: string,
  label?: string,
  value?: Record<string, unknown>,
) => void;

export function useTrackAction(): TrackActionFn {
  const pathname = usePathname();
  const uidRef = useRef<string | null>(null);

  // Resolve the signed-in user id once.
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

  return useCallback(
    (
      action: string,
      category?: string,
      label?: string,
      value?: Record<string, unknown>,
    ) => {
      sendEvent({
        kind: 'action',
        sid: getSid(),
        uid: uidRef.current,
        path: pathname,
        action,
        category: category ?? null,
        label: label ?? null,
        value: value ?? null,
        dev: getDevice(),
      });
    },
    [pathname],
  );
}
