import type { SeoPage } from '@/lib/seo-pages';

/**
 * Insights topic taxonomy — colours, inference and slugs.
 *
 * Lifted out of components/insights/parts.tsx so that server routes which need
 * only the label (app/sitemap.ts, the topic hubs) can import it without pulling
 * in Link, ThemeToggle and the rest of the reading-experience component tree.
 * parts.tsx re-exports TOPIC_COLORS and topicOf, so every existing
 * `from '@/components/insights/parts'` import keeps working unchanged.
 */

/** Topic colours (an essay-magazine palette: one strong colour per subject). */
export const TOPIC_COLORS: Record<string, string> = {
  Strategy: '#0C776D',
  Marketing: '#B5651D',
  Finance: '#035A6D',
  Operations: '#5B4B8A',
  Technology: '#940B52',
  Economy: '#9D120D',
  Careers: '#2F6B3A',
  Business: '#4A4A4A',
};

/** For posts written before topic labels existed: the subject from the title and keywords. */
const TOPIC_WORDS: [string, RegExp][] = [
  ['Finance', /\b(upi|banks?|banking|rbi|loans?|credit|fintech|mutual funds?|stocks?|shares|ipos?|investors?|investment|insurance|nbfcs?|sebi|mdr|payments?|wealth|markets?)\b/gi],
  ['Economy', /\b(gdp|inflation|econom\w*|oil|crude|pipelines?|exports?|imports?|tariffs?|rupee|fiscal|budget|repo|monsoon|saudi|opec)\b/gi],
  ['Technology', /\b(ai|artificial intelligence|tech\w*|software|saas|semiconductors?|chips?|data cent(?:er|re)s?|cloud|ott|digital)\b/gi],
  ['Marketing', /\b(brands?|fmcg|consumers?|retail|advertis\w*|marketing|d2c|premium|rural)\b/gi],
  ['Operations', /\b(supply chains?|logistics|manufactur\w*|plants?|factor(?:y|ies)|airlines?|railways?|evs?|quick commerce|delivery|warehouses?|ports?)\b/gi],
  ['Careers', /\b(jobs?|hiring|campus|placements?|salar\w*|gccs?|talent|layoffs?)\b/gi],
  ['Strategy', /\b(mergers?|acquisitions?|strateg\w*|conglomerates?|group|competition|market share|ownership|tata|reliance|adani)\b/gi],
];

type TopicInput = Pick<SeoPage, 'title'> & { keywords?: string[] | null; topic?: string | null };

function inferTopic(page: TopicInput): string {
  const text = [page.title, page.topic, ...(page.keywords || [])].filter(Boolean).join(' ');
  let best = 'Business', most = 0;
  for (const [label, re] of TOPIC_WORDS) {
    // The regexes are /g, so lastIndex would carry between calls if they were reused
    // mid-match; String.match with /g always starts fresh, so this stays safe.
    const n = (text.match(re) || []).length;
    if (n > most) { best = label; most = n; }
  }
  return best;
}

export function topicOf(
  page: Pick<SeoPage, 'content' | 'kind' | 'title'> & { keywords?: string[] | null; topic?: string | null },
): { label: string; color: string } {
  const label = page.content?.topic_label || inferTopic(page);
  return { label, color: TOPIC_COLORS[label] || TOPIC_COLORS.Business };
}

/** URL segment for a topic hub: /insights/topic/finance */
export const topicSlug = (label: string) => label.toLowerCase();

/** The canonical label for a hub slug, or undefined if it is not a topic we publish. */
export const topicFromSlug = (slug: string) =>
  Object.keys(TOPIC_COLORS).find((l) => topicSlug(l) === (slug || '').toLowerCase());
