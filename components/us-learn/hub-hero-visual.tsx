import { Check } from 'lucide-react';
import { US_CARD } from '@/components/us/ui';

/**
 * Hero visual for /us/learn: a MECE issue tree that draws itself, a floating
 * "MECE check" chip and an example score card. Pure SVG + CSS keyframes —
 * server-rendered, no client JS, no network images — so it costs nothing on
 * first paint and cannot break hydration.
 *
 * Motion plays once (connectors draw, nodes fade up, bars fill), then only
 * two quiet loops remain: the chip floats and the answer node pulses.
 * prefers-reduced-motion shows the finished state with no movement.
 *
 * Decorative: aria-hidden. Everything it shows is taught in words on the
 * pages it links to. The score is labelled as an example, never real data.
 */

const CSS = `
.mlv .d{stroke-dasharray:240;stroke-dashoffset:240;animation:mlv-draw .7s ease-out forwards}
.mlv .p{opacity:0;animation:mlv-pop .5s ease-out forwards}
.mlv .bar{transform:scaleX(0);transform-origin:left center;animation:mlv-grow .9s cubic-bezier(.2,.7,.2,1) forwards}
.mlv .float{animation:mlv-float 6s ease-in-out 3s infinite}
.mlv .pulse{opacity:0;transform-box:fill-box;transform-origin:center;animation:mlv-pulse 2.2s ease-out 3s infinite}
@keyframes mlv-draw{to{stroke-dashoffset:0}}
@keyframes mlv-pop{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes mlv-grow{to{transform:scaleX(1)}}
@keyframes mlv-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes mlv-pulse{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(2.8)}}
@media (prefers-reduced-motion:reduce){
.mlv .d,.mlv .p,.mlv .bar,.mlv .float,.mlv .pulse{animation:none!important}
.mlv .d{stroke-dashoffset:0}.mlv .p{opacity:1}.mlv .bar{transform:none}.mlv .pulse{opacity:0}
}
`;

const at = (s: number) => ({ animationDelay: `${s}s` });

/** One leaf pill in the tree. */
function Leaf({ x, y, w, label, delay, hot = false }: { x: number; y: number; w: number; label: string; delay: number; hot?: boolean }) {
  return (
    <g className="p" style={at(delay)}>
      <rect
        x={x}
        y={y}
        width={w}
        height={30}
        rx={8}
        className={hot ? 'fill-primary/10 stroke-primary' : 'fill-card stroke-border'}
        strokeWidth={hot ? 1.5 : 1}
      />
      <text x={x + w / 2} y={y + 19.5} textAnchor="middle" fontSize={12.5} fontWeight={hot ? 600 : 500} className={hot ? 'fill-primary' : 'fill-foreground/80'}>
        {label}
      </text>
    </g>
  );
}

const SCORES: { label: string; pts: number; max: number }[] = [
  { label: 'Structure', pts: 22, max: 25 },
  { label: 'Quantitative', pts: 16, max: 20 },
  { label: 'Synthesis', pts: 17, max: 20 },
  { label: 'Judgment', pts: 12, max: 15 },
  { label: 'Creativity', pts: 7, max: 10 },
  { label: 'Presence', pts: 8, max: 10 },
];

export default function HubHeroVisual() {
  const total = SCORES.reduce((a, s) => a + s.pts, 0); // 82
  return (
    <div aria-hidden className="mlv relative mx-auto w-full max-w-[470px] select-none px-5 pb-20 pt-7">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* The issue tree */}
      <div className={`${US_CARD} relative px-5 pb-16 pt-5`}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/15">
            Issue tree
          </span>
          <span className="text-[12px] text-muted-foreground">Worked example</span>
        </div>
        <svg viewBox="0 0 440 262" className="mt-3 block h-auto w-full" fill="none">
          {/* root */}
          <g className="p" style={at(0.1)}>
            <rect x={110} y={6} width={220} height={40} rx={10} className="fill-navy dark:fill-white/10" />
            <text x={220} y={31} textAnchor="middle" fontSize={14} fontWeight={600} className="fill-white">
              Why did profit fall?
            </text>
          </g>

          {/* level-1 connectors */}
          <path className="d stroke-border-strong" strokeWidth={1.5} d="M220 46 V68 H105 V90" style={at(0.5)} />
          <path className="d stroke-border-strong" strokeWidth={1.5} d="M220 46 V68 H335 V90" style={at(0.5)} />

          {/* level 1 */}
          <g className="p" style={at(0.95)}>
            <rect x={30} y={90} width={150} height={36} rx={9} className="fill-card stroke-foreground/25" strokeWidth={1.25} />
            <text x={105} y={113} textAnchor="middle" fontSize={13.5} fontWeight={600} className="fill-foreground">
              Revenue
            </text>
          </g>
          <g className="p" style={at(0.95)}>
            <rect x={260} y={90} width={150} height={36} rx={9} className="fill-card stroke-foreground/25" strokeWidth={1.25} />
            <text x={335} y={113} textAnchor="middle" fontSize={13.5} fontWeight={600} className="fill-foreground">
              Costs
            </text>
          </g>

          {/* level-2 spines */}
          <path className="d stroke-border-strong" strokeWidth={1.25} d="M46 126 V199 M46 159 H60 M46 199 H60" style={at(1.4)} />
          <path className="d stroke-border-strong" strokeWidth={1.25} d="M276 126 V239 M276 159 H288 M276 199 H288 M276 239 H288" style={at(1.4)} />

          {/* level 2 */}
          <Leaf x={60} y={144} w={124} label="Transactions" delay={1.85} />
          <Leaf x={60} y={184} w={124} label="Avg. basket ($)" delay={2.0} />
          <Leaf x={288} y={144} w={134} label="Cost of goods ↑" delay={2.15} hot />
          <Leaf x={288} y={184} w={134} label="Store labor" delay={2.3} />
          <Leaf x={288} y={224} w={134} label="Rent and other" delay={2.45} />

          {/* the answer, pulsing */}
          <circle cx={412} cy={159} r={4} className="p fill-primary" style={at(2.6)} />
          <circle cx={412} cy={159} r={4} className="pulse fill-primary" />
        </svg>
      </div>

      {/* MECE check chip */}
      <div className="p absolute right-0 top-0" style={at(2.7)}>
        <div className={`${US_CARD} float px-3.5 py-2.5`}>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">MECE check</p>
          <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} /> No overlaps
          </p>
          <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} /> No gaps
          </p>
        </div>
      </div>

      {/* Example score card (compact, overlaps only the tree card's empty bottom padding) */}
      <div className="p absolute bottom-0 left-0 w-[304px] max-w-[calc(100%-8px)]" style={at(2.9)}>
        <div className={`${US_CARD} grid grid-cols-[auto_1fr] items-center gap-4 p-4`}>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Example score</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-[34px] leading-none text-foreground">{total}</span>
              <span className="text-[12px] text-muted-foreground">/100</span>
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {SCORES.map((s, i) => (
              <li key={s.label}>
                <span className="block text-[10.5px] leading-tight text-muted-foreground">{s.label}</span>
                <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="bar block h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((s.pts / s.max) * 100)}%`, ...at(3.1 + i * 0.1) }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
