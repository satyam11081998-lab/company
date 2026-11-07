'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { StructureNode } from '@/lib/interview-api';

/**
 * The live structure tree — Whiteboard mode only.
 *
 * The candidate's own decomposition, drawn as they talk. Not a decoration: it is the shared
 * artefact the interviewer can point at ("you have price under cost — is that where it sits?"),
 * and it is what turns prose reasoning into something a reader can check at a glance.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md) — this component is held to it:
 *   §C  semantic tokens only. No raw hex, no rgb(). Every colour below is a CSS variable.
 *   §C  cardinal red (--primary) is RESERVED. Here it marks exactly one thing: the node under
 *       discussion right now. Nothing else is red, or the reservation means nothing.
 *   §C  no multi-colour scales. Confidence is carried by monochrome weight — stroke width and
 *       a muted fill — never by a green/amber/red ramp.
 *   §D  no left-accent borders anywhere.
 *   §C  equal-width columns: siblings are laid out on a uniform pitch, never proportional.
 *   §B  the declared type classes only (.text-small, .text-micro). No ad-hoc font sizes.
 *   §B  headings and labels at full strength. No opacity on text.
 *   §H  reads as the `diagram` block of the casebook family: an SVG map, quiet, typographic.
 *
 * Deliberately NOT here: animation on every re-render (it redraws on each turn and a moving
 * tree is unreadable), icons inside nodes, drop shadows, gradients, rounded "AI" pills.
 */

/**
 * The node shape comes from the WIRE, so it is declared once, in lib/interview-api.ts,
 * beside the call that receives it — the backend builds it (services/structure_tree.py),
 * that module types it, this one only draws it.
 *
 * It was briefly declared in both places, on the reasoning that TypeScript is structural
 * so two identical shapes interchange. They were not identical: the wire sends `null` for
 * a node carrying no figure, and `string | null` is not assignable to `string | undefined`.
 * A duplicated type does not stay in sync by good intentions — the second copy is the bug.
 *
 * Re-exported so importing it from this component keeps working.
 */
export type { StructureNode } from '@/lib/interview-api';

export interface StructureTreeProps {
  root: StructureNode | null;
  /** The node the conversation is on right now. The only thing drawn in --primary. */
  activeId?: string | null;
  /** The node the candidate has tapped, if any. Shares the active treatment: at most one
   *  of the two is ever set, because tapping a node is choosing what to talk about next. */
  selectedId?: string | null;
  /** Tapping a node hands it back so the caller can offer what to do with it. Omit this
   *  and the diagram is inert, which is what the results page wants. */
  onSelect?: (node: StructureNode) => void;
  className?: string;
}

/* Geometry. A fixed pitch keeps siblings on equal columns (§C) and keeps the diagram legible
   whatever the depth — proportional spacing collapses the moment one branch grows. */
const NODE_W = 168;
const NODE_H = 52;
const GAP_X = 20;
const GAP_Y = 62;
const PAD = 14;

/**
 * How small the diagram may be scaled to fit its panel before it starts scrolling instead.
 *
 * A tidy top-down tree gets WIDE: five leaves is already ~950px, and this draws inside a
 * rail the candidate can drag as narrow as they like. Rendered 1:1 in a 430px rail, the
 * SVG overflowed and the panel opened scrolled hard left -- so what you saw was two
 * arbitrary leaf boxes, while the root, the gap branch and the red node marking where the
 * conversation actually is were all off-screen to the right. The diagram looked broken
 * because the only parts of it on screen were the parts that mean least.
 *
 * Scaling to fit alone is not the answer either: 430/950 is 45%, which puts body text at
 * about 6px. So the SVG shrinks to fit only down to this floor, and past it the panel
 * scrolls -- with the view parked on the node that matters (see the effect below) rather
 * than at x=0.
 */
const MIN_SCALE = 0.7;

interface Laid {
  node: StructureNode;
  x: number;
  y: number;
  depth: number;
  children: Laid[];
}

