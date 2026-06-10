import { ExternalLink } from 'lucide-react';
import type { Primer } from '@/lib/primers';

interface PrimerEmbedProps {
  primer: Primer;
}

/**
 * Renders an Industry Primer inside the Casebook reader.
 *
 * The primer itself is a self-contained, fact-checked static page served from
 * /public/primers/<folder>/index.html. It is embedded in an isolated <iframe>
 * so its own CSS/fonts render exactly as designed and never collide with the
 * MECE app styles ("lands like that, no overlap"). Graphics are never touched.
 *
 * Below the frame we render a horizontal strip of source links so anyone can
 * open the underlying documents the data is drawn from.
 */
export function PrimerEmbed({ primer }: PrimerEmbedProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="w-full rounded-xl overflow-hidden border border-border bg-background">
        <iframe
          src={`/primers/${primer.folder}/index.html`}
          title={`${primer.title} — Industry Primer`}
          loading="lazy"
          className="w-full border-none bg-background block"
          style={{ height: 'calc(100vh - 220px)', minHeight: 640 }}
        />
      </div>

      {/* Horizontal source strip — where the data comes from */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Sources
        </span>
        {primer.sources.map((s) => (
          <a
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-navy hover:text-primary transition-colors border-b border-border hover:border-primary"
          >
            {s.label}
            <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  );
}
