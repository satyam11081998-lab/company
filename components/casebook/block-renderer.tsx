import React from 'react';
import type { Block } from '@/lib/casebook/types';

import { HookBlock } from './blocks/hook';
import { ProseBlock } from './blocks/prose';
import { CalloutBlock } from './blocks/callout';
import { KeyTakeawaysBlock } from './blocks/key-takeaways';
import { StepsBlock } from './blocks/steps';
import { DiagramFrameBlock } from './blocks/diagram-frame';
import { CasebookSvg } from './blocks/casebook-svg';
import { DataTableBlock } from './blocks/data-table';
import { MathBoxBlock } from './blocks/math-box';
import { QuoteBlock } from './blocks/quote';
import { RevealBlock } from './blocks/reveal';
import { ColumnsBlock } from './blocks/columns';
import { CaseSectionBlock } from './blocks/case-section';
import { DividerBlock } from './blocks/divider';
import { Dialogue } from './blocks/dialogue';
import { Drill } from './blocks/drill';
import { Comparison } from './blocks/comparison';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

function renderHeadingText(text: string, emphasize?: string) {
  if (!emphasize) return text;
  const index = text.toLowerCase().indexOf(emphasize.toLowerCase());
  if (index === -1) return text;
  const before = text.substring(0, index);
  const match = text.substring(index, index + emphasize.length);
  const after = text.substring(index + emphasize.length);
  return (
    <>
      {before}
      <span className="text-primary">{match}</span>
      {after}
    </>
  );
}

export function BlockRenderer({ block, isHero }: { block: Block; isHero?: boolean }) {
  switch (block.type) {
    case 'hook':
      return <HookBlock md={block.md} emphasize={block.emphasize} />;
      
    case 'prose':
      return <ProseBlock md={block.md} />;
    
    case 'heading': {
      const headingId = block.anchor || slugify(block.text);
      const headingContent = renderHeadingText(block.text, block.emphasize);
      if (block.level === 2) {
        return <h2 id={headingId} className="text-h2 text-foreground mt-10 mb-4 scroll-mt-[80px]">{headingContent}</h2>;
      }
      return <h3 id={headingId} className="text-h3 text-foreground mt-8 mb-3 scroll-mt-[80px]">{headingContent}</h3>;
    }
    
    case 'callout':
      return <CalloutBlock variant={block.variant} title={block.title} md={block.md} />;
    
    case 'keyTakeaways':
      return <KeyTakeawaysBlock title={block.title} items={block.items} isHero={isHero} />;
    
    case 'steps':
      return <StepsBlock ordered={block.ordered} items={block.items} />;
    
    case 'diagram':
      return <DiagramFrameBlock refId={block.ref} caption={block.caption} maxWidth={block.maxWidth} />;
    
    case 'svg':
      return <CasebookSvg svg={block.svg} caption={block.caption} maxWidth={block.maxWidth} ariaLabel={block.ariaLabel} />;
    
    case 'table':
      return <DataTableBlock headers={block.headers} rows={block.rows} caption={block.caption} firstColHeader={block.firstColHeader} />;
    
    case 'mathBox':
      return <MathBoxBlock title={block.title} md={block.md} />;
    
    case 'quote':
      return <QuoteBlock md={block.md} attribution={block.attribution} />;
    
    case 'reveal':
      return <RevealBlock summary={block.summary} tier={block.tier} blocks={block.blocks} />;
    
    case 'columns':
      return <ColumnsBlock columns={block.columns} />;
    
    case 'caseSection':
      return <CaseSectionBlock label={block.label} title={block.title} blocks={block.blocks} />;
    
    case 'divider':
      return <DividerBlock />;
    
    case 'dialogue':
      return <Dialogue {...block} />;
      
    case 'drill':
      return <Drill {...block} />;
      
    case 'comparison':
      return <Comparison {...block} />;
    
    default:
      // Fallback for unhandled block types (should not happen with strict types)
      console.warn('Unknown block type:', (block as any).type);
      return null;
  }
}
