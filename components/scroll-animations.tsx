'use client';

import { useEffect } from 'react';

/**
 * Progressive scroll-reveal for static marketing pages.
 *
 * Content is fully visible by default — no-JS visitors and search/AI crawlers
 * see everything in the server-rendered HTML. This component only *adds*
 * entrance motion after hydration, and only when the user has not requested
 * reduced motion. Elements opt in with a `data-reveal` attribute.
 *
 * Safe for SSG: renders nothing, runs purely client-side in an effect.
 */
export default function ScrollAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const els = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]')
    );
    if (els.length === 0) return;

    // Only now (JS present + motion allowed) do we hide-then-reveal.
    document.documentElement.classList.add('reveal-ready');

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
