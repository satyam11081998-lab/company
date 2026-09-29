/**
 * Live transcription for STT talk mode: OpenAI realtime TRANSCRIPTION session
 * (gpt-live-transcribe) over WebRTC. Opt-in: NEXT_PUBLIC_STT_TRANSPORT=live.
 *
 * Contract used (developers.openai.com/api/docs/guides/realtime-transcription, 2026-09-29):
 *   - gpt-live-transcribe does not support server/semantic VAD: turn_detection is null and
 *     the CLIENT ends each turn with `input_audio_buffer.commit` (our existing VAD decides when);
 *   - `conversation.item.input_audio_transcription.delta` streams partial text (UI only);
 *   - `conversation.item.input_audio_transcription.completed` is the turn boundary;
 *   - completion order across turns is not guaranteed, so everything is keyed by item_id.
 *
 * Partial deltas are NEVER handed to the interviewer brain. Only the completed transcript of
 * a committed item becomes a candidate turn. If the live session cannot start, the caller
 * falls back to the existing Whisper transport.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const OPENAI_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';
export const COMMIT_TIMEOUT_MS = 8000;

export type AssemblerOut =
  | { type: 'delta'; itemId: string; text: string }
  | { type: 'final'; itemId: string; text: string }
  | { type: 'failed'; itemId: string }
  | { type: 'committed'; itemId: string }
  | { type: 'commitEmpty' };

/**
 * Pure event reducer: per-item partial text, commit -> item binding (FIFO), and final
 * resolution. No browser APIs, so it is unit-tested directly.
 */
export class LiveTranscriptAssembler {
  private partial = new Map<string, string>();
  private finals = new Map<string, string>();
  private done = new Set<string>();
  private waiting: Array<{ id: number; itemId: string | null }> = [];
  private nextId = 1;

  /** Register a commit we just sent; returns a ticket resolved by resolveFor(). */
  openCommit(): number {
    const id = this.nextId++;
    this.waiting.push({ id, itemId: null });
    return id;
  }

  /** The item bound to a commit ticket, once the server acknowledged the commit. */
  itemFor(ticket: number): string | null {
    return this.waiting.find((w) => w.id === ticket)?.itemId ?? null;
  }

  /** Final text for a ticket, if already known. */
  finalFor(ticket: number): string | null {
    const item = this.itemFor(ticket);
    return item && this.finals.has(item) ? this.finals.get(item)! : null;
  }

  closeCommit(ticket: number): void {
    this.waiting = this.waiting.filter((w) => w.id !== ticket);
  }

  onEvent(evt: any): AssemblerOut | null {
    switch (evt?.type) {
      case 'input_audio_buffer.committed': {
        const itemId = String(evt.item_id || '');
        const w = this.waiting.find((x) => x.itemId === null);
        if (w) w.itemId = itemId;
        return { type: 'committed', itemId };
      }
      case 'conversation.item.input_audio_transcription.delta': {
        const itemId = String(evt.item_id || '');
        if (this.done.has(itemId)) return null;               // late delta after the final
        const text = (this.partial.get(itemId) || '') + (evt.delta || '');
        this.partial.set(itemId, text);
        return { type: 'delta', itemId, text };
      }
      case 'conversation.item.input_audio_transcription.completed': {
        const itemId = String(evt.item_id || '');
        if (this.done.has(itemId)) return null;               // duplicate completion
        this.done.add(itemId);
        const text = String(evt.transcript ?? this.partial.get(itemId) ?? '').trim();
        this.partial.delete(itemId);
        this.finals.set(itemId, text);
        return { type: 'final', itemId, text };
      }
      case 'conversation.item.input_audio_transcription.failed': {
        const itemId = String(evt.item_id || '');
        this.done.add(itemId);
        this.finals.set(itemId, '');
        return { type: 'failed', itemId };
      }
      case 'error': {
        const code = evt.error?.code || '';
        if (String(code).includes('commit_empty') || String(code).includes('buffer_too_small')) {
          // The commit bound to nothing: release the oldest unbound waiter with an empty turn.
          const w = this.waiting.find((x) => x.itemId === null);
          if (w) {
            w.itemId = `empty-${w.id}`;
            this.finals.set(w.itemId, '');
            this.done.add(w.itemId);
          }
          return { type: 'commitEmpty' };
        }
        return null;
      }
      default:
        return null;
    }
  }

  /** Current partial transcript of the newest item (for the on-screen draft). */
  latestPartial(): string {
    let last = '';
    this.partial.forEach((v) => { last = v; });
    return last;
  }
}

