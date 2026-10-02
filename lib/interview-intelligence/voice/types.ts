/**
 * Voice engine for the Interview Intelligence call.
 *
 * A transport moves audio (mic in, interviewer voice out) and turns speech into text. It never
 * decides anything: II's orchestrator decides every interviewer line, the Conductor decides
 * when a candidate turn is finished and when to speak. Two transports implement this:
 *   - RealtimeTransport: OpenAI Realtime over WebRTC (live call, barge-in, streaming transcripts)
 *   - StandardTransport: VAD + record -> /voice/transcribe, /voice/speak sentence by sentence
 */

export type SpeakKind = 'line' | 'ack' | 'nudge';

export interface TransportEvents {
  /** The candidate started talking (far-end or local VAD). */
  onSpeechStart: () => void;
  /** The candidate stopped talking; a final transcript for this stretch should follow. */
  onSpeechStop: () => void;
  /** Words as they are recognised (realtime only). */
  onPartial: (text: string) => void;
  /** A finished stretch of candidate speech, transcribed. Empty string = nothing usable. */
  onFinal: (text: string, meta: { durationMs?: number }) => void;
  /** An interviewer item started playing (true, with its kind and text), or everything queued
   *  has finished playing (false). */
  onSpeaking: (speaking: boolean, kind: SpeakKind | null, text?: string) => void;
  /** Usage of one spoken response (realtime), for metering. */
  onUsage?: (usage: unknown, kind: SpeakKind) => void;
  /** The transport can no longer carry the call (connection lost, mic gone...). */
  onFatal: (message: string, code: 'connection' | 'mic' | 'unavailable') => void;
  /** Non-fatal problem worth a quiet notice. */
  onWarning?: (message: string) => void;
}

export interface VoiceTransport {
  readonly kind: 'realtime' | 'standard';
  /** Connect. Resolves when audio can flow both ways. */
  start(): Promise<void>;
  /** Speak a line. Lines are queued and played strictly in order. */
  say(text: string, kind?: SpeakKind): void;
  /** Stop the interviewer immediately and drop anything queued. */
  interrupt(): void;
  /** Open/close the microphone for turns (closed while the interviewer is thinking). */
  setListening(on: boolean): void;
  /** Hard mute chosen by the candidate (overrides listening). */
  setMuted(muted: boolean): void;
  /** Current audio levels 0..1, read every animation frame by the orb. */
  levels(): { mic: number; out: number };
  /** True while the candidate is mid-utterance according to VAD. */
  readonly userSpeaking: boolean;
  /** True while interviewer audio is playing or still on its way. */
  readonly busy: boolean;
  stop(): void;
}
