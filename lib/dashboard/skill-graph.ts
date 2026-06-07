import { SupabaseClient } from '@supabase/supabase-js';

// Per-node mastery snapshot from user's submissions on cases tagged with the node.
export interface SkillNodeData {
  id: string;
  x: number;
  y: number;
  lbl: string;
  cluster: string;
  s: 'done' | 'active' | 'next' | 'locked';
  boss?: boolean;
  // Real numbers — feed the side panel's "Mastery N/M" + recent attempts.
  attempts: number;       // total scored submissions for cases on this node
  best: number | null;    // best score across those submissions (0..100)
}

export type SkillEdgeData = [string, string];

export interface SkillGraphData {
  nodes: SkillNodeData[];
  edges: SkillEdgeData[];
  // Counts for the eyebrow line in the constellation header.
  counts: { done: number; active: number; next: number; locked: number };
  // Cluster where the user is weakest (lowest avg mastery ratio); HotZone halo
  // points here so the "peers gaining" attention isn't a hardcoded M&A. Null
  // when there's nothing meaningful to show (fresh user / no submissions).
  weakestCluster: string | null;
  // The user's actual learning path — edges between done/active nodes and
  // their downstream neighbors. PeerOrbit animates ONLY along these so the
  // moving dots represent where YOU are, not decorative noise.
  activeEdges: SkillEdgeData[];
  // The single node behind today's daily case, if it has skill_node set.
  // Used to fire the boss badge on the right node instead of hardcoded p4.
  todayBossNodeId: string | null;
  // Hash of cluster → number of cases available (for "lock unattemptable
  // clusters" UI). A cluster with 0 cases gets locked visually until content
  // is authored.
  clusterCaseCounts: Record<string, number>;
}

