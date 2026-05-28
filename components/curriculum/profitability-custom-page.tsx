'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Layers,
  Target,
  Users,
  Building2,
  MapPin,
  Library,
  Hash,
  ExternalLink,
  ArrowRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ALL_DOMAINS, LEARNING_PATHS } from '@/lib/curriculum';
import {
  MasterProfitTree,
  CustomerJourneyFunnel,
  SKURevenueMarginMatrix,
  ValueChainCostMap,
  TradeMarginWaterfall,
  PestelIndiaHexagon,
  PPIGauge,
  PEDComparisonBar
} from './profitability-visuals';

export default function ProfitabilityCustomPage() {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'D4.1': true,
    'D4.2': true,
    'D4.3': true,
    'D4.4': true
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const scrollToLesson = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const domain = ALL_DOMAINS.find(d => d.slug === 'profitability');
  
  if (!domain) return <div>Domain not found</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Left Sidebar (Learning Paths & Directory) ── */}
      <div className="lg:w-1/4 flex flex-col gap-6 order-2 lg:order-1">
        {/* Learning Paths */}
        <div className="ui-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Learning Paths</h3>
          </div>
          <div className="space-y-3">
            {LEARNING_PATHS.map((path) => (
              <Dialog key={path.id}>
                <DialogTrigger asChild>
                  <button className="w-full text-left bg-muted/30 hover:bg-muted/50 p-3 rounded-md border border-border/50 transition-colors flex items-center justify-between group">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{path.id}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                          {path.duration}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium group-hover:text-foreground/80 transition-colors">
                        {path.milestone}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </DialogTrigger>
                {/* @ts-ignore - DialogContent from .jsx doesn't export children type */}
                <DialogContent className="max-w-2xl bg-card border-border shadow-xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <Target className="h-5 w-5 text-primary" />
                      {path.title}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-2">
                      {path.weeks.map((week) => (
                        <div key={week.week} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border/50">
                          <span className="text-xs font-bold text-primary whitespace-nowrap pt-0.5">Wk {week.week}</span>
                          <span className="text-sm text-foreground/90">{week.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        {/* Directory Explorer */}
        <div className="ui-card p-5 sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Directory</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{ALL_DOMAINS.length} Domains</span>
          </div>
          <div className="space-y-1">
            {ALL_DOMAINS.map((d) => {
              const isActive = d.slug === domain.slug;
              return (
                <Link
                  key={d.slug}
                  href={`/learn/${d.slug}`}
                  className={`block px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate pr-2">{d.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="lg:w-3/4 flex flex-col gap-8 order-1 lg:order-2">
        <div>
          <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Curriculum
          </Link>
        </div>

        {/* Domain Header */}
        <header className="relative overflow-hidden rounded-xl bg-navy border border-border shadow-sm p-8 pb-10">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="tag tag-white text-xs">{domain.slug.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">
              {domain.fullTitle} (Superior Edition)
            </h1>
            <p className="text-white/80 max-w-2xl text-sm leading-relaxed mb-6">
              Zero-Gap, MBB-Grade, India-Native Consulting Casebook Module. The complete decomposition of every lever on both sides, mapped to its root-cause diagnostic, India-specific distortion, and industry variant.
            </p>
            <div className="flex flex-wrap gap-2">
              {domain.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-white/10 text-white/90 border border-white/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* ── Section 0: Core Framework Visual ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground tracking-tight">The Governing Equation</h2>
          </div>
          <div className="ui-card p-6 border-l-4 border-l-primary">
            <p className="font-mono text-lg font-bold text-foreground mb-4">Profit = Revenue − Cost</p>
            <p className="text-sm text-muted-foreground mb-6">But this is a starting point, not a framework. The framework is the complete decomposition of every lever on both sides. Click any sub-node below to jump to its deep dive.</p>
            <MasterProfitTree onNodeClick={scrollToLesson} />
          </div>
        </section>

        {/* ── D4.1: Master Framework Architecture ── */}
        <section className="ui-card overflow-hidden">
          <button onClick={() => toggleModule('D4.1')} className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background border border-border shadow-sm text-sm font-bold text-foreground">
                D4.1
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Master Framework Architecture</h3>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${expandedModules['D4.1'] ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedModules['D4.1'] && (
            <div className="p-6 border-t border-border space-y-10 bg-background">
              
              {/* D4.1.1 PRICE */}
              <div id="price" className="scroll-mt-24">
                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-teal-600">1A.</span> PRICE
                </h4>
                <p className="text-sm text-muted-foreground mb-4">Price is not a single number. It has a supply floor, a demand ceiling, and a competitive band between them.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h5 className="font-bold text-sm mb-2 text-foreground">Price Floor (Cost-Plus)</h5>
                    <p className="text-xs text-muted-foreground">Minimum viable price = Total Unit Cost + Target Margin. Shifts with input cost inflation and currency movements.</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h5 className="font-bold text-sm mb-2 text-foreground">Price Ceiling (Value-Based)</h5>
                    <p className="text-xs text-muted-foreground">Maximum extractable price = Customer WTP. Measured via Conjoint or Van Westendorp. Highly segmented in India.</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h5 className="font-bold text-sm mb-2 text-foreground">Competitive Band</h5>
                    <p className="text-xs text-muted-foreground">The actual price between floor and ceiling, positioned by direct competitors and substitute pricing (e.g., loose atta).</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-teal-500/10 border border-teal-500/30 rounded-lg">
                  <h5 className="font-bold text-sm mb-2 text-teal-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Price Realisation Gap (India-Specific)</h5>
                  <p className="text-sm text-teal-900/80">Stated price ≠ Realised price. The gap is created by trade discounts (8–15% FMCG), kirana margins (12–20%), promos, and GST slab differences.</p>
                  <TradeMarginWaterfall />
                </div>
              </div>

              {/* D4.1.2 VOLUME */}
              <div id="volume" className="scroll-mt-24">
                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-teal-600">1B.</span> VOLUME
                </h4>
                <p className="text-sm font-mono bg-muted p-2 rounded mb-4 text-foreground/80">Volume = Total Addressable Market (TAM) × Penetration Rate × Per-Capita</p>
                <h5 className="font-bold text-sm mb-3">Customer Funnel (Revenue-Side Diagnostic)</h5>
                <CustomerJourneyFunnel />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h5 className="font-bold text-sm mb-2 text-foreground">Average Order Size</h5>
                    <p className="text-xs text-muted-foreground">Driven by basket composition and upsell. <br/><strong className="text-foreground">India Lever:</strong> "Premiumisation within affordability" (upgrading from ₹5 to ₹10 packs) drives order size.</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h5 className="font-bold text-sm mb-2 text-foreground">Purchase Frequency</h5>
                    <p className="text-xs text-muted-foreground">Driven by consumption rate. <br/><strong className="text-foreground">India Lever:</strong> Festival cycles (Diwali, Eid, harvest) create massive spikes; brands that miss windows suffer.</p>
                  </div>
                </div>
              </div>

              {/* D4.1.3 PRODUCT MIX */}
              <div id="mix" className="scroll-mt-24">
                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-teal-600">1C.</span> PRODUCT MIX
                </h4>
                <p className="text-sm text-muted-foreground mb-4">The most commonly underanalysed revenue lever. Two companies with identical total revenue can have completely different profitability if their product mix differs.</p>
                <SKURevenueMarginMatrix />
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h5 className="font-bold text-sm mb-2 text-amber-800 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Phantom Premiumisation (India Distortion)</h5>
                  <p className="text-sm text-amber-900/80">Kirana stores prefer high-turnover, low-margin SKUs. Premium SKUs sit unsold. The actual sold mix at retail is more low-margin than intended.</p>
                </div>
              </div>

              {/* D4.1.4 COST TREE */}
              <div id="variable" className="scroll-mt-24">
                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-[#E76F51]">2.</span> THE COST TREE (Value Chain)
                </h4>
                <p className="text-sm text-muted-foreground mb-4">Entry Point A (Fixed vs Variable) is good for breakeven. Entry Point B (Value Chain) is superior for root-cause diagnosis of cost spikes.</p>
                <ValueChainCostMap />
              </div>

              {/* D4.1.5 MACRO LEVERS */}
              <div id="macro" className="scroll-mt-24">
                <h4 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-primary">3.</span> MACRO LEVERS (PESTEL & Porter)
                </h4>
                <PestelIndiaHexagon />
                
                {/* Porter's Five Forces - India Calibration */}
                <div className="mt-8 p-6 bg-muted/20 border border-border rounded-xl">
                  <h5 className="font-bold text-sm mb-4">Porter's Five Forces — India Calibration</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">Supplier Power</span>
                        <p className="text-xs mt-1 text-muted-foreground"><strong className="text-foreground">High:</strong> Specialty chemicals (China dependent), aviation fuel (PSU cartel).<br/><strong className="text-foreground">Low:</strong> Agri-commodities (fragmented farmers).</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">Buyer Power</span>
                        <p className="text-xs mt-1 text-muted-foreground"><strong className="text-foreground">High:</strong> Organised retail (Reliance/DMart), GeM platform B2G.<br/><strong className="text-foreground">Low:</strong> B2C consumer markets.</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">Threat of Substitutes</span>
                        <p className="text-xs mt-1 text-muted-foreground">Branded vs unbranded (loose atta), organised vs informal (local dhaba vs QSR).</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">Threat of New Entrants</span>
                        <p className="text-xs mt-1 text-muted-foreground"><strong className="text-foreground">High:</strong> SaaS, D2C, fintech.<br/><strong className="text-foreground">Low:</strong> Telecom (spectrum), aviation (DGCA), banking (RBI).</p>
                      </div>
                      <div>
                        <span className="text-xs font-bold bg-navy text-white px-2 py-0.5 rounded">Competitive Rivalry</span>
                        <p className="text-xs mt-1 text-muted-foreground"><strong className="text-foreground">Intense:</strong> Telecom, FMCG, EdTech.<br/><strong className="text-foreground">Low:</strong> Defence manufacturing (PSU).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* ── D4.2: Diagnostic Question Set & Distortions ── */}
        <section className="ui-card overflow-hidden">
          <button onClick={() => toggleModule('D4.2')} className="w-full flex items-center justify-between p-5 bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-background border border-border shadow-sm text-sm font-bold text-foreground">
                D4.2
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">Diagnostic Question Set & Distortions</h3>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${expandedModules['D4.2'] ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedModules['D4.2'] && (
            <div className="p-6 border-t border-border bg-background">
              
              <h4 className="text-base font-bold text-foreground mb-4">Complete Diagnostic Question Set</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-navy p-5 rounded-xl text-white">
                  <h5 className="font-bold text-sm mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-teal-400"/> Phase 0: Context Clarification</h5>
                  <ul className="space-y-3 text-sm text-white/80">
                    <li><strong className="text-white">1. Metric:</strong> Absolute profit, %, EBITDA, or net margin?</li>
                    <li><strong className="text-white">2. Timeline:</strong> One quarter or multi-year? (Structural vs Cyclical)</li>
                    <li><strong className="text-white">3. Scope:</strong> Company-wide or specific geography/BU?</li>
                    <li><strong className="text-white">4. Industry:</strong> Exception or consistent with competitors?</li>
                    <li><strong className="text-white">5. Value Chain:</strong> Manufacturer, distributor, or integrated?</li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h5 className="font-bold text-sm mb-3">Phase 1: Revenue & Cost Questions</h5>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li><strong className="text-foreground">Revenue:</strong> Is it ASP or Volume drop? Was it deliberate (penetration) or effective (channel mix)? What is the price realisation gap?</li>
                    <li><strong className="text-foreground">Mix:</strong> Has premium lost to economy? Cannibalization from new launches?</li>
                    <li><strong className="text-foreground">Cost:</strong> Capacity utilization &lt; 70%? Unplanned downtime? Distribution model shift to 3PL? Fixed overhead bloat?</li>
                  </ul>
                </div>
              </div>

              <h4 className="text-base font-bold text-foreground mb-4">The Six India Distortions</h4>
              <p className="text-sm text-muted-foreground mb-4">Standard frameworks break on these 6 realities.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 1, title: 'Trade Margin Stack', desc: 'Up to 5 layers consume 20-40% of consumer price. Calc Net Revenue Realisation (NRR).' },
                  { id: 2, title: 'GST Complexity', desc: 'Complex Input Tax Credit systems create tax cascades. Ask for GST-adjusted contribution margin.' },
                  { id: 3, title: 'Working Capital Trap', desc: '30-60 day distributor terms + fast supplier pay = negative FCF despite 10% EBITDA.' },
                  { id: 4, title: 'Rural-Urban Bifurcation', desc: 'Two distinct P&Ls. Rural has high logistics, low marketing cost. Segment the P&L.' },
                  { id: 5, title: 'Commodity Volatility', desc: 'MSP interventions and monsoons. Build Commodity Sensitivity Analysis vs Price Pass-through.' },
                  { id: 6, title: 'UPI Impulse Kill', desc: 'UPI eliminated loose-change impulse buys (₹2/₹5). Track sub-₹20 SKUs against digital penetration.' }
                ].map(d => (
                  <div key={d.id} className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/50 transition-colors">
                    <span className="text-[10px] font-black text-primary uppercase tracking-wider mb-1 block">Distortion {d.id}</span>
                    <h5 className="font-bold text-sm text-foreground mb-2">{d.title}</h5>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 border border-red-500/30 bg-red-500/5 rounded-xl">
                <h5 className="font-bold text-sm text-red-700 mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4"/> Hyper-Inflation Protocol</h5>
                <p className="text-sm text-red-900/80 mb-3">When input costs and consumer inflation move rapidly (e.g. 2022 edible oil shock), standard PPI breaks because WTP itself declines.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                    <strong className="text-xs text-red-800 block mb-1">A. Full Pass-Through</strong>
                    <p className="text-[10px] text-muted-foreground">Model volume impact using stressed PED (1.5x normal).</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                    <strong className="text-xs text-red-800 block mb-1">B. Partial (50%)</strong>
                    <p className="text-[10px] text-muted-foreground">Absorb remainder as margin compression. Normal PED.</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                    <strong className="text-xs text-red-800 block mb-1">C. Shrinkflation</strong>
                    <p className="text-[10px] text-muted-foreground">Reduce pack weight 10-15%. Maintain MRP and volume.</p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </section>

      </div>
    </div>
  );
}
