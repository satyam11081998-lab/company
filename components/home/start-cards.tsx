'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ensureGuestSession, isGuestModeEnabled } from '@/lib/guest';
import HomeImage from '@/components/home/photo';
import { HOME_PHOTOS, type HomePhotoId } from '@/lib/home/photos';

/**
 * Three ways in, each a photograph and one line. Every card is a real link
 * (crawlers and no-JS visitors follow the href). With guest mode on, a click
 * mints the anonymous session first — on CLICK, never on mount — and opens
 * today's case or guesstimate directly, the same flow as the old hero's
 * GuestPracticeActions.
 */

type Kind = 'case' | 'guesstimate' | 'briefs';

export default function StartCards({ caseId, guesstimateId }: { caseId: string | null; guesstimateId: string | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<Kind | null>(null);

  const cards: { kind: Kind; eyebrow: string; title: string; text: string; href: string; guestTo: string | null; photo: HomePhotoId }[] = [
    {
      kind: 'case',
      eyebrow: 'Start here',
      title: 'Try a real case',
      text: 'Solve interview-style cases with structured feedback.',
      href: '/dashboard',
      guestTo: caseId ? `/cases/${caseId}` : null,
      photo: 'boardroom',
    },
    {
      kind: 'guesstimate',
      eyebrow: 'Practise faster',
      title: 'Sharpen your estimation skills',
      text: 'India-focused market sizing and guesstimates.',
      href: '/practice?tab=guesstimates',
      guestTo: guesstimateId ? `/cases/${guesstimateId}` : null,
      photo: 'estimate',
    },
    {
      kind: 'briefs',
      eyebrow: 'Stay ahead',
      title: 'Be ready for discussions',
      text: 'Daily briefs, industry primers and current affairs for GDs and interviews.',
      href: '/gd-briefs',
      guestTo: '/gd-briefs',
      photo: 'news',
    },
  ];

  async function open(e: React.MouseEvent, kind: Kind, to: string | null) {
    if (!to || !isGuestModeEnabled() || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (busy) return;
    setBusy(kind);
    try {
      const user = await ensureGuestSession();
      if (!user) {
        toast.error('Could not start a practice session. Please try signing up instead.');
        router.push('/signup');
        return;
      }
      startTransition(() => router.push(to));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-4 lg:gap-6">
      {cards.map((c) => (
        <li key={c.kind}>
          <Link
            href={c.href}
            onClick={(e) => open(e, c.kind, c.guestTo)}
            aria-busy={busy === c.kind || undefined}
            className="group relative flex h-full min-h-[176px] overflow-hidden rounded-[12px] border border-border/90 bg-card shadow-[0_1px_2px_rgba(15,28,51,0.05),0_14px_34px_-24px_rgba(15,28,51,0.35)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong/80 hover:shadow-[0_1px_2px_rgba(15,28,51,0.06),0_22px_44px_-24px_rgba(15,28,51,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-none"
          >
            {/* Photograph — right side, dissolving into the card. */}
            <div
              aria-hidden
              className="absolute inset-y-0 right-0 w-[50%] overflow-hidden md:w-[44%] lg:w-[46%]"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%)',
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,.55) 30%, #000 62%)',
              }}
            >
              <HomeImage
                photo={HOME_PHOTOS[c.photo]}
                decorative
                sizes="(min-width: 1024px) 220px, (min-width: 768px) 160px, 50vw"
                widths={[320, 480, 640]}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none dark:brightness-[.72]"
              />
            </div>

            <div className="relative z-[1] flex max-w-[64%] flex-col p-5 pr-0 md:max-w-[82%] lg:max-w-[68%] lg:p-6 lg:pr-0">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                <span aria-hidden className="h-[5px] w-[5px] rounded-full bg-navy dark:bg-white/70" />
                {c.eyebrow}
              </p>
              <h3 className="mt-3 font-editorial text-[21px] font-semibold leading-[1.12] tracking-[-0.01em] text-navy dark:text-white xl:text-[22px]">
                {c.title}
              </h3>
              <p className="mt-2 max-w-[15.5rem] text-[14px] leading-relaxed text-muted-foreground">{c.text}</p>
              <span className="mt-auto pt-4 text-primary">
                {busy === c.kind ? (
                  <Loader2 aria-label="Opening" className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight aria-hidden className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
