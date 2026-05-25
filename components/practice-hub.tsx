'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ALL_DOMAINS } from '@/lib/curriculum';
import type { CaseRow } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Shuffle, ExternalLink, Activity, Calculator, Briefcase, FileText } from 'lucide-react';

interface PracticeHubProps {
  cases: CaseRow[]; // From database (Scored Cases)
}

type TabType = 'all' | 'scored' | 'guesstimates' | 'studies';

const ALL_GUESSTIMATES = ALL_DOMAINS.flatMap(d => d.guesstimates || []);
const ALL_CASE_STUDIES = ALL_DOMAINS.flatMap(d => d.cases || []);

export default function PracticeHub({ cases }: PracticeHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-background/50 backdrop-blur-sm rounded-lg border">
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
        {(activeTab === 'all' || activeTab === 'scored') && filteredScored.map((c) => (
          <Card key={c.id} className="ui-card flex flex-col p-5 group hover:border-primary/50 transition-colors">
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
               <span className="text-small text-muted-foreground">Scored by MECE</span>
               <Link href={`/cases/${c.id}`} className="text-small font-medium text-primary hover:underline">Practice &rarr;</Link>
            </div>
          </Card>
        ))}

        {(activeTab === 'all' || activeTab === 'guesstimates') && filteredGuesstimates.map((g) => (
          <Card key={g.code} className="ui-card flex flex-col p-5 group hover:border-navy/50 transition-colors">
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
        ))}

        {(activeTab === 'all' || activeTab === 'studies') && filteredStudies.map((s) => (
          <Card key={s.code} className="ui-card flex flex-col p-5 group hover:border-foreground/20 transition-colors">
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
        ))}

        {((activeTab === 'all' && [...filteredScored, ...filteredGuesstimates, ...filteredStudies].length === 0) ||
          (activeTab === 'scored' && filteredScored.length === 0) ||
          (activeTab === 'guesstimates' && filteredGuesstimates.length === 0) ||
          (activeTab === 'studies' && filteredStudies.length === 0)) && (
          <div className="col-span-full py-12 text-center">
            <p className="text-body text-muted-foreground">No practice items found matching your search.</p>
            <Button variant="link" onClick={() => setSearch('')} className="mt-2 text-primary">Clear search</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-small font-medium transition-all ${
        active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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
