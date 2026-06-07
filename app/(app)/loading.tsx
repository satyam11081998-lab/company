/**
 * Generic loading skeleton for every route inside the (app) route group.
 *
 * Renders the instant a user clicks any Link — Next.js shows this until the
 * page's server-component data is ready. Without this file, the previous page
 * stayed frozen on screen during data fetching (the "is it stuck?" feel).
 *
 * Aesthetic: cream cards + soft pulse — mirrors the dashboard's card
 * language (var(--card) bg, var(--line) border, 14px radius). The pulse
 * (var(--bg-2)) is recessive so it reads as "loading" not "broken".
 *
 * Per-route overrides (e.g. dashboard/loading.tsx) take precedence when a
 * route wants a more specific skeleton matching its layout.
 */
export default function Loading() {
  return (
    <div className="container max-w-7xl py-10">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--gap-section, 20px)',
          padding: '24px 36px',
        }}
      >
        <SkeletonCard heightPx={140} />
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <SkeletonCard heightPx={180} />
          <SkeletonCard heightPx={180} />
        </div>
        <SkeletonCard heightPx={360} />
      </div>
    </div>
  );
}

function SkeletonCard({ heightPx }: { heightPx: number }) {
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
      {/* Soft pulse — uses the existing `pulse-soft` keyframe in globals.css
          (3s breathing red glow). On a cream card this reads as a quiet
          waiting state without screaming "loading bar". */}
      <div
        className="pulse-soft"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, var(--bg-2) 50%, transparent 100%)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}
