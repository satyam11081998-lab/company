import React from 'react';
import { parseInlineMd } from './prose';
import { Sparkles } from 'lucide-react';

interface KeyTakeawaysProps {
  title?: string;
  items: string[];
}

export function KeyTakeawaysBlock({ title = 'Key Takeaways', items }: KeyTakeawaysProps) {
  return (
    <div className="ui-card p-5 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-strong text-primary">{title}</h3>
      </div>
      <ul className="space-y-3 m-0 p-0 list-none">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
            <span className="text-body text-foreground/90">
              {parseInlineMd(item)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
