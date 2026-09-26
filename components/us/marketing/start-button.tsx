'use client';

import { ArrowRight } from 'lucide-react';
import { usButton } from '@/components/us/ui';
import { useUsEntry } from '@/components/us/use-us-entry';

/**
 * The one primary CTA of the US marketing pages. Visitors start practicing
 * without an account; signed-in people go straight to their dashboard.
 * Renders a real <button> immediately (no skeleton), so it never shifts layout.
 */
export default function StartButton({
  size = 'lg',
  variant = 'primary',
  className = '',
  visitorLabel = 'Start practicing free',
}: {
  size?: 'md' | 'lg';
  variant?: 'primary' | 'inverse';
  className?: string;
  visitorLabel?: string;
}) {
  const { state, busy, startPracticing, overlays } = useUsEntry();
  const label = state === 'member' ? 'Open your dashboard' : state === 'guest' ? 'Continue practicing' : visitorLabel;
  return (
    <>
      {overlays}
      <button type="button" onClick={startPracticing} disabled={busy} className={usButton(variant, size, className)}>
        {label}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </button>
    </>
  );
}
