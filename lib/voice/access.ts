/**
 * VOICE ACCESS — why a voice interview could not start, in words a candidate
 * can act on (2026-10-03).
 *
 * The voice session endpoints refuse for three reasons that are NOT connection
 * problems, and each needs its own answer instead of "Connection issue":
 *
 *   signin   403 "Create an account to use voice interview mode." (guest)
 *   upgrade  403 "Voice interview is a Pro feature."
 *   credits  402 out of real-time minutes / free voice trial used
 *
 * Anything else (5xx, network, Google refusing the socket) stays a connection
 * problem. Pure, so scripts/test-voice-access.mjs checks it without a browser.
 */

export type VoiceAccessKind = 'signin' | 'upgrade' | 'credits' | 'connection';

export function voiceAccessKind(status: number, detail?: unknown): VoiceAccessKind {
  const d = typeof detail === 'string' ? detail.toLowerCase() : '';
  if (status === 403 && (d.includes('create an account') || d.includes('sign up') || d.includes('sign in'))) return 'signin';
  if (status === 403 && (d.includes('pro feature') || d.includes('upgrade'))) return 'upgrade';
  if (status === 402) return 'credits';
  return 'connection';
}

/**
 * What a guest gets once they have an account, so the sign-in prompt never
 * promises more than the account delivers. Gemini Live and the standard voice
 * pipeline are Pro only on the server; OpenAI Realtime gives every new account a
 * one-time free trial (routes/realtime.py).
 */
export type VoicePlan = 'pro' | 'trial';

export function voicePlanFor(voiceMode: string | null | undefined): VoicePlan {
  return voiceMode === 'realtime' ? 'trial' : 'pro';
}

/** Where sign-up / log-in should bring the candidate back to: the case they were on. */
export function voiceReturnPath(caseId: string): string {
  return `/cases/${encodeURIComponent(caseId)}`;
}
