'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A margin note in a real pen hand (Kalam Light) with an ink arrow that draws
 * itself the first time the note scrolls into view — the way a mentor would
 * scribble beside your work. Pure decoration: aria-hidden, because every note
 * repeats something the page already says in text.
 *
 * The arrows are single hand-drawn strokes (slightly uneven on purpose) plus a
 * two-stroke head; each has its own viewBox so it scales with the note.
 */

type ArrowKind = 'down-right' | 'left' | 'down-left';

const ARROWS: Record<ArrowKind, { viewBox: string; shaft: string; head: string; className: string }> = {
  // From under the last line, a loose curl down and to the right.
  'down-right': {
    viewBox: '0 0 90 70',
    shaft: 'M8 4 C 4 22, 10 40, 30 50 C 44 57, 60 58, 78 55',
    head: 'M66 47 L79 55 L67 63',
    className: 'h-[58px] w-[76px]',
  },
  // Long, nearly flat sweep pointing left at the diagram.
  left: {
    viewBox: '0 0 120 40',
    shaft: 'M116 14 C 92 22, 66 27, 40 25 C 28 24, 18 22, 8 20',
    head: 'M19 11 L7 20 L20 28',
    className: 'h-[34px] w-[104px]',
  },
  'down-left': {
    viewBox: '0 0 80 70',
    shaft: 'M70 4 C 74 24, 64 42, 44 52 C 32 58, 20 60, 8 58',
    head: 'M20 49 L7 58 L19 66',
    className: 'h-[58px] w-[68px]',
  },
};

export default function HandNote({
  lines,
  arrow,
  className = '',
  textClassName = '',
  arrowClassName = '',
  rotate = -7,
  delay = 350,
  arrowSide = 'below',
}: {
  arrowSide?: 'below' | 'left';
  lines: string[];
  arrow?: ArrowKind;
  className?: string;
  textClassName?: string;
  arrowClassName?: string;
  rotate?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDrawn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          window.setTimeout(() => setDrawn(true), delay);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  const a = arrow ? ARROWS[arrow] : null;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none select-none ${arrowSide === 'left' ? 'flex flex-row-reverse items-center gap-1' : ''} ${className}`}
      data-drawn={drawn || undefined}
    >
      <p
        className={`font-hand text-[25px] font-light leading-[1.08] text-[#2b2a27] transition-opacity duration-700 dark:text-white/85 ${
          drawn ? 'opacity-100' : 'opacity-0'
        } ${textClassName}`}
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {lines.map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </p>
      {a && (
        <svg viewBox={a.viewBox} className={`${a.className} ${arrowClassName}`} fill="none">
          <path
            d={a.shaft}
            pathLength={1}
            className="hand-ink"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: 'stroke-dashoffset 900ms cubic-bezier(.65,0,.35,1) 250ms',
            }}
          />
          <path
            d={a.head}
            pathLength={1}
            className="hand-ink"
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: 'stroke-dashoffset 260ms ease-out 1100ms',
            }}
          />
        </svg>
      )}
    </div>
  );
}
