'use client';

/**
 * Cheat Sheet PDF — direct, selectable-text (ATS/clean) PDF via @react-pdf/renderer.
 * Downloads as a file directly (no browser print dialog / headers / time / URL).
 */
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';

interface Pt { tag: string; point_text: string; source: string | null }

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 36, paddingHorizontal: 42, fontSize: 10.5, fontFamily: 'Helvetica', color: '#111', lineHeight: 1.4 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 12, borderBottomWidth: 1.5, borderBottomColor: '#999', paddingBottom: 6 },
  tag: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#333', marginTop: 14, marginBottom: 5, textTransform: 'capitalize' },
  point: { marginBottom: 7, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#ccc' },
  ptText: { },
  source: { fontSize: 8.5, color: '#777', marginTop: 2 },
});

function CheatDoc({ groups }: { groups: [string, Pt[]][] }) {
  return (
    <Document title="My Cheat Sheet">
      <Page size="A4" style={s.page}>
        <Text style={s.title}>My Cheat Sheet</Text>
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
      </Page>
    </Document>
  );
}

export async function downloadCheatSheetPdf(items: Pt[]) {
  const grouped = new Map<string, Pt[]>();
  for (const it of items) {
    if (!grouped.has(it.tag)) grouped.set(it.tag, []);
    grouped.get(it.tag)!.push(it);
  }
  const groups = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const blob = await pdf(<CheatDoc groups={groups} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cheat-sheet.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
