import type { LearnPage } from '../types';

/**
 * Case frameworks. Every company in an example is fictional and every example
 * number is illustrative; the arithmetic is checked by scripts/check-us-learn.mjs.
 */

const D = '2026-09-27';

export const PROFITABILITY: LearnPage = {
  slug: 'profitability-framework',
  cluster: 'frameworks',
  nav: 'Profitability',
  title: 'The profitability framework for case interviews',
  metaTitle: 'Profitability Framework: Case Interview Guide + Example',
  description:
    'How to solve profitability cases: the profit tree, the questions to ask, a worked US example with the math, industry variations and the mistakes to avoid.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'The profitability framework breaks profit into revenue and costs, then revenue into price and volume, and costs into variable and fixed. Use it to find why profit changed and what to do about it: let the numbers show which branch moved, then look for the business reason behind the number.',
  takeaways: [
    '**Profit = revenue − costs; revenue = price × volume; costs = variable + fixed.**',
    '**Locate before you explain.** Find which branch moved, by how much, before brainstorming causes.',
    '**Segment the branch that moved** by product, channel, region or customer.',
    '**Ask whether it is company-specific or industry-wide.** The fix differs.',
    '**Recommend fixes that match the cause,** with a size for each.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is the profitability framework?',
      blocks: [
        {
          t: 'p',
          md: 'It is an equation turned into a tree, which is why it is MECE by construction. Every dollar of profit change has to show up as a change in price, volume, variable cost or fixed cost.',
        },
        {
          t: 'tree',
          root: 'Profit = revenue − costs',
          branches: [
            { label: 'Revenue', leaves: ['Price per unit', 'Units sold (split by product, channel, region or customer)'] },
            { label: 'Costs', leaves: ['Variable costs (cost per unit × units)', 'Fixed costs (rent, salaries, overhead, depreciation)'] },
          ],
        },
      ],
    },
    {
      id: 'steps',
      h: 'How do you solve a profitability case?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Clarify the goal', md: 'Profit or margin? How much did it fall, over what period? Are competitors seeing the same thing?' },
            { title: 'Split and compare', md: 'Ask for revenue and costs this year and last. Which moved, and by how much?' },
            { title: 'Drill into the branch that moved', md: 'Split it again: price vs. volume, or cost line by cost line. Then segment it by product, channel, region or customer.' },
            { title: 'Find the root cause', md: 'Internal (a decision, a process) or external (competitors, customers, suppliers, regulation)? Industry-wide or company-specific?' },
            { title: 'Recommend', md: 'Match fixes to the cause and size each one. Separate quick wins from structural changes.' },
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: why is a sporting-goods chain\'s profit down by half?',
      blocks: [
        {
          t: 'p',
          md: 'The client is a fictional Ohio chain of 25 sporting-goods stores. Profit fell from $8M to $4M in a year even though sales grew. All figures are illustrative.',
        },
        {
          t: 'table',
          head: ['$ millions', 'Last year', 'This year', 'Change'],
          rows: [
            ['Revenue', '100.0', '104.0', '+4.0'],
            ['Cost of goods sold', '60.0 (60% of sales)', '66.6 (64% of sales)', '+6.6'],
            ['Store labor', '20.0', '21.0', '+1.0'],
            ['Occupancy and overhead', '12.0', '12.4', '+0.4'],
            ['Profit', '8.0', '4.0', '−4.0'],
          ],
        },
        {
          t: 'math',
          title: 'Locate the problem',
          lines: [
            'Revenue rose $4.0M, but costs rose $6.6M + $1.0M + $0.4M = $8.0M, so profit fell $4.0M',
            'Gross margin fell from 40% to 36% (cost of goods went from 60% to 64% of sales)',
            'If cost of goods had stayed at 60%: $104M × 0.60 = $62.4M, which is $4.2M less than actual',
            'So the margin squeeze ($4.2M) explains more than the whole $4.0M drop',
          ],
        },
        {
          t: 'p',
          md: 'Now drill into cost of goods. A higher cost ratio can come from suppliers raising prices, a mix shift toward low-margin products, more markdowns, or more theft and damage ("shrink"). Suppose the interviewer reveals that clearance sales rose from 8% to 15% of revenue after the chain over-ordered winter gear before a warm winter. The root cause is a buying problem, not a pricing or cost problem.',
        },
        {
          t: 'callout',
          tone: 'example',
          title: 'Recommendation',
          md: 'Fix buying, not prices. Order smaller initial quantities with in-season reorders, set markdown triggers earlier, and move clearance online sooner. A realistic target is to recover most of the 4-point margin gap: each point of gross margin is worth about $1M of profit on $104M of sales.',
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in a profitability case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'How is the business model set up: what do we sell, to whom, through which channels?',
            'Over what period did profit change, and is it a sudden drop or a gradual slide?',
            'Did revenue, costs or both move? Which lines moved most?',
            'Is this happening to competitors too?',
            'Has anything changed recently: prices, product mix, suppliers, new stores, new rivals?',
          ],
        },
      ],
    },
    {
      id: 'industries',
      h: 'How does the profitability framework change by industry?',
      blocks: [
        {
          t: 'p',
          md: 'The tree stays the same, but each industry has its own natural drivers. Using them shows business judgment.',
        },
        {
          t: 'table',
          head: ['Industry', 'Revenue drivers', 'Cost drivers'],
          rows: [
            ['Retail', 'Store traffic × conversion × average basket', 'Cost of goods, store labor, occupancy, shrink'],
            ['Airlines', 'Seats flown × load factor × average fare, plus extras', 'Fuel, crew, aircraft ownership, airport fees; tracked as cost per available seat mile'],
            ['Restaurants', 'Covers (guests) × average check', 'Food and labor as a share of sales ("prime cost"), rent'],
            ['Subscription software', 'Customers × revenue per customer; new, expansion and churned revenue', 'Hosting, support, sales and marketing, R&D'],
            ['Manufacturing', 'Capacity × utilization × price', 'Materials, energy, labor, fixed plant costs'],
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common profitability case mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Brainstorming causes before locating the problem.** Ten guesses are not a structure.',
            '**Treating margin and profit as the same thing.** Profit can fall while margin holds, if volume falls.',
            '**Stopping at "costs went up".** Which cost, why, and is it permanent?',
            '**Recommending price increases by reflex,** without checking customers and competitors.',
            '**Ignoring mix.** Selling more of a low-margin product lowers average margin even if nothing else changes.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the profitability framework in a case interview?',
      a: 'A tree that splits profit into revenue (price × volume) and costs (variable + fixed). It is the most common case structure because every profit change has to appear in one of those branches.',
    },
    {
      q: 'What if both revenue and costs changed?',
      a: 'Quantify both and start with the bigger effect on profit. Often a cost ratio (costs as a share of sales) is more telling than absolute costs when revenue also moved.',
    },
    {
      q: 'What is the difference between profit and margin?',
      a: 'Profit is dollars (revenue minus costs). Margin is profit as a percentage of revenue. A company can grow profit while its margin shrinks, or the reverse.',
    },
  ],
  practice: { caseTypes: ['profitability'] },
  related: ['issue-trees', 'case-interview-math', 'cost-reduction-framework', 'pricing-strategy-framework'],
  keywords: ['profitability framework', 'profitability case', 'profit tree', 'profitability case interview example', 'why are profits down case'],
  published: D,
  modified: D,
};

export const MARKET_ENTRY: LearnPage = {
  slug: 'market-entry-framework',
  cluster: 'frameworks',
  nav: 'Market entry',
  title: 'The market entry framework: should we enter, and how?',
  metaTitle: 'Market Entry Framework: Case Interview Guide + Example',
  description:
    'How to solve market entry cases: market attractiveness, competition, ability to win and economics, plus build vs buy vs partner, with a worked US example.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'The market entry framework answers two questions: should a company enter a new market, and if so, how? Assess the market (size, growth, profitability), the competition, the company\'s ability to win, and the economics of entering. Then choose an entry mode: build it yourself, buy a player, or partner.',
  takeaways: [
    '**Four questions:** is the market attractive, who competes, can we win, and do the economics work?',
    '**Size the market first,** then estimate a realistic share, not a hopeful one.',
    '**Economics decide it:** investment, time to break-even, payback.',
    '**How to enter is a separate decision:** build, buy, partner or franchise.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is the market entry framework?',
      blocks: [
        {
          t: 'tree',
          root: 'Should the client enter this market?',
          branches: [
            { label: 'Market attractiveness', leaves: ['Size and growth', 'Profitability', 'Trends and regulation'] },
            { label: 'Competition', leaves: ['Players and their share', 'Barriers to entry', 'Likely response to us'] },
            { label: 'Ability to win', leaves: ['Capabilities and brand', 'Cost position', 'Fit with the core business'] },
            { label: 'Economics', leaves: ['Investment needed', 'Revenue ramp and break-even', 'Payback and risks'] },
          ],
        },
        {
          t: 'p',
          md: 'Answer the "should we" branches first. Only if the answer is yes do you turn to "how": organic build, acquisition, joint venture, licensing or franchising.',
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: should a pet-grooming chain enter a new metro area?',
      blocks: [
        {
          t: 'p',
          md: 'A fictional Seattle pet-grooming chain is considering its first salons in another metro area. Every input below is an assumption for illustration.',
        },
        {
          t: 'math',
          title: 'Size the market',
          lines: [
            'Metro households (assumption): 1.2 million',
            'Share that own a dog (assumption): 40% → 480,000 households',
            'Share that use a professional groomer (assumption): 50% → 240,000 households',
            'Grooms per year: 4 → 960,000 grooms a year',
            'Average price: $70 → market ≈ $67M a year',
          ],
        },
        {
          t: 'math',
          title: 'Economics of a 5% share in year three',
          lines: [
            'Grooms needed: 960,000 × 5% = 48,000 a year; revenue = 48,000 × $70 ≈ $3.4M',
            'Capacity per salon: 4 groomers × 6 dogs a day × 300 days = 7,200 grooms ≈ $504,000 revenue',
            'Salons needed: 48,000 ÷ 7,200 ≈ 6.7, so 7 salons',
            'Investment: 7 × $250,000 = $1.75M',
            'Profit per salon at a 20% margin: $504,000 × 20% ≈ $100,000 a year',
            'Payback per salon: $250,000 ÷ $100,000 ≈ 2.5 years',
          ],
        },
        {
          t: 'p',
          md: 'A 2.5-year payback is attractive, so the "should we" answer leans yes, provided two things hold: competitors are fragmented (mostly independents), and the chain can hire groomers, which is often the real constraint in services. Those become the questions to ask next.',
        },
      ],
    },
    {
      id: 'mode',
      h: 'How do you choose between building, buying and partnering?',
      blocks: [
        {
          t: 'table',
          head: ['Entry mode', 'Speed', 'Cost', 'Control', 'Choose it when'],
          rows: [
            ['Build (organic)', 'Slow', 'Spread over time', 'Full', 'You have the capabilities and time, and targets are expensive'],
            ['Buy (acquire)', 'Fast', 'High and up front', 'Full after integration', 'A good target exists at a fair price and speed matters'],
            ['Partner or joint venture', 'Medium', 'Shared', 'Shared', 'You need local knowledge, licenses or distribution you lack'],
            ['License or franchise', 'Fast', 'Low', 'Limited', 'The brand travels and operators can run it locally'],
          ],
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in a market entry case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'What is the client\'s goal: growth, diversification, following a key customer?',
            'How big is the market, how fast is it growing and how profitable are current players?',
            'Who are the leaders, how concentrated is the market and how might they respond?',
            'What would customers need to switch to us?',
            'What investment is needed, and when does it pay back?',
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common market entry mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Confusing a big market with a good one.** Size is not profitability.',
            '**Assuming a share with no mechanism** for winning it.',
            '**Forgetting the incumbent response.** Price wars change the economics.',
            '**Skipping capability fit.** Can this company actually operate in this market?',
            '**Deciding "how" before "whether".**',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What are the key parts of a market entry framework?',
      a: 'Market attractiveness, competition, the company\'s ability to win, and the economics of entry, followed by the entry mode: build, buy, partner or franchise.',
    },
    {
      q: 'How do you estimate market share for a new entrant?',
      a: 'Tie it to a mechanism: stores you can open, customers your sales team can reach, or share comparable entrants reached. Test a range, such as 2%, 5% and 10%, to see whether the decision changes.',
    },
    {
      q: 'Is market entry the same as a growth case?',
      a: 'Market entry is one growth option. A growth case compares it with others, such as selling more to current customers or launching new products.',
    },
  ],
  practice: { caseTypes: ['market entry'] },
  related: ['market-sizing', 'go-to-market-framework', 'growth-strategy-framework', 'mergers-and-acquisitions-case'],
  keywords: ['market entry framework', 'market entry case interview', 'market entry strategy', 'should we enter a new market', 'build vs buy vs partner'],
  published: D,
  modified: D,
};

export const PRICING: LearnPage = {
  slug: 'pricing-strategy-framework',
  cluster: 'frameworks',
  nav: 'Pricing strategy',
  title: 'Pricing strategy framework: how to set a price in a case',
  metaTitle: 'Pricing Strategy Framework: Case Interview Guide',
  description:
    'How to solve pricing cases with the cost, competitor and customer-value lenses, when a price change raises profit, pricing models, and worked examples.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'Pricing cases ask what a company should charge. Use three lenses: cost sets the floor, competitors set the reference, and customer value sets the ceiling. Price somewhere between the floor and the ceiling, then check how volume, competitors and the brand will respond before recommending a number.',
  takeaways: [
    '**Cost is the floor, value to the customer is the ceiling,** competitors sit in between.',
    '**Value-based pricing** starts from what the product is worth to the buyer.',
    '**A price rise pays off** if you lose less volume than price increase ÷ (margin + increase).',
    '**The pricing model matters** as much as the price level: subscription, tiers, usage, bundles.',
  ],
  sections: [
    {
      id: 'lenses',
      h: 'What are the three ways to set a price?',
      blocks: [
        {
          t: 'table',
          head: ['Lens', 'The question', 'Strength', 'Weakness'],
          rows: [
            ['Cost-based', 'What does it cost us, plus a target margin?', 'Simple; protects margin', 'Ignores what customers would pay'],
            ['Competitor-based', 'What do alternatives cost?', 'Grounded in the market', 'Can start a race to the bottom'],
            ['Value-based', 'What is it worth to the customer?', 'Captures the most value', 'Needs customer insight to estimate'],
          ],
        },
      ],
    },
    {
      id: 'value',
      h: 'How do you estimate value to the customer?',
      blocks: [
        {
          t: 'p',
          md: 'Work out what the product saves or earns the buyer compared with their next-best alternative. For a business buyer this is often a direct calculation. The example below is fictional and illustrative.',
        },
        {
          t: 'math',
          title: 'A fuel-saving device for long-haul trucks',
          lines: [
            'Fuel per truck per year (assumption): 10,000 gallons × $4 a gallon = $40,000',
            'Fuel saved by the device (assumption): 4% → $40,000 × 4% = $1,600 a year',
            'Proposed price: $30 a month = $360 a year',
            'The fleet keeps $1,600 − $360 = $1,240 a year of the value',
          ],
        },
        {
          t: 'p',
          md: 'Capturing about 22% of the value ($360 of $1,600) leaves a strong reason to buy. You could test a higher price, but also consider how hard the saving is to prove, which is often what really limits value-based pricing.',
        },
      ],
    },
    {
      id: 'elasticity',
      h: 'How do you know whether a price change will raise profit?',
      blocks: [
        {
          t: 'p',
          md: 'Compare the volume you could lose with the volume you would actually lose. The break-even volume change depends on your contribution margin.',
        },
        {
          t: 'math',
          title: 'Break-even volume for a price change (contribution margin 40%)',
          lines: [
            'Raise price 10%: you can lose up to 10 ÷ (40 + 10) = 20% of volume before profit falls',
            'Check: price $100, variable cost $60. At $110, contribution per unit goes from $40 to $50; $40 ÷ $50 = 0.8, so 80% of the volume earns the same profit',
            'Cut price 10%: you need 10 ÷ (40 − 10) ≈ 33% more volume just to stay even',
          ],
        },
        {
          t: 'p',
          md: 'This asymmetry is why price cuts are riskier than they look: with a 40% margin, a 10% cut needs a third more volume just to break even.',
        },
      ],
    },
    {
      id: 'models',
      h: 'Which pricing models come up in case interviews?',
      blocks: [
        {
          t: 'table',
          head: ['Model', 'How it works', 'Fits when'],
          rows: [
            ['Subscription', 'Recurring fee for ongoing access', 'Value is delivered continuously'],
            ['Good-better-best tiers', 'Three packages at rising prices', 'Customers differ in needs and willingness to pay'],
            ['Usage-based', 'Pay per unit used', 'Value scales with use; customers dislike fixed commitments'],
            ['Freemium', 'Free basic tier, paid upgrades', 'Low cost to serve free users; strong upgrade path'],
            ['Dynamic pricing', 'Price moves with demand or time', 'Capacity is fixed and perishable: seats, rooms, parking'],
            ['Bundling', 'Several products for one price', 'Products are used together; raises average spend'],
          ],
        },
      ],
    },
    {
      id: 'steps',
      h: 'How do you solve a pricing case step by step?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Clarify the objective', md: 'Maximize profit, win share, or launch a new product? New price or a change to an existing one?' },
            { title: 'Find the floor', md: 'Variable cost per unit, and any fixed costs the price must cover.' },
            { title: 'Find the reference', md: 'What do substitutes cost, and how does our product compare?' },
            { title: 'Estimate the ceiling', md: 'Value to the customer versus their next-best alternative, by segment.' },
            { title: 'Pick a price and test it', md: 'Estimate the volume response and competitor reaction. Check profit at two or three price points.' },
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is value-based pricing?',
      a: 'Setting the price from the value the product creates for the customer compared with their next-best alternative, instead of from your cost or competitors\' prices.',
    },
    {
      q: 'How do you calculate the volume you can lose after a price increase?',
      a: 'Price increase ÷ (contribution margin + price increase). With a 40% margin and a 10% increase, you can lose up to 20% of volume before profit falls.',
    },
    {
      q: 'Should a company match a competitor\'s price cut?',
      a: 'Not by default. Estimate the volume at risk, the cost of matching, and whether customers really choose on price. See the competitive response framework.',
    },
  ],
  practice: { caseTypes: ['pricing'] },
  related: ['profitability-framework', 'case-interview-math', 'competitive-response-framework', 'sales-case-interview'],
  keywords: ['pricing strategy framework', 'pricing case interview', 'value-based pricing', 'price elasticity case', 'how to price a product case'],
  published: D,
  modified: D,
};

export const GROWTH: LearnPage = {
  slug: 'growth-strategy-framework',
  cluster: 'frameworks',
  nav: 'Growth strategy',
  title: 'Growth strategy framework: how a company can grow revenue',
  metaTitle: 'Growth Strategy Framework: Case Interview Guide + Example',
  description:
    'How to solve growth strategy cases: organic vs inorganic growth, the Ansoff matrix, a worked gap analysis to double revenue, and how to prioritize options.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'A growth strategy case asks how a company can grow revenue. Structure the options as growing the core (more customers, more revenue per customer), expanding (new segments, geographies, channels or products) and buying or partnering. Size each option, weigh its risk and fit, and recommend a focused combination that closes the growth gap.',
  takeaways: [
    '**Start with the gap:** target revenue minus where momentum alone gets you.',
    '**Organic before inorganic,** unless speed or capabilities demand a deal.',
    '**The Ansoff matrix ranks risk:** new products and new markets together is the riskiest move.',
    '**Recommend a portfolio** that adds up to the target, not a list of ideas.',
  ],
  sections: [
    {
      id: 'tree',
      h: 'What is the growth strategy framework?',
      blocks: [
        {
          t: 'tree',
          root: 'How can the client grow revenue?',
          branches: [
            { label: 'Grow the core', leaves: ['More customers in current markets', 'More revenue per customer (price, frequency, cross-sell)'] },
            { label: 'Expand', leaves: ['New customer segments', 'New geographies or channels', 'New products or services'] },
            { label: 'Buy or partner', leaves: ['Acquisitions', 'Partnerships and joint ventures'] },
          ],
        },
      ],
    },
    {
      id: 'ansoff',
      h: 'How does the Ansoff matrix help in a growth case?',
      blocks: [
        {
          t: 'p',
          md: 'Igor Ansoff\'s matrix sorts growth moves by whether the product and the market are existing or new. Risk rises as you move away from what the company already knows.',
        },
        {
          t: 'table',
          head: ['', 'Existing products', 'New products'],
          rows: [
            ['Existing markets', 'Market penetration (lowest risk)', 'Product development'],
            ['New markets', 'Market development', 'Diversification (highest risk)'],
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: can a distributor double revenue in five years?',
      blocks: [
        {
          t: 'p',
          md: 'A fictional regional dental-supply distributor has $200M in revenue and wants $400M in five years. All numbers are illustrative.',
        },
        {
          t: 'math',
          title: 'Size the gap',
          lines: [
            'Doubling in 5 years needs 2^(1/5) − 1 ≈ 14.9% growth a year',
            'Momentum (assume the core grows 4% a year): $200M × 1.04^5 ≈ $243M',
            'Gap: $400M − $243M ≈ $157M of new revenue by year 5',
          ],
        },
        {
          t: 'math',
          title: 'Close the gap',
          lines: [
            'Enter the Southeast with two new warehouses: +$60M',
            'Launch private-label consumables: +$30M',
            'Acquire a smaller distributor with $70M in revenue: +$70M',
            'Total: $243M + $60M + $30M + $70M = $403M, just over the $400M target',
          ],
        },
        {
          t: 'p',
          md: 'The plan works on paper but leans on the acquisition for almost half the gap. Say that out loud: if no fairly priced target exists, the realistic organic outcome is about $333M, and the client should hear that before committing to $400M.',
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in a growth case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'What is the target, by when, and is it revenue or profit growth?',
            'How fast is the core market growing, and is the client gaining or losing share?',
            'Which customers, products and channels drive revenue today?',
            'What capabilities and assets could carry into adjacent markets?',
            'What has the client tried before, and why did it work or fail?',
          ],
        },
      ],
    },
    {
      id: 'prioritize',
      h: 'How do you prioritize growth options?',
      blocks: [
        {
          t: 'table',
          head: ['Criterion', 'Question'],
          rows: [
            ['Size', 'How much revenue and profit by the target year?'],
            ['Speed', 'How soon does it contribute?'],
            ['Risk', 'How far is it from what the company knows (Ansoff)?'],
            ['Fit', 'Does it use existing customers, channels or capabilities?'],
            ['Investment', 'How much capital, and what payback?'],
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common growth case mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**A brainstorm with no sizing.** Ten ideas without numbers do not answer "can we double?"',
            '**Ignoring momentum,** so you overstate how much new growth is needed.',
            '**Forgetting profit.** Revenue growth that destroys margin is not success.',
            '**Treating acquisitions as free growth,** with no view on price or integration risk.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between organic and inorganic growth?',
      a: 'Organic growth comes from the company\'s own operations: more customers, higher prices, new products or markets. Inorganic growth comes from acquisitions, mergers and some partnerships.',
    },
    {
      q: 'What is the Ansoff matrix?',
      a: 'A 2×2 of existing vs. new products and existing vs. new markets. Its four strategies are market penetration, product development, market development and diversification, in rising order of risk.',
    },
    {
      q: 'How do you calculate the growth rate needed to hit a target?',
      a: 'Use CAGR: (target ÷ current)^(1 ÷ years) − 1. Doubling in five years needs about 14.9% a year.',
    },
  ],
  practice: { caseTypes: ['growth'] },
  related: ['market-entry-framework', 'mergers-and-acquisitions-case', 'go-to-market-framework', 'business-frameworks'],
  sources: [
    {
      label: 'Ansoff matrix (Wikipedia), citing H. Igor Ansoff, "Strategies for Diversification", Harvard Business Review, Sept–Oct 1957',
      url: 'https://en.wikipedia.org/wiki/Ansoff_matrix',
      note: 'The original product-market growth matrix and its four strategies.',
    },
  ],
  keywords: ['growth strategy framework', 'growth case interview', 'Ansoff matrix', 'how to grow revenue case', 'organic vs inorganic growth'],
  published: D,
  modified: D,
};

export const MNA: LearnPage = {
  slug: 'mergers-and-acquisitions-case',
  cluster: 'frameworks',
  nav: 'Mergers and acquisitions',
  title: 'M&A and private equity case interviews: how to evaluate a deal',
  metaTitle: 'M&A Case Interview Framework: Private Equity Deals + Example',
  description:
    'How to solve M&A and private equity cases: market, target, valuation and synergies, and execution, with a worked valuation and PE returns example.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'An M&A case asks whether a company or investor should buy a target. Check four things: whether the target\'s market is attractive, whether the target itself is strong, what it is worth compared with the price (including synergies), and whether the deal can be executed and integrated. Then recommend buying, walking away or negotiating a lower price.',
  takeaways: [
    '**Market, target, value, execution:** four branches cover almost every deal case.',
    '**Strategic buyers pay for synergies; financial buyers pay for returns.**',
    '**The price must be justified by standalone value plus realistic synergies.**',
    '**Revenue synergies are harder to deliver than cost synergies.**',
  ],
  sections: [
    {
      id: 'tree',
      h: 'What is the M&A case framework?',
      blocks: [
        {
          t: 'tree',
          root: 'Should the client buy the target?',
          branches: [
            { label: 'Market', leaves: ['Size and growth', 'Profitability', 'Trends and disruption risk'] },
            { label: 'Target', leaves: ['Market position and share', 'Financial health', 'Customers, products, management'] },
            { label: 'Value', leaves: ['Standalone value', 'Synergies', 'Price and financing'] },
            { label: 'Execution', leaves: ['Integration and culture', 'Regulatory and antitrust', 'Key risks'] },
          ],
        },
      ],
    },
    {
      id: 'buyers',
      h: 'How do strategic and financial buyers differ?',
      blocks: [
        {
          t: 'table',
          head: ['', 'Strategic buyer (a company)', 'Financial buyer (private equity)'],
          rows: [
            ['Why buy', 'Growth, capabilities, synergies with its business', 'Return on invested equity'],
            ['How value is created', 'Combining operations, cross-selling', 'Operational improvement, debt financing, multiple expansion'],
            ['Holding period', 'Usually indefinite', 'Usually several years, then an exit'],
            ['Key question', 'Is it worth more to us than to anyone else?', 'Can we earn our target return at this price?'],
          ],
        },
      ],
    },
    {
      id: 'valuation',
      h: 'How do you value a target in a case interview?',
      blocks: [
        {
          t: 'p',
          md: 'Cases usually use a multiple: enterprise value = earnings measure × a multiple taken from comparable companies or deals. The fictional numbers below show how synergies justify a premium.',
        },
        {
          t: 'math',
          title: 'Is a $200M asking price justified?',
          lines: [
            'Target EBITDA: $20M; comparable deals trade at 8× EBITDA → standalone value ≈ $160M',
            'Premium asked: $200M − $160M = $40M',
            'Cost synergies (combining warehouses and back office): $4M a year × 8 ≈ $32M of value',
            'Standalone value + cost synergies ≈ $192M, still $8M short of the price',
            'The deal only works if revenue synergies are real, or if the client negotiates the price down',
          ],
        },
      ],
    },
    {
      id: 'pe-returns',
      h: 'How do private equity returns work in a case?',
      blocks: [
        {
          t: 'math',
          title: 'A simple leveraged buyout (illustrative)',
          lines: [
            'Buy at $160M, funded with 50% debt: equity invested = $80M',
            'Year 5: EBITDA grows to $30M; exit at 8× = $240M',
            'Debt paid down from $80M to $50M → equity at exit = $240M − $50M = $190M',
            'Multiple of money: $190M ÷ $80M ≈ 2.4×',
            'Annual return (IRR): 2.375^(1/5) − 1 ≈ 19%',
          ],
        },
        {
          t: 'p',
          md: 'Notice where the gain came from: EBITDA growth (operations) and debt paydown. With no change in the multiple, both matter. That is the logic interviewers want you to explain.',
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in an M&A case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'Why does the buyer want this deal: growth, capabilities, cost savings, or a financial return?',
            'How attractive is the target\'s market, and how strong is the target within it?',
            'What is the asking price, and what multiple does it imply compared with similar deals?',
            'Which synergies are realistic, how fast, and at what one-time cost?',
            'What could block or delay the deal: antitrust, financing, key customers or people leaving?',
          ],
        },
      ],
    },
    {
      id: 'synergies',
      h: 'What are synergies, and why are they often overestimated?',
      blocks: [
        {
          t: 'p',
          md: '**Cost synergies** come from removing duplication: one headquarters, combined purchasing, shared warehouses. **Revenue synergies** come from selling more together: cross-selling, bigger distribution. Cost synergies are more within management\'s control, so they are usually more reliable. Revenue synergies depend on customers behaving as planned. Always net out one-time integration costs and allow for delays.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common M&A case mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Judging the target without its market.** A great company in a shrinking market is a trap.',
            '**Counting synergies at full value from day one,** with no integration cost.',
            '**Forgetting the price.** A good company can be a bad deal at the wrong price.',
            '**Skipping antitrust** when the buyer and target compete directly.',
            '**No walk-away price** in the recommendation.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the framework for an M&A case interview?',
      a: 'Evaluate the market, the target, the value (standalone value, synergies and price) and the execution risks, then recommend buy, walk away, or buy at a lower price.',
    },
    {
      q: 'What is EBITDA and why is it used to value companies?',
      a: 'Earnings before interest, taxes, depreciation and amortization: a rough proxy for operating cash earnings. Multiplying it by a comparable multiple gives a quick enterprise value.',
    },
    {
      q: 'How is a private equity case different from a corporate M&A case?',
      a: 'The buyer cares about the return on its equity over a holding period, so leverage, operational improvement and the exit price matter more, and synergies with an existing business matter less.',
    },
  ],
  practice: { caseTypes: ['m&a'] },
  related: ['finance-case-interview', 'growth-strategy-framework', 'market-entry-framework', 'case-interview-math'],
  keywords: ['M&A case interview', 'private equity case interview', 'acquisition framework', 'synergies', 'EBITDA multiple valuation', 'LBO case'],
  published: D,
  modified: D,
};

export const GTM: LearnPage = {
  slug: 'go-to-market-framework',
  cluster: 'frameworks',
  nav: 'Go-to-market',
  title: 'Go-to-market strategy framework: how to launch a product',
  metaTitle: 'Go-to-Market Strategy Framework: Launch Case Guide',
  description:
    'How to answer go-to-market and product launch cases: target customer, value proposition, pricing, channels and unit economics (CAC, LTV, payback).',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'A go-to-market (GTM) framework plans how a product reaches customers: who to target first, what problem and message will win them, how to price, which channels to sell through, and which metrics show it is working. In a case, size the opportunity, pick a beachhead segment, and check the launch economics before recommending a plan.',
  takeaways: [
    '**Start narrow.** One beachhead segment you can win beats a launch to everyone.',
    '**Match the channel to the deal size:** self-serve for small, field sales for large.',
    '**LTV ÷ CAC and CAC payback** tell you whether growth creates or burns value.',
    '**Define success metrics before launch.**',
  ],
  sections: [
    {
      id: 'tree',
      h: 'What is a go-to-market framework?',
      blocks: [
        {
          t: 'tree',
          root: 'How should the client launch this product?',
          branches: [
            { label: 'Customer', leaves: ['Segments and their needs', 'Beachhead segment'] },
            { label: 'Value proposition', leaves: ['Problem solved', 'Why us vs. alternatives'] },
            { label: 'Price', leaves: ['Pricing model', 'Price level'] },
            { label: 'Channels', leaves: ['Direct sales, self-serve, partners or retail'] },
            { label: 'Economics and metrics', leaves: ['CAC, LTV, payback', 'Adoption targets'] },
          ],
        },
      ],
    },
    {
      id: 'beachhead',
      h: 'How do you pick the first customer segment?',
      blocks: [
        {
          t: 'table',
          head: ['Criterion', 'Question'],
          rows: [
            ['Pain', 'How badly does this segment need the solution?'],
            ['Reach', 'Can we find and sell to them efficiently?'],
            ['Willingness to pay', 'Do they have budget, and who decides?'],
            ['Competition', 'Is anyone already serving them well?'],
            ['Spillover', 'Does winning them help win the next segment?'],
          ],
        },
      ],
    },
    {
      id: 'channels',
      h: 'How do you choose sales channels for a launch?',
      blocks: [
        {
          t: 'table',
          head: ['Channel', 'Good for', 'Cost to acquire a customer'],
          rows: [
            ['Self-serve online', 'Small purchases, simple products', 'Low'],
            ['Inside sales (phone, video)', 'Mid-size deals, some explanation needed', 'Medium'],
            ['Field sales', 'Large, complex deals with several decision-makers', 'High'],
            ['Partners and resellers', 'Reaching customers others already serve', 'Shared margin'],
            ['Retail', 'Physical consumer goods', 'Slotting fees, distributor and retailer margin'],
          ],
        },
      ],
    },
    {
      id: 'unit-economics',
      h: 'How do CAC and LTV tell you whether a launch works?',
      blocks: [
        {
          t: 'p',
          md: 'Customer acquisition cost (CAC) is what you spend to win one customer. Lifetime value (LTV) is the margin a customer brings over their life. An example with a fictional scheduling app for dental offices:',
        },
        {
          t: 'math',
          title: 'Unit economics (illustrative)',
          lines: [
            'Price $200 a month at an 80% gross margin → $160 of margin a month',
            'Monthly churn 2% → average life = 1 ÷ 2% = 50 months',
            'LTV = $160 × 50 = $8,000',
            'CAC: a rep costing $120,000 a year closes 72 offices a year → $1,667 each, plus $500 of marketing ≈ $2,167',
            'LTV ÷ CAC = $8,000 ÷ $2,167 ≈ 3.7',
            'CAC payback = $2,167 ÷ $160 ≈ 13.5 months',
          ],
        },
        {
          t: 'p',
          md: 'An LTV-to-CAC ratio of about 3 or more, with payback in roughly a year, is often used as a rule of thumb for a healthy subscription business. Here the launch looks viable. The biggest risk is the churn assumption, so test it with a pilot before scaling the sales team.',
        },
      ],
    },
    {
      id: 'steps',
      h: 'How do you answer a product launch case step by step?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Clarify the goal', md: 'Revenue target, share, strategic reason, and timeline.' },
            { title: 'Size the opportunity', md: 'Total market, then the segment you can realistically serve first.' },
            { title: 'Choose the beachhead and message', md: 'Who, which problem, and why us.' },
            { title: 'Set price and channel', md: 'Consistent with deal size and buyer behavior.' },
            { title: 'Check the economics', md: 'CAC, LTV, payback and the investment before break-even.' },
            { title: 'Plan the launch', md: 'Pilot, success metrics, and the trigger to scale or stop.' },
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common go-to-market case mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Launching to everyone at once** instead of winning one segment first.',
            '**A channel that does not fit the deal size,** such as field sales for a $20-a-month product.',
            '**Ignoring churn** when calculating lifetime value.',
            '**No stop rule.** Decide in advance what result would pause the rollout.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a go-to-market strategy?',
      a: 'The plan for bringing a product to customers: target segment, value proposition, pricing, sales and marketing channels, and the metrics that show traction.',
    },
    {
      q: 'What is a good LTV to CAC ratio?',
      a: 'A common rule of thumb for subscription businesses is 3 or higher, with CAC paid back in about a year. It varies by industry and growth stage, so treat it as a guide, not a law.',
    },
    {
      q: 'What is a beachhead market?',
      a: 'The first, narrowly defined customer segment a company targets to win decisively before expanding to adjacent segments.',
    },
  ],
  practice: { caseTypes: ['go to market'] },
  related: ['marketing-case-interview', 'sales-case-interview', 'pricing-strategy-framework', 'product-manager-case-interview'],
  keywords: ['go-to-market strategy', 'go-to-market framework', 'product launch case interview', 'GTM strategy', 'CAC LTV', 'beachhead market'],
  published: D,
  modified: D,
};

export const COST_REDUCTION: LearnPage = {
  slug: 'cost-reduction-framework',
  cluster: 'frameworks',
  nav: 'Cost reduction',
  title: 'Cost reduction framework: where to cut, and what to protect',
  metaTitle: 'Cost Reduction Framework: Case Interview Guide + Example',
  description:
    'How to solve cost reduction cases: map the cost base, benchmark it, choose levers, and size them against a target, with a worked 15% cost-cut example.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'A cost reduction case asks where a company can cut costs without hurting what customers value. Map the full cost base, benchmark each bucket against competitors or history, then choose levers: pay less for what you buy, use less of it, work more efficiently, or stop doing low-value work. Size each lever against the target.',
  takeaways: [
    '**Map the whole cost base first.** Cut where the money is, not where it is easy.',
    '**Benchmark each bucket** against peers or past years to find the outliers.',
    '**Four levers:** price paid, quantity used, productivity, and stopping work.',
    '**Add the levers up against the target,** and say honestly if they fall short.',
  ],
  sections: [
    {
      id: 'tree',
      h: 'What is the cost reduction framework?',
      blocks: [
        {
          t: 'tree',
          root: 'Where can the client cut costs?',
          branches: [
            { label: 'Direct costs', leaves: ['Materials and purchased services', 'Direct labor'] },
            { label: 'Operating overhead', leaves: ['Facilities and equipment', 'Logistics'] },
            { label: 'Selling, general and administrative', leaves: ['Sales and marketing', 'Corporate functions (HR, finance, IT)'] },
          ],
        },
        {
          t: 'table',
          head: ['Lever', 'Examples', 'Watch out for'],
          rows: [
            ['Pay less', 'Renegotiate suppliers, consolidate vendors, competitive bids', 'Quality and supplier risk'],
            ['Use less', 'Reduce waste, simplify specifications, cut unused software licenses', 'Hidden effects on the product'],
            ['Work smarter', 'Automation, better scheduling, shared services', 'Up-front investment and change management'],
            ['Stop doing it', 'Drop unprofitable products, reports nobody reads, low-value services', 'Customers who valued it'],
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: can a distributor cut 15% of its costs?',
      blocks: [
        {
          t: 'p',
          md: 'A fictional truck-parts distributor has an $80M cost base and a target to cut 15%, or $12M. All numbers are illustrative.',
        },
        {
          t: 'math',
          title: 'Cost base and first-pass levers',
          lines: [
            'Cost base: purchased goods $40M + warehouse labor $18M + freight $10M + SG&A $12M = $80M; 15% = $12M',
            'Renegotiate top suppliers, 5% on $40M: $2.0M',
            'Warehouse productivity +10% on $18M: $1.8M',
            'Freight consolidation, 15% on $10M: $1.5M',
            'SG&A: shared services and automation, 20% on $12M: $2.4M',
            'Subtotal: $2.0M + $1.8M + $1.5M + $2.4M = $7.7M, which is $4.3M short of the target',
          ],
        },
        {
          t: 'p',
          md: 'Operating levers alone fall short. The structural option is to redesign the network: closing one of three warehouses saves an estimated $4.5M a year, bringing the total to $12.2M. That is the honest recommendation: hit the target only with the network change, and phase it after the quick wins so service levels hold.',
        },
      ],
    },
    {
      id: 'protect',
      h: 'How do you decide which costs not to cut?',
      blocks: [
        {
          t: 'p',
          md: 'Separate costs that create what customers pay for from costs that do not. A retailer that cuts store staff to save labor may lose more in sales than it saves. Ask for each lever: does the customer notice, and does it weaken a competitive advantage? Cut hardest where the answer to both is no.',
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in a cost reduction case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'What is driving the target: falling revenue, a margin goal, an investor or a competitor?',
            'What does the full cost base look like, by type and by function?',
            'How does each bucket compare with competitors or with past years?',
            'Which costs are fixed in the short term (leases, contracts)?',
            'What is off limits: quality, safety, customer service, key talent?',
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common cost reduction mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Across-the-board cuts** that treat high-value and low-value spend the same.',
            '**Ignoring one-time costs** such as severance, exit fees and IT changes.',
            '**Cutting what customers value** and losing revenue.',
            '**Presenting ideas without sizes,** so no one knows if the target is reachable.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What are the main levers for cutting costs?',
      a: 'Paying less for inputs, using fewer inputs, improving productivity, and stopping low-value activities. Structural changes, such as closing facilities, go further but cost more to execute.',
    },
    {
      q: 'Is cost reduction the same as a profitability case?',
      a: 'It is one half of it. A profitability case examines revenue and costs; a cost reduction case assumes the answer lies in costs and focuses on finding and sizing savings.',
    },
    {
      q: 'What is benchmarking in a cost case?',
      a: 'Comparing each cost bucket, usually as a percentage of revenue or per unit, with competitors, best-in-class peers or the company\'s own history to find outliers.',
    },
  ],
  practice: { caseTypes: ['cost reduction'] },
  related: ['profitability-framework', 'operations-case-framework', 'hr-case-interview', 'finance-case-interview'],
  keywords: ['cost reduction framework', 'cost cutting case interview', 'cost reduction case', 'how to reduce costs framework', 'benchmarking costs'],
  published: D,
  modified: D,
};

export const OPERATIONS: LearnPage = {
  slug: 'operations-case-framework',
  cluster: 'frameworks',
  nav: 'Operations',
  title: 'Operations case interviews: capacity, bottlenecks and process',
  metaTitle: 'Operations Case Interview: Bottleneck and Capacity Guide',
  description:
    'How to solve operations cases: map the process, find the bottleneck, use Little\'s Law, and pick the right metrics, with a worked capacity example.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'Operations cases ask why a process is too slow, too costly or too unreliable, and how to fix it. Map the process step by step, find the bottleneck (the step with the least capacity), measure throughput, cycle time, utilization and quality, then fix the constraint first. Improving any other step will not raise output.',
  takeaways: [
    '**Output is set by the bottleneck,** the slowest step in the process.',
    '**Little\'s Law:** items in the system = throughput × time in the system.',
    '**Fix the constraint first,** then find the next one.',
    '**Separate capacity problems from variability problems.**',
  ],
  sections: [
    {
      id: 'structure',
      h: 'How do you structure an operations case?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Map the process', md: 'List every step from input to output, in order. This split is MECE by construction.' },
            { title: 'Measure capacity per step', md: 'Units per hour each step can handle, and actual demand.' },
            { title: 'Find the bottleneck', md: 'The step with the lowest capacity relative to demand.' },
            { title: 'Find the root cause', md: 'People (staffing, skills), process (layout, handoffs), technology, or supply (materials, variability of arrivals).' },
            { title: 'Fix and re-check', md: 'Add capacity or reduce load at the constraint, then see which step becomes the new bottleneck.' },
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: why is the lunch line so long?',
      blocks: [
        {
          t: 'p',
          md: 'A fictional Nashville sandwich shop has a long line every lunch. Three steps, with illustrative capacities:',
        },
        {
          t: 'table',
          head: ['Step', 'Capacity (customers an hour)'],
          rows: [
            ['Order at the counter', '60'],
            ['Make the sandwich (2 staff × 20 an hour)', '40'],
            ['Pay', '90'],
          ],
        },
        {
          t: 'math',
          title: 'Find and fix the bottleneck',
          lines: [
            'Peak demand: 50 customers an hour',
            'Bottleneck: making, at 40 an hour, so the line grows by 50 − 40 = 10 customers an hour',
            'Little\'s Law: with 20 people waiting and 40 served an hour, the wait ≈ 20 ÷ 40 = 0.5 hours, or 30 minutes',
            'Fix: add a third sandwich maker → 3 × 20 = 60 an hour, above demand',
            'New bottleneck: ordering and making are both at 60, so the next fix is online pre-ordering',
          ],
        },
        {
          t: 'p',
          md: 'Adding a second cashier would have changed nothing, because payment was never the constraint. That is the central lesson of operations cases.',
        },
      ],
    },
    {
      id: 'metrics',
      h: 'Which operations metrics should you know?',
      blocks: [
        {
          t: 'table',
          head: ['Metric', 'Definition'],
          rows: [
            ['Throughput', 'Units completed per unit of time'],
            ['Cycle time', 'Time to complete one unit at a step or in the whole process'],
            ['Utilization', 'Actual output ÷ capacity'],
            ['First-pass yield', 'Share of units done right the first time'],
            ['OEE (overall equipment effectiveness)', 'Availability × performance × quality'],
            ['On-time delivery', 'Share of orders delivered by the promised date'],
            ['Inventory turns', 'Cost of goods sold ÷ average inventory'],
          ],
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in an operations case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'What is the problem in numbers: late orders, long waits, high cost per unit, defects?',
            'What are the steps, and what is the capacity and utilization of each?',
            'Is demand steady or peaky? When does the problem happen?',
            'Has anything changed: volume, product mix, staffing, equipment?',
            'What does good look like: a target cycle time, cost or service level?',
          ],
        },
      ],
    },
    {
      id: 'supply-chain',
      h: 'How do supply chain cases work?',
      blocks: [
        {
          t: 'p',
          md: 'Supply chain cases apply the same logic to a network. The classic SCOR model splits a supply chain into plan, source, make, deliver and return, which is a useful MECE first cut. Typical questions: why are stockouts rising, why is freight cost up, or how many warehouses should we run? Trade-offs are the heart of it: more warehouses mean faster delivery but more inventory and fixed cost.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common operations case mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Improving a step that is not the bottleneck.**',
            '**Using averages when variability is the problem.** A process can have enough average capacity and still build queues at peaks.',
            '**Skipping quality.** Rework consumes capacity at the bottleneck.',
            '**Recommending "hire more people" without sizing it** against cost.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a bottleneck in operations?',
      a: 'The step in a process with the least capacity relative to demand. It limits the output of the whole process, so improvements elsewhere do not raise throughput.',
    },
    {
      q: 'What is Little\'s Law?',
      a: 'In a stable system, the average number of items in the system equals the throughput rate times the average time each item spends in it. It links queue length, output and waiting time.',
    },
    {
      q: 'What do operations manager interviews ask?',
      a: 'Expect process and capacity problems, scheduling and staffing questions, quality and cost trade-offs, and behavioral questions about leading teams through change.',
    },
  ],
  practice: { caseTypes: ['operations'] },
  related: ['cost-reduction-framework', 'strategy-and-operations-interview', 'case-interview-math', 'issue-trees'],
  keywords: ['operations case interview', 'bottleneck analysis', 'capacity case', 'Little\'s Law', 'supply chain case interview', 'operations manager interview'],
  published: D,
  modified: D,
};

export const COMPETITIVE_RESPONSE: LearnPage = {
  slug: 'competitive-response-framework',
  cluster: 'frameworks',
  nav: 'Competitive response',
  title: 'Competitive response framework: what to do when a rival moves',
  metaTitle: 'Competitive Response Framework: Case Interview Guide',
  description:
    'How to solve competitive response cases: understand the rival\'s move, size the threat, and compare matching, differentiating and other responses.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'A competitive response case asks how a company should react when a rival moves: a new entrant, a price cut or a new product. First understand the threat: which customers are affected, how much revenue is at risk and why customers might switch. Then compare responses such as matching, differentiating, focusing on a niche or holding steady.',
  takeaways: [
    '**Size the threat before choosing a response.**',
    '**Matching a price cut can cost more** than the sales it protects.',
    '**Predict the rival\'s next move:** what are its incentives and constraints?',
    '**Doing nothing is a valid option** if the threat is small or self-limiting.',
  ],
  sections: [
    {
      id: 'tree',
      h: 'What is the competitive response framework?',
      blocks: [
        {
          t: 'tree',
          root: 'How should the client respond to the rival?',
          branches: [
            { label: 'Understand the move', leaves: ['What exactly changed', 'Which customers it targets', 'Why they might switch'] },
            { label: 'Size the threat', leaves: ['Revenue and profit at risk', 'How fast it could happen'] },
            { label: 'Options', leaves: ['Match', 'Differentiate', 'Focus on a niche', 'Partner or acquire', 'Hold steady'] },
            { label: 'Choose', leaves: ['Economics of each option', 'Rival\'s likely counter-move', 'Our capabilities'] },
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: a discount grocer opens near 10 stores',
      blocks: [
        {
          t: 'p',
          md: 'A fictional regional grocer with 50 stores learns that a discount chain is opening near 10 of them. Each affected store sells $30M a year at a 25% contribution margin. All numbers are illustrative.',
        },
        {
          t: 'math',
          title: 'Compare three responses over one year',
          lines: [
            'Revenue exposed: 10 stores × $30M = $300M',
            'Do nothing: lose 12% of sales = $36M × 25% margin = $9.0M of contribution lost',
            'Match prices on key items: costs 2% of $300M = $6.0M, and cuts the loss to 5% = $15M × 25% = $3.75M → total $9.75M',
            'Differentiate (fresh food, service, pickup): costs $2.0M, and cuts the loss to 8% = $24M × 25% = $6.0M → total $8.0M',
          ],
        },
        {
          t: 'p',
          md: 'Matching prices is the worst option here: it protects sales but gives away more margin than it saves. Differentiating costs least overall. Before deciding, check two things: whether customers in these neighborhoods really choose on price, and whether the discounter would cut prices further if matched.',
        },
      ],
    },
    {
      id: 'options',
      h: 'Which competitive responses are there, and when does each work?',
      blocks: [
        {
          t: 'table',
          head: ['Response', 'Works when', 'Main risk'],
          rows: [
            ['Match (price or feature)', 'Customers choose mainly on that attribute and we have a cost advantage', 'Margin loss for everyone; a price war'],
            ['Differentiate', 'Some customers value what the rival cannot easily copy: service, quality, convenience', 'Investment that customers do not value enough'],
            ['Focus on a niche', 'The rival targets one segment and others stay loyal to us', 'Giving up volume that funds fixed costs'],
            ['Partner or acquire', 'A capability gap would take too long to build', 'Price paid and integration'],
            ['Hold steady', 'The threat is small, slow or likely to fail on its own', 'Underestimating a rival until it is too late'],
          ],
        },
      ],
    },
    {
      id: 'questions',
      h: 'What questions should you ask in a competitive response case?',
      blocks: [
        {
          t: 'ul',
          items: [
            'What exactly did the competitor do, and when?',
            'Which of our customers, products and locations overlap with the move?',
            'Why would customers switch: price, convenience, quality, novelty?',
            'What are the competitor\'s economics? Can it sustain the move?',
            'What have we already seen: early churn, price requests from customers?',
          ],
        },
      ],
    },
    {
      id: 'rival',
      h: 'How do you predict the competitor\'s next move?',
      blocks: [
        {
          t: 'p',
          md: 'Put yourself in the rival\'s position. What is its goal (share, profit, a foothold)? What are its costs and constraints? How would it react to each of your options? A simple payoff table, your options against its likely responses, often shows that the aggressive move invites a price war nobody wins.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common competitive response mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Reacting before sizing** how much business is actually at risk.',
            '**Assuming the rival will not respond** to your response.',
            '**Matching by reflex,** which often transfers margin to customers.',
            '**Ignoring segments:** the threat usually hits some customers far harder than others.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Should a company match a competitor\'s price cut?',
      a: 'Only if the volume it protects is worth more than the margin it gives up, and customers really choose on price. Differentiating or focusing on less price-sensitive segments is often cheaper.',
    },
    {
      q: 'What is game theory in a case interview?',
      a: 'Thinking through how a rival will react to each of your options, often with a simple payoff table, so your choice holds up after their counter-move.',
    },
  ],
  practice: { caseTypes: ['competitive strategy'] },
  related: ['pricing-strategy-framework', 'business-frameworks', 'growth-strategy-framework', 'pyramid-principle'],
  keywords: ['competitive response case', 'competitive strategy case interview', 'new entrant case', 'price war case', 'how to respond to a competitor'],
  published: D,
  modified: D,
};

export const CLASSIC_FRAMEWORKS: LearnPage = {
  slug: 'business-frameworks',
  cluster: 'frameworks',
  nav: 'Classic frameworks',
  title: 'Business frameworks explained: Porter\'s Five Forces, SWOT, 4Ps and more',
  metaTitle: 'Business Frameworks Explained: 10 Classic Models',
  description:
    'Porter\'s Five Forces, the 3Cs, 4Ps, SWOT, PESTEL, Ansoff, BCG matrix, value chain, McKinsey 7S and jobs to be done: what each is for and how to use it well.',
  ogKind: 'framework',
  eyebrow: 'Case frameworks',
  answer:
    'Business frameworks are reusable checklists for analyzing a situation: Porter\'s Five Forces for industry attractiveness, the 3Cs for strategy, the 4Ps for marketing, SWOT for a quick position check, and others. Use them as starting points that make your thinking complete, then tailor the buckets to the specific problem instead of reciting them.',
  takeaways: [
    '**Frameworks are scaffolding, not answers.** Tailor every bucket to the case.',
    '**Pick by question:** industry (Five Forces), market entry (3Cs), marketing (4Ps), growth (Ansoff).',
    '**Most are MECE-ish,** not perfectly MECE. Check overlaps before using one.',
    '**Name the framework only if it helps.** Interviewers care about the content.',
  ],
  sections: [
    {
      id: 'overview',
      h: 'Which business framework should you use?',
      blocks: [
        {
          t: 'table',
          head: ['Framework', 'Use it to', 'Origin'],
          rows: [
            ['Porter\'s Five Forces', 'Judge how attractive an industry is', 'Michael Porter, Harvard Business Review, 1979'],
            ['3Cs', 'Frame a strategy around customers, competitors and the company', 'Kenichi Ohmae, The Mind of the Strategist, 1982'],
            ['4Ps (marketing mix)', 'Design or diagnose a marketing plan', 'E. Jerome McCarthy, 1960'],
            ['SWOT', 'Summarize strengths, weaknesses, opportunities and threats', 'Widely used since the 1960s; origin debated'],
            ['PESTEL', 'Scan the external environment', 'Grew from Francis Aguilar\'s environmental scanning work, 1967'],
            ['Ansoff matrix', 'Rank growth options by risk', 'Igor Ansoff, Harvard Business Review, 1957'],
            ['BCG growth-share matrix', 'Balance a portfolio of businesses', 'Bruce Henderson, Boston Consulting Group, 1970'],
            ['Value chain', 'Find where a company creates value or cost', 'Michael Porter, Competitive Advantage, 1985'],
            ['McKinsey 7S', 'Diagnose organizational alignment', 'Tom Peters and Robert Waterman with colleagues, around 1980'],
            ['Jobs to be done', 'Understand why customers buy', 'Popularized by Clayton Christensen'],
          ],
        },
      ],
    },
    {
      id: 'five-forces',
      h: 'What is Porter\'s Five Forces?',
      blocks: [
        {
          t: 'p',
          md: 'Five Forces explains why some industries are more profitable than others by looking at the pressure from five directions: **rivalry** among existing competitors, the **threat of new entrants**, the **bargaining power of buyers**, the **bargaining power of suppliers**, and the **threat of substitutes**. Use it in market entry and M&A cases to judge whether an industry can sustain good margins. For example, US airlines face intense rivalry, powerful suppliers (aircraft and engine makers) and price-comparing buyers, which helps explain why their margins have historically been thin.',
        },
      ],
    },
    {
      id: '3cs',
      h: 'What are the 3Cs?',
      blocks: [
        {
          t: 'p',
          md: 'The 3Cs frame strategy around the **customer** (needs, segments, willingness to pay), the **competitors** (who they are, how they win) and the **company** (capabilities, costs, brand). A strategy works where the company can meet customer needs better than competitors. It is a solid first structure for market entry or new product questions.',
        },
      ],
    },
    {
      id: '4ps',
      h: 'What are the 4Ps of marketing?',
      blocks: [
        {
          t: 'p',
          md: '**Product** (what you sell), **price** (what you charge), **place** (where and how customers buy) and **promotion** (how you communicate). Use them to diagnose why sales are weak or to plan a launch. They overlap with go-to-market thinking; see the [go-to-market framework](/us/learn/go-to-market-framework).',
        },
      ],
    },
    {
      id: 'swot',
      h: 'Is SWOT useful in a case interview?',
      blocks: [
        {
          t: 'p',
          md: 'Rarely as the main structure. SWOT lists internal **strengths** and **weaknesses** and external **opportunities** and **threats**, but it does not tell you what to do, and items often fit more than one box. It works as a closing summary or a quick sanity check, not as the way to crack a case.',
        },
      ],
    },
    {
      id: 'bcg',
      h: 'What is the BCG growth-share matrix?',
      blocks: [
        {
          t: 'p',
          md: 'It plots each business unit by market growth and relative market share. **Stars** (high growth, high share) deserve investment. **Cash cows** (low growth, high share) fund others. **Question marks** (high growth, low share) need a decision. **Dogs** (low growth, low share; Henderson originally called them pets) are candidates for exit. It is most useful in portfolio questions, such as which divisions a conglomerate should keep.',
        },
      ],
    },
    {
      id: 'value-chain',
      h: 'What is the value chain?',
      blocks: [
        {
          t: 'p',
          md: 'Porter\'s value chain splits a company into **primary activities** (inbound logistics, operations, outbound logistics, marketing and sales, service) and **support activities** (infrastructure, HR, technology, procurement). Use it to locate where costs sit or where a company differentiates. It is a good MECE skeleton for cost reduction and operations cases.',
        },
      ],
    },
    {
      id: '7s-jtbd',
      h: 'When do the McKinsey 7S and jobs to be done help?',
      blocks: [
        {
          t: 'p',
          md: 'The **7S** model checks whether strategy, structure, systems, shared values, style, staff and skills are aligned. It is useful for reorganizations, mergers and HR cases. **Jobs to be done** asks what "job" a customer hires a product to do, such as a commuter "hiring" a coffee to stay alert. It is useful for product and marketing questions where customer motivation is the real issue.',
        },
      ],
    },
    {
      id: 'misuse',
      h: 'When should you not use a framework?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**When it does not fit the question.** Five Forces does not diagnose a falling margin at one store.',
            '**When you would recite it by name** without tailoring the buckets. Interviewers see this constantly.',
            '**When an equation exists.** If profit = revenue − costs answers the question, use that; it is MECE by construction.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What are the most important business frameworks for case interviews?',
      a: 'The profitability tree, the market entry framework and market sizing come up most. Of the classic models, Porter\'s Five Forces, the 3Cs, the 4Ps and the Ansoff matrix are the most useful, as starting points to tailor.',
    },
    {
      q: 'Should I memorize frameworks for consulting interviews?',
      a: 'Learn them well enough to know what each covers, then build case-specific structures. Reciting a memorized framework is one of the most common reasons structures score poorly.',
    },
  ],
  practice: { caseCodes: ['US-C-20', 'US-C-37', 'US-C-14'] },
  related: ['growth-strategy-framework', 'market-entry-framework', 'competitive-response-framework', 'marketing-case-interview'],
  sources: [
    {
      label: 'Michael E. Porter, "How Competitive Forces Shape Strategy", Harvard Business Review (1979)',
      url: 'https://hbr.org/1979/03/how-competitive-forces-shape-strategy',
      note: 'The original Five Forces article.',
    },
    {
      label: 'Ansoff matrix (Wikipedia), citing H. Igor Ansoff, "Strategies for Diversification", Harvard Business Review, Sept–Oct 1957',
      url: 'https://en.wikipedia.org/wiki/Ansoff_matrix',
      note: 'The product-market growth matrix.',
    },
    {
      label: 'Boston Consulting Group, "The Product Portfolio" (Bruce Henderson, 1970)',
      url: 'https://www.bcg.com/publications/1970/strategy-the-product-portfolio',
      note: 'The original growth-share matrix essay.',
    },
  ],
  keywords: ['business frameworks', 'Porter\'s Five Forces', '3Cs framework', '4Ps of marketing', 'SWOT analysis', 'BCG matrix', 'value chain', 'McKinsey 7S', 'consulting frameworks'],
  published: D,
  modified: D,
};

export const FRAMEWORKS: LearnPage[] = [
  PROFITABILITY,
  MARKET_ENTRY,
  PRICING,
  GROWTH,
  MNA,
  GTM,
  COST_REDUCTION,
  OPERATIONS,
  COMPETITIVE_RESPONSE,
  CLASSIC_FRAMEWORKS,
];
