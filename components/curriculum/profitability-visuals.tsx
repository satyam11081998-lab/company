'use client';

import React from 'react';

// ─── 0. Master Profit Tree ──────────────────────────────────────────────
export function MasterProfitTree({ onNodeClick }: { onNodeClick?: (id: string) => void }) {
  return (
    <div className="w-full overflow-x-auto bg-navy text-white rounded-xl p-8 shadow-sm border border-border">
      <div className="min-w-[800px] flex flex-col items-center">
        {/* Tier 1 */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-white/10 border-2 border-white/30 px-8 py-3 rounded-xl shadow-lg backdrop-blur-sm">
            <h3 className="text-xl font-bold tracking-tight">PROFIT</h3>
          </div>
          <div className="w-px h-8 bg-white/30 mt-1"></div>
          <div className="w-[500px] h-px bg-white/30"></div>
          <div className="flex justify-between w-[500px]">
            <div className="w-px h-8 bg-white/30"></div>
            <div className="w-px h-8 bg-white/30"></div>
          </div>
        </div>

        {/* Tier 2 */}
        <div className="flex justify-center gap-[300px] w-full mb-8">
          <div className="flex flex-col items-center relative group">
            <div className="absolute inset-0 bg-teal-500/20 blur-xl group-hover:bg-teal-500/30 transition-all rounded-full"></div>
            <div className="bg-teal-500 text-white px-8 py-2 rounded-lg font-bold shadow-md relative z-10 border border-teal-400">
              REVENUE
            </div>
            <div className="w-px h-8 bg-white/30 mt-1"></div>
            <div className="w-[300px] h-px bg-white/30"></div>
            <div className="flex justify-between w-[300px]">
              <div className="w-px h-8 bg-white/30"></div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="w-px h-8 bg-white/30"></div>
            </div>
          </div>

          <div className="flex flex-col items-center relative group">
            <div className="absolute inset-0 bg-[#E76F51]/20 blur-xl group-hover:bg-[#E76F51]/30 transition-all rounded-full"></div>
            <div className="bg-[#E76F51] text-white px-8 py-2 rounded-lg font-bold shadow-md relative z-10 border border-[#f4a261]">
              COST
            </div>
            <div className="w-px h-8 bg-white/30 mt-1"></div>
            <div className="w-[200px] h-px bg-white/30"></div>
            <div className="flex justify-between w-[200px]">
              <div className="w-px h-8 bg-white/30"></div>
              <div className="w-px h-8 bg-white/30"></div>
            </div>
          </div>
        </div>

        {/* Tier 3 */}
        <div className="flex justify-center w-full gap-[30px] items-start">
          {/* Revenue Nodes */}
          <button onClick={() => onNodeClick?.('price')} className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/20 p-3 rounded-lg w-[120px] transition-colors cursor-pointer group">
            <span className="font-bold text-sm mb-1 text-teal-300">PRICE</span>
            <span className="text-[10px] text-white/60 text-center">Floor vs Ceiling<br/>Net Realisation</span>
          </button>
          
          <button onClick={() => onNodeClick?.('volume')} className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/20 p-3 rounded-lg w-[120px] transition-colors cursor-pointer group">
            <span className="font-bold text-sm mb-1 text-teal-300">VOLUME</span>
            <span className="text-[10px] text-white/60 text-center">4A Framework<br/>Freq & Order Size</span>
          </button>
          
          <button onClick={() => onNodeClick?.('mix')} className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/20 p-3 rounded-lg w-[120px] transition-colors cursor-pointer group">
            <span className="font-bold text-sm mb-1 text-teal-300">MIX</span>
            <span className="text-[10px] text-white/60 text-center">Pareto 80/20<br/>Phantom Premium</span>
          </button>

          {/* Spacer */}
          <div className="w-[100px]"></div>

          {/* Cost Nodes */}
          <button onClick={() => onNodeClick?.('fixed')} className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/20 p-3 rounded-lg w-[120px] transition-colors cursor-pointer group">
            <span className="font-bold text-sm mb-1 text-[#f4a261]">FIXED</span>
            <span className="text-[10px] text-white/60 text-center">Overheads<br/>Depreciation</span>
          </button>
          
          <button onClick={() => onNodeClick?.('variable')} className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/20 p-3 rounded-lg w-[120px] transition-colors cursor-pointer group">
            <span className="font-bold text-sm mb-1 text-[#f4a261]">VARIABLE</span>
            <span className="text-[10px] text-white/60 text-center">Raw Materials<br/>Logistics</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 1. Customer Journey Funnel (India Edition) ─────────────────────────
export function CustomerJourneyFunnel() {
  const gates = [
    { label: 'NEED', w: 'w-[100%]', h: 'h-14', bg: 'bg-teal-500/20 border-teal-500', txt: 'text-teal-900', note: 'Latent vs Urgent' },
    { label: 'AWARENESS', w: 'w-[85%]', h: 'h-14', bg: 'bg-teal-500/40 border-teal-500', txt: 'text-teal-900', note: 'TV/Haat vs Digital' },
    { label: 'ACCESSIBILITY', w: 'w-[70%]', h: 'h-14', bg: 'bg-teal-500/60 border-teal-500', txt: 'text-white', note: 'Kirana Depth < 10%' },
    { label: 'AFFORDABILITY', w: 'w-[55%]', h: 'h-14', bg: 'bg-teal-500/80 border-teal-500', txt: 'text-white', note: 'Sachet Economy (₹5/₹10)' },
    { label: 'EXPERIENCE', w: 'w-[40%]', h: 'h-14', bg: 'bg-teal-600 border-teal-700', txt: 'text-white', note: 'Hyper-vocal WOM' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 bg-muted/20 rounded-xl border border-border mt-4">
      <div className="flex-1 flex flex-col items-center gap-1">
        {gates.map((g, i) => (
          <div key={i} className={`${g.w} ${g.h} ${g.bg} border rounded flex items-center justify-center font-bold text-sm relative group cursor-default transition-all hover:scale-[1.02]`}>
            <span className={g.txt}>{g.label}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col justify-between py-2">
        {gates.map((g, i) => (
          <div key={i} className="flex items-center gap-3 h-14">
            <div className="w-6 h-px bg-border hidden md:block"></div>
            <div className="bg-background border border-border px-3 py-1.5 rounded shadow-sm text-xs w-full">
              <span className="font-semibold text-primary block mb-0.5">India Distortion:</span>
              <span className="text-muted-foreground">{g.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 2. SKU Revenue/Margin Matrix ───────────────────────────────────────
export function SKURevenueMarginMatrix() {
  return (
    <div className="relative w-full aspect-video max-h-[400px] bg-background border border-border rounded-xl p-8 mt-4 overflow-hidden">
      {/* Grid Lines */}
      <div className="absolute inset-0 p-8">
        <div className="w-full h-full border-l-2 border-b-2 border-muted-foreground/30 relative">
          {/* Quadrant backgrounds */}
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-amber-500/5"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal-500/5"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-red-500/5"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-muted/10"></div>
          
          {/* Axis labels */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">Volume (Revenue Contribution) ➔</div>
          <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-muted-foreground">Margin (%) ➔</div>
          
          {/* Median lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-border border-dashed"></div>
          <div className="absolute top-0 left-1/2 w-px h-full bg-border border-dashed"></div>
          
          {/* Labels for Quadrants */}
          <div className="absolute top-4 left-4 text-xs font-bold text-amber-600 opacity-60">High Margin / Low Vol<br/>(Niche Premium)</div>
          <div className="absolute top-4 right-4 text-xs font-bold text-teal-600 opacity-60">High Margin / High Vol<br/>(Star Products)</div>
          <div className="absolute bottom-4 right-4 text-xs font-bold text-red-600 opacity-60">Low Margin / High Vol<br/>(Margin Bleeders)</div>
          
          {/* Bubbles */}
          <div className="absolute bottom-[20%] right-[80%] w-24 h-24 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center -translate-x-1/2 translate-y-1/2 hover:scale-110 transition-transform shadow-sm">
            <span className="text-[10px] font-bold text-red-700 text-center leading-tight bg-white/80 p-1 rounded">SKU A<br/>(₹5 Pack)</span>
          </div>
          <div className="absolute top-[30%] left-[80%] w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500 flex items-center justify-center -translate-x-1/2 translate-y-1/2 hover:scale-110 transition-transform shadow-sm">
            <span className="text-[10px] font-bold text-teal-700 text-center leading-tight bg-white/80 p-1 rounded">SKU B<br/>(₹20 Pack)</span>
          </div>
          <div className="absolute top-[20%] left-[30%] w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center -translate-x-1/2 translate-y-1/2 hover:scale-110 transition-transform shadow-sm">
            <span className="text-[10px] font-bold text-amber-700 text-center leading-tight bg-white/80 px-1 rounded">SKU C</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Value Chain Cost Map (Horizontal) ───────────────────────────────
export function ValueChainCostMap() {
  const nodes = [
    { id: 1, label: 'R&D', alert: 'Low spend; mostly licensing' },
    { id: 2, label: 'Raw Materials', alert: 'Agri MSP volatility' },
    { id: 3, label: 'Inbound Log.', alert: 'High trucking cost' },
    { id: 4, label: 'Production', alert: 'Power tariff variation' },
    { id: 5, label: 'Storage', alert: 'Weak cold chain' },
    { id: 6, label: 'Outbound Log.', alert: 'C&F Agent model' },
    { id: 7, label: 'Marketing', alert: 'BTL vs ATL' },
    { id: 8, label: 'After-sales', alert: 'Consumer Protection Act' },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 mt-6">
      <div className="min-w-[900px] flex items-center relative">
        <div className="absolute left-0 right-0 h-2 top-1/2 -translate-y-1/2 bg-muted rounded-full z-0"></div>
        {nodes.map((n, i) => (
          <div key={n.id} className="flex-1 flex flex-col items-center relative z-10 group">
            <div className="w-8 h-8 rounded-full bg-[#E76F51] border-4 border-background flex items-center justify-center shadow-sm text-white text-xs font-bold mb-2 group-hover:scale-110 transition-transform">
              {n.id}
            </div>
            <div className="text-xs font-bold text-foreground text-center px-1 mb-1">{n.label}</div>
            
            {/* Hover tooltip for India Alert */}
            <div className="absolute top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border shadow-md rounded p-2 w-32 text-center pointer-events-none z-20">
              <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">⚠ India Note</span>
              <span className="text-[10px] text-muted-foreground leading-tight block">{n.alert}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 4. Trade Margin Waterfall ──────────────────────────────────────────
export function TradeMarginWaterfall() {
  return (
    <div className="w-full bg-background border border-border rounded-xl p-6 mt-4">
      <div className="flex flex-col gap-2 relative">
        {/* Gross Revenue */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-xs font-bold text-right shrink-0">Gross (MRP)</div>
          <div className="h-6 bg-teal-500 w-full max-w-[400px] rounded flex items-center px-2 shadow-sm">
            <span className="text-white text-[10px] font-bold">₹100</span>
          </div>
        </div>
        {/* Dist Margin */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-xs font-medium text-right shrink-0 text-muted-foreground">Distributor (6%)</div>
          <div className="flex w-full max-w-[400px]">
            <div className="w-[94%]"></div>
            <div className="h-6 bg-[#E76F51]/80 w-[6%] rounded flex items-center justify-center">
              <span className="text-white text-[10px]">-6</span>
            </div>
          </div>
        </div>
        {/* Retailer Margin */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-xs font-medium text-right shrink-0 text-muted-foreground">Retailer (15%)</div>
          <div className="flex w-full max-w-[400px]">
            <div className="w-[79%]"></div>
            <div className="h-6 bg-[#E76F51]/80 w-[15%] rounded flex items-center justify-center">
              <span className="text-white text-[10px]">-15</span>
            </div>
          </div>
        </div>
        {/* Schemes */}
        <div className="flex items-center gap-4">
          <div className="w-24 text-xs font-medium text-right shrink-0 text-muted-foreground">Schemes (8%)</div>
          <div className="flex w-full max-w-[400px]">
            <div className="w-[71%]"></div>
            <div className="h-6 bg-[#E76F51]/80 w-[8%] rounded flex items-center justify-center">
              <span className="text-white text-[10px]">-8</span>
            </div>
          </div>
        </div>
        {/* Net Realisation */}
        <div className="flex items-center gap-4 pt-2 border-t border-border mt-1">
          <div className="w-24 text-sm font-black text-right shrink-0 text-teal-600">Net (NRR)</div>
          <div className="h-8 bg-teal-600 w-full max-w-[284px] rounded flex items-center px-3 shadow-md">
            <span className="text-white text-xs font-bold">₹71 (Net Revenue Realisation)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 5. PESTEL Hexagon (India) ──────────────────────────────────────────
export function PestelIndiaHexagon() {
  const items = [
    { letter: 'P', color: 'bg-blue-500/10 border-blue-500/50 text-blue-700', title: 'Political', desc: 'FDI limits, State subsidies, NPPA pricing controls.' },
    { letter: 'E', color: 'bg-green-500/10 border-green-500/50 text-green-700', title: 'Economic', desc: 'Rural vs Urban bifurcation, RBI Repo, WPI-CPI gap.' },
    { letter: 'S', color: 'bg-purple-500/10 border-purple-500/50 text-purple-700', title: 'Social', desc: 'Demographic dividend, Sachet economy, Female workforce.' },
    { letter: 'T', color: 'bg-orange-500/10 border-orange-500/50 text-orange-700', title: 'Technological', desc: 'UPI impulse kill, ONDC, D2C disruption.' },
    { letter: 'E', color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-700', title: 'Environmental', desc: 'Monsoon dependency, Agri-volatility, ESG pressures.' },
    { letter: 'L', color: 'bg-rose-500/10 border-rose-500/50 text-rose-700', title: 'Legal', desc: 'GST Cascades, Labour Laws, Consumer Protection.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {items.map(item => (
        <div key={item.letter} className={`p-5 rounded-xl border ${item.color} flex flex-col hover:shadow-md transition-shadow bg-background`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${item.color} bg-background/50 border-2`}>
              {item.letter}
            </div>
            <h4 className="font-bold text-foreground">{item.title}</h4>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed pl-13">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── 6. PPI Gauge & Capital Matrix ──────────────────────────────────────
export function PPIGauge() {
  return (
    <div className="flex flex-col md:flex-row gap-6 mt-6">
      <div className="flex-1 bg-background border border-border rounded-xl p-6 flex flex-col items-center justify-center shadow-sm">
        <h4 className="text-sm font-bold text-center mb-6">Pricing Power Index (PPI)</h4>
        <div className="relative w-48 h-24 overflow-hidden mb-4">
          {/* Half circle background */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-muted"></div>
          {/* Colored arcs */}
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-transparent border-t-red-500 border-l-red-500 -rotate-[45deg]"></div>
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-transparent border-t-amber-500 border-r-amber-500 rotate-[45deg]"></div>
          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[24px] border-transparent border-r-teal-500 border-b-teal-500 rotate-[45deg]"></div>
          
          {/* Needle - High PPI (Cream Biscuits) */}
          <div className="absolute bottom-0 left-1/2 w-1 h-20 bg-teal-700 origin-bottom rounded-full translate-x-[-50%] rotate-[60deg] shadow-sm z-10 transition-transform"></div>
          
          {/* Needle - Low PPI (Glucose) */}
          <div className="absolute bottom-0 left-1/2 w-1 h-16 bg-red-700/50 origin-bottom rounded-full translate-x-[-50%] rotate-[-50deg] border border-red-800 border-dashed z-0"></div>
          
          <div className="absolute bottom-[-8px] left-1/2 w-4 h-4 bg-navy rounded-full -translate-x-1/2 z-20"></div>
        </div>
        <div className="flex justify-between w-full text-[10px] font-bold text-muted-foreground px-4">
          <span>0.0 (Price Taker)</span>
          <span>1.0 (Full Power)</span>
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-teal-700 rounded-full"></div> Cream Biscuits (0.8+)</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-700/50 rounded-full border border-dashed"></div> Glucose (0.3)</div>
        </div>
      </div>

      <div className="flex-1 bg-background border border-border rounded-xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-center mb-4">Capital Allocation Matrix</h4>
        <div className="relative w-full h-[160px] border-l-2 border-b-2 border-muted-foreground/30 ml-2 mt-2">
          {/* Quadrants */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-500/5"></div>
          <div className="absolute top-0 left-0 w-1/2 h-full bg-red-500/5"></div>
          
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-muted-foreground">Pricing Power (PPI) ➔</div>
          
          {/* Bubbles */}
          <div className="absolute bottom-4 left-6 w-16 h-16 rounded-full bg-red-500/30 border border-red-500 flex items-center justify-center -translate-x-1/2 translate-y-1/2">
            <span className="text-[9px] font-bold text-center leading-tight">Glucose<br/>(Divest)</span>
          </div>
          <div className="absolute top-4 right-10 w-20 h-20 rounded-full bg-teal-500/30 border border-teal-500 flex items-center justify-center -translate-x-1/2 translate-y-1/2">
            <span className="text-[10px] font-bold text-center leading-tight">Specialty<br/>(Invest)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. PED Comparison Bar ──────────────────────────────────────────────
export function PEDComparisonBar() {
  return (
    <div className="w-full bg-background border border-border rounded-xl p-6 mt-4 shadow-sm">
      <h4 className="text-sm font-bold mb-4">Price Elasticity of Demand (PED) Benchmarks</h4>
      <div className="space-y-4">
        {/* Glucose */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Glucose Biscuits (Commodity)</span>
            <span className="text-red-600 font-bold">-2.5 to -3.0 (Highly Elastic)</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-red-500 w-[90%]"></div>
          </div>
        </div>
        {/* Cream */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Premium Cream Biscuits</span>
            <span className="text-amber-600 font-bold">-0.8 to -1.2 (Moderately Elastic)</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-[40%]"></div>
          </div>
        </div>
        {/* Specialty */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold">Specialty / Health Biscuits</span>
            <span className="text-teal-600 font-bold">-0.4 to -0.7 (Inelastic)</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 w-[20%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
