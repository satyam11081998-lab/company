import { getClusterFAQs, type FAQ } from '@/lib/casebook/faqs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

/**
 * FAQ accordion rendered on cluster landing pages.
 *
 * Extracts the cluster ID from the page slug (first segment)
 * and renders the matching FAQs if any exist.
 *
 * Also used by the casebook route to inject FAQPage JSON-LD.
 */

/** Extract cluster ID from a page slug, e.g. 'getting-started/what-it-tests' → 'getting-started'. */
export function getClusterIdFromSlug(slug: string): string {
  return slug.split('/')[0];
}

/** Check whether a page is the first page in its cluster (cluster landing page). */
export function isClusterLanding(slug: string): boolean {
  const parts = slug.split('/');
  // First page in cluster has exactly 2 segments: cluster/page
  return parts.length === 2;
}

interface ClusterFAQSectionProps {
  slug: string;
}

export default function ClusterFAQSection({ slug }: ClusterFAQSectionProps) {
  // Only show on cluster landing pages (first page in each cluster)
  if (!isClusterLanding(slug)) return null;

  const clusterId = getClusterIdFromSlug(slug);
  const faqs = getClusterFAQs(clusterId);

  if (faqs.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-5">
        <HelpCircle className="h-4.5 w-4.5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">
          Frequently asked questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faqs.map((faq: FAQ, i: number) => (
          // @ts-expect-error — accordion.jsx lacks TS children types
          <AccordionItem
            key={i}
            value={`faq-${i}`}
            className="ui-card border border-border rounded-xl overflow-hidden px-5"
          >
            {/* @ts-expect-error — accordion.jsx lacks TS children types */}
            <AccordionTrigger className="text-sm font-semibold text-foreground text-left py-4 hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            {/* @ts-expect-error — accordion.jsx lacks TS children types */}
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
