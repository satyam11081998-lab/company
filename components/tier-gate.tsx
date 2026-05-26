'use client';

import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { useUser } from '@/components/user-context';
import type { SubscriptionTier } from '@/lib/types';
import { TIER_LABELS } from '@/lib/tier';

interface TierGateProps {
  required: SubscriptionTier;
  children: React.ReactNode;
  /** Variant determines visual style of the locked state. */
  variant?: 'card' | 'inline' | 'overlay';
  /** Custom message in locked state. */
  lockedMessage?: string;
  /** Optional headline above CTA in locked state. */
  lockedTitle?: string;
}

/**
 * Wraps children. Renders them only if user has access.
 * Otherwise shows an upgrade prompt.
 */
export default function TierGate(props: TierGateProps) {
  const { hasTierAccess } = useUser();
  
  if (hasTierAccess(props.required)) {
    return <>{props.children}</>;
  }

  const requiredLabel = TIER_LABELS[props.required];
  const title = props.lockedTitle || `${requiredLabel} feature`;
  const message = props.lockedMessage || `Upgrade to ${requiredLabel} to unlock this.`;

  if (props.variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>{message}</span>
        <Link href="/upgrade" className="text-primary font-semibold hover:underline">
          Upgrade →
        </Link>
      </div>
    );
  }

  if (props.variant === 'overlay') {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none select-none blur-[2px]">
          {props.children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-md p-6 text-center">
          <Lock className="h-6 w-6 text-muted-foreground mb-2" />
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">{message}</p>
          <Link 
            href="/upgrade"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 inline mr-1.5" />
            Upgrade to {requiredLabel}
          </Link>
        </div>
      </div>
    );
  }

  // 'card' variant — default
  return (
    <div className="ui-card p-6 text-center border-dashed border-2">
      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">{message}</p>
      <Link 
        href="/upgrade"
        className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-primary-hover transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Upgrade to {requiredLabel}
      </Link>
    </div>
  );
}
