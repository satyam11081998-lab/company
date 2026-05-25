'use client';

import React, { useState, useEffect } from 'react';
import { SCORE_DIMENSION_MAX } from '@/lib/constants';

interface DimensionRadarProps {
  breakdown?: Record<string, number>;
  benchmark?: Record<string, number>;
}

interface HoverNode {
  label: string;
  userScore: number;
  benchScore: number;
  max: number;
  x: number;
  y: number;
}

export default function DimensionRadar({ breakdown, benchmark }: DimensionRadarProps) {
  const [mounted, setMounted] = useState(false);
  const [hoverNode, setHoverNode] = useState<HoverNode | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dims = [
    { key: 'structure',   label: 'Structure',  max: SCORE_DIMENSION_MAX['structure']   ?? 25 },
    { key: 'quantitative',label: 'Quant.',     max: SCORE_DIMENSION_MAX['quantitative']?? 20 },
    { key: 'synthesis',   label: 'Synthesis',  max: SCORE_DIMENSION_MAX['synthesis']   ?? 20 },
    { key: 'business_judgment', label: 'Judgment', max: SCORE_DIMENSION_MAX['business_judgment'] ?? 15 },
    { key: 'creativity',  label: 'Creativity', max: SCORE_DIMENSION_MAX['creativity']  ?? 10 },
    { key: 'presence',    label: 'Tone',       max: SCORE_DIMENSION_MAX['presence']    ?? 10 },
  ];

  const N = dims.length;
  const CX = 140;
  const CY = 120;
  const R = 85;

  const pt = (i: number, ratio: number) => {
    const a = (i * (2 * Math.PI / N)) - Math.PI / 2;
    return { x: CX + ratio * R * Math.cos(a), y: CY + ratio * R * Math.sin(a) };
  };

  const toD = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';

  const gridLevels = [0.25, 0.5, 0.75, 1];
  
  // Ratios 
  const getRatio = (val: number, max: number) => Math.max(0, Math.min(1, val / max));
  
  const userPts = dims.map((d, i) => pt(i, getRatio(breakdown ? (breakdown[d.key] ?? 0) : 0, d.max)));
  const benchPts = dims.map((d, i) => pt(i, getRatio(benchmark ? (benchmark[d.key] ?? 0) : 0, d.max)));

  const hasData = breakdown && Object.values(breakdown).some(v => v > 0);
  const hasBench = benchmark && Object.values(benchmark).some(v => v > 0);

  return (
    <div className="relative w-full pb-6">
      <style>{`
        @keyframes drawAxis {
          0% { stroke-dashoffset: ${R}; }
          100% { stroke-dashoffset: 0; }
        }
        .axis-line {
          stroke-dasharray: ${R};
          stroke-dashoffset: ${R};
          animation: drawAxis 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeScale {
          0% { opacity: 0; transform: scale(0.9); transform-origin: ${CX}px ${CY}px; }
          100% { opacity: 1; transform: scale(1); transform-origin: ${CX}px ${CY}px; }
        }
        .animate-polygon {
          animation: fadeScale 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards 200ms;
          opacity: 0;
        }
      `}</style>
      
      <svg viewBox="0 0 280 250" width="100%" className="block overflow-visible">
        <defs>
          <linearGradient id="radar-fill-enhanced" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(356 84% 43%)" stopOpacity="0.30" />
            <stop offset="50%" stopColor="hsl(356 84% 43%)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="hsl(356 84% 43%)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid hexagons */}
        {gridLevels.map(level => (
          <path 
            key={level} 
            d={toD(dims.map((_, i) => pt(i, level)))}
            fill="none" 
            stroke="hsl(var(--border))" 
            strokeWidth="1" 
          />
        ))}

        {/* Axis lines (Animated) */}
        {dims.map((_, i) => {
          const outer = pt(i, 1);
          return (
            <line 
              key={i} 
              x1={CX} y1={CY} 
              x2={outer.x} y2={outer.y}
              stroke="hsl(var(--border))" 
              strokeWidth="1" 
              className={mounted ? "axis-line" : ""}
            />
          );
        })}

        {/* Top 10% Benchmark Polygon (No Fill, Navy Outline) */}
        {hasBench && (
          <path 
            d={toD(benchPts)} 
            fill="transparent"
            stroke="hsl(var(--navy))" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
            className={mounted ? "animate-polygon" : "opacity-0"}
          />
        )}

        {/* User Fill Polygon */}
        {hasData ? (
          <g className={mounted ? "animate-polygon" : "opacity-0"}>
            <path 
              d={toD(userPts)} 
              fill="url(#radar-fill-enhanced)"
              stroke="hsl(356 84% 43%)" 
              strokeWidth="2" 
              strokeLinejoin="round" 
            />
            {/* Interactive User Dots */}
            {userPts.map((p, i) => {
              const d = dims[i];
              return (
                <circle 
                  key={`u-${i}`} 
                  cx={p.x} cy={p.y} r="4"
                  fill="hsl(356 84% 43%)" 
                  stroke="hsl(var(--background))" 
                  strokeWidth="1.5"
                  className="cursor-pointer hover:scale-150 transition-transform origin-center"
                  onMouseEnter={() => setHoverNode({
                    label: d.label,
                    userScore: breakdown?.[d.key] ?? 0,
                    benchScore: benchmark?.[d.key] ?? 0,
                    max: d.max,
                    x: p.x,
                    y: p.y
                  })}
                  onMouseLeave={() => setHoverNode(null)}
                />
              );
            })}
          </g>
        ) : (
          <text 
            x={CX} y={CY} 
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="11" 
            fill="hsl(var(--muted-foreground))"
          >
            Submit a case to see radar
          </text>
        )}

        {/* Dimension labels with curved anchor logic */}
        {dims.map((d, i) => {
          // Slightly extend the text radius
          const lp = pt(i, 1.25);
          // Shift text slightly based on angle so it doesn't overlap perfectly vertical nodes
          const a = (i * (2 * Math.PI / N)) - Math.PI / 2;
          const isTopOrBottom = Math.abs(Math.cos(a)) < 0.1;
          const textAnchor = isTopOrBottom ? 'middle' : (lp.x < CX ? 'end' : 'start');
          const dy = isTopOrBottom ? (lp.y < CY ? -5 : 5) : 0;

          return (
            <text 
              key={i} 
              x={lp.x} 
              y={lp.y + dy} 
              textAnchor={textAnchor}
              dominantBaseline="middle" 
              fontSize="11" 
              fontWeight="600"
              fill="hsl(var(--muted-foreground))"
              className="transition-colors hover:fill-foreground"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      {(hasData || hasBench) && (
        <div className="absolute bottom-0 left-0 w-full flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/80 border border-primary" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-navy" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Top 10%</span>
          </div>
        </div>
      )}

      {/* Tooltip HTML Overlay */}
      {hoverNode && (
        <div 
          className="absolute z-50 pointer-events-none bg-background/95 backdrop-blur-sm border border-border shadow-md rounded-md p-2.5 text-xs transform -translate-x-1/2 -translate-y-[120%] animate-in fade-in zoom-in duration-150"
          style={{ 
            left: `${(hoverNode.x / 280) * 100}%`, 
            top: `${(hoverNode.y / 250) * 100}%` 
          }}
        >
          <p className="font-bold text-foreground mb-1.5 border-b border-border pb-1">{hoverNode.label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">You:</span>
            <span className="font-mono font-medium text-primary">
              {hoverNode.userScore.toFixed(1)} <span className="text-[9px] text-muted-foreground">/ {hoverNode.max}</span>
            </span>
          </div>
          {hasBench && (
            <div className="flex items-center justify-between gap-4 mt-0.5">
              <span className="text-muted-foreground">Top 10%:</span>
              <span className="font-mono font-medium text-navy">
                {hoverNode.benchScore.toFixed(1)} <span className="text-[9px] text-muted-foreground">/ {hoverNode.max}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
