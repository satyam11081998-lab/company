import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppNav from '@/components/app-nav';
import type { UserRow } from '@/lib/types';
import { ALL_DOMAINS, PLATFORM_STATS, LEARNING_PATHS } from '@/lib/curriculum';
import {
  BookOpen, Target, Layers, TrendingUp, DollarSign, Settings,
  GitMerge, Lightbulb, BarChart3, Users, MessageSquare, Building2,
  Calculator, Cpu, MapPin, Library, ArrowRight, Clock, Zap,
  Award, Crown, Rocket,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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

const PATH_ICONS: Record<string, React.ElementType> = {
  A: BookOpen,
  B: Target,
  C: BarChart3,
  D: Building2,
  E: Crown,
};

export default async function LearnPage() {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect('/login');

  const userRes = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
  const userRow = userRes.data as UserRow | null;

  return (
    <div className="min-h-screen">
      <AppNav user={userRow} />

      <main className="container max-w-6xl py-10 space-y-12">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-pill">
              <Zap className="h-3.5 w-3.5" />
              AI-Native Consulting Prep
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            ConsultEdge Curriculum
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground max-w-2xl leading-relaxed">
            18 learning domains, 240+ lessons, 75+ structured cases, 60+ guesstimates,
            35 frameworks, and 14 company profiles — everything you need to crack
            consulting interviews and case competitions.
          </p>

          {/* Stats strip */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Domains', value: '18' },
              { label: 'Cases', value: '75+' },
              { label: 'Guesstimates', value: '60+' },
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

        {/* ── Learning Paths ──────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Learning Paths</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Structured tracks for different goals</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEARNING_PATHS.map((path) => {
              const PathIcon = PATH_ICONS[path.id] || BookOpen;
              return (
                <div key={path.id} className="ui-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <PathIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{path.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{path.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {path.weeks.slice(0, 3).map((w, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="font-semibold text-muted-foreground flex-shrink-0 w-14">{w.week}</span>
                        <span className="text-foreground/70 leading-snug">{w.content}</span>
                      </div>
                    ))}
                    {path.weeks.length > 3 && (
                      <p className="text-xs text-muted-foreground/60">+{path.weeks.length - 3} more weeks...</p>
                    )}
                  </div>
                  <div className="mt-auto pt-2 border-t border-border">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground leading-snug">{path.milestone}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Domain Grid ─────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">All 18 Domains</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any domain to explore its full curriculum
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_DOMAINS.map((domain, idx) => {
              const DIcon = DOMAIN_ICONS[domain.slug] || BookOpen;
              const accent = DOMAIN_ACCENTS[idx % DOMAIN_ACCENTS.length];
              const caseCount = (domain.cases?.length || 0) +
                (domain.guesstimates?.length || 0) +
                (domain.customerSatCases?.length || 0) +
                (domain.competitionSummaries?.length || 0);

              return (
                <Link
                  key={domain.code}
                  href={`/learn/${domain.slug}`}
                  className="ui-card p-5 group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
                      <DIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted-foreground/50 font-mono">{domain.code}</span>
                        <span className="text-[10px] text-muted-foreground/40">•</span>
                        <span className="text-[10px] text-muted-foreground/60">{domain.level}</span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground mt-0.5 leading-snug group-hover:text-primary transition-colors">
                        {domain.title}
                      </h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </div>

                  {/* Meta row */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{domain.modules.length} modules</span>
                    {caseCount > 0 && (
                      <>
                        <span className="text-border">•</span>
                        <span>{caseCount} practice items</span>
                      </>
                    )}
                  </div>

                  {/* Tags */}
                  {domain.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
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
                </Link>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
