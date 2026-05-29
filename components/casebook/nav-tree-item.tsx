'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock, FileText, CheckCircle2 } from 'lucide-react';
import type { NavNode } from '@/lib/casebook/types';

interface NavTreeItemProps {
  node: NavNode;
  level: number;
}

export function NavTreeItem({ node, level }: NavTreeItemProps) {
  const pathname = usePathname();
  
  if (node.kind === 'group') {
    return (
      <div className="mb-4">
        <h4 className="text-micro text-muted-foreground font-bold tracking-widest uppercase mb-2 px-3">
          {node.title}
        </h4>
        <div className="space-y-0.5">
          {node.children?.map((child, i) => (
            <NavTreeItem key={i} node={child} level={level + 1} />
          ))}
        </div>
      </div>
    );
  }

  if (node.kind === 'page' && node.slug) {
    const href = `/learn/casebook/${node.slug}`;
    const isActive = pathname === href;
    const isLocked = node.meta?.minTier && node.meta.minTier !== 'free'; // mock logic
    
    // Determine difficulty dots
    const diff = node.meta?.difficulty;
    const dots = diff === 'challenging' ? 3 : diff === 'moderate' ? 2 : diff === 'easy' ? 1 : 0;

    return (
      <Link 
        href={href}
        className={`group flex items-center justify-between py-1.5 px-3 rounded-md transition-colors ${
          isActive 
            ? 'bg-primary/10 text-primary font-medium border-l-2 border-l-primary' 
            : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground border-l-2 border-l-transparent'
        } ${level > 1 ? 'ml-3' : ''}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {isActive ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-muted-foreground opacity-50 shrink-0" />
          )}
          <span className="text-[13px] truncate">{node.title}</span>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {dots > 0 && (
            <div className="flex gap-0.5" title={`Difficulty: ${diff}`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full ${i < dots ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
          )}
          {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </Link>
    );
  }

  return null;
}
