/**
 * OpenAI Realtime session over WebRTC — the interviewer's VOICE only.
 *
 * WHY THIS EXISTS
 * The pipeline (mic -> /transcribe -> interviewer -> /speak -> playback) ran
 * ~3.0-4.5s per turn. Realtime keeps a peer connection straight to OpenAI: audio
 * flows continuously, turn detection happens at the far end, and interrupting is
 * just talking.
 *
 * WHAT THE APPLICATION KEEPS
 * - The ephemeral token is minted by OUR backend (gated, budget-checked); the real
 *   key never reaches the browser.
 * - The session is created with turn_detection.create_response=false: the voice
 *   model never answers a candidate turn on its own. The interviewer brain decides
 *   every turn (/attempts/{id}/voice-decision) and this module only SAYS the
 *   approved line.
 * - Lines are spoken with an OUT-OF-BAND response (conversation: "none", input: [])
 *   by default, so the voice model sees only the line - not the session audio - and
 *   its per-line cost does not grow with the length of the interview. The backend
 *   can switch this back to in-band ("auto") without a frontend deploy.
 * - Barge-in: when the candidate starts speaking over a line, the line is cancelled
 *   (response.cancel) and its unplayed audio cleared (output_audio_buffer.clear) on
 *   top of the server's own interrupt_response.
 * - Transcripts are reported back so `attempt_messages` stays the single source of
 *   truth for scoring.
 */

import { openaiSayInstructions } from '@/lib/voice/v11-voice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';
const IGNORABLE_ERRORS = new Set(['response_cancel_not_active', 'conversation_already_has_active_response']);

export interface AssistantLineDone {
  responseId: string | null;
  turnId: string | null;
  transcript: string;
  status: string;           // completed | cancelled | failed | incomplete
  audioStarted: boolean;
}

export interface RealtimeCallbacks {
  /** A completed candidate turn, with the far end's item id (stable turn id). */
  onUserTurn?: (text: string, meta: { itemId: string; at: number }) => void;
  /** Transcription of a candidate item failed (nothing to decide on). */
  onTranscriptionFailed?: (itemId: string) => void;
  onSpeechStarted?: (at: number) => void;
  onSpeechStopped?: (at: number) => void;
  /** Interviewer audio active / inactive (drives the orb and barge-in state). */
  onInterviewerAudio?: (active: boolean, at: number) => void;
  /** First audible sample of an interviewer line (after say()). */
  onFirstAudible?: (turnId: string | null, at: number) => void;
  /** An interviewer line finished (completed, or cut off by barge-in). */
  onAssistantLineDone?: (done: AssistantLineDone) => void;
  /** Streams the interviewer line text as it is spoken. */
  onAssistantDelta?: (partial: string) => void;
  /** Barge-in finished: interviewer audio stopped `ms` after the candidate started. */
  onInterrupted?: (ms: number) => void;
  onUsage?: (usage: unknown) => void;
  onError?: (message: string) => void;
  onReady?: () => void;
  /** Kept for callers of the previous API. */
  onSpeakingChange?: (speaking: boolean) => void;
}

export interface RealtimeHandle {
  stop: () => void;
  /** Cut the interviewer off (button / space bar / barge-in). */
  interrupt: () => void;
  mute: (muted: boolean) => void;
  /** Speak ONE approved line. The model never speaks otherwise. */
  say: (line: string, turnId?: string | null) => void;
  readonly sessionId: string | null;
  readonly transcribeModel: string | null;
}

interface SessionInfo {
  client_secret: string;
  model: string;
  response_conversation?: 'none' | 'auto';
  transcribe_model?: string;
}

