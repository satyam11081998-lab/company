'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { NavTree } from './nav-tree';
import { CASEBOOK_TREE } from '@/lib/casebook/tree';
import type { NavNode } from '@/lib/casebook/types';

// Simple recursive filter
function filterTree(nodes: NavNode[], query: string): NavNode[] {
  const q = query.toLowerCase();
  
  return nodes.map(node => {
    // If it's a leaf page and matches
    if (node.kind === 'page' && node.title.toLowerCase().includes(q)) {
      return node;
    }
    
    // If it has children, filter them
    if (node.children) {
      const filteredChildren = filterTree(node.children, query);
      // If parent matches or any child matches, keep it
      if (node.title.toLowerCase().includes(q) || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
    }
    
    return null;
  }).filter(Boolean) as NavNode[];
}

export function CasebookSearch({ defaultCollapsed = false }: { defaultCollapsed?: boolean }) {
  const [query, setQuery] = useState('');

  const filteredTree = useMemo(() => {
    if (!query.trim()) return CASEBOOK_TREE;
    return filterTree(CASEBOOK_TREE, query);
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <h2 className="text-strong text-navy dark:text-navy-foreground mb-4 flex items-center gap-2">
          The MECE Casebook
        </h2>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cases & frameworks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md bg-muted/30 border border-border text-small placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {filteredTree.length > 0 ? (
          <NavTree tree={filteredTree} searchQuery={query} defaultCollapsed={defaultCollapsed} />
        ) : (
          <div className="text-center py-10 px-4">
            <p className="text-muted-foreground text-small">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
