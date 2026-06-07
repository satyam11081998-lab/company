'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Bolt, Lock, Arrow, Play } from './icons';
import { useIsMobile } from '@/hooks/use-is-mobile';
import {
  BossCountdown,
  PeerOrbit,
  HotZone,
  PremiumGhostStrip,
  UnlockTeaser,
} from './fomo';

/* ─────────────── Types ─────────────── */

interface NodeData {
  id: string;
  x: number;
  y: number;
  lbl: string;
  cluster: string;
  s: 'done' | 'active' | 'next' | 'locked';
  boss?: boolean;
}

type Edge = [string, string];

interface ClusterInfo {
  name: string;
  color: string;
}



interface LegendDotProps {
  color: string;
  filled?: boolean;
  ring?: boolean;
  label: string;
}

/* ─────────────── Data ─────────────── */

export const NODES: NodeData[] = [
  { id: 'p1', x: 14, y: 22, lbl: 'P&L drivers', cluster: 'prof', s: 'done' },
  { id: 'p2', x: 22, y: 14, lbl: 'Cost structure', cluster: 'prof', s: 'done' },
  { id: 'p3', x: 30, y: 26, lbl: 'Margin defense', cluster: 'prof', s: 'done' },
  { id: 'p4', x: 18, y: 34, lbl: 'Combined ratio', cluster: 'prof', s: 'active', boss: true },
  { id: 's1', x: 60, y: 14, lbl: 'Top-down', cluster: 'size', s: 'done' },
  { id: 's2', x: 70, y: 20, lbl: 'Bottom-up', cluster: 'size', s: 'done' },
  { id: 's3', x: 78, y: 12, lbl: 'Sanity checks', cluster: 'size', s: 'active' },
  { id: 's4', x: 84, y: 26, lbl: 'Cross-validation', cluster: 'size', s: 'next' },
  { id: 'r1', x: 76, y: 46, lbl: 'Value-based', cluster: 'pri', s: 'done' },
  { id: 'r2', x: 86, y: 54, lbl: 'Bundle pricing', cluster: 'pri', s: 'active' },
  { id: 'r3', x: 70, y: 60, lbl: 'Elasticity', cluster: 'pri', s: 'next' },
  { id: 'e1', x: 22, y: 56, lbl: 'Market attractive', cluster: 'ent', s: 'done' },
  { id: 'e2', x: 14, y: 64, lbl: 'Mode of entry', cluster: 'ent', s: 'active' },
  { id: 'e3', x: 28, y: 70, lbl: 'Competitive resp.', cluster: 'ent', s: 'next' },
  { id: 'm1', x: 44, y: 78, lbl: 'Synergies', cluster: 'ma', s: 'next' },
  { id: 'm2', x: 56, y: 80, lbl: 'Valuation', cluster: 'ma', s: 'locked' },
  { id: 'm3', x: 38, y: 86, lbl: 'Integration', cluster: 'ma', s: 'locked' },
  { id: 'o1', x: 8, y: 80, lbl: 'Throughput', cluster: 'ops', s: 'next' },
  { id: 'o2', x: 4, y: 70, lbl: 'Bottleneck', cluster: 'ops', s: 'locked' },
  { id: 'c1', x: 44, y: 22, lbl: 'Structuring', cluster: 'soft', s: 'done' },
  { id: 'c2', x: 50, y: 12, lbl: 'Communication', cluster: 'soft', s: 'done' },
  { id: 'c3', x: 38, y: 14, lbl: 'Hypothesis-led', cluster: 'soft', s: 'active' },
];

export const EDGES: Edge[] = [
  ['p1', 'p2'], ['p1', 'p3'], ['p3', 'p4'], ['p2', 'c3'], ['c3', 'c1'], ['c1', 'c2'],
  ['s1', 's2'], ['s2', 's3'], ['s2', 's4'], ['c1', 's1'],
  ['s4', 'r1'], ['r1', 'r2'], ['r2', 'r3'],
  ['p4', 'e1'], ['e1', 'e2'], ['e1', 'e3'], ['e3', 'm1'],
  ['m1', 'm2'], ['m1', 'm3'],
  ['e2', 'o1'], ['o1', 'o2'],
];

