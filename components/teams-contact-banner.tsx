import { ArrowRight } from 'lucide-react';

/**
 * Understated B2B / institutional contact strip shown beneath the consumer
 * pricing cards. Deliberately low-emphasis — Free / Lite / Pro are the focus;
 * this is just a quiet "for colleges & clubs, talk to us" line with no public
 * quotation. Routes to team@mece.in (the established contact address).
 *
 * Spacing is owned by the call site, not this component.
 */
export default function TeamsContactBanner() {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          Colleges, case clubs &amp; placement cells
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Equipping a whole cohort? We offer group access for institutions — custom seats, no
          public pricing. Tell us your size and we&apos;ll send a quote.
        </p>
      </div>
      <a
        href="mailto:team@mece.in?subject=MECE%20for%20colleges%20%26%20clubs&body=Hi%20MECE%20team%2C%20we%27d%20like%20a%20group%20quote.%0AInstitution%20%2F%20club%3A%20%0AApprox%20members%3A%20"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Contact us <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
