/**
 * Sentence-buffered TTS playback queue.
 *
 * The latency trick: do NOT wait for the interviewer's full reply. Tokens
 * arrive from the existing SSE stream; we flush on sentence boundaries, request
 * audio per sentence, and play the clips strictly in order. The candidate hears
 * sentence 1 while sentence 2 is still being generated, which is the difference
 * between "a phone call" and "a website that talks at you".
 *
 * Ordering is the whole contract here. Two clips overlapping is worse than a
 * pause: it is unintelligible, and it sounds broken rather than slow.
 */

import { speakText } from '@/lib/api';
import { stripMarkdown, isSpeakable } from '@/lib/voice/markdown-strip';

/** Flush when a sentence ends, or when a clause runs this long without ending. */
const MAX_CHUNK_CHARS = 160;
/** Never send a fragment shorter than this unless it is the final flush. */
const MIN_CHUNK_CHARS = 12;

export interface TtsQueueCallbacks {
  /** Fires true when audio starts, false when the queue drains. */
  onSpeakingChange?: (speaking: boolean) => void;
  /** Non-fatal: the caller should fall back to on-screen text, not kill the attempt. */
  onError?: (message: string) => void;
}

type Clip = { seq: number; audio: HTMLAudioElement; url: string };

/**
 * Unlock audio playback on iOS.
 *
 * Safari only allows an <audio> element to play if it was started inside a user
 * gesture. Talk mode IS entered by a tap, but the first real clip plays several
 * async hops later (getUserMedia → VAD → transcribe → interviewer reply), by
 * which point the gesture has expired and play() rejects with NotAllowedError.
 * Playing a silent element synchronously on the entry tap marks the audio
 * pipeline as user-approved for the rest of the session.
 *
 * MUST be called from the click handler itself, not from an effect.
 */
export function primeAudioPlayback() {
  try {
    const a = new Audio(
      'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tUxAADB8AhSmxhIIEVCSiJrDCQBTcu3UrAIwUdkRgQbFAZC1CQEwTJ9mjRvBA4UOLD8nKVOWfh+UlK3z/177OXrfOdKl7pyn3Xf//WreyTRUoAWgBgkOAGbZHBgG1OF6zM82DWbZaUmMBptgQhGjsyYqc9ae9XFz280948NMBWInljyzsNRFLPWdnZGWrddDsjK1unuSrVN9jJsK8KuQtQCtMBjCEtImISdNKJOopIpBFpNSMbIHCSRpRR5iakjTiyzLhchUUBwCgyKiweBv/7UsQbg8isVkpsPSCBGwqoSYekEAKKQCQKQAiCKAoAoAgAAAA0AAAAAA==',
    );
    a.volume = 0;
    void a.play().then(() => a.pause()).catch(() => {});
  } catch {
    /* nothing to unlock */
  }
}

export class TtsQueue {
  private buffer = '';
  private seq = 0;
  private nextToPlay = 0;
  private ready = new Map<number, Clip>();
  private playing: HTMLAudioElement | null = null;
  private speaking = false;
  private cancelled = false;
  private inFlight = new Set<AbortController>();
  private pending = 0;
  /**
   * Bumped on every cancel/reset. A request that was already in flight when the
   * turn was abandoned can still resolve afterwards — without this, its audio
   * would be injected into the NEXT turn's queue and the interviewer would say
   * something from a conversation the candidate already moved past.
   */
  private generation = 0;

  constructor(
    private getToken: () => string | null,
    private cbs: TtsQueueCallbacks = {},
  ) {}

  /** Feed one streamed token. Flushes automatically on sentence boundaries. */
  push(token: string) {
    if (this.cancelled) return;
    this.buffer += token;

    // Flush every complete sentence sitting in the buffer.
    for (;;) {
      const idx = this.findBoundary(this.buffer);
      if (idx < 0) break;
      const chunk = this.buffer.slice(0, idx + 1);
      this.buffer = this.buffer.slice(idx + 1);
      this.enqueue(chunk);
    }

    // A long clause with no terminator yet (the interviewer is mid-sentence and
    // the reply is running long) — break on the last space so we do not cut a
    // word in half.
    if (this.buffer.length >= MAX_CHUNK_CHARS) {
      const cut = this.buffer.lastIndexOf(' ', MAX_CHUNK_CHARS);
      const at = cut > MIN_CHUNK_CHARS ? cut : MAX_CHUNK_CHARS;
      this.enqueue(this.buffer.slice(0, at));
      this.buffer = this.buffer.slice(at);
    }
  }

  /** Speak whatever is left. Call when the stream is done. */
  flush() {
    if (this.cancelled) return;
    const rest = this.buffer.trim();
    this.buffer = '';
    if (rest) this.enqueue(rest);
  }

