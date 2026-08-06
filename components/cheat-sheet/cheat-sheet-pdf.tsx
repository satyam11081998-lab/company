'use client';

/**
 * Cheat Sheet PDF — selectable-text (ATS-clean) PDF via @react-pdf/renderer.
 *
 * Branded for sharing: MECE masthead, a tiled diagonal background watermark on
 * every page, and a footer carrying mece.in plus the public share link when the
 * sheet has been published. The watermark is drawn first and absolutely
 * positioned, so body text always paints on top of it and stays readable.
 */
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';

interface Pt { tag: string; point_text: string; source: string | null }

export interface CheatPdfOptions {
  /** Public share URL, e.g. https://mece.in/s/ab12cd34. Omitted before publish. */
  shareUrl?: string | null;
  /** Owner's first name for the masthead subtitle. */
  ownerName?: string | null;
}

const NAVY = '#0F1C33';
const RED = '#C8102E';
const SITE = 'mece.in';

const s = StyleSheet.create({
  page: {
    paddingTop: 34, paddingBottom: 46, paddingHorizontal: 42,
    fontSize: 10.5, fontFamily: 'Helvetica', color: '#111', lineHeight: 1.4,
  },

  // ── watermark ──────────────────────────────────────────────────────
  watermark: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center',
  },
  markRow: { flexDirection: 'row', justifyContent: 'space-around', width: '150%' },
  markText: {
    fontSize: 30, fontFamily: 'Helvetica-Bold', color: NAVY, opacity: 0.05,
    transform: 'rotate(-32deg)', letterSpacing: 4,
  },

  // ── masthead ───────────────────────────────────────────────────────
  masthead: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    borderBottomWidth: 2, borderBottomColor: NAVY, paddingBottom: 7, marginBottom: 4,
  },
  wordmark: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: NAVY, letterSpacing: 1.5 },
  wordmarkDot: { fontSize: 19, fontFamily: 'Helvetica-Bold', color: RED },
  mastheadRight: { fontSize: 8.5, color: '#666', textAlign: 'right' },
  title: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginTop: 12 },
  subtitle: { fontSize: 9, color: '#777', marginTop: 2, marginBottom: 6 },

  // ── body ───────────────────────────────────────────────────────────
  tag: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY,
    marginTop: 13, marginBottom: 5, textTransform: 'capitalize',
    borderBottomWidth: 0.5, borderBottomColor: '#DDD', paddingBottom: 3,
  },
  point: { marginBottom: 7, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: RED },
  ptText: {},
  source: { fontSize: 8.5, color: '#777', marginTop: 2 },

  // ── footer ─────────────────────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 22, left: 42, right: 42,
    borderTopWidth: 0.5, borderTopColor: '#DDD', paddingTop: 6,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerLeft: { fontSize: 8, color: '#888' },
  footerBrand: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY },
  footerRight: { fontSize: 8, color: '#888' },
});

/** Tiled diagonal wordmark, repeated on every page via `fixed`. */
function Watermark() {
  const rows = [0, 1, 2, 3, 4, 5];
  const cols = [0, 1, 2];
  return (
    <View style={s.watermark} fixed>
      {rows.map((r) => (
        <View key={r} style={s.markRow}>
          {cols.map((c) => (
            <Text key={c} style={s.markText}>MECE</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function CheatDoc({
  groups,
  opts,
}: {
  groups: [string, Pt[]][];
  opts: CheatPdfOptions;
}) {
  const total = groups.reduce((a, [, pts]) => a + pts.length, 0);
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const owner = opts.ownerName?.trim();

  return (
    <Document
      title={owner ? `${owner}'s GD Cheat Sheet — MECE` : 'GD Cheat Sheet — MECE'}
      author="MECE"
      subject="Group discussion data points"
      keywords="GD, group discussion, case interview, MBA placements, MECE"
      creator={SITE}
      producer={SITE}
    >
      <Page size="A4" style={s.page}>
        <Watermark />

        <View style={s.masthead} fixed>
          <Text style={s.wordmark}>
            MECE<Text style={s.wordmarkDot}>.</Text>
          </Text>
          <Text style={s.mastheadRight}>{SITE}</Text>
        </View>

        <Text style={s.title}>GD Cheat Sheet</Text>
        <Text style={s.subtitle}>
          {total} data point{total === 1 ? '' : 's'}
          {owner ? ` · ${owner}` : ''} · {today} · built on {SITE}
        </Text>

        {groups.map(([tag, pts]) => (
          <View key={tag} wrap={false}>
            <Text style={s.tag}>{tag}</Text>
            {pts.map((p, i) => (
              <View key={i} style={s.point}>
                <Text style={s.ptText}>{p.point_text}</Text>
                {p.source ? <Text style={s.source}>from &quot;{p.source}&quot;</Text> : null}
              </View>
            ))}
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            Prep cases, guesstimates and GD on <Text style={s.footerBrand}>{SITE}</Text>
            {opts.shareUrl ? `  ·  ${opts.shareUrl}` : ''}
          </Text>
          <Text
            style={s.footerRight}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

function group(items: Pt[]): [string, Pt[]][] {
  const grouped = new Map<string, Pt[]>();
  for (const it of items) {
    if (!grouped.has(it.tag)) grouped.set(it.tag, []);
    grouped.get(it.tag)!.push(it);
  }
  return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

/** Render the branded, watermarked cheat sheet to a Blob. */
export async function buildCheatSheetPdf(
  items: Pt[],
  opts: CheatPdfOptions = {},
): Promise<Blob> {
  return pdf(<CheatDoc groups={group(items)} opts={opts} />).toBlob();
}

/** Render and save straight to the user's device. */
export async function downloadCheatSheetPdf(
  items: Pt[],
  opts: CheatPdfOptions = {},
): Promise<void> {
  const blob = await buildCheatSheetPdf(items, opts);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mece-gd-cheat-sheet.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
