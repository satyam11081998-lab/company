import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Inline markup for US Learn content: **bold** and [text](href), nothing else.
 * Deliberately narrower than the casebook parser: "*" is never italic here, so
 * arithmetic can never be mangled, and no HTML is ever interpreted.
 *
 * Internal links use next/link; external links open in a new tab with
 * rel="noopener noreferrer". Links into /p/ (live practice) are nofollow:
 * robots.txt disallows them and they only redirect into the app.
 */
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

const LINK_CLASS = 'font-medium text-primary underline decoration-primary/30 underline-offset-[3px] transition-colors hover:decoration-primary';

export function InlineMd({ md }: { md: string }) {
  const parts = md.split(TOKEN).filter((p) => p !== '');
  return <>{parts.map((part, i) => renderPart(part, i))}</>;
}

function renderPart(part: string, i: number): ReactNode {
  if (part.startsWith('**') && part.endsWith('**')) {
    return (
      <strong key={i} className="font-semibold text-foreground">
        {part.slice(2, -2)}
      </strong>
    );
  }
  const m = part.match(LINK);
  if (m) {
    const [, text, href] = m;
    if (/^https?:\/\//.test(href)) {
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {text}
        </a>
      );
    }
    return (
      <Link key={i} href={href} prefetch={false} rel={href.startsWith('/p/') ? 'nofollow' : undefined} className={LINK_CLASS}>
        {text}
      </Link>
    );
  }
  return <span key={i}>{part}</span>;
}

/** Plain text of an inline-markup string (for aria labels, meta, JSON-LD). */
export function plainText(md: string): string {
  return md.replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
}
