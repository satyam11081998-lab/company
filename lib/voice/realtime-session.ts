/**
 * OpenAI Realtime session over WebRTC.
 *
 * WHY THIS EXISTS
 * The pipeline (mic -> /transcribe -> interviewer -> /speak -> playback) ran
 * ~3.0-4.5s per turn. Two of those seconds were network: every turn made two
 * round trips through our own backend on its way to OpenAI. Realtime removes
 * both — the browser holds a peer connection straight to OpenAI, audio flows
 * continuously, and turn detection happens at the far end. That is also what
 * buys real barge-in: interrupting is just talking, not a button.
 *
 * WHAT WE KEEP
 * The ephemeral token is minted by OUR backend (Pro-gated, budget-checked), and
 * the interviewer's instructions are built there too — they are the prompt, the
 * guardrails and the case content, and must never be settable from the client.
 * Transcripts are reported back to us so `attempt_messages` stays the single
 * source of truth for scoring, exactly as in the typed path.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';

export interface RealtimeCallbacks {
  /** A completed candidate turn (already transcribed by the far end). */
  onUserTurn?: (text: string) => void;
  /** A completed interviewer turn. */
  onAssistantTurn?: (text: string) => void;
  /** Interviewer started/stopped speaking — drives the orb and barge-in state. */
  onSpeakingChange?: (speaking: boolean) => void;
  /** The candidate started/stopped speaking, per the far end's VAD. */
  onListeningChange?: (listening: boolean) => void;
  /** Token usage from `response.done`; forwarded so spend reaches the budget guard. */
  onUsage?: (usage: unknown) => void;
  onError?: (message: string) => void;
  /** Connected and ready — stop showing the connecting state. */
  onReady?: () => void;
}

export interface RealtimeHandle {
  stop: () => void;
  /** Cut the interviewer off explicitly (space bar / button). */
  interrupt: () => void;
  mute: (muted: boolean) => void;
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
  const { client_secret: clientSecret, model } = await sessionRes.json();
  if (!clientSecret) throw new Error('Voice session did not return a token.');

  // 2. Peer connection. Echo cancellation is not optional here: the
  //    interviewer's audio comes out of the same speakers the mic is listening
  //    to, and without it the far-end VAD hears the model interrupt itself.
  const pc = new RTCPeerConnection();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  stream.getAudioTracks().forEach((t) => pc.addTrack(t, stream));

  // 3. Remote audio — this element IS the interviewer's voice.
  //
  // It MUST be attached to the document. A detached <audio> plays in Chrome but
  // is unreliable elsewhere (Safari in particular), and "the interviewer is
  // silent on iPhone" is close to impossible to diagnose from a bug report.
  const audioEl = document.createElement('audio');
  audioEl.autoplay = true;
  audioEl.setAttribute('playsinline', '');   // iOS: do not hijack into fullscreen
  audioEl.style.display = 'none';
  document.body.appendChild(audioEl);
  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0];
    // Autoplay can still be refused if the gesture that opened talk mode has
    // expired. Surface it rather than sitting mute.
    void audioEl.play().catch((err) => {
      cbs.onError?.(
        err?.name === 'NotAllowedError'
          ? 'Tap the screen once to allow audio playback.'
          : 'Could not play the interviewer audio.',
      );
    });
  };

  // 4. A dropped connection must not look like a thoughtful pause.
  pc.addEventListener('connectionstatechange', () => {
    if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
      cbs.onError?.('Voice connection lost. Your session is saved — carry on in the chat.');
    }
  });

  // 4. Data channel carries the event stream both ways.
  const dc = pc.createDataChannel('oai-events');
  let speaking = false;
  const setSpeaking = (v: boolean) => {
    if (speaking === v) return;
    speaking = v;
    cbs.onSpeakingChange?.(v);
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
      // The candidate's speech, transcribed at the far end.
      case 'conversation.item.input_audio_transcription.completed': {
        const text = (evt.transcript || '').trim();
        if (text) cbs.onUserTurn?.(text);
        break;
      }
      // The interviewer's reply, as text.
      case 'response.audio_transcript.done': {
        const text = (evt.transcript || '').trim();
        if (text) cbs.onAssistantTurn?.(text);
        break;
      }
      case 'input_audio_buffer.speech_started':
        cbs.onListeningChange?.(true);
        // Far-end VAD heard the candidate start. That IS barge-in.
        setSpeaking(false);
        break;
      case 'input_audio_buffer.speech_stopped':
        cbs.onListeningChange?.(false);
        break;
      case 'response.created':
        setSpeaking(true);
        break;
      case 'response.done':
        setSpeaking(false);
        // Usage lives here. Without forwarding it, realtime spend is invisible
        // to spend_today_usd() and therefore to the daily-budget kill switch.
        if (evt.response?.usage) cbs.onUsage?.(evt.response.usage);
        break;
      case 'error':
        cbs.onError?.(evt.error?.message || 'Voice session error');
        break;
    }
  });

  // 5. SDP offer/answer.
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const sdpRes = await fetch(`${OPENAI_REALTIME_URL}?model=${encodeURIComponent(model)}`, {
    method: 'POST',
    body: offer.sdp,
    headers: { Authorization: `Bearer ${clientSecret}`, 'Content-Type': 'application/sdp' },
  });
  if (!sdpRes.ok) {
    stream.getTracks().forEach((t) => t.stop());
    pc.close();
    throw new Error(`Voice connection failed (${sdpRes.status})`);
  }
  await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });

  return {
    stop() {
      try {
        dc.close();
      } catch {
        /* already closed */
      }
      stream.getTracks().forEach((t) => t.stop());
      audioEl.pause();
      audioEl.srcObject = null;
      // Remove the element we appended, or every session leaks one into <body>.
      audioEl.remove();
      pc.close();
      setSpeaking(false);
    },
    interrupt() {
      // Explicit cancel, for the button and the space bar. Talking over the
      // interviewer already interrupts via the far-end VAD.
      if (dc.readyState === 'open') dc.send(JSON.stringify({ type: 'response.cancel' }));
      setSpeaking(false);
    },
    mute(muted: boolean) {
      stream.getAudioTracks().forEach((t) => {
        t.enabled = !muted;
      });
    },
  };
}
