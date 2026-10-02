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
 *    pause in the middle of an answer does not end it.
 *  - Talking over the interviewer interrupts it — but only when the words heard are NOT the
 *    interviewer's own. On laptop speakers the interviewer's voice leaks into the mic; that echo
 *    must never cut the interviewer off or become an answer.
 *  - Recogniser hallucinations on silence never become an answer.
 *  - While II is preparing the next line the mic is closed and a short neutral acknowledgement
 *    fills the silence.
 *  - Every answer goes through the normal II turn path with an idempotent turn id, retried on a
 *    network blip, so a voice answer can never be lost or counted twice.
 *  - Bounded cost: one answer is capped (warning first, then it is sent and the conversation
 *    moves on); a silent, unattended call nudges, asks "are you still there?", then reports the
 *    candidate as away so the UI can pause the interview and close the voice connection.
 */

import type { SpeakKind, TransportEvents, VoiceTransport } from './types';
import { ECHO_WINDOW_MS, isBargeIn, isEchoOfLine, isNoiseTranscript, joinSpeech, NUDGE, pickAck, STILL_THERE, wordCount } from './text';

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
  /** "Are you still there?" after this much silence. 0 = off. */
  stillThereAfterMs: number;
  /** Report the candidate as away after this much silence (UI pauses + disconnects). 0 = off. */
  idleAfterMs: number;
  /** One answer can run at most this long; then it is sent and the interview moves on. 0 = off. */
  maxAnswerMs: number;
  /** Warn this long into an answer that time is nearly up. */
  answerWarnMs: number;
  /** Network retries for one answer before asking the candidate. */
  maxSubmitRetries: number;
  /** If speech stopped but no transcript arrived within this, move on. */
  transcriptTimeoutMs: number;
}

