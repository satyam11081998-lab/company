/**
 * Sample dashboard data for the logged-out PREVIEW.
 *
 * Goal: let a guest see a fully alive, intriguing dashboard — hero, readiness
 * ring, skill constellation, streak, activity — WITHOUT any database access and
 * WITHOUT touching the real dashboard code path. Everything here is static and
 * deterministic, so it can never crash a guest request.
 *
 * Design choices:
 *  - We synthesize a set of scored submissions and run the REAL pure pipeline
 *    (computeReadiness / nextAction / computeFreeQuota) so the numbers are
 *    internally consistent rather than hand-faked.
 *  - `skillGraph` is intentionally EMPTY: ConstellationSection falls back to its
 *    built-in mock constellation when the graph has no nodes, which is exactly
 *    the rich teaser we want (no skill_nodes query needed).
 *  - Counts are tuned to "established user" (casesSolved ~ 24) so DashboardClient
 *    renders the polished mid-tier layout — NOT the new-user WelcomeTour /
 *    getting-started checklist (which use localStorage and don't belong here).
 */

import type { DashboardClientProps } from '@/components/dashboard-client';
import type { ReadinessSubmission } from '@/lib/readiness';
import { computeReadiness } from '@/lib/readiness';
import { nextAction, computeFreeQuota } from '@/lib/next-action';

const DEMO_CASE_TYPES = ['profitability', 'market_sizing', 'growth', 'market entry', 'pricing'] as const;

/** Build ~24 scored submissions trending upward over the last ~40 days. */
function sampleSubmissions(): ReadinessSubmission[] {
  const out: any[] = [];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  // Gentle upward trajectory 58 → 84 with mild noise.
  const scores = [58, 55, 62, 60, 67, 64, 66, 70, 68, 72, 71, 75, 73, 78, 74, 80, 77, 82, 79, 83, 81, 84, 80, 85];
  scores.forEach((score, i) => {
    const type = DEMO_CASE_TYPES[i % DEMO_CASE_TYPES.length];
    const difficulty = i % 3 === 0 ? 'hard' : i % 3 === 1 ? 'medium' : 'easy';
    // feedback_json.breakdown = earned points per 6-dim rubric, scaled from score.
    const f = score / 100;
    out.push({
      id: `demo-sub-${i}`,
      user_id: 'demo',
      case_id: `demo-case-${i}`,
      answer_text: 'Sample answer for preview.',
      score,
      feedback_json: {
        breakdown: {
          structure: Math.round(25 * f),
          quantitative: Math.round(20 * f),
          synthesis: Math.round(20 * f),
          business_judgment: Math.round(15 * f),
          creativity: Math.round(10 * f),
          presence: Math.round(10 * f),
        },
      },
      created_at: new Date(now - (scores.length - i) * 1.6 * DAY).toISOString(),
      case_type: type,
      case_difficulty: difficulty,
      is_first_attempt: true,
    });
  });
  return out as unknown as ReadinessSubmission[];
}

/** A believable 12-week activity heatmap (7 rows/day × 12 cols/week). */
function sampleHeatmap() {
  const weeks: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const col: number[] = [];
    for (let d = 0; d < 7; d++) {
      // Denser toward recent weeks; occasional rest days.
      const base = w >= 8 ? 3 : w >= 5 ? 2 : 1;
      const jitter = (w * 7 + d) % 4;
      col.push(jitter === 0 ? 0 : Math.min(4, base + (jitter % 2)));
    }
    weeks.push(col);
  }
  return { weeks, totalCases: 24, maxStreak: 12, weeklyCadence: 5, cohortCadence: 3 };
}

/**
 * Full DashboardClientProps for the guest preview. Pure + synchronous.
 */
export function buildGuestDashboardProps(): DashboardClientProps {
  const submissions = sampleSubmissions();
  const streak = 12;
  const tier = 'free' as const;

  const readiness = computeReadiness({ submissions, streak });
  const action = nextAction(readiness, tier);
  const quota = computeFreeQuota(tier, submissions);

  const trajectory = submissions
    .filter((s) => s.score != null && s.case_type !== 'guesstimate')
    .map((s) => s.score as number);

  const scored = submissions.filter((s) => s.score != null && s.case_type !== 'guesstimate');
  const avgScore = scored.length
    ? Math.round(scored.reduce((a, s) => a + (s.score as number), 0) / scored.length)
    : null;

  return {
    userName: 'there',
    points: 6240,
    readiness,
    action,
    quota,
    benchmark: { structure: 18, quantitative: 14, synthesis: 15, business_judgment: 11, creativity: 7, presence: 8 },
    trajectory,
    submissions,
    rankNum: 214,
    totalUsers: 8214,
    percentile: 97,
    avgScore,
    streak,
    initialDaily: null,
    guesstimateSkills: { scoping: 4, structure: 4, segmentation: 3, arithmetic: 4, sanity: 3 },
    guesstimateCount: 9,
    heatmap: sampleHeatmap(),
    growthDeltas: [
      { l: 'Structure', v: 82, d: 6, c: 'var(--green)' },
      { l: 'Quant', v: 74, d: 4, c: 'var(--green)' },
      { l: 'Synthesis', v: 78, d: -2, c: 'var(--red)' },
    ],
    activityFeed: [
      { id: 'a1', title: 'Why is HDFC Life’s combined ratio creeping up?', domain: 'Profitability', when: '5h', duration: '22m', score: 84, cluster: 'prof' },
      { id: 'a2', title: 'Size the at-home fitness equipment market', domain: 'Market Sizing', when: '1d', duration: '18m', score: 80, cluster: 'size' },
      { id: 'a3', title: 'Should a D2C brand enter quick-commerce?', domain: 'Market Entry', when: '2d', duration: '25m', score: 77, cluster: 'ent' },
    ],
    peerProximity: { competitor: null, newAspirantsThisWeek: 37 },
    proofRail: { names: ['Aarav', 'Diya', 'Kabir', 'Ananya', 'Vivaan'], totalStartedToday: 128 },
    // Empty → ConstellationSection renders its built-in mock constellation.
    skillGraph: {
      nodes: [],
      edges: [],
      counts: { done: 0, active: 0, next: 0, locked: 0 },
      weakestCluster: null,
      activeEdges: [],
      todayBossNodeId: null,
      clusterCaseCounts: {},
    },
    nodeTargets: new Map(),
    todayMeta: {
      casePick: {
        id: '',
        title: 'Why is HDFC Life’s combined ratio creeping up?',
        cluster: 'Profitability',
        difficulty: 'Hard',
        minutes: 25,
        firm: 'BCG',
        round: 'partner round',
        pointsReward: 85,
        streakBoost: 25,
      },
    },
  };
}
