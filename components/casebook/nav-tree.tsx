'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Compass, Layers, Wrench, Briefcase, Calculator, Building2, Shapes, Trophy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavTreeItem } from './nav-tree-item';
import type { NavNode } from '@/lib/casebook/types';

const ICON_MAP: Record<string, React.FC<any>> = {
  Compass, Layers, Wrench, Briefcase, Calculator, Building2, Shapes, Trophy
};

interface NavTreeSectionProps {
  node: NavNode;
  searchQuery: string;
  /** When true (mobile drawer), every section starts collapsed on each mount
   *  and toggles are NOT persisted — so the drawer always opens compact. */
  defaultCollapsed?: boolean;
}

function NavTreeSection({ node, searchQuery, defaultCollapsed = false }: NavTreeSectionProps) {
  // Initial open state is data-driven via `node.defaultOpen` (set in the
  // casebook tree). Previously this compared `node.title === 'Getting Started'`,
  // but section titles are prefixed ('A · Getting Started', …) so the check
  // never matched and EVERY section loaded collapsed — including the one a
  // newcomer should see first. sessionStorage (below) still overrides this
  // once the user manually toggles a section.
  // In the mobile drawer (`defaultCollapsed`) we skip both the data-driven
  // default AND sessionStorage: every open of the sheet starts fully collapsed.
  const [isOpen, setIsOpen] = useState(defaultCollapsed ? false : !!node.defaultOpen);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!defaultCollapsed) {
      const saved = sessionStorage.getItem('nav_tree_' + node.title);
      if (saved !== null) {
        setIsOpen(saved === 'true');
      }
    }
    setIsMounted(true);
  }, [node.title, defaultCollapsed]);

  useEffect(() => {
    if (isMounted && !defaultCollapsed) {
      sessionStorage.setItem('nav_tree_' + node.title, String(isOpen));
    }
  }, [isOpen, node.title, isMounted, defaultCollapsed]);

  const Icon = node.icon ? ICON_MAP[node.icon] : null;

  // Simple search filter: if active, always open sections that contain matching items
  const isSearchActive = searchQuery.length > 0;
  
  // A naive filter check (if doing deeply recursive filter, logic would be moved up)
  const matchesSearch = node.title.toLowerCase().includes(searchQuery.toLowerCase());
  
  // A section containing the page you are ON must be open. Without this, an
  // Industry Primer reached from the top nav (or any deep link, or a refresh)
  // rendered its content with the sidebar collapsed around it — no indication
  // of where you were in the casebook, and no sibling primers to move between.
  // Beats both `defaultOpen` and the sessionStorage restore, because "where the
  // user actually is" outranks "where they last left this section".
  const pathname = usePathname();
  const containsActivePage = React.useMemo(() => {
    if (!pathname) return false;
    const hasActive = (nodes: NavNode[] | undefined): boolean =>
      (nodes ?? []).some(
        (n) =>
          (n.slug ? pathname.startsWith(`/learn/casebook/${n.slug}`) : false) || hasActive(n.children),
      );
    return hasActive(node.children);
  }, [pathname, node.children]);

  // If search is active, we might force open if children match.
  // For now, we'll just let the parent handle filtering and pass down the filtered tree.
  // `defaultCollapsed` is the mobile drawer, which deliberately starts fully
  // collapsed every time — do not force it open there.
  const openState = isSearchActive ? true : (containsActivePage && !defaultCollapsed) || isOpen;

  return (
    <Collapsible open={openState} onOpenChange={setIsOpen} className="mb-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-3 rounded-md hover:bg-muted/30 transition-colors group">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {Icon && <Icon className="w-4 h-4 text-navy dark:text-navy-foreground shrink-0" />}
          <span className="font-semibold text-small text-navy dark:text-navy-foreground whitespace-nowrap truncate">{node.title}</span>
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
  defaultCollapsed?: boolean;
}

export function NavTree({ tree, searchQuery, defaultCollapsed = false }: NavTreeProps) {
  return (
    <div className="w-full">
      {tree.map((node, i) => {
        if (node.kind === 'section') {
          return <NavTreeSection key={i} node={node} searchQuery={searchQuery} defaultCollapsed={defaultCollapsed} />;
        }
        return <NavTreeItem key={i} node={node} level={0} />;
      })}
    </div>
  );
}
