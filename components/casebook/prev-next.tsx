import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ALL_PAGE_SLUGS } from '@/lib/casebook/content';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';

// Flatten tree to get a linear sequence of pages
const flattenTree = (nodes: NavNode[]): NavNode[] => {
  return nodes.reduce((acc: NavNode[], node: NavNode) => {
    if (node.kind === 'page') {
      acc.push(node);
    }
    if (node.children) {
      acc.push(...flattenTree(node.children));
    }
    return acc;
  }, []);
};

export function PrevNextLinks({ currentSlug }: { currentSlug: string }) {
  const flatNodes = flattenTree(CASEBOOK_TREE);
  const currentIndex = flatNodes.findIndex((n) => n.slug === currentSlug);

  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? flatNodes[currentIndex - 1] : null;
  const next = currentIndex < flatNodes.length - 1 ? flatNodes[currentIndex + 1] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-border">
      {prev ? (
        <Link href={`/learn/casebook/${prev.slug}`} className="ui-card p-4 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col items-start text-left">
          <span className="text-micro text-muted-foreground font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Previous
          </span>
          <span className="text-strong text-navy dark:text-navy-foreground group-hover:text-primary transition-colors line-clamp-2">
            {prev.title}
          </span>
        </Link>
      ) : <div />}
      
      {next ? (
        <Link href={`/learn/casebook/${next.slug}`} className="ui-card p-4 hover:border-primary/50 hover:shadow-md transition-all group flex flex-col items-end text-right">
          <span className="text-micro text-muted-foreground font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
            Next <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
          <span className="text-strong text-navy dark:text-navy-foreground group-hover:text-primary transition-colors line-clamp-2">
            {next.title}
          </span>
        </Link>
      ) : <div />}
    </div>
  );
}
