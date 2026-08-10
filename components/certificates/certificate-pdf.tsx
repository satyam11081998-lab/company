'use client';

/**
 * MECE live-project completion certificate, the ONE renderer.
 *
 * The admin preview and the download both come from this Document, rendered to
 * the same blob. That is deliberate: a separate HTML preview would drift from
 * the PDF within weeks and start lying about what the recipient receives.
 *
 * A4 landscape, one page, selectable text, embedded fonts. The design reference
 * (an HTML mock plus a Python renderer) lives outside the repo in
 * company/certificates/ and is not wired to anything.
 *
 * Anti-forgery: tiled watermark drawn into the paper, guilloche hatch bands in
 * the top and bottom margins, a microprint footer generated from the cert id,
 * and a QR pointing at the public verification page.
 */

import {
  Document, Page, View, Text, Image, StyleSheet, Font, Svg, Polygon, pdf,
} from '@react-pdf/renderer';
import type { CertificatePrintable } from '@/lib/certificates';
import { formatCertDate, microprintFor, verifyUrlFor } from '@/lib/certificates';

// ── geometry ────────────────────────────────────────────────────────────────
/** Millimetres to PDF points. The design was drawn in mm; keep it that way. */
const mm = (v: number) => v * 2.834645669;

const NAVY = '#0F1C33';
const INK = '#2A3446';
const SOFT = '#5A6B85';
const RULE = '#D8CFBB';
const GOLD = '#A98A47';
const RED = '#C8102E';
const PAPER = '#FCFAF4';

const PAGE_W = mm(297);
const PAGE_H = mm(210);

// ── fonts ───────────────────────────────────────────────────────────────────
// Self-hosted under /public/fonts so generation never depends on a third-party
// CDN being up. Subset to Latin + Latin Extended so accented names survive.
let fontsRegistered = false;