/** Tidy bottom-up layout: a parent centres over its children, leaves pack left to right. */
function layout(node: StructureNode, depth: number, cursor: { x: number }): Laid {
  const kids = (node.children ?? []).map((c) => layout(c, depth + 1, cursor));
  let x: number;
  if (kids.length === 0) {
    x = cursor.x;
    cursor.x += NODE_W + GAP_X;
  } else {
    x = (kids[0].x + kids[kids.length - 1].x) / 2;
  }
  return { node, x, y: depth * (NODE_H + GAP_Y), depth, children: kids };
}

function flatten(l: Laid, out: Laid[] = []): Laid[] {
  out.push(l);
  l.children.forEach((c) => flatten(c, out));
  return out;
}

function NodeBox({ l, activeId, selectedId, onSelect, isNew }: {
  l: Laid;
  activeId?: string | null;
  selectedId?: string | null;
  onSelect?: (node: StructureNode) => void;
  /** Appeared on this turn. Animates in once so the candidate sees it arrive. */
  isNew?: boolean;
}) {
  const { node, x, y } = l;
  const active = node.id === activeId;
  const selected = node.id === selectedId;
  const clickable = Boolean(onSelect) && node.id !== '__root';
  const gap = node.kind === 'gap';
  const inferred = node.kind === 'inferred';
  // The branch that actually explained the case, on a worked answer. §C reserves colour, so
  // this is carried by stroke weight and a bolder label — which also means it composes with
  // the active treatment instead of fighting it: colour says "where you are", weight says
  // "this is the branch that mattered", and a node can honestly be both.
  const driver = node.kind === 'driver';
  // A node computed from its children, rather than a figure they supplied. Its formula is
  // drawn beneath it, between the node and the branches it combines.
  const derived = node.role === 'derived';

  // §C monochrome only. A gap is a thinner, dashed outline of the same hue — never a
  // different colour, because a second colour would read as a second meaning.
  const stroke = active || selected ? 'hsl(var(--primary))' : 'hsl(var(--border))';
  const fill = active || selected
    ? 'hsl(var(--primary) / 0.06)'
    : gap
      ? 'transparent'
      : 'hsl(var(--card))';

  // The whole node is the control, not a tiny icon inside it: on a phone the target has
  // to be the box. role/tabIndex rather than a <button> because a button cannot wrap an
  // SVG <rect> — so Enter and Space are handled by hand, which a real button would give
  // for free and which is exactly the kind of thing that silently goes missing.
  const press = clickable ? () => onSelect!(node) : undefined;

  return (
    <g
      data-new={isNew ? '' : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-pressed={clickable ? selected : undefined}
      aria-label={clickable
        ? `${node.label}${node.value ? `, ${node.value}` : ''}${gap ? ', not covered yet' : ''}`
        : undefined}
      onClick={press}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); press!(); }
      } : undefined}
      className={clickable ? 'cursor-pointer focus:outline-none [&>rect]:focus-visible:stroke-2' : undefined}
    >
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={8}                       /* §14 radius scale: 12 / 8 / 16 */
        fill={fill}
        stroke={stroke}
        strokeWidth={driver ? 2 : active || selected ? 1.5 : 1}
        strokeDasharray={gap ? '4 3' : undefined}
      />
      <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
        <div className="flex h-full flex-col justify-center px-3">
          <span
            className={
              'text-small leading-tight ' +
              (active || driver
                ? 'font-semibold text-foreground'
                : gap
                  ? 'text-muted-foreground'
                  : 'text-foreground')
            }
            style={{
              display: '-webkit-box',
              WebkitLineClamp: node.value || node.share ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as CSSProperties}
          >
            {node.label}
          </span>
          {(node.value || node.share) && (
            /* Figures are the one thing a reader scans for. Tabular numerals so columns of
               them line up down the tree.

               A segmentation node carries both: "~900 Mn (65%)". The share goes SECOND and
               stays muted — the absolute is the quantity the arithmetic above uses, the
               share is how it was arrived at. Leading with the percentage reads as though
               the percentage were the value, which is the error this split exists to avoid. */
            <span className="text-micro tabular-nums text-muted-foreground">
              {node.value}
              {node.share && (
                <span className={node.value ? 'ml-1' : ''}>
                  {node.value ? `(${node.share})` : node.share}
                </span>
              )}
            </span>
          )}
          {!node.value && !node.share && node.implied && (
            /* What their own numbers come to. The arrow marks it as arithmetic the tool
               did, not a figure they gave -- the distinction has to survive a glance,
               because one is their claim and the other is a consequence of it. */
            <span className="text-micro tabular-nums text-muted-foreground">
              <span aria-hidden>⇒ </span>
              <span className="sr-only">implied: </span>
              {node.implied}
            </span>
          )}
          {!node.value && !node.share && !node.implied && gap && (
            /* The gap says what is missing, never what it should be. */
            <span className="text-micro text-muted-foreground">not yet</span>
          )}
        </div>
      </foreignObject>
      {derived && node.formula && (
        /* The equation that produces this node, under it, between it and its children --
           so the arrow down the tree reads as "this is how the branches below combine".
           §B micro class, muted: it is a caption on the structure, not a heading in it. */
        <foreignObject x={x - 16} y={y + NODE_H + 2} width={NODE_W + 32} height={18}>
          <div className="flex h-full items-center justify-center">
            <span className="text-micro text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis px-1">
              {node.formula}
            </span>
          </div>
        </foreignObject>
      )}
      {inferred && (
        /* "You implied this" — a hairline under the box, not a badge. */
        <line
          x1={x + 10}
          y1={y + NODE_H + 3}
          x2={x + NODE_W - 10}
          y2={y + NODE_H + 3}
          stroke="hsl(var(--muted-foreground) / 0.5)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
    </g>
  );
}

function Edges({ l }: { l: Laid }) {
  return (
    <>
      {l.children.map((c) => {
        const x1 = l.x + NODE_W / 2;
        const y1 = l.y + NODE_H;
        const x2 = c.x + NODE_W / 2;
        const y2 = c.y;
        const mid = y1 + GAP_Y / 2;
        return (
          <g key={c.node.id}>
            {/* Orthogonal elbows, not curves: a consulting tree is drawn square. The edge
                INTO a driver node is weighted with it, so the branch that explained the case
                reads as a path down the tree rather than as a run of unrelated bold boxes. */}
            <path
              d={`M ${x1} ${y1} V ${mid} H ${x2} V ${y2}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={c.node.kind === 'driver' ? 1.75 : 1}
              strokeDasharray={c.node.kind === 'gap' ? '4 3' : undefined}
            />
            <Edges l={c} />
          </g>
        );
      })}
    </>
  );
}

function StructureTreeImpl({ root, activeId, selectedId, onSelect, className = '' }: StructureTreeProps) {
  const laid = useMemo(() => (root ? layout(root, 0, { x: PAD }) : null), [root]);
  const nodes = useMemo(() => (laid ? flatten(laid) : []), [laid]);

  /* Which boxes are new since the last turn.
   *
   * The diagram used to simply redraw, so a branch the candidate had just earned appeared
   * with no more ceremony than the ones already sitting there. They often missed it, which
   * wasted the one moment the panel has to prove it is listening. Only the new boxes
   * animate; animating the whole tree every turn would be the same noise with more motion.
   *
   * The FIRST fold is excluded on purpose: resuming a case mid-way would otherwise explode
   * a finished tree onto the screen one box at a time. */
  const seen = useRef<Set<string> | null>(null);
  const fresh = useMemo(() => {
    const ids = nodes.map((n) => n.node.id);
    const prev = seen.current;
    seen.current = new Set(ids);
    if (!prev) return new Set<string>();              // first paint: nothing is "new"
    return new Set(ids.filter((id) => !prev.has(id)));
  }, [nodes]);

  /* How much of the framework is still unopened. A candidate cannot tell from a hint how
   * deep this case goes -- the hint gives two rungs, the worked answer has four -- so the
   * tree states it plainly instead of leaving them to guess when to stop. */
  const mapped = nodes.filter((n) => n.node.id !== '__root' && n.node.kind !== 'gap').length;
  const open = nodes.filter((n) => n.node.kind === 'gap').length;

  if (!laid) return <EmptyState className={className} />;

  const width = Math.max(...nodes.map((n) => n.x)) + NODE_W + PAD;
  const height = Math.max(...nodes.map((n) => n.y)) + NODE_H + PAD + 6;

  return (
    <TreeViewport width={width} height={height} nodes={nodes} mapped={mapped} open={open}
                  focusId={activeId || selectedId || null} className={className}>
      <Edges l={laid} />
      {nodes.map((n) => (
        <NodeBox key={n.node.id} l={n} activeId={activeId} isNew={fresh.has(n.node.id)}
                 selectedId={selectedId} onSelect={onSelect} />
      ))}
    </TreeViewport>
  );
}

/**
 * The scroll box the diagram sits in, and the only part of this component that knows the
 * drawing might not fit.
 *
 * Two jobs, both of which the old plain `overflow-auto` div got wrong by doing nothing:
 *
 *   FIT   the SVG is laid out at its natural size but allowed to scale down to the panel,
 *         to a floor of MIN_SCALE. `width: 100%` with a viewBox does the scaling natively,
 *         `maxWidth` stops it ever blowing up past 1:1 on a wide rail, and `minWidth`
 *         enforces the floor. All three are CSS -- no measuring, no ResizeObserver, and
 *         it re-fits on a rail drag for free.
 *
 *   FOCUS when it still overflows, the useful part is parked in view instead of the left
 *         edge: the node the conversation is on, else the one they tapped, else the root.
 *         Centred where there is room, clamped to the ends so it never scrolls into
 *         padding.
 */
function TreeViewport({ width, height, nodes, focusId, mapped, open, className = '', children }: {
  width: number;
  height: number;
  nodes: Laid[];
  focusId: string | null;
  mapped: number;
  open: number;
  className?: string;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const fadeL = useRef<HTMLDivElement | null>(null);
  const fadeR = useRef<HTMLDivElement | null>(null);

  /* Show an edge fade on whichever side has more diagram off-screen.
   *
   * Written straight to the DOM rather than held in state ON PURPOSE. As state this fires a
   * React render on every scroll frame, and this component's render re-runs the whole tree
   * layout -- a measurable cost on a drag, for two divs changing opacity. The refs are the
   * cheap way and the correct one: nothing else reads this. */
  const paint = () => {
    const el = box.current;
    if (!el) return;
    const over = el.scrollWidth - el.clientWidth;
    if (fadeL.current) fadeL.current.style.opacity = el.scrollLeft > 2 ? '1' : '0';
    if (fadeR.current) fadeR.current.style.opacity = over - el.scrollLeft > 2 ? '1' : '0';
  };

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const over = el.scrollWidth - el.clientWidth;
    if (over <= 1) { paint(); return; }          // it fits; nothing to park
    const target = (focusId && nodes.find((n) => n.node.id === focusId)) || nodes[0];
    if (!target) return;
    // SVG units -> rendered px. scrollWidth is the drawn width, `width` the viewBox width.
    const scale = el.scrollWidth / width;
    const centre = (target.x + NODE_W / 2) * scale - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, Math.min(over, centre));
    paint();
    // `width`/`height` are in the deps because a redrawn tree of a different size has to be
    // re-parked even when the focused node id has not changed.
  }, [focusId, nodes, width, height]);

  return (
    /* `relative` so the fades can sit over the scroll box, and the fades are OUTSIDE the
       scrolling element so they stay pinned to its edges instead of scrolling away. */
    <div>
      <style>{`
        @keyframes mece-node-in { from { opacity: 0; transform: translateY(7px) }
                                  to   { opacity: 1; transform: none } }
        .mece-tree g[data-new] { animation: mece-node-in 340ms cubic-bezier(.2,.7,.3,1) both }
        @media (prefers-reduced-motion: reduce) { .mece-tree g[data-new] { animation: none } }
      `}</style>

      {/* How far in they are. Two numbers, because "mapped" alone reads as a score and
          "open" alone reads as a rebuke; together they read as a map. */}
      {(mapped > 0 || open > 0) && (
        <p className="mb-2 text-micro text-muted-foreground tabular-nums">
          <span className="text-foreground">{mapped}</span> branch{mapped === 1 ? '' : 'es'} mapped
          {open > 0 && <> · <span className="text-foreground">{open}</span> still open</>}
        </p>
      )}

      {/* `relative` wraps ONLY the scroll box. It used to wrap the counter line above it
          too, so the left edge-fade — which is inset-y-0 — painted over that text and ate
          its first character. */}
      <div className="relative">
      <div ref={box} onScroll={paint} className={`overflow-auto ${className}`}>
        <svg
          className="mece-tree"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Your structure so far"
          style={{
            width: '100%',
            maxWidth: width,
            minWidth: Math.round(width * MIN_SCALE),
            height: 'auto',
          }}
        >
          {children}
        </svg>
      </div>
      {/* §C: a tint of the surface the panel already sits on, not a new colour. aria-hidden
          and pointer-events-none -- it is a hint that the diagram continues, and it must
          never eat a tap meant for the node underneath it. */}
      <div ref={fadeL} aria-hidden style={{ opacity: 0 }}
           className="pointer-events-none absolute inset-y-0 left-0 w-8 transition-opacity
                      bg-gradient-to-r from-card to-transparent" />
      <div ref={fadeR} aria-hidden style={{ opacity: 0 }}
           className="pointer-events-none absolute inset-y-0 right-0 w-8 transition-opacity
                      bg-gradient-to-l from-card to-transparent" />
      </div>
    </div>
  );
}

/**
 * What the panel shows before the candidate has said anything.
 *
 * WHY THIS IS NOT ONE GREY SENTENCE ANY MORE
 *
 * It used to be: "Your structure appears here as you talk through it." A first-time visitor
 * read that, understood nothing, and had no reason to believe anything worth seeing was
 * coming. The most distinctive thing this product does was represented, at the exact moment
 * a new user decides whether to bother, by a line of muted text.
 *
 * So the empty state DEMONSTRATES instead of describing. A three-box skeleton draws itself
 * on a loop: root, then two branches, then a dashed one. That last beat is the whole pitch
 * -- it shows the diagram naming a branch the candidate has NOT opened, which is the thing
 * no chat transcript can do for them. By the time they type, they already know what the
 * dashes mean, so the legend has less work to do and the first real node lands as a payoff
 * rather than a surprise.
 *
 * It is a loop and not a one-shot because the panel is often off-screen on first paint; a
 * single play would be missed by most of the people it exists for.
 */
function EmptyState({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-full flex-col justify-center gap-4 px-1 py-6 ${className}`}>
      <style>{`
        @keyframes mece-draw { to { stroke-dashoffset: 0; } }
        @keyframes mece-pop  { 0%,100% { opacity: 0 } 8%,92% { opacity: 1 } }
        .mece-seed [data-draw] {
          stroke-dasharray: 220; stroke-dashoffset: 220;
          animation: mece-draw 5.2s ease-in-out infinite;
        }
        .mece-seed [data-pop] { opacity: 0; animation: mece-pop 5.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mece-seed [data-draw] { stroke-dashoffset: 0; animation: none }
          .mece-seed [data-pop]  { opacity: 1; animation: none }
        }
      `}</style>

      <svg className="mece-seed w-full" viewBox="0 0 300 150" fill="none" role="img"
           aria-label="A diagram of your structure will be drawn here as you talk">
        {/* root */}
        <rect data-pop style={{ animationDelay: '0s' }} x="86" y="8" width="128" height="34"
              rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5"/>
        <rect data-pop style={{ animationDelay: '0s' }} x="96" y="19" width="78" height="5" rx="2.5"
              fill="hsl(var(--muted-foreground) / 0.35)"/>
        {/* connectors */}
        <path data-draw style={{ animationDelay: '.35s' }} d="M150 42 V62 H40 V82" fill="none"
              stroke="hsl(var(--border))" strokeWidth="1.5"/>
        <path data-draw style={{ animationDelay: '.55s' }} d="M150 42 V62 H150 V82" fill="none"
              stroke="hsl(var(--border))" strokeWidth="1.5"/>
        <path data-draw style={{ animationDelay: '1.5s' }} d="M150 42 V62 H260 V82" fill="none"
              stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3"/>
        {/* two branches they said */}
        <rect data-pop style={{ animationDelay: '.5s' }} x="2" y="82" width="76" height="32"
              rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5"/>
        <rect data-pop style={{ animationDelay: '.5s' }} x="11" y="92" width="44" height="4.5" rx="2.25"
              fill="hsl(var(--muted-foreground) / 0.35)"/>
        <rect data-pop style={{ animationDelay: '.9s' }} x="112" y="82" width="76" height="32"
              rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5"/>
        <rect data-pop style={{ animationDelay: '.9s' }} x="121" y="92" width="52" height="4.5" rx="2.25"
              fill="hsl(var(--muted-foreground) / 0.35)"/>
        {/* the branch they have NOT opened — the point of the whole panel */}
        <rect data-pop style={{ animationDelay: '1.7s' }} x="222" y="82" width="76" height="32"
              rx="6" fill="none" stroke="hsl(var(--border))" strokeWidth="1.5" strokeDasharray="4 3"/>
        <rect data-pop style={{ animationDelay: '1.7s' }} x="231" y="92" width="38" height="4.5" rx="2.25"
              fill="hsl(var(--muted-foreground) / 0.22)"/>
      </svg>

      <div className="space-y-1.5 px-2">
        <p className="text-small font-medium text-foreground">Your thinking, drawn as you talk.</p>
        <p className="text-micro text-muted-foreground">
          Say how you&rsquo;d break the problem down. Each split becomes a box — and the
          branches you haven&rsquo;t opened yet appear dashed, so you can see what is missing
          before the interviewer does.
        </p>
      </div>
    </div>
  );
}

/* The tree redraws on every turn of a live conversation. Memoised so a parent re-render from
   an unrelated piece of state does not re-run the layout. */
export const StructureTree = memo(StructureTreeImpl);
export default StructureTree;

/**
 * What the shapes mean. Without this the dashed boxes read as a rendering fault rather
 * than as "the framework expects this and you have not opened it yet" — the diagram's
 * whole vocabulary is three visual states, and two of them are not self-evident.
 *
 * Deliberately one line of plain words, not a boxed key with swatches: a legend that
 * takes up more room than the thing it explains is a sign the thing needs redrawing.
 */
export const StructureLegend = memo(function StructureLegend(
  { className = '' }: { className?: string },
) {
  return (
    <p className={`text-micro text-muted-foreground ${className}`}>
      <span className="text-foreground">Solid</span> is what you have said ·{' '}
      <span className="text-foreground">dashed</span> is a branch the framework expects ·{' '}
      <span className="text-foreground">⇒</span> is what your numbers come to ·{' '}
      <span className="text-primary">red</span> is where you are.
      {' '}Tap any box to take it further.
    </p>
  );
});

/**
 * The diagram as plain indented text.
 *
 * The thing students actually pass around is a screenshot or a paste into a group chat,
 * and an SVG does neither. An outline survives WhatsApp, a notes app and an email, costs
 * nothing to produce, and needs no image service.
 */
export function outlineOf(node: StructureNode | null, depth = 0): string {
  if (!node) return '';
  const pad = '  '.repeat(depth);
  const value = node.value ? ` — ${node.value}` : node.kind === 'gap' ? ' — (not yet)' : '';
  const head = `${pad}${depth ? '• ' : ''}${node.label}${value}`;
  const formula = node.formula ? `\n${pad}  = ${node.formula}` : '';
  const kids = (node.children ?? []).map((c) => outlineOf(c, depth + 1)).join('\n');
  return head + formula + (kids ? '\n' + kids : '');
}