  /**
   * Stop immediately: kill playback, drop queued clips, abort in-flight
   * requests. Used by tap-to-interrupt and by leaving talk mode. Aborting the
   * fetches matters — otherwise an interrupted reply keeps costing TTS minutes
   * after the candidate has moved on.
   */
  cancel() {
    this.cancelled = true;
    this.generation++;
    this.buffer = '';
    this.inFlight.forEach((c) => c.abort());
    this.inFlight.clear();
    if (this.playing) {
      this.playing.pause();
      this.playing.src = '';
      this.playing = null;
    }
    this.ready.forEach((clip) => URL.revokeObjectURL(clip.url));
    this.ready.clear();
    this.pending = 0;
    this.setSpeaking(false);
  }

  /** Cancel and make the instance unusable. Call on unmount. */
  destroy() {
    this.cancel();
  }

  /** Reset after a cancel so the same instance can serve the next turn. */
  reset() {
    this.cancel();
    this.cancelled = false;
    this.seq = 0;
    this.nextToPlay = 0;
  }

  get isSpeaking() {
    return this.speaking;
  }

  /**
   * True if audio is playing OR still on its way. This is the one the caller
   * must use before reopening the mic.
   *
   * `isSpeaking` alone is a trap: when the reply finishes streaming, the clips
   * are typically still being fetched, so `isSpeaking` is false for a few
   * hundred milliseconds. Reopening the mic on that signal means the mic is
   * live when playback starts — the interviewer's own voice gets recorded,
   * transcribed, and posted as the candidate's next turn. The session starts
   * talking to itself.
   */
  get hasWork() {
    return this.speaking || this.playing !== null || this.pending > 0 || this.ready.size > 0;
  }

  // --- internals ---------------------------------------------------------

  /** Index of a sentence terminator, ignoring the common abbreviation traps. */
  private findBoundary(s: string): number {
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch !== '.' && ch !== '?' && ch !== '!') continue;
      // "20.5" / "Rs 1.2 crore" — a digit either side is a decimal, not an end.
      if (ch === '.' && /\d/.test(s[i - 1] || '') && /\d/.test(s[i + 1] || '')) continue;
      // Need whitespace (or end of buffer) after, or we are mid-token.
      const after = s[i + 1];
      if (after && !/\s/.test(after)) continue;
      if (i + 1 < MIN_CHUNK_CHARS) continue;
      return i;
    }
    return -1;
  }

  private enqueue(rawChunk: string) {
    const text = stripMarkdown(rawChunk);
    if (!text || !isSpeakable(text)) return;

    const seq = this.seq++;
    const token = this.getToken();
    if (!token) return;

    const gen = this.generation;
    const controller = new AbortController();
    this.inFlight.add(controller);
    this.pending++;

    speakText(text, token, controller.signal)
      .then((blob) => {
        this.inFlight.delete(controller);
        // Stale turn — the queue was cancelled and reset while this was in
        // flight. Dropping it is the whole point of the generation counter.
        if (this.cancelled || gen !== this.generation) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.ready.set(seq, { seq, audio, url });
        this.pump();
      })
      .catch((e: unknown) => {
        this.inFlight.delete(controller);
        if (this.cancelled || gen !== this.generation) return;
        // An aborted request is an interrupt, not a failure.
        if (e instanceof DOMException && e.name === 'AbortError') return;
        // Skip this clip's slot so the queue does not deadlock waiting for it.
        this.ready.set(seq, null as unknown as Clip);
        this.cbs.onError?.(e instanceof Error ? e.message : 'Voice playback failed');
        this.pump();
      })
      .finally(() => {
        this.pending = Math.max(0, this.pending - 1);
      });
  }

  /** Play whatever is at the head of the queue, strictly in sequence. */
  private pump() {
    if (this.cancelled || this.playing) return;

    if (!this.ready.has(this.nextToPlay)) {
      // Head clip is still generating. If nothing is in flight either, we have
      // drained.
      if (this.pending === 0 && this.ready.size === 0) this.setSpeaking(false);
      return;
    }

    const clip = this.ready.get(this.nextToPlay);
    this.ready.delete(this.nextToPlay);
    this.nextToPlay++;

    // A failed slot — skip straight to the next one.
    if (!clip) {
      this.pump();
      return;
    }

    this.playing = clip.audio;
    this.setSpeaking(true);

    const done = () => {
      URL.revokeObjectURL(clip.url);
      this.playing = null;
      this.pump();
    };
    clip.audio.onended = done;
    clip.audio.onerror = done;

    clip.audio.play().catch((e) => {
      // Autoplay policy: iOS Safari refuses audio that is not rooted in a user
      // gesture. Talk mode is entered by a tap, so the first play() is inside
      // one — but a page that regained focus can still land here.
      this.cbs.onError?.(
        e instanceof Error && e.name === 'NotAllowedError'
          ? 'Tap the screen once to allow audio playback.'
          : 'Voice playback failed',
      );
      done();
    });
  }

  private setSpeaking(v: boolean) {
    if (this.speaking === v) return;
    this.speaking = v;
    this.cbs.onSpeakingChange?.(v);
  }
}
