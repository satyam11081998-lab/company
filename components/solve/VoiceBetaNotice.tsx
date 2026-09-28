'use client';

/**
 * Beta note for the voice interview (talk mode), shown at the top of every voice
 * overlay (Gemini Live, OpenAI Realtime, pipeline).
 *
 * Framed as "being improved", never as "broken", and it points to what is
 * fastest today: typing, or the dictation mic in the chat. The candidate can
 * hide it for the current session; it comes back the next time they open voice.
 *
 * Turn it off without a code change once voice is where it should be: set
 * NEXT_PUBLIC_VOICE_BETA_NOTICE=0 in Vercel and redeploy.
 */

import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export const VOICE_BETA_NOTICE_ON = process.env.NEXT_PUBLIC_VOICE_BETA_NOTICE !== '0';

export default function VoiceBetaNotice({ onSwitchToChat }: { onSwitchToChat?: () => void }) {
  const [hidden, setHidden] = useState(false);
  if (!VOICE_BETA_NOTICE_ON || hidden) return null;

  return (
    <div
      role="note"
      className="mx-4 mt-3 flex shrink-0 items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-left"
    >
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-small font-semibold text-foreground">
          Voice interview
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-micro font-semibold uppercase tracking-wide text-primary">
            Beta
          </span>
        </p>
        <p className="mt-1 text-small leading-relaxed text-muted-foreground">
          We&apos;re actively making voice faster, so the interviewer may sometimes take a moment to reply.
          For the smoothest experience right now, type your answers or tap the mic in the chat to speak
          them as text.
        </p>
        {onSwitchToChat && (
          <button
            type="button"
            onClick={onSwitchToChat}
            className="mt-2 text-small font-semibold text-primary hover:underline"
          >
            Switch to chat
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Hide this note"
        className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