export const DEFAULT_OPTIONS: ConductorOptions = {
  // Live calls already end a turn with words-based detection that waits through thinking
  // pauses; standard voice already waited ~1.3 s of silence in its VAD.
  graceMs: 700,
  ackMinWords: 8,
  nudgeAfterMs: 60_000,
  stillThereAfterMs: 180_000,
  idleAfterMs: 240_000,
  maxAnswerMs: 300_000,
  answerWarnMs: 270_000,
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
export const ANSWER_WARNING = 'About 30 seconds left for this answer. Start wrapping up.';
export const ANSWER_CAPPED = 'Answers are capped at five minutes, so the interviewer will take it from here.';

export class Conductor {
  phase: CallPhase = 'idle';
  private t: VoiceTransport | null = null;
  private buffer: string[] = [];
  private segment = '';          // words of the stretch being spoken now (live transcript)
  private partial = '';
  private grace: unknown = null;
  private transcriptWait: unknown = null;
  private silenceTimers: unknown[] = [];
  private silenceSince: number | null = null;
  private answerTimers: unknown[] = [];
  private lastSpoken: { text: string; at: number } | null = null;
  private speakingText: string | null = null;
  private speakingKind: SpeakKind | null = null;
  private bargePending = false;
  private questionEndedAt: number | null = null;
  private currentQuestion = '';
  private awaitingReply = false;
  private endedAfterSpeech = false;
  private lastAck: string | null = null;
  private nudged = false;
  private askedStillThere = false;
  private muted = false;
  private stopped = false;
  private unsaid: string | null = null;   // a reply that arrived while the line was reconnecting

  constructor(private hooks: ConductorHooks, private opts: ConductorOptions = DEFAULT_OPTIONS) {}

  /** Wire a transport. */
  attach(t: VoiceTransport) {
    this.t = t;
  }

  /** The transport currently attached (null after a disconnect). */
  get transport() {
    return this.t;
  }

  /** Forget the transport (the UI closed it to stop all streaming while paused). */
  detach() {
    this.t = null;
  }

  /**
   * Swap transports mid-call (dropped call reconnected, fell back to standard voice, or the
   * voice was reconnected after a break). Re-applies mic state and re-says a cut-off line.
   */
  swap(t: VoiceTransport) {
    this.t = t;
    t.setMuted(this.muted);
    const listen = this.phase === 'listening' || this.phase === 'hearing' || this.phase === 'finishing';
    t.setListening(listen);
    if (this.unsaid && this.phase !== 'paused') {
      const line = this.unsaid;
      this.unsaid = null;
      t.say(line, 'line');
    } else if (this.phase === 'speaking' && this.currentQuestion) {
      t.say(this.currentQuestion, 'line');
    } else if (this.phase === 'hearing' || this.phase === 'finishing') {
      if (this.segment) { this.buffer.push(this.segment); this.segment = ''; }
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
    if (this.phase === 'paused') this.setPhase('idle'); // resuming: leave the break first
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
    this.segment = '';
    this.commit('text');
  }

  setMuted(m: boolean) {
    const was = this.muted;
    this.muted = m;
    this.t?.setMuted(m);
    if (m) {
      this.clearSilenceTimers();
    } else if (this.phase === 'listening') {
      // Coming back (unmuted, or back from another tab) starts the silence clock again: the
      // candidate is clearly there, so they get the full time before any "are you still there?".
      if (was) {
        this.silenceSince = this.hooks.now();
        this.nudged = false;
        this.askedStillThere = false;
      }
      this.armSilence();
    }
  }

  pause() {
    this.clearTimers();
    this.unsaid = null; // resuming says the current question again
    if (this.t?.busy) this.t.interrupt();
    this.t?.setListening(false);
    this.buffer = [];
    this.segment = '';
    this.bargePending = false;
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
    if (this.phase === 'speaking') {
      // A barge-in — or the interviewer's own voice leaking into the mic. The words decide
      // (heardPartial / heardFinal); standard voice does not listen while it speaks.
      if (this.t?.kind !== 'standard') this.bargePending = true;
      return;
    }
    if (this.phase === 'thinking' || this.phase === 'paused' || this.phase === 'ended' || this.phase === 'error'
      || this.phase === 'idle') return;
    this.clearGrace();
    this.clearSilenceTimers();
    this.silenceSince = null;
    this.nudged = false;
    this.askedStillThere = false;
    this.armAnswerCap();
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
      if (this.segment) { this.buffer.push(this.segment); this.segment = ''; }
      if (this.buffer.length) this.commit('voice');
      else this.backToListening(true);
    }, this.opts.transcriptTimeoutMs);
  }

  private heardPartial(text: string) {
    if (this.phase === 'speaking') {
      if (this.bargePending && this.isBarge(text)) this.bargeIn(text);
      return;
    }
    if (this.phase !== 'hearing' && this.phase !== 'finishing') return;
    this.segment = text;
    this.setPartial(joinSpeech([...this.buffer, text]));
  }

  private heardFinal(text: string, meta: { durationMs?: number }) {
    if (this.stopped) return;
    const shortClip = typeof meta?.durationMs === 'number' && meta.durationMs < 1500;
    const junk = !text || isNoiseTranscript(text, { shortClip }) || this.isEcho(text);
    if (this.phase === 'speaking') {
      this.bargePending = false;
      if (junk || !this.isBarge(text)) return;   // the interviewer's own voice: keep speaking
      this.bargeIn('');                          // real words that came without a live transcript
    }
    if (this.phase === 'thinking' || this.phase === 'paused' || this.phase === 'ended' || this.phase === 'idle'
      || this.phase === 'error') return;
    this.clearTranscriptWait();
    this.segment = '';
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
      if (kind === 'line' || kind === 'nudge') {
        this.hooks.onCaption(text ?? null, kind);
        this.setPhase('speaking');
        // The mic stays open while the interviewer talks, so the candidate can cut in by voice
        // (the words decide whether it is them or an echo). Standard voice ignores it while busy.
        this.t?.setListening(true);
      }
      // an ack plays during 'thinking' and leaves the phase alone
      return;
    }
    // queue drained
    const finished = this.speakingKind;
    if (this.speakingText) this.lastSpoken = { text: this.speakingText, at: this.hooks.now() };
    this.speakingKind = null;
    this.speakingText = null;
    this.bargePending = false;
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
    // After a nudge the silence clock keeps running; after a question it starts now.
    this.backToListening(false, finished !== 'nudge');
  }

  // ------------------------------------------------------------------ internals
  /** Words heard while the interviewer speaks: the candidate cutting in, or an echo? */
  private isBarge(text: string): boolean {
    const now = this.hooks.now();
    const recent = this.lastSpoken && now - this.lastSpoken.at <= ECHO_WINDOW_MS ? this.lastSpoken.text : null;
    return isBargeIn(text, [this.speakingText, recent]);
  }

  private isEcho(text: string): boolean {
    const now = this.hooks.now();
    return isEchoOfLine(text, this.speakingText ? { text: this.speakingText, at: now } : null, now)
      || isEchoOfLine(text, this.lastSpoken, now);
  }

  private bargeIn(text: string) {
    this.bargePending = false;
    this.clearTimers();
    this.silenceSince = null;
    this.armAnswerCap();
    this.setPhase('hearing');          // before interrupting: the "stopped speaking" event must not reopen listening
    if (text) {
      this.segment = text;
      this.setPartial(joinSpeech([...this.buffer, text]));
    }
    this.t?.interrupt();
  }

  private armAnswerCap() {
    if (this.answerTimers.length || this.opts.maxAnswerMs <= 0) return;
    if (this.opts.answerWarnMs > 0 && this.opts.answerWarnMs < this.opts.maxAnswerMs) {
      this.answerTimers.push(this.hooks.setTimeout(() => {
        if (this.phase === 'hearing' || this.phase === 'finishing') this.hooks.onNotice(ANSWER_WARNING);
      }, this.opts.answerWarnMs));
    }
    this.answerTimers.push(this.hooks.setTimeout(() => {
      this.answerTimers = [];
      if (this.phase !== 'hearing' && this.phase !== 'finishing') return;
      if (this.segment) { this.buffer.push(this.segment); this.segment = ''; }
      this.hooks.onNotice(ANSWER_CAPPED);
      this.commit('voice');
    }, this.opts.maxAnswerMs));
  }

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
    this.segment = '';
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
    if (this.phase === 'paused') {
      // The reply landed after the candidate went on a break: keep it for when they resume.
      for (const line of lines) this.hooks.onInterviewerTurn(line);
      if (lines.length) this.currentQuestion = lines.join(' ');
      if (this.endedAfterSpeech) {
        this.setPhase('ended');
        this.hooks.onEnded();
      }
      return;
    }
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
    this.nudged = false;
    this.askedStillThere = false;
    if (this.t) this.t.say(spoken, 'line');
    else this.unsaid = spoken; // the line is reconnecting: said as soon as it is back (swap)
  }

  private backToListening(sayNotCaught: boolean, restartSilenceClock = true) {
    this.clearTimers();
    this.segment = '';
    this.setPartial('');
    if (sayNotCaught && this.t) {
      this.t.say(NOT_CAUGHT, 'nudge');
      return; // listening resumes when it finishes
    }
    const now = this.hooks.now();
    if (restartSilenceClock || this.silenceSince === null) {
      this.silenceSince = now;
      if (restartSilenceClock) this.questionEndedAt = now;
    }
    this.t?.setListening(true);
    this.setPhase('listening');
    this.armSilence();
  }

  private armSilence() {
    this.clearSilenceTimers();
    if (this.muted || this.phase !== 'listening') return;
    const since = this.silenceSince ?? this.hooks.now();
    const elapsed = Math.max(0, this.hooks.now() - since);
    const at = (ms: number, fn: () => void) => {
      if (ms <= 0) return;
      this.silenceTimers.push(this.hooks.setTimeout(fn, Math.max(0, ms - elapsed)));
    };
    if (!this.nudged && this.opts.nudgeAfterMs > 0 && elapsed < this.opts.nudgeAfterMs) {
      at(this.opts.nudgeAfterMs, () => {
        if (this.phase !== 'listening' || this.muted || !this.t) return;
        this.nudged = true;
        this.t.say(NUDGE, 'nudge');
      });
    }
    if (!this.askedStillThere && this.opts.stillThereAfterMs > 0 && elapsed < this.opts.stillThereAfterMs) {
      at(this.opts.stillThereAfterMs, () => {
        if (this.phase !== 'listening' || this.muted || !this.t) return;
        this.askedStillThere = true;
        this.t.say(STILL_THERE, 'nudge');
      });
    }
    if (this.opts.idleAfterMs > 0) {
      const fire = () => { if (this.phase === 'listening' && !this.muted) this.hooks.onIdle(); };
      if (elapsed >= this.opts.idleAfterMs) fire();
      else at(this.opts.idleAfterMs, fire);
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
    this.silenceTimers.forEach((t) => this.hooks.clearTimeout(t));
    this.silenceTimers = [];
  }

  private clearAnswerCap() {
    this.answerTimers.forEach((t) => this.hooks.clearTimeout(t));
    this.answerTimers = [];
  }

  private clearTimers() {
    this.clearGrace();
    this.clearTranscriptWait();
    this.clearSilenceTimers();
    this.clearAnswerCap();
  }
}
