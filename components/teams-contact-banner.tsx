import { GraduationCap, ArrowRight } from 'lucide-react';

/**
 * Highlighted B2B / institutional contact banner — colleges, case clubs &
 * placement cells. Primary-accented (eyebrow label, icon badge, solid CTA) so a
 * cohort buyer actually notices it instead of it reading as fine print at the
 * bottom of the page. Routes to team@mece.in (the established contact address).
 *
 * Spacing is owned by the call site, not this component.
 */
export default function TeamsContactBanner() {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/[0.05] px-5 py-4 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3.5 min-w-0">
        <span className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary mb-0.5">
            For institutions
          </p>
          <p className="text-sm font-semibold text-foreground">
            Colleges, case clubs &amp; placement cells
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Equipping a whole cohort? We offer group access for institutions — custom seats, no
            public pricing. Tell us your size and we&apos;ll send a quote.
          </p>
        </div>
      </div>
      <a
        href="mailto:team@mece.in?subject=MECE%20for%20colleges%20%26%20clubs&body=Hi%20MECE%20team%2C%20we%27d%20like%20a%20group%20quote.%0AInstitution%20%2F%20club%3A%20%0AApprox%20members%3A%20"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 h-10 px-5 rounded-md bg-primary text-sm font-semibold text-white shadow-sm hover:bg-primary-hover transition-colors"
      >
        Get a group quote <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
