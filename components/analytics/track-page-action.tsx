'use client';

/**
 * TrackPageAction — mount-time action tracker for server components.
 *
 * Server components cannot use hooks, so this thin client component fires a
 * single action event on mount. Drop it into any server-rendered page:
 *
 *   <TrackPageAction action="view_results" category="case" label={title} value={{ id }} />
 *
 * Renders nothing. Never throws.
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSid, getDevice, sendEvent } from '@/lib/analytics';
import { usePathname } from 'next/navigation';

interface Props {
  action: string;
  category?: string;
  label?: string;
  value?: Record<string, unknown>;
}

export default function TrackPageAction({ action, category, label, value }: Props) {
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    let alive = true;
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (!alive) return;
        sendEvent({
          kind: 'action',
          sid: getSid(),
          uid: data.session?.user?.id ?? null,
          path: pathname,
          action,
          category: category ?? null,
          label: label ?? null,
          value: value ?? null,
          dev: getDevice(),
        });
      })
      .catch(() => {});

    return () => { alive = false; };
  }, [action, category, label, value, pathname]);

  return null;
}
