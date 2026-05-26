/**
 * Section header pattern used across /home and /dashboard.
 * Renders a small uppercase label + descriptive subtitle.
 * Used at the top of each major section.
 */

export default function SectionHeader({
  label,
  subtitle,
  action,
}: {
  label: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="text-micro font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        {subtitle && (
          <p className="mt-1 text-body text-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
