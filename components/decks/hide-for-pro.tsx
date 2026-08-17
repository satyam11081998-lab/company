'use client';

import { useIsProViewer } from '@/lib/use-deck-access';

/**
 * Hides its children once the viewer is confirmed Pro/admin.
 *
 * Used to drop the upgrade paywall CTA on a public deck page for someone who
 * already has full access. Renders children by default (and for logged-out /
 * free viewers), so the paywall stays in the server HTML for crawlers and is
 * never flash-hidden from a free user — only a confirmed Pro sees it disappear.
 */
export default function HideForPro({ children }: { children: React.ReactNode }) {
  const { isPro } = useIsProViewer();
  if (isPro) return null;
  return <>{children}</>;
}
