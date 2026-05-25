'use client';

import { useState } from 'react';
import type { Domain } from '@/lib/curriculum';
import { ALL_DOMAINS } from '@/lib/curriculum';
import LearnPanel from '@/components/learn-panel';
import { ArrowRight, BookOpen, Target, Layers, TrendingUp, DollarSign, Settings, GitMerge, Lightbulb, BarChart3, Users, MessageSquare, Building2, Calculator, Cpu, MapPin, Library } from 'lucide-react';

/* Icon map for each domain */
const DOMAIN_ICONS: Record<string, React.ElementType> = {
  'consulting-foundations': BookOpen,
  'case-interview-methodology': Target,
  'frameworks-mental-models': Layers,
  'profitability': TrendingUp,
  'market-entry': Rocket,
  'growth-strategy': TrendingUp,
  'pricing-strategy': DollarSign,
  'operations-efficiency': Settings,
  'mergers-acquisitions': GitMerge,
  'unconventional-social-impact': Lightbulb,
  'guesstimates-market-sizing': BarChart3,
  'behavioral-hr-preparation': Users,
  'group-discussion': MessageSquare,
  'company-intelligence': Building2,
  'business-financial-fundamentals': Calculator,
  'product-strategy-saas': Cpu,
  'india-macro-benchmarks': MapPin,
  'practice-case-library': Library,
};

import { Rocket } from 'lucide-react'; // Moved up logically but keeping here for copy paste

/* Accent colors per domain — rotating set */
const DOMAIN_ACCENTS = [
  'bg-primary/10 text-primary',
  'bg-navy/10 text-navy',
  'bg-amber-500/10 text-amber-600',
  'bg-emerald-500/10 text-emerald-600',
  'bg-primary/10 text-primary',
  'bg-navy/10 text-navy',
  'bg-amber-500/10 text-amber-600',
  'bg-emerald-500/10 text-emerald-600',
  'bg-primary/10 text-primary',
  'bg-navy/10 text-navy',
  'bg-amber-500/10 text-amber-600',
  'bg-emerald-500/10 text-emerald-600',
  'bg-primary/10 text-primary',
  'bg-navy/10 text-navy',
  'bg-amber-500/10 text-amber-600',
  'bg-emerald-500/10 text-emerald-600',
  'bg-primary/10 text-primary',
  'bg-navy/10 text-navy',
];

export default function LearnDomainGrid() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_DOMAINS.map((domain, idx) => {
          const DIcon = DOMAIN_ICONS[domain.slug] || BookOpen;
          const accent = DOMAIN_ACCENTS[idx % DOMAIN_ACCENTS.length];
          const lessonCount = domain.modules?.reduce((sum, m) => 
            sum + (m.lessons?.reduce((ls, l) => ls + 1 + (l.children?.length || 0), 0) || 0)
          , 0) || 0;

          return (
            <button
              key={domain.code}
              onClick={() => setSelectedDomain(domain)}
              className="ui-card flex flex-col p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left w-full h-full"
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                  <DIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/50 font-mono">{domain.code}</span>
                    <span className="text-[10px] text-muted-foreground/40">•</span>
                    <span className="text-[10px] text-muted-foreground/60">{domain.level}</span>
                  </div>
                  <h3 className="text-small font-bold text-foreground mt-0.5 leading-snug group-hover:text-primary transition-colors">
                    {domain.title}
                  </h3>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>

              {/* Meta row */}
              <div className="mt-3 flex items-center gap-3 text-small text-muted-foreground">
                <span>{domain.modules.length} modules</span>
                <span className="text-border">•</span>
                <span>{lessonCount} lessons</span>
              </div>

              {/* Tags */}
              {domain.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 flex-grow">
                  {domain.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {domain.tags.length > 4 && (
                    <span className="text-[10px] text-muted-foreground/40">
                      +{domain.tags.length - 4}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-primary font-medium text-small group-hover:text-primary-hover w-full">
                View concepts
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>

      <LearnPanel domain={selectedDomain} onClose={() => setSelectedDomain(null)} />
    </>
  );
}
