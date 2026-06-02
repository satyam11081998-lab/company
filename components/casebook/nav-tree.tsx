'use client';

import React, { useState } from 'react';
import { ChevronDown, Compass, Layers, Wrench, Briefcase, Calculator, Building2, Shapes } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavTreeItem } from './nav-tree-item';
import type { NavNode } from '@/lib/casebook/types';

const ICON_MAP: Record<string, React.FC<any>> = {
  Compass, Layers, Wrench, Briefcase, Calculator, Building2, Shapes
};

interface NavTreeSectionProps {
  node: NavNode;
  searchQuery: string;
}

function NavTreeSection({ node, searchQuery }: NavTreeSectionProps) {
  const [isOpen, setIsOpen] = useState(node.defaultOpen || false);
  const Icon = node.icon ? ICON_MAP[node.icon] : null;

  // Simple search filter: if active, always open sections that contain matching items
  const isSearchActive = searchQuery.length > 0;
  
  // A naive filter check (if doing deeply recursive filter, logic would be moved up)
  const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
  
  // If search is active, we might force open if children match. 
  // For now, we'll just let the parent handle filtering and pass down the filtered tree.
  const openState = isSearchActive ? true : isOpen;

  return (
    <Collapsible open={openState} onOpenChange={setIsOpen} className="mb-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-navy shrink-0" />}
          <span className="font-semibold text-small text-navy">{node.title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openState ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-3 animate-accordion-down overflow-hidden">
        <div className="space-y-0.5">
          {node.children?.map((child, i) => (
            <NavTreeItem key={i} node={child} level={1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface NavTreeProps {
  tree: NavNode[];
  searchQuery: string;
}

export function NavTree({ tree, searchQuery }: NavTreeProps) {
  return (
    <div className="w-full">
      {tree.map((node, i) => {
        if (node.kind === 'section') {
          return <NavTreeSection key={i} node={node} searchQuery={searchQuery} />;
        }
        return <NavTreeItem key={i} node={node} level={0} />;
      })}
    </div>
  );
}
