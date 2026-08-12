'use client';

import React, { useMemo } from 'react';
import type { Block } from '@/lib/casebook/types';
import { OnThisPageList, type TocItem } from '@/components/on-this-page-list';

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

/**
 * Casebook right rail.
 *
 * Derives a TOC from typed blocks, then delegates rendering and scroll-spy to
 * <OnThisPageList>, which the standalone framework pages share. Markup and
 * active-link behaviour are unchanged from the original implementation.
 */
export function OnThisPage({ blocks, pageSlug }: OnThisPageProps) {
  const toc = useMemo<TocItem[]>(() => {
    const headings = blocks.filter(
      (b) => b.type === 'heading' || (b.type === 'caseSection' && b.label)
    ) as Array<
      | { type: 'heading'; level: number; text: string; anchor?: string }
      | { type: 'caseSection'; label: string; title?: string }
    >;

    const list: TocItem[] = headings.map((h) => {
      if (h.type === 'heading') {
        return {
          id: h.anchor || slugify(h.text),
          text: h.text,
          level: h.level,
        };
      }
      return {
        id: `section-${h.label}`,
        text: h.title || h.label.charAt(0).toUpperCase() + h.label.slice(1),
        level: 2,
      };
    });

    if (blocks.some((b) => b.type === 'keyTakeaways')) {
      list.unshift({ id: 'key-takeaways', text: 'Key Takeaways', level: 2 });
    }

    return list;
  }, [blocks]);

  return <OnThisPageList items={toc} observeKey={pageSlug} widthClassName="w-[220px]" />;
}
