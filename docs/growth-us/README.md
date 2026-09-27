# US & Europe growth: strategy summary (2026-09-27)

The full strategy lives in the owner's doc **"MECE US & Europe Growth Strategy"**
(claude.ai artifact 8bbabbce-764b-4690-9b99-88019b190409, private to the owner). This file is the short
version for brains that can only read the repo. The brief every session follows is
[`MASTER_PROMPT.md`](./MASTER_PROMPT.md).

## The five bets, in order of leverage
1. **Domain decision.** mece.in is a ccTLD. Google calls a ccTLD "a strong signal" that a site targets that
   country, and .in is not on its list of generic ccTLDs
   ([Google](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)).
   The recommendation is a generic domain for US and Europe, joined to mece.in with hreflang, decided before
   the off-site push. This is the owner's decision.
2. **Own the questions.** The US Learn library at `/us/learn` shipped with 22 guides (handoff
   `us-growth-seo`). Cadence is two guides a week, chosen from Search Console queries and Bing grounding
   queries.
3. **Be where AI engines look.** Get into the "best case interview prep" roundups, answer honestly on Reddit
   (affiliation disclosed), publish on YouTube, and make the brand checkable (LinkedIn is live; add YouTube,
   X, Crunchbase, Product Hunt, then Wikidata once there is independent coverage to cite).
4. **Feed Bing.** ChatGPT search partners with Microsoft among others
   ([OpenAI](https://help.openai.com/en/articles/9237897-chatgpt-search)), and Bing Webmaster Tools reports
   Copilot citations ([Bing, Feb 2026](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)).
   Verify Bing and run `scripts/indexnow-submit.mjs` after every deploy.
5. **Beyond consulting.** Role guides for PM, sales, marketing, HR, S&O and finance are the wedge against
   consulting-only competitors.

## Rules that apply to every page
- Answer first (40–60 words), question-shaped H2s, a checked worked example, visible FAQ, and a practice link.
- Real numbers come only from `lib/us-learn/us-data.ts`, with a source and a date. Examples are fictional
  and labelled as such.
- No firm logos and no implied endorsement. No India pricing or India-only links on US pages.
- Google's spam policies name "scaled content abuse" and doorway pages. Publish fewer, better pages.

## Measurement
The north star is weekly active US/EU practicers. The leading indicators are Learn URLs indexed (Google and
Bing), US non-brand clicks (Search Console, country = US), Bing AI citations, a monthly 40-prompt panel
across ChatGPT, Perplexity, Copilot, Gemini and Claude, and AI referrals (the page tracker already stores
`document.referrer`).
