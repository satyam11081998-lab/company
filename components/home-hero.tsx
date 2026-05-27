'use client';
  
import { useUser } from '@/components/user-context';
import TierBadge from '@/components/tier-badge';
import type { SubmissionRow } from '@/lib/types';

interface Props {
  submissions: SubmissionRow[];
}

export default function HomeHero({ submissions }: Props) {
  const { user, tier } = useUser();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const greeting = computeGreeting();
  const subtext = computeSubtext(submissions, user?.points || 0);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  return (
    <div className="relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-muted/50 pointer-events-none" />

      <div className="relative container max-w-6xl py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1">
            <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
              {today} · {greeting}
            </p>
            <h1 className="mt-2 text-h1 text-foreground">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-3 text-body text-muted-foreground max-w-2xl leading-relaxed">
              {subtext}
            </p>
          </div>
          {tier !== 'free' && (
            <div className="flex-shrink-0 mt-2">
              <TierBadge tier={tier} size="md" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function computeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function computeSubtext(submissions: SubmissionRow[], points: number): string {
  // Streak detection
  if (submissions.length === 0) {
    return "Day 1 on MECE. Pick today's case below to begin your placement prep journey.";
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  const submissionDates = new Set(
    submissions.map((s) => s.created_at.slice(0, 10))
  );
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (submissionDates.has(iso)) streak++;
    else break;
  }
  
  if (streak >= 3) {
    return `You're on a ${streak}-day streak. Today's curated picks are below — don't break it.`;
  }
  if (submissions.length < 5) {
    return `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} so far. The radar tile shows where you're strongest. Keep going.`;
  }
  return "Today's curated picks are below. Each daily attempt counts toward the leaderboard at midnight IST.";
}
