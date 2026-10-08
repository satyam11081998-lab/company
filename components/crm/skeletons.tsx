/**
 * Loading placeholders for CRM pages (used by the route-level loading.tsx
 * files). Server components; they appear the instant a link is clicked, while
 * the page's data loads. Shapes follow the real layouts so nothing jumps.
 */
const Bar = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted motion-reduce:animate-none ${className}`} />
);

function Shell({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label={label}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Generic page: title, a row of stat cards, two content cards. */
export function PageSkeleton({ label = 'Loading…' }: { label?: string }) {
  return (
    <Shell label={label}>
      <div className="space-y-2"><Bar className="h-6 w-56" /><Bar className="h-4 w-80 max-w-full" /></div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="rounded-lg border border-border bg-card p-3"><Bar className="h-3 w-24" /><Bar className="mt-2 h-6 w-16" /></div>)}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <Bar className="h-3 w-32" />
            {Array.from({ length: 5 }, (_, j) => <Bar key={j} className="h-4 w-full" />)}
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Module list: toolbar + table rows. */
export function ListSkeleton() {
  return (
    <Shell label="Loading records…">
      <div className="flex flex-wrap items-center justify-between gap-2"><Bar className="h-7 w-40" /><div className="flex gap-2"><Bar className="h-8 w-24" /><Bar className="h-8 w-28" /></div></div>
      <div className="flex gap-2"><Bar className="h-8 w-64" /><Bar className="h-8 w-32" /></div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex gap-4 border-b border-border bg-muted/40 px-4 py-2.5">{['w-24', 'w-40', 'w-32', 'w-28', 'w-20'].map((w, i) => <Bar key={i} className={`h-3 ${w}`} />)}</div>
        {Array.from({ length: 10 }, (_, r) => (
          <div key={r} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] gap-4 border-b border-border px-4 py-3 last:border-0">
            {Array.from({ length: 5 }, (_, c) => <Bar key={c} className={`h-4 ${c === 0 ? 'w-4/5' : 'w-3/5'}`} />)}
          </div>
        ))}
      </div>
    </Shell>
  );
}

/** Record page: header, stage path, overview cards. */
export function RecordSkeleton() {
  return (
    <Shell label="Loading record…">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2"><Bar className="h-3 w-24" /><Bar className="h-7 w-72 max-w-full" /><Bar className="h-4 w-48" /></div>
        <div className="flex gap-2"><Bar className="h-8 w-20" /><Bar className="h-8 w-20" /><Bar className="h-8 w-24" /></div>
      </div>
      <div className="flex gap-1">{Array.from({ length: 5 }, (_, i) => <Bar key={i} className="h-8 flex-1" />)}</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
              {Array.from({ length: 8 }, (_, j) => <div key={j} className="flex gap-3"><Bar className="h-4 w-28" /><Bar className="h-4 flex-1" /></div>)}
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-card p-4">{Array.from({ length: 6 }, (_, j) => <Bar key={j} className="h-4 w-full" />)}</div>
      </div>
    </Shell>
  );
}