function registerFonts(origin: string) {
  if (fontsRegistered) return;
  const f = (file: string) => `${origin}/fonts/${file}`;

  Font.register({
    family: 'Lora',
    fonts: [
      { src: f('Lora-Regular.ttf'), fontWeight: 400 },
      { src: f('Lora-Bold.ttf'), fontWeight: 700 },
      { src: f('Lora-Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    ],
  });
  Font.register({
    family: 'Lato',
    fonts: [
      { src: f('Lato-Regular.ttf'), fontWeight: 400 },
      { src: f('Lato-Bold.ttf'), fontWeight: 700 },
      { src: f('Lato-Black.ttf'), fontWeight: 900 },
    ],
  });

  // react-pdf hyphenates by default, which would break a recipient's name
  // across two lines with a hyphen that is not in their name.
  Font.registerHyphenationCallback((word) => [word]);

  fontsRegistered = true;
}

// ── styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { width: PAGE_W, height: PAGE_H, backgroundColor: PAPER, position: 'relative' },

  frameA: { position: 'absolute', top: mm(8), left: mm(8), right: mm(8), bottom: mm(8),
    borderWidth: mm(1.4), borderColor: NAVY, borderStyle: 'solid' },
  frameB: { position: 'absolute', top: mm(10.4), left: mm(10.4), right: mm(10.4), bottom: mm(10.4),
    borderWidth: mm(0.3), borderColor: RED, borderStyle: 'solid' },
  frameC: { position: 'absolute', top: mm(11.6), left: mm(11.6), right: mm(11.6), bottom: mm(11.6),
    borderWidth: mm(0.2), borderColor: RULE, borderStyle: 'solid' },

  guillocheRow: { position: 'absolute', left: mm(8), right: mm(8), height: mm(5),
    flexDirection: 'row', overflow: 'hidden' },
  hatch: { width: mm(0.35), height: mm(9), backgroundColor: NAVY, opacity: 0.06,
    marginRight: mm(2.65), transform: 'rotate(45deg)' },

  content: { position: 'absolute', top: mm(16), left: mm(24), right: mm(24), alignItems: 'center' },

  // Tight-cropped wordmark (aspect ~8.17:1), so the height below is ink, not
  // transparent padding. /logo-light.png is the same artwork but ~60% padding,
  // which is why it is not used here.
  logo: { height: mm(8), objectFit: 'contain' },
  tagline: { marginTop: mm(2.6), fontFamily: 'Lato', fontWeight: 700, fontSize: 6.3,
    letterSpacing: 1.65, color: SOFT, textTransform: 'uppercase', textAlign: 'center' },

  ribbon: { marginTop: mm(5.5), backgroundColor: NAVY, borderRadius: mm(0.8),
    paddingVertical: mm(2.1), paddingHorizontal: mm(9), flexDirection: 'row', alignItems: 'center' },
  ribbonText: { fontFamily: 'Lato', fontWeight: 900, fontSize: 11, letterSpacing: 2.65,
    color: '#F7F3E8', textTransform: 'uppercase' },
  // A rotated square, not the character U+25C6: no text font here carries that
  // glyph, and the fallback renders as a stray letter.
  ribbonDot: { width: mm(1.5), height: mm(1.5), backgroundColor: '#E9B4BE',
    transform: 'rotate(45deg)', marginHorizontal: mm(3.4) },

  lede: { marginTop: mm(8), fontFamily: 'Lora', fontStyle: 'italic', fontSize: 11, color: SOFT },
  name: { marginTop: mm(1.5), fontFamily: 'Lora', fontWeight: 700, fontSize: 42, color: NAVY,
    textAlign: 'center' },

  flourish: { marginTop: mm(3), width: mm(110), height: mm(1.8), position: 'relative' },
  flourishBar: { position: 'absolute', top: mm(0.7), left: 0, width: mm(110), height: mm(0.35),
    backgroundColor: RULE },
  flourishDot: { position: 'absolute', top: 0, left: mm(54.1), width: mm(1.8), height: mm(1.8),
    backgroundColor: RED, transform: 'rotate(45deg)' },

  prog: { marginTop: mm(2.8), fontFamily: 'Lato', fontSize: 9, color: SOFT, textAlign: 'center' },

  statement: { marginTop: mm(9), maxWidth: mm(210), fontFamily: 'Lora', fontSize: 11,
    lineHeight: 1.6, color: INK, textAlign: 'center' },
  statementBold: { fontFamily: 'Lora', fontWeight: 700, color: NAVY },

  role: { marginTop: mm(4), fontFamily: 'Lato', fontWeight: 900, fontSize: 18, color: RED,
    letterSpacing: 0.55, textTransform: 'uppercase', textAlign: 'center' },

  dates: { marginTop: mm(4), fontFamily: 'Lato', fontSize: 9, color: SOFT, textAlign: 'center' },
  datesBold: { fontFamily: 'Lato', fontWeight: 700, color: NAVY },

  scope: { marginTop: mm(9), maxWidth: mm(220), paddingVertical: mm(3), paddingHorizontal: mm(10),
    borderTopWidth: mm(0.25), borderBottomWidth: mm(0.25), borderColor: RULE, borderStyle: 'solid',
    fontFamily: 'Lora', fontSize: 9.4, lineHeight: 1.5, color: INK, textAlign: 'center' },
  scopeLead: { fontFamily: 'Lora', fontWeight: 700, color: NAVY },

  // signing row
  sign: { position: 'absolute', left: mm(22), right: mm(52), bottom: mm(13), flexDirection: 'row',
    alignItems: 'flex-end' },
  sigCol: { width: '34%', alignItems: 'center' },
  sealCol: { width: '32%', alignItems: 'center' },
  sigImage: { height: mm(13), maxWidth: mm(50), objectFit: 'contain', marginBottom: mm(0.6) },
  sigSpacer: { height: mm(13.6) },
  sigLine: { width: mm(54), borderTopWidth: mm(0.35), borderColor: NAVY, borderStyle: 'solid',
    paddingTop: mm(1.3), alignItems: 'center' },
  sigName: { fontFamily: 'Lora', fontWeight: 700, fontSize: 10.5, color: NAVY },
  sigRole: { marginTop: mm(0.5), fontFamily: 'Lato', fontSize: 6.5, letterSpacing: 1,
    color: SOFT, textTransform: 'uppercase' },

  seal: { width: mm(25), height: mm(25), borderRadius: mm(12.5), borderWidth: mm(0.7),
    borderColor: GOLD, borderStyle: 'solid', backgroundColor: '#FFFDF6',
    alignItems: 'center', justifyContent: 'center' },
  sealInner: { position: 'absolute', top: mm(2.2), left: mm(2.2), width: mm(20.6), height: mm(20.6),
    borderRadius: mm(10.3), borderWidth: mm(0.25), borderColor: GOLD, borderStyle: 'solid' },
  sealT1: { fontFamily: 'Lato', fontWeight: 900, fontSize: 5.1, letterSpacing: 0.9, color: GOLD },
  sealT2: { fontFamily: 'Lora', fontWeight: 700, fontSize: 9.5, color: NAVY, marginTop: mm(0.4) },
  sealT3: { fontFamily: 'Lato', fontWeight: 700, fontSize: 4.7, letterSpacing: 0.65, color: SOFT,
    marginTop: mm(0.3) },
  verify: { marginTop: mm(1.6), fontFamily: 'Lato', fontSize: 6.2, color: SOFT, textAlign: 'center',
    lineHeight: 1.5 },
  verifyBold: { fontFamily: 'Lato', fontWeight: 700, color: NAVY },

  qrBox: { position: 'absolute', right: mm(22), bottom: mm(13), width: mm(24), alignItems: 'center' },
  qr: { width: mm(20), height: mm(20) },
  qrCaption: { marginTop: mm(1.2), fontFamily: 'Lato', fontSize: 5, letterSpacing: 0.5, color: SOFT,
    textTransform: 'uppercase' },

  microprint: { position: 'absolute', left: mm(8), right: mm(8), bottom: mm(3.6), fontFamily: 'Lato',
    fontSize: 3.4, letterSpacing: 0.95, color: '#BFB39A', textAlign: 'center',
    maxLines: 1, textOverflow: 'ellipsis' },

  // watermark
  wmLayer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  wmCell: { position: 'absolute', flexDirection: 'row', alignItems: 'center', opacity: 0.055 },
  wmTri: { width: mm(8.4), height: mm(5.6) },
  wmText: { fontFamily: 'Lato', fontWeight: 900, fontSize: 12.5, letterSpacing: 1.4, color: NAVY,
    marginLeft: mm(2) },

  revoked: { position: 'absolute', top: mm(96), left: 0, right: 0, alignItems: 'center' },
  revokedText: { fontFamily: 'Lato', fontWeight: 900, fontSize: 46, letterSpacing: 8,
    color: RED, opacity: 0.16, transform: 'rotate(-18deg)' },
});

// ── pieces ──────────────────────────────────────────────────────────────────

/** Diagonal hatch band. Purely decorative; degrades on photocopy. */
function Guilloche({ top }: { top: boolean }) {
  const ticks = Array.from({ length: 92 }, (_, i) => i);
  return (
    <View style={[s.guillocheRow, top ? { top: mm(8) } : { bottom: mm(8) }]}>
      {ticks.map((i) => <View key={i} style={s.hatch} />)}
    </View>
  );
}

function Corners() {
  const bar = (extra: object) => ({ position: 'absolute' as const, backgroundColor: GOLD, ...extra });
  const H = { width: mm(15), height: mm(0.5) };
  const V = { width: mm(0.5), height: mm(15) };
  const i = mm(9.4);
  return (
    <View style={s.wmLayer}>
      <View style={bar({ ...H, top: i, left: i })} />
      <View style={bar({ ...V, top: i, left: i })} />
      <View style={bar({ ...H, top: i, right: i })} />
      <View style={bar({ ...V, top: i, right: i })} />
      <View style={bar({ ...H, bottom: i, left: i })} />
      <View style={bar({ ...V, bottom: i, left: i })} />
      <View style={bar({ ...H, bottom: i, right: i })} />
      <View style={bar({ ...V, bottom: i, right: i })} />
    </View>
  );
}

/** Tiled MECE mark woven into the paper. Drawn first, so text paints over it. */
function Watermark() {
  const cells: { x: number; y: number }[] = [];
  const stepX = mm(74);
  const stepY = mm(37);
  for (let row = 0; row * stepY < PAGE_H + stepY; row += 1) {
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let col = -1; col * stepX + offset < PAGE_W + stepX; col += 1) {
      cells.push({ x: col * stepX + offset, y: row * stepY });
    }
  }
  return (
    <View style={s.wmLayer}>
      {cells.map((c, i) => (
        <View key={i} style={[s.wmCell, { left: c.x, top: c.y }]}>
          {/* The MECE twin peaks, as ONE polygon.
              Two notes, both learned the hard way:
              - react-pdf does not support the transparent-border triangle
                trick; it fills a solid box. Hence SVG.
              - opacity on the parent View is NOT inherited by SVG children, so
                the tint has to be fillOpacity or the watermark prints solid. */}
          <Svg style={s.wmTri} viewBox="0 0 84 56">
            <Polygon points="30,8 50,40 60,24 82,54 2,54" fill={NAVY} fillOpacity={0.055} />
          </Svg>
          <Text style={s.wmText}>MECE</Text>
        </View>
      ))}
    </View>
  );
}

