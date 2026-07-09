import React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { PageMetaBar } from './page-meta-bar';
import { BlockRenderer } from './block-renderer';
import { OnThisPage } from './on-this-page';
import { PrevNextLinks } from './prev-next';
import { CasebookSearch } from './casebook-search';
import EEATSignals from './eeat-signals';
import RelatedContent from './related-content';
import ClusterFAQSection from './cluster-faq-section';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import type { Page } from '@/lib/casebook/types';
import { getPrimerBySlug } from '@/lib/primers';
import { PrimerEmbed } from './primer-embed';
import { PrimerWorkspace } from './primer-workspace';
import { PageIntro } from './page-intro';

interface CasebookReaderProps {
  page: Page;
}

export function CasebookReader({ page }: CasebookReaderProps) {
  // Industry Primers are self-contained static pages embedded via an iframe,
  // not typed Block content. Keep the Casebook chrome (left nav + breadcrumbs)
  // and swap the reading column for the embedded primer + source strip.
  const primer = page.kind === 'primer' ? getPrimerBySlug(page.slug) : null;
  if (primer) {
    return (
      <PrimerWorkspace
        nav={<CasebookSearch />}
        mobileNav={<CasebookSearch defaultCollapsed />}
        breadcrumbs={<Breadcrumbs slug={page.slug} />}
      >
        <header className="mb-6">
          <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            No. {primer.no} · {primer.sector}
          </span>
          <h1 className="text-h1 text-foreground mt-1">{page.title}</h1>
        </header>

        <PrimerEmbed primer={primer} />
      </PrimerWorkspace>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_220px] xl:pr-8 relative">
      {/* Left Sidebar: Navigation & Search */}
      <aside className="border-r border-border bg-card/50 hidden lg:flex flex-col h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto">
        <CasebookSearch />
      </aside>

      {/* Center: Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 xl:pl-8 xl:pr-8 py-8 lg:py-12 relative flex justify-start">
        <article className="w-full max-w-[720px] xl:max-w-none ml-0 lg:ml-8 xl:ml-16 xl:mr-[88px]">
          <div className="flex items-center gap-4 mb-6">
            <Sheet>
              <SheetTrigger
                aria-label="Open contents"
                className="lg:hidden shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition"
              >
                <Menu className="w-5 h-5" />
                <span className="sr-only">Contents</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
                <CasebookSearch defaultCollapsed />
              </SheetContent>
            </Sheet>
            <div className="flex-1">
              <Breadcrumbs slug={page.slug} />
            </div>
          </div>
          
          <PageIntro title={page.title} subtitle={page.subtitle}>
            <EEATSignals lastUpdated="2026-06-01" showMethodology={!!page.meta} />
            {page.meta && <PageMetaBar meta={page.meta} hasKeyTakeaways={page.blocks.some(b => b.type === 'keyTakeaways')} />}
          </PageIntro>

          <div className="space-y-6">
            {(() => {
              const ktIndex = page.blocks.findLastIndex(b => b.type === 'keyTakeaways');
              const heroKT = ktIndex >= 0 ? page.blocks[ktIndex] : null;
              
              const hookIndex = page.blocks.findIndex(b => b.type === 'hook');
              const heroHook = hookIndex >= 0 ? page.blocks[hookIndex] : null;

              const restBlocks = page.blocks.filter((_, i) => i !== ktIndex && i !== hookIndex);

              return (
                <>
                  {heroHook && (
                    <BlockRenderer block={heroHook} isHero />
                  )}
                  {heroKT && (
                    <div id="key-takeaways" className="scroll-mt-[80px]">
                      <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground/80 font-bold mb-3">TL;DR · Key Takeaways</h3>
                      <BlockRenderer block={heroKT} isHero />
                    </div>
                  )}
                  {restBlocks.map((block, idx) => (
                    <BlockRenderer key={idx} block={block} />
                  ))}
                </>
              );
            })()}
          </div>

          <ClusterFAQSection slug={page.slug} />

          <RelatedContent slug={page.slug} />

          <PrevNextLinks currentSlug={page.slug} />
        </article>
      </main>

      {/* Right Rail: TOC (hidden on small screens, rendered via OnThisPage sticky) */}
      <div className="hidden xl:block pt-8 pr-0">
        <OnThisPage blocks={page.blocks} pageSlug={page.slug} />
      </div>
    </div>
  );
}
