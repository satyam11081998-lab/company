/**
 * Text helpers for the voice call. No browser APIs here, so they are unit-tested in Node.
 */

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** How long after an interviewer line finished an echo of it is still plausible. */
export const ECHO_WINDOW_MS = 8000;

/**
 * True when what the mic "heard" is the interviewer's own recent line leaking from the
 * speakers (echo cancellation missed it). Deliberately narrow so a candidate who quotes the
 * question back ("so, the biggest risk you took...") and keeps going is never dropped.
 */
export function isEchoOfLine(heard: string, last: { text: string; at: number } | null, now: number): boolean {
  if (!last || !last.text) return false;
  if (now - last.at > ECHO_WINDOW_MS) return false;
  const h = norm(heard);
  const l = norm(last.text);
  if (!h || !l) return false;
  if (h === l) return true;
  const words = h.split(' ');
  return words.length >= 3 && l.includes(h);
}

/**
 * Speech recognisers invent words for silence ("Thanks for watching!", "you"). Those must
 * never become an interview answer. Short real answers ("No.", "Yes, twice.") are kept: in
 * an interview "No" can be the whole answer. `shortClip` = the audio was under ~1.5 s,
 * where the classic hallucinations live.
 */
const HALLUCINATIONS = new Set([
  'thanks for watching', 'thank you for watching', 'please subscribe', 'like and subscribe',
  'subtitles by the amara org community', 'you',
]);
const SHORT_CLIP_HALLUCINATIONS = new Set(['thank you', 'thanks', 'bye', 'bye bye', 'okay', 'ok', 'hmm', 'mm', 'uh', 'um']);

export function isNoiseTranscript(raw: string, opts: { shortClip?: boolean } = {}): boolean {
  const n = norm(raw);
  if (!n) return true;
  if (!/\p{L}/u.test(n)) return true;
  if (HALLUCINATIONS.has(n)) return true;
  if (opts.shortClip && SHORT_CLIP_HALLUCINATIONS.has(n)) return true;
  return false;
}

/**
 * Split an interviewer line into sentences for sentence-by-sentence speech (the first
 * sentence starts playing while the rest are still being synthesised). Never splits inside a
 * number ("1.5", "Rs. 20") and merges fragments shorter than `minChars` into a neighbour.
 */
export function splitSentences(text: string, minChars = 20, maxChars = 280): string[] {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  const raw: string[] = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    cur += ch;
    const end = ch === '.' || ch === '?' || ch === '!';
    if (!end) continue;
    if (ch === '.' && /\d/.test(t[i - 1] || '') && /\d/.test(t[i + 1] || '')) continue; // 1.5
    const next = t[i + 1];
    if (next && next !== ' ') continue;
    if (ch === '.' && /\b(?:Mr|Mrs|Ms|Dr|Rs|vs|e\.g|i\.e|etc|approx|No)\.$/i.test(cur.trim())) continue;
    raw.push(cur.trim());
    cur = '';
  }
  if (cur.trim()) raw.push(cur.trim());
  // merge tiny fragments ("Okay." + next sentence) and hard-wrap very long ones
  const out: string[] = [];
  for (const s of raw) {
    if (out.length && (out[out.length - 1].length < minChars || s.length < minChars / 2)) {
      out[out.length - 1] = `${out[out.length - 1]} ${s}`;
    } else {
      out.push(s);
    }
  }
  const wrapped: string[] = [];
  for (const s of out) {
    if (s.length <= maxChars) { wrapped.push(s); continue; }
    let rest = s;
    while (rest.length > maxChars) {
      let cut = rest.lastIndexOf(', ', maxChars);
      if (cut < maxChars / 3) cut = rest.lastIndexOf(' ', maxChars);
      if (cut <= 0) cut = maxChars;
      wrapped.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) wrapped.push(rest);
  }
  return wrapped;
}

/** Join transcript pieces without gluing two words together. */
export function joinSpeech(parts: string[]): string {
  return parts.map((p) => p.trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export function wordCount(s: string): number {
  const n = norm(s);
  return n ? n.split(' ').length : 0;
}

/**
 * Short, neutral acknowledgements the voice can say the moment an answer ends, so there is
 * no dead air while II prepares the next question. Neutral on purpose: no "great answer" —
 * evaluation signals change how candidates answer (spec §78).
 */
export const ACKS = ['Okay.', 'Mm-hm.', 'Right.', 'Thank you.', 'Got it.', 'Okay, thanks.'];

export function pickAck(previous: string | null, rnd: () => number = Math.random): string {
  const pool = ACKS.filter((a) => a !== previous);
  return pool[Math.floor(rnd() * pool.length) % pool.length];
}

/** Calm nudge after a long silence. Not part of the interview transcript. */
export const NUDGE = 'Take your time. Whenever you are ready — or I can repeat the question.';
