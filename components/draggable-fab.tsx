'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

interface Anchor {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

/**
 * Wraps a floating control so the user can drag it anywhere and the position
 * persists (localStorage). A real click still fires (drag is distinguished by a
 * small movement threshold); a drag is suppressed from becoming a click.
 */
export default function DraggableFab({
  storageKey,
  initial,
  children,
  className = '',
  zIndex = 50,
}: {
  storageKey: string;
  initial: Anchor;
  children: ReactNode;
  className?: string;
  zIndex?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const latest = useRef<{ left: number; top: number } | null>(null);
  const dragged = useRef(false);

  function clamp(p: { left: number; top: number }) {
    const el = ref.current;
    const w = el?.offsetWidth ?? 56;
    const h = el?.offsetHeight ?? 56;
    const maxL = Math.max(4, window.innerWidth - w - 4);
    const maxT = Math.max(4, window.innerHeight - h - 4);
    return { left: Math.min(Math.max(4, p.left), maxL), top: Math.min(Math.max(4, p.top), maxT) };
  }

  // Load any saved position after mount (SSR-safe).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p?.left === 'number' && typeof p?.top === 'number') {
          const c = clamp(p);
          latest.current = c;
          setPos(c);
        }
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function onPointerDown(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    drag.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    dragged.current = false;
    // Capture only once a real drag starts (onPointerMove), so a plain tap still
    // clicks through to the child button / Sheet trigger.
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 6) return; // movement threshold → still a click
    if (!d.moved) {
      d.moved = true;
      dragged.current = true;
      try {
        ref.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    const c = clamp({ left: d.ox + dx, top: d.oy + dy });
    latest.current = c;
    setPos(c);
  }
  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    if (d?.moved && latest.current) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(latest.current));
      } catch {
        /* ignore */
      }
    }
    // keep the flag set through the click that fires right after pointerup
    setTimeout(() => {
      dragged.current = false;
    }, 0);
  }
  function onClickCapture(e: React.MouseEvent) {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const style: CSSProperties = pos
    ? { position: 'fixed', left: pos.left, top: pos.top, zIndex, touchAction: 'none' }
    : { position: 'fixed', ...initial, zIndex, touchAction: 'none' };

  return (
    <div
      ref={ref}
      style={style}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
}
