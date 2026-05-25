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
} from 'lucide-react';
import { MECEDiagram, ProfitabilityTree, IssueTree, HypothesisDriven, MintoPyramid } from '@/components/framework-diagrams';
import type {
  Domain,
  Module,
  Lesson,
  CaseEntry,
  GuessEntry,
  CompanyProfile,
  LearningPath,
} from '@/lib/curriculum/types';

/* ================================================================
   Props
   ================================================================ */

interface DomainViewerProps {
  domain: Domain;
  allDomains: Domain[];
  learningPaths: LearningPath[];
}

/* ================================================================
   Helpers
   ================================================================ */

function approachTag(approach: string) {
  const lower = approach.toLowerCase();
  if (lower.includes('demand')) return 'tag tag-green';
  if (lower.includes('supply')) return 'tag tag-amber';
  return 'tag tag-navy';
}

/* ================================================================
   Recursive Lesson Tree
   ================================================================ */

function LessonTree({ lessons, depth = 0 }: { lessons: Lesson[]; depth?: number }) {
  if (!lessons || lessons.length === 0) return null;
  return (
    <ul className={`space-y-1 ${depth > 0 ? 'ml-5 border-l border-border pl-4' : ''}`}>
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <div className="flex items-start gap-2 py-1">
            <span className="font-mono text-[11px] text-muted-foreground/60 flex-shrink-0 mt-0.5">
              {lesson.id}
            </span>
            <span className="text-sm text-foreground/80 leading-snug">{lesson.title}</span>
          </div>
          {lesson.children && lesson.children.length > 0 && (
            <LessonTree lessons={lesson.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

/* ================================================================
   Expandable Case Card
   ================================================================ */

function CaseCard({ entry }: { entry: CaseEntry }) {
  const [open, setOpen] = useState(false);

  const fields: { key: keyof CaseEntry; label: string }[] = [
    { key: 'problem', label: 'Problem' },
    { key: 'rootCause', label: 'Root Cause' },
    { key: 'keyInsight', label: 'Key Insight' },
    { key: 'framework', label: 'Framework' },
    { key: 'resolution', label: 'Resolution' },
    { key: 'math', label: 'Math' },
    { key: 'risks', label: 'Risks' },
    { key: 'breakEven', label: 'Break-Even' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'channels', label: 'Channels' },
    { key: 'targetSegments', label: 'Target Segments' },
    { key: 'exitOptions', label: 'Exit Options' },
    { key: 'approach', label: 'Approach' },
    { key: 'result', label: 'Result' },
    { key: 'keyAssumptions', label: 'Key Assumptions' },
    { key: 'valuePricing', label: 'Value Pricing' },
    { key: 'hiddenCost', label: 'Hidden Cost' },
    { key: 'features', label: 'Features' },
  ];

  return (
    <div className="ui-card p-4 hover:shadow-sm transition-shadow">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2 flex-wrap">
          <span className="tag tag-navy text-[10px]">{entry.code}</span>
          {entry.sector && (
            <span className="tag tag-red text-[10px]">{entry.sector}</span>
          )}
          {entry.source && (
            <span className="tag tag-green text-[10px]">{entry.source}</span>
          )}
          <span className="ml-auto mt-0.5">
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </div>
        <h4 className="text-sm font-bold text-foreground mt-2 leading-snug">
          {entry.title}
        </h4>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-2.5 pt-2 border-t border-border">
          {fields.map(({ key, label }) => {
            const val = entry[key];
            if (!val) return null;
            return (
              <div key={key}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed mt-0.5">{val}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Guesstimate Card
   ================================================================ */

function GuessCard({ entry }: { entry: GuessEntry }) {
  return (
    <div className="ui-card p-4">
      <div className="flex items-start gap-2 flex-wrap">
        <span className="tag tag-navy text-[10px]">{entry.code}</span>
        <span className={`${approachTag(entry.approach)} text-[10px]`}>
          {entry.approach}
        </span>
      </div>
      <h4 className="text-sm font-bold text-foreground mt-2 leading-snug">{entry.title}</h4>
      {entry.keyDetail && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.keyDetail}</p>
      )}
      <p className="font-mono text-sm font-bold text-foreground mt-2">{entry.result}</p>
    </div>
  );
}

/* ================================================================
   Company Profile Card
   ================================================================ */

function CompanyCard({ company }: { company: CompanyProfile }) {
  return (
    <div className="ui-card p-5 space-y-3">
      <div>
        <h4 className="text-lg font-bold text-foreground">{company.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Founded {company.founded} · Revenue {company.revenue}
          {company.presence && ` · ${company.presence}`}
        </p>
      </div>

      {company.vision && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vision</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.vision}</p>
        </div>
      )}
      {company.mission && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Mission</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.mission}</p>
        </div>
      )}
      {company.purpose && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Purpose</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.purpose}</p>
        </div>
      )}

      {company.values && company.values.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Values</p>
          <div className="flex flex-wrap gap-1.5">
            {company.values.map((v) => (
              <span key={v} className="badge-pill text-[10px]">{v}</span>
            ))}
          </div>
        </div>
      )}

      {company.csr && company.csr.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">CSR</p>
          <ul className="space-y-0.5">
            {company.csr.map((item, i) => (
              <li key={i} className="text-sm text-foreground/80 flex items-start gap-1.5">
                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Extra fields */}
      {company.keyProducts && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Key Products</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.keyProducts}</p>
        </div>
      )}
      {company.subsidiaries && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Subsidiaries</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.subsidiaries}</p>
        </div>
      )}
      {company.sectors && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Sectors</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.sectors}</p>
        </div>
      )}
      {company.chairman && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Chairman</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.chairman}</p>
        </div>
      )}
      {company.employees && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Employees</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.employees}</p>
        </div>
      )}
      {company.marketCap && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Market Cap</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.marketCap}</p>
        </div>
      )}
      {company.extra && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Additional</p>
          <p className="text-sm text-foreground/80 mt-0.5">{company.extra}</p>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Main Component
   ================================================================ */

export default function DomainViewer({ domain, allDomains, learningPaths }: DomainViewerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedModules(new Set(domain.modules.map((m) => m.id)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── A. Back Navigation ──────────────────────────────────── */}
      <Link
        href="/learn"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        All Domains
      </Link>

      {/* ── B. Domain Header ───────────────────────────────────── */}
      <div>
        <span className="badge-pill font-mono text-[11px] mb-2 inline-block">
          {domain.code}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {domain.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {domain.level}
          {domain.prereqs && domain.prereqs !== 'None' && (
            <> · Prereqs: {domain.prereqs}</>
          )}
        </p>
        {domain.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {domain.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── C. Grid: Sidebar + Content ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground ui-card px-3 py-2 w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Browse Domains
          </span>
          {sidebarOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block`}
        >
          <div className="ui-card p-2 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-0.5">
            {allDomains.map((d) => {
              const isCurrent = d.slug === domain.slug;
              return (
                <Link
                  key={d.slug}
                  href={`/learn/${d.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="font-mono text-[10px] flex-shrink-0 w-6 opacity-70">
                    {d.code}
                  </span>
                  <span className="truncate">{d.title}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main content area */}
        <div className="space-y-10 min-w-0">
          {/* ── 1. Modules Section ──────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Modules
                </h2>
                <span className="text-xs text-muted-foreground">({domain.modules.length})</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Expand all
                </button>
                <span className="text-muted-foreground/30">|</span>
                <button
                  onClick={collapseAll}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  Collapse all
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {domain.modules.map((mod) => {
                const isExpanded = expandedModules.has(mod.id);
                return (
                  <div key={mod.id} className="ui-card overflow-hidden">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="badge-pill font-mono text-[10px] flex-shrink-0">
                        {mod.id}
                      </span>
                      <span className="text-sm font-semibold text-foreground">{mod.title}</span>
                      {mod.lessons.length > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
                          {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {mod.lessons.length > 0 && (
                        <div className="px-4 pb-4 pt-1">
                          <LessonTree lessons={mod.lessons} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 2. Cases Section ────────────────────────────────── */}
          {domain.cases && domain.cases.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Practice Cases
                </h2>
                <span className="text-xs text-muted-foreground">({domain.cases.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domain.cases.map((c) => (
                  <CaseCard key={c.code} entry={c} />
                ))}
              </div>
            </section>
          )}

          {/* ── 3. Guesstimates Section ────────────────────────── */}
          {domain.guesstimates && domain.guesstimates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Guesstimate Bank
                </h2>
                <span className="text-xs text-muted-foreground">({domain.guesstimates.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domain.guesstimates.map((g) => (
                  <GuessCard key={g.code} entry={g} />
                ))}
              </div>
            </section>
          )}

          {/* ── 4. Company Profiles ────────────────────────────── */}
          {domain.companies && domain.companies.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Company Profiles
                </h2>
                <span className="text-xs text-muted-foreground">({domain.companies.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domain.companies.map((c) => (
                  <CompanyCard key={c.name} company={c} />
                ))}
              </div>
            </section>
          )}

          {/* ── 5. GD Topics ───────────────────────────────────── */}
          {domain.gdTopics && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Group Discussion Topics
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {domain.gdTopics.caseBased && domain.gdTopics.caseBased.length > 0 && (
                  <div className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Case-Based</h3>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {domain.gdTopics.caseBased.map((t, i) => (
                        <li key={i} className="text-sm text-foreground/80 leading-snug">
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {domain.gdTopics.tasEthics && domain.gdTopics.tasEthics.length > 0 && (
                  <div className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">TAS Ethics</h3>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {domain.gdTopics.tasEthics.map((t, i) => (
                        <li key={i} className="text-sm text-foreground/80 leading-snug">
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {domain.gdTopics.abstract && domain.gdTopics.abstract.length > 0 && (
                  <div className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Abstract</h3>
                    <ol className="space-y-1.5 list-decimal list-inside">
                      {domain.gdTopics.abstract.map((t, i) => (
                        <li key={i} className="text-sm text-foreground/80 leading-snug">
                          {t}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 6. Question Bank ───────────────────────────────── */}
          {domain.questionBank && domain.questionBank.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Question Bank
                </h2>
              </div>
              <div className="space-y-4">
                {domain.questionBank.map((cat) => (
                  <div key={cat.category} className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">{cat.category}</h3>
                    <ul className="space-y-1">
                      {cat.questions.map((q, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground/80 leading-snug flex items-start gap-2"
                        >
                          <span className="text-muted-foreground/40 flex-shrink-0 font-mono text-[10px] mt-0.5">
                            {i + 1}.
                          </span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 7. Amazon LPs ──────────────────────────────────── */}
          {domain.amazonLPs && domain.amazonLPs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Library className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Amazon Leadership Principles
                </h2>
              </div>
              <div className="ui-card p-4">
                <ul className="space-y-1.5">
                  {domain.amazonLPs.map((lp, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 leading-snug flex items-start gap-2"
                    >
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      {lp}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── 8. Benchmark Sections ──────────────────────────── */}
          {domain.benchmarkSections && domain.benchmarkSections.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Benchmarks
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domain.benchmarkSections.map((sec) => (
                  <div key={sec.title} className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">{sec.title}</h3>
                    <ul className="space-y-1">
                      {sec.stats.map((stat, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground/80 leading-snug flex items-start gap-2"
                        >
                          <span className="text-primary flex-shrink-0 mt-1">•</span>
                          {stat}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 9. SaaS Benchmarks ─────────────────────────────── */}
          {domain.saasBenchmarks && domain.saasBenchmarks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  SaaS Benchmarks
                </h2>
              </div>
              <div className="ui-card p-4">
                <ul className="space-y-1.5">
                  {domain.saasBenchmarks.map((b, i) => (
                    <li
                      key={i}
                      className="text-sm text-foreground/80 leading-snug flex items-start gap-2"
                    >
                      <span className="text-primary flex-shrink-0 mt-1">•</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── 10. Customer Sat Cases ─────────────────────────── */}
          {domain.customerSatCases && domain.customerSatCases.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Customer Satisfaction Cases
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({domain.customerSatCases.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domain.customerSatCases.map((c) => (
                  <CaseCard key={c.code} entry={c} />
                ))}
              </div>
            </section>
          )}

          {/* ── 11. Competition Summaries ──────────────────────── */}
          {domain.competitionSummaries && domain.competitionSummaries.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Case Competition Summaries
                </h2>
                <span className="text-xs text-muted-foreground">
                  ({domain.competitionSummaries.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domain.competitionSummaries.map((c) => (
                  <CaseCard key={c.code} entry={c} />
                ))}
              </div>
            </section>
          )}

          {/* ── 11.5 Framework Diagrams ─────────────────────────────────────── */}
          {['case-interview-methodology', 'profitability', 'frameworks-mental-models', 'guesstimates-market-sizing', 'consulting-foundations'].includes(domain.slug) && (
            <section className="mb-8">
              <h3 className="text-lg font-bold text-foreground mb-4 tracking-tight flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" /> Core Framework
              </h3>
              <div className="ui-card p-6 bg-background flex justify-center">
                {domain.slug === 'case-interview-methodology' && <MECEDiagram />}
                {domain.slug === 'profitability' && <ProfitabilityTree />}
                {domain.slug === 'frameworks-mental-models' && <IssueTree />}
                {domain.slug === 'guesstimates-market-sizing' && <HypothesisDriven />}
                {domain.slug === 'consulting-foundations' && <MintoPyramid />}
              </div>
            </section>
          )}

          {/* ── 12. Interactive Opportunities ────────────────────── */}
          {(domain.quizOpportunities || domain.diagramOpportunity || domain.flashcardOpportunities) && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ExternalLink className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Learning Opportunities
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {domain.quizOpportunities && (
                  <div className="ui-card p-4">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Quiz Opportunities
                    </p>
                    <p className="text-sm text-foreground/80">{domain.quizOpportunities}</p>
                  </div>
                )}
                {domain.diagramOpportunity && (
                  <div className="ui-card p-4">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Diagram Opportunity
                    </p>
                    <p className="text-sm text-foreground/80">{domain.diagramOpportunity}</p>
                  </div>
                )}
                {domain.flashcardOpportunities && (
                  <div className="ui-card p-4">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                      Flashcard Opportunities
                    </p>
                    <p className="text-sm text-foreground/80">{domain.flashcardOpportunities}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── 13. Notes ──────────────────────────────────────── */}
          {domain.notes && (
            <section>
              <div className="ui-card p-5">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {domain.notes}
                </p>
              </div>
            </section>
          )}

          {/* ── Resources ──────────────────────────────────────── */}
          {domain.resources && domain.resources.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Library className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Resources
                </h2>
              </div>
              <div className="space-y-4">
                {domain.resources.map((res) => (
                  <div key={res.category} className="ui-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-2">{res.category}</h3>
                    <ul className="space-y-1">
                      {res.items.map((item, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground/80 leading-snug flex items-start gap-2"
                        >
                          <span className="text-primary flex-shrink-0 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Quiz Types ─────────────────────────────────────── */}
          {domain.quizTypes && domain.quizTypes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Quiz Types
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {domain.quizTypes.map((qt) => (
                  <div key={qt.code} className="ui-card p-4">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="tag tag-navy text-[10px]">{qt.code}</span>
                      <span className="text-sm font-bold text-foreground">{qt.name}</span>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1">{qt.example}</p>
                    {qt.answer && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-semibold">Answer:</span> {qt.answer}
                      </p>
                    )}
                    {qt.explanation && (
                      <p className="text-xs text-muted-foreground mt-0.5">{qt.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Flashcard Decks ────────────────────────────────── */}
          {domain.flashcardDecks && domain.flashcardDecks.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Flashcard Decks
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {domain.flashcardDecks.map((deck) => (
                  <div key={deck.name} className="ui-card p-4 text-center">
                    <p className="text-sm font-bold text-foreground">{deck.name}</p>
                    <p className="font-mono text-lg font-bold text-primary mt-1">{deck.cardCount}</p>
                    <p className="text-[10px] text-muted-foreground">cards</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Sectors ────────────────────────────────────────── */}
          {domain.sectors && domain.sectors.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  Industry Sectors
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {domain.sectors.map((s) => (
                  <span key={s} className="badge-pill text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
