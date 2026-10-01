/**
 * Realtime voice <-> MECE Interviewer V11.
 *
 * V11 (backend) is the only interviewer brain. On the realtime paths the speech
 * model is just the interviewer's VOICE: every final candidate transcript goes to
 * POST /attempts/{id}/voice-decision, V11 decides, and the speech model says
 * exactly the line V11 approved -- or nothing, for V11 SILENCE.
 *
 * This file is transport-agnostic and has no browser dependencies, so the turn
 * logic can be tested without a microphone:
 *   - voiceLine()        -> the line to speak for a decision (null = say nothing)
 *   - isEchoOfLine()     -> drops the interviewer's own line picked up by the mic
 *   - GeminiTurnGate     -> Gemini Live has no "don't auto-respond" switch, so
 *                           this gate plays ONLY the reply to our "SAY:" turn and
 *                           discards anything the model says on its own.
 *   - CandidateTurnLedger / SaveQueue -> speak first, save after: transcript rows
 *                           are written in the background, in order, and never
 *                           hold up the interviewer's reply.
 */

import type { VoiceDecision } from '@/lib/interview-api';

/** The line the voice must speak for this decision, or null to stay silent. */
export function voiceLine(decision: VoiceDecision | null | undefined): string | null {
  if (!decision || decision.lane === 'SILENCE') return null;
  const line = (decision.say || '').trim();
  return line || null;
}

/**
 * Gemini Live: the message that asks the voice to speak a V11 line.
 *
 * Sent as realtimeInput.text, NOT clientContent: text during a live audio
 * conversation belongs on the realtime stream (Google's Live API guidance), and
 * a clientContent turn mid-stream can be taken as context without being
 * answered -- which left the interviewer silent.
 */
export function geminiSayTurn(line: string) {
  return { realtimeInput: { text: `SAY: ${line}` } };
}

/** OpenAI Realtime: per-response instructions that carry the V11 line.
 *  No "SAY:" label here: the model read it out and it ended up in the transcript. */
export function openaiSayInstructions(line: string): string {
  return (
    'You are only the voice of the interviewer. Speak the words below exactly as written, ' +
    'word for word, and nothing else - no label, no greeting, no acknowledgement, no extra question.\n\n' +
    line
  );
}

/** A leading "SAY:" is protocol, never interviewer speech: never show or save it. */
export function stripSayLabel(text: string): string {
  let t = text || '';
  const label = /^\s*(?:say|line)\s*:\s*/i;
  while (label.test(t)) t = t.replace(label, '');
  return t === (text || '') ? t : t.trim();
}

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** How long after a line finished that an echo of it is still plausible. */
export const ECHO_WINDOW_MS = 8000;

/**
 * True when `heard` is the interviewer's own recent line coming back through the
 * mic (speaker -> mic leak that echo cancellation missed). Without this, the
 * voice's own words could be sent to V11 as a candidate turn and the session
 * would talk to itself. Deliberately narrow: only a recent line, and only when
 * what was heard is that line (or a run of at least two of its words).
 */
export function isEchoOfLine(
  heard: string,
  last: { text: string; at: number } | null,
  now: number,
): boolean {
  if (!last || !last.text) return false;
  if (now - last.at > ECHO_WINDOW_MS) return false;
  const h = norm(heard);
  const l = norm(last.text);
  if (!h || !l) return false;
  if (h === l) return true;
  return h.split(' ').length >= 2 && l.includes(h);
}

/** Join transcript pieces without gluing two words together. */
function joinWords(a: string, b: string): string {
  if (!a) return b;
  if (!b) return a;
  return /\s$/.test(a) || /^\s/.test(b) ? a + b : `${a} ${b}`;
}

export type GateAction =
  | { type: 'play'; data: string }              // base64 PCM16 @24kHz to enqueue
  | { type: 'stopPlayback' }
  | { type: 'candidateDraft'; text: string }    // live transcript of the candidate
  | { type: 'interviewerDraft'; text: string }  // live transcript of the V11 line
  // FINAL candidate turn -> V11. sealed=false: an EARLY (speculative) turn, taken
  // while Gemini was still producing its own discarded answer. Its decision is
  // used only if candidateConfirmed follows; candidateRedo voids it.
  | { type: 'candidateTurn'; text: string; sealed: boolean }
  | { type: 'candidateConfirmed' }              // the early turn's words are final: use its decision
  | { type: 'candidateRedo' }                   // the early turn's words changed: drop its decision
  | { type: 'speechEnded' }                     // Gemini began its own answer: the candidate stopped
  | { type: 'interviewerTurn'; text: string }   // a V11 line was spoken -> persist
  | { type: 'sendSay'; line: string }           // a held V11 line may now be sent
  | { type: 'dropSay'; line: string };          // a held line was superseded

