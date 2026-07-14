'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Floating "Back to top" control for long Casebook reading pages.
 * Hidden until the reader scrolls past the fold, then fades in bottom-right.
 * Smooth-scrolls to the top (respecting prefers-reduced-motion).
 *
 * Placement note: the bottom-right corner is a shared FAB zone — the mobile
 * bottom nav owns bottom-0..64px+safe-area (xl:hidden) and the draggable
 * Feedback launcher defaults to bottom-96px. We sit at bottom-40 (160px) so on
 * phones the button stacks cleanly ABOVE both instead of hiding under them.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-40 right-4 xl:right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-black/5 transition-all duration-200 hover:bg-primary/90 active:scale-95 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <ArrowUp className="h-5 w-5" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}

export default BackToTop;
