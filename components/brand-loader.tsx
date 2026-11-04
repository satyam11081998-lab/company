/**
 * The MECE mark with its edges being drawn — the wait state for a route change.
 *
 * WHY THE MARK AND NOT A SPINNER
 *
 * A spinner is the same on every site and says only "something is happening". The mark is
 * already the one shape a returning candidate recognises, so tracing its edges says "this
 * is MECE, and it is working" in the same glance. It is also the one place the design
 * contract lets colour speak: §C reserves --primary for the brand mark, and this IS the
 * brand mark, so the running edge is cardinal red by right rather than by exception.
 *
 * The geometry is lifted verbatim from app/icon.svg — the same two triangles, the same
 * viewBox. Redrawing them by eye would have produced a mountain that is nearly the logo,
 * which is worse than not using the logo at all.
 *
 * HOW THE EDGE RUNS
 *
 * `pathLength={100}` renormalises each path so its perimeter is exactly 100 units
 * whatever its real length. That means one dash pattern (a 28-unit lit segment, 72 dark)
 * works identically on both triangles despite their different sizes, and the timing needs
 * no per-path maths. Animating stroke-dashoffset from 0 to -100 runs that segment once
 * around the outline. The two triangles are offset in phase so the eye reads one
 * continuous travelling light rather than two things blinking together.
 *
 * NO JAVASCRIPT
 *
 * Declarative CSS on an inline <style>, so this renders as a server component with zero
 * client JS. A loading state that has to download and hydrate a bundle before it can
 * animate is the one component that must never do that.
 *
 * THE DELAY IS THE POINT
 *
 * It starts fully transparent and fades in after FADE_DELAY_MS. A navigation that
 * resolves in 80ms therefore shows nothing at all — no flash, no flicker — while a slow
 * one gets a loader that feels like it was always there. This is the difference between
 * "responsive" and "busy", and it is why the delay is not a nicety.
 */

export interface BrandLoaderProps {
  /** Rendered size of the mark in px. The viewBox scales, so any size is sharp. */
  size?: number;
  /** Optional line under the mark. Say what is coming, not "Loading…". */
  label?: string;
  /** Fill the parent and centre, which is what a route-level loading.tsx wants. */
  fullscreen?: boolean;
  className?: string;
}

const FADE_DELAY_MS = 140;

export default function BrandLoader({
  size = 72,
  label,
  fullscreen = false,
  className = '',
}: BrandLoaderProps) {
  const wrap = fullscreen
    ? 'flex min-h-[60vh] w-full flex-col items-center justify-center gap-4'
    : 'flex flex-col items-center justify-center gap-3';

  return (
    <div className={`mece-loader ${wrap} ${className}`} role="status" aria-live="polite">
      <style>{`
        .mece-loader {
          opacity: 0;
          animation: mece-loader-in 220ms ease-out ${FADE_DELAY_MS}ms forwards;
        }
        @keyframes mece-loader-in { to { opacity: 1; } }

        /* One lit segment travelling the perimeter. pathLength=100 makes these numbers
           percentages of each outline, so both triangles use the same figures. */
        .mece-loader .edge {
          stroke-dasharray: 28 72;
          animation: mece-edge 1.5s linear infinite;
        }
        .mece-loader .edge-2 {
          /* Half a lap behind, so the two lights are never in step. */
          animation-delay: -0.75s;
        }
        @keyframes mece-edge { to { stroke-dashoffset: -100; } }

        /* The mark's second colour. The logo ships as two fixed variants and this is the
           only difference between them: logo-mece-mark-navy.svg pairs the red with navy
           for light surfaces, logo-mece-mark-white.svg pairs it with white for dark ones.
           Red is --primary in both, which is why only this one flips.
           --navy is the token for #0F1C33, the exact navy in the file. The white side has
           no token because nothing else in the system is pure white in dark mode; it is
           the brand asset's own value, not a UI colour, so it is written literally here
           rather than bent onto a near-white token that would be subtly wrong. */
        .mece-loader { --mark-ink: hsl(var(--navy)); }
        .dark .mece-loader { --mark-ink: hsl(0 0% 100%); }

        @media (prefers-reduced-motion: reduce) {
          .mece-loader { animation: none; opacity: 1; }
          /* Motion removed, not meaning: the outline stays fully drawn and simply
             breathes, so the state is still legible to someone who cannot use motion. */
          .mece-loader .edge {
            stroke-dasharray: none;
            animation: mece-edge-still 2s ease-in-out infinite;
          }
          .mece-loader .edge-2 { animation-delay: -1s; }
          @keyframes mece-edge-still { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
        }
      `}</style>

      <svg
        width={size}
        height={Math.round((size * 96) / 128)}
        viewBox="0 0 128 96"
        fill="none"
        aria-hidden="true"
      >
        {/* Geometry copied exactly from app/icon.svg.

            The mark is SOLID, not outlined. Drawn as two bare outlines it stopped being
            the logo and became two overlapping triangles — recognisable as nothing. So
            the shapes are filled exactly as the real mark fills them, and the animation
            runs on top. Both peaks are solid in the mark's OWN two colours: red, and
            navy-or-white by theme (--mark-ink above). Filling the front peak with the page
            background instead produced a cut-out — cream on red in light, dark navy on red
            in dark — which is the logo in neither theme. */}
        <path d="M34 84 L72 20 L110 84 Z" fill="hsl(var(--primary))" />
        <path d="M8 84 L42 38 L76 84 Z" fill="var(--mark-ink)" />

        {/* The travelling lights, over the solid mark. Each runs in a colour that reads
            against the fill it crosses: the page tint over the red, red over the ink. */}
        <path className="edge" pathLength={100} d="M34 84 L72 20 L110 84 Z"
              fill="none" stroke="hsl(var(--background))" strokeWidth={4}
              strokeLinejoin="round" strokeLinecap="round" />
        <path className="edge edge-2" pathLength={100} d="M8 84 L42 38 L76 84 Z"
              fill="none" stroke="hsl(var(--primary))" strokeWidth={4}
              strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      {label ? (
        <p className="text-small text-muted-foreground">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
