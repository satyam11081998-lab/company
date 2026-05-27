import { ALL_DOMAINS } from '../lib/curriculum/index';
import * as fs from 'fs';

const extracted: any[] = [];
let count = 0;

function mapType(slug: string, title: string): string {
    const s = slug.toLowerCase();
    const t = title.toLowerCase();
    if (s.includes('profitability') || t.includes('profitability')) return 'profitability';
    if (s.includes('guesstimate') || t.includes('market-sizing') || t.includes('market sizing')) return 'market_sizing';
    if (s.includes('growth') || s.includes('market-entry') || t.includes('growth') || t.includes('entry')) return 'growth';
    if (t.includes('guesstimate')) return 'guesstimate';
    return 'profitability'; // fallback
}

for (const domain of ALL_DOMAINS) {
    if (domain.cases) {
        for (const c of domain.cases) {
            count++;
            if (count > 100) continue; // Just limit logic in script
            extracted.push({
                domain: domain.slug,
                title: c.title,
                currType: 'case',
                dbType: mapType(domain.slug, c.title),
                difficulty: 'medium', // Default to medium since curriculum cases don't have explicit difficulty
                content: `Problem: ${c.problem || ''}\nRoot Cause: ${c.rootCause || ''}\nKey Insight: ${c.keyInsight || ''}`,
                hint: c.framework || null
            });
        }
    }
    
    // Guesstimates might be considered cases too
    if (domain.guesstimates) {
        for (const g of domain.guesstimates) {
            count++;
            if (count > 100) continue;
            extracted.push({
                domain: domain.slug,
                title: g.title,
                currType: 'guesstimate',
                dbType: 'guesstimate', // 'guesstimate' is one of the valid db types according to user: ('guesstimate', 'profitability', 'market_sizing', 'growth')
                difficulty: 'easy',
                content: `Approach: ${g.approach || ''}\nKey Detail: ${g.keyDetail || ''}\nResult: ${g.result || ''}`,
                hint: null
            });
        }
    }
}

// Generate Markdown table
let md = `## Curriculum Cases Found (${count} total)\n\n`;
md += `| Domain | Case Title | Curriculum Type | DB Type | Difficulty |\n`;
md += `|---|---|---|---|---|\n`;
for (let i = 0; i < Math.min(extracted.length, 100); i++) {
    const c = extracted[i];
    md += `| ${c.domain} | "${c.title.replace(/"/g, '""')}" | ${c.currType} | ${c.dbType} | ${c.difficulty} |\n`;
}

if (count > 100) {
    md += `\n*(Found ${count} cases. Outputting first 100 below. The rest will be in a follow-up.)*\n`;
}

// Generate SQL
let sql = `-- ============================================================
-- MECE Phase 3A — Migrate curriculum cases into public.cases
-- Idempotent: ON CONFLICT DO NOTHING skips dupes.
-- ============================================================

INSERT INTO public.cases (title, type, difficulty, content, hint, is_active)
VALUES
`;

for (let i = 50; i < extracted.length; i++) { // Extract the rest
    const c = extracted[i];
    const escape = (s: string | null) => s ? "'" + s.replace(/'/g, "''") + "'" : 'NULL';
    
    sql += `  (${escape(c.title)}, '${c.dbType}', '${c.difficulty}', ${escape(c.content)}, ${escape(c.hint)}, true)${i === extracted.length - 1 ? '' : ','}\n`;
}
sql += `) AS v(title, type, difficulty, content, hint, is_active)\n`;
sql += `WHERE NOT EXISTS (\n  SELECT 1 FROM public.cases c WHERE c.title = v.title\n);\n\n`;
sql += `-- Verify\nSELECT type, count(*) FROM public.cases GROUP BY type ORDER BY type;\n`;

fs.writeFileSync('scratch/output.txt', md + '\n\n\n' + sql);
console.log('Done, wrote to scratch/output.txt');
