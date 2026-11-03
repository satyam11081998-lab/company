'use client';

import { memo } from 'react';
import type { StructureNode } from '@/lib/interview-api';

/**
 * What you can do with the box you just tapped.
 *
 * WHY A BAR UNDER THE TREE AND NOT A POPOVER ON THE NODE
 *
 * The obvious build is a menu floating at the node. It is the wrong one here: the tree
 * lives in a horizontally scrolling panel whose width the candidate drags, so a floating
 * menu needs constant position maths, lands off-screen at the right-hand edge, covers the
 * diagram it refers to, and is poor on touch and worse with a keyboard. A bar in normal
 * flow under the diagram has none of those problems and reads as part of the panel.
 *
 * WHY NOTHING HERE SENDS A MESSAGE
 *
 * Every action DRAFTS into the composer and focuses it. A one-tap send would let the
 * candidate advance a case without composing a thought, which is precisely the habit this
 * product exists to break. The draft is a sentence opener in their own voice, not a
 * question written for them — they finish it.
 *
 * WHY THE FIRST ACTION CHANGES WITH THE NODE
 *
 * A dashed box and a box they filled in two turns ago want opposite things: one is "take
 * this next", the other is "come back to this". Offering both on every node would make
 * the candidate read four options every time instead of recognising one.
 */

export interface NodeAction {
  key: string;
  label: string;
  /** The sentence put in the composer. First person, unfinished on purpose. */
  draft: string;
}

export function actionsFor(node: StructureNode): NodeAction[] {
  // A long label arrives truncated with an ellipsis for the diagram's sake. Pasting that
  // into a sentence the candidate is about to send reads as a typo, so it comes off here.
  const name = node.label.replace(/\s*…$/, '');
  const gap = node.kind === 'gap';
  const hasChildren = Boolean(node.children?.length);

  const first: NodeAction = gap
    ? { key: 'take', label: 'Take this next', draft: `Let me take ${name} next — ` }
    : { key: 'back', label: 'Come back to this', draft: `Coming back to ${name} — ` };

  const actions: NodeAction[] = [first];

  // Only worth offering where there is something to re-cut: a leaf they have not split
  // has no alternative split to ask about yet.
  if (hasChildren || !gap) {
    actions.push({
      key: 'resplit',
      label: 'Split it differently',
      draft: `Is there a better way to break down ${name}? I was thinking `,
    });
  }
  // "matters MOST" was on every node, which makes it false on all but one -- and the one
  // it is true of is a question the tree cannot answer yet. Asking what a branch is FOR is
  // answerable anywhere in the tree and is the thing a candidate actually needs: a branch
  // you cannot say the purpose of is a branch you copied from a framework.
  actions.push({
    key: 'why',
    label: 'What is this for?',
    draft: `What does ${name} actually tell us in this case?`,
  });
  return actions;
}

export interface NodeActionBarProps {
  node: StructureNode | null;
  onPick: (draft: string) => void;
  onDismiss: () => void;
  className?: string;
}

function NodeActionBarImpl({ node, onPick, onDismiss, className = '' }: NodeActionBarProps) {
  if (!node) return null;
  return (
    <div className={`rounded-lg border bg-card px-3 py-2.5 ${className}`} role="group"
         aria-label={`Actions for ${node.label}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-small font-medium text-foreground">
          {node.label}
          {node.value ? (
            <span className="text-micro tabular-nums text-muted-foreground"> · {node.value}</span>
          ) : node.kind === 'gap' ? (
            <span className="text-micro text-muted-foreground"> · not covered yet</span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-micro text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          Close
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {actionsFor(node).map((a) => (
          <button
            key={a.key}
            type="button"
            onClick={() => onPick(a.draft)}
            /* §D plain bordered controls, no pills, no fills. The one red thing on this
               panel is the node you are on, and that reservation is worth keeping. */
            className="rounded border px-2 py-1 text-micro text-foreground hover:bg-muted focus-visible:bg-muted"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const NodeActionBar = memo(NodeActionBarImpl);
export default NodeActionBar;
