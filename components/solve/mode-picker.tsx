'use client';

import { memo } from 'react';
import { Check, X } from 'lucide-react';
import type { AttemptMode } from '@/lib/interview-api';

/**
 * The choice that opens a case: Interview or Whiteboard.
 *
 * Shown before the attempt is created, because the mode is immutable once it exists
 * (migration 0076) — a candidate must not be able to take the help and then claim the
 * rank. One tap, every time: the two runs behave so differently that an invisible
 * remembered setting would leave people unsure which room they are in, which is worse
 * than a tap.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md):
 *   §B  declared type classes only; headings at full strength, no opacity.
 *   §C  semantic tokens only — no raw hex. Cardinal red appears exactly once, as the
 *       heading keyword emphasis §E permits. The cards themselves carry no accent: the
 *       two options are peers and colouring one would read as a recommendation.
 *   §C  equal-width columns.
 *   §D  no left-accent borders.
 */

export interface ModePickerProps {
  caseTitle: string;
  onChoose: (mode: AttemptMode) => void;
  busy?: boolean;
}

interface Row {
  yes: boolean;
  text: string;
}

const INTERVIEW: Row[] = [
  { yes: true, text: 'Answers every factual question you ask' },
  { yes: true, text: 'Pushes on the assumption that would change your answer' },
  { yes: false, text: 'No hints, no structure, no corrected figures' },
  { yes: false, text: 'No praise — not even "you\'re on the right track"' },
  { yes: true, text: 'Scored, ranked, and counts toward your points' },
];

const WHITEBOARD: Row[] = [
  { yes: true, text: 'Works the problem with you, one rung of help at a time' },
  { yes: true, text: 'Draws your structure beside the conversation as you talk' },
  { yes: true, text: 'Teaches the reusable move, not this case\'s number' },
  { yes: false, text: 'No score, no percentile, no ranking' },
  { yes: false, text: 'Earns no points or badges' },
];

function Option({
  name, blurb, rows, cta, onPick, busy,
}: {
  name: string;
  blurb: string;
  rows: Row[];
  cta: string;
  onPick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={busy}
      className="group flex w-full flex-col rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:p-6"
    >
      <h2 className="text-h3 font-semibold text-foreground">{name}</h2>
      <p className="mt-1.5 text-small leading-relaxed text-muted-foreground">{blurb}</p>

      <ul className="mt-4 flex-1 space-y-2">
        {rows.map((r) => (
          <li key={r.text} className="flex gap-2">
            {/* Monochrome by contract: a yes and a no are told apart by the glyph and by
                full-strength vs muted text, never by green and red. */}
            {r.yes ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground" aria-hidden />
            ) : (
              <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className={`text-small leading-snug ${r.yes ? 'text-foreground' : 'text-muted-foreground'}`}>
              {r.text}
            </span>
          </li>
        ))}
      </ul>

      <span className="mt-5 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-small font-semibold text-foreground transition-colors group-hover:bg-card">
        {cta}
      </span>
    </button>
  );
}

function ModePickerImpl({ caseTitle, onChoose, busy }: ModePickerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <p className="text-micro font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {caseTitle}
      </p>
      <h1 className="mt-2 text-h2 font-semibold tracking-tight text-foreground">
        How do you want to <span className="text-primary">run this one</span>?
      </h1>
      <p className="mt-3 max-w-xl text-body text-muted-foreground">
        You cannot switch once you start — taking the help and then claiming the rank would make
        the rank meaningless. Pick either; you can run the same case again in the other mode.
      </p>

      {/* Equal-width columns (§C). */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Option
          name="Interview"
          blurb="A real interviewer, evaluating you. This is the one that counts."
          rows={INTERVIEW}
          cta={busy ? 'Starting…' : 'Start the interview'}
          onPick={() => onChoose('interview')}
          busy={busy}
        />
        <Option
          name="Whiteboard"
          blurb="Work it out in the open, with your thinking drawn as you go."
          rows={WHITEBOARD}
          cta={busy ? 'Starting…' : 'Open the whiteboard'}
          onPick={() => onChoose('whiteboard')}
          busy={busy}
        />
      </div>

      <p className="mt-6 text-small text-muted-foreground">
        New to this case? The Whiteboard is where you learn it. Come back and sit the Interview
        when you want the number.
      </p>
    </div>
  );
}

export const ModePicker = memo(ModePickerImpl);
export default ModePicker;
