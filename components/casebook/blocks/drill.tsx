'use client';

import React, { useState } from 'react';
import type { InlineMd } from '@/lib/casebook/types';
import { ProseBlock } from './prose';
import { Button } from '@/components/ui/button';

interface DrillProps {
  title: string;
  instructions: InlineMd;
  items: {
    prompt: InlineMd;
    answer: InlineMd;
  }[];
  revealLabel?: string;
}

export function Drill({ title, instructions, items, revealLabel = "Show answers" }: DrillProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-8 relative">
      <div className="p-5 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-sm">
              DRILL
            </span>
            <h3 className="text-h3 text-foreground m-0">{title}</h3>
          </div>
          
          <div className="text-body text-foreground">
            <ProseBlock md={instructions} />
          </div>

          <div className="mt-4 space-y-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-strong text-foreground pt-0.5">{i + 1}.</span>
                <div className="flex-1 text-body text-foreground pt-0.5">
                  <ProseBlock md={item.prompt} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setRevealed(!revealed)}
              className="text-foreground"
            >
              {revealed ? "Hide answers" : revealLabel}
            </Button>
          </div>

          {revealed && (
            <div className="mt-6 space-y-4 rounded-lg bg-muted/50 p-5 border border-border/50 animate-in fade-in slide-in-from-top-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-strong text-primary pt-0.5">{i + 1}.</span>
                  <div className="flex-1 text-body text-foreground pt-0.5">
                    <ProseBlock md={item.answer} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
