'use client';
  
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Target, Zap, MessageSquare, Clock, BookOpen, BarChart3, ArrowRight, Sparkles
} from 'lucide-react';

import HomeHero from '@/components/home-hero';
import SectionHeader from '@/components/section-header';
import DailyPickTile from '@/components/daily-pick-tile';
import SubmissionHeatmap from '@/components/submission-heatmap';
import SkillMasteryGrid from '@/components/skill-mastery-grid';

import { Card } from '@/components/ui/card';

import { fetchDailyToday, type DailyContentResponse } from '@/lib/api';
import type { SubmissionRow } from '@/lib/types';

interface Props {
  submissions: SubmissionRow[];
}

export default function HomeContent({ submissions }: Props) {
  const [daily, setDaily] = useState<DailyContentResponse | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDailyToday()
      .then((d) => {
        if (mounted) {
          setDaily(d);
          setDailyLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setDailyLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <>
      {/* Section 1: Personalized hero */}
      <HomeHero submissions={submissions} />

      <div className="container max-w-6xl pb-16 space-y-8 md:space-y-14">
        {/* Section 2: Today's curated picks */}
        <section className="animate-slide-up">
          <SectionHeader 
            label="TODAY · CURATED FOR YOU"
            subtitle="Three picks updated daily at midnight IST"
          />
          <div className="grid gap-4 md:gap-5 md:grid-cols-3">
            <DailyPickTile
              icon={<Target className="h-4 w-4" />}
              label={
                daily?.case 
                  ? `CASE · ${daily.case.type.replace('_', ' ').toUpperCase()} · ${daily.case.difficulty.toUpperCase()}` 
                  : 'CASE'
              }
              title={daily?.case?.title || "Loading today's case…"}
              context="Reach McKinsey-standard structure"
              metaText="~25 min"
              difficultyDots={daily?.case?.difficulty === 'hard' ? 3 : daily?.case?.difficulty === 'medium' ? 2 : 1}
              href={daily?.case ? `/cases/${daily.case.id}?daily=1` : '/practice'}
              cta={daily?.case ? "Attempt today's case" : "Browse cases"}
              loading={dailyLoading}
            />
            <DailyPickTile
              icon={<Zap className="h-4 w-4" />}
              label={daily?.guesstimate_code ? `GUESSTIMATE · ${daily.guesstimate_code.toUpperCase()}` : 'GUESSTIMATE'}
              title={daily?.guesstimate_title ? daily.guesstimate_title : (daily?.guesstimate_code ? `Today's guesstimate: ${daily.guesstimate_code}` : "Pick from the bank")}
              context="Sharpen your sizing instincts"
              metaText="~15 min"
              difficultyDots={2}
              href={daily?.guesstimate_code ? `/practice?tab=guesstimates&focus=${daily.guesstimate_code}` : '/practice?tab=guesstimates'}
              cta={daily?.guesstimate_code ? "Solve today's guesstimate" : "Browse guesstimates"}
              loading={dailyLoading}
            />
            <DailyPickTile
              icon={<MessageSquare className="h-4 w-4" />}
              label={daily?.brief ? `GD BRIEF · ${daily.brief.source_name.toUpperCase()}` : 'GD BRIEF'}
              title={daily?.brief?.title || "Today's headlines"}
              context="Sharp takes for group discussion"
              metaText="~8 min read"
              difficultyDots={2}
              href={daily?.brief ? `/gd-briefs/${daily.brief.id}` : '/gd-briefs'}
              cta={daily?.brief ? "Read today's brief" : "Browse briefs"}
              loading={dailyLoading}
            />
          </div>
        </section>

        {/* Section 3: Your journey (heatmaps) */}
        <section className="animate-slide-up" style={{ animationDelay: '80ms' }}>
          <SectionHeader 
            label="YOUR JOURNEY"
            subtitle="Where you are. Where you're headed."
          />
          <div className="grid md:grid-cols-2 gap-5">
            <SubmissionHeatmap submissions={submissions} weeks={12} />
            <SkillMasteryGrid submissions={submissions} />
          </div>
        </section>



        {/* Section 5: Quick links */}
        <section className="animate-fade-in" style={{ animationDelay: '240ms' }}>
          <SectionHeader label="EXPLORE" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickLink href="/practice" icon={<Target className="h-4 w-4" />} label="Practice" sub="Cases + guesstimates" />
            <QuickLink href="/learn" icon={<BookOpen className="h-4 w-4" />} label="Learn" sub="Frameworks + theory" />
            <QuickLink href="/gd-briefs" icon={<MessageSquare className="h-4 w-4" />} label="GD Briefs" sub="Today's headlines" />
            <QuickLink href="/dashboard" icon={<BarChart3 className="h-4 w-4" />} label="Dashboard" sub="Your analytics" />
          </div>
        </section>
      </div>
    </>
  );
}

function QuickLink({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link 
      href={href}
      className="ui-card p-4 hover:border-primary/30 transition-colors block"
    >
      <div className="flex items-center gap-2 text-foreground mb-1">
        <span className="text-primary">{icon}</span>
        <span className="text-body font-semibold">{label}</span>
      </div>
      <p className="text-small text-muted-foreground">{sub}</p>
      <div className="mt-2 flex items-center gap-1 text-micro text-primary font-medium">
        Open
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
