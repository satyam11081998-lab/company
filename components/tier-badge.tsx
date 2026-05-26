'use client';

import { Star, Zap, Circle } from 'lucide-react';
import type { SubscriptionTier } from '@/lib/types';
import { TIER_LABELS } from '@/lib/tier';

export default function TierBadge({ tier, size = 'sm' }: { 
  tier: SubscriptionTier; 
  size?: 'xs' | 'sm' | 'md';
}) {
  if (tier === 'free') return null; // don't show badge for free users

  const sizeClasses = {
    xs: 'h-4 text-[10px] px-1.5 gap-1',
    sm: 'h-5 text-[11px] px-2 gap-1',
    md: 'h-6 text-xs px-2.5 gap-1.5',
  };
  const iconSize = size === 'xs' ? 'h-2.5 w-2.5' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  if (tier === 'lite') {
    return (
      <span className={`inline-flex items-center font-semibold uppercase tracking-wider rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 ${sizeClasses[size]}`}>
        <Zap className={iconSize} />
        {TIER_LABELS[tier]}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-semibold uppercase tracking-wider rounded-sm bg-primary/10 text-primary ${sizeClasses[size]}`}>
      <Star className={iconSize} />
      {TIER_LABELS[tier]}
    </span>
  );
}
