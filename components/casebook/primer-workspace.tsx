'use client';

import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface PrimerWorkspaceProps {
  /** Left-hand Casebook navigation (rendered in both the desktop rail and the mobile sheet). */
  nav: React.ReactNode;
  /** Optional variant for the mobile sheet (e.g. fully collapsed tree). Falls back to `nav`. */
  mobileNav?: React.ReactNode;
  /** Breadcrumb trail shown in the top bar of the reading column. */
  breadcrumbs: React.ReactNode;
  /** Primer header + embed. */
  children: React.ReactNode;
}

/**
 * Client layout shell for Industry Primer pages.
 *
 * Mirrors the Casebook reader's two-column chrome but makes the left navigation
 * rail collapsible on desktop, so a primer (a wide, embedded graphic) can take
 * the full reading width. Collapsing reflows the grid template; an "Contents"
 * button brings the rail back. Mobile is unchanged — the nav lives in a sheet.
 */
export function PrimerWorkspace({ nav, mobileNav, breadcrumbs, children }: PrimerWorkspaceProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div
      className={`w-full min-h-screen bg-background grid grid-cols-1 relative transition-[grid-template-columns] duration-200 ${
        collapsed ? 'lg:grid-cols-[0px_minmax(0,1fr)]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'
      }`}
    >
      <aside
        className={`border-r border-border bg-card/50 hidden flex-col h-[calc(100vh-6rem)] sticky top-24 overflow-hidden ${
          collapsed ? 'lg:hidden' : 'lg:flex'
        }`}
      >
        <div className="flex items-center justify-between px-3 h-11 border-b border-border shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Contents
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
      </aside>

      <main className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative min-w-0">
        <div className="flex items-center gap-3 mb-5">
          {/* Mobile: nav in a sheet */}
          <Sheet>
            <SheetTrigger
              aria-label="Open contents"
              className="lg:hidden shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-95 transition"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Contents</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
              {mobileNav ?? nav}
            </SheetContent>
          </Sheet>

          {/* Desktop: re-open the collapsed rail */}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Show contents"
              className="hidden lg:inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 h-10 text-small font-medium text-foreground shadow-sm hover:bg-muted active:scale-95 transition"
            >
              <PanelLeftOpen className="w-4 h-4 text-primary" /> Contents
            </button>
          )}

          <div className="flex-1 min-w-0">{breadcrumbs}</div>
        </div>

        {children}
      </main>
    </div>
  );
}
