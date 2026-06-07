'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Check, Lock, ChevronRight, BookOpen } from 'lucide-react';
import type { CoverageCell } from '@/lib/readiness';

interface ConstellationProps {
  coverage: CoverageCell[];
  points: number; // to evaluate Pro gated nodes if needed
}

// Our real surfaces mapped to nodes.
type NodeId = 'profitability' | 'market_sizing' | 'growth' | 'guesstimate' | 'pricing' | 'market_entry' | 'ma' | 'foundations' | 'toolkit' | 'pro_content';

interface NodeDef {
  id: NodeId;
  lbl: string;
  x: number;
  y: number;
  surfaceType: 'practice' | 'guesstimate' | 'learn' | 'pro';
  href: string;
}

const NODES: NodeDef[] = [
  { id: 'foundations', lbl: 'Foundations', x: 45, y: 15, surfaceType: 'learn', href: '/learn/casebook/core-frameworks/structuring-fundamentals' },
  { id: 'profitability', lbl: 'Profitability', x: 20, y: 30, surfaceType: 'practice', href: '/practice' },
  { id: 'market_sizing', lbl: 'Market Sizing', x: 75, y: 25, surfaceType: 'practice', href: '/practice' },
  { id: 'growth', lbl: 'Growth', x: 45, y: 45, surfaceType: 'practice', href: '/practice' },
  { id: 'guesstimate', lbl: 'Guesstimates', x: 80, y: 50, surfaceType: 'guesstimate', href: '/practice?tab=guesstimates' },
  { id: 'market_entry', lbl: 'Market Entry', x: 25, y: 65, surfaceType: 'learn', href: '/learn/casebook/core-frameworks/market-entry' },
  { id: 'pricing', lbl: 'Pricing', x: 65, y: 70, surfaceType: 'learn', href: '/learn/casebook/core-frameworks/pricing' },
  { id: 'ma', lbl: 'M&A', x: 45, y: 80, surfaceType: 'learn', href: '/learn/casebook/core-frameworks/m-and-a' },
  { id: 'toolkit', lbl: 'Toolkit', x: 85, y: 80, surfaceType: 'learn', href: '/learn/casebook/toolkit/porters-five-forces' },
];

const EDGES: [NodeId, NodeId][] = [
  ['foundations', 'profitability'],
  ['foundations', 'market_sizing'],
  ['foundations', 'growth'],
  ['profitability', 'market_entry'],
  ['market_sizing', 'guesstimate'],
  ['market_sizing', 'pricing'],
  ['growth', 'market_entry'],
  ['growth', 'pricing'],
  ['pricing', 'ma'],
  ['market_entry', 'ma'],
  ['pricing', 'toolkit'],
];

type NodeState = 'done' | 'active' | 'next' | 'locked' | 'learn';

