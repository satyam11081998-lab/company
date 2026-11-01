'use client';

import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';

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

export interface StructureNode {
  id: string;
  /** The candidate's own words, trimmed. Never paraphrased into house style. */
  label: string;
  /** A figure they attached to this branch, already formatted ("₹2.4 cr", "40%"). */
  value?: string;
  children?: StructureNode[];
  /**
   * 'stated'    the candidate said it
   * 'inferred'  read from their reasoning but not said outright — drawn lighter, dashed
   * 'gap'       a branch their own framework implies and they have not opened yet
   */
  kind?: 'stated' | 'inferred' | 'gap';
}

export interface StructureTreeProps {
  root: StructureNode | null;
  /** The node the conversation is on right now. The only thing drawn in --primary. */
  activeId?: string | null;
  className?: string;
}

/* Geometry. A fixed pitch keeps siblings on equal columns (§C) and keeps the diagram legible
   whatever the depth — proportional spacing collapses the moment one branch grows. */
const NODE_W = 168;
const NODE_H = 46;
const GAP_X = 20;
const GAP_Y = 54;
const PAD = 14;

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

function NodeBox({ l, activeId }: { l: Laid; activeId?: string | null }) {
  const { node, x, y } = l;
  const active = node.id === activeId;
  const gap = node.kind === 'gap';
  const inferred = node.kind === 'inferred';

  // §C monochrome only. A gap is a thinner, dashed outline of the same hue — never a
  // different colour, because a second colour would read as a second meaning.
  const stroke = active ? 'hsl(var(--primary))' : 'hsl(var(--border))';
  const fill = active
    ? 'hsl(var(--primary) / 0.06)'
    : gap
      ? 'transparent'
      : 'hsl(var(--card))';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={8}                       /* §14 radius scale: 12 / 8 / 16 */
        fill={fill}
        stroke={stroke}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={gap ? '4 3' : undefined}
      />
      <foreignObject x={x} y={y} width={NODE_W} height={NODE_H}>
        <div className="flex h-full flex-col justify-center px-3">
          <span
            className={
              'text-small leading-tight ' +
              (active ? 'font-semibold text-foreground' : gap ? 'text-muted-foreground' : 'text-foreground')
            }
            style={{
              display: '-webkit-box',
              WebkitLineClamp: node.value ? 1 : 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            } as CSSProperties}
          >
            {node.label}
          </span>
          {node.value && (
            /* Figures are the one thing a reader scans for. Tabular numerals so columns of
               them line up down the tree. */
            <span className="text-micro tabular-nums text-muted-foreground">{node.value}</span>
          )}
        </div>
      </foreignObject>
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
            {/* Orthogonal elbows, not curves: a consulting tree is drawn square. */}
            <path
              d={`M ${x1} ${y1} V ${mid} H ${x2} V ${y2}`}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray={c.node.kind === 'gap' ? '4 3' : undefined}
            />
            <Edges l={c} />
          </g>
        );
      })}
    </>
  );
}

function StructureTreeImpl({ root, activeId, className = '' }: StructureTreeProps) {
  const laid = useMemo(() => (root ? layout(root, 0, { x: PAD }) : null), [root]);
  const nodes = useMemo(() => (laid ? flatten(laid) : []), [laid]);

  if (!laid) {
    return (
      <div className={`flex h-full items-center justify-center px-6 ${className}`}>
        <p className="text-small text-muted-foreground">
          Your structure appears here as you talk through it.
        </p>
      </div>
    );
  }

  const width = Math.max(...nodes.map((n) => n.x)) + NODE_W + PAD;
  const height = Math.max(...nodes.map((n) => n.y)) + NODE_H + PAD + 6;

  return (
    <div className={`overflow-auto ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Your structure so far"
        className="max-w-none"
      >
        <Edges l={laid} />
        {nodes.map((n) => (
          <NodeBox key={n.node.id} l={n} activeId={activeId} />
        ))}
      </svg>
    </div>
  );
}

/* The tree redraws on every turn of a live conversation. Memoised so a parent re-render from
   an unrelated piece of state does not re-run the layout. */
export const StructureTree = memo(StructureTreeImpl);
export default StructureTree;
