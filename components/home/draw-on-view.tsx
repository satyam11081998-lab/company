'use client';

import { useEffect, useRef } from 'react';

/**
 * Adds `will-draw` after hydration (motion allowed only) and `is-drawn` when
 * the element scrolls into view. The CSS in home.css does the rest, so the
 * server HTML is always the finished drawing.
 */
export default function DrawOnView({
  as: Tag = 'div',
  className = '',
  children,
  threshold = 0.35,
  ...rest
}: {
  as?: 'div' | 'figure' | 'ol';
  className?: string;
  children: React.ReactNode;
  threshold?: number;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    // Already on screen at load: draw straight away, no flash.
    if (r.top < window.innerHeight * 0.85 && r.bottom > 0) {
      el.classList.add('will-draw');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-drawn')));
      return;
    }
    el.classList.add('will-draw');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add('is-drawn');
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Any = Tag as any;
  return (
    <Any ref={ref} className={className} {...rest}>
      {children}
    </Any>
  );
}
