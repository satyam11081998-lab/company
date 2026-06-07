/**
 * Dashboard-shaped loading skeleton.
 *
 * Mirrors the actual dashboard layout (hero, news+guesstimate, constellation,
 * command panel, consistency+recent) so the click→render transition feels
 * like the page is *forming*, not loading from blank. Each card matches the
 * real card's height so there's no layout shift when the real content lands.
 *
 * This file overrides app/(app)/loading.tsx for the /dashboard route only.
 */
export default function DashboardLoading() {
  return (
    <div className="container max-w-7xl py-10">
      <div
        className="dash density-balanced"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-section, 20px)',
          padding: '24px 36px',
        }}
      >
        {/* Hero */}
        <ShimmerCard heightPx={220} />

        {/* News + Guesstimate */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <ShimmerCard heightPx={200} />
          <ShimmerCard heightPx={200} />
        </div>

        {/* Constellation */}
        <ShimmerCard heightPx={680} />

        {/* Command panel */}
        <ShimmerCard heightPx={320} />

        {/* Consistency + Recent */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <ShimmerCard heightPx={260} />
          <ShimmerCard heightPx={260} />
        </div>
      </div>
    </div>
  );
}

/**
 * Cream card with a slow horizontal sheen. The sheen is a single linear
 * gradient sliding across — costs almost nothing on the GPU and never feels
 * spinner-like. Branded because the colors are all CSS vars.
 */
function ShimmerCard({ heightPx }: { heightPx: number }) {
  return (
    <div
      style={{
        height: heightPx,
        borderRadius: 14,
        background: 'var(--card)',
        border: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(110deg, transparent 30%, var(--bg-2) 50%, transparent 70%)',
          backgroundSize: '200% 100%',
          animation: 'sheen 2.4s ease-in-out infinite',
          opacity: 0.7,
        }}
      />
    </div>
  );
}