export function SkillConstellation({ coverage, points }: ConstellationProps) {
  const [hover, setHover] = useState<NodeId | null>(null);
  const [selected, setSelected] = useState<NodeId>('profitability');

  // Derive state for practice nodes based on coverage
  const nodeStates = useMemo(() => {
    const states: Record<NodeId, NodeState> = {} as any;
    
    // Default everything to learn or locked
    for (const n of NODES) {
      if (n.surfaceType === 'learn') {
        states[n.id] = 'learn';
      } else if (n.surfaceType === 'guesstimate') {
        states[n.id] = 'active'; // Guesstimate is always active/available
      } else if (n.surfaceType === 'practice') {
        // Derive from coverage
        // caseType in db: 'profitability', 'market_sizing', 'growth'
        const matchingCells = coverage.filter(c => c.caseType === n.id);
        if (!matchingCells.length) {
          states[n.id] = 'next';
          continue;
        }
        const hasCovered = matchingCells.some(c => c.state === 'covered');
        const hasAttempted = matchingCells.some(c => c.state === 'attempted');
        if (hasCovered) states[n.id] = 'done';
        else if (hasAttempted) states[n.id] = 'active';
        else states[n.id] = 'next';
      }
    }
    return states;
  }, [coverage]);

  const nodesWithState = NODES.map(n => ({ ...n, s: nodeStates[n.id] }));
  const activeNode = nodesWithState.find(n => n.id === (hover || selected)) || nodesWithState.find(n => n.id === 'profitability') || nodesWithState[0];

  const counts = useMemo(() => {
    const c = { done: 0, active: 0, next: 0, learn: 0 };
    nodesWithState.forEach(n => {
      if (n.s === 'done') c.done++;
      if (n.s === 'active') c.active++;
      if (n.s === 'next') c.next++;
      if (n.s === 'learn') c.learn++;
    });
    return c;
  }, [nodesWithState]);

  return (
    <div className="ui-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-[28px] py-[22px]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-label text-muted-foreground">Skill Constellation</h2>
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            <b className="text-foreground">{counts.done} mastered</b> · {counts.active} in progress · {counts.learn} learn · {counts.next} next
          </div>
        </div>
      </div>

      <div className="flex min-h-[520px] flex-col md:grid md:grid-cols-[1fr_320px]">
        {/* MAP */}
        <div className="relative min-h-[300px] overflow-hidden" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--card)) 0%, hsl(var(--background)) 60%, hsl(var(--secondary)) 100%)' }}>
          {/* dot grid */}
          <svg width="100%" height="100%" className="absolute inset-0 opacity-50">
            <defs>
              <pattern id="fp-dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="hsl(var(--muted-foreground))" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#fp-dots)" />
          </svg>

          {/* edges */}
          <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {EDGES.map(([a, b], i) => {
              const na = nodesWithState.find(n => n.id === a);
              const nb = nodesWithState.find(n => n.id === b);
              if (!na || !nb) return null;
              const lit = (na.s === 'done' || na.s === 'active' || na.s === 'learn') && (nb.s === 'done' || nb.s === 'active' || nb.s === 'learn');
              return (
                <line
                  key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={lit ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={lit ? 0.2 : 0.15}
                  opacity={lit ? 0.4 : 0.6}
                  strokeDasharray={lit ? '0' : '0.4 0.4'}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {/* nodes */}
          {nodesWithState.map(n => {
            const sz = n.s === 'done' ? 28 : n.s === 'active' || n.s === 'learn' ? 24 : 18;
            const bg = n.s === 'done' ? 'hsl(var(--primary))' : n.s === 'active' ? 'hsl(var(--card))' : n.s === 'learn' ? 'hsl(var(--navy))' : 'hsl(var(--secondary))';
            const border = n.s === 'done' ? 'hsl(var(--primary))' : n.s === 'active' ? 'hsl(var(--primary))' : n.s === 'learn' ? 'hsl(var(--navy-mid))' : 'hsl(var(--border-strong))';
            const isSel = (hover || selected) === n.id;

            return (
              <div
                key={n.id}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(n.id)}
                className="absolute flex cursor-pointer flex-col items-center gap-1.5 transition-opacity duration-200"
                style={{ left: `${n.x}%`, top: `${n.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {/* OVAL FIX: The pulsing halo is implemented as an HTML element behind the node with equal width/height so it forms a perfect circle instead of an ellipse. */}
                {isSel && (
                  <div
                    className="absolute"
                    style={{
                      width: sz * 2.5,
                      height: sz * 2.5,
                      borderRadius: 999,
                      background: 'radial-gradient(circle, rgba(200,16,46,0.16) 0%, rgba(200,16,46,0) 68%)',
                      border: '1px dashed rgba(200,16,46,0.3)',
                      animation: 'fp-halo 3s ease-in-out infinite',
                      pointerEvents: 'none',
                      zIndex: 0
                    }}
                  />
                )}
                
                <div
                  className="relative z-10 flex items-center justify-center rounded-full transition-all duration-250"
                  style={{
                    width: sz, height: sz, background: bg, border: `2px solid ${border}`,
                    boxShadow: isSel ? `0 0 0 4px rgba(200,16,46,0.18), 0 6px 20px rgba(0,0,0,0.08)` : 'none',
                    color: n.s === 'done' || n.s === 'learn' ? 'white' : 'hsl(var(--primary))',
                  }}
                >
                  {n.s === 'done' && <Check className="h-3 w-3" />}
                  {n.s === 'active' && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  {n.s === 'learn' && <BookOpen className="h-3 w-3" />}
                  {n.s === 'next' && <div className="h-1 w-1 rounded-full bg-muted-foreground" />}
                </div>
                
                <div
                  className="relative z-10 whitespace-nowrap rounded-[4px] px-2 py-[2px] text-[10.5px]"
                  style={{
                    fontWeight: isSel ? 600 : 500,
                    color: 'hsl(var(--foreground))',
                    background: isSel ? 'hsl(var(--card))' : 'transparent',
                    border: isSel ? '1px solid hsl(var(--border))' : '1px solid transparent',
                    pointerEvents: 'none'
                  }}
                >
                  {n.lbl}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3.5 left-3.5 flex items-center gap-3.5 rounded-lg border border-border bg-card px-3 py-1.5 text-[10.5px] text-muted-foreground shadow-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Mastered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border-2 border-primary" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border-2 border-navy bg-navy" /> Learn
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border-2 border-border-strong" /> Next
            </span>
          </div>
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-[18px] border-t border-border bg-card p-[22px] md:border-l md:border-t-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: activeNode.surfaceType === 'learn' ? 'hsl(var(--navy))' : 'hsl(var(--primary))' }} />
              <span className="text-label text-muted-foreground uppercase">{activeNode.surfaceType === 'practice' ? 'Practice' : activeNode.surfaceType === 'learn' ? 'Learn' : activeNode.surfaceType}</span>
            </div>
            <h2 className="mt-2.5 font-serif text-[26px] font-bold leading-[1.15] tracking-tight text-foreground">
              {activeNode.lbl}
            </h2>
            <p className="mt-2 text-[12.5px] leading-[1.5] text-muted-foreground">
              {activeNode.surfaceType === 'learn'
                ? "Read the casebook chapter to master these concepts."
                : activeNode.s === 'done' 
                  ? "Cleared. You have successfully solved cases in this domain." 
                  : activeNode.s === 'active' 
                    ? "In progress. Keep practicing to build readiness." 
                    : "Unlocks fully after covering previous nodes."}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Link href={activeNode.href} className="btn-primary flex justify-center py-3 text-[13px] font-semibold">
              {activeNode.surfaceType === 'learn' ? 'Read Chapter' : 'Start Practice'} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
