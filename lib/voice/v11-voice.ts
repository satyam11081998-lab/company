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

/** OpenAI Realtime: per-response instructions that carry the V11 line. */
export function openaiSayInstructions(line: string): string {
  return (
    'You are only the voice of the interviewer. Say the following line exactly as written, ' +
    'word for word, and nothing else - no greeting, no acknowledgement, no extra question.\n\n' +
    `SAY: ${line}`
  );
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

export type GateAction =
  | { type: 'play'; data: string }              // base64 PCM16 @24kHz to enqueue
  | { type: 'stopPlayback' }
  | { type: 'candidateDraft'; text: string }    // live transcript of the candidate
  | { type: 'interviewerDraft'; text: string }  // live transcript of the V11 line
  | { type: 'candidateTurn'; text: string }     // FINAL candidate turn -> V11
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
 * Ending a candidate turn: Gemini closing its own (discarded) turn marks the end
 * of the candidate's speech; the component then waits a short settle window so
 * late input-transcription chunks land in the SAME turn, and calls
 * flushCandidate(). If Gemini never closes a turn, a longer idle window does it.
 */
export class GeminiTurnGate {
  private userDraft = '';
  private asstDraft = '';
  private sayLine: string | null = null;     // outstanding SAY, if any
  private sayAudio = false;                  // has the outstanding SAY started playing
  private pendingLine: string | null = null; // V11 line waiting for Gemini to finish its own turn
  private unpromptedActive = false;          // Gemini is producing an answer of its own
  private turnEnded = false;                 // Gemini closed the turn after the candidate spoke

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

  /**
   * Ask to speak a V11 line. Returns the line when it can be sent now. While
   * Gemini is still producing an answer of its own, the line is held and
   * released (sendSay) when that answer ends -- sending it mid-answer would get
   * the two mixed up.
   */
  requestSay(line: string): string | null {
    if (this.sayLine === null && !this.unpromptedActive) return line;
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
        this.releasePending(out);
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
        this.unpromptedActive = true;                  // discarded: not V11's line
      }
    }

    if (sc.outputTranscription?.text) {
      if (this.sayLine !== null) {
        this.asstDraft += sc.outputTranscription.text;
        out.push({ type: 'interviewerDraft', text: this.asstDraft });
      } else {
        this.unpromptedActive = true;                  // discarded
      }
    }

    if (sc.inputTranscription?.text) {
      this.userDraft += sc.inputTranscription.text;
      out.push({ type: 'candidateDraft', text: this.userDraft });
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
        this.turnEnded = true;
        this.releasePending(out);
      }
    }
    return out;
  }

  /**
   * Finalise the candidate's words as ONE turn (after the settle / idle window).
   * Returns the turn, or null if there is nothing to finalise or a line is
   * outstanding.
   */
  flushCandidate(): GateAction | null {
    if (this.sayLine !== null || this.unpromptedActive) return null;
    const u = this.userDraft.trim();
    this.userDraft = '';
    this.turnEnded = false;
    return u ? { type: 'candidateTurn', text: u } : null;
  }
}
