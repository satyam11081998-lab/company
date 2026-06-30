'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitCaseAnswer } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { MIN_ANSWER_CHARS } from '@/lib/constants';
import { ANSWER_MAX_CHARS } from '@/lib/limits';
import { Loader2 } from 'lucide-react';
import DictationButton, { type DictationHandle } from '@/components/dictation-button';
import CameraButton from '@/components/camera-button';

/** Client form on /cases/[id] for submitting an answer to the scoring API. */
export default function SubmissionForm({ userId, caseId }: { userId: string; caseId: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const dictRef = useRef<DictationHandle>(null);

  const charCount = answer.length;
  const isValid = charCount >= MIN_ANSWER_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If the mic is still recording, finalize it first and fold the transcript in.
    let text = answer;
    if (dictRef.current?.isRecording()) {
      const t = await dictRef.current.finalize();
      if (t) text = answer ? `${answer}\n\n${t}` : t;
    }

    if (text.trim().length < MIN_ANSWER_CHARS) {
      toast.error(`Your answer needs at least ${MIN_ANSWER_CHARS} characters.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { submission_id } = await submitCaseAnswer({ user_id: userId, case_id: caseId, answer_text: text, token: session?.access_token });
      router.push(`/results/${submission_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      toast.error(message);
      setIsSubmitting(false);
    }
  }

  function handleInputExtracted(extractedText: string) {
    // Append the new text with a double newline for image OCR, or space for dictation
    // We'll just use a double newline to be safe so it separates paragraphs nicely
    setAnswer(prev => prev ? `${prev}\n\n${extractedText}` : extractedText);
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-accent p-12 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-lg font-semibold text-foreground">Scoring your answer…</p>
        <p className="mt-1 text-base text-muted-foreground">This can take 10–20 seconds. Hang tight.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type out your structure, assumptions and final number. Aim for clear sub-bullets."
          className="resize-none text-base leading-relaxed min-h-[250px] md:min-h-[350px] pb-16"
          maxLength={ANSWER_MAX_CHARS}
        />

        {/* Input tools positioned inside the textarea area */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
          <CameraButton onExtractionCompleted={handleInputExtracted} />
          <DictationButton ref={dictRef} onRecordingChange={setRecording} onTranscriptionCompleted={handleInputExtracted} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className={`text-base font-medium ${isValid ? 'text-emerald-700' : 'text-muted-foreground'}`}>
          {charCount} / {ANSWER_MAX_CHARS} characters (min {MIN_ANSWER_CHARS})
        </span>
        <Button type="submit" disabled={!isValid && !recording} className="bg-primary text-primary-foreground hover:bg-primary-hover">
          Submit for feedback
        </Button>
      </div>
    </form>
  );
}
