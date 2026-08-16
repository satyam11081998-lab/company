/**
 * Generate the Founder certificate PDF using the production React-PDF renderer.
 *
 * Usage:  node scripts/generate-founder-pdf.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Certificate data (matches the DB record)
const cert = {
  cert_id: 'MECE-LP-2026-DDQHC4',
  recipient_name: 'Satyam Kumar',
  recipient_program: null,
  cert_title: 'Certificate of Live Project & Foundership',
  role_title: 'Founder & Product Builder',
  project_title: 'mece.in - AI-led case, guesstimate & interview preparation platform for Indian MBA students',
  start_date: '2026-06-15',
  end_date: '2026-08-15',
  duration_label: 'Ongoing',
  engagement_mode: null,
  reporting_to: null,
  scope_line: 'Scope of work: 0-to-1 product development, product strategy, platform execution, and launch.',
  sig1_name: 'mece.in',
  sig1_title: 'Method for Evaluating Corporate Excellence',
  sig2_name: 'mece.in',
  sig2_title: 'Official Credential Issuer',
  issued_at: '2026-08-14T18:52:31Z',
  is_revoked: false,
};

// Read the HTML template
const templatePath = join(__dirname, '..', '..', 'certificates', 'certificate-ivory-classic.html');
let html = readFileSync(templatePath, 'utf-8');

// Generate QR code
const verifyUrl = `https://mece.in/verify/${cert.cert_id}`;
const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
  errorCorrectionLevel: 'M',
  margin: 1,
  scale: 12,
  color: { dark: '#0F1C33', light: '#FFFFFF' },
});

// Format date: "2026-06-15" -> "15 June 2026"
function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00Z');
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

// Read logo as data URI
const logoNavyPath = join(__dirname, '..', '..', 'certificates', 'assets', 'mece-logo-navy.svg');
const logoBytes = readFileSync(logoNavyPath);
const logoDataUri = 'data:image/svg+xml;base64,' + logoBytes.toString('base64');

// Read signature placeholder
const sigPath = join(__dirname, '..', '..', 'certificates', 'assets', 'signature-placeholder.svg');
const sigBytes = readFileSync(sigPath);
const sigDataUri = 'data:image/svg+xml;base64,' + sigBytes.toString('base64');

// Microprint
const mp = `MECE&middot;LIVE PROJECT&middot;${cert.cert_id}&middot;AUTHENTIC&middot;`;

// Build template replacements
const replacements = {
  'CERT_TITLE': cert.cert_title,
  'ORG_NAME': 'MECE',
  'ORG_TAGLINE': 'mece.in &middot; Method for Evaluating Corporate Excellence &middot; AI-led case, guesstimate &amp; interview prep for Indian MBA students',
  'RECIPIENT_NAME': cert.recipient_name,
  'RECIPIENT_PROGRAM': '',
  'ROLE_TITLE': cert.role_title,
  'PROJECT_TITLE': cert.project_title,
  'START_DATE': fmtDate(cert.start_date),
  'END_DATE': 'Present',
  'DURATION': cert.duration_label,
  'ENGAGEMENT_MODE': '',
  'REPORTING_TO': '',
  'SCOPE_LINE': '<b>Scope of work:</b> 0-to-1 product development, product strategy, platform execution, and launch.',
  'CERT_ID': cert.cert_id,
  'ISSUE_DATE': fmtDate('2026-08-10'),
  'VERIFY_URL': verifyUrl,
  'SIG1_NAME': cert.sig1_name,
  'SIG1_TITLE': cert.sig1_title,
  'SIG2_NAME': cert.sig2_name,
  'SIG2_TITLE': cert.sig2_title,
  'LOGO_SRC': logoDataUri,
  'LOGO_SRC_WHITE': logoDataUri,
  'SIG1_SRC': sigDataUri,
  'SIG2_SRC': sigDataUri,
  'QR_SRC': qrDataUrl,
  'MICROPRINT': mp.repeat(12),
};

// Replace all tokens
for (const [key, val] of Object.entries(replacements)) {
  html = html.replaceAll(`{{${key}}}`, val);
}

// Modify the statement text for Founder certificate
html = html.replace(
  /has successfully completed a <b>live, in&#8209;production project<\/b>.*?in the role of/s,
  'Founder of <b>mece.in</b>, conceived, built and launched mece.in as a <b>live, in-production SaaS platform</b>, leading the product from 0-to-1 across product development, strategy and execution, serving as'
);

// Fix the dates line - remove empty engagement mode and reporting to
html = html.replace(
  /from <b>.*?<\/b> to <b>.*?<\/b>.*?Reported to.*?<\/div>/s,
  `from <b>${fmtDate(cert.start_date)}</b> to <b>Present</b> &nbsp;&middot;&nbsp; ${cert.duration_label}</div>`
);

// Replace signing block: remove two sig columns, keep seal + one issuer + digital note
html = html.replace(
  /<div class="sign">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*(?=\s*<div class="qrbox">)/,
  `<div class="sign" style="justify-content:center; gap:16mm;">
    <div class="sealcol">
      <div class="seal"><div class="inner">
        <div class="t1">VERIFIED</div>
        <div class="t2">MECE</div>
        <div class="t3">LIVE PROJECT</div>
      </div></div>
    </div><div class="sigcol" style="vertical-align:bottom;">
      <div class="verify" style="margin-bottom:2mm;">Certificate ID <b>${cert.cert_id}</b><br>Issued ${fmtDate('2026-08-10')}</div>
      <div class="sigline">
        <div class="signame">${cert.sig1_name}</div>
        <div class="sigrole">${cert.sig1_title}</div>
      </div>
      <div style="font-size:5.5pt; color:#5A6B85; margin-top:2mm; text-align:center; line-height:1.5;">
        This is a digitally generated certificate.<br>No signature required.
      </div>
    </div>
  </div>`
);

// Write the filled HTML
const outDir = join(__dirname, '..', '..', 'certificates', 'previews');
const outHtml = join(outDir, `satyam-kumar--founder--${cert.cert_id}.html`);
writeFileSync(outHtml, html, 'utf-8');
console.log(`✅ Wrote HTML: ${outHtml}`);
console.log(`\nTo generate PDF, open this HTML file in your browser and print to PDF (Ctrl+P → Save as PDF, A4 Landscape).`);
console.log(`Or install weasyprint: pip install weasyprint && python -c "from weasyprint import HTML; HTML('${outHtml.replace(/\\/g, '/')}').write_pdf('${outHtml.replace('.html', '.pdf').replace(/\\/g, '/')}')"`);
