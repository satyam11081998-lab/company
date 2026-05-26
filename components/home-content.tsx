'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/user-context';
import { fetchDailyToday, fetchDailyLeaderboard, type DailyContentResponse, type DailyLeaderboardResponse } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SubmissionRow } from '@/lib/types';
import { 
  Calendar, Zap, Target, TrendingUp, ArrowRight, Trophy, 
  BookOpen, BarChart3, MessageSquare, Sparkles, Loader2,
} from 'lucide-react';

interface HomeContentProps {
  recentSubmissions: SubmissionRow[];
}

export default function HomeContent({ recentSubmissions }: HomeContentProps) {
  const { user, tier, isFree } = useUser();
  const [daily, setDaily] = useState<DailyContentResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([fetchDailyToday(), fetchDailyLeaderboard()])
      .then(([d, lb]) => {
        if (!mounted) return;
        setDaily(d);
        setLeaderboard(lb);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        // Fool-proof: silent failure — leave nulls, UI renders fallbacks
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Light personalization: detect dominant case type in recent submissions
  const recentTypes = recentSubmissions.map(s => {
    // We don't have case_type on SubmissionRow; would need to join. For now skip.
    return null;
  });

  const greeting = computeGreeting();
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Greeting hero */}
      <div className="animate-fade-in">
        <p className="text-small uppercase tracking-wider text-muted-foreground font-semibold">
          {greeting}
        </p>
        <h1 className="text-h1 text-foreground mt-1">
          Welcome back, {firstName}.
        </h1>
        <p className="text-body text-muted-foreground mt-2 max-w-2xl">
          Today's curated picks for your placement prep. Daily attempts count toward the daily leaderboard.
        </p>
      </div>

      {/* Daily picks row — Case + Guesstimate + Brief */}
      <div className="grid md:grid-cols-3 gap-4 animate-slide-up">
        <DailyCaseTile daily={daily} loading={loading} />
        <DailyGuesstimateTile daily={daily} loading={loading} />
        <DailyBriefTile daily={daily} loading={loading} />
      </div>

      {/* Daily leaderboard + secondary content */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Daily leaderboard takes 2/3 */}
        <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '60ms' }}>
          <DailyLeaderboardTile leaderboard={leaderboard} loading={loading} />
        </div>

        {/* Stats + nudges takes 1/3 */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <QuickStatsTile user={user} recentCount={recentSubmissions.length} />
          {isFree && <UpgradeNudgeTile tier={tier} />}
        </div>
      </div>

      {/* Bottom: quick links to other sections */}
      <div className="grid md:grid-cols-4 gap-3 pt-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <QuickLink href="/practice" icon={<Target className="h-4 w-4" />} label="Practice" sub="Cases + guesstimates" />
        <QuickLink href="/learn" icon={<BookOpen className="h-4 w-4" />} label="Learn" sub="Frameworks + theory" />
        <QuickLink href="/gd-briefs" icon={<MessageSquare className="h-4 w-4" />} label="GD Briefs" sub="Today's headlines" />
        <QuickLink href="/dashboard" icon={<BarChart3 className="h-4 w-4" />} label="Dashboard" sub="Your analytics" />
      </div>
    </div>
  );
}

function computeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function DailyCaseTile({ daily, loading }: { daily: DailyContentResponse | null; loading: boolean }) {
  return (
    <Card className="p-5 border-l-4 border-l-primary">
      <div className="flex items-center gap-2 text-small uppercase tracking-wider text-primary font-semibold">
        <Target className="h-3.5 w-3.5" />
        Today's case
      </div>
      {loading ? (
        <SkeletonRows />
      ) : daily?.case ? (
        <>
          <h3 className="mt-3 text-h3 text-foreground line-clamp-2">
            {daily.case.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-small text-muted-foreground">
            <span className="uppercase tracking-wide">{daily.case.type.replace('_', ' ')}</span>
            <span>·</span>
            <span className="capitalize">{daily.case.difficulty}</span>
          </div>
          <Link 
            href={`/cases/${daily.case.id}?daily=1`}
            className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            Attempt today's case
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      ) : (
        <p className="mt-3 text-small text-muted-foreground">Loading today's pick…</p>
      )}
    </Card>
  );
}

function DailyGuesstimateTile({ daily, loading }: { daily: DailyContentResponse | null; loading: boolean }) {
  return (
    <Card className="p-5 border-l-4 border-l-navy">
      <div className="flex items-center gap-2 text-small uppercase tracking-wider text-foreground font-semibold">
        <Zap className="h-3.5 w-3.5" />
        Today's guesstimate
      </div>
      {loading ? (
        <SkeletonRows />
      ) : daily?.guesstimate_code ? (
        <>
          <h3 className="mt-3 text-h3 text-foreground">
            {daily.guesstimate_code}
          </h3>
          <p className="mt-2 text-small text-muted-foreground">
            Test your sizing instincts.
          </p>
          <Link 
            href={`/practice?tab=guesstimates&focus=${daily.guesstimate_code}`}
            className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            Try it
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      ) : (
        <>
          <h3 className="mt-3 text-h3 text-foreground">Pick from the bank</h3>
          <p className="mt-2 text-small text-muted-foreground">
            No specific pick today — browse the bank.
          </p>
          <Link 
            href="/practice?tab=guesstimates"
            className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            Browse
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}
    </Card>
  );
}

function DailyBriefTile({ daily, loading }: { daily: DailyContentResponse | null; loading: boolean }) {
  return (
    <Card className="p-5 border-l-4 border-l-success">
      <div className="flex items-center gap-2 text-small uppercase tracking-wider text-success font-semibold">
        <MessageSquare className="h-3.5 w-3.5" />
        Today's GD brief
      </div>
      {loading ? (
        <SkeletonRows />
      ) : daily?.brief ? (
        <>
          <h3 className="mt-3 text-h3 text-foreground line-clamp-2">
            {daily.brief.title}
          </h3>
          <p className="mt-2 text-small text-muted-foreground">
            {daily.brief.source_name}
          </p>
          <Link 
            href={`/gd-briefs/${daily.brief.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            Open brief
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      ) : (
        <>
          <h3 className="mt-3 text-h3 text-foreground">All briefs</h3>
          <p className="mt-2 text-small text-muted-foreground">
            Latest curated headlines.
          </p>
          <Link 
            href="/gd-briefs"
            className="mt-4 inline-flex items-center gap-1.5 text-small font-semibold text-primary hover:underline"
          >
            Browse
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}
    </Card>
  );
}

function DailyLeaderboardTile({ leaderboard, loading }: { leaderboard: DailyLeaderboardResponse | null; loading: boolean }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="text-h3 text-foreground">Daily leaderboard</h2>
          </div>
          <p className="text-small text-muted-foreground mt-1">
            Top scorers on today's case · resets at midnight IST
          </p>
        </div>
        {leaderboard?.total_attempts ? (
          <div className="text-right">
            <p className="text-h3 text-foreground font-mono tabular-nums">
              {leaderboard.total_attempts}
            </p>
            <p className="text-micro text-muted-foreground uppercase tracking-wider">
              attempts
            </p>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse" />
          ))}
        </div>
      ) : !leaderboard?.entries.length ? (
        <div className="py-10 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground mx-auto" />
          <p className="mt-3 text-small text-muted-foreground">
            No attempts yet today.
          </p>
          <p className="text-small text-muted-foreground">
            Be the first on the board.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {leaderboard.entries.slice(0, 10).map((entry) => (
            <div 
              key={entry.user_id}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`text-small font-bold w-6 text-center tabular-nums ${
                  entry.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' :
                  entry.rank === 2 ? 'text-foreground/80' :
                  entry.rank === 3 ? 'text-orange-600 dark:text-orange-400' :
                  'text-muted-foreground'
                }`}>
                  {entry.rank}
                </span>
                <Avatar className="h-7 w-7 flex-shrink-0">
                  {entry.avatar_url && <AvatarImage src={entry.avatar_url} alt={entry.name || ''} />}
                  <AvatarFallback className="text-xs bg-navy text-navy-foreground">
                    {entry.name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-small text-foreground truncate">
                  {entry.name || 'Anonymous'}
                </span>
              </div>
              <span className="text-small font-mono font-semibold text-foreground tabular-nums">
                {entry.score}
                <span className="text-muted-foreground font-normal">/100</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function QuickStatsTile({ user, recentCount }: { user: any; recentCount: number }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-small uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        <TrendingUp className="h-3.5 w-3.5" />
        Your stats
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-h2 font-bold text-foreground tabular-nums">
            {user?.points ?? 0}
          </p>
          <p className="text-micro uppercase tracking-wider text-muted-foreground">
            Points
          </p>
        </div>
        <div>
          <p className="text-h2 font-bold text-foreground tabular-nums">
            {recentCount}
          </p>
          <p className="text-micro uppercase tracking-wider text-muted-foreground">
            Recent subs
          </p>
        </div>
      </div>
      <Link 
        href="/dashboard"
        className="mt-4 inline-flex items-center gap-1.5 text-small font-medium text-primary hover:underline"
      >
        Full analytics
        <ArrowRight className="h-3 w-3" />
      </Link>
    </Card>
  );
}

function UpgradeNudgeTile({ tier }: { tier: string }) {
  return (
    <Card className="p-5 border-l-4 border-l-primary bg-primary/[0.02]">
      <div className="flex items-center gap-2 text-small uppercase tracking-wider text-primary font-semibold mb-2">
        <Sparkles className="h-3.5 w-3.5" />
        Unlock more
      </div>
      <p className="text-small text-foreground leading-relaxed">
        Solved examples, hint chatbot, structured paths.
      </p>
      <Link 
        href="/upgrade"
        className="mt-3 inline-flex items-center gap-1.5 bg-primary text-white text-small font-semibold px-3 py-1.5 rounded-md hover:bg-primary-hover transition-colors"
      >
        See plans
        <ArrowRight className="h-3 w-3" />
      </Link>
    </Card>
  );
}

function QuickLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link 
      href={href}
      className="ui-card p-4 hover:border-primary/40 transition-colors group"
    >
      <div className="flex items-center gap-2 text-primary mb-1">
        {icon}
        <span className="text-small font-semibold text-foreground">{label}</span>
      </div>
      <p className="text-micro text-muted-foreground">{sub}</p>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="mt-3 space-y-2">
      <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
    </div>
  );
}
