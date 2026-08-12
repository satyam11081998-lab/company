'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Block } from '@/lib/casebook/types';
import { OnThisPageList, type TocItem } from '@/components/on-this-page-list';
import { getDeepDive } from '@/lib/casebook/deep-dives';

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

  const deepDive = getDeepDive(pageSlug);

  return (
    <OnThisPageList
      items={toc}
      observeKey={pageSlug}
      widthClassName="w-[220px]"
      pinned={
        deepDive ? (
          <Link
            href={deepDive.href}
            className="group block rounded-xl border border-primary/25 bg-primary/[0.05] p-3.5 transition-colors hover:border-primary/50"
          >
            <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              Learn more
            </span>
            <span className="mt-1.5 flex items-start gap-1 text-[13px] font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
              {deepDive.label}
              <ArrowRight
                className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-hidden="true"
              />
            </span>
            <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">
              {deepDive.blurb}
            </span>
          </Link>
        ) : undefined
      }
    />
  );
}
