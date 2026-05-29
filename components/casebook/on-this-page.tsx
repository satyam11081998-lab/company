'use client';

import React, { useEffect, useState, useMemo } from 'react';
import type { Block } from '@/lib/casebook/types';

interface OnThisPageProps {
  blocks: Block[];
  pageSlug?: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

export function OnThisPage({ blocks, pageSlug }: OnThisPageProps) {
  const [activeId, setActiveId] = useState<string>('');

  const toc = useMemo(() => {
    const headings = blocks.filter(
      (b) => b.type === 'heading' || (b.type === 'caseSection' && b.label)
    ) as Array<
      | { type: 'heading'; level: number; text: string; anchor?: string }
      | { type: 'caseSection'; label: string; title?: string }
    >;

    const list = headings.map((h, idx) => {
      if (h.type === 'heading') {
        return {
          id: h.anchor || slugify(h.text),
          text: h.text,
          level: h.level
        };
      } else {
        return {
          id: `section-${h.label}`,
          text: h.title || h.label.charAt(0).toUpperCase() + h.label.slice(1),
          level: 2
        };
      }
    });

    const hasKT = blocks.some((b) => b.type === 'keyTakeaways');
    if (hasKT) {
      list.unshift({ id: 'key-takeaways', text: 'Key Takeaways', level: 2 });
    }

    return list;
  }, [blocks]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: '-80px 0px -70% 0px' }
    );

    const elements = toc.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc, pageSlug]);

  if (toc.length === 0) return null;

  return (
    <div className="hidden lg:block sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto w-[220px] shrink-0 pr-0">
      <h4 className="text-label text-muted-foreground mb-4 uppercase tracking-widest">
        On this page
      </h4>
      <nav className="flex flex-col gap-2.5">
        {toc.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
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
    </div>
  );
}