export interface LiveTranscriptionHandle {
  /** End the current turn; resolves with its final transcript ('' for no speech). */
  commit: () => Promise<string>;
  /** Drop buffered, uncommitted audio (e.g. the interviewer's own voice). */
  clear: () => void;
  /** Stop sending mic audio (while the interviewer speaks) without closing the session. */
  pause: (paused: boolean) => void;
  stop: () => void;
  readonly model: string;
}

export async function startLiveTranscription(
  opts: { token: string; caseId?: string; attemptId?: string; stream: MediaStream },
  cbs: { onDelta?: (text: string) => void; onError?: (m: string) => void } = {},
): Promise<LiveTranscriptionHandle> {
  const res = await fetch(`${API_URL}/realtime/transcription-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.token}` },
    body: JSON.stringify({ case_id: opts.caseId, attempt_id: opts.attemptId }),
  });
  if (!res.ok) throw new Error(`live transcription unavailable (${res.status})`);
  const { client_secret: secret, model } = await res.json();
  if (!secret) throw new Error('live transcription returned no token');

  const pc = new RTCPeerConnection();
  const track = opts.stream.getAudioTracks()[0];
  if (!track) throw new Error('no microphone track');
  const sender = pc.addTrack(track, opts.stream);
  const dc = pc.createDataChannel('oai-events');
  const asm = new LiveTranscriptAssembler();
  const waiters = new Map<number, (text: string) => void>();
  let streamedSince = Date.now();
  let paused = false;

  const flushUsage = (final = false) => {
    const now = Date.now();
    const secs = paused ? 0 : (now - streamedSince) / 1000;
    streamedSince = now;
    if (secs <= 0) return;
    void fetch(`${API_URL}/realtime/transcription-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.token}` },
      body: JSON.stringify({ seconds: Math.round(secs * 10) / 10 }),
      keepalive: final,
    }).catch(() => {});
  };
  const usageTimer = setInterval(() => flushUsage(false), 30_000);

  const settle = () => {
    waiters.forEach((resolve, ticket) => {
      const text = asm.finalFor(ticket);
      if (text !== null) {
        waiters.delete(ticket);
        asm.closeCommit(ticket);
        resolve(text);
      }
    });
  };

  dc.addEventListener('message', (e) => {
    let evt: any;
    try {
      evt = JSON.parse(e.data);
    } catch {
      return;
    }
    const out = asm.onEvent(evt);
    if (!out) {
      if (evt?.type === 'error' && evt.error?.message) cbs.onError?.(evt.error.message);
      return;
    }
    if (out.type === 'delta') cbs.onDelta?.(out.text);
    settle();
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const sdp = await fetch(OPENAI_CALLS_URL, {
    method: 'POST',
    body: offer.sdp,
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/sdp' },
  });
  if (!sdp.ok) {
    pc.close();
    clearInterval(usageTimer);
    throw new Error(`live transcription connection failed (${sdp.status})`);
  }
  await pc.setRemoteDescription({ type: 'answer', sdp: await sdp.text() });
  await new Promise<void>((resolve, reject) => {
    if (dc.readyState === 'open') return resolve();
    const t = setTimeout(() => reject(new Error('live transcription channel did not open')), 8000);
    dc.addEventListener('open', () => { clearTimeout(t); resolve(); });
  });

  const send = (o: unknown) => { if (dc.readyState === 'open') dc.send(JSON.stringify(o)); };

  return {
    model: model || 'gpt-live-transcribe',
    commit() {
      const ticket = asm.openCommit();
      send({ type: 'input_audio_buffer.commit' });
      return new Promise<string>((resolve, reject) => {
        waiters.set(ticket, resolve);
        setTimeout(() => {
          if (waiters.has(ticket)) {
            waiters.delete(ticket);
            asm.closeCommit(ticket);
            reject(new Error('transcription timed out'));
          }
        }, COMMIT_TIMEOUT_MS);
      });
    },
    clear() {
      send({ type: 'input_audio_buffer.clear' });
    },
    pause(p: boolean) {
      if (p === paused) return;
      flushUsage(false);
      paused = p;
      // Replace the outgoing track with nothing while paused: no audio (and no billing for
      // silence we chose not to send) - the interviewer's own voice never reaches the transcriber.
      void sender.replaceTrack(p ? null : track).catch(() => {});
    },
    stop() {
      flushUsage(true);
      clearInterval(usageTimer);
      waiters.forEach((resolve) => resolve(''));
      waiters.clear();
      try { dc.close(); } catch { /* closed */ }
      pc.close();
    },
  };
}
