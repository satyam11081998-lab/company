import React from 'react';
import { parseInlineMd } from './prose';

export function HookBlock({ md, emphasize }: { md: string; emphasize?: string }) {
  const renderText = () => {
    if (!emphasize) return parseInlineMd(md);
    
    const index = md.toLowerCase().indexOf(emphasize.toLowerCase());
    if (index === -1) return parseInlineMd(md);
    
    const before = md.substring(0, index);
    const match = md.substring(index, index + emphasize.length);
    const after = md.substring(index + emphasize.length);
    
    return (
      <>
        {parseInlineMd(before)}
        <span className="text-primary">{parseInlineMd(match)}</span>
        {parseInlineMd(after)}
      </>
    );
  };

  return (
    <p className="text-xl leading-relaxed text-foreground text-left mb-8">
      {renderText()}
    </p>
  );
}
