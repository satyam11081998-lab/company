"use client";

/* ============================================================================
   components/learn-sidebar.tsx
   Notion-style collapsible navigation for the Learn section.
   - Domains expand/collapse; the active domain auto-opens.
   - Live frameworks link; drafts show a "soon" pill.
   - Mobile: slides in over a backdrop (toggle from the layout header).
   Uses your existing tokens (primary/navy/border) via Tailwind classes —
   adjust class names to match globals.css if needed.
   ============================================================================ */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ChevronRight,
  GitMerge,
  TrendingUp,
  DollarSign,
  Building2,
  Calculator,
  BookOpen,
} from "lucide-react";
import { CASEBOOK } from "@/lib/casebook";

const ICONS: Record<string, any> = {
  GitMerge,
  TrendingUp,
  DollarSign,
  Building2,
  Calculator,
  BookOpen,
};

export function LearnSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // active domain = first path segment after /learn
  const activeDomain = pathname?.split("/")[2] ?? "";

  return (
    <nav className="flex h-full flex-col">
      {/* Header */}
      <div className="px-4 pb-4 pt-1">
        <Link
          href="/learn"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              The MECE Casebook
            </h2>
          </div>
        </Link>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-6">
        {CASEBOOK.map((domain) => (
          <DomainGroup
            key={domain.slug}
            domain={domain}
            isActiveDomain={activeDomain === domain.slug}
            pathname={pathname ?? ""}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  );
}

function DomainGroup({
  domain,
  isActiveDomain,
  pathname,
  onNavigate,
}: {
  domain: (typeof CASEBOOK)[number];
  isActiveDomain: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(isActiveDomain);
  // keep the active domain open when navigating
  useEffect(() => {
    if (isActiveDomain) setOpen(true);
  }, [isActiveDomain]);

  const Icon = ICONS[domain.icon] ?? BookOpen;

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-secondary ${
          isActiveDomain ? "bg-secondary" : ""
        }`}
      >
        <ChevronRight
          className={`h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
        <Icon
          className={`h-4 w-4 flex-shrink-0 ${
            isActiveDomain ? "text-primary" : "text-navy-soft"
          }`}
        />
        <span
          className={`text-body font-medium ${
            isActiveDomain ? "text-foreground" : "text-foreground/90"
          }`}
        >
          {domain.title}
        </span>
        <span className="ml-auto text-micro text-muted-foreground">
          {domain.frameworks.length}
        </span>
      </button>

      {open && (
        <div className="ml-[18px] mt-0.5 border-l border-border pl-2.5">
          {domain.frameworks.map((fw) => {
            const href = `/learn/${domain.slug}/${fw.slug}`;
            const isActive = pathname === href;
            const isLive = fw.status === "live";

            const inner = (
              <span className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                    isActive
                      ? "bg-primary"
                      : isLive
                      ? "bg-border-strong"
                      : "bg-border"
                  }`}
                />
                <span className="truncate">{fw.title}</span>
                {!isLive && (
                  <span className="ml-auto rounded-full bg-secondary px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                    soon
                  </span>
                )}
              </span>
            );

            if (!isLive) {
              return (
                <div
                  key={fw.slug}
                  className="cursor-default rounded-md px-2 py-1.5 text-small text-muted-foreground/70"
                  title="Coming soon"
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link
                key={fw.slug}
                href={href}
                onClick={onNavigate}
                className={`block rounded-md px-2 py-1.5 text-small transition-colors ${
                  isActive
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
