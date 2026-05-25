'use client';

import { SVGProps } from 'react';

/** 
 * Wrapper providing standard viewBox and entry animation.
 * The animation uses a combination of fade and scale to feel dynamic.
 */
function DiagramWrapper({ children, className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={`w-full max-w-[600px] mx-auto overflow-hidden rounded-xl border border-border bg-muted/20 ${className}`}>
      <style>{`
        @keyframes diagramEnter {
          0% { opacity: 0; transform: scale(0.97); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-diagram {
          animation: diagramEnter 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <svg 
        viewBox="0 0 600 300" 
        className="w-full h-auto animate-diagram"
        {...props}
      >
        {/* Subtle grid background for the "technical" look */}
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" className="text-navy-mid/20" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="600" height="300" fill="url(#grid)" />
        {children}
      </svg>
    </div>
  );
}

// 1. MECE Diagram (Root -> 3 Mutually Exclusive Branches -> Leaves)
export function MECEDiagram(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="2" className="stroke-navy/30" fill="none">
        <path d="M300 60 L150 120" />
        <path d="M300 60 L300 120" />
        <path d="M300 60 L450 120" />
        
        <path d="M150 160 L100 220" />
        <path d="M150 160 L200 220" />
        
        <path d="M300 160 L260 220" />
        <path d="M300 160 L340 220" />
        
        <path d="M450 160 L400 220" />
        <path d="M450 160 L500 220" />
      </g>
      
      {/* Nodes */}
      <g className="fill-primary" textAnchor="middle" fontSize="12" fontWeight="bold">
        <rect x="230" y="20" width="140" height="40" rx="6" className="fill-navy" />
        <text x="300" y="44" fill="white">Core Problem</text>
        
        {/* Branches */}
        <rect x="90" y="120" width="120" height="40" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="150" y="144" className="fill-primary">Branch A</text>
        
        <rect x="240" y="120" width="120" height="40" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="300" y="144" className="fill-primary">Branch B</text>
        
        <rect x="390" y="120" width="120" height="40" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="450" y="144" className="fill-primary">Branch C</text>
        
        {/* Leaves */}
        {[[70, 220, 'A1'], [170, 220, 'A2'], [230, 220, 'B1'], [310, 220, 'B2'], [370, 220, 'C1'], [470, 220, 'C2']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="60" height="30" rx="4" className="fill-background stroke-navy/30" strokeWidth="1" />
            <text x={(x as number) + 30} y={(y as number) + 19} className="fill-muted-foreground text-[10px]">{label as string}</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

// 2. Profitability Tree
export function ProfitabilityTree(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="2" className="stroke-navy/30" fill="none">
        <path d="M300 60 L200 130" />
        <path d="M300 60 L400 130" />
        
        <path d="M200 170 L150 230" />
        <path d="M200 170 L250 230" />
        
        <path d="M400 170 L350 230" />
        <path d="M400 170 L450 230" />
      </g>
      
      <g textAnchor="middle" fontSize="13" fontWeight="bold">
        {/* Root */}
        <rect x="230" y="20" width="140" height="40" rx="6" className="fill-navy" />
        <text x="300" y="45" fill="white">Profit</text>
        
        {/* Level 1 */}
        <rect x="140" y="130" width="120" height="40" rx="6" className="fill-emerald-500/10 stroke-emerald-500" strokeWidth="2" />
        <text x="200" y="155" className="fill-emerald-600">Revenue</text>
        
        <rect x="340" y="130" width="120" height="40" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="400" y="155" className="fill-primary">Costs</text>
        
        {/* Level 2 */}
        {[[100, 230, 'Price', 'fill-emerald-600'], [200, 230, 'Volume', 'fill-emerald-600'], 
          [300, 230, 'Fixed', 'fill-primary'], [400, 230, 'Variable', 'fill-primary']].map(([x, y, label, colorCls], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="100" height="30" rx="4" className="fill-background stroke-navy/30" strokeWidth="1" />
            <text x={(x as number) + 50} y={(y as number) + 19} className={colorCls as string}>{label as string}</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

// 3. Issue Tree (Horizontal layout)
export function IssueTree(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="2" className="stroke-navy/30" fill="none">
        <path d="M 160 150 L 250 80" />
        <path d="M 160 150 L 250 150" />
        <path d="M 160 150 L 250 220" />
        
        <path d="M 370 80 L 440 60" />
        <path d="M 370 80 L 440 100" />
        
        <path d="M 370 220 L 440 200" />
        <path d="M 370 220 L 440 240" />
      </g>
      
      <g textAnchor="middle" fontSize="12" fontWeight="bold">
        <rect x="40" y="120" width="120" height="60" rx="6" className="fill-navy" />
        <text x="100" y="145" fill="white">Declining</text>
        <text x="100" y="160" fill="white">Market Share</text>
        
        {/* Sub-issues */}
        {[[250, 60, 'Product Gap'], [250, 130, 'Pricing'], [250, 200, 'Distribution']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="120" height="40" rx="6" className="fill-background stroke-primary" strokeWidth="2" />
            <text x={(x as number) + 60} y={(y as number) + 24} className="fill-primary">{label as string}</text>
          </g>
        ))}
        
        {/* Deep dive nodes */}
        {[[440, 45, 'Features'], [440, 85, 'Quality'], [440, 185, 'Geography'], [440, 225, 'Channels']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="100" height="30" rx="4" className="fill-muted stroke-border" strokeWidth="1" />
            <text x={(x as number) + 50} y={(y as number) + 19} className="fill-muted-foreground font-medium text-[10px]">{label as string}</text>
          </g>
        ))}
      </g>
    </DiagramWrapper>
  );
}

// 4. Hypothesis Driven
export function HypothesisDriven(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g strokeWidth="2" className="stroke-navy/30" fill="none">
        <path d="M 180 80 C 230 80, 230 150, 280 150" strokeDasharray="4 4" />
        <path d="M 180 150 L 280 150" />
        <path d="M 180 220 C 230 220, 230 150, 280 150" strokeDasharray="4 4" />
        
        <path d="M 400 150 L 460 150" markerEnd="url(#arrow)" />
        
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
          </marker>
        </defs>
      </g>
      
      <g textAnchor="middle" fontSize="12" fontWeight="bold">
        {/* Hypotheses */}
        {[[60, 60, 'Hypothesis 1'], [60, 130, 'Hypothesis 2'], [60, 200, 'Hypothesis 3']].map(([x, y, label], i) => (
          <g key={i}>
            <rect x={x as number} y={y as number} width="120" height="40" rx="20" className="fill-background stroke-navy" strokeWidth="1.5" />
            <text x={(x as number) + 60} y={(y as number) + 24} className="fill-navy">{label as string}</text>
          </g>
        ))}
        
        {/* Test / Analysis */}
        <rect x="280" y="110" width="120" height="80" rx="8" className="fill-navy" />
        <text x="340" y="145" fill="white">Data</text>
        <text x="340" y="160" fill="white">&amp; Analysis</text>
        
        {/* Conclusion */}
        <rect x="460" y="125" width="100" height="50" rx="6" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="510" y="154" className="fill-primary text-sm">Conclusion</text>
      </g>
    </DiagramWrapper>
  );
}

// 5. Minto Pyramid
export function MintoPyramid(props: SVGProps<SVGSVGElement>) {
  return (
    <DiagramWrapper {...props}>
      <g>
        {/* Triangle Base */}
        <path d="M 100 240 L 500 240 L 420 160 L 180 160 Z" className="fill-muted stroke-border" strokeWidth="2" />
        <text x="300" y="205" textAnchor="middle" className="fill-muted-foreground font-bold text-sm">Data &amp; Evidence (Base)</text>
        
        {/* Triangle Mid */}
        <path d="M 190 150 L 410 150 L 340 80 L 260 80 Z" className="fill-navy/10 stroke-navy" strokeWidth="2" />
        <text x="300" y="120" textAnchor="middle" className="fill-navy font-bold text-sm">Key Supporting Arguments</text>
        
        {/* Triangle Top */}
        <path d="M 270 70 L 330 70 L 300 30 Z" className="fill-primary stroke-primary" strokeWidth="2" />
        <rect x="230" y="10" width="140" height="30" rx="4" className="fill-background stroke-primary" strokeWidth="2" />
        <text x="300" y="30" textAnchor="middle" className="fill-primary font-bold text-sm">Core Conclusion</text>
        
        {/* Flow arrows */}
        <path d="M 230 40 C 200 60, 150 110, 120 180" className="stroke-navy/20" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        <path d="M 370 40 C 400 60, 450 110, 480 180" className="stroke-navy/20" strokeWidth="2" fill="none" strokeDasharray="4 4" />
      </g>
    </DiagramWrapper>
  );
}
