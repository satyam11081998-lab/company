'use client';

import React, { useEffect, useState } from 'react';
import type { GeneratedBriefData } from '@/lib/types';

interface BriefOnThisPageProps {
  brief: GeneratedBriefData;
}

/** Static TOC sections derived from which brief fields have content. */
function buildToc(b: GeneratedBriefData) {
  const sections: { id: string; text: string }[] = [];

  sections.push({ id: 'brief-summary', text: 'Summary' });

  if (b.likely_questions?.length > 0) {
    sections.push({ id: 'brief-likely-questions', text: 'Likely GD Questions' });
  }
  if (b.smart_angles?.length > 0) {
    sections.push({ id: 'brief-smart-angles', text: 'Smart Angles' });
  }
  if (b.data_points?.length > 0) {
    sections.push({ id: 'brief-data-points', text: 'Data Points' });
  }
  if (b.opening_lines?.length > 0) {
    sections.push({ id: 'brief-opening-lines', text: 'Opening Lines' });
  }
  if (b.counter_arguments?.length > 0) {
    sections.push({ id: 'brief-counter-arguments', text: 'Counter-Arguments' });
  }
  if (b.closing_lines?.length > 0) {
    sections.push({ id: 'brief-closing-lines', text: 'Closing Lines' });
  }

  return sections;
}

export function BriefOnThisPage({ brief }: BriefOnThisPageProps) {
  const [activeId, setActiveId] = useState<string>('');
  const toc = buildToc(brief);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { root: null, rootMargin: '-80px 0px -70% 0px' },
    );

    const elements = toc
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <div className="hidden lg:block sticky top-[80px] max-h-[calc(100vh-80px)] overflow-y-auto w-[220px] shrink-0 pr-0">
      <h4 className="text-[11px] text-muted-foreground mb-4 uppercase tracking-widest font-semibold">
        On this page
      </h4>
      <nav className="flex flex-col gap-2.5">
        {toc.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`text-[13px] transition-colors border-l-2 pl-3 ${
              activeId === h.id
                ? 'border-l-primary text-primary font-medium'
                : 'border-l-transparent text-muted-foreground hover:text-foreground'
            }`}
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
