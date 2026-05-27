'use client';

/**
 * GeoPattern — fixed diagonal parallelogram watermark
 * Same pattern visible in the Medusa/Framer template screenshot.
 * Fades naturally where white cards sit on top of it.
 */
export default function GeoPattern() {
  return (
    <>
      {/* Elevate cards so they sit naturally on top of the pattern */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ui-card, .ui-card-floating, .kpi-cell, .data-table, .badge-pill { position: relative; z-index: 10; }
      `}} />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
      >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          {/* Repeating tile: two clusters of 3 diagonal parallelogram outlines */}
          <pattern
            id="geo-bg"
            x="0"
            y="0"
            width="360"
            height="480"
            patternUnits="userSpaceOnUse"
          >
            {/* Cluster 1 — top-left of tile */}
            <rect
              x="8"  y="48"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              transform="rotate(-13 82 172)"
            />
            <rect
              x="34"  y="48"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              style={{ opacity: 0.78 }}
              transform="rotate(-13 108 172)"
            />
            <rect
              x="60"  y="48"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              style={{ opacity: 0.58 }}
              transform="rotate(-13 134 172)"
            />

            {/* Cluster 2 — bottom-right of tile (creates diagonal repeat) */}
            <rect
              x="182"  y="228"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              transform="rotate(-13 256 352)"
            />
            <rect
              x="208"  y="228"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              style={{ opacity: 0.78 }}
              transform="rotate(-13 282 352)"
            />
            <rect
              x="234"  y="228"
              width="148" height="248"
              rx="14"
              fill="none"
              className="geo-line"
              strokeWidth="1"
              style={{ opacity: 0.58 }}
              transform="rotate(-13 308 352)"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#geo-bg)" />
      </svg>
    </div>
    </>
  );
}
