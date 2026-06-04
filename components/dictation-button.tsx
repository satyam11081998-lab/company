'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { transcribeAudio } from '@/lib/api';

interface DictationButtonProps {
  onTranscriptionCompleted: (text: string) => void;
  disabled?: boolean;
}

export default function DictationButton({ onTranscriptionCompleted, disabled }: DictationButtonProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Stop all audio tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());

        if (audioBlob.size === 0) {
          setStatus('idle');
          return;
        }

        setStatus('transcribing');
        try {
          const { text } = await transcribeAudio(audioBlob);
          if (text) {
            onTranscriptionCompleted(text);
          } else {
            toast.error("Could not transcribe any speech.");
          }
        } catch (err) {
          console.error("Transcription error:", err);
          toast.error("Failed to transcribe audio. Please try again.");
        } finally {
          setStatus('idle');
        }
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Microphone access denied or unavailable.");
      setStatus('idle');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault(); // Prevent form submission
    
    if (status === 'idle') {
      startRecording();
    } else if (status === 'recording') {
      stopRecording();
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || status === 'transcribing'}
      title="Dictate answer with your voice"
      type="button"
      className={`
        flex items-center justify-center h-10 w-10 shrink-0 rounded-full transition-all
        ${status === 'idle' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
        ${status === 'recording' ? 'bg-primary text-primary-foreground animate-pulse shadow-[0_0_15px_rgba(200,16,46,0.5)]' : ''}
        ${status === 'transcribing' ? 'bg-muted text-muted-foreground' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {status === 'idle' && <Mic className="h-5 w-5" />}
      {status === 'recording' && <Square className="h-4 w-4 fill-current" />}
      {status === 'transcribing' && <Loader2 className="h-5 w-5 animate-spin" />}
    </button>
  );
}
