import fs from 'fs';
import path from 'path';

function loadFont(filename: string): Buffer {
  const fullPath = path.join(process.cwd(), 'public', 'fonts', filename);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `[OG Font Error] Required font file not found: ${fullPath}. ` +
      `Ensure font files are committed in public/fonts/ and not fetched dynamically.`
    );
  }
  return fs.readFileSync(fullPath);
}

// Module-scope read: loaded synchronously once at module initialization.
// If either file is missing at build time, it throws immediately naming the file.
const interRegular = loadFont('Inter-Regular.ttf');
const interBold = loadFont('Inter-Bold.ttf');

export const OG_FONTS = [
  {
    name: 'Inter',
    data: interRegular,
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: interBold,
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: interBold,
    weight: 800 as const,
    style: 'normal' as const,
  },
  {
    name: 'sans-serif',
    data: interRegular,
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'sans-serif',
    data: interBold,
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'sans-serif',
    data: interBold,
    weight: 800 as const,
    style: 'normal' as const,
  },
];
