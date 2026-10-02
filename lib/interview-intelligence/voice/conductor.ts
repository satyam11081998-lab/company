/**
 * The Conductor runs the turn-taking of a spoken interview. It is transport-agnostic and has no
 * browser dependencies (timers and the clock are injected), so it is unit-tested in Node.
 *
 *   interviewer speaks ──► listening ──► hearing (candidate talks) ──► finishing (grace window)
 *          ▲                                  ▲   │ keeps talking              │ silence
 *          │                                  └───┘                            ▼
 *          └──────────── II decides the next line ◄──── thinking (ack plays, mic closed)
 *
 * Rules it enforces:
 *  - A candidate answer is only sent after a grace window with no new speech, so a thinking
 *    pause in the middle of an answer does not end it. Talking again inside the window
 *    simply continues the same answer.
 *  - Talking over the interviewer interrupts it (barge-in).
 *  - The interviewer's own voice leaking into the mic, and recogniser hallucinations on
 *    silence, never become an answer.
 *  - While II is preparing the next line the mic is closed (like a real call, you finish,
 *    they respond) and a short neutral acknowledgement fills the silence.
 *  - Every answer goes through the normal II turn path with an idempotent turn id, retried
 *    on a network blip, so a voice answer can never be lost or counted twice.
 */

import type { SpeakKind, TransportEvents, VoiceTransport } from './types';
import { isEchoOfLine, isNoiseTranscript, joinSpeech, NUDGE, pickAck, wordCount } from './text';

export type CallPhase =
  | 'idle' | 'speaking' | 'listening' | 'hearing' | 'finishing' | 'thinking' | 'paused' | 'ended' | 'error';

export interface TurnResult {
  lines: string[];
  status: string; // II session status after the turn
}

export interface ConductorOptions {
  /** After a finished stretch of speech, wait this long for more before sending the answer. */
  graceMs: number;
  /** Acknowledge answers of at least this many words ("Okay.") while II thinks. 0 = never. */
  ackMinWords: number;
  /** Gentle "take your time" after this much silence following a question. 0 = off. */
  nudgeAfterMs: number;
  /** Report the candidate as away after this much silence (UI pauses the interview). 0 = off. */
  idleAfterMs: number;
  /** Network retries for one answer before asking the candidate. */
  maxSubmitRetries: number;
  /** If speech stopped but no transcript arrived within this, move on. */
  transcriptTimeoutMs: number;
}

export const DEFAULT_OPTIONS: ConductorOptions = {
  // Live calls already end a turn with words-based detection that waits through thinking
  // pauses; standard voice already waited ~1.3 s of silence in its VAD. Kept short so the
  // interviewer does not feel slow, long enough that "...and, um" keeps the same answer open.
  graceMs: 700,
  ackMinWords: 8,
  nudgeAfterMs: 45_000,
  idleAfterMs: 240_000,
  maxSubmitRetries: 2,
  transcriptTimeoutMs: 7_000,
};

export interface ConductorHooks {
  submit(text: string, answerMs: number, turnId: string, kind: 'voice' | 'text'): Promise<TurnResult>;
  onPhase(p: CallPhase): void;
  /** The line the interviewer is saying now (null = clear). */
  onCaption(line: string | null, kind: SpeakKind | null): void;
  /** What has been heard of the current answer so far ('' = clear). */
  onPartial(text: string): void;
  onCandidateTurn(text: string, kind: 'voice' | 'text'): void;
  onInterviewerTurn(text: string): void;
  onNotice(message: string): void;
  onError(message: string, retry: () => void): void;
  onEnded(): void;
  onIdle(): void;
  newTurnId(): string;
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(t: unknown): void;
}

const NOT_CAUGHT = "Sorry, I didn't catch that. Could you say it again?";

export class Conductor {
  phase: CallPhase = 'idle';
  private t: VoiceTransport | null = null;
  private buffer: string[] = [];
  private partial = '';
  private grace: unknown = null;
  private silence: unknown = null;
  private idle: unknown = null;
  private transcriptWait: unknown = null;
  private lastSpoken: { text: string; at: number } | null = null;
  private speakingText: string | null = null;
  private speakingKind: SpeakKind | null = null;
  private questionEndedAt: number | null = null;
  private currentQuestion = '';
  private awaitingReply = false;
  private endedAfterSpeech = false;
  private lastAck: string | null = null;
  private nudged = false;
  private muted = false;
  private stopped = false;

