import React from 'react';
import { parseInlineMd } from './prose';

interface StepsProps {
  ordered: boolean;
  items: { title?: string; md: string }[];
}

export function StepsBlock({ ordered, items }: StepsProps) {
  return (
    <div className="space-y-4 my-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="shrink-0 mt-0.5">
            {ordered ? (
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-navy text-primary-foreground text-micro font-bold">
                {idx + 1}
              </span>
            ) : (
              <span className="flex items-center justify-center w-2 h-2 rounded-full bg-navy mt-2 ml-2" />
            )}
          </div>
          <div className="flex-1">
            {item.title && <h4 className="text-strong mb-1">{item.title}</h4>}
            <p className="text-body text-foreground/90">
              {parseInlineMd(item.md)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
