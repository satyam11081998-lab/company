'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ensureGuestSession } from '@/lib/guest';
import { usButton } from '@/components/us/ui';

/**
 * Opens one specific case (today's daily) for anyone. A visitor gets an
 * anonymous session minted on CLICK first (never on mount), exactly like
 * components/guest/guest-practice-actions.tsx; the access rules themselves
 * (lib/access.ts, services/access_guard.py) are unchanged — only today's pair
 * is open to guests.
 */
export default function StartCaseButton({
  caseId,
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  caseId: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'inverse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  async function go() {
    if (busy) return;
    setBusy(true);
    try {
      const user = await ensureGuestSession();
      // Guest mode off (feature flag) → the account route, then straight back here.
      if (!user) {
        window.location.assign(`/signup?next=${encodeURIComponent(`/cases/${caseId}`)}`);
        return;
      }
      window.location.assign(`/cases/${caseId}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start. Please try again.');
      setBusy(false);
    }
  }
  return (
    <button type="button" onClick={go} disabled={busy} aria-busy={busy} className={usButton(variant, size, className)}>
      {label}
      {busy ? <Loader2 aria-hidden className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <ArrowRight aria-hidden className="h-4 w-4" />}
    </button>
  );
}
