'use client';
// DELIVERABLE — reusable motion primitives for the dashboard. All reduced-motion aware:
// when the user prefers reduced motion, count-ups jump to final and reveals are instant.
import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

// Counts from 0 → target with an ease-out cubic, after an optional delay. Jumps instantly
// under reduced motion. Returns the live integer value to render.
export function useCountUp(target: number, durationMs = 1000, delayMs = 0): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (reduced) { setValue(target); return; }
    let start: number | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    timer = setTimeout(() => { raf.current = requestAnimationFrame(tick); }, delayMs);
    return () => { clearTimeout(timer); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, durationMs, delayMs, reduced]);
  return value;
}

// Flips to true on mount (next frame) so CSS transitions fire. Instant under reduced motion.
export function useMounted(delayMs = 0): boolean {
  const reduced = usePrefersReducedMotion();
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduced) { setOn(true); return; }
    const id = setTimeout(() => setOn(true), delayMs + 20);
    return () => clearTimeout(id);
  }, [delayMs, reduced]);
  return on;
}
