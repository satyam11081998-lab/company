import React from 'react';
import Link from 'next/link';

export function parseInlineMd(text: string): React.ReactNode[] {
  // We need to parse **bold**, *italic*, `code`, [text](url), and \n
  // Split by line breaks first
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (lineIndex > 0) {
      result.push(<br key={`br-${lineIndex}`} />);
    }

    // A simple regex tokeniser for the allowed inline elements
    const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = line.split(tokenRegex);

    parts.forEach((part, i) => {
      if (!part) return;
      const key = `inline-${lineIndex}-${i}`;

      if (part.startsWith('**') && part.endsWith('**')) {
        result.push(<strong key={key} className="font-semibold">{part.slice(2, -2)}</strong>);
      } else if (part.startsWith('*') && part.endsWith('*')) {
        result.push(<em key={key} className="italic">{part.slice(1, -1)}</em>);
      } else if (part.startsWith('`') && part.endsWith('`')) {
        result.push(
          <code key={key} className="px-1.5 py-0.5 rounded-sm bg-muted text-[0.9em] font-mono-data text-foreground/90">
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.startsWith('[') && part.endsWith(')')) {
        const textMatch = part.match(/\[(.*?)\]/);
        const urlMatch = part.match(/\((.*?)\)/);
        if (textMatch && urlMatch) {
          const href = urlMatch[1];
          const isExternal = href.startsWith('http');
          if (isExternal) {
            result.push(
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
                {textMatch[1]}
              </a>
            );
          } else {
            result.push(
              <Link key={key} href={href} className="text-primary hover:underline underline-offset-4">
                {textMatch[1]}
              </Link>
            );
          }
        } else {
          result.push(<span key={key}>{part}</span>);
        }
      } else {
        result.push(<span key={key}>{part}</span>);
      }
    });
  });

  return result;
}

export function ProseBlock({ md, className = '' }: { md: string; className?: string }) {
  return (
    <p className={`text-body text-foreground/90 leading-relaxed ${className}`}>
      {parseInlineMd(md)}
    </p>
  );
}
