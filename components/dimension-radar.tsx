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
  const CX = 130;
  const CY = 130; 
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
    <div className="relative w-full max-w-[280px] mx-auto pb-4 pt-2">
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
          0% { opacity: 0; transform: scale(0.96); transform-origin: ${CX}px ${CY}px; }
          100% { opacity: 1; transform: scale(1); transform-origin: ${CX}px ${CY}px; }
        }
        .animate-polygon {
          animation: fadeScale 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards 200ms;
          opacity: 0;
        }
      `}</style>
      
      <svg viewBox="0 0 260 270" width="100%" className="block overflow-visible">
        <defs>
          <linearGradient id="radar-fill-user" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid hexagons */}
        {gridLevels.map(level => (
          <path 
            key={`grid-${level}`} 
            d={toD(dims.map((_, i) => pt(i, level)))}
            fill="none" 
            stroke="hsl(var(--border))" 
            strokeOpacity="0.6"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        ))}

        {/* Axis lines (Animated) */}
        {dims.map((_, i) => {
          const outer = pt(i, 1);
          return (
            <line 
              key={`axis-${i}`} 
              x1={CX} y1={CY} 
              x2={outer.x} y2={outer.y}
              stroke="hsl(var(--border))" 
              strokeOpacity="0.6"
              strokeWidth="1" 
              className={mounted ? "axis-line" : ""}
            />
          );
        })}

        {/* Axis Labels (Sleek Pills) on Top Axis */}
        {gridLevels.map(level => {
          const p = pt(0, level);
          const valText = `${level * 100}%`;
          return (
            <g key={`label-${level}`} className="pointer-events-none">
              <rect
                x={p.x - 14}
                y={p.y - 7}
                width={28}
                height={14}
                rx={7}
                fill="hsl(var(--muted))"
              />
              <text
                x={p.x}
                y={p.y + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight="500"
                fill="hsl(var(--muted-foreground))"
              >
                {valText}
              </text>
            </g>
          );
        })}

        {/* Benchmark Polygon (Dark Solid Outline, No Fill) */}
        {hasBench && (
          <path 
            d={toD(benchPts)} 
            fill="transparent"
            stroke="hsl(var(--foreground))" 
            strokeWidth="1.2" 
            strokeLinejoin="round"
            className={mounted ? "animate-polygon drop-shadow-sm" : "opacity-0"}
          />
        )}

        {/* User Polygon (Primary Color with Translucent Fill) */}
        {hasData ? (
          <g className={mounted ? "animate-polygon drop-shadow-sm" : "opacity-0"}>
            <path 
              d={toD(userPts)} 
              fill="url(#radar-fill-user)"
              stroke="hsl(var(--primary))" 
              strokeWidth="1.5" 
              strokeLinejoin="round" 
            />
            {/* Invisible Hit Zones for Hover (No visible dots!) */}
            {userPts.map((p, i) => {
              const d = dims[i];
              return (
                <circle 
                  key={`u-${i}`} 
                  cx={p.x} cy={p.y} r="14"
                  fill="transparent" 
                  className="cursor-pointer touch-action-none"
                  onMouseEnter={() => setHoverNode({
                    label: d.label,
                    userScore: breakdown?.[d.key] ?? 0,
                    benchScore: benchmark?.[d.key] ?? 0,
                    max: d.max,
                    x: p.x,
                    y: p.y
                  })}
                  onMouseLeave={() => setHoverNode(null)}
                  onClick={() => setHoverNode({
                    label: d.label,
                    userScore: breakdown?.[d.key] ?? 0,
                    benchScore: benchmark?.[d.key] ?? 0,
                    max: d.max,
                    x: p.x,
                    y: p.y
                  })}
                />
              );
            })}
          </g>
        ) : (
          <text 
            x={CX} y={CY + 15} 
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="11" 
            fontWeight="400"
            fill="hsl(var(--muted-foreground))"
          >
            Submit a case to view
          </text>
        )}

        {/* Dimension labels outside the grid */}
        {dims.map((d, i) => {
          const lp = pt(i, 1.25);
          const a = (i * (2 * Math.PI / N)) - Math.PI / 2;
          const isTopOrBottom = Math.abs(Math.cos(a)) < 0.1;
          const textAnchor = isTopOrBottom ? 'middle' : (lp.x < CX ? 'end' : 'start');
          const dy = isTopOrBottom ? (lp.y < CY ? -8 : 8) : 0;

          return (
            <text 
              key={`dim-${i}`} 
              x={lp.x} 
              y={lp.y + dy} 
              textAnchor={textAnchor}
              dominantBaseline="middle" 
              fontSize="10" 
              fontWeight="500"
              fill="hsl(var(--muted-foreground))"
              className="transition-colors opacity-80"
            >
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      {(hasData || hasBench) && (
        <div className="absolute bottom-0 left-0 w-full flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))] opacity-80" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">You</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border-[1.5px] border-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Top 10%</span>
          </div>
        </div>
      )}

      {/* Tooltip HTML Overlay */}
      {hoverNode && (
        <div 
          className="absolute z-50 pointer-events-none bg-background/95 backdrop-blur-md border border-border shadow-lg rounded-md p-2.5 text-xs transform -translate-x-1/2 -translate-y-[120%] animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            left: `${(hoverNode.x / 260) * 100}%`, 
            top: `${(hoverNode.y / 270) * 100}%` 
          }}
        >
          <p className="font-medium text-foreground mb-1.5 border-b border-border pb-1">{hoverNode.label}</p>
          <div className="flex items-center justify-between gap-5">
            <span className="text-muted-foreground font-medium text-[10px] uppercase">You:</span>
            <span className="font-mono font-medium text-primary text-[11px]">
              {hoverNode.userScore.toFixed(1)} <span className="text-[9px] text-muted-foreground font-normal">/ {hoverNode.max}</span>
            </span>
          </div>
          {hasBench && (
            <div className="flex items-center justify-between gap-5 mt-1">
              <span className="text-muted-foreground font-medium text-[10px] uppercase">Top 10%:</span>
              <span className="font-mono font-medium text-foreground text-[11px]">
                {hoverNode.benchScore.toFixed(1)} <span className="text-[9px] text-muted-foreground font-normal">/ {hoverNode.max}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