export async function startRealtimeSession(
  opts: { caseId: string; attemptId: string; token: string },
  cbs: RealtimeCallbacks = {},
): Promise<RealtimeHandle> {
  // 1. Mint an ephemeral secret. The real key never reaches the browser.
  const sessionRes = await fetch(`${API_URL}/realtime/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${opts.token}` },
    body: JSON.stringify({ case_id: opts.caseId, attempt_id: opts.attemptId }),
  });
  if (!sessionRes.ok) {
    let detail = `Could not start voice session (${sessionRes.status})`;
    try {
      const j = await sessionRes.json();
      if (typeof j?.detail === 'string') detail = j.detail;
    } catch {
      /* not JSON */
    }
    throw new Error(detail);
  }
  const info = (await sessionRes.json()) as SessionInfo;
  const clientSecret = info.client_secret;
  if (!clientSecret) throw new Error('Voice session did not return a token.');
  const conversation = info.response_conversation === 'auto' ? 'auto' : 'none';

  // 2. Peer connection. Echo cancellation is what keeps the interviewer's audio
  //    (out of the same speakers) from being heard as the candidate.
  const pc = new RTCPeerConnection();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  stream.getAudioTracks().forEach((t) => pc.addTrack(t, stream));

  // 3. Remote audio — attached to the document (Safari will not reliably play a detached element).
  const audioEl = document.createElement('audio');
  audioEl.autoplay = true;
  audioEl.setAttribute('playsinline', '');
  audioEl.style.display = 'none';
  document.body.appendChild(audioEl);

  // First-audible detection: an analyser on the remote stream, armed by say().
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let armed: { turnId: string | null; since: number } | null = null;
  let rafTimer: ReturnType<typeof setInterval> | null = null;
  const samples = new Float32Array(1024);
  // After response.done the WebRTC buffer can still be playing. output_audio_buffer.stopped
  // ends the speaking state; if it never arrives, the analyser (or a timer) does.
  let drainingSince: number | null = null;
  let quietSince: number | null = null;

  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0];
    void audioEl.play().catch((err) => {
      cbs.onError?.(
        err?.name === 'NotAllowedError' ? 'Tap the screen once to allow audio playback.' : 'Could not play the interviewer audio.',
      );
    });
    try {
      const Ctx: typeof AudioContext | undefined =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        audioCtx = new Ctx();
        const src = audioCtx.createMediaStreamSource(e.streams[0]);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser); // analyser only; playback stays on the <audio> element
        rafTimer = setInterval(() => {
          if ((!armed && drainingSince === null) || !analyser) return;
          analyser.getFloatTimeDomainData(samples);
          let sum = 0;
          for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
          const rms = Math.sqrt(sum / samples.length);
          const now = Date.now();
          if (armed) {
            if (rms > 0.01) {
              const a = armed;
              armed = null;
              cbs.onFirstAudible?.(a.turnId, now);
            } else if (now - armed.since > 15000) {
              armed = null;
            }
          }
          if (drainingSince !== null) {
            if (rms > 0.005) quietSince = null;
            else if (quietSince === null) quietSince = now;
            if ((quietSince !== null && now - quietSince > 600) || now - drainingSince > 20000) {
              drainingSince = null;
              quietSince = null;
              setInterviewerAudio(false);
            }
          }
        }, 10);
      }
    } catch {
      /* measurement only; never break audio */
    }
  };

  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      cbs.onError?.('Voice connection lost. Your session is saved — carry on in the chat.');
    }
  });

  // 4. Data channel: the event stream both ways.
  const dc = pc.createDataChannel('oai-events');
  let sessionId: string | null = null;
  let activeResponse: { id: string | null; turnId: string | null; audioStarted: boolean } | null = null;
  const turnByResponse = new Map<string, string | null>();
  let pendingTurnId: string | null = null;   // turn id of the say() whose response.created has not arrived
  let asstDraft = '';
  let bargeInAt: number | null = null;
  let interviewerAudio = false;

  const setInterviewerAudio = (v: boolean) => {
    if (interviewerAudio === v) return;
    interviewerAudio = v;
    cbs.onInterviewerAudio?.(v, Date.now());
    cbs.onSpeakingChange?.(v);
    if (!v && bargeInAt !== null) {
      cbs.onInterrupted?.(Date.now() - bargeInAt);
      bargeInAt = null;
    }
  };

  const send = (obj: unknown) => {
    if (dc.readyState === 'open') dc.send(JSON.stringify(obj));
  };

  const cancelActive = () => {
    if (activeResponse) {
      send(activeResponse.id ? { type: 'response.cancel', response_id: activeResponse.id } : { type: 'response.cancel' });
    }
    send({ type: 'output_audio_buffer.clear' });
  };

  dc.addEventListener('open', () => cbs.onReady?.());
  dc.addEventListener('message', (e) => {
    let evt: any;
    try {
      evt = JSON.parse(e.data);
    } catch {
      return;
    }
    switch (evt.type) {
      case 'session.created':
        sessionId = evt.session?.id ?? null;
        break;
      case 'conversation.item.input_audio_transcription.completed': {
        const text = (evt.transcript || '').trim();
        if (text) cbs.onUserTurn?.(text, { itemId: String(evt.item_id || ''), at: Date.now() });
        break;
      }
      case 'conversation.item.input_audio_transcription.failed':
        cbs.onTranscriptionFailed?.(String(evt.item_id || ''));
        break;
      case 'input_audio_buffer.speech_started':
        cbs.onSpeechStarted?.(Date.now());
        break;
      case 'input_audio_buffer.speech_stopped':
        cbs.onSpeechStopped?.(Date.now());
        break;
      case 'response.created': {
        const id = evt.response?.id ?? null;
        const turnId = (evt.response?.metadata?.mece_turn as string | undefined) ?? pendingTurnId;
        pendingTurnId = null;
        activeResponse = { id, turnId, audioStarted: false };
        if (id) turnByResponse.set(id, turnId);
        asstDraft = '';
        setInterviewerAudio(true);
        break;
      }
      case 'output_audio_buffer.started':
        if (activeResponse) activeResponse.audioStarted = true;
        setInterviewerAudio(true);
        break;
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        drainingSince = null;
        setInterviewerAudio(false);
        break;
      case 'response.audio_transcript.delta':
      case 'response.output_audio_transcript.delta':
        if (activeResponse) activeResponse.audioStarted = true;
        asstDraft += evt.delta || '';
        if (asstDraft) cbs.onAssistantDelta?.(asstDraft);
        break;
      case 'response.done': {
        const r = evt.response || {};
        const id = r.id ?? activeResponse?.id ?? null;
        const turnId = (id && turnByResponse.get(id)) ?? activeResponse?.turnId ?? null;
        let transcript = asstDraft;
        for (const item of r.output || []) {
          for (const c of item?.content || []) if (typeof c?.transcript === 'string') transcript = c.transcript;
        }
        cbs.onAssistantLineDone?.({
          responseId: id,
          turnId,
          transcript: (transcript || '').trim(),
          status: r.status || 'completed',
          audioStarted: Boolean(activeResponse?.audioStarted || transcript),
        });
        if (r.usage) cbs.onUsage?.(r.usage);
        if (id) turnByResponse.delete(id);
        activeResponse = null;
        asstDraft = '';
        // WebRTC keeps playing buffered audio after response.done; output_audio_buffer.stopped
        // ends the speaking state. If the model never produced audio, end it here.
        if (r.status && r.status !== 'completed') setInterviewerAudio(false);
        else if (interviewerAudio) {
          drainingSince = Date.now();
          quietSince = null;
          if (!analyser) setTimeout(() => { if (drainingSince !== null) { drainingSince = null; setInterviewerAudio(false); } }, 4000);
        }
        break;
      }
      case 'error': {
        const code = evt.error?.code;
        if (code && IGNORABLE_ERRORS.has(code)) break;
        cbs.onError?.(evt.error?.message || 'Voice session error');
        break;
      }
    }
  });

  // 5. SDP offer/answer.
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const sdpRes = await fetch(`${OPENAI_REALTIME_URL}?model=${encodeURIComponent(info.model)}`, {
    method: 'POST',
    body: offer.sdp,
    headers: { Authorization: `Bearer ${clientSecret}`, 'Content-Type': 'application/sdp' },
  });
  if (!sdpRes.ok) {
    stream.getTracks().forEach((t) => t.stop());
    pc.close();
    audioEl.remove();
    throw new Error(`Voice connection failed (${sdpRes.status})`);
  }
  await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });

  return {
    get sessionId() {
      return sessionId;
    },
    get transcribeModel() {
      return info.transcribe_model ?? null;
    },
    stop() {
      try {
        dc.close();
      } catch {
        /* already closed */
      }
      if (rafTimer) clearInterval(rafTimer);
      try {
        void audioCtx?.close();
      } catch {
        /* ignore */
      }
      stream.getTracks().forEach((t) => t.stop());
      audioEl.pause();
      audioEl.srcObject = null;
      audioEl.remove();
      pc.close();
      setInterviewerAudio(false);
    },
    interrupt() {
      bargeInAt = Date.now();
      cancelActive();
    },
    mute(muted: boolean) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    },
    say(line: string, turnId: string | null = null) {
      const text = (line || '').trim();
      if (!text || dc.readyState !== 'open') return;
      // A newer approved line supersedes one still playing.
      if (activeResponse || interviewerAudio) cancelActive();
      pendingTurnId = turnId;
      armed = { turnId, since: Date.now() };
      const response: Record<string, unknown> = {
        instructions: openaiSayInstructions(text),
        output_modalities: ['audio'],
        metadata: { mece_turn: turnId ?? '' },
      };
      if (conversation === 'none') {
        response.conversation = 'none';
        response.input = [];
      }
      send({ type: 'response.create', response });
    },
  };
}
