import { EEAT_AUTHOR, EEAT_REVIEWER } from '@/lib/seo';
import { Clock, User, ShieldCheck } from 'lucide-react';

/**
 * EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) signals
 * displayed on educational content pages.
 *
 * Renders:
 *   - Author attribution
 *   - Reviewer name with credentials
 *   - Last updated date
 *   - Optional methodology reference
 *
 * These signals improve search engine trust and AI citation quality.
 */

interface EEATSignalsProps {
  /** ISO date string for when the content was last updated */
  lastUpdated?: string;
  /** Reading time in minutes */
  readingTimeMin?: number;
  /** Optional methodology page link */
  showMethodology?: boolean;
}

export default function EEATSignals({
  lastUpdated,
  readingTimeMin,
  showMethodology = false,
}: EEATSignalsProps) {
  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground border-b border-border pb-4 mb-6">
      {/* Author */}
      <span className="inline-flex items-center gap-1.5">
        <User className="h-3.5 w-3.5" />
        <span>By <strong className="font-medium text-foreground/70">{EEAT_AUTHOR}</strong></span>
      </span>

      {/* Reviewer */}
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>
          Reviewed by{' '}
          <strong className="font-medium text-foreground/70">{EEAT_REVIEWER.name}</strong>
          <span className="hidden sm:inline">, {EEAT_REVIEWER.credential}</span>
        </span>
      </span>

      {/* Last updated */}
      {formattedDate && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Updated {formattedDate}
        </span>
      )}

      {/* Reading time */}
      {readingTimeMin && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {readingTimeMin} min read
        </span>
      )}

      {/* Methodology link */}
      {showMethodology && (
        <a
          href="/methodology"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          Our scoring methodology →
        </a>
      )}
    </div>
  );
}
