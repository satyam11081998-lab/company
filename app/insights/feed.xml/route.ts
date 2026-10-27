import { getPublishedSeoPages } from '@/lib/seo-pages';
import { SITE_URL } from '@/lib/seo';

/**
 * RSS 2.0 for MECE Insights — /insights/feed.xml
 *
 * A daily publication with no feed cannot be picked up by Feedly, Inoreader, a
 * newsletter automation, or the dozens of MBA-prep aggregators that run on RSS.
 * It is the cheapest distribution channel there is and it was simply missing.
 *
 * Revalidated every 15 minutes: a post published from Telegram should reach
 * subscribers the same morning, and the index itself already revalidates at 300s.
 */
export const revalidate = 900;
export const dynamic = 'force-static';

const TITLE = 'MECE Insights';
const DESC =
  'One business story a day, explained with sourced facts and figures, and turned into GD, WAT, interview and case practice for MBA students and aspirants.';

/** XML text escaping. Titles carry ₹, &, apostrophes and the occasional angle bracket. */
function esc(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rfc822(iso: string | null | undefined): string {
  const d = iso ? new Date(iso) : new Date();
  return (Number.isNaN(d.getTime()) ? new Date() : d).toUTCString();
}

export async function GET() {
  const pages = await getPublishedSeoPages(50);
  const built = rfc822(pages[0]?.published_at ?? pages[0]?.updated_at ?? null);

  const items = pages
    .map((p) => {
      const url = `${SITE_URL}/insights/${p.slug}`;
      const hero = p.content?.hero;
      // media:content rather than <enclosure>: enclosure requires a byte length we
      // do not store, and an inaccurate length is worse than no enclosure.
      const media = hero?.url
        ? `\n      <media:content url="${esc(hero.og_url || hero.url)}" medium="image"${
            hero.alt ? `>\n        <media:description type="plain">${esc(hero.alt)}</media:description>\n      </media:content>` : ' />'
          }`
        : '';
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(url)}</link>
      <guid isPermaLink="true">${esc(url)}</guid>
      <pubDate>${rfc822(p.published_at ?? p.created_at)}</pubDate>
      <description>${esc(p.meta_description || p.dek || '')}</description>${
        (p.keywords || []).slice(0, 5).map((k) => `\n      <category>${esc(k)}</category>`).join('')
      }${media}
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE_URL}/insights</link>
    <description>${esc(DESC)}</description>
    <language>en-in</language>
    <lastBuildDate>${built}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${SITE_URL}/insights/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
