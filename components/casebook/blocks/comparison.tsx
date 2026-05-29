import React from 'react';
import type { InlineMd } from '@/lib/casebook/types';
import { ProseBlock } from './prose';

interface ComparisonProps {
  title?: string;
  headers: [string, string, string];
  rows: {
    label?: string;
    cells: [InlineMd, InlineMd, InlineMd];
  }[];
}

export function Comparison({ title, headers, rows }: ComparisonProps) {
  // Mobile rendering: row-based with inline headers
  // Desktop rendering: column-based
  
  return (
    <div className="rounded-xl border border-border bg-card my-8 overflow-hidden">
      {title && (
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h4 className="text-strong text-foreground m-0">{title}</h4>
        </div>
      )}
      
      <div className="flex flex-col">
        {/* Desktop Headers */}
        <div className="hidden md:grid md:grid-cols-3 border-b border-border bg-muted/20">
          <div className="p-4 border-r border-border/50">
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive rounded-sm">
              {headers[0]}
            </span>
          </div>
          <div className="p-4 border-r border-border/50">
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-warning/20 text-warning-foreground rounded-sm">
              {headers[1]}
            </span>
          </div>
          <div className="p-4">
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success rounded-sm">
              {headers[2]}
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/60">
          {rows.map((row, i) => (
            <div key={i} className="flex flex-col">
              {row.label && (
                <div className="px-5 py-2 bg-muted/10 border-b border-border/30">
                  <span className="text-micro text-muted-foreground uppercase tracking-widest font-semibold">
                    {row.label}
                  </span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {/* Cell 1 */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="md:hidden">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive rounded-sm">
                      {headers[0]}
                    </span>
                  </div>
                  <div className="text-body text-foreground">
                    <ProseBlock md={row.cells[0]} />
                  </div>
                </div>

                {/* Cell 2 */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="md:hidden">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-warning/20 text-warning-foreground rounded-sm">
                      {headers[1]}
                    </span>
                  </div>
                  <div className="text-body text-foreground">
                    <ProseBlock md={row.cells[1]} />
                  </div>
                </div>

                {/* Cell 3 */}
                <div className="p-5 flex flex-col gap-3">
                  <div className="md:hidden">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success rounded-sm">
                      {headers[2]}
                    </span>
                  </div>
                  <div className="text-body text-foreground">
                    <ProseBlock md={row.cells[2]} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
