/**
 * Realtime voice turn control (transport-agnostic, no browser APIs -> unit-testable).
 *
 * The interviewer brain (backend) decides every turn. This controller only makes
 * sure that decisions are applied to the RIGHT moment of a live conversation:
 *
 *   - one completed candidate item (item_id) -> exactly one decision request
 *     (duplicate / late / replayed transcription events are ignored);
 *   - a decision that arrives after the candidate has started speaking again is
 *     HELD, not spoken over them; it is released only if no newer turn follows
 *     (e.g. the "speech" was a cough), and dropped if one does;
 *   - a decision for an older turn than the latest is dropped (never replayed);
 *   - candidate speech while the interviewer is talking -> barge-in (cancel + clear);
 *   - the interviewer's own words picked up by the mic never become a turn.
 */

export type TurnAction =
  | { type: 'decide'; turnId: string; text: string }
  | { type: 'speak'; turnId: string; line: string }
  | { type: 'hold'; turnId: string }
  | { type: 'drop'; turnId: string; reason: 'superseded' | 'noise' | 'echo' | 'duplicate' | 'silence' | 'stale' }
  | { type: 'bargeIn' };

export interface TurnFilters {
  isNoise: (text: string) => boolean;
  isEcho: (text: string, last: { text: string; at: number } | null, now: number) => boolean;
}

/** How long after the candidate stops (with no new transcript) a held line may still be said. */
export const HOLD_RELEASE_MS = 1200;
/** A held line older than this is stale and is dropped rather than said. */
export const HOLD_MAX_AGE_MS = 8000;

export class RealtimeTurnController {
  private seen = new Set<string>();
  private seenOrder: string[] = [];
  private candidateSpeaking = false;
  private interviewerSpeaking = false;
  private latestTurnId: string | null = null;
  private pending = new Set<string>();            // turns sent for a decision, not answered yet
  private held: { turnId: string; line: string; at: number } | null = null;
  private lastSpeechStopAt = 0;
  lastLine: { text: string; at: number } | null = null;

  constructor(private filters: TurnFilters, private now: () => number = () => Date.now()) {}

  get speakingInterviewer(): boolean {
    return this.interviewerSpeaking;
  }

  get candidateIsSpeaking(): boolean {
    return this.candidateSpeaking;
  }

  get heldTurnId(): string | null {
    return this.held?.turnId ?? null;
  }

  /** input_audio_buffer.speech_started */
  onSpeechStarted(): TurnAction[] {
    this.candidateSpeaking = true;
    return this.interviewerSpeaking ? [{ type: 'bargeIn' }] : [];
  }

  /** input_audio_buffer.speech_stopped */
  onSpeechStopped(): TurnAction[] {
    this.candidateSpeaking = false;
    this.lastSpeechStopAt = this.now();
    return [];
  }

  /** The interviewer's audio started / stopped (response.created|output_audio_buffer.started / response.done). */
  onInterviewerAudio(active: boolean): void {
    this.interviewerSpeaking = active;
  }

  /** conversation.item.input_audio_transcription.completed */
  onTranscriptCompleted(itemId: string, text: string): TurnAction[] {
    const id = itemId || `anon-${this.now()}-${this.seenOrder.length}`;
    if (this.seen.has(id)) return [{ type: 'drop', turnId: id, reason: 'duplicate' }];
    this.remember(id);
    const t = (text || '').trim();
    if (!t || this.filters.isNoise(t)) return [{ type: 'drop', turnId: id, reason: 'noise' }];
    if (this.filters.isEcho(t, this.lastLine, this.now())) return [{ type: 'drop', turnId: id, reason: 'echo' }];
    const out: TurnAction[] = [];
    if (this.held) {
      out.push({ type: 'drop', turnId: this.held.turnId, reason: 'superseded' });
      this.held = null;
    }
    this.latestTurnId = id;
    this.pending.add(id);
    out.push({ type: 'decide', turnId: id, text: t });
    return out;
  }

  /** The brain's answer for `turnId`. `line` null = NO_OUTPUT. */
  onDecision(turnId: string, line: string | null): TurnAction[] {
    this.pending.delete(turnId);
    if (!line) return [{ type: 'drop', turnId, reason: 'silence' }];
    if (turnId !== this.latestTurnId) return [{ type: 'drop', turnId, reason: 'superseded' }];
    if (this.candidateSpeaking) {
      this.held = { turnId, line, at: this.now() };
      return [{ type: 'hold', turnId }];
    }
    return [this.speak(turnId, line)];
  }

  /** Timer tick (e.g. every 250ms): release a held line once the candidate has been quiet a moment. */
  tick(): TurnAction[] {
    if (!this.held) return [];
    const now = this.now();
    if (now - this.held.at > HOLD_MAX_AGE_MS) {
      const id = this.held.turnId;
      this.held = null;
      return [{ type: 'drop', turnId: id, reason: 'stale' }];
    }
    if (this.candidateSpeaking || now - this.lastSpeechStopAt < HOLD_RELEASE_MS) return [];
    if (this.held.turnId !== this.latestTurnId) {
      const id = this.held.turnId;
      this.held = null;
      return [{ type: 'drop', turnId: id, reason: 'superseded' }];
    }
    const { turnId, line } = this.held;
    this.held = null;
    return [this.speak(turnId, line)];
  }

  private speak(turnId: string, line: string): TurnAction {
    this.lastLine = { text: line, at: this.now() };
    return { type: 'speak', turnId, line };
  }

  private remember(id: string) {
    this.seen.add(id);
    this.seenOrder.push(id);
    if (this.seenOrder.length > 500) {
      const old = this.seenOrder.shift()!;
      this.seen.delete(old);
    }
  }
}

/** Per-turn voice timing (epoch ms). T0 = candidate stopped speaking. */
export interface TurnTiming {
  turnId: string;
  t0?: number; // speech_stopped
  t1?: number; // final transcript
  t2?: number; // decision received
  t3?: number; // response.create sent
  t4?: number; // first audible interviewer audio
  lane?: string;
}

export function timingReport(t: TurnTiming): Record<string, number | string> {
  const r: Record<string, number | string> = { turn_id: t.turnId };
  if (t.lane) r.lane = t.lane;
  if (t.t0) {
    r.speech_end_timestamp = t.t0;
    if (t.t1) r.t1_ms = t.t1 - t.t0;
    if (t.t2) r.t2_ms = t.t2 - t.t0;
    if (t.t3) r.t3_ms = t.t3 - t.t0;
    if (t.t4) r.t4_ms = t.t4 - t.t0;
  }
  if (t.t1) r.transcript_final_timestamp = t.t1;
  if (t.t2) r.decision_timestamp = t.t2;
  if (t.t3) r.response_start_timestamp = t.t3;
  if (t.t4) r.first_audio_timestamp = t.t4;
  return r;
}