  constructor(private hooks: ConductorHooks, private opts: ConductorOptions = DEFAULT_OPTIONS) {}

  /** Wire a transport. */
  attach(t: VoiceTransport) {
    this.t = t;
  }

  /**
   * Swap transports mid-call (live call dropped -> reconnected, or fell back to standard
   * voice). Re-applies mic state and re-says a line that the drop cut off.
   */
  swap(t: VoiceTransport) {
    this.t = t;
    t.setMuted(this.muted);
    const listen = this.phase === 'listening' || this.phase === 'hearing' || this.phase === 'finishing';
    t.setListening(listen);
    if (this.phase === 'speaking' && this.currentQuestion) {
      t.say(this.currentQuestion, 'line');
    } else if (this.phase === 'hearing' || this.phase === 'finishing') {
      if (this.buffer.length) this.scheduleCommit();
      else this.backToListening(false);
    }
  }

  /** Events object to pass to a transport. The UI supplies what it owns (fatal errors — it may
   *  swap transports — usage metering and warnings). */
  events(extra: Pick<TransportEvents, 'onFatal'> & Partial<Pick<TransportEvents, 'onUsage' | 'onWarning'>>): TransportEvents {
    return {
      onSpeechStart: () => this.speechStart(),
      onSpeechStop: () => this.speechStop(),
      onPartial: (text) => this.heardPartial(text),
      onFinal: (text, meta) => this.heardFinal(text, meta),
      onSpeaking: (speaking, kind, text) => this.speaking(speaking, kind, text),
      ...extra,
    };
  }

  get question() {
    return this.currentQuestion;
  }

  // ------------------------------------------------------------------ public controls
  /** Start (or resume) with the interviewer's opening line(s). */
  begin(lines: string[], status = 'active') {
    this.stopped = false;
    this.handleReply({ lines, status });
  }

  /** Repeat the current question (no II round trip). */
  repeat() {
    if (!this.t || !this.currentQuestion) return;
    if (this.phase === 'thinking' || this.phase === 'paused' || this.phase === 'ended') return;
    this.clearTimers();
    if (this.t.busy) this.t.interrupt();
    this.t.say(this.currentQuestion, 'line');
  }

  /** Candidate cut the interviewer off with the button / space bar / tapping the orb. */
  interrupt() {
    if (!this.t) return;
    if (this.t.busy) this.t.interrupt();
  }

  /** A typed answer from inside the call. */
  submitTyped(text: string) {
    const clean = (text || '').trim();
    if (!clean || this.phase === 'thinking' || this.phase === 'ended' || this.phase === 'paused') return;
    if (this.t?.busy) this.t.interrupt();
    this.buffer = [clean];
    this.commit('text');
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.t?.setMuted(m);
    if (m) this.clearSilenceTimers();
    else if (this.phase === 'listening') this.armSilence();
  }

  pause() {
    this.clearTimers();
    if (this.t?.busy) this.t.interrupt();
    this.t?.setListening(false);
    this.buffer = [];
    this.setPartial('');
    this.setPhase('paused');
  }

  stop() {
    this.stopped = true;
    this.clearTimers();
    this.t?.stop();
  }

  // ------------------------------------------------------------------ transport events
  private speechStart() {
    if (this.stopped || this.muted) return;
    if (this.phase === 'thinking' || this.phase === 'paused' || this.phase === 'ended' || this.phase === 'error') return;
    if (this.phase === 'idle') return;
    // Barge-in: talking over the interviewer stops it.
    if (this.t?.busy && this.speakingKind !== null) this.t.interrupt();
    this.clearGrace();
    this.clearSilenceTimers();
    this.setPhase('hearing');
  }

  private speechStop() {
    if (this.phase !== 'hearing') return;
    this.setPhase('finishing');
    this.clearTranscriptWait();
    this.transcriptWait = this.hooks.setTimeout(() => {
      this.transcriptWait = null;
      if (this.phase !== 'finishing' && this.phase !== 'hearing') return;
      if (this.t?.userSpeaking) return;
      if (this.buffer.length) this.commit('voice');
      else this.backToListening(true);
    }, this.opts.transcriptTimeoutMs);
  }

