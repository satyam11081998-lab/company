'use client';

/**
 * Deck Vault Rewards — promo surfaces.
 *
 *  - <DeckVaultBanner/>       — always-visible strip for /upgrade (and anywhere else).
 *  - <DeckVaultPopup surface/>— ONE-TIME auto-opening dialog (per surface) shown to
 *    non-Pro users on the dashboard and the upgrade page. Frequency: once ever,
 *    tracked in localStorage (mece-deck-vault-popup-<surface>); closes forever on
 *    dismiss or CTA click. Mirrors the LinkedInFollowPrompt pattern.
 *
 * Offer copy (defaults; admin can adjust per approval):
 *   corporate comp podium -> 60% off Pro, b-school podium -> 40% off Pro.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, BadgePercent } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useUser } from '@/components/user-context';

const LS_PREFIX = 'mece-deck-vault-popup-';

export function DeckVaultBanner({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/deck-vault"
      className={`group flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.04] px-4 py-3 transition-colors hover:bg-primary/[0.08] ${className}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Trophy className="h-5 w-5 text-primary" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground leading-tight">
          Won a case competition? Get up to 60% off Pro.
        </span>
        <span className="block text-xs text-muted-foreground mt-0.5">
          Upload your winning deck &amp; certificate — corporate comps get 60% off, B-school comps 40%.
        </span>
      </span>
      <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-primary whitespace-nowrap">
        Claim discount <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function DeckVaultPopup({ surface }: { surface: 'dashboard' | 'upgrade' }) {
  const { tier } = useUser();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tier === 'pro') return; // already on Pro — nothing to sell
    try {
      const key = `${LS_PREFIX}${surface}`;
      if (localStorage.getItem(key)) return;
      // Small delay so the page paints first; feels like a nudge, not a wall.
      const t = setTimeout(() => {
        localStorage.setItem(key, new Date().toISOString());
        setOpen(true);
      }, 1200);
      return () => clearTimeout(t);
    } catch {
      // localStorage unavailable (private mode) — skip quietly, never block the page.
    }
  }, [tier, surface]);

  if (tier === 'pro') return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Have a winning case deck? Get up to 60% off Pro.
          </DialogTitle>
          <DialogDescription className="text-center">
            Won or placed in a case competition? Upload your deck and certificate —
            once verified (typically 5–6 hours), you&apos;ll get a personal coupon code.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="font-mono text-xl font-bold text-primary">60%</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              Corporate competition
              <br />
              (winner / runner-up / 2nd RU)
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <p className="font-mono text-xl font-bold text-primary">40%</p>
            <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              B-school competition
              <br />
              (winner / runner-up / 2nd RU)
            </p>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-2">
          <Link
            href="/deck-vault"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            <BadgePercent className="h-4 w-4" />
            Claim my discount
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-full rounded-md text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
