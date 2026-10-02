'use client';

/**
 * VOICE ACCESS CARD (2026-10-03) — what a candidate sees when voice interview
 * mode cannot start for a reason that is NOT a connection problem.
 *
 *   signin   a guest (anonymous session). Shown the moment they tap Talk, before
 *            any session is requested, and again by the voice overlay if the
 *            server still says "Create an account". The ask is sign up / log in,
 *            with a plain way to keep going in chat without an account.
 *   upgrade  a signed-in account on a plan without voice (server: "Pro feature").
 *   credits  out of real-time voice minutes (server: 402). `detail` carries the
 *            server's own wording, which already says what to do next.
 *
 * Never says "Connection issue": that label is kept for real connection failures.
 *
 * Sign-up and log-in are plain links with `next` = this case. The guest's work
 * on the case is carried to the new account by GuestClaimBridge (same tab), so
 * leaving the page to sign up loses nothing.
 */

import Link from 'next/link';
import { ArrowRight, Check, Lock, MessageSquare, Zap } from 'lucide-react';
import VoiceWave from '@/components/icons/voice-wave';
import { FREE_VOICE_SESSION_MIN, FREE_VOICE_TRIAL_MIN, type VoiceAccessKind, type VoicePlan } from '@/lib/voice/access';

const PRIMARY = 'inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover';
const SECONDARY = 'inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted';
const CHAT_LINK = 'mx-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline';

export default function VoiceAccessCard({
  kind,
  next,
  plan = 'pro',
  detail,
  onContinueInChat,
  titleId,
  className = '',
}: {
  kind: Exclude<VoiceAccessKind, 'connection'>;
  /** Path to come back to after sign-up / log-in (the case). */
  next: string;
  /** Only for `signin`: what the new account gets, so the prompt never over-promises. */
  plan?: VoicePlan;
  /** Only for `credits`: the server's message. */
  detail?: string | null;
  onContinueInChat: () => void;
  /** id for the heading, so a dialog wrapper can point aria-labelledby at it. */
  titleId?: string;
  className?: string;
}) {
  const nextQ = encodeURIComponent(next);

  if (kind === 'signin') {
    return (
      <div className={`mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl ${className}`}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <VoiceWave className="h-6 w-6" />
        </div>
        <p className="text-micro font-semibold uppercase tracking-widest text-primary">Voice interview</p>
        <h2 id={titleId} className="mt-1.5 text-lg font-bold leading-snug text-foreground sm:text-xl">
          Sign in to continue to voice interview mode
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
          Talk this case through out loud with an interviewer who listens, follows up and pushes back, the way the real round goes.
        </p>

        <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left text-[13px] text-foreground/90">
          <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Say your structure, hear the interviewer reply</li>
          <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Follow-up questions on your numbers, live</li>
          <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Your work on this case comes with you</li>
        </ul>

        {plan === 'trial' && (
          <p className="mx-auto mt-4 max-w-xs rounded-lg bg-primary/5 px-3 py-2 text-[13px] font-semibold leading-snug text-primary">
            {FREE_VOICE_TRIAL_MIN} free minutes of voice interview when you sign up, up to {FREE_VOICE_SESSION_MIN} minutes per case
          </p>
        )}

        <div className={`${plan === 'trial' ? 'mt-3' : 'mt-5'} flex flex-col gap-2.5`}>
          <Link href={`/signup?next=${nextQ}`} className={PRIMARY}>
            Sign up free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href={`/login?next=${nextQ}`} className={SECONDARY}>
            Log in
          </Link>
        </div>
        <p className="mt-2.5 text-[11px] text-muted-foreground/80">
          {plan === 'trial'
            ? 'Free to sign up. No card needed.'
            : 'Free to sign up. Voice interview is included with Pro.'}
        </p>

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <button type="button" onClick={onContinueInChat} className={CHAT_LINK}>
          <MessageSquare className="h-4 w-4" />
          Continue in chat without signing up
        </button>
        <p className="mx-auto mt-1.5 max-w-xs text-[11px] leading-relaxed text-muted-foreground/80">
          Solve the whole case in chat. You only need an account at the end, to see your score and feedback.
        </p>
      </div>
    );
  }

  if (kind === 'upgrade') {
    return (
      <div className={`mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl ${className}`}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h2 id={titleId} className="text-lg font-bold leading-snug text-foreground sm:text-xl">Voice interview is a Pro feature</h2>
        <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
          Upgrade to talk cases through out loud with a live interviewer. Everything you have written in the chat stays as it is.
        </p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Link href="/upgrade?from=voice" className={PRIMARY}>
            See Pro plans <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" onClick={onContinueInChat} className={SECONDARY}>
            Continue in chat
          </button>
        </div>
      </div>
    );
  }

  // credits
  const upsell = (detail || '').toLowerCase().includes('upgrade');
  return (
    <div className={`mx-auto w-full max-w-sm rounded-xl border border-primary/20 bg-card p-6 text-center shadow-xl ${className}`}>
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Zap className="h-5 w-5" />
      </div>
      <h2 id={titleId} className="text-lg font-bold leading-snug text-foreground sm:text-xl">You&apos;re out of voice minutes</h2>
      <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {detail || 'Top up your real-time minutes to keep talking. You can carry on in the chat meanwhile.'}
      </p>
      <div className="mt-5 flex flex-col gap-2.5">
        {upsell && (
          <Link href="/upgrade?from=voice" className={PRIMARY}>
            See Pro plans <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <button type="button" onClick={onContinueInChat} className={upsell ? SECONDARY : PRIMARY}>
          Continue in chat
        </button>
      </div>
    </div>
  );
}