export const CLUSTERS: Record<string, ClusterInfo> = {
  prof: { name: 'Profitability', color: '#C8102E' },
  size: { name: 'Market Sizing', color: '#0F1C33' },
  pri: { name: 'Pricing', color: '#1F7A3A' },
  ent: { name: 'Market Entry', color: '#B8770D' },
  ma: { name: 'M&A', color: '#7A4FA8' },
  ops: { name: 'Operations', color: '#5C5A52' },
  soft: { name: 'Foundations', color: '#444' },
};

// Map a constellation cluster to a real casebook page slug.
// The casebook router lives at /learn/casebook/[[...slug]]; slugs come from
// lib/casebook/content/* — verified existing slugs only. For clusters that
// don't have a dedicated framework page yet (size, ops), fall back to the
// "getting started" overview so the click is never dead and never lands on
// the older /learn/[slug] toolkit page (the prior build the owner wants kept
// but explicitly NOT used as the destination for this dashboard).
export const CLUSTER_TO_CASEBOOK_SLUG: Record<string, string> = {
  prof: 'core-frameworks/profitability',
  size: 'getting-started/six-case-types',
  pri: 'core-frameworks/pricing',
  ent: 'core-frameworks/market-entry',
  ma: 'core-frameworks/m-and-a',
  ops: 'getting-started/six-case-types',
  soft: 'core-frameworks/structuring-fundamentals',
};

/* ─────────────── nodesForUser ─────────────── */

export function nodesForUser(state: string): NodeData[] {
  if (state === 'new') {
    return NODES.map((n) => {
      if (n.cluster === 'soft')
        return { ...n, s: n.id === 'c1' ? 'active' as const : 'next' as const, boss: false };
      if (n.id === 'p1') return { ...n, s: 'next' as const, boss: false };
      return { ...n, s: 'locked' as const, boss: false };
    });
  }
  if (state === 'power') {
    return NODES.map((n) => {
      if (n.cluster === 'ma' && n.id !== 'm1')
        return { ...n, s: 'active' as const, boss: false };
      if (n.id === 'm1') return { ...n, s: 'active' as const, boss: true };
      return { ...n, s: 'done' as const, boss: false };
    });
  }
  return NODES; // mid is baseline
}

/* ─────────────── LegendDot ─────────────── */

export function LegendDot({ color, filled, ring, label }: LegendDotProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 9,
          height: 9,
          borderRadius: 999,
          background: filled ? color : 'transparent',
          border: ring ? `2px solid ${color}` : 'none',
        }}
      />
      {label}
    </span>
  );
}

/* ─────────────── ConstellationSection ─────────────── */

interface ConstellationSectionProps {
  u: import('./hero').UserVariant;
  filter: string;
  userState: string;
  skillGraph?: import('@/lib/dashboard/skill-graph').SkillGraphData;
  nodeTargets?: Map<string, import('@/lib/dashboard/node-to-case').NodeOpenTarget>;
  // Personal recent feed — used to populate "Recent attempts" in the side
  // panel, filtered by the selected node's cluster.
  recentFeed?: import('@/lib/dashboard/recent').ActivityItem[];
}

