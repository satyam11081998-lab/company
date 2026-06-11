import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'MECE — Placement interview prep for Indian MBA students';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Site-wide Open Graph card (navy brand panel). */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'linear-gradient(135deg, #16294a 0%, #0F1C33 60%, #0a1424 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#ffffff',
              color: '#0F1C33',
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>MECE</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
            Crack placement interviews the structured way.
          </div>
          <div style={{ fontSize: 32, color: '#b9c4d6', lineHeight: 1.4 }}>
            Cases · Guesstimates · Frameworks · GD briefs — for Indian MBA students
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#8fa0bd' }}>mece.in</div>
      </div>
    ),
    size
  );
}
