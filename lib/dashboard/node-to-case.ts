import { SupabaseClient } from '@supabase/supabase-js';

export interface NodeOpenTarget {
  kind: 'case' | 'learn' | 'locked';
  href: string;
  resumeHint?: string;
}

// Cluster → casebook page slug (consumed by /learn/casebook/[[...slug]]).
// Mirrors components/dashboard/constellation.tsx's CLUSTER_TO_CASEBOOK_SLUG —
// keep both in sync. Owner directive: "Read the brief" lands in
// /learn/casebook/* (the new build), never in the older /learn/[slug] toolkit
// route. For clusters without a dedicated framework page (size, ops),
// fall back to a "getting started" overview so the click is never dead.
const CLUSTER_TO_CASEBOOK_SLUG: Record<string, string> = {
  prof: 'core-frameworks/profitability',
  size: 'getting-started/six-case-types',
  pri: 'core-frameworks/pricing',
  ent: 'core-frameworks/market-entry',
  ma: 'core-frameworks/m-and-a',
  ops: 'getting-started/six-case-types',
  soft: 'core-frameworks/structuring-fundamentals',
};

// Cluster → case_type the practice page can filter on. The valid case_types
// per lib/constants.ts CASE_TYPES are: profitability, market_sizing, growth,
// guesstimate. Clusters without a matching case_type (pri, ma, ops, soft) use
// the cluster query param instead so the practice-hub filter still works.
const CLUSTER_TO_CASE_TYPE: Record<string, string | null> = {
  prof: 'profitability',
  size: 'market_sizing',
  pri: null,
  ent: 'growth',
  ma: null,
  ops: null,
  soft: null,
};

function casebookHref(cluster: string): string {
  return `/learn/casebook/${CLUSTER_TO_CASEBOOK_SLUG[cluster] || 'getting-started/what-it-tests'}`;
}

function practiceHref(cluster: string): string {
  // Always pass cluster=<cluster> — practice-hub now filters by
  // cases.skill_cluster. Also pass type=<case_type> when there's a matching
  // case_type so the URL is self-explanatory and existing analytics keep
  // working.
  const type = CLUSTER_TO_CASE_TYPE[cluster];
  const params = new URLSearchParams({ cluster });
  if (type) params.set('type', type);
  return `/practice?${params.toString()}`;
}

export async function getNodeOpenTargets(
  supabase: SupabaseClient, 
  userId: string, 
  nodes: { id: string, cluster: string, state: string }[]
): Promise<Map<string, NodeOpenTarget>> {
  const result = new Map<string, NodeOpenTarget>();

  // 1. Fetch cases mapped to these nodes
  const { data: cases } = await supabase
    .from('cases')
    .select('id, skill_node, difficulty, created_at')
    .not('skill_node', 'is', null)
    .in('skill_node', nodes.map(n => n.id));

  // 2. Fetch user's attempts for these cases to find active ones
  const caseIds = (cases || []).map(c => c.id);
  const { data: attempts } = caseIds.length > 0 
    ? await supabase
      .from('attempts')
      .select('case_id, id, status, created_at, submitted_at')
      .eq('user_id', userId)
      .in('case_id', caseIds)
    : { data: [] };

  const attemptsByCase = new Map<string, any[]>();
  if (attempts) {
    for (const a of attempts) {
      if (!attemptsByCase.has(a.case_id)) attemptsByCase.set(a.case_id, []);
      attemptsByCase.get(a.case_id)!.push(a);
    }
  }

  const casesByNode = new Map<string, any[]>();
  if (cases) {
    for (const c of cases) {
      if (!casesByNode.has(c.skill_node)) casesByNode.set(c.skill_node, []);
      casesByNode.get(c.skill_node)!.push(c);
    }
  }

  for (const node of nodes) {
    // Note: even "locked" nodes get a real navigable target. The visual lock
    // state stays a soft signal (this node isn't in your active path yet),
    // but clicking still lands the user on relevant practice content so the
    // CTA isn't dead. Owner directive 2026-06-07: "Start a case here must
    // land some relevant case that the node has."
    const nodeCases = casesByNode.get(node.id) || [];

    if (nodeCases.length === 0) {
      // No case is tagged to this specific skill_node yet. Instead of dropping
      // the user on a learn page (the prior behaviour), send them to the
      // practice list filtered by the cluster's case_type so "Start a case
      // here" always lands on relevant attemptable cases. The button still
      // works the moment admin tooling tags cases — we'll switch back to the
      // tagged-case priority path automatically.
      result.set(node.id, {
        kind: 'case',
        href: practiceHref(node.cluster),
        resumeHint: 'Browse cases',
      });
      continue;
    }

    // Priority 1: Resume in-progress attempt
    let inProgressCaseId: string | null = null;
    let latestAttemptTime = 0;

    for (const c of nodeCases) {
      const atts = attemptsByCase.get(c.id) || [];
      for (const a of atts) {
        if (a.status === 'active') {
          const t = new Date(a.created_at).getTime();
          if (t > latestAttemptTime) {
            latestAttemptTime = t;
            inProgressCaseId = c.id;
          }
        }
      }
    }

    if (inProgressCaseId) {
      result.set(node.id, { kind: 'case', href: `/cases/${inProgressCaseId}`, resumeHint: 'Resume' });
      continue;
    }

    // Priority 2: Unattempted case
    const unattemptedCases = nodeCases.filter(c => {
      const atts = attemptsByCase.get(c.id) || [];
      return atts.length === 0;
    });

    if (unattemptedCases.length > 0) {
      const diffOrder: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
      unattemptedCases.sort((a, b) => {
        const dDiff = (diffOrder[a.difficulty] || 9) - (diffOrder[b.difficulty] || 9);
        if (dDiff !== 0) return dDiff;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      result.set(node.id, { kind: 'case', href: `/cases/${unattemptedCases[0].id}`, resumeHint: 'Start' });
      continue;
    }

    // Priority 3: Most recently solved case
    let mostRecentCompleted: any = null;
    let recentTime = 0;
    for (const c of nodeCases) {
      const atts = attemptsByCase.get(c.id) || [];
      for (const a of atts) {
        if (a.status === 'submitted') {
          const t = new Date(a.submitted_at || a.created_at).getTime();
          if (t > recentTime) {
            recentTime = t;
            mostRecentCompleted = c;
          }
        }
      }
    }

    if (mostRecentCompleted) {
      result.set(node.id, { kind: 'case', href: `/cases/${mostRecentCompleted.id}`, resumeHint: 'Re-attempt' });
      continue;
    }

    // Fallback if somehow nodeCases exists but no state matched
    result.set(node.id, { kind: 'learn', href: casebookHref(node.cluster), resumeHint: 'Read brief' });
  }

  return result;
}