export function ConstellationSection({ u, filter, userState, skillGraph, nodeTargets, recentFeed }: ConstellationSectionProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(() =>
    userState === 'new' ? 'c1' : userState === 'power' ? 'm1' : 'p4'
  );

  // Bug fix: empty array `[]` is truthy in JS, so a `|| fallback` lets the empty
  // DB result through and renders nothing. Use explicit length checks so the
  // mock fallback fires whenever the skill_nodes/skill_edges tables are empty
  // (e.g. seed-skill-graph.sql hasn't been run yet).
  const nodesToRender =
    skillGraph?.nodes && skillGraph.nodes.length > 0 ? skillGraph.nodes : nodesForUser(userState);
  const edgesToRender =
    skillGraph?.edges && skillGraph.edges.length > 0 ? skillGraph.edges : EDGES;
  
  const selNode = (nodesToRender as any[]).find((n) => n.id === (hover || selected)) || nodesToRender[0];

  // counts for the eyebrow. Prefer the server-computed counts (which match
  // exactly what the user clicked) over a re-derivation. Falls back when the
  // mock graph is rendering.
  const counts = useMemo(() => {
    if (skillGraph?.counts) return skillGraph.counts;
    const c: Record<string, number> = { done: 0, active: 0, next: 0, locked: 0 };
    for (const n of nodesToRender as any[]) c[n.s] = (c[n.s] || 0) + 1;
    return c;
  }, [nodesToRender, skillGraph?.counts]);

  // Weakest cluster — surfaced as the "peers gaining" hot zone badge.
  // Falls back to a friendly default when there's no signal yet (cold start).
  const weakestCluster = skillGraph?.weakestCluster ?? null;
  const weakestClusterName = weakestCluster
    ? CLUSTERS[weakestCluster as keyof typeof CLUSTERS]?.name
    : null;

  // Cluster case counts — drives the "no cases authored yet" lock per
  // cluster, so users don't bounce into empty practice lists.
  const clusterCaseCounts = skillGraph?.clusterCaseCounts ?? {};

  // Active learning path — fed straight into PeerOrbit so the moving dots
  // ride only the edges connecting the user's done/active nodes to their
  // downstream neighbors. No more decorative top-left swarm.
  const activeEdges = skillGraph?.activeEdges ?? [];

  // Recent attempts filtered by the selected node's cluster — for the
  // side-panel "Recent attempts" list. Up to 3 items.
  const recentInCluster = useMemo(() => {
    if (!recentFeed || !selNode) return [];
    return recentFeed
      .filter((a) => a.cluster === selNode.cluster)
      .slice(0, 3);
  }, [recentFeed, selNode]);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div className="eyebrow">Skill constellation</div>
            <BossCountdown />
            {/* "Weakest cluster" badge — points the user to where their
                avg score is lowest. Replaces the hardcoded M&A pill. */}
            {weakestClusterName ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: 'rgba(184,119,13,0.10)',
                  border: '1px solid rgba(184,119,13,0.28)',
                  fontSize: 10.5,
                  color: 'var(--amber)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: 'var(--amber)',
                    animation: 'pulse-soft 2s ease-in-out infinite',
                  }}
                />
                {weakestClusterName} · weakest right now
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            <b style={{ color: 'var(--ink)' }}>{counts.done} mastered</b> · {counts.active} in
            progress · {counts.next} next · {counts.locked} locked
          </div>
          {/* One-line explainer so users understand the map's grammar without
              an onboarding tooltip. */}
          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 6, lineHeight: 1.4 }}>
            Solid dots are clusters you&apos;ve cleared. Hollow rings are open or next.
            Click any node to start a case in that skill.
          </div>
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          {Object.entries(CLUSTERS).map(([k, c]) => {
            const active = filter === 'all' || filter === k;
            return (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: active ? 'var(--card)' : 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  fontSize: 11,
                  color: active ? 'var(--ink-2)' : 'var(--ink-4)',
                  opacity: active ? 1 : 0.5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 999, background: c.color }} />
                {c.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Aspect-ratio math after page-width bump (max-w-6xl → max-w-7xl):
          map area is now ~888px wide × 600px tall ≈ 1.48 aspect, matching
          the original ~1.46. Node coordinates are percentages so they
          re-flow correctly. Side panel stays at 320px (text-density bound,
          shouldn't stretch).
          On mobile: stack — map on top (shorter, fits viewport), side panel
          below as a regular vertical card. */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
        minHeight: isMobile ? 'auto' : 600,
      }}>
        {/* MAP */}
        <div
          style={{
            position: 'relative',
            background:
              'radial-gradient(circle at 50% 50%, #FFFFFF 0%, var(--bg) 60%, var(--bg-2) 100%)',
            overflow: 'hidden',
            // On mobile the parent grid stacks, so the map needs its own
            // height. 420px keeps the 22-node layout legible without the
            // user having to scroll horizontally.
            height: isMobile ? 420 : undefined,
          }}
        >
          {/* Background math grid — tight Cartesian dot pattern at low
              opacity so the constellation reads as plotted on graph paper.
              Two layers: a fine 16px sub-grid + a stronger 64px major-grid
              dot. Numbers are pixel-space (patternUnits=userSpaceOnUse), so
              spacing stays constant regardless of card size. */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0, opacity: 0.32 }}
            aria-hidden="true"
          >
            <defs>
              <pattern id="fp-dots-minor" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.5" fill="var(--line-2)" />
              </pattern>
              <pattern id="fp-dots-major" width="64" height="64" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="var(--line-2)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp-dots-minor)" />
            <rect width="100%" height="100%" fill="url(#fp-dots-major)" />
          </svg>

          {/* edges */}
          <svg
            width="100%"
            height="100%"
            style={{ position: 'absolute', inset: 0 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Hot zone halo — wraps the user's weakest cluster. Skipped
                when there's no signal yet (fresh user with no attempts). */}
            {weakestCluster ? (
              <HotZone cluster={weakestCluster} nodes={nodesToRender as any} />
            ) : null}
            {/* PeerOrbit moved OUT of this SVG — see sibling render below.
                Reason: this SVG uses preserveAspectRatio="none" which
                stretches shapes; the orbit dots became ellipses. They're now
                CSS-animated divs that stay perfectly round. */}
            {(edgesToRender as any[]).map(([a, b]: any, i: number) => {
              const na = (nodesToRender as any[]).find((n) => n.id === a);
              const nb = (nodesToRender as any[]).find((n) => n.id === b);
              if (!na || !nb) return null;
              const dim = filter !== 'all' && na.cluster !== filter && nb.cluster !== filter;
              const lit =
                (na.s === 'done' || na.s === 'active') && (nb.s === 'done' || nb.s === 'active');
              // Owner directive 2026-06-07: lines must be GREY + dim, never
              // competing with the node colors for focus. Single neutral
              // colour for all edges; lit edges only slightly more opaque so
              // a path is still discernible without pulling attention.
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="var(--ink-4)"
                  strokeWidth={lit ? 1.2 : 1}
                  opacity={dim ? 0.1 : lit ? 0.35 : 0.22}
                  strokeDasharray={lit ? undefined : '3 4'}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* Orbit dots — siblings of the edges SVG, NOT children. Divs stay
              perfect circles in any aspect ratio. Edges are the user's REAL
              active learning path (done → active → next), not a hardcoded
              slice of the topology. Falls back to all edges when the server
              hasn't computed a path yet (cold start) so the map still feels
              alive. */}
          <PeerOrbit
            edges={(activeEdges.length > 0 ? activeEdges : edgesToRender) as any}
            nodes={nodesToRender as any}
          />

          {/* cluster labels */}
          {Object.entries(CLUSTERS).map(([k, c]) => {
            const members = (nodesToRender as any[]).filter((n) => n.cluster === k);
            if (!members.length) return null;
            const cx = members.reduce((a, n) => a + n.x, 0) / members.length;
            const cy = Math.min(...members.map((n) => n.y)) - 5;
            const dim = filter !== 'all' && k !== filter;
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -100%)',
                  fontSize: 9.5,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: c.color,
                  opacity: dim ? 0.25 : 0.6,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {c.name}
              </div>
            );
          })}

          {/* nodes */}
          {(nodesToRender as any[]).map((n) => {
            const c = CLUSTERS[n.cluster as keyof typeof CLUSTERS];
            const sz = n.boss ? 50 : n.s === 'done' ? 28 : n.s === 'active' ? 24 : 18;
            const bg =
              n.s === 'done'
                ? c.color
                : n.s === 'active'
                  ? 'var(--card)'
                  : n.s === 'next'
                    ? 'var(--card)'
                    : 'var(--bg-2)';
            const isSel = (hover || selected) === n.id;
            const dim = filter !== 'all' && n.cluster !== filter;
            const target = nodeTargets?.get(n.id);
            const href = target?.href;
            const isLocked = n.s === 'locked';
            // hasRealTarget = a routable href exists. If a node has no real
            // case mapping yet (cases.skill_node is NULL for everything in
            // this cluster), wrap in a <div> not a <Link>. Linking with
            // href='#' triggers the browser's default scroll-to-top, which
            // was the reported "auto scroll jump to top" bug.
            const hasRealTarget = !isLocked && !!href && href !== '#';

            const nodeContent = (
              <div
                className="node"
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault();
                  }
                  setSelected(n.id);
                }}
                style={{
                  position: 'absolute',
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: sz,
                  height: sz,
                  borderRadius: 999,
                  background: bg,
                  border: `${n.boss ? 3 : 2}px solid ${isLocked ? 'var(--line-2)' : c.color}`,
                  boxShadow: isSel
                    ? `0 0 0 4px rgba(200,16,46,0.18), 0 6px 20px rgba(0,0,0,0.08)`
                    : n.boss
                      ? `0 6px 28px rgba(200,16,46,0.35)`
                      : 'none',
                  display: 'grid',
                  placeItems: 'center',
                  color: n.s === 'done' ? 'white' : c.color,
                  opacity: dim ? 0.25 : isLocked ? 0.45 : 1,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition: 'all .25s',
                }}
              >
                {n.s === 'done' && <Check style={{ width: n.boss ? 20 : 12, height: n.boss ? 20 : 12 }} />}
                {n.s === 'active' && !n.boss && <div style={{ width: 7, height: 7, borderRadius: 999, background: c.color }} />}
                {n.boss && <Bolt className="ico" style={{ color: 'var(--red)' }} />}
                {n.s === 'next' && <div style={{ width: 5, height: 5, borderRadius: 999, background: 'var(--line-2)' }} />}
                {isLocked && <Lock style={{ width: 10, height: 10, color: 'var(--ink-4)' }} />}
              </div>
            );

            const labelEl = (
              <div
                style={{
                  position: 'absolute',
                  left: `${n.x}%`,
                  top: `${n.y + 4}%`,
                  transform: 'translate(-50%, 0%)',
                  fontSize: 10.5,
                  fontWeight: isSel || n.boss ? 600 : 400,
                  color: isLocked ? 'var(--ink-4)' : 'var(--ink-2)',
                  background: !isLocked && isSel ? 'var(--card)' : 'transparent',
                  padding: !isLocked && isSel ? '2px 8px' : 0,
                  borderRadius: 4,
                  border: !isLocked && isSel ? '1px solid var(--line)' : 'none',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                {n.lbl}
              </div>
            );

            // Only wrap in <Link> when we actually have a destination. Otherwise
            // render plain elements that update the side-panel selection but do
            // not navigate (and crucially do not scroll the page to the top).
            return hasRealTarget ? (
              <Link
                key={n.id}
                href={href as string}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                style={{ display: 'contents', textDecoration: 'none' }}
              >
                {nodeContent}
                {labelEl}
              </Link>
            ) : (
              <React.Fragment key={n.id}>
                {/* selection-only — no navigation, no scroll jump */}
                <div
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  style={{ display: 'contents' }}
                >
                  {nodeContent}
                  {labelEl}
                </div>
              </React.Fragment>
            );
          })}

          {/* Legend — centered along the bottom edge so it doesn't collide
              with the Operations cluster (Throughput/Bottleneck) nodes in
              the lower-left. Owner directive 2026-06-07: fix text overlap. */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 10.5,
              color: 'var(--ink-3)',
              background: 'var(--card)',
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid var(--line)',
            }}
          >
            <LegendDot color="var(--red)" filled label="Mastered" />
            <LegendDot color="var(--red)" ring label="Active" />
            <LegendDot color="var(--line-2)" ring label="Next" />
            <LegendDot color="var(--bg-2)" filled label="Locked" />
          </div>

          {/* FOMO overlays */}
          <UnlockTeaser count={counts.next || 3} />
          <PremiumGhostStrip />
        </div>

        {/* Side panel */}
        <div
          style={{
            borderLeft: '1px solid var(--line)',
            background: 'var(--card)',
            padding: '22px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: selNode ? CLUSTERS[selNode.cluster as keyof typeof CLUSTERS]?.color : 'transparent',
                }}
              />
              <span className="eyebrow">{selNode ? CLUSTERS[selNode.cluster as keyof typeof CLUSTERS]?.name : '-'}</span>
              {selNode?.boss && (
                <span className="chip red" style={{ marginLeft: 'auto' }}>
                  FOCUS · today
                </span>
              )}
            </div>
            <h2
              className="serif"
              style={{
                margin: '10px 0 0',
                fontSize: 26,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
              }}
            >
              {selNode?.lbl || 'Select a node'}
            </h2>
            {/* Real per-node description. Numbers come from skill-graph.ts
                (attempts/best per node), not hardcoded "Average 79 across 4
                cases" fiction. Falls back gracefully when a node has 0
                attempts (newcomer state). */}
            <p
              style={{
                marginTop: 8,
                fontSize: 12.5,
                color: 'var(--ink-3)',
                lineHeight: 1.5,
              }}
            >
              {(() => {
                if (!selNode) return 'Pick a node to see what it covers.';
                const clusterHasCases =
                  (clusterCaseCounts[selNode.cluster] ?? 0) > 0;
                if (!clusterHasCases) {
                  return `No cases authored for ${CLUSTERS[selNode.cluster as keyof typeof CLUSTERS]?.name} yet. Coming soon.`;
                }
                if (selNode.boss) {
                  return "Today's focus lands here. Partner-round depth — your best lever to bank streak points.";
                }
                const a = (selNode as any).attempts ?? 0;
                const b = (selNode as any).best as number | null;
                if (selNode.s === 'done') {
                  return `Cleared. Best score ${b ?? '—'} across ${a} attempt${a === 1 ? '' : 's'}.`;
                }
                if (selNode.s === 'active') {
                  return a > 0
                    ? `In progress. ${a} attempt${a === 1 ? '' : 's'} so far, best ${b ?? '—'}.`
                    : 'Open and waiting. Start your first case here.';
                }
                if (selNode.s === 'next') {
                  return 'Unlocks once you clear one parent skill.';
                }
                return 'Locked. Clear the prerequisites to unlock — or click anyway to browse cases in this cluster.';
              })()}
            </p>
          </div>

          {(() => {
            // Real mastery bar — fills proportionally to attempts on this
            // specific node, capped at MASTERY_TARGET (the count required to
            // be called "mastered" + headroom). Replaces the hardcoded
            // 4/4 / 2/3 / 0/3 strings.
            const MASTERY_TARGET = 4;
            const nodeAttempts = (selNode as any)?.attempts ?? 0;
            const filled = Math.min(MASTERY_TARGET, nodeAttempts);
            const nodeBest = (selNode as any)?.best as number | null;
            return (
              <div>
                <div className="between" style={{ marginBottom: 8 }}>
                  <span className="eyebrow">Mastery</span>
                  <span className="mono tnum" style={{ fontSize: 12 }}>
                    {filled} / {MASTERY_TARGET}
                    {nodeBest != null ? (
                      <span style={{ color: 'var(--ink-4)', marginLeft: 6 }}>
                        best {nodeBest}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2, 3].map((i) => {
                    const isFilled = i < filled;
                    const isPartial =
                      i === filled && nodeBest != null && nodeBest > 0 && filled < MASTERY_TARGET;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 7,
                          borderRadius: 4,
                          background: isFilled
                            ? 'var(--red)'
                            : isPartial
                              ? 'var(--red-soft)'
                              : 'var(--bg-2)',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Recent attempts
            </div>
            <div>
              {/* Real recent submissions in the selected node's cluster.
                  Replaces the hardcoded HDFC/ICICI/SBI mock rows. Each row
                  links to the submission's /results page. */}
              {recentInCluster.length === 0 ? (
                <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--ink-4)' }}>
                  No attempts in this cluster yet — your first one shows up here.
                </div>
              ) : (
                recentInCluster.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/results/${a.id}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 36px 36px',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                      fontSize: 12.5,
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <span style={{ color: a.score != null ? 'var(--ink)' : 'var(--ink-4)' }}>
                      {a.title}
                    </span>
                    <span
                      className="mono tnum"
                      style={{
                        textAlign: 'right',
                        color:
                          a.score != null && a.score >= 75
                            ? 'var(--green)'
                            : a.score != null
                              ? 'var(--ink)'
                              : 'var(--ink-4)',
                      }}
                    >
                      {a.score ?? '—'}
                    </span>
                    <span
                      style={{
                        textAlign: 'right',
                        fontSize: 10,
                        color: 'var(--ink-4)',
                        fontFamily: 'var(--ff-mono)',
                      }}
                    >
                      {a.when}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {selNode && (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn primary"
                style={{
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                }}
                onClick={() => {
                  // Always navigate to a real target — node-to-case guarantees
                  // a fallback /practice URL even for locked / un-tagged nodes,
                  // so the CTA is never dead. Owner directive 2026-06-07.
                  const target = nodeTargets?.get(selNode.id);
                  const href = target?.href && target.href !== '#'
                    ? target.href
                    : '/practice';
                  router.push(href);
                }}
              >
                <span>{nodeTargets?.get(selNode.id)?.resumeHint || (selNode?.boss ? "Start today's focus" : 'Start a case here')}</span>
                <Play style={{ width: 12, height: 12, fill: 'currentColor' }} />
              </button>
              <button
                className="btn"
                style={{ justifyContent: 'center', fontSize: 12.5 }}
                onClick={() => {
                  router.push(`/learn/casebook/${CLUSTER_TO_CASEBOOK_SLUG[selNode.cluster] || 'getting-started/what-it-tests'}`);
                }}
              >
                Read the brief
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