/**
 * Gemini Live turn gate.
 *
 * Gemini answers every candidate turn by itself and offers no switch to stop
 * that. Its own answer is never what the candidate hears: while no "SAY:" turn
 * is outstanding, model audio and transcript are discarded (not played, not
 * saved). Only the reply to a SAY we sent is played and reported.
 *
 * Ending a candidate turn is unchanged in substance: the turn is what the
 * candidate said up to Gemini closing its own (discarded) answer plus a settle
 * window for late transcript, or an idle window if Gemini never reacts. The
 * SPEED part: as soon as Gemini STARTS that answer (its voice-activity detection
 * has decided the candidate stopped), the words so far go to V11 as an early,
 * speculative turn, so V11 thinks while Gemini is still talking to itself.
 * When the turn would have ended anyway (settle()), the early decision is used
 * only if the words did not change (candidateConfirmed); if more words arrived,
 * or the candidate resumed speaking, it is voided (candidateRedo) and V11
 * decides the full turn -- exactly the turn it would have got without the early
 * look. So the early look can only save time, never change what V11 decides.
 */
/** Gemini's own answer is treated as over if its audio stops for this long
 * without a turnComplete (a lost event must never leave the gate waiting). */
export const OWN_ANSWER_STALL_MS = 4000;

export class GeminiTurnGate {
  private userDraft = '';
  private asstDraft = '';
  private sayLine: string | null = null;     // outstanding SAY, if any
  private sayAudio = false;                  // has the outstanding SAY started playing
  private pendingLine: string | null = null; // V11 line waiting until it may be said
  private unpromptedActive = false;          // Gemini is producing an answer of its own
  private turnEnded = false;                 // Gemini closed the turn after the candidate spoke
  private early: string | null = null;       // words of an unconfirmed early turn
  private tail = '';                         // words that arrived after the early turn was taken
  private resumeCheck = false;               // Gemini's answer was cut off after an early turn
  private lastOwnAudioAt = 0;                // when Gemini's own answer last produced audio

  /** Call right after sending geminiSayTurn(line). */
  markSaySent(line: string) {
    this.sayLine = line;
    this.sayAudio = false;
    this.asstDraft = '';
  }

  /** A SAY is outstanding (sent, not yet finished or interrupted). */
  get speakingLine(): boolean {
    return this.sayLine !== null;
  }

  /** Gemini has closed the turn that followed the candidate's speech. */
  get candidateTurnEnded(): boolean {
    return this.turnEnded;
  }

  /** Gemini has decided the candidate stopped speaking (it closed its turn, or
   * it is producing an answer of its own). */
  get candidateSpeechEnded(): boolean {
    return this.turnEnded || this.unpromptedActive;
  }

  /** Something cut Gemini's own answer off after an early turn: speech (a
   * transcript will follow) or just noise. settle() resolves it. */
  get resumeChecking(): boolean {
    return this.resumeCheck;
  }

  /** An early turn is waiting to be confirmed or voided. */
  get earlyTurnOpen(): boolean {
    return this.early !== null;
  }

  /** Something is waiting on Gemini or on a settle: the component keeps the
   * end-of-turn timer running while this is true, so the gate always resolves. */
  get waiting(): boolean {
    return this.early !== null || this.pendingLine !== null || this.unpromptedActive;
  }

  private startUnprompted(out: GateAction[]) {
    this.lastOwnAudioAt = Date.now();
    if (this.unpromptedActive) return;
    this.unpromptedActive = true;
    out.push({ type: 'speechEnded' });
  }

  private dropPending(out: GateAction[]) {
    if (this.pendingLine === null) return;
    out.push({ type: 'dropSay', line: this.pendingLine });
    this.pendingLine = null;
  }

  /**
   * Ask to speak a V11 line. Returns the line when it can be sent now. It is held
   * while Gemini is producing an answer of its own (sending it mid-answer would
   * get the two mixed up) and while an early turn is unconfirmed; released
   * (sendSay) when that ends.
   */
  requestSay(line: string): string | null {
    if (this.sayLine === null && !this.unpromptedActive && this.early === null) return line;
    this.pendingLine = line;
    return null;
  }

  /**
   * Release a SAY that produced no audio at all (the voice never answered), so
   * the gate can never be stuck waiting. Returns true if one was released.
   */
  cancelSayIfSilent(): boolean {
    if (this.sayLine === null || this.sayAudio) return false;
    this.sayLine = null;
    this.asstDraft = '';
    return true;
  }

