'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side "does this viewer have full deck access?" check for the PUBLIC
 * deck page (/decks/[slug]), which lives OUTSIDE the (app) layout and therefore
 * has no UserProvider to read from.
 *
 * Full access = admin, or an unexpired Pro subscription — the same rule the
 * server uses in app/(app)/skeletons/page.tsx and the deck image route. Reads
 * the caller's OWN users row (RLS allows auth.uid() = id), so it exposes nothing
 * about anyone else.
 *
 * Returns { loading, isPro }. `isPro` stays false while loading and for
 * logged-out / free viewers, so a component can safely default to the locked
 * experience until this resolves.
 */
export function useIsProViewer(): { loading: boolean; isPro: boolean } {
  const [state, setState] = useState<{ loading: boolean; isPro: boolean }>({
    loading: true,
    isPro: false,
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth
      .getUser()
      .then(async ({ data: { user } }) => {
        if (cancelled) return;
        if (!user) {
          setState({ loading: false, isPro: false });
          return;
        }
        const { data } = await supabase
          .from('users')
          .select('subscription_tier, subscription_expires_at, is_admin')
          .eq('id', user.id)
          .maybeSingle();
        if (cancelled) return;
        const isPro =
          !!data &&
          (data.is_admin === true ||
            (data.subscription_tier === 'pro' &&
              (!data.subscription_expires_at ||
                new Date(data.subscription_expires_at) > new Date())));
        setState({ loading: false, isPro });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, isPro: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