export interface CertificateAssets {
  /** Absolute or same-origin URL of the navy MECE logo (PNG or JPG). */
  logoUrl: string;
  /** PNG data URL of the QR pointing at the verification page. */
  qrDataUrl: string;
  /** Signature images. Omit either one to print just the line and the name. */
  sig1Url?: string | null;
  sig2Url?: string | null;
  /** Origin used to build the printed verification URL. */
  origin?: string;
}

export function CertificateDocument({
  cert, assets,
}: { cert: CertificatePrintable; assets: CertificateAssets }) {
  const period = [
    cert.duration_label,
    cert.engagement_mode,
    cert.reporting_to ? `Reported to ${cert.reporting_to}` : null,
  ].filter(Boolean).join('   ·   ');

  // "Scope of work: ...", bolden the lead-in without needing HTML.
  const scopeSplit = cert.scope_line.indexOf(':');
  const scopeLead = scopeSplit > -1 ? cert.scope_line.slice(0, scopeSplit + 1) : '';
  const scopeRest = scopeSplit > -1 ? cert.scope_line.slice(scopeSplit + 1) : cert.scope_line;

  return (
    <Document
      title={`${cert.recipient_name}, ${cert.cert_title}`}
      author="MECE"
      subject={cert.cert_title}
      keywords={`MECE, live project, certificate, ${cert.cert_id}`}
    >
      <Page size="A4" orientation="landscape" style={s.page}>
        <Watermark />
        <Guilloche top />
        <Guilloche top={false} />
        <View style={s.frameA} />
        <View style={s.frameB} />
        <View style={s.frameC} />
        <Corners />

        {cert.is_revoked && (
          <View style={s.revoked}>
            <Text style={s.revokedText}>REVOKED</Text>
          </View>
        )}

        <View style={s.content}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.logo} src={assets.logoUrl} />
          <Text style={s.tagline}>
            mece.in  ·  Method for Evaluating Corporate Excellence  ·  AI-led case,
            guesstimate &amp; interview prep for Indian MBA students
          </Text>

          <View style={s.ribbon}>
            <View style={s.ribbonDot} />
            <Text style={s.ribbonText}>{cert.cert_title}</Text>
            <View style={s.ribbonDot} />
          </View>

          <Text style={s.lede}>This is to certify that</Text>
          <Text style={s.name}>{cert.recipient_name}</Text>
          <View style={s.flourish}>
            <View style={s.flourishBar} />
            <View style={s.flourishDot} />
          </View>
          {!!cert.recipient_program && <Text style={s.prog}>{cert.recipient_program}</Text>}

          <Text style={s.statement}>
            has successfully completed a{' '}
            <Text style={s.statementBold}>live, in-production project</Text> at MECE
            {cert.project_title ? ` (${cert.project_title})` : ''}, working directly with
            the Co-Founder on the 0 to 1 build of the product, in the role of
          </Text>

          <Text style={s.role}>{cert.role_title}</Text>

          <Text style={s.dates}>
            from <Text style={s.datesBold}>{formatCertDate(cert.start_date)}</Text> to{' '}
            <Text style={s.datesBold}>{formatCertDate(cert.end_date)}</Text>
            {period ? `   ·   ${period}` : ''}
          </Text>

          <Text style={s.scope}>
            {scopeLead ? <Text style={s.scopeLead}>{scopeLead}</Text> : null}
            {scopeRest}
          </Text>
        </View>

        <View style={s.sign}>
          <View style={s.sigCol}>
            {assets.sig1Url
              // eslint-disable-next-line jsx-a11y/alt-text
              ? <Image style={s.sigImage} src={assets.sig1Url} />
              : <View style={s.sigSpacer} />}
            <View style={s.sigLine}>
              <Text style={s.sigName}>{cert.sig1_name}</Text>
              <Text style={s.sigRole}>{cert.sig1_title}</Text>
            </View>
          </View>

          <View style={s.sealCol}>
            <View style={s.seal}>
              <View style={s.sealInner} />
              <Text style={s.sealT1}>VERIFIED</Text>
              <Text style={s.sealT2}>MECE</Text>
              <Text style={s.sealT3}>LIVE PROJECT</Text>
            </View>
            <Text style={s.verify}>
              Certificate ID <Text style={s.verifyBold}>{cert.cert_id}</Text>
              {'\n'}Issued {formatCertDate(cert.issued_at)}
            </Text>
          </View>

          <View style={s.sigCol}>
            {assets.sig2Url
              // eslint-disable-next-line jsx-a11y/alt-text
              ? <Image style={s.sigImage} src={assets.sig2Url} />
              : <View style={s.sigSpacer} />}
            <View style={s.sigLine}>
              <Text style={s.sigName}>{cert.sig2_name}</Text>
              <Text style={s.sigRole}>{cert.sig2_title}</Text>
            </View>
          </View>
        </View>

        <View style={s.qrBox}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.qr} src={assets.qrDataUrl} />
          <Text style={s.qrCaption}>Scan to verify</Text>
        </View>

        <Text style={s.microprint}>{microprintFor(cert.cert_id)}</Text>
      </Page>
    </Document>
  );
}

