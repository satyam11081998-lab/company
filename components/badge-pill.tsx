'use client';

import { Award, Trophy, Star, Flame, Crown, Layers, Calculator, Sparkles } from 'lucide-react';
import type { BadgeRow } from '@/lib/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Award, Trophy, Star, Flame, Crown, Layers, Calculator, Sparkles,
};

const RARITY_STYLES: Record<string, string> = {
  common:    'bg-muted text-foreground border-border',
  rare:      'bg-primary/10 text-primary border-primary/20',
  epic:      'bg-navy/10 text-navy border-navy/20 dark:text-navy-foreground',
  legendary: 'bg-gradient-to-br from-primary/20 to-navy/20 text-foreground border-primary/30',
};

export default function BadgePill({ badge, size = 'sm' }: { badge: BadgeRow; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = ICON_MAP[badge.icon] || Award;
  const sizeClasses = {
    sm: 'text-micro px-2 py-1 gap-1',
    md: 'text-small px-2.5 py-1.5 gap-1.5',
    lg: 'text-body px-3 py-2 gap-2',
  }[size];
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${RARITY_STYLES[badge.rarity] || RARITY_STYLES.common} ${sizeClasses}`} title={badge.description}>
      <Icon className={iconSize} />
      {badge.name}
    </span>
  );
}
