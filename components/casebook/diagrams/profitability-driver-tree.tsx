'use client';

import React, { SVGProps } from 'react';

export function ProfitabilityDriverTree(props: SVGProps<SVGSVGElement>) {
  return (
    <div className={`w-full max-w-[650px] mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm ${props.className || ''}`}>
      <style>{`
        @keyframes diagramEnter {
          0% { opacity: 0; transform: scale(0.98) translateY(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-diagram {
          animation: diagramEnter 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <svg viewBox="0 0 650 480" className="w-full h-auto animate-diagram">
        {/* Tier 1 - Root */}
        <g textAnchor="middle">
          <rect x="255" y="20" width="140" height="46" rx="8" className="fill-navy" />
          <text x="325" y="40" fill="white" className="font-bold text-[14px]">PROFIT</text>
          <text x="325" y="55" fill="white" className="text-[11px] opacity-80">Net Income / EBITDA / Margin %</text>
        </g>

        {/* Lines to Tier 2 */}
        <g className="stroke-navy/30" strokeWidth="1.5" fill="none">
          <path d="M 325 66 L 325 80" />
          <path d="M 160 80 L 490 80" />
          <path d="M 160 80 L 160 110" />
          <path d="M 490 80 L 490 110" />
        </g>
        
        {/* Operator Tier 1 to Tier 2 */}
        <circle cx="325" cy="80" r="10" className="fill-background stroke-navy" strokeWidth="1" />
        <text x="325" y="84" textAnchor="middle" className="fill-navy font-bold text-sm">−</text>

        {/* Tier 2 */}
        <g textAnchor="middle">
          {/* Revenue */}
          <rect x="90" y="110" width="140" height="46" rx="8" className="fill-[#2A9D8F]" />
          <text x="160" y="130" fill="white" className="font-bold text-[13px]">REVENUE</text>
          <text x="160" y="145" fill="white" className="text-[11px] opacity-90">Top-line growth</text>

          {/* Costs */}
          <rect x="420" y="110" width="140" height="46" rx="8" className="fill-[#E76F51]" />
          <text x="490" y="130" fill="white" className="font-bold text-[13px]">COSTS</text>
          <text x="490" y="145" fill="white" className="text-[11px] opacity-90">Margin compression</text>
        </g>

        {/* Lines Revenue to Tier 3 */}
        <g className="stroke-navy/30" strokeWidth="1.5" fill="none">
          <path d="M 160 156 L 160 170" />
          <path d="M 60 170 L 260 170" />
          <path d="M 60 170 L 60 200" />
          <path d="M 160 170 L 160 200" />
          <path d="M 260 170 L 260 200" />
        </g>
        <circle cx="160" cy="170" r="10" className="fill-background stroke-[#2A9D8F]" strokeWidth="1" />
        <text x="160" y="174" textAnchor="middle" className="fill-[#2A9D8F] font-bold text-sm">×</text>

        {/* Lines Costs to Tier 3 */}
        <g className="stroke-navy/30" strokeWidth="1.5" fill="none">
          <path d="M 490 156 L 490 170" />
          <path d="M 410 170 L 570 170" />
          <path d="M 410 170 L 410 200" />
          <path d="M 570 170 L 570 200" />
        </g>
        <circle cx="490" cy="170" r="10" className="fill-background stroke-[#E76F51]" strokeWidth="1" />
        <text x="490" y="174" textAnchor="middle" className="fill-[#E76F51] font-bold text-sm">+</text>

        {/* Tier 3 Revenue */}
        <g textAnchor="middle">
          <rect x="20" y="200" width="80" height="40" rx="4" className="fill-background stroke-[#2A9D8F]" strokeWidth="1.5" />
          <text x="60" y="218" className="fill-foreground font-bold text-[11px]">PRICE / UNIT</text>
          <text x="60" y="232" className="fill-muted-foreground text-[9px]">Pricing strategy</text>

          <rect x="120" y="200" width="80" height="40" rx="4" className="fill-background stroke-[#2A9D8F]" strokeWidth="1.5" />
          <text x="160" y="218" className="fill-foreground font-bold text-[11px]">VOLUME</text>
          <text x="160" y="232" className="fill-muted-foreground text-[9px]">Units sold</text>

          <rect x="220" y="200" width="80" height="40" rx="4" className="fill-background stroke-[#2A9D8F]" strokeWidth="1.5" />
          <text x="260" y="218" className="fill-foreground font-bold text-[11px]">PRODUCT MIX</text>
          <text x="260" y="232" className="fill-muted-foreground text-[9px]">SKU composition</text>
        </g>

        {/* Tier 3 Costs */}
        <g textAnchor="middle">
          <rect x="360" y="200" width="100" height="40" rx="4" className="fill-background stroke-[#E76F51]" strokeWidth="1.5" />
          <text x="410" y="218" className="fill-foreground font-bold text-[11px]">FIXED COSTS</text>
          <text x="410" y="232" className="fill-muted-foreground text-[9px]">Rent, SG&amp;A</text>

          <rect x="520" y="200" width="100" height="40" rx="4" className="fill-background stroke-[#E76F51]" strokeWidth="1.5" />
          <text x="570" y="218" className="fill-foreground font-bold text-[11px]">VARIABLE COSTS</text>
          <text x="570" y="232" className="fill-muted-foreground text-[9px]">COGS, raw mat.</text>
        </g>

        {/* Tier 4 Price Band (under PRICE / UNIT) */}
        <g>
          <path d="M 60 240 L 60 270" className="stroke-[#2A9D8F]/50" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="60" y="280" textAnchor="middle" className="fill-navy font-semibold text-[10px]">Price Band</text>
          <rect x="10" y="290" width="100" height="12" rx="2" className="fill-[#2A9D8F]" />
          <text x="60" y="299" textAnchor="middle" fill="white" className="text-[8px]">Value Ceiling — WTP</text>
          
          <rect x="10" y="304" width="100" height="16" rx="2" className="fill-muted-foreground/60" />
          <text x="60" y="315" textAnchor="middle" fill="white" className="text-[8px]">Competitive Band</text>
          
          <rect x="10" y="322" width="100" height="12" rx="2" className="fill-[#E76F51]" />
          <text x="60" y="331" textAnchor="middle" fill="white" className="text-[8px]">Cost Floor (Unit + Margin)</text>
        </g>

        {/* Tier 4 Funnel (under VOLUME) */}
        <g>
          <path d="M 160 240 L 160 270" className="stroke-[#2A9D8F]/50" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="160" y="280" textAnchor="middle" className="fill-navy font-semibold text-[10px]">Customer Journey</text>
          
          {/* Need */}
          <rect x="110" y="290" width="100" height="14" rx="4" className="fill-[#0D1B2A]" />
          <text x="160" y="300" textAnchor="middle" fill="white" className="text-[8px] font-bold">Need</text>
          
          {/* Awareness */}
          <rect x="115" y="306" width="90" height="14" rx="4" className="fill-[#1B3A52]" />
          <text x="160" y="316" textAnchor="middle" fill="white" className="text-[8px] font-bold">Awareness</text>

          {/* Accessibility */}
          <rect x="120" y="322" width="80" height="14" rx="4" className="fill-[#2A9D8F]" />
          <text x="160" y="332" textAnchor="middle" fill="white" className="text-[8px] font-bold">Accessibility</text>
          
          {/* Affordability */}
          <rect x="125" y="338" width="70" height="14" rx="4" className="fill-[#E9C46A]" />
          <text x="160" y="348" textAnchor="middle" className="fill-navy text-[8px] font-bold">Affordability</text>
          
          {/* Experience */}
          <rect x="130" y="354" width="60" height="14" rx="4" className="fill-[#C5192D]" />
          <text x="160" y="364" textAnchor="middle" fill="white" className="text-[8px] font-bold">Experience</text>
        </g>

        {/* Bottom Text */}
        <text x="325" y="440" textAnchor="middle" className="fill-muted-foreground text-[12px]">
          Profit = Revenue − Cost. Every case reduces to one of these nodes. Your job is to locate which one.
        </text>
      </svg>
    </div>
  );
}