  private heardPartial(text: string) {
    if (this.phase !== 'hearing' && this.phase !== 'finishing') return;
    this.setPartial(joinSpeech([...this.buffer, text]));
  }

  private heardFinal(text: string, meta: { durationMs?: number }) {
    if (this.stopped) return;
    if (this.phase === 'thinking' || this.phase === 'paused' || this.phase === 'ended' || this.phase === 'idle'
      || this.phase === 'error') return;
    this.clearTranscriptWait();
    const now = this.hooks.now();
    const shortClip = typeof meta?.durationMs === 'number' && meta.durationMs < 1500;
    const junk = !text || isNoiseTranscript(text, { shortClip }) || isEchoOfLine(text, this.lastSpoken, now);
    if (junk) {
      if (!this.buffer.length && !this.t?.userSpeaking) {
        // Real speech we could not read (empty transcript) gets a polite "say again";
        // echoes and recogniser noise are dropped silently.
        this.backToListening(!text && (meta?.durationMs ?? 0) >= 1500);
      } else if (!this.t?.userSpeaking) {
        this.scheduleCommit();
      }
      return;
    }
    this.buffer.push(text);
    this.setPartial(joinSpeech(this.buffer));
    if (this.t?.userSpeaking) {
      this.setPhase('hearing');
      return;
    }
    this.scheduleCommit();
  }

  private speaking(on: boolean, kind: SpeakKind | null, text?: string) {
    if (this.stopped) return;
    if (on) {
      this.speakingKind = kind;
      this.speakingText = text ?? null;
      if (kind === 'line') {
        this.hooks.onCaption(text ?? null, kind);
        this.setPhase('speaking');
      } else if (kind === 'nudge') {
        this.hooks.onCaption(text ?? null, kind);
        this.setPhase('speaking');
      }
      // an ack plays during 'thinking' and leaves the phase alone
      return;
    }
    // queue drained
    if (this.speakingText) this.lastSpoken = { text: this.speakingText, at: this.hooks.now() };
    this.speakingKind = null;
    this.speakingText = null;
    if (this.phase === 'paused' || this.phase === 'ended') return;
    if (this.awaitingReply) {
      this.setPhase('thinking');
      return;
    }
    if (this.endedAfterSpeech) {
      this.hooks.onCaption(null, null);
      this.t?.setListening(false);
      this.setPhase('ended');
      this.hooks.onEnded();
      return;
    }
    if (this.phase === 'hearing' || this.phase === 'finishing') return; // barge-in already moved on
    this.backToListening(false, true);
  }

  // ------------------------------------------------------------------ internals
  private scheduleCommit() {
    this.clearGrace();
    this.setPhase('finishing');
    const grace = this.t?.kind === 'standard' ? Math.min(this.opts.graceMs, 450) : this.opts.graceMs;
    this.grace = this.hooks.setTimeout(() => {
      this.grace = null;
      if (this.t?.userSpeaking) return; // they carried on: speechStop will come again
      this.commit('voice');
    }, grace);
  }

  private commit(kind: 'voice' | 'text') {
    this.clearTimers();
    const text = joinSpeech(this.buffer);
    this.buffer = [];
    this.setPartial('');
    if (!text) {
      this.backToListening(false);
      return;
    }
    this.t?.setListening(false);
    this.setPhase('thinking');
    this.hooks.onCandidateTurn(text, kind);
    if (kind === 'voice' && this.opts.ackMinWords > 0 && wordCount(text) >= this.opts.ackMinWords && this.t) {
      const ack = pickAck(this.lastAck);
      this.lastAck = ack;
      this.t.say(ack, 'ack');
    }
    const answerMs = this.questionEndedAt === null ? 0 : Math.max(0, Math.round(this.hooks.now() - this.questionEndedAt));
    this.awaitingReply = true;
    this.send(text, answerMs, this.hooks.newTurnId(), kind, 0);
  }

