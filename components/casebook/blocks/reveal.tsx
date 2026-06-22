'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BlockRenderer } from '../block-renderer';
import type { Block, Tier } from '@/lib/casebook/types';

interface RevealProps {
  summary: string;
  tier?: Tier;
  blocks: Block[];
}

export function RevealBlock({ summary, tier, blocks }: RevealProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Note: Tier locking logic would normally hook into user context here.
  // For static presentation, we render freely but could add a lock icon if tier > 'free'.

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="my-4 border border-border rounded-lg bg-card shadow-sm overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors text-left group">
        <span className="font-semibold text-body text-navy dark:text-navy-foreground">{summary}</span>
        <div className="flex items-center gap-3">
          {tier && tier !== 'free' && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
              {tier}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-5 pb-5 pt-2 border-t border-border bg-muted/5 animate-accordion-down">
        <div className="space-y-4 pt-2">
          {blocks.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