  private releasePending(out: GateAction[]) {
    if (this.pendingLine === null) return;
    const line = this.pendingLine;
    this.pendingLine = null;
    // If the candidate has already said more, V11 decides on that instead.
    if (this.sayLine === null && this.userDraft.trim() === '') out.push({ type: 'sendSay', line });
    else out.push({ type: 'dropSay', line });
  }

  /** The early turn's words changed: void it; `merged` is the whole turn so far. */
  private redo(out: GateAction[]): string {
    const merged = joinWords(this.early ?? '', this.tail);
    this.early = null;
    this.tail = '';
    this.resumeCheck = false;
    out.push({ type: 'candidateRedo' });
    this.dropPending(out);
    return merged;
  }

  handle(sc: any): GateAction[] {
    const out: GateAction[] = [];
    if (!sc) return out;

    if (sc.interrupted) {
      out.push({ type: 'stopPlayback' });
      if (this.sayLine !== null) {
        // The candidate cut our line off: keep what was actually said.
        const said = this.asstDraft.trim();
        if (said) out.push({ type: 'interviewerTurn', text: said });
        this.sayLine = null;
      }
      this.asstDraft = '';
      if (this.unpromptedActive) {
        this.unpromptedActive = false;
        // After an early turn, whether the candidate really resumed is only known
        // once their words (or none) arrive: hold everything until then.
        if (this.early !== null) this.resumeCheck = true;
        else this.releasePending(out);
      }
    }

    const parts: any[] = sc.modelTurn?.parts || [];
    for (const p of parts) {
      const inline = p?.inlineData;
      if (!inline?.data || !String(inline.mimeType || '').includes('audio')) continue;
      if (this.sayLine !== null) {
        this.sayAudio = true;
        out.push({ type: 'play', data: inline.data });
      } else {
        this.startUnprompted(out);                     // discarded: not V11's line
      }
    }

    if (sc.outputTranscription?.text) {
      if (this.sayLine !== null) {
        this.asstDraft += sc.outputTranscription.text;
        out.push({ type: 'interviewerDraft', text: this.asstDraft });
      }
      // Otherwise discarded. Only AUDIO marks Gemini's own answer: transcripts
      // carry no ordering guarantee, and a late chunk of a line the candidate
      // cut off must not look like a new answer that never ends.
    }

    if (sc.inputTranscription?.text) {
      const t = sc.inputTranscription.text;
      if (this.early !== null && this.resumeCheck) {
        // The candidate did resume: the early turn was not the whole turn.
        this.userDraft = joinWords(this.redo(out), t);
        out.push({ type: 'candidateDraft', text: this.userDraft });
      } else if (this.early !== null) {
        this.tail += t;                                // late words: decided at settle()
      } else {
        this.userDraft += t;
        out.push({ type: 'candidateDraft', text: this.userDraft });
      }
    }

    if (sc.turnComplete) {
      if (this.sayLine !== null) {
        const said = this.asstDraft.trim() || this.sayLine;
        out.push({ type: 'interviewerTurn', text: said });
        this.sayLine = null;
        this.asstDraft = '';
      } else {
        this.unpromptedActive = false;
        this.asstDraft = '';
        if (this.early !== null) {
          // Gemini's own answer is over; settle() decides after the settle window
          // (a turnComplete that only closes a cut-off answer changes nothing).
          if (!this.resumeCheck) this.turnEnded = true;
        } else {
          this.turnEnded = true;
          this.releasePending(out);
        }
      }
    }
    return out;
  }

  /**
   * The end-of-turn timer fired (settle / idle window). Either finalises the
   * candidate's words as a turn, or -- for an early turn -- confirms or voids it.
   * While a SAY is outstanding, or Gemini's own answer after an early turn is
   * still running, it does nothing (the timer is re-armed by those events).
   */
  settle(): GateAction[] {
    const out: GateAction[] = [];
    if (this.sayLine !== null) return out;
    if (this.unpromptedActive && Date.now() - this.lastOwnAudioAt >= OWN_ANSWER_STALL_MS) {
      // Gemini's own answer went quiet without closing: treat it as closed.
      this.unpromptedActive = false;
      this.asstDraft = '';
      if (this.early === null) {
        this.turnEnded = true;
        this.releasePending(out);
      }
    }
    if (this.early !== null) {
      if (this.unpromptedActive) return out;
      this.turnEnded = false;
      if (this.tail.trim() === '') {
        // Same words as the early turn: its decision stands.
        this.early = null;
        this.resumeCheck = false;
        out.push({ type: 'candidateConfirmed' });
        this.releasePending(out);
        return out;
      }
      const merged = this.redo(out).trim();
      if (merged) out.push({ type: 'candidateTurn', text: merged, sealed: true });
      return out;
    }
    const t = this.flushCandidate();
    if (t) out.push(t);
    return out;
  }

