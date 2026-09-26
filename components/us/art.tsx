/**
 * MECE illustration language (US pilot, 2026-09-26).
 *
 * Every drawing here explains a real idea from the product — an issue tree, a
 * market-sizing chain — rather than decorating a gap. Built from the logo's
 * own geometry: thin navy lines, small rectangles, and the red triangle as the
 * one accent (the "hypothesis" or the answer). Colours come from the theme
 * tokens (the fill and stroke utilities), so they flip correctly in dark mode.
 */

type ArtProps = { className?: string; title?: string };

/** Profit issue tree with the hypothesis branch picked out in red. */
export function IssueTreeArt({ className = '', title = 'Issue tree: profit splits into revenue and cost; revenue into price and volume; cost into fixed and variable. The price branch is highlighted as the hypothesis.' }: ArtProps) {
  const box = (x: number, y: number, w: number, label: string, hot = false) => (
    <g key={label}>
      <rect x={x} y={y} width={w} height={30} rx={6} className={hot ? 'fill-card stroke-primary' : 'fill-card stroke-border-strong'} strokeWidth={hot ? 1.5 : 1} />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" className={hot ? 'fill-primary' : 'fill-foreground'} style={{ fontSize: 13, fontWeight: 600 }}>
        {label}
      </text>
    </g>
  );
  const link = (x1: number, y1: number, x2: number, y2: number, hot = false) => {
    const mid = (x1 + x2) / 2;
    return <path d={`M${x1} ${y1} H${mid} V${y2} H${x2}`} fill="none" className={hot ? 'stroke-primary' : 'stroke-border-strong'} strokeWidth={hot ? 1.5 : 1} />;
  };
  return (
    <svg viewBox="0 0 372 214" role="img" aria-label={title} className={className}>
      {link(88, 107, 132, 48, true)}
      {link(88, 107, 132, 166)}
      {link(226, 48, 262, 22, true)}
      {link(226, 48, 262, 74)}
      {link(226, 166, 262, 140)}
      {link(226, 166, 262, 192)}
      {box(8, 92, 80, 'Profit', true)}
      {box(132, 33, 94, 'Revenue', true)}
      {box(132, 151, 94, 'Cost')}
      {box(262, 7, 100, 'Price', true)}
      {box(262, 59, 100, 'Volume')}
      {box(262, 125, 100, 'Fixed')}
      {box(262, 177, 100, 'Variable')}
      {/* the brand triangle marks the hypothesis */}
      <polygon points="364,22 372,16 372,28" className="fill-primary" transform="translate(-2 0)" />
    </svg>
  );
}

/** A market-sizing chain: each step narrows the population; the answer is red. */
export function SizingChainArt({ className = '', title = 'Market sizing chain: 131 million US households, times 40 percent with a dog, is about 52 million; times 1.3 dogs is about 68 million dogs; times 3 grooming visits a year is about 200 million visits.' }: ArtProps) {
  const rows: { label: string; value: string; w: number; hot?: boolean }[] = [
    { label: 'US households', value: '131M', w: 1 },
    { label: '× share with a dog  40%', value: '52M', w: 0.62 },
    { label: '× dogs per household  1.3', value: '68M', w: 0.74 },
    { label: '× grooming visits a year  3', value: '≈200M', w: 0.9, hot: true },
  ];
  const W = 250;
  return (
    <svg viewBox="0 0 372 214" role="img" aria-label={title} className={className}>
      {rows.map((r, i) => {
        const y = 10 + i * 52;
        return (
          <g key={r.label}>
            <text x={0} y={y + 10} className="fill-muted-foreground" style={{ fontSize: 12.5, fontWeight: 500 }}>{r.label}</text>
            <rect x={0} y={y + 18} width={W * r.w} height={14} rx={3} className={r.hot ? 'fill-primary' : 'fill-navy'} opacity={r.hot ? 1 : 0.85 - i * 0.12} />
            <text x={W * r.w + 10} y={y + 29.5} className={r.hot ? 'fill-primary' : 'fill-foreground'} style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {r.value}
            </text>
          </g>
        );
      })}
      <line x1={0} y1={206} x2={372} y2={206} className="stroke-border" strokeWidth={1} />
    </svg>
  );
}

/** Background geometry for the hero: the logo's two peaks, outlined, very faint. */
export function PeaksOutline({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 300" aria-hidden className={className} fill="none">
      <polygon points="120,300 300,40 480,300" className="stroke-navy" strokeWidth={1} opacity={0.06} />
      <polygon points="300,300 430,110 560,300" className="stroke-primary" strokeWidth={1} opacity={0.09} />
      <line x1={0} y1={299.5} x2={600} y2={299.5} className="stroke-navy" strokeWidth={1} opacity={0.08} />
    </svg>
  );
}

/* ── Small line glyphs (24×24, 1.5px stroke) ──────────────────────────────
   For MECE concepts only; utility icons (search, arrow, chevron…) stay on
   lucide so every generic control shares one family. */

type GlyphProps = { className?: string };
const G = (props: { className?: string; children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={props.className}>
    {props.children}
  </svg>
);

export const GlyphTree = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><rect x="2.5" y="10" width="5" height="4" rx="1" /><rect x="16.5" y="4" width="5" height="4" rx="1" /><rect x="16.5" y="16" width="5" height="4" rx="1" /><path d="M7.5 12H12V6h4.5M12 12v6h4.5" /></G>
);
export const GlyphChain = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><path d="M3 5h18M3 10h13M3 15h9" /><path d="M3 20h5" strokeWidth={2.5} /></G>
);
export const GlyphDialog = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h9A1.5 1.5 0 0 1 15 5.5v5A1.5 1.5 0 0 1 13.5 12H8l-3 2.5V12h-.5A1.5 1.5 0 0 1 3 10.5z" /><path d="M18 9h1.5A1.5 1.5 0 0 1 21 10.5v5a1.5 1.5 0 0 1-1.5 1.5H19v2.5L16 17h-4.5A1.5 1.5 0 0 1 10 15.5V15" /></G>
);
export const GlyphRubric = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><path d="M4 20V10M9 20V4M14 20v-7M19 20v-4" /></G>
);
export const GlyphTrajectory = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><path d="M3 18l5-5 4 3 8-9" /><path d="M15 7h5v5" /></G>
);
export const GlyphTimer = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><circle cx="12" cy="13.5" r="7" /><path d="M12 13.5V10M9.5 3h5M18.5 6.5l1.5-1.5" /></G>
);
export const GlyphPeak = ({ className = 'h-5 w-5' }: GlyphProps) => (
  <G className={className}><path d="M2.5 19L9 9l6.5 10z" /><path d="M11.5 19l4.5-7 5.5 7" /></G>
);
