import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Auth-gated app surfaces — crawling them only burns crawl budget on
// login redirects.
const GATED = [
  '/api/',
  '/admin',
  '/dashboard',
  '/onboarding',
  '/practice',
  '/results/',
  '/profile',
  '/upgrade',
  '/leaderboard',
  '/gd-briefs',
  '/cases',
  '/cheat-sheet',
  '/home',
  '/auth/',
];

/**
 * AI/answer-engine crawlers are explicitly welcomed: visibility in
 * ChatGPT, Claude, Perplexity, Gemini et al. is a distribution channel.
 * They get the same rules as everyone else (public content only).
 */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'CCBot',
  'cohere-ai',
  'meta-externalagent',
  'Bytespider',
  'DuckAssistBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: GATED },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: GATED,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
