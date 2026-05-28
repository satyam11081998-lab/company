'use client';
  
import { Card } from '@/components/ui/card';

interface StatTileProps {
  label: string;
  value: string | number;
  valueSuffix?: string;        // e.g. "/100" or "%ile"
  sublabel?: string;           // e.g. "Deck Polisher" or "next: 500 pts"
  dotColor?: 'primary' | 'navy' | 'success' | 'warning';
  children?: React.ReactNode;  // mini chart / visualization
}

/**
 * Stat tile pattern from the Nexo Co reference.
 * Big number, small label, optional mini-chart inside.
 * NO border-l-4 — just a colored dot indicator (top right).
 */
export default function StatTile({
  label, value, valueSuffix, sublabel, dotColor = 'primary', children,
}: StatTileProps) {
  const dotClass = {
    primary: 'bg-primary',
    navy: 'bg-navy',
    success: 'bg-success',
    warning: 'bg-warning',
  }[dotColor];

  return (
    <Card className="p-4 flex flex-col min-h-[140px]">
      <div className="flex items-start justify-between mb-3">
        <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className={`h-2 w-2 rounded-full ${dotClass}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-mono text-[36px] leading-none font-bold tabular-nums text-foreground">
          {value}
        </p>
        {valueSuffix && (
          <p className="text-small font-mono text-muted-foreground tabular-nums">
            {valueSuffix}
          </p>
        )}
      </div>
      {sublabel && (
        <p className="mt-2 text-small text-muted-foreground">
          {sublabel}
        </p>
      )}
      {children && (
        <div className="mt-auto pt-4">
          {children}
        </div>
      )}
    </Card>
  );
}
