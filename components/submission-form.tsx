'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { submitCaseAnswer } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
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
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const { submission_id } = await submitCaseAnswer({ user_id: userId, case_id: caseId, answer_text: answer, token: session?.access_token });
      router.push(`/results/${submission_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Submission failed';
      toast.error(message);
      setIsSubmitting(false);
    }
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
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type out your structure, assumptions and final number. Aim for clear sub-bullets."
        className="resize-none text-base leading-relaxed min-h-[250px] md:min-h-[350px]"
        required
      />
      <div className="flex items-center justify-between">
        <span className={`text-base font-medium ${isValid ? 'text-emerald-700' : 'text-muted-foreground'}`}>
          {charCount} / {MIN_ANSWER_CHARS} characters minimum
        </span>
        <Button type="submit" disabled={!isValid} className="bg-primary text-primary-foreground hover:bg-primary-hover">
          Submit for feedback
        </Button>
      </div>
    </form>
  );
}
