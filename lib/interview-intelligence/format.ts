import type { EvidenceState } from './types';

export const MODES: { id: string; label: string; blurb: string; group: 'core' | 'focus' | 'pressure' }[] = [
  { id: 'cv_jd', label: 'CV + JD', blurb: 'Your experience against what this role asks for.', group: 'core' },
  { id: 'mixed', label: 'Mixed', blurb: 'A balanced interview across the dimensions the role needs.', group: 'core' },
  { id: 'final_round', label: 'Final round', blurb: 'Broad assessment across every major competency.', group: 'core' },
  { id: 'hiring_manager', label: 'Hiring manager', blurb: 'Business judgment, ownership and prioritisation.', group: 'core' },
  { id: 'company_simulation', label: 'Company + role', blurb: 'Uses the company, the JD and your CV together.', group: 'core' },
  { id: 'hr_behavioral', label: 'HR / behavioural', blurb: 'Motivation, ownership, conflict, failure, self-awareness.', group: 'focus' },
  { id: 'functional', label: 'Functional', blurb: 'Deep questions on the function this role sits in.', group: 'focus' },
  { id: 'technical', label: 'Technical', blurb: 'Role-specific technical assessment.', group: 'focus' },
  { id: 'technical_deep_dive', label: 'Technical deep dive', blurb: 'Very deep functional or technical questioning.', group: 'focus' },
  { id: 'situational', label: 'Situational', blurb: 'Realistic situations from the job itself.', group: 'focus' },
  { id: 'case', label: 'Case / problem solving', blurb: 'A case built around this role.', group: 'focus' },
  { id: 'cv_deep_dive', label: 'CV deep dive', blurb: 'Your CV claims, investigated in depth.', group: 'focus' },
  { id: 'cv_attack', label: 'CV defence', blurb: 'Every major claim on your CV, probed.', group: 'pressure' },
  { id: 'stress', label: 'Pressure', blurb: 'Professional pushback, constraints and forced choices.', group: 'pressure' },
  { id: 'grill', label: 'Grill', blurb: 'High scrutiny, low tolerance for vague answers. Never hostile.', group: 'pressure' },
];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', blurb: 'More guidance, gentler follow-ups.' },
  { id: 'medium', label: 'Medium', blurb: 'A normal interview.' },
  { id: 'hard', label: 'Hard', blurb: 'Less guidance, deeper follow-ups.' },
  { id: 'expert', label: 'Expert', blurb: 'High technical and business depth.' },
  { id: 'grill', label: 'Grill', blurb: 'Every vague statement is treated as unfinished.' },
] as const;

export const DEPTHS = [
  { id: 'standard', label: 'Standard' },
  { id: 'deep', label: 'Deep dive' },
  { id: 'extreme', label: 'Extreme deep dive' },
] as const;

/**
 * Evidence states. "Not sufficiently tested" is deliberately drawn hollow and neutral — it
 * is the absence of evidence, never a weakness (spec §83).
 */
export const STATE: Record<EvidenceState, { label: string; dot: string; chip: string; bar: string }> = {
  strong: {
    label: 'Strong evidence',
    dot: 'bg-viz-good',
    chip: 'bg-viz-good/10 text-viz-good border-viz-good/30',
    bar: 'bg-viz-good',
  },
  moderate: {
    label: 'Moderate evidence',
    dot: 'bg-navy-soft',
    chip: 'bg-navy-soft/10 text-navy-mid dark:text-navy-foreground border-navy-soft/30',
    bar: 'bg-navy-soft',
  },
  weak: {
    label: 'Weak evidence',
    dot: 'bg-viz-warning',
    chip: 'bg-viz-warning/10 text-viz-warning border-viz-warning/30',
    bar: 'bg-viz-warning',
  },
  contradictory: {
    label: 'Contradictory evidence',
    dot: 'bg-viz-critical',
    chip: 'bg-viz-critical/10 text-viz-critical border-viz-critical/30',
    bar: 'bg-viz-critical',
  },
  not_sufficiently_tested: {
    label: 'Not sufficiently tested',
    dot: 'border border-dashed border-muted-foreground bg-transparent',
    chip: 'border-dashed border-muted-foreground/50 text-muted-foreground bg-transparent',
    bar: 'bg-transparent border border-dashed border-muted-foreground/60',
  },
};

export const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'High confidence',
  moderate: 'Moderate confidence',
  low: 'Low confidence',
  limited: 'Limited confidence',
};

export function clock(totalSeconds: number | undefined | null): string {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export function duration(totalSeconds: number | undefined | null): string {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  return m ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
}

export function titleCase(id: string): string {
  return (id || '').replace(/^rs:/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sessionStatusLabel(status: string): string {
  return ({
    created: 'Preparing', uploading: 'Preparing', analyzing: 'Building your interview', ready: 'Ready to start',
    active: 'In progress', paused: 'Paused', completed: 'Completed', abandoned: 'Abandoned',
    expired: 'Expired', failed: 'Could not be prepared',
  } as Record<string, string>)[status] || status;
}

export const ACTIVE_STATES = ['created', 'uploading', 'analyzing', 'ready', 'active', 'paused'];
