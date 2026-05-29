import React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { PageMetaBar } from './page-meta-bar';
import { BlockRenderer } from './block-renderer';
import { OnThisPage } from './on-this-page';
import { PrevNextLinks } from './prev-next';
import { CasebookSearch } from './casebook-search';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import type { Page } from '@/lib/casebook/types';

interface CasebookReaderProps {
  page: Page;
}

export function CasebookReader({ page }: CasebookReaderProps) {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-background">
      {/* Left Sidebar: Navigation & Search */}
      <aside className="w-full lg:w-[280px] shrink-0 border-r border-border bg-card/50 flex flex-col hidden lg:flex h-[calc(100vh-4rem)] sticky top-16">
        <CasebookSearch />
      </aside>

      {/* Center: Main Content */}
      <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative">
        <article className="w-full max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <Sheet>
              <SheetTrigger className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
                <CasebookSearch />
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <Breadcrumbs slug={page.slug} />
            </div>
          </div>
          
          <header className="mb-10">
            <h1 className="text-h1 text-navy mb-4">{page.title}</h1>
            {page.subtitle && (
              <p className="text-h3 font-normal text-muted-foreground leading-relaxed">
                {page.subtitle}
              </p>
            )}
          </header>

          {page.meta && <PageMetaBar meta={page.meta} hasKeyTakeaways={page.blocks.some(b => b.type === 'keyTakeaways')} />}

          <div className="space-y-6">
            {(() => {
              const ktIndex = page.blocks.findLastIndex(b => b.type === 'keyTakeaways');
              const heroKT = ktIndex >= 0 ? page.blocks[ktIndex] : null;
              const restBlocks = ktIndex >= 0 ? page.blocks.filter((_, i) => i !== ktIndex) : page.blocks;

              return (
                <>
                  {heroKT && (
                    <div id="key-takeaways" className="scroll-mt-[80px]">
                      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground/80 font-bold mb-3">TL;DR · Key Takeaways</h3>
                      <BlockRenderer block={heroKT} />
                    </div>
                  )}
                  {restBlocks.map((block, idx) => (
                    <BlockRenderer key={idx} block={block} />
                  ))}
                </>
              );
            })()}
          </div>

          <PrevNextLinks currentSlug={page.slug} />
        </article>

        {/* Right Rail: TOC (hidden on small screens, rendered via OnThisPage sticky) */}
        <div className="hidden xl:block w-[180px] ml-8 shrink-0">
          <OnThisPage blocks={page.blocks} />
        </div>
      </main>
    </div>
  );
}
