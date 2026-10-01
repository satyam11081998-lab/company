/**
 * Gemini Live, LIVE mode: the speech model is the interviewer and talks to the
 * candidate directly - speech to speech, the way ChatGPT voice works. Its own
 * answers are played as they stream; nothing is transcribed-then-decided-then-
 * read-out. (The old V11 "renderer" mode, where every turn went to the backend
 * and Gemini read an approved line, lives in GeminiTurnGate in v11-voice.ts.)
 *
 * This class turns Gemini Live `serverContent` messages into UI/persistence
 * actions. No browser dependencies, so it is unit-testable.
 *
 * Turn bookkeeping: transcripts stream for both sides. The candidate's words
 * accumulate until the interviewer's reply to them finishes (turnComplete) or is
 * cut off (interrupted); then the candidate turn and the interviewer turn are
 * emitted in that order, so attempt_messages keeps speaking order even when the
 * candidate's transcript lands a little after the model has started answering.
 */

export type LiveAction =
  | { type: 'play'; data: string }               // base64 PCM16 @24kHz
  | { type: 'stopPlayback' }
  | { type: 'candidateDraft'; text: string }
  | { type: 'interviewerDraft'; text: string }
  | { type: 'candidateTurn'; text: string }      // final -> save + show
  | { type: 'interviewerTurn'; text: string }    // final -> save + show
  | { type: 'readyForSteer' };                   // the cut turn is over: send the steer now

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Candidate words that land this soon after the interviewer starts answering
 *  still belong to the turn being answered (transcription runs a little behind). */
export const LATE_WORDS_MS = 900;

export class GeminiLiveTurns {
  private user = '';              // the candidate's open (not yet answered) words
  private pendingUser = '';       // the candidate turn the interviewer is answering
  private asst = '';
  private modelStartedAt: number | null = null;
  private dropping = false;       // guardrail cut: drop the rest of this model turn
  private steerPending = false;   // send the steer once the cut turn is over

  handle(sc: any, now: number = Date.now()): LiveAction[] {
    const out: LiveAction[] = [];
    if (!sc) return out;

    if (sc.interrupted) {
      // The candidate talked over the interviewer: stop the voice, keep what was said.
      out.push({ type: 'stopPlayback' });
      this.closeModelTurn(out);
    }

    if (sc.inputTranscription?.text) {
      const t = sc.inputTranscription.text;
      if (this.modelStartedAt !== null && now - this.modelStartedAt < LATE_WORDS_MS) {
        this.pendingUser += t;                       // late words of the answered turn
        out.push({ type: 'candidateDraft', text: tidy(this.pendingUser) });
      } else {
        this.user += t;
        out.push({ type: 'candidateDraft', text: tidy(this.user) });
      }
    }

    const audio = ((sc.modelTurn?.parts || []) as any[])
      .map((p) => p?.inlineData)
      .filter((d) => d?.data && String(d.mimeType || '').includes('audio'));
    if (audio.length || sc.outputTranscription?.text) this.openModelTurn(now, out);
    if (!this.dropping) for (const d of audio) out.push({ type: 'play', data: d.data });

    if (sc.outputTranscription?.text && !this.dropping) {
      this.asst += sc.outputTranscription.text;
      out.push({ type: 'interviewerDraft', text: tidy(this.asst) });
    }

    if (sc.turnComplete) this.closeModelTurn(out);
    return out;
  }

  /**
   * Live guardrail cut: stop the voice now and drop the rest of this turn. The
   * steer is sent only once that turn is over (readyForSteer), so the steered
   * reply starts a fresh turn and is never dropped with the old one.
   */
  cut(): LiveAction[] {
    const out: LiveAction[] = [{ type: 'stopPlayback' }];
    this.emitAnswered(out);
    this.dropping = true;
    this.steerPending = true;
    return out;
  }

  /** Fallback when the cut turn never reports its end: stop dropping, steer now. */
  releaseCut(): LiveAction[] {
    if (!this.steerPending) return [];
    this.asst = '';
    this.modelStartedAt = null;
    this.dropping = false;
    this.steerPending = false;
    return [{ type: 'readyForSteer' }];
  }

  /** Session closing: emit whatever is still open, in speaking order. */
  flush(): LiveAction[] {
    const out: LiveAction[] = [];
    this.closeModelTurn(out);
    const u = tidy(this.user);
    if (u) out.push({ type: 'candidateTurn', text: u });
    this.user = '';
    return out;
  }

  /** The candidate's words in the turn being answered or still open. */
  get candidateSoFar(): string {
    return tidy(`${this.pendingUser} ${this.user}`);
  }

  private openModelTurn(now: number, out: LiveAction[]) {
    if (this.modelStartedAt !== null) return;
    this.modelStartedAt = now;
    this.pendingUser = this.user;   // stays on screen as a draft until the turn is saved
    this.user = '';
    void out;
  }

  private emitAnswered(out: LiveAction[]) {
    const u = tidy(this.pendingUser);
    if (u) out.push({ type: 'candidateTurn', text: u });
    const said = tidy(this.asst);
    if (said) out.push({ type: 'interviewerTurn', text: said });
    this.pendingUser = '';
    this.asst = '';
  }

  private closeModelTurn(out: LiveAction[]) {
    if (this.modelStartedAt === null && !this.asst.trim() && !this.steerPending) return;
    this.emitAnswered(out);
    this.modelStartedAt = null;
    this.dropping = false;
    if (this.steerPending) {
      this.steerPending = false;
      out.push({ type: 'readyForSteer' });
    }
  }
}

/** The text turn that makes the interviewer open the call (not saved, not shown). */
export const GEMINI_OPEN_TURN = {
  realtimeInput: { text: 'The candidate has just joined the call. Open the session now, as your instructions say.' },
};

/** The steer after a guardrail cut. */
export function geminiSteerTurn(note: string) {
  return { realtimeInput: { text: note } };
}