  /**
   * Finalise the words so far as ONE turn. Returns the turn, or null if there is
   * nothing to finalise, a line is outstanding, or an early turn is still open.
   * While Gemini's own answer is running the turn is EARLY (sealed=false).
   */
  flushCandidate(): GateAction | null {
    if (this.sayLine !== null || this.early !== null) return null;
    const u = this.userDraft.trim();
    this.userDraft = '';
    this.turnEnded = false;
    if (!u) return null;
    // A line still held for an EARLIER turn is superseded: V11 decides this one.
    this.pendingLine = null;
    const early = this.unpromptedActive;
    if (early) {
      this.early = u;
      this.tail = '';
      this.resumeCheck = false;
    }
    return { type: 'candidateTurn', text: u, sealed: !early };
  }
}

/**
 * Speak first, save after. Candidate turns are saved to the transcript in the
 * order they were spoken, each once V11 has decided on it (so V11 never sees the
 * turn twice: once as the new message and again in the saved history) and once
 * its words are final. An early (speculative) turn is saved only if confirmed,
 * and then its deferred learner-state fold is committed; a voided one is never
 * saved and its fold is discarded. Nothing here waits on the network: the
 * component drains ready turns into a SaveQueue.
 */
export type ReadyTurn = { text: string; commitTurnId: string | null };

let turnIdCounter = 0;
function newTurnId(): string {
  const c: any = (globalThis as any).crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  turnIdCounter += 1;
  return `t${Date.now().toString(36)}${turnIdCounter}${Math.random().toString(36).slice(2, 8)}`;
}

export class CandidateTurnLedger {
  private seq = 0;
  private recs: {
    seq: number; turnId: string; text: string; speculative: boolean;
    decided: boolean; sealed: boolean; skip: boolean;
  }[] = [];
  private voided = new Set<number>();

  /** A final (or, speculative=true, early) candidate turn. */
  open(text: string, speculative = false): { seq: number; turnId: string } {
    const seq = ++this.seq;
    const turnId = newTurnId();
    this.recs.push({ seq, turnId, text, speculative, decided: false, sealed: !speculative, skip: false });
    return { seq, turnId };
  }

  /** The most recent turn's sequence number (a newer turn supersedes a line). */
  get latest(): number {
    return this.seq;
  }

  /** False once a turn was voided (its line must never be said). */
  isLive(seq: number): boolean {
    return !this.voided.has(seq);
  }

  /** V11 answered (or failed) for this turn. skip=true: never save it. */
  decided(seq: number, skip = false) {
    const r = this.recs.find((x) => x.seq === seq);
    if (r) {
      r.decided = true;
      r.skip = r.skip || skip;
    }
  }

  private openSpeculative() {
    return this.recs.find((x) => x.speculative && !x.sealed && !x.skip) || null;
  }

  /** The early turn's words are final: it will be saved and its fold committed. */
  confirm() {
    const r = this.openSpeculative();
    if (r) r.sealed = true;
  }

  /** The early turn is void: never saved, never spoken. Returns its turnId so the
   * caller can discard its deferred fold. */
  void(): string | null {
    const r = this.openSpeculative();
    if (!r) return null;
    r.skip = true;
    r.sealed = true;
    r.decided = true;
    this.voided.add(r.seq);
    return r.turnId;
  }

  /** Turns ready to save, oldest first. A turn never jumps an earlier one. */
  drain(): ReadyTurn[] {
    const ready: ReadyTurn[] = [];
    while (this.recs.length && this.recs[0].decided && this.recs[0].sealed) {
      const r = this.recs.shift()!;
      if (!r.skip) ready.push({ text: r.text, commitTurnId: r.speculative ? r.turnId : null });
    }
    return ready;
  }
}

/**
 * Background saves, strictly one after another (row order == speaking order).
 * A failed save is the task's own business: the queue always moves on.
 */
export class SaveQueue {
  private tail: Promise<void> = Promise.resolve();
  private pending = 0;

  push(task: () => Promise<unknown>): void {
    this.pending++;
    this.tail = this.tail
      .then(task)
      .catch(() => { /* the task reports its own failure */ })
      .then(() => { this.pending--; });
  }

  get size(): number {
    return this.pending;
  }

  /** Resolves when every queued save has finished, or after maxWaitMs. */
  settled(maxWaitMs: number): Promise<void> {
    if (this.pending === 0) return Promise.resolve();
    return new Promise((resolve) => {
      const t = setTimeout(resolve, maxWaitMs);
      this.tail.then(() => { clearTimeout(t); resolve(); });
    });
  }
}
