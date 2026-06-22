import React from 'react';
import { BlockRenderer } from '../block-renderer';
import type { Block, CaseSectionLabel } from '@/lib/casebook/types';
import { 
  MessageSquare, 
  HelpCircle, 
  Network, 
  BarChart3, 
  Lightbulb, 
  GraduationCap 
} from 'lucide-react';

interface CaseSectionProps {
  label: CaseSectionLabel;
  title?: string;
  blocks: Block[];
}

const SECTION_CONFIG: Record<CaseSectionLabel, { icon: React.FC<any>, defaultTitle: string, colorClass: string }> = {
  prompt: { icon: MessageSquare, defaultTitle: 'The Prompt', colorClass: 'text-navy dark:text-navy-foreground' },
  clarifying: { icon: HelpCircle, defaultTitle: 'Clarifying Questions', colorClass: 'text-primary' },
  structure: { icon: Network, defaultTitle: 'Structure & Hypothesis', colorClass: 'text-navy dark:text-navy-foreground' },
  analysis: { icon: BarChart3, defaultTitle: 'Analysis & Data', colorClass: 'text-navy dark:text-navy-foreground' },
  recommendation: { icon: Lightbulb, defaultTitle: 'Recommendation', colorClass: 'text-success' },
  takeaway: { icon: GraduationCap, defaultTitle: 'Key Takeaway', colorClass: 'text-navy-soft dark:text-navy-foreground' },
};

export function CaseSectionBlock({ label, title, blocks }: CaseSectionProps) {
  const config = SECTION_CONFIG[label];
  const Icon = config.icon;

  return (
    <section id={`section-${label}`} className="my-10 relative scroll-mt-[80px]">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-border">
        <Icon className={`w-6 h-6 ${config.colorClass}`} />
        <h2 className="text-h2 text-navy dark:text-navy-foreground">{title || config.defaultTitle}</h2>
      </div>
      <div className="space-y-5">
        {blocks.map((b, i) => (
          <BlockRenderer key={i} block={b} />
        ))}
      </div>
    </section>
  );
}
