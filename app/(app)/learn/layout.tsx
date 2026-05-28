"use client";

/* ============================================================================
   app/(app)/learn/layout.tsx
   Two-pane Notion shell: persistent left sidebar + scrolling content pane.
   On mobile the sidebar becomes a slide-in drawer toggled by the header button.
   This layout nests INSIDE your existing (app) layout, so AppNav still sits
   above it. The sidebar is sticky under the nav.
   ============================================================================ */

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LearnSidebar } from "@/components/learn-sidebar";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative">
      {/* Mobile toggle bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open learn menu"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-small font-medium text-navy"
        >
          <Menu className="h-4 w-4" /> Casebook
        </button>
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-[280px] flex-shrink-0 border-r border-border bg-card/40 py-4 md:block">
          <LearnSidebar />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto border-r border-border bg-card py-4 shadow-xl md:hidden">
              <div className="mb-2 flex justify-end px-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <LearnSidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* Content pane */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
