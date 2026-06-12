import Link from 'next/link';
import { getContextualLinks, type InternalLink } from '@/lib/internal-links';
import { ArrowRight, Layers, BookOpen, GitBranch } from 'lucide-react';

/**
 * Contextual internal links rendered at the bottom of casebook pages.
 * Improves crawl depth, reduces orphan pages, and distributes page authority.
 *
 * Renders 3–7 links grouped by relationship type.
 */
export default function RelatedContent({ slug }: { slug: string }) {
  const links = getContextualLinks(slug);

  if (links.all.length === 0) return null;

  return (
    <nav
      className="mt-12 pt-8 border-t border-border"
      aria-label="Related content"
    >
      <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
        <GitBranch className="h-4.5 w-4.5 text-primary" />
        Continue exploring
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Parent link */}
        {links.parent && (
          <LinkCard link={links.parent} icon={<Layers className="h-4 w-4" />} label="Up" />
        )}

        {/* Children */}
        {links.children.map((link) => (
          <LinkCard key={link.slug} link={link} icon={<BookOpen className="h-4 w-4" />} label="Dive deeper" />
        ))}

        {/* Siblings */}
        {links.siblings.map((link) => (
          <LinkCard key={link.slug} link={link} icon={<ArrowRight className="h-4 w-4" />} label="Also in this section" />
        ))}

        {/* Related (cross-cluster) */}
        {links.related.map((link) => (
          <LinkCard key={link.slug} link={link} icon={<ArrowRight className="h-4 w-4" />} label="Related" />
        ))}
      </div>
    </nav>
  );
}

function LinkCard({
  link,
  icon,
  label,
}: {
  link: InternalLink;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={`/learn/casebook/${link.slug}`}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {link.cleanTitle}
        </p>
      </div>
    </Link>
  );
}
