'use client';

import { memo } from 'react';
import StructureTree from './structure-tree';
import type { StructureNode } from '@/lib/interview-api';

/**
 * The worked approach for this case, beside the candidate's own.
 *
 * WHY THIS PANEL EXISTS
 *
 * The live tree is a mirror: it draws what the candidate said. A mirror tells you what you
 * did, never whether it was the right shape, so on its own the diagram tops out at "neat".
 * What makes it worth paying for is a second structure to read it against — the
 * decomposition a strong candidate builds — drawn in the SAME node shape by the SAME
 * renderer. One shape is the whole point: when the model answer and your own working are
 * visibly the same kind of object, the comparison is immediate and needs no explaining.
 *
 * TWO SOURCES, DELIBERATELY RANKED
 *
 *   framework  an authored or approved worked answer for THIS case (table case_frameworks).
 *              Carries the rails a casebook page carries: the facts, what to notice, where
 *              it lands. Richer, and only ever shown once a human has approved it, because
 *              a wrong model answer teaches the error.
 *   approach   the archetype's own equation, expanded (services/case_models.approach_tree).
 *              No model wrote it, so there is nothing to review: it is available on every
 *              case whose type is known, from the moment it ships.
 *
 * `framework` wins where it exists. `approach` is the floor, not a placeholder — a correct
 * canonical decomposition is worth more than an unreviewed guess at a specific one.
 *
 * WHY IT IS CLOSED BY DEFAULT
 *
 * Guidance before the learner has generated their own structure causes lock-in: they adopt
 * the shape instead of building one, and the practice is worth nothing. So this never opens
 * itself. Opening it is the candidate's decision, and `onOpen` lets the caller record that
 * it happened — a run where the model answer was read is not the same run as one where it
 * was not, and the score should be able to say so.
 *
 * DESIGN CONTRACT (docs/CASEBOOK_DESIGN_CONTRACT.md)
 *   §H  `reveal`: a clean collapsible box. §H `mathBox`: mono type in a plain card, which
 *       is what the calculation chain is.
 *   §C  semantic tokens only; --primary is RESERVED and is NOT used anywhere here — the one
 *       red thing on this rail stays the node the live conversation is on.
 *   §C  the driver branch is carried by WEIGHT, never colour (see structure-tree.tsx).
 *   §D  no left-accent borders.
 *   §B  declared type classes only; headings at full strength, no opacity.
 *   §C  multi-column groups are equal-width.
 */

/** One step of a guesstimate's arithmetic. Ordered: each feeds the next (migration 0081). */
export interface FrameworkStep {
  label: string;
  terms: { label: string; value: string }[];
  op: string;
  result: string;
}

export interface CaseFramework {
  tree: StructureNode;
  facts?: string[] | null;
  assumptions?: string[] | null;
  interviewee_notes?: string[] | null;
  observations?: string[] | null;
  recommendations?: string[] | null;
  calculation?: FrameworkStep[] | null;
  source?: 'authored' | 'generated' | 'imported' | null;
}

export interface CaseFrameworkPanelProps {
  /** The approved worked answer for this case, when there is one. */
  framework?: CaseFramework | null;
  /** The canonical decomposition for the case type. Shown when `framework` is absent. */
  approach?: StructureNode | null;
  /** "Market size = Potential customers × Penetration × …", as a caption over the tree. */
  equation?: string | null;
  /** Fired the first time the candidate opens it, so the attempt can record that. */
  onOpen?: () => void;
  className?: string;
}

/* A labelled list. The rails either side of a casebook's diagram are all this shape, so
   they are one component — five near-identical blocks is how the five drift apart. */
