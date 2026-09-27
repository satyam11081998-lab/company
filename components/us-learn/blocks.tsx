import { Calculator, Lightbulb, TriangleAlert, BookOpenCheck } from 'lucide-react';
import type { LearnBlock } from '@/lib/us-learn/types';
import { InlineMd } from './inline-md';

/**
 * Renders US Learn content blocks as plain, semantic HTML (server-only, no
 * client JS): paragraphs, lists, tables with <th scope>, issue trees as nested
 * lists, worked math as an ordered list. Everything is in the DOM on first
 * byte, which is what crawlers and answer engines read.
 */

const P = 'text-[16px] leading-[1.75] text-foreground/85';

export function LearnBlocks({ blocks }: { blocks: LearnBlock[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => (
        <Block key={i} b={b} />
      ))}
    </div>
  );
}

function Block({ b }: { b: LearnBlock }) {
  switch (b.t) {
    case 'p':
      return (
        <p className={P}>
          <InlineMd md={b.md} />
        </p>
      );
    case 'ul':
      return (
        <ul className={`${P} list-disc space-y-2 pl-5 marker:text-primary/70`}>
          {b.items.map((it, i) => (
            <li key={i}>
              <InlineMd md={it} />
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className={`${P} list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary/80`}>
          {b.items.map((it, i) => (
            <li key={i}>
              <InlineMd md={it} />
            </li>
          ))}
        </ol>
      );
    case 'steps':
      return (
        <ol className="space-y-4">
          {b.items.map((it, i) => (
            <li key={i} className="flex gap-4">
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-[13px] font-semibold text-primary ring-1 ring-inset ring-primary/15"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-[16px] font-semibold text-foreground">{it.title}</p>
                <p className={`${P} mt-1`}>
                  <InlineMd md={it.md} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <figure className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[520px] border-collapse text-left text-[14px] leading-relaxed">
            {b.caption && <caption className="mb-2 text-left text-[13px] text-muted-foreground">{b.caption}</caption>}
            <thead>
              <tr className="border-b border-border">
                {b.head.map((h, i) => (
                  <th key={i} scope="col" className="px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground first:pl-4 sm:first:pl-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {b.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) =>
                    ci === 0 ? (
                      <th key={ci} scope="row" className="px-4 py-3 align-top font-semibold text-foreground first:pl-4 sm:first:pl-0">
                        <InlineMd md={c} />
                      </th>
                    ) : (
                      <td key={ci} className="px-4 py-3 align-top text-foreground/80">
                        <InlineMd md={c} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    case 'callout': {
      const Icon = b.tone === 'warn' ? TriangleAlert : b.tone === 'example' ? BookOpenCheck : Lightbulb;
      const tone =
        b.tone === 'warn'
          ? 'bg-amber-50 ring-amber-200/70 dark:bg-amber-400/10 dark:ring-amber-400/20'
          : b.tone === 'example'
          ? 'bg-sky-50 ring-sky-200/70 dark:bg-sky-400/10 dark:ring-sky-400/20'
          : 'bg-emerald-50 ring-emerald-200/70 dark:bg-emerald-400/10 dark:ring-emerald-400/20';
      return (
        <aside className={`flex gap-3 rounded-[12px] p-4 ring-1 ring-inset ${tone}`}>
          <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-foreground/70" />
          <div>
            <p className="text-[15px] font-semibold text-foreground">{b.title}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-foreground/80">
              <InlineMd md={b.md} />
            </p>
          </div>
        </aside>
      );
    }
    case 'tree':
      return (
        <figure className="rounded-[14px] border border-border/80 bg-card p-4 sm:p-5">
          <p className="rounded-[8px] bg-navy px-3.5 py-2.5 text-[14px] font-semibold text-white dark:bg-white/10">{b.root}</p>
          <ul className="mt-3 space-y-2.5 border-l-2 border-primary/25 pl-4 sm:pl-5">
            {b.branches.map((br, i) => (
              <li key={i}>
                <p className="text-[15px] font-semibold text-foreground">{br.label}</p>
                {br.leaves?.length ? (
                  <ul className="mt-1 space-y-1 border-l border-border pl-4">
                    {br.leaves.map((l, j) => (
                      <li key={j} className="text-[14px] leading-relaxed text-foreground/75">
                        {l}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {b.caption && <figcaption className="mt-3 text-[13px] text-muted-foreground">{b.caption}</figcaption>}
        </figure>
      );
    case 'math':
      return (
        <figure className="rounded-[14px] border border-border/80 bg-muted/40 p-4 sm:p-5">
          {b.title && (
            <figcaption className="mb-2.5 flex items-center gap-2 text-[14px] font-semibold text-foreground">
              <Calculator aria-hidden className="h-4 w-4 text-primary" />
              {b.title}
            </figcaption>
          )}
          <ol className="space-y-1.5 font-mono-data text-[13.5px] leading-relaxed text-foreground/85 [font-variant-numeric:tabular-nums]">
            {b.lines.map((l, i) => (
              <li key={i} className="flex gap-2.5">
                <span aria-hidden className="select-none text-muted-foreground">
                  {i + 1}.
                </span>
                <span>{l}</span>
              </li>
            ))}
          </ol>
        </figure>
      );
    case 'dialogue':
      return (
        <div className="space-y-3 rounded-[14px] border border-border/80 bg-card p-4 sm:p-5">
          {b.turns.map((t, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-foreground/85">
              <span className={`mr-2 font-semibold ${t.who === 'Interviewer' ? 'text-primary' : 'text-foreground'}`}>{t.who}:</span>
              <InlineMd md={t.md} />
            </p>
          ))}
        </div>
      );
  }
}
