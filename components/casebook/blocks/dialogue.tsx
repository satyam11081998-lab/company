import React from 'react';
import type { InlineMd } from '@/lib/casebook/types';
import { ProseBlock } from './prose';
import { cn } from '@/lib/utils';

interface DialogueProps {
  title?: string;
  turns: {
    speaker: 'interviewer' | 'candidate' | 'narrator';
    md: InlineMd;
    note?: InlineMd;
  }[];
}

export function Dialogue({ title, turns }: DialogueProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 my-6 space-y-4">
      {title && <h4 className="text-strong text-foreground mb-4">{title}</h4>}
      <div className="flex flex-col gap-4">
        {turns.map((turn, i) => {
          const isInterviewer = turn.speaker === 'interviewer';
          const isCandidate = turn.speaker === 'candidate';
          
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                <div className="flex-shrink-0 md:w-24 mt-0.5">
                  <span className={cn(
                    "inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded-sm",
                    isInterviewer ? "bg-navy/10 text-navy" : 
                    isCandidate ? "bg-primary/10 text-primary" : 
                    "bg-muted text-muted-foreground"
                  )}>
                    {turn.speaker}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <ProseBlock md={turn.md} />
                  {turn.note && (
                    <div className="mt-2 pl-3 border-l-2 border-border/50 text-small italic text-muted-foreground">
                      <ProseBlock md={turn.note} />
                    </div>
                  )}
                </div>
              </div>
              {i < turns.length - 1 && (
                <div className="h-px w-full bg-border/40" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
