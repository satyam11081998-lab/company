/**
 * Reject transcriptions that are not really the candidate talking.
 *
 * Two separate problems, one filter.
 *
 * 1. WHISPER HALLUCINATES ON SILENCE. Given near-silent or noise-only audio it
 *    does not return an empty string — it returns confident filler, most often
 *    "Thank you.", "Thanks for watching!", "you", or a lone period. These are
 *    artefacts of its training data, not speech. Posted into a live interview
 *    they become a candidate turn: the interviewer replies to "Thank you.", the
 *    transcript is polluted, and the scorer later reads that exchange as part of
 *    the candidate's performance.
 *
 * 2. AN UNATTENDED MIC IS A COST LEAK. Talk mode holds the mic open. A room with
 *    a television in it will trip the VAD indefinitely, and every trip costs a
 *    Whisper call, an interviewer call and a TTS call. Dropping noise-shaped
 *    transcriptions before they become turns is the cheapest place to stop that.
 *
 * Deliberately conservative: this runs on the candidate's actual answers, and
 * discarding a real turn is far worse than letting one "Thank you." through.
 * Anything with real sentence structure passes.
 */

/**
 * Whisper's well-known silence hallucinations, normalised. Kept short and
 * exact-match only — a substring rule here would eat real answers, since a
 * candidate genuinely does say "thank you" at the end of an interview.
 */
const WHISPER_SILENCE_ARTEFACTS = new Set([
  'you',
  'thank you',
  'thanks',
  'thank you very much',
  'thanks for watching',
  'thanks for watching!',
  'please subscribe',
  'bye',
  'bye bye',
  'okay',
  'ok',
  'yeah',
  'hmm',
  'mm',
  'mhm',
  'uh',
  'um',
  'so',
  'the',
  'a',
  'i',
]);

/** One-word answers that are real turns (a reply to a yes/no question from the interviewer). */
const ANSWER_WORDS = new Set(['yes', 'no', 'yep', 'nope', 'nah', 'sure', 'haan', 'nahi']);

/** Strip punctuation and collapse whitespace for comparison. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’\-–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface NoiseVerdict {
  /** True when this should NOT become a turn. */
  isNoise: boolean;
  /** For logging/telemetry, not for the user. */
  reason?: 'empty' | 'too-short' | 'whisper-artefact' | 'no-letters';
}

export function classifyTranscript(raw: string): NoiseVerdict {
  const text = (raw || '').trim();
  if (!text) return { isNoise: true, reason: 'empty' };

  const n = normalise(text);
  if (!n) return { isNoise: true, reason: 'no-letters' };

  // A number IS a case-interview turn: "3", "50%", "1.5x", "0.46B" answer the interviewer's
  // question as fully as a sentence does (2026-09-29: these used to be dropped as
  // "no letters" / "too short", so a spoken "fifty percent" never reached the interviewer).
  if (/\d/.test(n)) return { isNoise: false };

  // No alphabetic content at all — punctuation from noise.
  if (!/[a-z]/i.test(n)) return { isNoise: true, reason: 'no-letters' };

  if (WHISPER_SILENCE_ARTEFACTS.has(n)) return { isNoise: true, reason: 'whisper-artefact' };

  // Explicit answers are turns even though they are one short word.
  if (ANSWER_WORDS.has(n)) return { isNoise: false };

  // Any other single short word is not a case-interview turn ("hi", "uh" variants the
  // artefact list misses); anything longer, or with a space in it, is treated as real.
  const words = n.split(' ');
  if (words.length === 1 && n.length <= 3) return { isNoise: true, reason: 'too-short' };

  return { isNoise: false };
}

/** Convenience wrapper. */
export function isLikelyNoise(raw: string): boolean {
  return classifyTranscript(raw).isNoise;
}
