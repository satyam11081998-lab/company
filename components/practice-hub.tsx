'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ALL_DOMAINS } from '@/lib/curriculum';
import type { CaseRow } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Shuffle, ExternalLink, Activity, Calculator, Briefcase, FileText, Check } from 'lucide-react';

interface PracticeHubProps {
  cases: CaseRow[]; // From database (Scored Cases)
  attemptedCaseIds?: string[];
}

type TabType = 'all' | 'scored' | 'guesstimates' | 'studies';

const ALL_GUESSTIMATES = ALL_DOMAINS.flatMap(d => d.guesstimates || []);
const ALL_CASE_STUDIES = ALL_DOMAINS.flatMap(d => d.cases || []);

export default function PracticeHub({ cases, attemptedCaseIds = [] }: PracticeHubProps) {
  const searchParams = useSearchParams();
  const focusDomain = searchParams?.get('focus') || null;
  const focusTab = searchParams?.get('tab') as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>(focusTab || 'all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (focusDomain) {
      console.warn(`Focus param '?focus=${focusDomain}' ignored: practice-hub doesn't support domain filtering for cases yet. Will wire this after DB migration is fully wired.`);
    }
  }, [focusDomain]);

  // Reset page when search or tab changes
  useMemo(() => { setPage(1); }, [search, activeTab]);

  // Filtering
  const filteredScored = useMemo(() => {
    return cases.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [cases, search]);

  const filteredGuesstimates = useMemo(() => {
    return ALL_GUESSTIMATES.filter(g => 
      g.title.toLowerCase().includes(search.toLowerCase()) || 
      g.approach.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredStudies = useMemo(() => {
    return ALL_CASE_STUDIES.filter(c => 
      c.title.toLowerCase().includes(search.toLowerCase()) || 
      c.sector.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleRandomize = () => {
    let pool: any[] = [];
    if (activeTab === 'all') pool = [...filteredScored, ...filteredGuesstimates, ...filteredStudies];
    else if (activeTab === 'scored') pool = filteredScored;
    else if (activeTab === 'guesstimates') pool = filteredGuesstimates;
    else if (activeTab === 'studies') pool = filteredStudies;

    if (pool.length === 0) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    
    // Simplistic random action: just alert or trigger click
    alert(`Randomly selected: ${item.title}`);
  };

  const allItems = useMemo(() => {
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
  }, [activeTab, filteredScored, filteredGuesstimates, filteredStudies]);

  const itemsPerPage = 9;
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const paginatedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<Activity className="w-4 h-4" />}>All</TabButton>
          <TabButton active={activeTab === 'scored'} onClick={() => setActiveTab('scored')} icon={<Briefcase className="w-4 h-4" />}>Scored Cases</TabButton>
          <TabButton active={activeTab === 'guesstimates'} onClick={() => setActiveTab('guesstimates')} icon={<Calculator className="w-4 h-4" />}>Guesstimates</TabButton>
          <TabButton active={activeTab === 'studies'} onClick={() => setActiveTab('studies')} icon={<FileText className="w-4 h-4" />}>Case Studies</TabButton>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by keyword..." 
              className="h-10 w-full sm:w-64 rounded-md border border-input bg-background pl-9 pr-4 text-body shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                  <span className="text-micro font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                    {c.difficulty}
                  </span>
                </div>
                <h3 className="text-strong font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{c.title}</h3>
                <p className="text-body text-muted-foreground line-clamp-2 mb-4 flex-grow">{c.content}</p>
                <div className="mt-auto pt-4 border-t flex justify-between items-center">
                   <div className="flex items-center gap-2">
                     <span className="text-small text-muted-foreground">Scored by MECE</span>
                     {attemptedCaseIds.includes(c.id) && (
                       <span className="inline-flex items-center gap-1 text-micro font-semibold text-success">
                         <Check className="h-3 w-3" /> Attempted
                       </span>
                     )}
                   </div>
                   <Link href={`/cases/${c.id}`} className="text-small font-medium text-primary hover:underline">Practice &rarr;</Link>
                </div>
              </Card>
            );
          }
          if (item._itemType === 'guesstimate') {
            const g = item as any;
            return (
              <Card key={`guesstimate-${g.code}`} className="ui-card flex flex-col p-5 group hover:border-navy/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="tag-navy px-2 py-1 rounded text-micro uppercase tracking-wide font-medium">
                    Guesstimate
                  </span>
                  <button title="View source methodology" className="text-muted-foreground hover:text-navy transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-strong font-semibold text-foreground mb-2 group-hover:text-navy transition-colors">{g.title}</h3>
                <div className="mb-4 flex-grow">
                  <p className="text-body text-muted-foreground mb-2"><span className="font-medium text-foreground">Approach:</span> {g.approach}</p>
                  <p className="text-small text-muted-foreground line-clamp-2">{g.keyDetail}</p>
                </div>
                <div className="mt-auto pt-4 border-t flex justify-between items-center bg-navy/5 -mx-5 -mb-5 px-5 py-3 rounded-b-xl border-t-navy/10">
                   <span className="text-small font-medium text-navy truncate pr-4">{g.result}</span>
                   <Link href={`/learn/guesstimates#${g.code}`} className="text-small font-medium text-navy hover:underline shrink-0">Walkthrough</Link>
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
                   <Link href={`/learn/case-studies#${s.code}`} className="text-small font-medium text-foreground hover:underline">Read &rarr;</Link>
                </div>
              </Card>
            );
          }
          return null;
        })}

        {allItems.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-body text-muted-foreground">No practice items found matching your search.</p>
            <Button variant="link" onClick={() => setSearch('')} className="mt-2 text-primary">Clear search</Button>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 col-span-full">
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
          
          <div className="flex items-center gap-1 mx-2">
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
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-small font-semibold transition-all ${
        active ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function getTopicColor(topic: string) {
  const t = topic.toLowerCase();
  if (t.includes('profitability')) return 'red';
  if (t.includes('market entry') || t.includes('growth')) return 'green';
  if (t.includes('pricing') || t.includes('finance')) return 'amber';
  if (t.includes('product') || t.includes('tech')) return 'navy';
  return 'muted'; // fallback
}
