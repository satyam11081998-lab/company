/**
 * Live call over Google's Gemini Live (WebSocket, ephemeral token minted by II).
 *
 * Same contract as the OpenAI live call: II decides every interviewer line; this transport
 * only moves audio and turns speech into text. Gemini Live has no "never answer by yourself"
 * switch, so:
 *   - a line is sent as "SAY: <line>" and ONLY the audio of that reply is played; anything
 *     Gemini says on its own (it may answer the candidate) is discarded, and the next line waits
 *     until that stray answer is over so the two never mix;
 *   - a guard compares what Gemini actually says with the line and cuts it off (and asks again,
 *     once) if it went off script;
 *   - the server-side "interrupt on speech" is off, so the interviewer's own voice leaking into
 *     the mic can never cut it off; the Conductor decides on barge-in from the words heard.
 *
 * Cost: Gemini Live bills audio by the second, silence included. Mic audio is only streamed
 * while the candidate is actually talking (a local voice detector with a short pre-roll so the
 * first syllable is never clipped), and never while the interviewer is thinking.
 */

import { LevelMeter } from './audio';
import { lineCoverage, wordCount } from './text';
import { FloorVad, type VadCallbacks } from './vad';
import type { SpeakKind, TransportEvents, VoiceTransport } from './types';

export interface GeminiMint {
  token: string;
  ws_url: string;
  model: string;
  voice: string;
  setup: Record<string, unknown>;
  tier: number;
  tiers: number;
  max_session_s: number;
}

export interface GeminiCapture { stop(): void }
export interface GeminiPlayer {
  play(pcm: Int16Array): void;
  stop(): void;
  readonly active: boolean;
  level(): number;
  dispose(): void;
}
export interface GeminiVad {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  readonly isSpeaking: boolean;
}
export interface GeminiClock {
  now(): number;
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(t: unknown): void;
}

export interface GeminiOptions {
  ctx: AudioContext;
  stream: MediaStream;
  /** Ask II for a token for session config `tier` (0 = most tuned). */
  mint: (tier: number) => Promise<GeminiMint>;
  /** Start from this session config (the one that worked last time, so a redial doesn't retry
   *  configs Google already refused). */
  startTier?: number;
  /** Metering: seconds of candidate audio streamed, seconds of interviewer audio generated. */
  usage?: (secondsIn: number, secondsOut: number) => void;
  // seams for tests
  WebSocketImpl?: new (url: string) => WebSocket;
  capture?: (onChunk: (pcm16k: Int16Array) => void) => GeminiCapture;
  player?: (onIdle: () => void) => GeminiPlayer;
  vad?: (cb: VadCallbacks) => GeminiVad;
  clock?: GeminiClock;
}

const OPEN = 1; // WebSocket.OPEN
export const CONNECT_TIMEOUT_MS = 15_000;
/** A line whose audio has not started by then is given up on (the caption still shows it). */
export const SAY_NO_AUDIO_MS = 8_000;
/** A reply that stopped producing audio this long ago without "turn complete" is over. */
export const TURN_STALL_MS = 4_000;
/** Audio kept from just before speech is detected, so the first syllable reaches Gemini. */
export const PREROLL_MS = 600;
/** After the candidate stops: wait until no new words for this long (transcripts lag audio). */
export const FINAL_SETTLE_MS = 600;
export const FINAL_MIN_MS = 800;
export const FINAL_MAX_MS = 3_500;
export const USAGE_EVERY_MS = 60_000;
const TICK_MS = 150;

type Item = { text: string; kind: SpeakKind; retries: number };
type Turn = {
  item: Item | null;       // null = Gemini talking on its own (discarded)
  audio: boolean;
  complete: boolean;
  drop: boolean;           // discard the rest of this reply
  sentAt: number;
  lastAudioAt: number;
  said: string;            // Gemini's own transcript of what it said
  guarded: boolean;
};

