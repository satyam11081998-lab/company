import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

import { ALL_DOMAINS, PLATFORM_STATS } from '@/lib/curriculum';
import LearnDomainGrid from '@/components/learn-domain-grid';
import {
  BookOpen, Target, Layers, TrendingUp, DollarSign, Settings,
  GitMerge, Lightbulb, BarChart3, Users, MessageSquare, Building2,
  Calculator, Cpu, MapPin, Library, ArrowRight, Clock, Zap,
  Award, Crown, Rocket,
} from 'lucide-react';


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

const totalModules = ALL_DOMAINS.reduce((sum, d) => sum + (d.modules?.length || 0), 0);
const totalLessons = ALL_DOMAINS.reduce((sum, d) => 
  sum + (d.modules?.reduce((mSum, m) => 
    mSum + (m.lessons?.reduce((lSum, l) => lSum + 1 + (l.children?.length || 0), 0) || 0)
  , 0) || 0)
, 0);

export default async function LearnPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect('/login');
  const authUser = session.user;

  return (
    <div className="min-h-screen bg-muted">

      <main className="container max-w-6xl py-10 space-y-12">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="badge-pill">
                <Zap className="h-3.5 w-3.5" />
                Placement Prep · India
              </span>
            </div>
            <Link href="/practice" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-small font-medium hover:bg-primary/20 transition-colors">
              Practice these concepts? Head to Practice <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            MECE Curriculum
          </h1>
          <p className="mt-2 text-body text-muted-foreground max-w-2xl leading-relaxed">
            A complete prep library for MBA placement interviews — frameworks, concepts, and theory across consulting, finance, marketing, ops, and HR domains.
          </p>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Domains', value: '18' },
              { label: 'Modules', value: totalModules.toString() },
              { label: 'Lessons', value: totalLessons.toString() },
              { label: 'Frameworks', value: '35' },
            ].map(s => (
              <div key={s.label} className="ui-card px-4 py-3 text-center">
                <p className="font-mono text-2xl font-bold text-foreground" style={{ letterSpacing: '-0.03em' }}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>



        {/* ── Domain Grid ─────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">All 18 Domains</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any domain to explore its full curriculum
            </p>
          </div>
          <LearnDomainGrid />
        </section>

      </main>
    </div>
  );
}
