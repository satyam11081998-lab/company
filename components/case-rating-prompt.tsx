'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { ThumbsDown, Equal, ThumbsUp, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  caseId: string;
  userId: string;
  existingRating: 'easier' | 'right' | 'harder' | null;
  lastSubmissionId: string | null;
}

export default function CaseRatingPrompt({ caseId, userId, existingRating, lastSubmissionId }: Props) {
  const [rating, setRating] = useState<'easier' | 'right' | 'harder' | null>(existingRating);
  const [saving, setSaving] = useState(false);

  async function handleRate(newRating: 'easier' | 'right' | 'harder') {
    if (saving) return;
    setSaving(true);
    const previous = rating;
    setRating(newRating);  // optimistic

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('case_ratings')
        .upsert({
          case_id: caseId,
          user_id: userId,
          rating: newRating,
          submission_id: lastSubmissionId,
        }, { onConflict: 'case_id,user_id' });

      if (error) {
        setRating(previous);
        toast.error('Could not save rating');
      } else {
        toast.success('Rating saved · thanks for helping calibrate');
      }
    } catch (err) {
      setRating(previous);
      toast.error('Could not save rating');
    } finally {
      setSaving(false);
    }
  }

  const options: Array<{ value: 'easier' | 'right' | 'harder'; label: string; icon: React.ReactNode }> = [
    { value: 'easier', label: 'Easier than rated', icon: <ThumbsDown className="h-4 w-4" /> },
    { value: 'right',  label: 'Rated about right', icon: <Equal className="h-4 w-4" /> },
    { value: 'harder', label: 'Harder than rated', icon: <ThumbsUp className="h-4 w-4" /> },
  ];

  return (
    <Card className="p-5">
      <p className="text-small font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        Rate this case
      </p>
      <p className="text-small text-muted-foreground mb-4">
        How did the actual difficulty compare to the rating? Helps us calibrate for everyone.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => {
          const isSelected = rating === o.value;
          return (
            <button
              key={o.value}
              onClick={() => handleRate(o.value)}
              disabled={saving}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-small font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card border-border text-foreground hover:border-primary/40'
              } ${saving ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSelected ? <Check className="h-3.5 w-3.5" /> : o.icon}
              <span className="hidden md:inline">{o.label}</span>
              <span className="md:hidden capitalize">{o.value}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
