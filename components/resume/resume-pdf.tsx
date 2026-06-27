'use client';

/**
 * Resume PDF — a real, selectable-text (ATS-safe) PDF built with @react-pdf/renderer.
 * Downloads directly as a .pdf file (no browser print dialog, no print headers/time/URL).
 * Mirrors the on-screen preview layout.
 */
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ResumeData, ExperienceItem } from '@/lib/resume/schema';

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingBottom: 34, paddingHorizontal: 38, fontSize: 9.5, fontFamily: 'Times-Roman', color: '#000', lineHeight: 1.32 },
  name: { fontSize: 17, fontFamily: 'Times-Bold', textAlign: 'center' },
  program: { fontSize: 10, textAlign: 'center', marginTop: 1 },
  contact: { fontSize: 8.5, textAlign: 'center', marginTop: 2 },
  headerRule: { borderBottomWidth: 1.5, borderBottomColor: '#000', marginTop: 5, marginBottom: 2 },
  secTitle: { fontSize: 9.5, fontFamily: 'Times-Bold', textTransform: 'uppercase', letterSpacing: 0.4, borderBottomWidth: 1, borderBottomColor: '#000', paddingBottom: 1.5, marginTop: 9, marginBottom: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  bold: { fontFamily: 'Times-Bold' },
  bullet: { flexDirection: 'row', marginBottom: 1.5, paddingLeft: 2 },
  dot: { width: 8, fontSize: 9.5 },
  bulletText: { flex: 1 },
  eduRow: { flexDirection: 'row', marginBottom: 1 },
  cellDeg: { width: '28%', fontFamily: 'Times-Bold' },
  cellInst: { width: '52%' },
  cellScore: { width: '11%', textAlign: 'right' },
  cellYear: { width: '9%', textAlign: 'right' },
  expWrap: { marginBottom: 4 },
});

function Bullets({ items }: { items: string[] }) {
  const list = items.filter(Boolean);
  if (!list.length) return null;
  return (
    <View>
      {list.map((b, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

function ExpBlock({ it }: { it: ExperienceItem }) {
  return (
    <View style={s.expWrap}>
      <View style={s.row}>
        <Text><Text style={s.bold}>{it.org}</Text>{it.role ? ` — ${it.role}` : ''}</Text>
        <Text>{[it.dates, it.meta].filter(Boolean).join(' · ')}</Text>
      </View>
      <Bullets items={it.bullets} />
    </View>
  );
}

function ResumeDoc({ data }: { data: ResumeData }) {
  const h = data.header;
  const exp = (items: ExperienceItem[]) => items.filter((it) => it.org || it.role || it.bullets.some(Boolean));
  const edu = data.education.filter((e) => e.degree || e.institute);
  return (
    <Document title={h.name ? `${h.name} — Resume` : 'Resume'}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{h.name || 'Your Name'}</Text>
        {!!h.program && <Text style={s.program}>{h.program}</Text>}
        <Text style={s.contact}>{[h.email, h.phone, h.linkedin, h.extra].filter(Boolean).join('   |   ')}</Text>
        <View style={s.headerRule} />

        {edu.length > 0 && (
          <View>
            <Text style={s.secTitle}>Academic Qualifications</Text>
            {edu.map((e, i) => (
              <View key={i} style={s.eduRow}>
                <Text style={s.cellDeg}>{e.degree}</Text>
                <Text style={s.cellInst}>{e.institute}{e.board ? `, ${e.board}` : ''}</Text>
                <Text style={s.cellScore}>{e.score}</Text>
                <Text style={s.cellYear}>{e.year}</Text>
              </View>
            ))}
            {data.academicAchievements.some(Boolean) && <View style={{ marginTop: 2 }}><Bullets items={data.academicAchievements} /></View>}
          </View>
        )}

        {exp(data.workExperience).length > 0 && (
          <View><Text style={s.secTitle}>Work Experience</Text>{exp(data.workExperience).map((it, i) => <ExpBlock key={i} it={it} />)}</View>
        )}
        {exp(data.internships).length > 0 && (
          <View><Text style={s.secTitle}>Internships</Text>{exp(data.internships).map((it, i) => <ExpBlock key={i} it={it} />)}</View>
        )}
        {exp(data.projects).length > 0 && (
          <View><Text style={s.secTitle}>Projects</Text>{exp(data.projects).map((it, i) => <ExpBlock key={i} it={it} />)}</View>
        )}

        {data.positionsOfResponsibility.some((p) => p.org || p.role) && (
          <View>
            <Text style={s.secTitle}>Positions of Responsibility</Text>
            {data.positionsOfResponsibility.filter((p) => p.org || p.role).map((p, i) => (
              <View key={i} style={{ marginBottom: 2 }}>
                <View style={s.row}>
                  <Text><Text style={s.bold}>{p.role}</Text>{p.org ? `, ${p.org}` : ''}</Text>
                  <Text>{p.year}</Text>
                </View>
                <Bullets items={p.bullets} />
              </View>
            ))}
          </View>
        )}

        {data.awards.some(Boolean) && (
          <View><Text style={s.secTitle}>Awards & Recognition</Text><Bullets items={data.awards} /></View>
        )}

        {data.certifications.some((c) => c.title) && (
          <View>
            <Text style={s.secTitle}>Certifications</Text>
            {data.certifications.filter((c) => c.title).map((c, i) => (
              <View key={i} style={s.row}>
                <Text style={{ width: '78%' }}><Text style={s.bold}>{c.provider}</Text>{c.provider ? ' — ' : ''}{c.title}</Text>
                <Text style={{ width: '22%', textAlign: 'right' }}>{c.year}</Text>
              </View>
            ))}
          </View>
        )}

        {data.extracurricular.some((g) => g.bullets.some(Boolean)) && (
          <View>
            <Text style={s.secTitle}>Extracurricular Activities</Text>
            {data.extracurricular.filter((g) => g.bullets.some(Boolean)).map((g, i) => (
              <Text key={i} style={{ marginBottom: 1.5 }}>
                {g.category ? <Text style={s.bold}>{g.category}: </Text> : null}
                {g.bullets.filter(Boolean).join('; ')}
              </Text>
            ))}
          </View>
        )}

        {(data.additionalInfo.examScores.some(Boolean) || data.additionalInfo.skills.length > 0 || data.additionalInfo.hobbies.length > 0) && (
          <View>
            <Text style={s.secTitle}>Additional Information</Text>
            {data.additionalInfo.examScores.some(Boolean) && <Bullets items={data.additionalInfo.examScores} />}
            {data.additionalInfo.skills.length > 0 && <Text><Text style={s.bold}>Skills: </Text>{data.additionalInfo.skills.join(', ')}</Text>}
            {data.additionalInfo.hobbies.length > 0 && <Text><Text style={s.bold}>Hobbies: </Text>{data.additionalInfo.hobbies.join(', ')}</Text>}
          </View>
        )}
      </Page>
    </Document>
  );
}

/** Build the PDF and trigger a direct download (no print dialog). */
export async function downloadResumePdf(data: ResumeData, fileBase: string) {
  const blob = await pdf(<ResumeDoc data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(fileBase || 'resume').replace(/[^\w.-]+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
