'use client';
  
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  label: string;           // e.g. "CASE · PROFITABILITY · HARD"
  title: string;
  context?: string;        // 1-line subtitle
  metaIcon?: React.ReactNode;
  metaText?: string;       // e.g. "~25 min"
  difficultyDots?: number; // 1-3 dots for difficulty visualization
  href: string;
  cta: string;             // button text e.g. "Attempt today's case"
  loading?: boolean;
  icon: React.ReactNode;
}

/**
 * Large featured tile for today's daily content.
 * NO left accent bar. Hover tightens border to primary.
 */
export default function DailyPickTile({
  label, title, context, metaIcon, metaText, difficultyDots, href, cta, loading, icon,
}: Props) {
  if (loading) {
    return (
      <Card className="p-6 min-h-[260px] flex flex-col">
        <div className="h-3 w-24 bg-muted rounded animate-pulse mb-4" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-5 w-1/2 bg-muted rounded animate-pulse mb-6" />
        <div className="mt-auto h-10 w-full bg-muted rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="p-6 min-h-[260px] flex flex-col transition-colors hover:border-primary/30">
      {/* Label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary">{icon}</span>
        <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      </div>

      {/* Title */}
      <h3 className="text-h3 text-foreground leading-tight line-clamp-3">
        {title}
      </h3>

      {/* Context */}
      {context && (
        <p className="mt-2 text-small text-muted-foreground line-clamp-2">
          {context}
        </p>
      )}

      {/* Meta row */}
      {(metaText || difficultyDots) && (
        <div className="mt-4 flex items-center gap-3 text-small text-muted-foreground">
          {difficultyDots !== undefined && (
            <div className="flex items-center gap-0.5">
              {[1, 2, 3].map((dot) => (
                <div
                  key={dot}
                  className={`h-1.5 w-1.5 rounded-full ${
                    dot <= difficultyDots ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          )}
          {metaText && (
            <span className="flex items-center gap-1">
              {metaIcon || <Clock className="h-3 w-3" />}
              {metaText}
            </span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-6">
        <Link
          href={href}
          className="flex items-center justify-center gap-2 bg-primary text-white text-body font-semibold py-2.5 rounded-md hover:bg-primary-hover transition-colors w-full"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