const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ PCM helpers (unit-tested)
export function floatTo16(f: ArrayLike<number>): Int16Array {
  const out = new Int16Array(f.length);
  for (let i = 0; i < f.length; i++) {
    const s = Math.max(-1, Math.min(1, f[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Streaming downsampler (averaging), e.g. 48 kHz mic -> 16 kHz for Gemini. */
export class Downsampler {
  private ratio: number;
  private pos = 0;
  private acc = 0;
  private n = 0;
  private last = 0;
  constructor(inRate: number, outRate = 16000) {
    this.ratio = inRate / outRate;
  }
  push(input: ArrayLike<number>): Int16Array {
    const out: number[] = [];
    for (let i = 0; i < input.length; i++) {
      this.acc += input[i];
      this.n++;
      this.pos += 1;
      while (this.pos >= this.ratio) {
        this.last = this.n ? this.acc / this.n : this.last;
        out.push(this.last);
        this.acc = 0;
        this.n = 0;
        this.pos -= this.ratio;
      }
    }
    return floatTo16(out);
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH) as unknown as number[]);
  }
  return btoa(bin);
}

export function pcm16ToBase64(pcm: Int16Array): string {
  return bytesToBase64(new Uint8Array(pcm.buffer, pcm.byteOffset, pcm.byteLength));
}

export function base64ToPcm16(b64: string): Int16Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length - (bin.length % 2));
  for (let i = 0; i < bytes.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

// ------------------------------------------------------------------ browser defaults
function scriptCapture(ctx: AudioContext, stream: MediaStream, onChunk: (pcm: Int16Array) => void): GeminiCapture {
  const src = ctx.createMediaStreamSource(stream);
  const proc = ctx.createScriptProcessor(2048, 1, 1);
  const sink = ctx.createGain();
  sink.gain.value = 0; // keeps the processor running without playing the mic back
  const rs = new Downsampler(ctx.sampleRate, 16000);
  proc.onaudioprocess = (e) => {
    const pcm = rs.push(e.inputBuffer.getChannelData(0));
    if (pcm.length) onChunk(pcm);
  };
  src.connect(proc);
  proc.connect(sink);
  sink.connect(ctx.destination);
  return {
    stop() {
      proc.onaudioprocess = null;
      try { src.disconnect(); proc.disconnect(); sink.disconnect(); } catch { /* gone */ }
    },
  };
}

function webAudioPlayer(ctx: AudioContext, onIdle: () => void): GeminiPlayer {
  const out = ctx.createGain();
  out.connect(ctx.destination);
  const meter = new LevelMeter(ctx, out, 6);
  const sources = new Set<AudioBufferSourceNode>();
  let head = 0;
  const player: GeminiPlayer = {
    play(pcm: Int16Array) {
      if (!pcm.length) return;
      if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
      const f32 = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 0x8000;
      const buf = ctx.createBuffer(1, f32.length, 24000);
      buf.getChannelData(0).set(f32);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(out);
      // a small cushion on the first chunk absorbs network jitter between chunks
      const at = sources.size ? Math.max(ctx.currentTime, head) : ctx.currentTime + 0.08;
      src.start(at);
      head = at + buf.duration;
      sources.add(src);
      src.onended = () => {
        sources.delete(src);
        if (!sources.size) onIdle();
      };
    },
    stop() {
      sources.forEach((s) => { s.onended = null; try { s.stop(); } catch { /* not started */ } });
      sources.clear();
      head = 0;
    },
    get active() {
      return sources.size > 0;
    },
    level: () => meter.read(),
    dispose() {
      player.stop();
      meter.disconnect();
      try { out.disconnect(); } catch { /* gone */ }
    },
  };
  return player;
}

const realClock: GeminiClock = {
  now: () => Date.now(),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (t) => clearInterval(t as ReturnType<typeof setInterval>),
};

// ------------------------------------------------------------------ transport
export class GeminiLiveTransport implements VoiceTransport {
  readonly kind = 'gemini' as const;
  private ws: WebSocket | null = null;
  private setupDone = false;
  private closed = false;
  private clock: GeminiClock;
  private timer: unknown = null;
  private inbox: Promise<void> = Promise.resolve();
  private player: GeminiPlayer | null = null;
  private capture: GeminiCapture | null = null;
  private vad: GeminiVad | null = null;
  private micLevel = 0;
  private listening = true;
  private muted = false;
  private streaming = false;
  private preroll: Int16Array[] = [];
  private prerollSamples = 0;
  private queue: Item[] = [];
  private turn: Turn | null = null;
  private announced = false;
  private vadSpeaking = false;
  private stretch = '';
  private stretchMs = 0;
  private stopAt: number | null = null; // candidate stopped; final transcript pending
  private lastInputAt: number | null = null;
  private hintAt = -Infinity;    // Gemini decided the candidate's turn ended
  private secondsIn = 0;
  private secondsOut = 0;
  private lastUsageAt = 0;
  tier = 0;

  constructor(private opts: GeminiOptions, private ev: TransportEvents) {
    this.clock = opts.clock ?? realClock;
  }

  get userSpeaking() {
    return this.vadSpeaking && this.listening && !this.muted;
  }

  get busy() {
    return this.announced || this.queue.length > 0 || (!!this.turn && !!this.turn.item && !this.turn.drop);
  }

  async start(): Promise<void> {
    const { ctx, stream } = this.opts;
    this.player = (this.opts.player ?? ((idle) => webAudioPlayer(ctx, idle)))(() => this.onPlaybackIdle());
    await this.connect();
    if (this.closed) return;
    const cb: VadCallbacks = {
      onLevel: (l) => { this.micLevel = l; },
      onSpeechStart: () => this.vadStart(),
      onSpeechEnd: ({ durationMs }) => this.vadEnd(durationMs),
      onSilent: () => { this.vadSpeaking = false; this.stopStreaming(); },
    };
    this.vad = this.opts.vad ? this.opts.vad(cb) : new FloorVad(ctx, stream, cb, { silenceMs: 1000, minUtteranceMs: 500 });
    this.vad.start();
    this.capture = (this.opts.capture ?? ((fn) => scriptCapture(ctx, stream, fn)))((pcm) => this.onMic(pcm));
    stream.getAudioTracks?.().forEach((t) => t.addEventListener?.('ended', () => {
      if (!this.closed) this.ev.onFatal('Your microphone was disconnected.', 'mic');
    }));
    this.lastUsageAt = this.clock.now();
    this.timer = this.clock.setInterval(() => this.tick(), TICK_MS);
    this.applyListening();
    this.pump();
  }

  say(text: string, kind: SpeakKind = 'line') {
    const clean = (text || '').trim();
    if (!clean || this.closed) return;
    // No spoken "Okay." while II thinks: Gemini may be answering the candidate on its own at
    // exactly that moment, and a stray answer must never be played as if it were the ack.
    if (kind === 'ack') return;
    this.queue.push({ text: clean, kind, retries: 0 });
    this.pump();
  }

  interrupt() {
    this.queue = [];
    if (this.turn) this.turn.drop = true; // Gemini can't be told to stop: discard the rest
    this.player?.stop();
    this.drained();
    if (this.turn?.complete) this.turn = null;
  }

  setListening(on: boolean) {
    this.listening = on;
    this.applyListening();
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.applyListening();
  }

  levels() {
    return { mic: this.listening && !this.muted ? this.micLevel : 0, out: this.player?.level() ?? 0 };
  }

  stop() {
    if (this.closed) return;
    this.closed = true;
    if (this.timer) this.clock.clearInterval(this.timer);
    this.reportUsage();
    this.capture?.stop();
    this.vad?.stop();
    this.player?.dispose();
    const ws = this.ws;
    this.ws = null;
    try { ws?.close(1000, 'done'); } catch { /* closed */ }
  }

  // ------------------------------------------------------------------ connection
  private async connect() {
    let tier = Math.max(0, this.opts.startTier ?? 0);
    let unreachable = 0;
    for (;;) {
      const minted = await this.opts.mint(tier);
      this.tier = typeof minted.tier === 'number' ? minted.tier : tier;
      const tiers = typeof minted.tiers === 'number' ? minted.tiers : 1;
      const outcome = await this.open(minted);
      if (outcome === 'ok' || this.closed) return;
      if (outcome === 'unreachable') {
        // the socket never opened: a network blip, not a config problem — try again shortly
        if (++unreachable > 2) throw new Error('The Gemini voice could not connect.');
        await new Promise((r) => setTimeout(r, 1000 * unreachable));
        if (this.closed) return;
        continue;
      }
      // Google refused this session config at setup: ask II for the next, simpler one.
      if (this.tier < tiers - 1) { tier = this.tier + 1; continue; }
      throw new Error('The Gemini voice could not connect.');
    }
  }

  private open(m: GeminiMint): Promise<'ok' | 'refused' | 'unreachable'> {
    return new Promise((resolve, reject) => {
      const WS = this.opts.WebSocketImpl ?? WebSocket;
      let ws: WebSocket;
      try {
        ws = new WS(m.ws_url);
      } catch {
        reject(new Error('The Gemini voice could not connect.'));
        return;
      }
      try { ws.binaryType = 'arraybuffer'; } catch { /* not settable */ }
      this.ws = ws;
      this.setupDone = false;
      let settled = false;
      const to = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.ws = null;
        try { ws.close(); } catch { /* closed */ }
        reject(new Error('The Gemini voice took too long to connect.'));
      }, CONNECT_TIMEOUT_MS);
      let opened = false;
      ws.onopen = () => {
        opened = true;
        ws.send(JSON.stringify({ setup: m.setup || { model: m.model } }));
      };
      ws.onmessage = (e: MessageEvent) => {
        this.inbox = this.inbox.then(() => this.onMessage(e.data, () => {
          if (settled) return;
          settled = true;
          clearTimeout(to);
          resolve('ok');
        })).catch(() => undefined);
      };
      ws.onerror = () => { /* a close event follows */ };
      ws.onclose = () => {
        if (this.ws !== ws) return;
        this.ws = null;
        if (!settled) {
          settled = true;
          clearTimeout(to);
          resolve(opened ? 'refused' : 'unreachable');
          return;
        }
        // Google ends a live connection about every 10 minutes; the network can drop too.
        this.streaming = false;
        if (!this.closed) this.ev.onFatal('The voice connection was refreshed.', 'connection');
      };
    });
  }

  private send(msg: unknown) {
    if (this.ws && this.ws.readyState === OPEN && this.setupDone) this.ws.send(JSON.stringify(msg));
  }

  private async onMessage(data: unknown, onSetup: () => void) {
    let text: string;
    if (typeof data === 'string') text = data;
    else if (typeof Blob !== 'undefined' && data instanceof Blob) text = await data.text();
    else if (data instanceof ArrayBuffer) text = new TextDecoder().decode(data);
    else return;
    let msg: any;
    try { msg = JSON.parse(text); } catch { return; }
    if (msg.setupComplete) {
      this.setupDone = true;
      onSetup();
      this.pump();
      return;
    }
    if (msg.serverContent) this.onServerContent(msg.serverContent);
  }

  // ------------------------------------------------------------------ speaking
  private pump() {
    if (this.turn || !this.queue.length || !this.setupDone || !this.ws || this.ws.readyState !== OPEN) return;
    const item = this.queue.shift()!;
    this.turn = { item, audio: false, complete: false, drop: false, sentAt: this.clock.now(), lastAudioAt: 0, said: '', guarded: false };
    this.send({ realtimeInput: { text: `SAY: ${item.text}` } });
    this.announced = true;
    this.ev.onSpeaking(true, item.kind, item.text);
  }

  private onServerContent(sc: any) {
    const now = this.clock.now();
    if (sc.inputTranscription?.text) this.heard(String(sc.inputTranscription.text), now);

    const audio = ((sc.modelTurn?.parts || []) as any[])
      .map((p) => p?.inlineData)
      .filter((d) => d?.data && String(d.mimeType || '').includes('audio'));
    if (audio.length) {
      if (!this.turn) {
        // Gemini answering the candidate on its own: never played. It also tells us Gemini
        // thinks the candidate has finished.
        this.turn = { item: null, audio: false, complete: false, drop: true, sentAt: now, lastAudioAt: now, said: '', guarded: true };
        this.hintAt = now;
      }
      const t = this.turn;
      t.audio = true;
      t.lastAudioAt = now;
      for (const d of audio) {
        const pcm = base64ToPcm16(String(d.data));
        this.secondsOut += pcm.length / 24000;
        if (!t.drop) this.player?.play(pcm);
      }
    }

    if (sc.outputTranscription?.text && this.turn?.item && !this.turn.drop) {
      this.turn.said += String(sc.outputTranscription.text);
      this.guard(this.turn);
    }

    if (sc.interrupted && this.turn) {
      this.turn.complete = true; // generation stopped; play what already arrived
      this.maybeFinishTurn();
    }
    if (sc.turnComplete) {
      if (this.turn) {
        this.turn.complete = true;
        this.maybeFinishTurn();
      } else {
        this.hintAt = now; // Gemini closed the candidate's turn without saying anything
      }
    }
  }

  /** Gemini said something other than the line (it answered by itself, or improvised). */
  private guard(t: Turn) {
    if (t.guarded || !t.item || wordCount(t.said) < 8) return;
    t.guarded = true;
    if (lineCoverage(t.said, t.item.text) >= 0.35) return;
    t.drop = true;
    this.player?.stop();
    if (t.item.retries < 1) {
      this.queue.unshift({ ...t.item, retries: t.item.retries + 1 });
    } else {
      this.ev.onWarning?.('The interviewer’s voice went off script — the question is on screen.');
    }
  }

  private maybeFinishTurn() {
    const t = this.turn;
    if (!t || !t.complete) return;
    if (!t.drop && this.player?.active) return; // finishes when playback does
    this.finishTurn();
  }

  private finishTurn() {
    this.turn = null;
    if (this.queue.length) {
      this.pump();
      return;
    }
    if (!this.player?.active) this.drained();
  }

  private onPlaybackIdle() {
    if (this.turn) {
      if (this.turn.complete) this.finishTurn();
      return;
    }
    if (!this.queue.length) this.drained();
  }

  private drained() {
    if (!this.announced) return;
    this.announced = false;
    this.ev.onSpeaking(false, null);
  }

  // ------------------------------------------------------------------ listening
  private applyListening() {
    const on = this.listening && !this.muted;
    if (on) {
      this.vad?.resume();
    } else {
      this.vad?.pause();
      this.vadSpeaking = false;
      this.stopStreaming();
      this.preroll = [];
      this.prerollSamples = 0;
    }
  }

  private onMic(pcm: Int16Array) {
    if (!this.setupDone || !this.listening || this.muted) return;
    if (this.streaming) {
      this.sendAudio(pcm);
      return;
    }
    this.preroll.push(pcm);
    this.prerollSamples += pcm.length;
    const keep = (PREROLL_MS / 1000) * 16000;
    while (this.prerollSamples > keep && this.preroll.length > 1) this.prerollSamples -= this.preroll.shift()!.length;
  }

  private sendAudio(pcm: Int16Array) {
    if (!this.ws || this.ws.readyState !== OPEN) return;
    this.send({ realtimeInput: { audio: { data: pcm16ToBase64(pcm), mimeType: 'audio/pcm;rate=16000' } } });
    this.secondsIn += pcm.length / 16000;
  }

  private startStreaming() {
    if (this.streaming) return;
    this.streaming = true;
    const pre = this.preroll;
    this.preroll = [];
    this.prerollSamples = 0;
    pre.forEach((c) => this.sendAudio(c));
  }

  private stopStreaming() {
    if (!this.streaming) return;
    this.streaming = false;
    // Tells Gemini the mic paused: it flushes and transcribes what it has.
    this.send({ realtimeInput: { audioStreamEnd: true } });
  }

  private vadStart() {
    if (!this.listening || this.muted) return;
    this.vadSpeaking = true;
    this.startStreaming();
    if (this.stopAt !== null) {
      this.stopAt = null; // carried on before the transcript settled: one stretch
    } else {
      this.stretch = '';
      this.stretchMs = 0;
    }
    this.ev.onSpeechStart();
  }

  private vadEnd(durationMs: number) {
    this.vadSpeaking = false;
    this.stopStreaming();
    if (!this.listening || this.muted) return;
    this.stretchMs += durationMs;
    this.stopAt = this.clock.now();
    this.ev.onSpeechStop();
  }

  private heard(text: string, now: number) {
    this.stretch += text;
    this.lastInputAt = now;
    this.ev.onPartial(tidy(this.stretch));
    // words with no open stretch (late transcript, a blip too short for the detector): settle them
    if (!this.vadSpeaking && this.stopAt === null) {
      this.stopAt = now;
      this.stretchMs = 0;
    }
  }

  private emitFinal() {
    const text = tidy(this.stretch);
    const durationMs = this.stretchMs;
    this.stretch = '';
    this.stretchMs = 0;
    this.stopAt = null;
    this.ev.onFinal(text, { durationMs });
  }

  // ------------------------------------------------------------------ housekeeping
  private tick() {
    if (this.closed) return;
    const now = this.clock.now();
    const t = this.turn;
    if (t && t.item && !t.audio && !t.drop && now - t.sentAt > SAY_NO_AUDIO_MS) {
      // the voice never started this line: move on (it is on screen as a caption)
      this.ev.onWarning?.('The interviewer’s voice is slow right now — the question is on screen.');
      t.drop = true;
      t.complete = true;
      this.finishTurn();
    } else if (t && t.audio && !t.complete && now - t.lastAudioAt > TURN_STALL_MS && !(this.player?.active && !t.drop)) {
      t.complete = true; // "turn complete" never came
      this.finishTurn();
    } else if (t && t.drop && !t.audio && now - t.sentAt > SAY_NO_AUDIO_MS) {
      t.complete = true;
      this.finishTurn();
    }

    if (this.stopAt !== null && !this.vadSpeaking) {
      const sinceStop = now - this.stopAt;
      const sinceText = this.lastInputAt !== null && this.lastInputAt >= this.stopAt ? now - this.lastInputAt : sinceStop;
      const hinted = this.hintAt >= this.stopAt && now - this.hintAt >= 250 && sinceText >= 250;
      if ((sinceStop >= FINAL_MIN_MS && sinceText >= FINAL_SETTLE_MS) || hinted || sinceStop >= FINAL_MAX_MS) {
        this.emitFinal();
      }
    }

    if (now - this.lastUsageAt >= USAGE_EVERY_MS) this.reportUsage();
  }

  private reportUsage() {
    this.lastUsageAt = this.clock.now();
    const i = this.secondsIn;
    const o = this.secondsOut;
    this.secondsIn = 0;
    this.secondsOut = 0;
    if (i >= 0.5 || o >= 0.5) {
      try { this.opts.usage?.(i, o); } catch { /* metering never breaks the call */ }
    }
  }
}
