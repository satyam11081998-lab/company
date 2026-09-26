'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabase/client';
import { ensureGuestSession } from '@/lib/guest';
import { useNavLoading } from '@/components/guest/nav-loading';

export type EntryState = 'loading' | 'visitor' | 'guest' | 'member';

/**
 * The US marketing pages' entry logic, shared by the header and every CTA.
 *
 * Same behaviour as components/auth-cta.tsx (which stays the India pages'
 * component, untouched): a visitor's "Start practicing" mints an anonymous
 * session ON CLICK — never on mount, so crawlers never create accounts — then
 * hard-navigates to /dashboard so the first server render already carries the
 * session cookie. A signed-in person just opens the app.
 */
export function useUsEntry() {
  const [state, setState] = useState<EntryState>('loading');
  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { navigate, overlay } = useNavLoading('Loading…');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let alive = true;
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!alive) return;
        setState(!user ? 'visitor' : user.is_anonymous ? 'guest' : 'member');
      })
      .catch(() => alive && setState('visitor'));
    return () => {
      alive = false;
    };
  }, []);

  async function startPracticing() {
    if (busy) return;
    if (state === 'member' || state === 'guest') {
      navigate('/dashboard');
      return;
    }
    setBusy(true);
    try {
      await ensureGuestSession();
      const supabase = createClient();
      for (let i = 0; i < 20; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch {
      /* fall through: a hard load still lands somewhere sane */
    }
    window.location.assign('/dashboard');
  }

  const busyOverlay =
    busy && mounted
      ? createPortal(
          <div role="status" aria-live="polite" className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary motion-reduce:animate-none" />
            <p className="text-[15px] font-semibold text-foreground">Opening today&apos;s practice…</p>
            <p className="text-[13px] text-muted-foreground">No account needed to start.</p>
          </div>,
          document.body,
        )
      : null;

  return { state, busy, startPracticing, navigate, overlays: <>{overlay}{busyOverlay}</> };
}
