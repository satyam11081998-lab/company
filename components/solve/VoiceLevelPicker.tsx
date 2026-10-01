'use client';

/**
 * Easy / Medium / Hard for the voice interviewer. Changing it reconnects the call
 * with the new style; the conversation so far carries over.
 */
import type { VoiceLevel } from '@/lib/voice/level';
import { VOICE_LEVELS } from '@/lib/voice/level';

const LABEL: Record<VoiceLevel, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export default function VoiceLevelPicker({
  value, onChange, disabled,
}: { value: VoiceLevel | null; onChange: (level: VoiceLevel) => void; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Interview difficulty" className="flex items-center rounded-full border bg-muted/40 p-0.5">
      {VOICE_LEVELS.map((lvl) => {
        const on = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => { if (!on) onChange(lvl); }}
            className={`rounded-full px-2.5 py-1 text-micro font-semibold normal-case tracking-normal transition-colors disabled:opacity-50 ${
              on ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {LABEL[lvl]}
          </button>
        );
      })}
    </div>
  );
}
