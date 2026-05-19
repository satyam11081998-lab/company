'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitCaseAnswer } from '@/lib/api';
import { MIN_ANSWER_CHARS } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

/** Client form on /cases/[id] for submitting an answer to the scoring API. */
export default function SubmissionForm({ userId, caseId }: { userId: string; caseId: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = answer.length;
  const isValid = charCount >= MIN_ANSWER_CHARS;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      toast.error(`Your answer needs at least ${MIN_ANSWER_CHARS} characters.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const { submission_id } = await submitCaseAnswer({ user_id: userId, case_id: caseId, answer_text: answer });
      router.push(`/results/${submission_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      toast.error(message);
      setIsSubmitting(false);
    }
  }

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-12 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="mt-4 text-lg font-semibold text-slate-900">Scoring your answer…</p>
        <p className="mt-1 text-sm text-slate-600">This can take 10–20 seconds. Hang tight.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type out your structure, assumptions and final number. Aim for clear sub-bullets."
        rows={14}
        className="resize-none text-base leading-relaxed"
        required
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${isValid ? 'text-emerald-700' : 'text-slate-500'}`}>
          {charCount} / {MIN_ANSWER_CHARS} characters minimum
        </span>
        <Button type="submit" disabled={!isValid} className="bg-amber-500 text-white hover:bg-amber-600">
          Submit for AI feedback
        </Button>
      </div>
    </form>
  );
}
