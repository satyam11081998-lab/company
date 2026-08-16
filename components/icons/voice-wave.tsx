import * as React from 'react';

/**
 * Voice-mode waveform mark (owner-supplied, 2026-08-16).
 *
 * Six rounded bars rising to a centre peak. Drawn with `currentColor` so it
 * inherits the brand palette from whatever it sits in — never hard-code a fill
 * here, or it will stop following the theme in dark mode.
 *
 * Deliberately NOT a lucide icon: this is the product mark for voice mode and
 * needs to stay distinct from the dictation mic beside it.
 */
export default function VoiceWave({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* x, y, height — symmetrical around the tallest centre bar */}
      <rect x="1.5" y="10" width="2.6" height="4" rx="1.3" fill="currentColor" />
      <rect x="5.6" y="6.5" width="2.6" height="11" rx="1.3" fill="currentColor" />
      <rect x="9.7" y="8.75" width="2.6" height="6.5" rx="1.3" fill="currentColor" />
      <rect x="13.8" y="4" width="2.6" height="16" rx="1.3" fill="currentColor" />
      <rect x="17.9" y="8.75" width="2.6" height="6.5" rx="1.3" fill="currentColor" />
      <rect x="21.4" y="10.5" width="2.1" height="3" rx="1.05" fill="currentColor" />
    </svg>
  );
}
