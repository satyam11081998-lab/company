'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import MicWaveform from '@/components/mic-waveform';

async function _sessionToken(): Promise<string | undefined> {
  try {
    const { data } = await createClient().auth.getSession();
    return data.session?.access_token;
  } catch {
    return undefined;
  }
}

export interface DictationHandle {
  /** True while actively recording (read synchronously at click time). */
  isRecording: () => boolean;
  /** Stop recording, transcribe, and resolve with the text (or null). Use from a Send button. */
  finalize: () => Promise<string | null>;
}

interface DictationButtonProps {
  onTranscriptionCompleted: (text: string) => void;
  /** Notified when recording starts/stops so the parent can keep its Send button active. */
  onRecordingChange?: (recording: boolean) => void;
  disabled?: boolean;
}

type Status = 'idle' | 'recording' | 'transcribing';

/**
 * Voice dictation control.
 *  - tap mic  -> start recording (shows a stop-square with pulsing rings).
 *  - tap square -> CANCEL (discard, no transcription).
 *  - committing is done by the parent's Send button via the imperative
 *    finalize(): it stops + transcribes and returns the text.
 */
const DictationButton = forwardRef<DictationHandle, DictationButtonProps>(function DictationButton(
  { onTranscriptionCompleted, onRecordingChange, disabled },
  ref,
) {
  const [status, setStatus] = useState<Status>('idle');
  const [waveStream, setWaveStream] = useState<MediaStream | null>(null);
  const statusRef = useRef<Status>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const resolveRef = useRef<((t: string | null) => void) | null>(null);
  const cancelledRef = useRef(false);

  function setS(s: Status) {
    statusRef.current = s;
    setStatus(s);
    if (s === 'recording') onRecordingChange?.(true);
    else if (s === 'idle') onRecordingChange?.(false);
  }

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setWaveStream(null); // hide the waveform the moment recording ends
  }

  function settle(text: string | null) {
    const r = resolveRef.current;
    resolveRef.current = null;
    r?.(text);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setWaveStream(stream); // feed the live waveform
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      cancelledRef.current = false;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        cleanupStream();

        if (cancelledRef.current) {
          chunksRef.current = [];
          setS('idle');
          settle(null);
          return;
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size === 0) {
          setS('idle');
          settle(null);
          return;
        }

        setS('transcribing');
        try {
          const token = await _sessionToken();
          const { text } = await transcribeAudio(audioBlob, token);
          if (text) {
            onTranscriptionCompleted(text);
            setS('idle');
            settle(text);
          } else {
            toast.error('Could not transcribe any speech.');
            setS('idle');
            settle(null);
          }
        } catch (err) {
          console.error('Transcription error:', err);
          // Surface the backend's friendly reason (e.g. daily voice limit reached).
          toast.error(err instanceof Error ? err.message : 'Failed to transcribe audio. Please try again.');
          setS('idle');
          settle(null);
        }
      };

      mediaRecorder.start();
      setS('recording');
    } catch (err) {
      console.error('Microphone access error:', err);
      toast.error('Microphone access denied or unavailable.');
      setS('idle');
    }
  }

  function cancelRecording() {
    cancelledRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // onstop sees cancelledRef and discards
    } else {
      cleanupStream();
      chunksRef.current = [];
      setS('idle');
    }
  }

  /** Stop + transcribe, resolving with the text. Called by the parent's Send button. */
  function finalize(): Promise<string | null> {
    return new Promise((resolve) => {
      if (statusRef.current === 'transcribing') {
        resolveRef.current = resolve; // already finishing — hook the in-flight result
        return;
      }
      if (
        statusRef.current !== 'recording' ||
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state !== 'recording'
      ) {
        resolve(null);
        return;
      }
      cancelledRef.current = false;
      resolveRef.current = resolve;
      mediaRecorderRef.current.stop(); // -> onstop -> transcribe -> settle(text)
    });
  }

  useImperativeHandle(ref, () => ({
    isRecording: () => statusRef.current === 'recording',
    finalize,
  }), []);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (statusRef.current === 'idle') startRecording();
    else if (statusRef.current === 'recording') cancelRecording();
  }

  return (
    <div className="flex items-center gap-2">
      {status === 'recording' && (
        // Live ChatGPT-style waveform — bars scroll right → left as you speak.
        <div className="flex items-center gap-2 rounded-full bg-primary/10 pl-3 pr-1 py-1">
          <MicWaveform stream={waveStream} className="h-6 w-20 text-primary" />
          <span className="text-micro font-medium text-primary/80 tabular-nums">rec</span>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={disabled || status === 'transcribing'}
        title={status === 'recording' ? 'Tap to cancel — use Send to submit' : 'Dictate answer with your voice'}
        aria-label={status === 'recording' ? 'Cancel recording' : 'Record voice'}
        type="button"
        className={`
          relative flex items-center justify-center h-10 w-10 shrink-0 rounded-full transition-all
          ${status === 'idle' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
          ${status === 'recording' ? 'bg-primary text-primary-foreground' : ''}
          ${status === 'transcribing' ? 'bg-muted text-muted-foreground' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {status === 'recording' && (
          <span className="pointer-events-none absolute -inset-1 rounded-full border-2 border-primary/40 animate-ping" />
        )}
        {status === 'idle' && <Mic className="h-5 w-5" />}
        {status === 'recording' && <Square className="relative h-4 w-4 fill-current" />}
        {status === 'transcribing' && <Loader2 className="h-5 w-5 animate-spin" />}
      </button>
    </div>
  );
});

export default DictationButton;