  private send(text: string, answerMs: number, turnId: string, kind: 'voice' | 'text', attempt: number) {
    this.hooks.submit(text, answerMs, turnId, kind).then((res) => {
      if (this.stopped) return;
      this.awaitingReply = false;
      this.handleReply(res);
    }).catch((e: unknown) => {
      if (this.stopped) return;
      const status = (e as { status?: number })?.status ?? 0;
      const transient = status === 0 || status >= 500 || status === 429;
      if (transient && attempt < this.opts.maxSubmitRetries) {
        this.hooks.setTimeout(() => this.send(text, answerMs, turnId, kind, attempt + 1), 1200 * (attempt + 1));
        return;
      }
      this.awaitingReply = false;
      if (this.t?.busy) this.t.interrupt();
      this.setPhase('error');
      const message = (e as Error)?.message || 'Your answer could not be sent.';
      // Retrying reuses the SAME turn id, so the answer can never be counted twice.
      this.hooks.onError(message, () => {
        this.awaitingReply = true;
        this.setPhase('thinking');
        this.send(text, answerMs, turnId, kind, 0);
      });
    });
  }

  private handleReply(res: TurnResult) {
    if (res.status === 'completed' || res.status === 'expired') this.endedAfterSpeech = true;
    if (res.status === 'paused') {
      this.pause();
      return;
    }
    const lines = (res.lines || []).map((l) => (l || '').trim()).filter(Boolean);
    if (!lines.length) {
      if (this.endedAfterSpeech && !this.t?.busy) {
        this.setPhase('ended');
        this.hooks.onEnded();
      } else if (!this.t?.busy) {
        this.backToListening(false);
      }
      return;
    }
    // One spoken item for the whole reply (e.g. a transition + the next question): a barge-in
    // then cuts it as a unit instead of silently dropping the question queued behind it, and
    // the caption keeps the full text on screen.
    for (const line of lines) this.hooks.onInterviewerTurn(line);
    const spoken = lines.join(' ');
    this.currentQuestion = spoken;
    this.t?.say(spoken, 'line');
    this.nudged = false;
  }

  private backToListening(sayNotCaught: boolean, questionJustEnded = false) {
    this.clearTimers();
    this.setPartial('');
    if (sayNotCaught && this.t) {
      this.t.say(NOT_CAUGHT, 'nudge');
      return; // listening resumes when it finishes
    }
    if (questionJustEnded) this.questionEndedAt = this.hooks.now();
    this.t?.setListening(true);
    this.setPhase('listening');
    this.armSilence();
  }

  private armSilence() {
    this.clearSilenceTimers();
    if (this.muted || this.phase !== 'listening') return;
    if (this.opts.nudgeAfterMs > 0 && !this.nudged) {
      this.silence = this.hooks.setTimeout(() => {
        this.silence = null;
        if (this.phase !== 'listening' || this.muted || !this.t) return;
        this.nudged = true;
        this.t.say(NUDGE, 'nudge');
      }, this.opts.nudgeAfterMs);
    }
    if (this.opts.idleAfterMs > 0) {
      this.idle = this.hooks.setTimeout(() => {
        this.idle = null;
        if (this.phase === 'listening' && !this.muted) this.hooks.onIdle();
      }, this.opts.idleAfterMs);
    }
  }

  private setPartial(text: string) {
    if (text === this.partial) return;
    this.partial = text;
    this.hooks.onPartial(text);
  }

  private setPhase(p: CallPhase) {
    if (this.phase === p) return;
    this.phase = p;
    this.hooks.onPhase(p);
  }

  private clearGrace() {
    if (this.grace) this.hooks.clearTimeout(this.grace);
    this.grace = null;
  }

  private clearTranscriptWait() {
    if (this.transcriptWait) this.hooks.clearTimeout(this.transcriptWait);
    this.transcriptWait = null;
  }

  private clearSilenceTimers() {
    if (this.silence) this.hooks.clearTimeout(this.silence);
    if (this.idle) this.hooks.clearTimeout(this.idle);
    this.silence = null;
    this.idle = null;
  }

  private clearTimers() {
    this.clearGrace();
    this.clearTranscriptWait();
    this.clearSilenceTimers();
  }
}
