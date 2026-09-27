import { GlyphChain, GlyphRubric, GlyphTrajectory, GlyphTree } from '@/components/us/art';
import { ProgressChart, StatCards, Streak, TodayPractice, TypePerformance } from '@/components/us/dashboard/modules';
import { buildToday, buildUsDashboard, type UsSubmissionRow } from '@/lib/us-market/dashboard';

/**
 * The landing page's product screenshot, rendered from the REAL dashboard
 * modules (components/us/dashboard/modules.tsx) rather than a picture, so it
 * can never drift from the product. The account shown is ILLUSTRATIVE and is
 * labelled as such on the page; the whole frame is inert (no focus, no
 * clicks) so none of its links can be followed.
 *
 * Today's items are real bank cases (US-C-01, US-G-01) with their real
 * metadata; the practice history is a fixed sample.
 */

const DAY = 86400000;

function sampleSubs(now: number): UsSubmissionRow[] {
  const plan: [number, string, number | null][] = [
    // [days ago, type, score]
    [1, 'pricing', 64], [2, 'guesstimate', 81], [3, 'profitability', 83], [5, 'market entry', 76],
    [6, 'guesstimate', 72], [8, 'pricing', 60], [9, 'profitability', 79], [11, 'growth', 71],
    [13, 'guesstimate', 66], [15, 'pricing', 58], [17, 'market entry', 70], [19, 'profitability', 74],
    [22, 'operations', 69], [25, 'guesstimate', 61], [29, 'profitability', 66], [34, 'market entry', 62],
    [40, 'guesstimate', 58], [47, 'profitability', 60],
  ];
  return plan.map(([ago, type, score], i) => ({
    id: `preview-${i}`,
    case_id: `preview-case-${i}`,
    score,
    created_at: new Date(now - ago * DAY - 3600000 * 5).toISOString(),
    type,
    title: 'Sample case',
    difficulty: 'medium',
    breakdown: type === 'guesstimate' ? null : { structure: 19, quantitative: 13, synthesis: 15, business_judgment: 11, creativity: 7, presence: 8 },
    rubric: type === 'guesstimate' ? 'guesstimate' : null,
  }));
}

export default function DashboardPreview() {
  const now = Date.now();
  const subs = sampleSubs(now);
  const model = buildUsDashboard(subs, [], new Date(now));
  const todayCase = buildToday(
    { id: 'preview', title: "A Midwest grocery chain's margins have nearly halved", type: 'profitability', difficulty: 'medium', interview_meta: { est_minutes: 20, points_reward: 85, industry: 'Grocery retail' } },
    [],
  );

  const nav = [
    { Glyph: GlyphTrajectory, label: 'Dashboard', on: true },
    { Glyph: GlyphTree, label: 'Cases' },
    { Glyph: GlyphChain, label: 'Market sizing' },
    { Glyph: GlyphRubric, label: 'Progress' },
  ];

  return (
    <div {...({ inert: '' } as Record<string, string>)} aria-hidden className="pointer-events-none select-none">
      <div className="relative flex max-h-[720px] overflow-hidden bg-background lg:max-h-[820px]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-background to-transparent" />
        <aside className="hidden w-[190px] shrink-0 border-r border-border/70 bg-card px-3 py-5 md:block">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Daily</p>
          <ul className="mt-2 space-y-0.5">
            {nav.map(({ Glyph, label, on }) => (
              <li key={label} className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[12px] ${on ? 'bg-primary/[0.08] font-semibold text-primary' : 'text-muted-foreground'}`}>
                <Glyph className="h-4 w-4" /> {label}
              </li>
            ))}
          </ul>
        </aside>
        <div className="min-w-0 flex-1 px-5 py-6 sm:px-7">
          <p className="font-display text-[26px] leading-tight text-foreground">Good morning, Jordan<span className="text-primary">.</span></p>
          <p className="mt-1 text-[13px] text-muted-foreground">Let&apos;s make progress toward your goals today.</p>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
            <TodayPractice item={todayCase} />
            <Streak count={3} timestamps={model.recentTimestamps} tz="America/New_York" />
          </div>
          <StatCards model={model} className="mt-4" />
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <ProgressChart model={model} gradientId="preview-progress-fill" />
            <TypePerformance stats={[...model.byType, model.sizing]} focusType={model.nextAction?.focusType ?? null} />
          </div>
        </div>
      </div>
    </div>
  );
}
