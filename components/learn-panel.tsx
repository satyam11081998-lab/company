'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Domain } from '@/lib/curriculum';
import { ALL_DOMAINS, LEARNING_PATHS } from '@/lib/curriculum';
import DomainViewer from '@/components/domain-viewer';
import { Button } from '@/components/ui/button';

interface LearnPanelProps {
  domain: Domain | null;
  onClose: () => void;
}

export default function LearnPanel({ domain, onClose }: LearnPanelProps) {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (domain) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [domain, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (domain) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [domain]);

  if (!domain) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/40 transition-opacity backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Slide-in panel */}
        <div 
          className="relative w-full md:w-1/2 max-w-4xl bg-background shadow-2xl h-full flex flex-col overflow-hidden border-l border-border"
          style={{ animation: 'slideInRight 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50 shrink-0">
            <div>
              <p className="text-micro font-bold tracking-widest text-muted-foreground uppercase mb-0.5">{domain.code}</p>
              <h2 className="text-xl font-bold tracking-tight text-foreground leading-none">{domain.title}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-muted-foreground hover:bg-muted">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            <DomainViewer domain={domain} allDomains={ALL_DOMAINS} learningPaths={LEARNING_PATHS} />
          </div>
        </div>
      </div>
    </>
  );
}
