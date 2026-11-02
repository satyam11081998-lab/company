'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A draggable divider between the case rail and the conversation.
 *
 * The rail holds the structure diagram, which grows sideways as the candidate decomposes:
 * a tree three levels wide does not fit a fixed 35% column, and the one thing a reader
 * wants to do with a diagram is look at it properly. So the width is theirs to set, it is
 * remembered, and there is a one-click wide view for when they are reading the chart
 * rather than the conversation.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md):
 *   §C  the handle is a hairline in --border, and --primary only while actively dragged —
 *       red stays reserved, and a drag is a momentary state, not a decoration.
 *   §D  no shadow, no grip dots, no rounded pill. It is a border that happens to be
 *       draggable, which is what it should look like.
 *
 * Accessibility: role="separator" with aria-valuenow, focusable, and arrow keys move it in
 * 24px steps. A divider that only responds to a mouse drag is unusable to anyone who does
 * not use one, and this is the control that decides whether the diagram is legible.
 */

const STORAGE_KEY = 'mece:solve:rail-width';
export const RAIL_MIN = 300;
export const RAIL_MAX = 960;
export const RAIL_DEFAULT = 420;
const STEP = 24;

/** Never let the rail squeeze the conversation out of existence. A width restored from
 *  storage was set on whatever screen they used last, which may have been much wider than
 *  this one — 960px remembered from a desktop would leave a 64px chat on a 1024px laptop. */
function ceiling(): number {
  if (typeof window === 'undefined') return RAIL_MAX;
  return Math.max(RAIL_MIN, Math.min(RAIL_MAX, Math.round(window.innerWidth * 0.62)));
}

const clamp = (n: number) => Math.min(ceiling(), Math.max(RAIL_MIN, Math.round(n)));

export function useRailWidth() {
  // Starts at the default on BOTH server and first client render: reading storage during
  // render would mismatch the server HTML and throw a hydration error.
  const [width, setWidthRaw] = useState<number>(RAIL_DEFAULT);
  const [dragging, setDragging] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(STORAGE_KEY));
      if (Number.isFinite(saved) && saved >= RAIL_MIN && saved <= RAIL_MAX) {
        setWidthRaw(saved);
      }
    } catch {
      /* private window, blocked storage: the default is a fine answer */
    }
    loaded.current = true;
  }, []);

  // Re-clamp when the window changes: rotating a tablet or snapping a window half-screen
  // otherwise leaves a rail wider than the room available.
  useEffect(() => {
    const onResize = () => setWidthRaw((w) => clamp(w));
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const setWidth = useCallback((next: number | ((w: number) => number)) => {
    setWidthRaw((w) => {
      const v = clamp(typeof next === 'function' ? next(w) : next);
      try {
        if (loaded.current) window.localStorage.setItem(STORAGE_KEY, String(v));
      } catch {
        /* never let a storage failure stop the drag */
      }
      return v;
    });
  }, []);

  /** The wide view, and back. Sized off the viewport so it is wide on a large screen and
   *  still leaves the conversation readable on a small one. */
  const wideTarget = useCallback(
    () => clamp(typeof window === 'undefined' ? RAIL_DEFAULT : window.innerWidth * 0.55),
    [],
  );
  // aria-valuemax must report the real ceiling, not the constant, or a screen reader
  // announces a range the control will not actually go to.
  const maxNow = typeof window === 'undefined' ? RAIL_MAX : ceiling();
  const expanded = width >= wideTarget() - STEP;
  const toggleWide = useCallback(
    () => setWidth((w) => (w >= wideTarget() - STEP ? RAIL_DEFAULT : wideTarget())),
    [setWidth, wideTarget],
  );

  return { width, setWidth, dragging, setDragging, expanded, toggleWide, maxNow };
}

export interface RailSplitterProps {
  width: number;
  setWidth: (next: number | ((w: number) => number)) => void;
  dragging: boolean;
  setDragging: (d: boolean) => void;
  /** Left edge of the rail in viewport pixels, so the drag maps to a width. */
  originRef: React.RefObject<HTMLElement | null>;
  className?: string;
}

export function RailSplitter({
  width, setWidth, dragging, setDragging, originRef, className = '',
}: RailSplitterProps) {
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLDivElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const left = originRef.current?.getBoundingClientRect().left ?? 0;
    setWidth(e.clientX - left);
  };

  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    (e.target as HTMLDivElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setWidth((w) => w - STEP); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setWidth((w) => w + STEP); }
    else if (e.key === 'Home') { e.preventDefault(); setWidth(RAIL_MIN); }
    else if (e.key === 'End') { e.preventDefault(); setWidth(RAIL_MAX); }  // clamped
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the case panel"
      aria-valuenow={Math.round(width)}
      aria-valuemin={RAIL_MIN}
      aria-valuemax={typeof window === 'undefined' ? RAIL_MAX : ceiling()}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onKeyDown={onKeyDown}
      onDoubleClick={() => setWidth(RAIL_DEFAULT)}
      title="Drag to resize — double-click to reset"
      className={
        'hidden lg:block shrink-0 cursor-col-resize select-none touch-none ' +
        'w-px hover:w-0.5 focus-visible:w-0.5 focus:outline-none transition-[width] ' +
        (dragging ? 'bg-primary w-0.5 ' : 'bg-border hover:bg-foreground/30 focus-visible:bg-primary ') +
        className
      }
    />
  );
}

export default RailSplitter;
