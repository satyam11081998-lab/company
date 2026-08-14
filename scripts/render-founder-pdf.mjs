/**
 * Render the founder certificate HTML to PDF using Puppeteer.
 * Usage: node scripts/render-founder-pdf.mjs
 */
import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, '..', '..', 'certificates', 'previews', 'satyam-kumar--founder--MECE-LP-2026-DDQHC4.html');
const pdfPath = join(__dirname, '..', '..', 'certificates', 'previews', 'satyam-kumar--founder--MECE-LP-2026-DDQHC4.pdf');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

const html = readFileSync(htmlPath, 'utf-8');
await page.setContent(html, { waitUntil: 'networkidle0' });

await page.pdf({
  path: pdfPath,
  width: '297mm',
  height: '210mm',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();
console.log(`✅ PDF saved: ${pdfPath}`);