export async function getSkillGraph(
  supabase: SupabaseClient,
  userId: string,
): Promise<SkillGraphData> {
  // 1. Static topology — nodes + edges from the seeded tables.
  const [nodesRes, edgesRes] = await Promise.all([
    supabase.from('skill_nodes').select('*'),
    supabase.from('skill_edges').select('*'),
  ]);

  if (!nodesRes.data || !edgesRes.data) {
    return {
      nodes: [],
      edges: [],
      counts: { done: 0, active: 0, next: 0, locked: 0 },
      weakestCluster: null,
      activeEdges: [],
      todayBossNodeId: null,
      clusterCaseCounts: {},
    };
  }

  // 2. User's submissions joined to cases.skill_node. We need score + cluster
  //    per submission for both per-node mastery AND per-cluster aggregation.
  const { data: subs } = await supabase
    .from('submissions')
    .select('score, cases!inner(skill_node, skill_cluster)')
    .eq('user_id', userId)
    .not('cases.skill_node', 'is', null);

  // Per-node aggregates: count + max score.
  const nodeStats = new Map<string, { maxScore: number; count: number }>();
  // Per-cluster aggregates: sum/count of best-effort scores. Used to pick
  // the user's weakest cluster for the HotZone halo.
  const clusterStats = new Map<string, { sumBest: number; n: number }>();

  if (subs) {
    for (const sub of subs) {
      const c = sub.cases as any;
      const node = c?.skill_node;
      const cluster = c?.skill_cluster;
      const score = sub.score ?? 0;
      if (node) {
        const s = nodeStats.get(node) ?? { maxScore: score, count: 0 };
        s.maxScore = Math.max(s.maxScore, score);
        s.count += 1;
        nodeStats.set(node, s);
      }
      if (cluster) {
        const cs = clusterStats.get(cluster) ?? { sumBest: 0, n: 0 };
        cs.sumBest += score;
        cs.n += 1;
        clusterStats.set(cluster, cs);
      }
    }
  }

  // Mastery rule (mirrors lib/personal-stats.ts MASTERY_*): best ≥ 75 AND
  // attempts ≥ 2 — never count a single lucky run as mastery.
  const doneNodes = new Set<string>();
  const attemptedNodes = new Set<string>();
  for (const [node, stats] of nodeStats.entries()) {
    attemptedNodes.add(node);
    if (stats.maxScore >= 75 && stats.count >= 2) doneNodes.add(node);
  }

  // 3. Adjacency + incoming counts for state derivation.
  const adjacency = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();
  for (const node of nodesRes.data) {
    adjacency.set(node.id, []);
    incomingCount.set(node.id, 0);
  }
  const edges: SkillEdgeData[] = [];
  for (const edge of edgesRes.data as Array<{ src: string; dst: string }>) {
    edges.push([edge.src, edge.dst]);
    const out = adjacency.get(edge.src);
    if (out) out.push(edge.dst);
    incomingCount.set(edge.dst, (incomingCount.get(edge.dst) ?? 0) + 1);
  }

  // 4. State per node: done → active → next → locked.
  const states = new Map<string, SkillNodeData['s']>();
  for (const node of nodesRes.data) states.set(node.id, 'locked');
  for (const id of doneNodes) if (states.has(id)) states.set(id, 'done');

  const activeNodes = new Set<string>();
  // Starting nodes (no incoming) AND any node the user has touched (attempted
  // but not yet mastered) count as active — gives the map at least one
  // entry point for new users and never strands an in-progress node as locked.
  for (const node of nodesRes.data) {
    if (states.get(node.id) === 'done') continue;
    const isStart = (incomingCount.get(node.id) ?? 0) === 0;
    if (isStart || attemptedNodes.has(node.id)) {
      states.set(node.id, 'active');
      activeNodes.add(node.id);
    }
  }
  // Downstream-of-done = also active (you've earned the next rung).
  for (const id of doneNodes) {
    for (const t of adjacency.get(id) ?? []) {
      if (states.get(t) !== 'done') {
        states.set(t, 'active');
        activeNodes.add(t);
      }
    }
  }
  // Downstream-of-active (still locked) → next.
  for (const id of activeNodes) {
    for (const t of adjacency.get(id) ?? []) {
      if (states.get(t) === 'locked') states.set(t, 'next');
    }
  }

  // 5. Active learning path — edges that go from a done/active node to a
  //    done/active/next node. PeerOrbit dots ride only these so the motion
  //    means "this is where YOU are progressing", not decorative noise.
  const activeEdges: SkillEdgeData[] = [];
  for (const [src, dst] of edges) {
    const sState = states.get(src);
    const dState = states.get(dst);
    const sLit = sState === 'done' || sState === 'active';
    const dLit = dState === 'done' || dState === 'active' || dState === 'next';
    if (sLit && dLit) activeEdges.push([src, dst]);
  }
  // Cap to 3 so the screen doesn't become a swarm; pick the latest tail of
  // the path (closest to "next") for visual focus.
  const activeEdgesCapped = activeEdges.slice(-3);

  // 6. Today's boss node — read today's daily case (IST date) and pull its
  //    cases.skill_node so the boss badge appears on the right node.
  let todayBossNodeId: string | null = null;
  try {
    const istToday = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const { data: sched } = await supabase
      .from('daily_schedule')
      .select('case_id')
      .eq('scheduled_date', istToday)
      .limit(1);
    const caseId = sched?.[0]?.case_id;
    if (caseId) {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('skill_node')
        .eq('id', caseId)
        .maybeSingle();
      todayBossNodeId = (caseRow as any)?.skill_node ?? null;
    }
  } catch {
    // Daily schedule or case lookup failed — leave boss empty.
  }

  // 7. Weakest cluster — lowest avg best-score ratio. Tie-breaker: cluster
  //    with the most attempts (more data = more confident weakness signal).
  let weakestCluster: string | null = null;
  let weakestScore = Infinity;
  let weakestN = 0;
  for (const [cluster, st] of clusterStats.entries()) {
    if (st.n < 2) continue; // need at least 2 attempts before calling weak
    const avg = st.sumBest / st.n;
    if (avg < weakestScore || (avg === weakestScore && st.n > weakestN)) {
      weakestScore = avg;
      weakestN = st.n;
      weakestCluster = cluster;
    }
  }

  // 8. Per-cluster case counts — drives the "lock this cluster — no cases
  //    authored yet" affordance. Cheap, one count() per cluster bucket.
  const { data: clusterCountsRows } = await supabase
    .from('cases')
    .select('skill_cluster')
    .not('skill_cluster', 'is', null);
  const clusterCaseCounts: Record<string, number> = {};
  for (const r of (clusterCountsRows ?? []) as Array<{ skill_cluster: string }>) {
    clusterCaseCounts[r.skill_cluster] = (clusterCaseCounts[r.skill_cluster] ?? 0) + 1;
  }

  // 9. Counts + final shape.
  const counts = { done: 0, active: 0, next: 0, locked: 0 };
  const resultNodes: SkillNodeData[] = nodesRes.data.map((n: any) => {
    const state = states.get(n.id) ?? 'locked';
    counts[state] += 1;
    const stats = nodeStats.get(n.id);
    return {
      id: n.id,
      x: Number(n.display_x),
      y: Number(n.display_y),
      lbl: n.label,
      cluster: n.cluster,
      s: state,
      boss: n.id === todayBossNodeId ? true : !!n.is_boss,
      attempts: stats?.count ?? 0,
      best: stats?.maxScore ?? null,
    };
  });

  return {
    nodes: resultNodes,
    edges,
    counts,
    weakestCluster,
    activeEdges: activeEdgesCapped,
    todayBossNodeId,
    clusterCaseCounts,
  };
}
