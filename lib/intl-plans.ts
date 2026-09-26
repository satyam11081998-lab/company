/**
 * International (US + Europe) plan copy — ONE list, read by the public
 * /us/pricing page, the in-app /upgrade page and the US landing page, so the
 * three can never advertise different things.
 *
 * Rules for this file:
 *  - Only list what an international account can actually reach. The
 *    India-only surfaces (GD briefs, casebook, primers, CV lab, deck vault,
 *    cheat sheet, copilot) are refused to international accounts by the
 *    middleware, so they must never appear here.
 *  - The clarifying-question numbers are contract C9 (free 7 · lite 12 ·
 *    pro 20) — they must match routes/attempts.py CLARIFICATION_QUOTA and
 *    lib/tier.ts TIER_LIMITS.maxHintQuestions.
 *  - Tier access rules are the same as India (lib/access.ts, access_guard.py).
 */
// C9 numbers are written out (not imported from lib/tier) so this copy never
// drags the rupee price table into the international bundle. scripts/
// test-intl.mjs asserts they equal TIER_LIMITS.<tier>.maxHintQuestions — a
// drift fails the gate, which is the C9 rule ("change one, change all").
export const INTL_CLARIFICATIONS = { free: 7, lite: 12, pro: 20 } as const;

export interface PlanLine { text: string; muted?: boolean; cross?: boolean }

export const INTL_PLAN_COPY: Record<'free' | 'lite' | 'pro', { tagline: string; lines: PlanLine[] }> = {
  free: {
    tagline: 'Build a daily case habit at no cost.',
    lines: [
      { text: "Today's daily case & market sizing question" },
      { text: '+1 bank case & +1 market sizing question (one-time)' },
      { text: `AI interviewer — ${INTL_CLARIFICATIONS.free} clarifying questions per case` },
      { text: 'Scored feedback on 6 dimensions + a worked solution' },
      { text: 'Every conversation kept and re-readable' },
      { text: 'Leaderboard & streaks' },
      { text: 'No re-attempts', muted: true, cross: true },
    ],
  },
  lite: {
    tagline: 'Practice beyond the daily pair.',
    lines: [
      { text: '2 extra cases & 2 extra market sizing questions every day' },
      { text: 'Unlimited re-attempts' },
      { text: `${INTL_CLARIFICATIONS.lite} clarifying questions per case` },
      { text: 'Full attempt history & transcripts' },
      { text: 'No worked case figures', muted: true, cross: true },
    ],
  },
  pro: {
    tagline: 'Unlimited practice for recruiting season.',
    lines: [
      { text: 'Unlimited access to the full US case bank — cases & market sizing, new ones daily' },
      { text: `${INTL_CLARIFICATIONS.pro} clarifying questions per case` },
      { text: 'Worked case figures on every result — profit bridge, driver tree, 2x2' },
      { text: 'Unlimited re-attempts' },
    ],
  },
};

/** FAQ shared by /us/pricing and the US landing — also emitted as FAQPage JSON-LD. */
export const INTL_PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: 'How much does MECE cost?',
    a: 'MECE is free to start: every day you get one case interview and one market sizing question with full scored feedback. Lite is $29 a month and Pro is $49 a month. A 3-month plan costs $69 for Lite and $119 for Pro, about 20% less than paying monthly. In Europe the same plans are €29, €49, €69 and €119.',
  },
  {
    q: 'Is there a free trial?',
    a: 'There is a free plan rather than a trial. It never expires and needs no credit card: the daily case, the daily market sizing question, one extra case and one extra market sizing question from the bank, and full scored feedback on every attempt.',
  },
  {
    q: 'Do plans renew automatically?',
    a: 'No. Each purchase is a one-time payment for 1 month or 3 months of access. Nothing renews or charges you again unless you buy again.',
  },
  {
    q: 'What is the difference between Lite and Pro?',
    a: 'Lite adds 2 extra cases and 2 extra market sizing questions every day, unlimited re-attempts and 12 clarifying questions per case. Pro removes the daily limit on the whole US case bank, raises clarifying questions to 20 per case and adds worked case figures, such as profit bridges and driver trees, to every result.',
  },
  {
    q: 'Which case interviews does MECE prepare me for?',
    a: 'Interviewer-led and candidate-led case interviews at McKinsey, BCG, Bain and other consulting firms, plus case rounds for finance, corporate strategy and product roles. Cases cover profitability, market entry, M&A, pricing, growth, operations and market sizing, set in US markets and priced in US dollars.',
  },
  {
    q: 'How is my case interview scored?',
    a: 'An AI interviewer runs the case with you, answers your clarifying questions and pushes back on your structure. When you finish, it scores you out of 100 across structure, quantitative skills, synthesis, business judgment, creativity and communication, then shows a worked solution and three ways a strong candidate would have approached it.',
  },
  {
    q: 'Which payment methods can I use?',
    a: 'All major credit and debit cards through Razorpay. Prices are charged in US dollars in the United States and in euros in Europe.',
  },
];
