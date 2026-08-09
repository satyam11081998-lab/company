'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Newspaper, Calculator, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { ensureGuestSession, isGuestModeEnabled } from '@/lib/guest';

export interface GuestPracticeTargets {
  /** Today's daily case id, or null if the scheduler has not run. */
  caseId: string | null;
  caseTitle?: string | null;
  /** Today's daily guesstimate id. */
  guesstimateId: string | null;
  guesstimateTitle?: string | null;
  /** Today's news brief id, for the news → 15-minute case generator. */
  briefId?: string | null;
  briefHeadline?: string | null;
}

/**
 * The three live entry points into guest practice.
 *
 * ORDER IS DELIBERATE: guesstimate first, then case, then the news case.
 * On a phone this block is what a visitor meets after one short scroll, and the
 * guesstimate is the cheapest promise to keep — six to ten minutes, one number,
 * an obvious win. Leading with the 15-minute case asks for a commitment before
 * the visitor has any reason to trust the product. On desktop the order costs
 * nothing because all three are visible at once.
 *
 * Every button mints the anonymous session on CLICK and then navigates. Nothing
 * fires on mount: Googlebot renders JavaScript and carries no cookie, so a
 * mount effect would create an `auth.users` row on every crawl by every bot and
 * hand the indexed DOM a post-sign-in view.
 */
export default function GuestPracticeActions({
  targets,
  heading = 'Start practising now',
  subheading = 'No account, no email, no card. You only sign up when you want your score.',
}: {
  targets: GuestPracticeTargets;
  heading?: string;
  subheading?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<null | 'guesstimate' | 'case' | 'news'>(null);

  if (!isGuestModeEnabled()) return null;

  /** Mint the session (idempotent), then run `go`. */
  async function begin(kind: 'guesstimate' | 'case' | 'news', go: () => Promise<void> | void) {
    if (busy) return;
    setBusy(kind);
    try {
      const user = await ensureGuestSession();
      if (!user) {
        toast.error('Could not start a practice session. Please try signing up instead.');
        return;
      }
      await go();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  function openCase(id: string) {
    startTransition(() => router.push(`/cases/${id}`));
  }

  /** News → 15-minute case. Generation is server-side and costs a real LLM
      call, which is why it sits behind the same session mint as the others. */
  async function openNewsCase() {
    if (!targets.briefId) return;
    const res = await fetch(`/api/news/${targets.briefId}/to-case`, { method: 'POST' });
    let payload: { case_id?: string; error?: string } | null = null;
    try {
      payload = await res.json();
    } catch {
      /* non-JSON body — fall through to the generic message */
    }
    if (!res.ok || !payload?.case_id) {
      throw new Error(payload?.error || 'Could not build a case from today’s headline.');
    }
    openCase(payload.case_id);
  }

  const cards: {
    kind: 'guesstimate' | 'case' | 'news';
    icon: React.ReactNode;
    eyebrow: string;
    title: string;
    action: () => Promise<void> | void;
    available: boolean;
  }[] = [
    {
      kind: 'guesstimate',
      icon: <Calculator className="h-4 w-4" />,
      eyebrow: 'Start here',
      title: targets.guesstimateTitle || "Today's guesstimate",
      action: () => {
        if (targets.guesstimateId) openCase(targets.guesstimateId);
      },
      available: !!targets.guesstimateId,
    },
    {
      kind: 'case',
      icon: <Briefcase className="h-4 w-4" />,
      eyebrow: 'Full interview',
      title: targets.caseTitle || "Today's case",
      action: () => {
        if (targets.caseId) openCase(targets.caseId);
      },
      available: !!targets.caseId,
    },
    {
      kind: 'news',
      icon: <Newspaper className="h-4 w-4" />,
      eyebrow: "From today's news",
      title: targets.briefHeadline || 'Turn a headline into a case',
      action: openNewsCase,
      available: !!targets.briefId,
    },
  ];

  const live = cards.filter((c) => c.available);
  if (!live.length) return null;

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-4 sm:p-5">
      <h2 className="text-[16px] font-bold text-foreground sm:text-[18px]">{heading}</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{subheading}</p>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {live.map((c) => (
          <button
            key={c.kind}
            type="button"
            onClick={() => begin(c.kind, c.action)}
            disabled={!!busy}
            className="group flex flex-col rounded-xl border border-border bg-background p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:opacity-60"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              {c.icon}
              {c.eyebrow}
            </span>
            <span className="mt-2 line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">
              {c.title}
            </span>
            {/* No duration is shown anywhere. A stated time is a promise the
                product cannot keep — a case runs as long as the candidate
                takes — and printing "~15 min" on the card turns a free trial
                into a commitment the visitor has to budget for before they
                have any reason to care. */}
            <span className="mt-auto flex items-center justify-end pt-3">
              {busy === c.kind ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
              )}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
        Today&apos;s set is free for everyone. Sign up to get a fresh case and guesstimate every day, and to keep
        your scores and streak.
      </p>
    </section>
  );
}
