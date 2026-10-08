/**
 * CSV import/export. Pure.
 *
 * Export guards against CSV/formula injection: a cell that starts with
 * = + - @ TAB or CR is prefixed with an apostrophe, so a record named
 * `=HYPERLINK("http://evil",…)` opens in Excel/Sheets as text, not a formula.
 */

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 5000;

export function parseCsv(text: string, maxRows = MAX_IMPORT_ROWS): { header: string[]; rows: string[][] } {
  if (text.length > MAX_IMPORT_BYTES) throw new Error('File is larger than 5 MB.');
  let s = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // BOM
  // Sniff the delimiter from the first line: comma, semicolon or tab.
  const firstLine = s.slice(0, s.indexOf('\n') === -1 ? s.length : s.indexOf('\n'));
  const counts = [',', ';', '\t'].map((d) => [d, firstLine.split(d).length - 1] as const);
  const delim = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;
  const pushCell = () => { row.push(cell); cell = ''; };
  const pushRow = () => {
    pushCell();
    if (!(row.length === 1 && row[0] === '')) rows.push(row);
    row = [];
    if (rows.length > maxRows + 1) throw new Error(`File has more than ${maxRows} rows.`);
  };
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cell += c; i++; continue;
    }
    if (c === '"' && cell === '') { inQuotes = true; i++; continue; }
    if (c === delim) { pushCell(); i++; continue; }
    if (c === '\r') { i++; continue; }
    if (c === '\n') { pushRow(); i++; continue; }
    cell += c; i++;
  }
  if (inQuotes) throw new Error('The file has an unclosed quote.');
  if (cell !== '' || row.length) pushRow();
  s = '';
  if (!rows.length) throw new Error('The file is empty.');
  const header = rows[0].map((h) => h.trim()).map((h, idx) => h || `Column ${idx + 1}`);
  if (header.length > 200) throw new Error('Too many columns.');
  return { header, rows: rows.slice(1) };
}

export function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : Array.isArray(v) ? v.join('; ') : typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export function toCsv(header: string[], rows: unknown[][]): string {
  const lines = [header.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n';
}

/** Best-effort automatic column → field mapping by label or api name. */
export function autoMap(header: string[], fields: Array<{ api_name: string; label: string }>): Record<number, string> {
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9]/g, '');
  const out: Record<number, string> = {};
  header.forEach((h, idx) => {
    const n = norm(h);
    const hit = fields.find((f) => norm(f.api_name) === n || norm(f.label) === n);
    if (hit) out[idx] = hit.api_name;
  });
  return out;
}
