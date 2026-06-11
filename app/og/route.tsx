import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const KIND_LABEL: Record<string, string> = {
  case: 'Case Interview',
  guesstimate: 'Guesstimate',
  concept: 'Concept',
  framework: 'Framework',
  toolkit: 'Toolkit',
  primer: 'Industry Primer',
};

/**
 * Dynamic Open Graph card generator for content pages.
 * /og?title=...&subtitle=...&kind=case
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get('title') || 'The MECE Casebook').slice(0, 120);
  const subtitle = (searchParams.get('subtitle') || '').slice(0, 160);
  const kind = searchParams.get('kind') || '';
  const badge = KIND_LABEL[kind] || 'The MECE Casebook';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #16294a 0%, #0F1C33 60%, #0a1424 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 52,
                height: 52,
                borderRadius: 13,
                background: '#ffffff',
                color: '#0F1C33',
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              M
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>MECE</div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              fontWeight: 700,
              color: '#b9c4d6',
              border: '2px solid #2c3e5f',
              borderRadius: 999,
              padding: '10px 28px',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 52 : 64,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 30, color: '#b9c4d6', lineHeight: 1.4 }}>{subtitle}</div>
          ) : null}
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#8fa0bd' }}>
          mece.in · free placement interview prep
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
