/* ============================================================================
   app/(app)/learn/[domain]/[framework]/page.tsx
   The dynamic reader. Resolves the domain + framework from the URL and renders
   the matching framework component. Drafts get a clean "coming soon" stub.

   To add a built framework: create the component (e.g. components/frameworks/
   profitability.tsx), import it, and register it in FRAMEWORK_COMPONENTS.
   Mark its status 'live' in lib/casebook/index.ts.
   ============================================================================ */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getFramework,
  allFrameworkParams,
} from "@/lib/casebook";
import GrowthStrategy from "@/components/frameworks/growth-strategy";
import MarketEntry from "@/components/frameworks/market-entry";
// import Profitability from "@/components/frameworks/profitability";

/* Map "domain/framework" -> built component. Only LIVE ones need an entry. */
const FRAMEWORK_COMPONENTS: Record<string, React.ComponentType> = {
  "growth/growth-strategy": GrowthStrategy,
  "market/market-entry": MarketEntry,
};

export function generateStaticParams() {
  return allFrameworkParams();
}

export default function FrameworkPage({
  params,
}: {
  params: { slug: string; framework: string };
}) {
  const { domain, framework } = getFramework(params.slug, params.framework);
  if (!domain || !framework) notFound();

  const key = `${params.slug}/${params.framework}`;
  const Component = FRAMEWORK_COMPONENTS[key];

  // Live & built -> render the real framework page (it owns its own chrome).
  if (framework.status === "live" && Component) {
    return <Component />;
  }

  // Draft -> clean stub with a back link.
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/learn`}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-small font-medium text-navy transition-colors hover:bg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to {domain.title}
      </Link>

      <div className="ui-card rounded-2xl border border-dashed border-border-strong bg-card p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="text-h3">✦</span>
        </div>
        <h1 className="text-h2 text-navy">{framework.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-body text-muted-foreground">
          {framework.blurb} This framework is being rebuilt into a visual,
          interactive page — like the Growth Strategy tree. Check back soon.
        </p>
        <Link
          href="/learn/growth/growth-strategy"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-medium text-white transition-colors hover:bg-primary-hover"
        >
          See a finished example →
        </Link>
      </div>
    </div>
  );
}
