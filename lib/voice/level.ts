/**
 * Voice interview difficulty the candidate picks (Easy / Medium / Hard). The
 * backend turns it into the interviewer's behaviour (prompts/voice_interviewer_playbook.py).
 * Remembered per browser; nothing breaks if storage is unavailable.
 */
export type VoiceLevel = 'easy' | 'medium' | 'hard';
export const VOICE_LEVELS: VoiceLevel[] = ['easy', 'medium', 'hard'];
const KEY = 'mece.voiceLevel';

export function isVoiceLevel(v: unknown): v is VoiceLevel {
  return v === 'easy' || v === 'medium' || v === 'hard';
}

/** The level the candidate last picked, or null (then the case's own difficulty applies). */
export function getStoredLevel(): VoiceLevel | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return isVoiceLevel(v) ? v : null;
  } catch {
    return null;
  }
}

export function setStoredLevel(level: VoiceLevel): void {
  try {
    window.localStorage.setItem(KEY, level);
  } catch {
    /* private mode etc. - the choice still applies to this call */
  }
}

/** A save that hangs must never hold up the saves queued behind it. */
export function withTimeout<T>(p: Promise<T>, ms = 10000): Promise<T | undefined> {
  return Promise.race([p, new Promise<undefined>((r) => setTimeout(() => r(undefined), ms))]);
}
