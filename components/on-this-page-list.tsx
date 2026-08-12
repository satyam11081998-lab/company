'use client';

import React, { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  /** Visible label. */
  text: string;
  /** 2 = top level, 3 = indented child. */
  level?: number;
}

interface OnThisPageListProps {
  items: TocItem[];
  /** Re-arm the observer when the route changes. */
  observeKey?: string;
  /**
   * Rail width. The casebook uses 220px; standalone reference pages get more
   * room because their rail also carries summary and navigation cards.
   */
  widthClassName?: string;
  /**
   * Rendered BELOW the scrolling TOC and pinned to the bottom of the sticky
   * rail, so it never scrolls out of view. Use for a persistent link back into
   * a section: a nav link that disappears halfway down a long page is not
   * really navigation.
   */
  pinned?: React.ReactNode;
  /** Rendered inside the scrolling area, under the TOC. */
  children?: React.ReactNode;
  heading?: string;
}

/**
 * The sticky "On this page" rail, with scroll-spy.
 *
 * Extracted from components/casebook/on-this-page.tsx so the casebook reader and
 * the standalone framework pages share one implementation of the observer and
 * one set of active-link styles. The casebook version now derives a TocItem[]
 * from its typed blocks and delegates here; markup is unchanged.
 */
export function OnThisPageList({
  items,
  observeKey,
  widthClassName = 'w-[220px]',
  pinned,
  children,
  heading = 'On this page',
}: OnThisPageListProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { root: null, rootMargin: '-80px 0px -70% 0px' }
    );

    const elements = items
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [items, observeKey]);

  if (items.length === 0 && !pinned) return null;

  return (
    <div
      className={`hidden lg:flex flex-col sticky top-[80px] max-h-[calc(100vh-80px)] ${widthClassName} shrink-0`}
    >
      {/* Scrolling region: TOC + any extra cards */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {items.length > 0 && (
          <>
            <h4 className="text-label text-muted-foreground mb-4 uppercase tracking-widest">
              {heading}
            </h4>
            <nav className="flex flex-col gap-2.5" aria-label={heading}>
              {items.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  aria-current={activeId === h.id ? 'true' : undefined}
                  className={`text-small transition-colors border-l-2 pl-3 ${
                    activeId === h.id
                      ? 'border-l-primary text-primary font-medium'
                      : 'border-l-transparent text-muted-foreground hover:text-foreground'
                  } ${h.level === 3 ? 'ml-4 !pl-3 text-[13px] opacity-90' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                    setActiveId(h.id);
                  }}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </>
        )}
        {children}
      </div>

      {/* Pinned region: never scrolls away */}
      {pinned && <div className="shrink-0 pt-4 mt-4 border-t border-border">{pinned}</div>}
    </div>
  );
}