// ── build + download ────────────────────────────────────────────────────────

/**
 * Render the certificate to a Blob. Client-only: it registers fonts against
 * `window.location.origin` and reads images over HTTP.
 */
export async function buildCertificatePdf(
  cert: CertificatePrintable,
  opts: { sig1Url?: string | null; sig2Url?: string | null } = {},
): Promise<Blob> {
  const origin = window.location.origin;
  registerFonts(origin);

  const QRCode = (await import('qrcode')).default;
  const qrDataUrl = await QRCode.toDataURL(verifyUrlFor(cert.cert_id, origin), {
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 10,
    color: { dark: NAVY, light: '#FFFFFF' },
  });

  try {
    return await pdf(
      <CertificateDocument
        cert={cert}
        assets={{
          logoUrl: `${origin}/certificates/logo-mece-navy.png`,
          qrDataUrl,
          sig1Url: opts.sig1Url ?? null,
          sig2Url: opts.sig2Url ?? null,
          origin,
        }}
      />,
    ).toBlob();
  } catch (err) {
    const detail = (err as Error).message || String(err);

    // fontkit is what react-pdf uses to parse an embedded TTF. If its ESM build
    // is missing or half-installed, the failure surfaces as "<minified>.create
    // is not a function" and reads like a broken download, sending you off to
    // check fonts and images that are perfectly fine. Name it instead.
    if (/\.create is not a function/.test(detail)) {
      throw new Error(
        'Certificate PDF failed to render: the fontkit package is not installed '
        + 'correctly, so the embedded fonts cannot be parsed. Fix it with '
        + '`npm ci` (or `rm -rf node_modules/fontkit && npm i fontkit`), then '
        + 'delete .next and restart. Underlying error: ' + detail,
      );
    }

    throw new Error(
      'Certificate PDF failed to render. Check that /fonts/*.ttf, '
      + '/certificates/logo-mece-navy.png and any signature image resolve. '
      + 'Underlying error: ' + detail,
    );
  }
}

export async function downloadCertificatePdf(
  cert: CertificatePrintable,
  filename: string,
  opts: { sig1Url?: string | null; sig2Url?: string | null } = {},
): Promise<void> {
  const blob = await buildCertificatePdf(cert, opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
