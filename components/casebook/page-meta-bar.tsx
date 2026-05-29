import React from 'react';
import { Clock, Tag, Gauge } from 'lucide-react';
import type { PageMeta } from '@/lib/casebook/types';

export function PageMetaBar({ meta, hasKeyTakeaways }: { meta: PageMeta, hasKeyTakeaways?: boolean }) {
  if (!meta) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {meta.difficulty && (
        <div className={`badge-pill ${meta.difficulty === 'challenging' ? 'badge-pill-red' : ''}`}>
          <Gauge className="w-3.5 h-3.5" />
          <span className="capitalize">{meta.difficulty}</span>
        </div>
      )}
      
      {meta.readingTimeMin && (
        <div className="badge-pill">
          <Clock className="w-3.5 h-3.5" />
          <span>{meta.readingTimeMin} min read</span>
          {hasKeyTakeaways && (
            <>
              <span className="mx-1 text-muted-foreground/60">·</span>
              <span className="text-muted-foreground">scan in 2 min &rarr;</span>
              <a href="#key-takeaways" className="text-primary hover:underline ml-1">Key Takeaways</a>
            </>
          )}
        </div>
      )}

      {meta.tags && meta.tags.length > 0 && (
        <div className="flex items-center gap-1.5 ml-2">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          {meta.tags.map(tag => (
            <span key={tag} className="tag tag-navy">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
