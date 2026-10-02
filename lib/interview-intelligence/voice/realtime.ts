/**
 * Live call over OpenAI Realtime (WebRTC).
 *
 * The browser holds a peer connection straight to OpenAI: the mic streams continuously, the
 * far end detects when the candidate finishes a thought (semantic VAD), transcribes it, and
 * plays the interviewer's voice with no per-sentence round trips. II mints the short-lived
 * secret and the session instructions; auto-replies are OFF, so the model only ever says the
 * line this transport sends it (II's orchestrator decides every line).
 */

import { meterForStream, type LevelMeter } from './audio';
import type { SpeakKind, TransportEvents, VoiceTransport } from './types';

export interface LiveMint {
  client_secret: string;
  model: string;
  voice: string;
  say_prefix: string;
  max_session_s: number;
}

const REALTIME_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';
const CONNECT_TIMEOUT_MS = 15_000;
/** If the far end never reports the end of playback, treat this much output silence as the end. */
const QUIET_MS = 650;

type Item = { text: string; kind: SpeakKind };

export class RealtimeTransport implements VoiceTransport {
  readonly kind = 'realtime' as const;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private micMeter: { meter: LevelMeter; dispose: () => void } | null = null;
  private outMeter: { meter: LevelMeter; dispose: () => void } | null = null;
  private prefix = '';
  private queue: Item[] = [];
  private current: Item | null = null;
  private responseActive = false;
  private announced = false;       // onSpeaking(true) sent for the current run of items
  private sawBufferEvents = false; // far end reports output_audio_buffer.* (GA WebRTC)
  private playing = false;
  private quietTimer: ReturnType<typeof setInterval> | null = null;
  private listening = true;
  private muted = false;
  private speechStartedAt = 0;
  private partials = new Map<string, string>();
  private closed = false;
  private _userSpeaking = false;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private opts: { ctx: AudioContext; stream: MediaStream; mint: () => Promise<LiveMint>; callsUrl?: string },
    private ev: TransportEvents,
  ) {}

  get userSpeaking() {
    return this._userSpeaking;
  }

  get busy() {
    return this.responseActive || this.queue.length > 0 || this.announced;
  }

  async start(): Promise<void> {
    const minted = await this.opts.mint();
    this.prefix = minted.say_prefix || 'Speak the interviewer line below exactly as written, word for word, and nothing else.';
    const pc = new RTCPeerConnection();
    this.pc = pc;
    this.opts.stream.getAudioTracks().forEach((t) => {
      pc.addTrack(t, this.opts.stream);
      // headphones unplugged, another app grabbed the mic, permission revoked
      t.addEventListener?.('ended', () => { if (!this.closed) this.ev.onFatal('Your microphone was disconnected.', 'mic'); });
    });
    this.micMeter = meterForStream(this.opts.ctx, this.opts.stream, 6);

    // The interviewer's voice. Must be in the document (Safari is unreliable otherwise).
    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.setAttribute('playsinline', '');
    audioEl.style.display = 'none';
    document.body.appendChild(audioEl);
    this.audioEl = audioEl;
    pc.ontrack = (e) => {
      const remote = e.streams[0];
      audioEl.srcObject = remote;
      void audioEl.play().catch(() => this.ev.onWarning?.('Tap the screen once to allow the interviewer’s voice.'));
      this.outMeter?.dispose();
      try { this.outMeter = meterForStream(this.opts.ctx, remote, 7); } catch { /* level is cosmetic */ }
    };

    pc.addEventListener('connectionstatechange', () => {
      if (this.closed) return;
      const s = pc.connectionState;
      if (s === 'failed') this.ev.onFatal('The call connection was lost.', 'connection');
      if (s === 'disconnected') {
        // brief network blips recover by themselves; only a lasting drop is fatal
        if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
        this.disconnectTimer = setTimeout(() => {
          if (!this.closed && pc.connectionState === 'disconnected') this.ev.onFatal('The call connection was lost.', 'connection');
        }, 5000);
      }
    });

    const dc = pc.createDataChannel('oai-events');
    this.dc = dc;
    const opened = new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('The live call took too long to connect.')), CONNECT_TIMEOUT_MS);
      dc.addEventListener('open', () => { clearTimeout(t); resolve(); });
    });
    dc.addEventListener('message', (e) => this.onEvent(e.data));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    const res = await fetch(`${this.opts.callsUrl || REALTIME_CALLS_URL}?model=${encodeURIComponent(minted.model)}`, {
      method: 'POST',
      body: offer.sdp,
      headers: { Authorization: `Bearer ${minted.client_secret}`, 'Content-Type': 'application/sdp' },
    });
    if (!res.ok) {
      this.stop();
      throw new Error(`The live call could not connect (${res.status}).`);
    }
    await pc.setRemoteDescription({ type: 'answer', sdp: await res.text() });
    await opened;
    this.applyTrack();
    this.pump();
  }

  say(text: string, kind: SpeakKind = 'line') {
    const clean = (text || '').trim();
    if (!clean || this.closed) return;
    this.queue.push({ text: clean, kind });
    this.pump();
  }

  interrupt() {
    this.queue = [];
    if (this.responseActive) this.send({ type: 'response.cancel' });
    this.send({ type: 'output_audio_buffer.clear' });
    this.responseActive = false;
    this.current = null;
    this.playing = false;
    this.drained();
  }

  setListening(on: boolean) {
    this.listening = on;
    this.applyTrack();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyTrack();
  }

  levels() {
    const mic = this.micMeter && this.listening && !this.muted ? this.micMeter.meter.read() : 0;
    const out = this.outMeter ? this.outMeter.meter.read() : 0;
    return { mic, out };
  }

  stop() {
    if (this.closed) return;
    this.closed = true;
    if (this.quietTimer) clearInterval(this.quietTimer);
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
    try { this.dc?.close(); } catch { /* closed */ }
    try { this.pc?.close(); } catch { /* closed */ }
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.srcObject = null;
      this.audioEl.remove();
    }
    this.micMeter?.dispose();
    this.outMeter?.dispose();
    this.pc = null;
    this.dc = null;
  }

  // ------------------------------------------------------------------ internals
  private applyTrack() {
    // While II is thinking the mic is closed: nothing the candidate says then can be lost
    // into a turn that has already been sent. The far end hears silence instead.
    const on = this.listening && !this.muted;
    this.opts.stream.getAudioTracks().forEach((t) => { t.enabled = on; });
  }

  private send(evt: unknown) {
    if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(evt));
  }

  private pump() {
    if (this.responseActive || !this.queue.length || this.dc?.readyState !== 'open') return;
    if (this.quietTimer) { clearInterval(this.quietTimer); this.quietTimer = null; }
    const item = this.queue.shift()!;
    this.current = item;
    this.responseActive = true;
    const instructions = item.kind === 'ack'
      ? `${this.prefix} Say it briefly and softly, like a listener acknowledging.\n\n${item.text}`
      : `${this.prefix}\n\n${item.text}`;
    // `input: []` = the line is spoken from these instructions alone, not from the whole call so
    // far. The model never sees (or answers) the candidate's audio, and each line costs the
    // same at minute 40 as at minute 1 instead of re-billing every earlier answer.
    this.send({ type: 'response.create', response: { instructions, input: [] } });
  }

  private announce(item: Item) {
    this.announced = true;
    this.ev.onSpeaking(true, item.kind, item.text);
  }

  private drained() {
    if (this.quietTimer) { clearInterval(this.quietTimer); this.quietTimer = null; }
    if (!this.announced) return;
    this.announced = false;
    this.ev.onSpeaking(false, null);
  }

  /** Response generated; wait for its audio to finish playing before reporting the end. */
  private waitForPlaybackEnd() {
    if (this.queue.length) { this.pump(); return; }
    if (this.sawBufferEvents) {
      if (!this.playing) this.drained();
      return; // output_audio_buffer.stopped will call drained()
    }
    let quietSince = 0;
    const started = Date.now();
    if (this.quietTimer) clearInterval(this.quietTimer);
    this.quietTimer = setInterval(() => {
      const lvl = this.outMeter ? this.outMeter.meter.read() : 0;
      const now = Date.now();
      if (lvl > 0.02) { quietSince = 0; return; }
      if (!quietSince) quietSince = now;
      if (now - quietSince >= QUIET_MS || now - started > 60_000) this.drained();
    }, 80);
  }

  private onEvent(raw: string) {
    let evt: any;
    try { evt = JSON.parse(raw); } catch { return; }
    switch (evt.type) {
      case 'response.created':
        if (this.current) this.announce(this.current);
        break;
      case 'response.done': {
        const kind = this.current?.kind ?? 'line';
        this.responseActive = false;
        this.current = null;
        if (evt.response?.usage) this.ev.onUsage?.(evt.response.usage, kind);
        this.waitForPlaybackEnd();
        break;
      }
      case 'output_audio_buffer.started':
        this.sawBufferEvents = true;
        this.playing = true;
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        this.sawBufferEvents = true;
        this.playing = false;
        if (!this.responseActive && !this.queue.length) this.drained();
        else this.pump();
        break;
      case 'input_audio_buffer.speech_started':
        this._userSpeaking = true;
        this.speechStartedAt = Date.now();
        if (this.listening && !this.muted) this.ev.onSpeechStart();
        break;
      case 'input_audio_buffer.speech_stopped':
        this._userSpeaking = false;
        if (this.listening && !this.muted) this.ev.onSpeechStop();
        break;
      case 'conversation.item.input_audio_transcription.delta': {
        const id = String(evt.item_id || '');
        const text = (this.partials.get(id) || '') + (evt.delta || '');
        this.partials.set(id, text);
        this.ev.onPartial(text);
        break;
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const id = String(evt.item_id || '');
        this.partials.delete(id);
        const durationMs = this.speechStartedAt ? Date.now() - this.speechStartedAt : undefined;
        this.ev.onFinal(String(evt.transcript || '').trim(), { durationMs });
        break;
      }
      case 'conversation.item.input_audio_transcription.failed':
        this.partials.delete(String(evt.item_id || ''));
        this.ev.onFinal('', { durationMs: this.speechStartedAt ? Date.now() - this.speechStartedAt : undefined });
        break;
      case 'error': {
        const code = evt.error?.code || '';
        if (code === 'response_cancel_not_active') break;
        if (code === 'conversation_already_has_active_response') {
          // a line raced another: put it back and send it when the current one ends
          if (this.current) this.queue.unshift(this.current);
          this.current = null;
          break;
        }
        this.ev.onWarning?.(evt.error?.message || 'Voice hiccup');
        if (this.responseActive && /response/i.test(evt.error?.message || '')) {
          this.responseActive = false;
          this.waitForPlaybackEnd();
        }
        break;
      }
      default:
        break;
    }
  }
}
