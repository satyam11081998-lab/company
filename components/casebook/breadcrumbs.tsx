import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';

// Helper to find path to node
function findPathToSlug(nodes: NavNode[], slug: string, currentPath: NavNode[] = []): NavNode[] | null {
  for (const node of nodes) {
    const path = [...currentPath, node];
    if (node.slug === slug) return path;
    if (node.children) {
      const found = findPathToSlug(node.children, slug, path);
      if (found) return found;
    }
  }
  return null;
}

export function Breadcrumbs({ slug }: { slug: string }) {
  const path = findPathToSlug(CASEBOOK_TREE, slug);

  if (!path) return null;

  return (
    <nav className="flex items-center space-x-1 text-small text-muted-foreground mb-6 w-full max-w-full overflow-hidden whitespace-nowrap" aria-label="Breadcrumb">
      <Link href="/learn" className="hover:text-foreground transition-colors flex items-center shrink-0">
        <Home className="w-3.5 h-3.5" />
      </Link>
      <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
      <Link href="/learn/casebook" className="hover:text-foreground transition-colors font-medium shrink-0 hidden sm:block">
        The MECE Casebook
      </Link>
      <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0 hidden sm:block" />
      
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        const cleanTitle = node.title.replace(/^[A-Z] · /, '');
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />}
            {isLast ? (
              <span className="text-foreground font-medium truncate shrink min-w-0" title={cleanTitle}>
                {cleanTitle}
              </span>
            ) : (
              <span className="truncate shrink min-w-0 hidden sm:block" title={cleanTitle}>
                {cleanTitle}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
