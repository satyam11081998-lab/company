import React from 'react';
import { parseInlineMd } from './prose';
import { Info, Lightbulb, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CalloutProps {
  variant: 'tip' | 'insight' | 'warning' | 'pitfall' | 'note';
  title?: string;
  md: string;
}

export function CalloutBlock({ variant, title, md }: CalloutProps) {
  let containerClass = '';
  let icon = null;

  switch (variant) {
    case 'insight':
      containerClass = 'bg-primary/5 border border-border text-foreground';
      icon = <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />;
      break;
    case 'tip':
      containerClass = 'bg-success/10 border border-border text-foreground';
      icon = <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />;
      break;
    case 'warning':
      containerClass = 'bg-warning/10 border border-border text-foreground';
      icon = <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />;
      break;
    case 'pitfall':
      containerClass = 'bg-destructive/10 border border-border text-foreground';
      icon = <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />;
      break;
    case 'note':
    default:
      containerClass = 'bg-muted/40 border border-border text-foreground';
      icon = <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />;
      break;
  }

  return (
    <div className={`p-4 rounded-r-lg ${containerClass} flex gap-3 shadow-sm`}>
      {icon}
      <div className="flex-1">
        {title && <h4 className="text-strong mb-1">{title}</h4>}
        <p className="text-body text-foreground/90 leading-relaxed">
          {parseInlineMd(md)}
        </p>
      </div>
    </div>
  );
}
