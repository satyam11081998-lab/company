'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ALL_DOMAINS } from '@/lib/curriculum';
import type { CaseRow } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shuffle, ExternalLink, Activity, Calculator, Briefcase, FileText, Check, CheckCircle2, Filter } from 'lucide-react';

interface PracticeHubProps {
  cases: CaseRow[]; // From database (Scored Cases)
  attemptedCaseIds?: string[];
  initialTab?: string;
}

type TabType = 'all' | 'scored' | 'guesstimates' | 'studies' | 'attempted';

const ALL_CASE_STUDIES = ALL_DOMAINS.flatMap(d => d.cases || []);
const ALL_DOMAINS_VALUE = '__all__';

export default function PracticeHub({ cases, attemptedCaseIds = [], initialTab = 'all' }: PracticeHubProps) {
  const searchParams = useSearchParams();
  const focusDomain = searchParams?.get('focus') || null;
  const focusTab = searchParams?.get('tab') as TabType | null;

  // Use initialTab if provided (handles server-side resolving of ?type=guesstimate), fallback to focusTab
  const [activeTab, setActiveTab] = useState<TabType>((initialTab as TabType) || focusTab || 'all');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>(focusDomain || ALL_DOMAINS_VALUE);
  const [page, setPage] = useState(1);

  const attemptedSet = useMemo(() => new Set(attemptedCaseIds), [attemptedCaseIds]);

  // Reset page when search, tab, or domain changes (side effect → useEffect, not useMemo)
  useEffect(() => { setPage(1); }, [search, activeTab, domainFilter]);

  // Domain dropdown options: every distinct scored-case type + case-study sector.
  const domainOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of cases) {
      if (c.type && c.type !== 'guesstimate') set.add(c.type);
    }
    for (const s of ALL_CASE_STUDIES) {
      if (s.sector) set.add(s.sector);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [cases]);

  const domainActive = domainFilter !== ALL_DOMAINS_VALUE;

  // Filtering — search + domain only. Attempted-state split happens after,
  // so both the default (unattempted) views and the Attempted tab reuse it.
  const matchedScored = useMemo(() => {
    return cases.filter(c => {
      if (c.type === 'guesstimate') return false;
      if (domainActive && c.type !== domainFilter) return false;
      return c.title.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase());
    });
  }, [cases, search, domainActive, domainFilter]);

  // Guesstimates are real, attemptable `cases` rows (type='guesstimate'). They carry
  // no domain, so any active domain filter hides them — showing "Profitability"
  // guesstimates would be a lie.
  const matchedGuesstimates = useMemo(() => {
    if (domainActive) return [];
    return cases.filter(c =>
      c.type === 'guesstimate' &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
       (c.code ?? '').toLowerCase().includes(search.toLowerCase()))
    );
  }, [cases, search, domainActive]);

  const filteredStudies = useMemo(() => {
    return ALL_CASE_STUDIES.filter(c => {
      if (domainActive && c.sector !== domainFilter) return false;
      return c.title.toLowerCase().includes(search.toLowerCase()) || c.sector.toLowerCase().includes(search.toLowerCase());
    });
  }, [search, domainActive, domainFilter]);

  // Attempted cases live ONLY in the Attempted tab; default views show fresh items.
  const filteredScored = useMemo(
    () => matchedScored.filter(c => !attemptedSet.has(c.id)),
    [matchedScored, attemptedSet]
  );
  const filteredGuesstimates = useMemo(
    () => matchedGuesstimates.filter(g => !attemptedSet.has(g.id)),
    [matchedGuesstimates, attemptedSet]
  );
  const attemptedItems = useMemo(() => {
    return [
      ...matchedScored.filter(c => attemptedSet.has(c.id)).map(c => ({ ...c, _itemType: 'scored' })),
      ...matchedGuesstimates.filter(g => attemptedSet.has(g.id)).map(g => ({ ...g, _itemType: 'guesstimate' })),
    ];
  }, [matchedScored, matchedGuesstimates, attemptedSet]);

  const handleRandomize = () => {
    let pool: any[] = [];
    if (activeTab === 'all') pool = [...filteredScored, ...filteredGuesstimates, ...filteredStudies];
    else if (activeTab === 'scored') pool = filteredScored;
    else if (activeTab === 'guesstimates') pool = filteredGuesstimates;
    else if (activeTab === 'studies') pool = filteredStudies;
    else if (activeTab === 'attempted') pool = attemptedItems;

    if (pool.length === 0) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    if (item?.id) {
      window.location.href = `/cases/${item.id}`;
    } else if (item?.code) {
      window.location.href = `/learn/practice-case-library#${item.code}`;
    }
  };

  const allItems = useMemo(() => {
    if (activeTab === 'attempted') return attemptedItems;
    const items: any[] = [];
    if (activeTab === 'all' || activeTab === 'scored') {
      items.push(...filteredScored.map(c => ({ ...c, _itemType: 'scored' })));
    }
    if (activeTab === 'all' || activeTab === 'guesstimates') {
      items.push(...filteredGuesstimates.map(g => ({ ...g, _itemType: 'guesstimate' })));
    }
    if (activeTab === 'all' || activeTab === 'studies') {
      items.push(...filteredStudies.map(s => ({ ...s, _itemType: 'study' })));
    }
    return items;
  }, [activeTab, filteredScored, filteredGuesstimates, filteredStudies, attemptedItems]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const paginatedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
          <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<Activity className="w-4 h-4" />}>All</TabButton>
          <TabButton active={activeTab === 'scored'} onClick={() => setActiveTab('scored')} icon={<Briefcase className="w-4 h-4" />}>Scored Cases</TabButton>
          <TabButton active={activeTab === 'guesstimates'} onClick={() => setActiveTab('guesstimates')} icon={<Calculator className="w-4 h-4" />}>Guesstimates</TabButton>
          <TabButton active={activeTab === 'studies'} onClick={() => setActiveTab('studies')} icon={<FileText className="w-4 h-4" />}>Case Studies</TabButton>
          <TabButton active={activeTab === 'attempted'} onClick={() => setActiveTab('attempted')} icon={<CheckCircle2 className="w-4 h-4" />}>
            Attempted{attemptedCaseIds.length > 0 ? ` (${attemptedCaseIds.length})` : ''}
          </TabButton>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            {/* @ts-ignore */}
            <SelectTrigger className="h-10 w-full sm:w-48" aria-label="Filter by domain">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All domains" />
              </div>
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {/* @ts-ignore */}
              <SelectItem value={ALL_DOMAINS_VALUE}>All domains</SelectItem>
              {domainOptions.map((d) => (
                // @ts-ignore
                <SelectItem key={d} value={d}>{titleCase(d)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by keyword..."
                className="h-10 w-full sm:w-56 rounded-md border border-input bg-background pl-9 pr-4 text-body shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 gap-2 shrink-0" onClick={handleRandomize}>
              <Shuffle className="h-4 w-4" />
              <span className="hidden sm:inline">Randomize</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {paginatedItems.map((item) => {
          if (item._itemType === 'scored') {
            const c = item as CaseRow;
            return (
              <Card key={`scored-${c.id}`} className="ui-card flex flex-col p-5 group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className={`tag-${getTopicColor(c.type)} px-2 py-1 rounded text-micro uppercase tracking-wide font-medium`}>
                    {c.type}
                  </span>
                  <div className="flex items-center gap-2">
                    {attemptedSet.has(c.id) && (
                      <span className="inline-flex items-center gap-1 text-micro font-bold text-success bg-success/15 px-2 py-1 rounded uppercase tracking-widest">
                        <Check className="h-3 w-3" /> Attempted
                      </span>
                    )}
                    <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {c.difficulty}
                    </span>
                  </div>
                </div>
                <h3 className="text-strong font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                {c.type !== 'guesstimate' && (
                  <p className="text-body text-muted-foreground line-clamp-2 mb-4 flex-grow">{plainPreview(c.content)}</p>
                )}
                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <span className="text-small text-muted-foreground">Scored by MECE</span>
                   </div>
                   <Link href={`/cases/${c.id}`} className="text-small font-medium text-primary hover:underline">{attemptedSet.has(c.id) ? 'Retry' : 'Practice'} &rarr;</Link>
                </div>
              </Card>
            );
          }
          if (item._itemType === 'guesstimate') {
            const g = item as CaseRow;
            const attempted = attemptedSet.has(g.id);
            return (
              <Card key={`guesstimate-${g.id}`} className="ui-card flex flex-col p-5 group hover:border-navy/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="tag-navy px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                    Guesstimate{g.difficulty ? ` · ${g.difficulty}` : ''}
                  </span>
                  {attempted && (
                    <span className="inline-flex items-center gap-1 text-micro font-bold text-success bg-success/15 px-2 py-0.5 rounded uppercase tracking-widest">
                      <Check className="h-3.5 w-3.5" /> Attempted
                    </span>
                  )}
                </div>
                <h3 className="text-strong font-semibold text-foreground mb-2 group-hover:text-navy transition-colors">{g.title}</h3>
                <div className="mb-4 flex-grow" />
                <div className="mt-auto pt-4 border-t flex justify-between items-center bg-navy/5 -mx-5 -mb-5 px-5 py-3 rounded-b-xl border-t-navy/10">
                  {g.code ? (
                    <Link href={`/learn/guesstimates-market-sizing#${g.code}`} className="text-small font-medium text-muted-foreground hover:text-navy hover:underline shrink-0">Walkthrough</Link>
                  ) : <span />}
                  <Link href={`/cases/${g.id}`} className="text-small font-medium text-navy hover:underline shrink-0">{attempted ? 'Retry' : 'Solve'} &rarr;</Link>
                </div>
              </Card>
            );
          }
          if (item._itemType === 'study') {
            const s = item as any;
            return (
              <Card key={`study-${s.code}`} className="ui-card flex flex-col p-5 group hover:border-foreground/20 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="tag-amber px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                    Case Study
                  </span>
                  <button title="View source methodology" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-strong font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-body text-muted-foreground line-clamp-2 mb-4 flex-grow">{s.problem}</p>
                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                   <span className="text-small text-muted-foreground">{s.sector}</span>
                   <Link href={`/learn/practice-case-library#${s.code}`} className="text-small font-medium text-foreground hover:underline">Read &rarr;</Link>
                </div>
              </Card>
            );
          }
          return null;
        })}

        {allItems.length === 0 && (
          <div className="col-span-full py-12 text-center">
            {activeTab === 'attempted' ? (
              <>
                <p className="text-body text-muted-foreground">
                  {attemptedCaseIds.length === 0
                    ? 'Nothing attempted yet — solve your first case and it will land here.'
                    : 'No attempted cases match your filters.'}
                </p>
                {attemptedCaseIds.length === 0 ? (
                  <Button variant="link" onClick={() => setActiveTab('all')} className="mt-2 text-primary">Browse cases</Button>
                ) : (
                  <Button variant="link" onClick={() => { setSearch(''); setDomainFilter(ALL_DOMAINS_VALUE); }} className="mt-2 text-primary">Clear filters</Button>
                )}
              </>
            ) : (
              <>
                <p className="text-body text-muted-foreground">No practice items found matching your filters.</p>
                <Button variant="link" onClick={() => { setSearch(''); setDomainFilter(ALL_DOMAINS_VALUE); }} className="mt-2 text-primary">Clear filters</Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-8 col-span-full">
          <Button
            variant="outline"
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === 1}
          >
            Previous
          </Button>

          <div className="flex flex-wrap items-center justify-center gap-1 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => {
                let start = Math.floor((page - 1) / 3) * 3 + 1;
                let end = Math.min(totalPages, start + 4);

                // If we are near the end and have fewer than 5 pages in this window,
                // shift the start back so we always show up to 5 pages if they exist.
                if (end - start < 4) {
                  start = Math.max(1, end - 4);
                }

                return p >= start && p <= end;
              })
              .map(p => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  className="w-10 h-10 p-0"
                  onClick={() => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {p}
                </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 md:py-2 rounded-full text-small font-semibold transition-all shrink-0 whitespace-nowrap ${
        active ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function getTopicColor(topic: string) {
  const t = topic.toLowerCase();
  if (t.includes('profitability')) return 'red';
  if (t.includes('market entry') || t.includes('growth')) return 'green';
  if (t.includes('pricing') || t.includes('finance')) return 'amber';
  if (t.includes('product') || t.includes('tech')) return 'navy';
  return 'muted'; // fallback
}

/**
 * Strip markdown so card previews never show raw syntax. Some cases (especially
 * daily news-derived ones) store markdown in `content` — e.g. "# UPI at 10…
 * **Source:** Livemint…" — which leaked into the line-clamped card body.
 */
function plainPreview(md?: string | null): string {
  if (!md) return '';
  return md
    .replace(/```[\s\S]*?```/g, ' ')              // fenced code
    .replace(/`([^`]+)`/g, '$1')                   // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')         // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')       // links → text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')            // headings
    .replace(/^\s{0,3}>\s?/gm, '')                 // blockquotes
    .replace(/^\s*[-*+]\s+/gm, '')                 // list bullets
    .replace(/\*\*([^*]+)\*\*/g, '$1')             // bold **
    .replace(/__([^_]+)__/g, '$1')                 // bold __
    .replace(/\*([^*]+)\*/g, '$1')                 // italic *
    .replace(/^\s*\*{0,2}source:?\*{0,2}.*$/gim, '') // "**Source:**" lines
    .replace(/\s+/g, ' ')                          // collapse whitespace
    .trim();
}
