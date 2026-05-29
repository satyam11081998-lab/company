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
    <nav className="flex items-center space-x-1 text-small text-muted-foreground mb-6" aria-label="Breadcrumb">
      <Link href="/learn" className="hover:text-foreground transition-colors flex items-center">
        <Home className="w-3.5 h-3.5" />
      </Link>
      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
      <Link href="/learn/casebook" className="hover:text-foreground transition-colors font-medium">
        The MECE Casebook
      </Link>
      
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        const cleanTitle = node.title.replace(/^[A-Z] · /, '');
        return (
          <React.Fragment key={i}>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-[400px]">
                {cleanTitle}
              </span>
            ) : (
              <span className="truncate max-w-[150px] md:max-w-[200px]">
                {cleanTitle}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
