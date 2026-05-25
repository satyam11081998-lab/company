'use client';

import { SVGProps } from 'react';

/** 
 * Wrapper providing standard viewBox and entry animation.
 */
function DiagramWrapper({ children, className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={`w-full max-w-[650px] mx-auto overflow-hidden rounded-xl border border-border/50 bg-muted/10 shadow-sm ${className}`}>
      <style>{`
        @keyframes diagramEnter {
          0% { opacity: 0; transform: scale(0.98) translateY(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-diagram {
          animation: diagramEnter 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .text-micro { font-size: 8.5px; font-weight: 500; letter-spacing: 0.02em; }
        .text-nano { font-size: 7px; fill: hsl(var(--muted-foreground)); }
      `}</style>
      <svg 
        viewBox="0 0 650 320" 
        className="w-full h-auto animate-diagram"
        {...props}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-navy-mid/10" strokeWidth="0.5" />
          </pattern>
          <marker id="arrow-navy" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-navy" />
          </marker>
          <marker id="arrow-primary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
          </marker>
        </defs>
        <rect width="650" height="320" fill="url(#grid)" />
        {children}
      </svg>
    </div>
  );
}

export function MECEDiagram(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      {/* Mutually Exclusive Bracket */}
      <path d="M 120 105 L 120 95 L 530 95 L 530 105 M 325 95 L 325 85" fill="none" stroke="hsl(var(--navy))" strokeWidth="1" opacity="0.4"/>
      <text x="325" y="80" textAnchor="middle" className="fill-navy font-mono text-[9px] uppercase tracking-widest">Mutually Exclusive (No Overlap)</text>

      {/* Collectively Exhaustive Bracket */}
      <path d="M 60 255 L 60 265 L 590 265 L 590 255 M 325 265 L 325 275" fill="none" stroke="hsl(356 84% 43%)" strokeWidth="1" opacity="0.4"/>
      <text x="325" y="288" textAnchor="middle" className="fill-primary font-mono text-[9px] uppercase tracking-widest">Collectively Exhaustive (No Gaps)</text>

      <g strokeWidth="1.5" className="stroke-navy/30" fill="none">
        <path d="M325 50 L160 120" />
        <path d="M325 50 L325 120" />
        <path d="M325 50 L490 120" />
        
        <path d="M160 160 L100 210" />
        <path d="M160 160 L220 210" />
        
        <path d="M325 160 L275 210" />
        <path d="M325 160 L375 210" />
        
        <path d="M490 160 L440 210" />
        <path d="M490 160 L550 210" />
      </g>
      
      <g textAnchor="middle">
        <rect x="255" y="20" width="140" height="30" rx="4" className="fill-navy" />
        <text x="325" y="39" fill="white" className="text-xs font-bold tracking-wide">Core Problem</text>
        
        {/* Branches */}
        <rect x="100" y="120" width="120" height="40" rx="4" className="fill-background stroke-navy" strokeWidth="1.5" />
        <text x="160" y="140" className="fill-navy text-xs font-bold">Category A</text>
        <text x="160" y="152" className="text-nano">e.g. Supply Side</text>
        
        <rect x="265" y="120" width="120" height="40" rx="4" className="fill-background stroke-navy" strokeWidth="1.5" />
        <text x="325" y="140" className="fill-navy text-xs font-bold">Category B</text>
        <text x="325" y="152" className="text-nano">e.g. Demand Side</text>
        
        <rect x="430" y="120" width="120" height="40" rx="4" className="fill-background stroke-navy" strokeWidth="1.5" />
        <text x="490" y="140" className="fill-navy text-xs font-bold">Category C</text>
        <text x="490" y="152" className="text-nano">e.g. External Factors</text>
        
        {/* Leaves */}
        {[[60, 210, 'A1 Driver'], [180, 210, 'A2 Driver'], [235, 210, 'B1 Driver'], [335, 210, 'B2 Driver'], [400, 210, 'C1 Driver'], [510, 210, 'C2 Driver']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="80" height="34" rx="4" className="fill-primary/5 stroke-primary/40" strokeWidth="1" />
            <text x={(x as number) + 40} y={(y as number) + 18} className="fill-foreground text-[10px] font-semibold">{label as string}</text>
            <text x={(x as number) + 40} y={(y as number) + 28} className="text-[7px] fill-primary/80 uppercase">Data Point</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

export function ProfitabilityTree(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="1.5" className="stroke-navy/30" fill="none">
        <path d="M325 60 L200 130" />
        <path d="M325 60 L450 130" />
        <path d="M200 170 L130 240" />
        <path d="M200 170 L270 240" />
        <path d="M450 170 L380 240" />
        <path d="M450 170 L520 240" />
      </g>
      
      {/* Mathematical Operators */}
      <circle cx="325" cy="100" r="12" className="fill-background stroke-navy" strokeWidth="1" />
      <text x="325" y="104" textAnchor="middle" className="fill-navy font-bold text-sm">−</text>

      <circle cx="200" cy="210" r="10" className="fill-background stroke-emerald-600" strokeWidth="1" />
      <text x="200" y="214" textAnchor="middle" className="fill-emerald-600 font-bold text-sm">×</text>

      <circle cx="450" cy="210" r="10" className="fill-background stroke-primary" strokeWidth="1" />
      <text x="450" y="214" textAnchor="middle" className="fill-primary font-bold text-sm">+</text>
      
      <g textAnchor="middle">
        {/* Root */}
        <rect x="255" y="20" width="140" height="40" rx="6" className="fill-navy" />
        <text x="325" y="40" fill="white" className="font-bold text-sm">Profit</text>
        <text x="325" y="52" fill="white" className="text-nano opacity-80">(Net Income / EBITDA)</text>
        
        {/* Level 1 */}
        <rect x="140" y="130" width="120" height="40" rx="6" className="fill-emerald-500/10 stroke-emerald-500" strokeWidth="1.5" />
        <text x="200" y="150" className="fill-emerald-700 font-bold text-sm">Revenue</text>
        <text x="200" y="162" className="fill-emerald-700/80 text-nano">(Top-line growth)</text>
        
        <rect x="390" y="130" width="120" height="40" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
        <text x="450" y="150" className="fill-primary font-bold text-sm">Costs</text>
        <text x="450" y="162" className="fill-primary/80 text-nano">(Margin compression)</text>
        
        {/* Level 2 Leaves */}
        {[[80, 240, 'Price / Unit', 'fill-emerald-700', 'Pricing strategy', 'stroke-emerald-500'], 
          [220, 240, 'Volume', 'fill-emerald-700', 'Units sold', 'stroke-emerald-500'], 
          [330, 240, 'Fixed Costs', 'fill-primary', 'Rent, SG&A', 'stroke-primary'], 
          [470, 240, 'Variable Costs', 'fill-primary', 'COGS, raw mat', 'stroke-primary']].map(([x, y, label, colorCls, sub, strokeCls], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="100" height="36" rx="4" className={`fill-background stroke-opacity-50 ${strokeCls}`} strokeWidth="1" />
            <text x={(x as number) + 50} y={(y as number) + 18} className={`${colorCls} font-bold text-[11px]`}>{label as string}</text>
            <text x={(x as number) + 50} y={(y as number) + 28} className="text-nano">{sub as string}</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

export function IssueTree(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="1.5" className="stroke-navy/30" fill="none">
        <path d="M 160 160 L 260 80" />
        <path d="M 160 160 L 260 160" />
        <path d="M 160 160 L 260 240" />
        
        <path d="M 380 80 L 460 55" markerEnd="url(#arrow-navy)" />
        <path d="M 380 80 L 460 105" markerEnd="url(#arrow-navy)" />
        
        <path d="M 380 240 L 460 215" markerEnd="url(#arrow-navy)" />
        <path d="M 380 240 L 460 265" markerEnd="url(#arrow-navy)" />
      </g>
      
      {/* "Why?" Labels */}
      <text x="210" y="110" className="fill-muted-foreground text-micro">Why?</text>
      <text x="210" y="155" className="fill-muted-foreground text-micro">Why?</text>
      <text x="210" y="210" className="fill-muted-foreground text-micro">Why?</text>
      
      <g textAnchor="middle">
        <rect x="40" y="130" width="120" height="60" rx="6" className="fill-navy" />
        <text x="100" y="155" fill="white" className="font-bold text-sm">Declining</text>
        <text x="100" y="172" fill="white" className="font-bold text-sm">Market Share</text>
        
        {/* Sub-issues */}
        {[[260, 60, 'Product Gap', 'Competitor launched X'], [260, 140, 'Pricing Issue', 'Premium pricing unviable'], [260, 220, 'Distribution', 'Lost key retail partner']].map(([x, y, label, sub], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="120" height="40" rx="4" className="fill-background stroke-primary" strokeWidth="1.5" />
            <text x={(x as number) + 60} y={(y as number) + 20} className="fill-primary font-bold text-[11px]">{label as string}</text>
            <text x={(x as number) + 60} y={(y as number) + 32} className="text-nano">{sub as string}</text>
          </g>
        ))}
        
        {/* Deep dive nodes */}
        {[[460, 40, 'Feature Parity?'], [460, 90, 'Quality Drop?'], [460, 200, 'Online Channels?'], [460, 250, 'Sales Force?']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="110" height="30" rx="2" className="fill-muted/50 stroke-border" strokeWidth="1" />
            <text x={(x as number) + 55} y={(y as number) + 19} className="fill-muted-foreground font-semibold text-[10px]">{label as string}</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

export function HypothesisDriven(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="1.5" className="stroke-navy/30" fill="none">
        <path d="M 180 80 C 230 80, 250 160, 310 160" strokeDasharray="4 4" markerEnd="url(#arrow-navy)"/>
        <path d="M 180 160 L 310 160" markerEnd="url(#arrow-navy)"/>
        <path d="M 180 240 C 230 240, 250 160, 310 160" strokeDasharray="4 4" markerEnd="url(#arrow-navy)"/>
        
        <path d="M 430 160 L 500 160" markerEnd="url(#arrow-primary)" stroke="hsl(356 84% 43%)" strokeWidth="2" />
        
        {/* Feedback Loop */}
        <path d="M 370 120 C 370 30, 120 30, 120 60" stroke="hsl(var(--navy))" strokeDasharray="3 3" markerEnd="url(#arrow-navy)" />
        <text x="245" y="40" className="fill-navy text-micro font-bold uppercase tracking-wider" textAnchor="middle">Refine Hypothesis (Iteration)</text>
      </g>
      
      <g textAnchor="middle">
        {/* Phase Labels */}
        <text x="120" y="30" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest">1. Formulate</text>
        <text x="370" y="30" className="fill-muted-foreground text-[10px] font-bold uppercase tracking-widest">2. Test</text>
        <text x="560" y="30" className="fill-primary/80 text-[10px] font-bold uppercase tracking-widest">3. Synthesize</text>

        {/* Hypotheses */}
        {[[60, 60, 'Hypothesis 1', 'Focus on Geography'], [60, 140, 'Hypothesis 2', 'Focus on Product'], [60, 220, 'Hypothesis 3', 'Focus on Operations']].map(([x, y, label, sub], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="120" height="40" rx="20" className="fill-background stroke-navy" strokeWidth="1.5" />
            <text x={(x as number) + 60} y={(y as number) + 20} className="fill-navy font-bold text-[11px]">{label as string}</text>
            <text x={(x as number) + 60} y={(y as number) + 30} className="text-nano">{sub as string}</text>
          </g>
        ))}
        
        {/* Test / Analysis */}
        <rect x="310" y="120" width="120" height="80" rx="8" className="fill-navy" />
        <text x="370" y="150" fill="white" className="font-bold text-sm">Data</text>
        <text x="370" y="165" fill="white" className="font-bold text-sm">&amp; Analysis</text>
        <text x="370" y="182" fill="white" className="text-nano opacity-80">Fact-based validation</text>
        
        {/* Conclusion */}
        <rect x="500" y="130" width="120" height="60" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="560" y="160" className="fill-primary font-bold text-[13px]">Conclusion</text>
        <text x="560" y="174" className="fill-primary/80 text-nano">Actionable Advice</text>
      </g>
    </DiagramWrapper>
  );
}

export function MintoPyramid(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g>
        {/* Flow arrows UP */}
        <path d="M 180 240 C 120 200, 150 100, 240 60" className="stroke-navy/30" strokeWidth="1.5" fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-navy)" />
        <path d="M 470 240 C 530 200, 500 100, 410 60" className="stroke-navy/30" strokeWidth="1.5" fill="none" strokeDasharray="4 4" markerEnd="url(#arrow-navy)" />
        <text x="110" y="150" textAnchor="middle" className="fill-navy/60 text-micro rotate-[-45deg]">Synthesize Up</text>
        <text x="540" y="150" textAnchor="middle" className="fill-navy/60 text-micro rotate-[45deg]">Synthesize Up</text>

        {/* Triangle Base - Split into 3 columns */}
        <path d="M 80 280 L 570 280 L 460 180 L 190 180 Z" className="fill-muted/40 stroke-border" strokeWidth="1" />
        <line x1="280" y1="280" x2="280" y2="180" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="370" y1="280" x2="370" y2="180" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 2" />
        
        <text x="185" y="215" textAnchor="middle" className="fill-muted-foreground font-bold text-xs">Dataset A</text>
        <text x="185" y="230" textAnchor="middle" className="fill-muted-foreground text-nano">Raw stats</text>
        <text x="325" y="215" textAnchor="middle" className="fill-muted-foreground font-bold text-xs">Dataset B</text>
        <text x="325" y="230" textAnchor="middle" className="fill-muted-foreground text-nano">Interviews</text>
        <text x="465" y="215" textAnchor="middle" className="fill-muted-foreground font-bold text-xs">Dataset C</text>
        <text x="465" y="230" textAnchor="middle" className="fill-muted-foreground text-nano">Financials</text>

        {/* Triangle Mid - Split into 2 arguments */}
        <path d="M 200 170 L 450 170 L 360 90 L 290 90 Z" className="fill-navy/5 stroke-navy" strokeWidth="1.5" />
        <line x1="325" y1="170" x2="325" y2="90" stroke="hsl(var(--navy))" strokeWidth="1" opacity="0.3" strokeDasharray="2 2" />
        <text x="260" y="125" textAnchor="middle" className="fill-navy font-bold text-xs">Argument 1</text>
        <text x="390" y="125" textAnchor="middle" className="fill-navy font-bold text-xs">Argument 2</text>
        
        {/* Triangle Top */}
        <path d="M 300 80 L 350 80 L 325 30 Z" className="fill-primary/20 stroke-primary" strokeWidth="1" />
        <rect x="235" y="10" width="180" height="40" rx="4" className="fill-background stroke-primary" strokeWidth="2" />
        <text x="325" y="30" textAnchor="middle" className="fill-primary font-bold text-[13px]">The "Answer First"</text>
        <text x="325" y="42" textAnchor="middle" className="text-nano fill-primary/80">Governing Thought / Executive Summary</text>
      </g>
    </DiagramWrapper>
  );
}
