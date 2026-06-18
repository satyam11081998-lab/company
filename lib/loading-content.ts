/**
 * Curated, accurate content shown during loading states (the EngagingLoader).
 * Quotes are attributed to widely-documented sources; disputed attributions are
 * marked "attributed to". Facts are timeless (no live-news dependency).
 *
 * Safe to extend — just append. `pickRotation()` gives a daily-seeded order so
 * the set feels fresh without any backend.
 */

export interface LoadingItem {
  type: 'quote' | 'fact';
  text: string;
  /** Quotes: the person. Facts: a short kicker like "Business fact". */
  by?: string;
}

export const LOADING_ITEMS: LoadingItem[] = [
  // ── Strategy ────────────────────────────────────────────────
  { type: 'quote', text: 'The essence of strategy is choosing what not to do.', by: 'Michael Porter' },
  { type: 'quote', text: 'Strategy is about making choices, trade-offs; it’s about deliberately choosing to be different.', by: 'Michael Porter' },
  { type: 'quote', text: 'Analysis is the critical starting point of strategic thinking.', by: 'Kenichi Ohmae' },
  { type: 'quote', text: 'Rowing harder doesn’t help if the boat is headed in the wrong direction.', by: 'Kenichi Ohmae' },
  { type: 'quote', text: 'Only the paranoid survive.', by: 'Andy Grove' },
  { type: 'quote', text: 'Change before you have to.', by: 'Jack Welch' },
  { type: 'quote', text: 'If you don’t have a competitive advantage, don’t compete.', by: 'Jack Welch' },
  { type: 'quote', text: 'Competition is for losers.', by: 'Peter Thiel' },
  { type: 'quote', text: 'Good is the enemy of great.', by: 'Jim Collins' },
  { type: 'quote', text: 'Great vision without great people is irrelevant.', by: 'Jim Collins' },
  { type: 'quote', text: 'Culture eats strategy for breakfast.', by: 'attributed to Peter Drucker' },
  { type: 'quote', text: 'Plans are only good intentions unless they immediately degenerate into hard work.', by: 'Peter Drucker' },
  { type: 'quote', text: 'There is nothing so useless as doing efficiently that which should not be done at all.', by: 'Peter Drucker' },
  { type: 'quote', text: 'Efficiency is doing things right; effectiveness is doing the right things.', by: 'Peter Drucker' },

  // ── Customers & marketing ───────────────────────────────────
  { type: 'quote', text: 'The purpose of business is to create and keep a customer.', by: 'Peter Drucker' },
  { type: 'quote', text: 'The aim of marketing is to know the customer so well the product fits him and sells itself.', by: 'Peter Drucker' },
  { type: 'quote', text: 'People don’t want a quarter-inch drill. They want a quarter-inch hole.', by: 'Theodore Levitt' },
  { type: 'quote', text: 'The consumer isn’t a moron; she is your wife.', by: 'David Ogilvy' },
  { type: 'quote', text: 'If it doesn’t sell, it isn’t creative.', by: 'David Ogilvy' },
  { type: 'quote', text: 'Marketing is no longer about the stuff you make but the stories you tell.', by: 'Seth Godin' },
  { type: 'quote', text: 'Customers don’t buy products; they hire them to do a job.', by: 'Clayton Christensen' },
  { type: 'quote', text: 'Your most unhappy customers are your greatest source of learning.', by: 'Bill Gates' },
  { type: 'quote', text: 'Get closer than ever to your customers — so close you tell them what they need before they realise it.', by: 'Steve Jobs' },
  { type: 'quote', text: 'A satisfied customer is the best business strategy of all.', by: 'Michael LeBoeuf' },
  { type: 'quote', text: 'Good companies meet needs; great companies create markets.', by: 'Philip Kotler' },

  // ── Finance & judgement ─────────────────────────────────────
  { type: 'quote', text: 'Price is what you pay. Value is what you get.', by: 'Warren Buffett' },
  { type: 'quote', text: 'Risk comes from not knowing what you’re doing.', by: 'Warren Buffett' },
  { type: 'quote', text: 'It takes 20 years to build a reputation and five minutes to ruin it.', by: 'Warren Buffett' },
  { type: 'quote', text: 'Only when the tide goes out do you discover who’s been swimming naked.', by: 'Warren Buffett' },
  { type: 'quote', text: 'Rule No. 1: never lose money. Rule No. 2: never forget rule No. 1.', by: 'Warren Buffett' },
  { type: 'quote', text: 'In God we trust; all others must bring data.', by: 'W. Edwards Deming' },
  { type: 'quote', text: 'Without data, you’re just another person with an opinion.', by: 'W. Edwards Deming' },
  { type: 'quote', text: 'Your margin is my opportunity.', by: 'Jeff Bezos' },
  { type: 'quote', text: 'If you double the number of experiments you do per year, you’re going to double your inventiveness.', by: 'Jeff Bezos' },

  // ── Innovation & execution ──────────────────────────────────
  { type: 'quote', text: 'Innovation distinguishes between a leader and a follower.', by: 'Steve Jobs' },
  { type: 'quote', text: 'If you’re not embarrassed by the first version of your product, you’ve launched too late.', by: 'Reid Hoffman' },
  { type: 'quote', text: 'Ideas are easy. Execution is everything.', by: 'John Doerr' },
  { type: 'quote', text: 'Vision without execution is hallucination.', by: 'attributed to Thomas Edison' },
  { type: 'quote', text: 'Done is better than perfect.', by: 'Sheryl Sandberg' },
  { type: 'quote', text: 'It’s easier to hold to your principles 100% of the time than 98% of the time.', by: 'Clayton Christensen' },
  { type: 'quote', text: 'If I had asked people what they wanted, they would have said faster horses.', by: 'attributed to Henry Ford' },
  { type: 'quote', text: 'Whether you think you can or you think you can’t, you’re right.', by: 'Henry Ford' },
  { type: 'quote', text: 'Quality is not an act, it is a habit.', by: 'Aristotle' },

  // ── People & leadership ─────────────────────────────────────
  { type: 'quote', text: 'Train people well enough so they can leave; treat them well enough so they don’t want to.', by: 'Richard Branson' },
  { type: 'quote', text: 'Business opportunities are like buses — there’s always another one coming.', by: 'Richard Branson' },
  { type: 'quote', text: 'Coming together is a beginning, staying together is progress, working together is success.', by: 'Henry Ford' },
  { type: 'quote', text: 'An organisation’s ability to learn, and translate that learning into action, is the ultimate competitive advantage.', by: 'Jack Welch' },
  { type: 'quote', text: 'First who, then what — get the right people on the bus before deciding where to drive it.', by: 'Jim Collins' },
  { type: 'quote', text: 'Management is doing things right; leadership is doing the right things.', by: 'attributed to Peter Drucker' },
  { type: 'quote', text: 'If you want to go fast, go alone. If you want to go far, go together.', by: 'African proverb' },

  // ── Money proverbs ──────────────────────────────────────────
  { type: 'quote', text: 'Revenue is vanity, profit is sanity, but cash is king.', by: 'Business proverb' },
  { type: 'quote', text: 'Turnover is vanity, profit is sanity.', by: 'Business proverb' },
  { type: 'quote', text: 'What gets measured gets managed.', by: 'attributed to Peter Drucker' },

  // ── Business facts ──────────────────────────────────────────
  { type: 'fact', text: 'Porter’s Five Forces was introduced by Michael Porter in a 1979 Harvard Business Review article.', by: 'Business fact' },
  { type: 'fact', text: 'The BCG Growth–Share Matrix (stars, cash cows, dogs, question marks) was created by Bruce Henderson in 1970.', by: 'Business fact' },
  { type: 'fact', text: 'The 4 Ps of marketing — Product, Price, Place, Promotion — were popularised by E. Jerome McCarthy in 1960.', by: 'Business fact' },
  { type: 'fact', text: 'The 80/20 rule is named after economist Vilfredo Pareto, who noted ~80% of Italy’s land was owned by ~20% of people.', by: 'Business fact' },
  { type: 'fact', text: 'The Rule of 72: divide 72 by the annual return to estimate the years it takes money to double.', by: 'Did you know' },
  { type: 'fact', text: 'A basis point is one-hundredth of a percent (0.01%) — bankers use it to avoid ambiguity about “percent of a percent”.', by: 'Did you know' },
  { type: 'fact', text: 'EBITDA stands for Earnings Before Interest, Taxes, Depreciation, and Amortisation.', by: 'Business fact' },
  { type: 'fact', text: 'CAGR (Compound Annual Growth Rate) smooths multi-year growth into a single annual rate.', by: 'Did you know' },
  { type: 'fact', text: 'Working capital = current assets − current liabilities; it measures short-term liquidity.', by: 'Did you know' },
  { type: 'fact', text: 'Gross margin = (revenue − cost of goods sold) ÷ revenue.', by: 'Did you know' },
  { type: 'fact', text: 'The Minto Pyramid Principle — start with the answer first — is the backbone of consulting communication.', by: 'Business fact' },
  { type: 'fact', text: '“Boiling the ocean” is consulting slang for trying to analyse everything instead of prioritising.', by: 'Consulting slang' },
  { type: 'fact', text: 'A hypothesis-driven approach means leading with an answer and testing it — not analysing everything first.', by: 'Did you know' },
  { type: 'fact', text: 'A “unicorn” is a private startup valued over $1 billion — a term coined by investor Aileen Lee in 2013.', by: 'Business fact' },
  { type: 'fact', text: 'Net Promoter Score (NPS), a loyalty metric, was introduced by Fred Reichheld in a 2003 HBR article.', by: 'Business fact' },
  { type: 'fact', text: 'Blue Ocean Strategy (Kim & Mauborgne, 2005) argues the best move is to create uncontested market space.', by: 'Business fact' },
  { type: 'fact', text: 'The “long tail”, coined by Chris Anderson in 2004, describes selling small quantities of many niche products.', by: 'Business fact' },
  { type: 'fact', text: 'Toyota’s Production System gave rise to “lean” and “just-in-time” manufacturing.', by: 'Business fact' },
  { type: 'fact', text: 'Amazon sold its first item — a book — in 1995.', by: 'Did you know' },
  { type: 'fact', text: 'Coca-Cola keeps its formula as a trade secret rather than patenting it, since a patent would require disclosure.', by: 'Did you know' },
  { type: 'fact', text: 'Economies of scale: as output rises, the cost per unit typically falls.', by: 'Did you know' },
  { type: 'fact', text: 'Fixed costs stay flat as volume changes; variable costs move with each unit produced.', by: 'Did you know' },
  { type: 'fact', text: 'Break-even is where total revenue equals total costs — every unit after that adds profit.', by: 'Did you know' },
  { type: 'fact', text: 'Contribution margin = price − variable cost per unit; it’s what each sale contributes to fixed costs.', by: 'Did you know' },
  { type: 'fact', text: 'A “down round” is when a startup raises money at a lower valuation than its previous round.', by: 'Business fact' },
  { type: 'fact', text: 'SWOT analysis traces back to research at the Stanford Research Institute in the 1960s–70s.', by: 'Business fact' },
  { type: 'fact', text: 'Theodore Levitt’s 1960 essay “Marketing Myopia” warned firms to define their business by customer need, not product.', by: 'Business fact' },
  { type: 'fact', text: 'TAM, SAM, SOM size a market from the total opportunity down to what you can realistically capture.', by: 'Did you know' },
  { type: 'fact', text: 'In a profitability case, always split the tree into Revenue and Costs before going deeper.', by: 'Case tip' },
  { type: 'fact', text: 'Revenue = Price × Quantity — the first branch of almost every profitability tree.', by: 'Case tip' },
  { type: 'fact', text: 'For market-sizing, anchor on a population you know, then layer assumptions you can defend.', by: 'Case tip' },
  { type: 'fact', text: 'State your assumptions out loud in a guesstimate — interviewers score the structure, not just the number.', by: 'Case tip' },
  { type: 'fact', text: 'A good answer is MECE: Mutually Exclusive, Collectively Exhaustive — no overlaps, no gaps.', by: 'Case tip' },
  { type: 'fact', text: 'Sanity-check every estimate against a number you already know before you commit to it.', by: 'Case tip' },
];

/** Deterministic per-day shuffle so the rotation feels fresh without a backend. */
export function pickRotation(seed = Date.now()): LoadingItem[] {
  const arr = [...LOADING_ITEMS];
  // Simple seeded Fisher–Yates (xorshift).
  let s = Math.floor(seed) || 1;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
