/* ============================================================================
   app/(app)/learn/page.tsx
   The Learn home / overview. Shown when no domain is selected.
   Renders every domain as a card with its frameworks; live ones link,
   drafts show a "soon" tag. Server component — no client JS needed.
   ============================================================================ */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CASEBOOK, liveCount } from "@/lib/casebook";

export default function LearnHome() {
  const totalFw = CASEBOOK.reduce((a, d) => a + d.frameworks.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Hero */}
      <div className="mb-2 flex gap-2">
        <Tag tone="red">The MECE Casebook</Tag>
        <Tag tone="navy">{CASEBOOK.length} domains</Tag>
        <Tag tone="amber">{liveCount()} live · {totalFw} total</Tag>
      </div>
      <h1 className="text-h1 text-navy">
        Learn the <span className="text-primary">frameworks</span>
      </h1>
      <p className="mt-3 max-w-2xl text-body text-foreground">
        One casebook, distilled from the IIM-A, B and C consulting casebooks —
        nothing one school covers is missing. Every framework is rebuilt as a
        visual, interactive page rather than a static PDF. Pick a domain to
        begin.
      </p>

      {/* Domain grid */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CASEBOOK.map((domain) => (
          <div
            key={domain.slug}
            className="ui-card flex flex-col rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="text-h3 text-navy">{domain.title}</h2>
            <p className="mt-1.5 text-small text-muted-foreground">
              {domain.summary}
            </p>

            <ul className="mt-4 flex-1 space-y-1.5">
              {domain.frameworks.map((fw) => {
                const isLive = fw.status === "live";
                const href = `/learn/${domain.slug}/${fw.slug}`;
                const row = (
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                        isLive ? "bg-primary" : "bg-border-strong"
                      }`}
                    />
                    <span className="text-body">{fw.title}</span>
                    {fw.est && (
                      <span className="text-micro text-muted-foreground">
                        {fw.est}
                      </span>
                    )}
                    {!isLive && (
                      <span className="ml-auto rounded-full bg-secondary px-2 py-px text-[10px] font-medium text-muted-foreground">
                        soon
                      </span>
                    )}
                    {isLive && (
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </span>
                );
                return isLive ? (
                  <li key={fw.slug}>
                    <Link
                      href={href}
                      className="block rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                    >
                      {row}
                    </Link>
                  </li>
                ) : (
                  <li
                    key={fw.slug}
                    className="cursor-default rounded-lg px-2 py-2 text-muted-foreground/70"
                  >
                    {row}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "red" | "navy" | "amber";
}) {
  const map = {
    red: "bg-primary/10 text-primary",
    navy: "bg-navy/10 text-navy",
    amber: "bg-warning-soft text-warning",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-micro font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}
