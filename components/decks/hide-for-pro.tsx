'use client';

import { useDeckAccess } from '@/lib/use-deck-access';

/**
 * Hides its children once the viewer is confirmed to have full access to this
 * deck (admin, active Pro, whole-vault unlock, or this single deck bought).
 * Renders children by default (and for logged-out / free viewers), so the
 * paywall stays in the server HTML for crawlers and only a confirmed owner sees
 * it disappear.
 */
export default function HideForPro({ skeletonId, children }: { skeletonId?: string; children: React.ReactNode }) {
  const { hasAccess } = useDeckAccess(skeletonId);
  if (hasAccess) return null;
  return <>{children}</>;
}
