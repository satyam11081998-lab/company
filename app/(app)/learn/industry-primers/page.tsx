import Link from 'next/link';
import { PRIMERS } from '@/lib/primers';
import { ChevronRight } from 'lucide-react';

export default function IndustryPrimersPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-navy font-semibold tracking-tight mb-2">Industry Primers</h1>
        <p className="text-muted-foreground">Self-contained fact-sheets covering sector economics, competitive landscapes, and key drivers.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PRIMERS.map((p) => (
          <Link 
            key={p.slug} 
            href={`/learn/industry-primers/${p.slug}`} 
            className="ui-card p-6 flex flex-col group hover:border-primary/50 hover:shadow-md transition-all h-full min-h-[200px]"
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                No. {p.no}
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-navy bg-navy/5 px-2 py-1 rounded">
                {p.sector}
              </span>
            </div>
            
            <h2 className="text-2xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
              {p.title}
            </h2>
            
            <div className="mt-auto pt-8 flex items-center justify-end">
              <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center">
                Read Primer <ChevronRight className="w-4 h-4 ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