function Rail({ label, items }: { label: string; items?: string[] | null }) {
  const rows = (items || []).filter((s) => (s || '').trim());
  if (!rows.length) return null;
  return (
    <section>
      {/* §B .text-micro for a label; full-strength foreground, no opacity. */}
      <h4 className="text-micro font-semibold uppercase tracking-widest text-foreground">
        {label}
      </h4>
      <ul className="mt-1.5 space-y-1">
        {rows.map((s, i) => (
          <li key={i} className="text-small text-muted-foreground flex gap-2">
            {/* A plain bullet. §C keeps the primary tint for the live diagram, so the marker
                here is muted rather than red. */}
            <span aria-hidden className="text-muted-foreground select-none">·</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The calculation chain.
 *
 * A guesstimate decomposes AND THEN COMPUTES, and the computing is the half candidates get
 * wrong. It is not a tree: the same quantity is a result on one line and a term on the next,
 * which a tree can only show by duplicating it. So it is drawn as what it is — ordered rows,
 * each naming what it produces, in mono so the figures column up (§H `mathBox`).
 */
function Calculation({ steps }: { steps?: FrameworkStep[] | null }) {
  const rows = (steps || []).filter((s) => s && s.label && (s.result || '').trim());
  if (!rows.length) return null;
  return (
    <section>
      <h4 className="text-micro font-semibold uppercase tracking-widest text-foreground">
        Calculation
      </h4>
      <div className="mt-1.5 overflow-hidden rounded-lg border">
        {rows.map((s, i) => (
          <div
            key={i}
            /* No left-accent border (§D). Rows are separated by a hairline, and the last
               one does not carry a rule it has nothing to separate from. */
            className={
              'flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-3 py-2 ' +
              (i ? 'border-t' : '')
            }
          >
            <span className="text-micro text-muted-foreground min-w-0 flex-1">{s.label}</span>
            <span className="font-mono text-micro tabular-nums text-muted-foreground">
              {s.terms.map((t, j) => (
                <span key={j}>
                  {j ? ` ${s.op} ` : ''}
                  {t.value}
                </span>
              ))}
            </span>
            <span className="font-mono text-small tabular-nums font-semibold text-foreground">
              = {s.result}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CaseFrameworkPanelImpl({
  framework,
  approach,
  equation,
  onOpen,
  className = '',
}: CaseFrameworkPanelProps) {
  const tree = framework?.tree ?? approach ?? null;
  if (!tree) return null;

  // An approved worked answer for this case, versus the canonical shape for its type. The
  // candidate is told which they are reading: a model answer and a general framework earn
  // different amounts of trust, and conflating them is how a tool starts quietly lying.
  const worked = Boolean(framework?.tree);
  const hasRails = Boolean(
    framework &&
      ((framework.facts || []).length ||
        (framework.assumptions || []).length ||
        (framework.interviewee_notes || []).length ||
        (framework.observations || []).length ||
        (framework.recommendations || []).length ||
        (framework.calculation || []).length),
  );

  return (
    <details
      className={`group rounded-lg border bg-card ${className}`}
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open) onOpen?.();
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5">
        <span className="text-small font-medium text-foreground">
          {worked ? 'How a strong answer is structured' : 'The standard structure for this case'}
        </span>
        {/* Words, not a chevron glyph: the control has to say what opening it does, and on a
            panel the candidate is choosing whether to spoil, that matters more than an icon. */}
        <span className="shrink-0 text-micro text-muted-foreground">
          <span className="group-open:hidden">Show</span>
          <span className="hidden group-open:inline">Hide</span>
        </span>
      </summary>

      <div className="border-t px-3 py-3 space-y-4">
        <p className="text-micro text-muted-foreground">
          {worked
            ? 'The approach this case rewards. Compare the shape, not the wording.'
            : 'The decomposition this type of case reduces to. Your own split can differ and still be right — what it cannot do is leave a term out.'}
        </p>

        {equation && (
          /* The equation as a caption above the diagram, mono so it reads as a formula and
             not as a sentence. */
          <p className="font-mono text-micro text-muted-foreground break-words">{equation}</p>
        )}

        {/* No onSelect: the worked answer is not something you tap to take further — the
            tree you act on is your own. Omitting it makes the diagram inert by design. */}
        <StructureTree root={tree} className="max-h-[420px]" />

        <Calculation steps={framework?.calculation} />

        {hasRails && (
          /* §C equal-width columns. One column on a phone, because two 160px columns of
             prose is worse than scrolling. */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Rail label="Case facts" items={framework?.facts} />
            <Rail label="Assumptions to state" items={framework?.assumptions} />
            <Rail label="What to notice" items={framework?.observations} />
            <Rail label="Interviewer is looking for" items={framework?.interviewee_notes} />
            <Rail label="Where it lands" items={framework?.recommendations} />
          </div>
        )}

        {framework?.source === 'generated' && (
          /* Provenance, where it is not authored. A reader is entitled to know how much to
             trust what reads like a model answer. */
          <p className="text-micro text-muted-foreground">Drafted from this case’s own solution.</p>
        )}
      </div>
    </details>
  );
}

export const CaseFrameworkPanel = memo(CaseFrameworkPanelImpl);
export default CaseFrameworkPanel;
