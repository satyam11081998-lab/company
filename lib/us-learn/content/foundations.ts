import type { LearnPage } from '../types';
import { US_ANCHORS } from '../us-data';

/**
 * Foundations: the ideas every other Learn page builds on.
 * All companies in examples are fictional; all example numbers are
 * illustrative unless a source is given.
 */

const D = '2026-09-27';

export const WHAT_IS_MECE: LearnPage = {
  slug: 'what-is-mece',
  cluster: 'foundations',
  nav: 'What is MECE',
  title: 'What is MECE? The principle behind structured problem solving',
  metaTitle: 'What Is MECE? Mutually Exclusive, Collectively Exhaustive',
  description:
    'MECE means Mutually Exclusive, Collectively Exhaustive: split a problem into parts with no overlaps and no gaps. Meaning, examples, tests and mistakes.',
  ogKind: 'concept',
  eyebrow: 'Foundations',
  answer:
    'MECE stands for Mutually Exclusive, Collectively Exhaustive. It is a rule for breaking a problem into parts that do not overlap (mutually exclusive) and that together cover every possibility (collectively exhaustive). Barbara Minto named it at McKinsey in the late 1960s. Consultants and managers use it to structure analyses and recommendations.',
  takeaways: [
    '**No overlaps, no gaps.** Every item belongs in exactly one bucket, and every item has a bucket.',
    '**MECE is a test, not a framework.** A profitability tree or the 4Ps has to pass it.',
    '**Some splits are MECE by construction:** an equation, a process, one dimension at a time, or "X vs. not X".',
    '**An "Other" bucket closes gaps.** Use it, but keep it small.',
    '**MECE is necessary, not sufficient.** The buckets also have to matter to the decision.',
  ],
  sections: [
    {
      id: 'meaning',
      h: 'What does MECE stand for?',
      blocks: [
        {
          t: 'p',
          md: 'MECE stands for **Mutually Exclusive, Collectively Exhaustive**. Mutually exclusive means no item can sit in two categories at once. Collectively exhaustive means the categories, taken together, leave nothing out. When a split passes both tests you can add up the parts and get the whole, with no double counting and no missing piece.',
        },
        {
          t: 'table',
          head: ['Test', 'The question to ask', 'A split that fails it'],
          rows: [
            ['Mutually exclusive', 'Could one item land in two buckets?', 'Customers split into "young adults" and "students": a 22-year-old student is both'],
            ['Collectively exhaustive', 'Is anything left without a bucket?', 'Revenue split into "stores" and "website" when the company also sells wholesale'],
          ],
        },
        {
          t: 'p',
          md: 'Most people say it **"mee-see"**. Barbara Minto, who named it, says it as one syllable, **"meece"**, to rhyme with niece.',
        },
      ],
    },
    {
      id: 'origin',
      h: 'Who invented MECE?',
      blocks: [
        {
          t: 'p',
          md: 'Barbara Minto named MECE while editing reports in McKinsey\'s London office in the late 1960s and early 1970s, and it became the structural rule underneath her book **The Pyramid Principle**. She does not claim the logic itself. In her words, "it was Aristotle, but I was the first one to abbreviate it and apply it to analyzing groups of ideas."',
        },
        {
          t: 'p',
          md: 'The same two rules appear elsewhere too. The Indian librarian S. R. Ranganathan set out canons of exhaustiveness and exclusiveness for library classification in the 1930s. What Minto added was a short name and a place at the center of business problem solving.',
        },
      ],
    },
    {
      id: 'example',
      h: 'What does a MECE breakdown look like?',
      blocks: [
        {
          t: 'p',
          md: 'Take a common question: **why did a Midwest grocery chain\'s profit fall?** (The chain is fictional.) Profit is revenue minus costs, so an equation gives you a MECE first split. Then each branch splits again, one dimension at a time.',
        },
        {
          t: 'tree',
          root: 'Why did the grocery chain\'s profit fall?',
          branches: [
            { label: 'Revenue', leaves: ['Number of transactions', 'Average basket size ($)'] },
            {
              label: 'Costs',
              leaves: ['Cost of goods sold', 'Store labor', 'Occupancy (rent, utilities)', 'Everything else (marketing, shrink, overhead)'],
            },
          ],
          caption: 'Revenue = transactions × average basket. Every dollar of change lands in exactly one box.',
        },
        {
          t: 'p',
          md: 'Every dollar of the profit change lands in exactly one box, and the boxes add back to the total. That is what makes the tree MECE, and it is also what lets you size each branch with numbers instead of guessing which one matters.',
        },
      ],
    },
    {
      id: 'how-to',
      h: 'How do you make a split MECE?',
      blocks: [
        {
          t: 'p',
          md: 'The fastest way is to use a kind of split that cannot overlap or leave gaps. Five kinds cover almost every business problem:',
        },
        {
          t: 'steps',
          items: [
            { title: 'Use an equation', md: 'Profit = revenue − costs. Revenue = customers × purchases per customer × average price. Math cannot double count or skip a term.' },
            { title: 'Follow a process', md: 'Split by the steps things go through: a customer journey (aware → consider → buy → use → renew) or an operation (order → pick → pack → ship).' },
            { title: 'Segment on one dimension at a time', md: 'By region, by product line or by customer type, but never two dimensions in the same list. Go one level deeper for the second dimension.' },
            { title: 'Use opposites', md: 'Internal vs. external. New vs. existing customers. Fixed vs. variable costs. "X vs. not X" is MECE by definition.' },
            { title: 'Start from a proven framework', md: 'Use a standard structure such as a profitability tree as a skeleton, then check it against the case and cut what does not apply.' },
          ],
        },
      ],
    },
    {
      id: 'test',
      h: 'How do you check whether a structure is MECE?',
      blocks: [
        { t: 'p', md: 'Run five quick tests before you present a structure:' },
        {
          t: 'ol',
          items: [
            '**Overlap test.** Pick three real items, such as a customer, a cost line or a product, and place each one. If any fits two buckets, the buckets overlap.',
            '**Gap test.** Ask "what else could it be?" If you can name something with no home, add a bucket or an "Other".',
            '**Sum test.** If the buckets are numbers, do they add up to the total? If not, something is double counted or missing.',
            '**Same-level test.** Are the buckets the same kind of thing? "Northeast, South, West, online" mixes geography with channel.',
            '**Relevance test.** Would the answer change if this bucket turned out to be big? If not, fold it into "Other".',
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common MECE mistakes?',
      blocks: [
        {
          t: 'table',
          head: ['Mistake', 'Example', 'Fix'],
          rows: [
            ['Mixing dimensions', 'Segments: millennials, urban customers, loyalty members', 'One dimension per level: age first, then location'],
            ['Hidden overlap', 'Costs: labor, overhead, store costs (store labor sits in two)', 'Define each bucket so every cost line has exactly one home'],
            ['A forgotten branch', 'Revenue split into in-store and e-commerce, missing wholesale and gift cards', 'Run the gap test against the company\'s real revenue lines'],
            ['A list, not a tree', 'Twelve bullet points at one level', 'Group them into three or four buckets, then go deeper'],
            ['MECE but useless', 'Customers split by birth month', 'Choose splits that drive the decision'],
          ],
        },
      ],
    },
    {
      id: 'interview',
      h: 'How is MECE used in a case interview?',
      blocks: [
        {
          t: 'p',
          md: 'Interviewers use MECE as a proxy for clear thinking. When you lay out your structure they check two things: could an issue fall between your buckets, and could two buckets double count? A MECE structure also makes the math easier later, because each branch can be sized and added.',
        },
        {
          t: 'dialogue',
          turns: [
            { who: 'Interviewer', md: 'Our client, a regional gym chain, has flat revenue for two years. How would you approach it?' },
            {
              who: 'Candidate',
              md: 'Revenue is members times revenue per member, so I would look at both. Members splits into new joins and cancellations. Revenue per member splits into membership fees and add-ons like personal training. My starting hypothesis is that new joins are being offset by cancellations, so I would check cancellations first. Does that match what you are seeing?',
            },
          ],
        },
        {
          t: 'p',
          md: 'The candidate did not list every idea they had. They used an equation (MECE by construction), split each side once more, and picked a branch to start with, with a reason. That is what interviewers mean by "structured".',
        },
      ],
    },
    {
      id: 'beyond-consulting',
      h: 'Is MECE only for consultants?',
      blocks: [
        {
          t: 'p',
          md: 'No. Anyone who breaks down a problem uses it, whether they call it MECE or not. A sales manager who splits a missed quota into pipeline, win rate and deal size is being MECE. So is an HR lead who splits attrition into voluntary and involuntary exits.',
        },
        {
          t: 'table',
          head: ['Role', 'A MECE split that role uses'],
          rows: [
            ['Sales', 'Bookings = opportunities × win rate × average deal size'],
            ['Marketing', 'New customers by channel: paid, organic, referral, partner, other'],
            ['Operations', 'Order cycle time = pick + pack + wait + ship'],
            ['HR', 'Change in headcount = hires − voluntary exits − involuntary exits'],
            ['Product', 'Sign-ups = visitors × start rate × completion rate'],
            ['Finance', 'Revenue variance = price effect + volume effect + mix effect'],
          ],
        },
      ],
    },
    {
      id: 'limits',
      h: 'What are the limits of MECE?',
      blocks: [
        {
          t: 'p',
          md: 'MECE guarantees that nothing is missed. It does not guarantee that what you included matters. Critics such as Tim van Gelder point out that a structure can be perfectly MECE and still useless. Real problems also have causes that interact: a price cut changes volume. So treat MECE as a way to organize analysis, not as a claim that causes are independent. In a live interview, aim for a structure that is MECE enough to be complete and specific enough to be useful.',
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Is MECE a framework?',
      a: 'No. MECE is a principle: a quality test that any framework has to pass. Profitability trees, the 4Ps and Porter\'s Five Forces are frameworks. MECE is how you check that they are built without overlaps or gaps.',
    },
    {
      q: 'How do you pronounce MECE?',
      a: 'Most people say "mee-see". Barbara Minto, who coined the term at McKinsey, pronounces it as one syllable, "meece", rhyming with niece.',
    },
    {
      q: 'Is it OK to use an "Other" bucket?',
      a: 'Yes. An "Other" bucket is the quickest way to make a list collectively exhaustive. Keep it small. If "Other" is your biggest bucket, the split is wrong.',
    },
    {
      q: 'What is the difference between MECE and an issue tree?',
      a: 'An issue tree is the picture: a question broken into branches. MECE is the rule each level of the tree has to follow. A good issue tree is MECE at every level.',
    },
    {
      q: 'Is this site related to the MECE principle?',
      a: 'MECE (mece.in) is an AI practice platform for case interviews and business problem solving, named after the principle. It is not affiliated with McKinsey or any consulting firm.',
    },
  ],
  practice: { caseCodes: ['US-C-01', 'US-C-05', 'US-C-08'] },
  related: ['issue-trees', 'case-interview', 'profitability-framework', 'pyramid-principle'],
  sources: [
    {
      label: 'Barbara Minto: "MECE: I invented it, so I get to say how to pronounce it" (McKinsey Alumni Center)',
      url: 'https://www.mckinsey.com/alumni/news-and-insights/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it',
      note: 'Origin in McKinsey\'s London office, the "meece" pronunciation, and the Aristotle quote.',
    },
    {
      label: 'MECE principle (Wikipedia)',
      url: 'https://en.wikipedia.org/wiki/MECE_principle',
      note: 'Neutral reference, including criticism and the link to Ranganathan\'s canons.',
    },
    {
      label: 'Tim van Gelder, "What is MECE, and is it MECE?"',
      url: 'https://timvangelder.com/2010/06/04/what-is-mece-and-is-it-mece/',
      note: 'The best-known critique: complete is not the same as relevant.',
    },
  ],
  keywords: ['MECE', 'what is MECE', 'MECE principle', 'mutually exclusive collectively exhaustive', 'MECE examples', 'MECE meaning', 'how to be MECE'],
  published: D,
  modified: D,
  indiaTwin: '/learn/mece-framework',
};

export const CASE_INTERVIEW: LearnPage = {
  slug: 'case-interview',
  cluster: 'foundations',
  nav: 'The case interview',
  title: 'Case interviews: how they work and how to prepare',
  metaTitle: 'Case Interview Guide: Format, Method and Practice (2026)',
  description:
    'How case interviews work in consulting and business roles: case types, interviewer-led vs candidate-led formats, a step-by-step method, scoring and practice.',
  ogKind: 'toolkit',
  eyebrow: 'Foundations',
  answer:
    'A case interview is a 20–40 minute business problem you solve out loud with an interviewer. You clarify the question, lay out a structure, analyze data and do the math, then recommend what the client should do. Consulting firms and many strategy, product and operations teams use cases to see how you think under pressure.',
  takeaways: [
    '**Interviewers score how you think,** not whether you reach one right answer.',
    '**The core loop is clarify, structure, analyze, recommend.** It works for every case type.',
    '**There are two formats:** interviewer-led, where you answer a set of questions, and candidate-led, where you drive.',
    '**Practice out loud, with feedback.** Reading cases builds recognition, not skill.',
    '**The method carries over** to product, sales, marketing, operations, HR and finance interviews.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is a case interview?',
      blocks: [
        {
          t: 'p',
          md: 'A case interview is a simplified, realistic business problem that you work through with the interviewer. The interviewer holds the facts and hands them out when you ask the right questions. Your job is to show how you would think through the problem, not to know the answer in advance.',
        },
        {
          t: 'p',
          md: 'Cases are best known from management consulting: the strategy firms, the consulting arms of the Big Four accounting firms, and boutiques. They are also common for in-house strategy, corporate development, product management, business operations and some marketing, sales-leadership and HR business-partner roles. See the [role guides](/us/learn#roles) for how each one uses them.',
        },
      ],
    },
    {
      id: 'types',
      h: 'What types of case interviews are there?',
      blocks: [
        { t: 'p', md: 'Most cases are one of ten types. Each links to a full practice case from MECE\'s US bank.' },
        {
          t: 'table',
          head: ['Type', 'The core question', 'Practice example'],
          rows: [
            ['Profitability', 'Why are profits down, and how do we fix it?', '[A Midwest grocery chain\'s margins have nearly halved](/us/case-interview-examples#midwest-grocery-margins)'],
            ['Market entry', 'Should we enter this market, and how?', '[A Canadian coffee chain eyes the US Northeast](/us/case-interview-examples#canadian-coffee-chain-northeast)'],
            ['M&A and private equity', 'Should we buy this company?', '[A private equity fund weighs a Sun Belt HVAC roll-up](/us/case-interview-examples#private-equity-hvac-rollup)'],
            ['Pricing', 'What should we charge?', '[Should a streaming service launch a cheaper ad-supported tier?](/us/case-interview-examples#streaming-ad-tier-pricing)'],
            ['Growth', 'How do we grow revenue?', '[A Texas gym chain wants to double revenue in five years](/us/case-interview-examples#texas-gym-chain-double-revenue)'],
            ['Operations', 'Why is this process slow or costly?', '[An e-commerce warehouse keeps missing same-day cutoffs](/us/case-interview-examples#nj-warehouse-missed-cutoffs)'],
            ['Cost reduction', 'Where can we cut costs?', '[An auto and home insurer must cut operating costs by 15%](/us/case-interview-examples#insurer-cut-costs-15-percent)'],
            ['Go-to-market', 'How do we launch or scale this?', '[Taking a California EV home-charger installer national](/us/case-interview-examples#ev-charger-installer-national)'],
            ['Competitive response', 'A rival moved. What do we do?', '[A Pacific Northwest hardware chain faces a big-box entrant](/us/case-interview-examples#hardware-chain-big-box-threat)'],
            ['Market sizing', 'How big is this?', '[How many gas stations are there in the United States?](/us/market-sizing-questions#gas-stations-in-the-us)'],
          ],
        },
      ],
    },
    {
      id: 'formats',
      h: 'What is the difference between interviewer-led and candidate-led cases?',
      blocks: [
        {
          t: 'p',
          md: 'In an **interviewer-led** case, the interviewer walks you through a fixed set of questions: lay out a structure, read this chart, run this calculation, give a recommendation. McKinsey is best known for this style. In a **candidate-led** case, you decide what to analyze next and ask for the data you need. It is common at BCG, Bain and many other firms. Styles vary by office and by interviewer, so prepare for both.',
        },
        {
          t: 'table',
          head: ['', 'Interviewer-led', 'Candidate-led'],
          rows: [
            ['Who steers', 'The interviewer, question by question', 'You'],
            ['What gets tested hardest', 'Depth on each question, speed, precision', 'Judgment about what to look at next'],
            ['Common trap', 'Answering the question asked without saying what it means', 'Wandering: analyzing branches that cannot change the answer'],
          ],
        },
      ],
    },
    {
      id: 'method',
      h: 'How do you solve a case interview step by step?',
      blocks: [
        {
          t: 'steps',
          items: [
            {
              title: 'Clarify (1–2 minutes)',
              md: 'Repeat the question in your own words. Confirm the objective (profit, market share, growth?), the timeframe and any constraints. Ask about anything you genuinely do not understand, like the business model. Do not ask for data you do not need yet.',
            },
            {
              title: 'Structure (2–3 minutes)',
              md: 'Ask for a moment, then present a MECE structure with three or four branches tailored to this case. Walk through it top-down and say which branch you would start with and why.',
            },
            {
              title: 'Analyze (15–25 minutes)',
              md: 'Work branch by branch. Ask for data, do the math out loud, and after every number say what it means for the client. Update your hypothesis as facts come in.',
            },
            {
              title: 'Recommend (1–2 minutes)',
              md: 'Lead with the answer, give two or three reasons with numbers, then name the risks and next steps. Use the [Pyramid Principle](/us/learn/pyramid-principle): answer first, support second.',
            },
          ],
        },
      ],
    },
    {
      id: 'scoring',
      h: 'What do interviewers score in a case interview?',
      blocks: [
        {
          t: 'p',
          md: 'Firms do not publish their rubrics, but they assess the same core skills. MECE scores every practice attempt out of 100 on six dimensions that mirror them:',
        },
        {
          t: 'table',
          head: ['Dimension', 'Weight on MECE', 'What strong looks like'],
          rows: [
            ['Structure', '25', 'A MECE, case-specific structure; clear priorities'],
            ['Quantitative skills', '20', 'Correct math, sensible rounding, a "so what" after each number'],
            ['Synthesis and communication', '20', 'Answer-first recommendation, concise and organized'],
            ['Business judgment', '15', 'Realistic assumptions; spots what actually drives the business'],
            ['Creativity', '10', 'Ideas beyond the textbook, grounded in the facts'],
            ['Presence', '10', 'Calm, confident, coachable when pushed back on'],
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'What does a strong case opening sound like?',
      blocks: [
        {
          t: 'p',
          md: 'Here is the first two minutes of a fictional case, showing clarification and a structure.',
        },
        {
          t: 'dialogue',
          turns: [
            { who: 'Interviewer', md: 'Our client runs bike-share in a large US city. It lost money last year for the first time. What would you look at?' },
            { who: 'Candidate', md: 'Before I structure it: is the goal to get back to break-even, or to a specific profit target? And is the loss driven by the whole network or particular parts of the city?' },
            { who: 'Interviewer', md: 'Break-even within two years. We don\'t know where it comes from yet.' },
            {
              who: 'Candidate',
              md: 'Then I would split profit into revenue and costs. Revenue is rides times revenue per ride, plus memberships. Costs split into fleet costs (bikes, repairs, charging for e-bikes), rebalancing trucks and staff, and fixed costs like dock leases. Since this is the first loss, my hypothesis is a recent change, maybe more e-bikes pushing up charging and repair costs. I would start by comparing costs per ride this year and last. Can we look at that?',
            },
          ],
        },
      ],
    },
    {
      id: 'prep',
      h: 'How should you prepare for case interviews?',
      blocks: [
        { t: 'p', md: 'A four-week plan works for most people who already know basic business concepts. Adjust it to your weakest dimension.' },
        {
          t: 'table',
          head: ['Week', 'Focus', 'Do this'],
          rows: [
            ['1', 'The method and the core frameworks', 'Read the [profitability](/us/learn/profitability-framework) and [market entry](/us/learn/market-entry-framework) guides. Solve three cases out loud, untimed.'],
            ['2', 'Math and market sizing', 'Ten minutes of [case math](/us/learn/case-interview-math) drills every day. Two [market sizing questions](/us/market-sizing-questions) a day. Four full cases.'],
            ['3', 'Feedback on weak spots', 'Six to eight live cases with feedback. Track which dimension scores lowest and drill it.'],
            ['4', 'Interview conditions', 'Full timed mocks, a recommendation drill after every case, and your behavioral stories.'],
          ],
        },
        {
          t: 'callout',
          tone: 'tip',
          title: 'Track progress, not case count',
          md: 'The number of cases you have done matters less than whether your weakest dimension is improving. Stop when your structure and math hold up under pushback three cases in a row.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common case interview mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Reciting a memorized framework** instead of building one for this client. Interviewers notice.',
            '**Asking for data without a reason.** Say what you expect it to show and why it matters.',
            '**Doing math silently.** Talk through your approach so the interviewer can follow and correct you.',
            '**Reporting numbers without a "so what".** "Costs rose 12%" is data. "Costs rose 12%, which explains most of the lost profit" is insight.',
            '**Ending with a summary instead of a recommendation.** Commit to an answer, even with caveats.',
          ],
        },
      ],
    },
    {
      id: 'beyond-consulting',
      h: 'Do non-consulting roles use case interviews?',
      blocks: [
        {
          t: 'p',
          md: 'Yes. The format changes but the skill is the same. Product managers get estimation and metric-diagnosis questions. Sales leaders get territory and quota problems. HR leaders get attrition and workforce-planning cases. Finance roles get variance and business-case questions. Start with the guide for your role:',
        },
        {
          t: 'ul',
          items: [
            '[Product manager case interviews](/us/learn/product-manager-case-interview)',
            '[Sales case interviews](/us/learn/sales-case-interview)',
            '[Marketing case interviews](/us/learn/marketing-case-interview)',
            '[HR case interviews](/us/learn/hr-case-interview)',
            '[Strategy and operations interviews](/us/learn/strategy-and-operations-interview)',
            '[Finance case interviews](/us/learn/finance-case-interview)',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'How long is a case interview?',
      a: 'The case itself usually runs 20 to 40 minutes, inside an interview slot of about 45 to 60 minutes that often includes behavioral questions too.',
    },
    {
      q: 'Can you use a calculator in a case interview?',
      a: 'Usually not in live consulting interviews: you do the math by hand or in your head, so practice arithmetic until it is comfortable. Online assessments and some non-consulting interviews have different rules, so ask your recruiter.',
    },
    {
      q: 'Is there a right answer to a case interview?',
      a: 'Usually several answers are defensible. Interviewers reward a clear recommendation supported by the analysis more than a particular conclusion.',
    },
    {
      q: 'Can I practice case interviews alone?',
      a: 'Yes. Solve cases out loud and time yourself, or use an AI interviewer like MECE\'s, which answers clarifying questions, pushes back and scores you on six dimensions. A human partner is still useful for delivery and presence.',
    },
  ],
  practice: { caseCodes: ['US-C-02', 'US-C-05', 'US-C-06', 'US-C-18'] },
  related: ['what-is-mece', 'profitability-framework', 'market-sizing', 'case-interview-math', 'pyramid-principle'],
  keywords: ['case interview', 'case interview prep', 'how to prepare for a case interview', 'consulting case interview', 'case interview format', 'interviewer-led vs candidate-led case'],
  published: D,
  modified: D,
};

export const ISSUE_TREES: LearnPage = {
  slug: 'issue-trees',
  cluster: 'foundations',
  nav: 'Issue trees',
  title: 'Issue trees: how to break down any business problem',
  metaTitle: 'Issue Trees: How to Structure Any Business Problem',
  description:
    'An issue tree breaks one question into MECE branches you can analyze one at a time. How to build diagnostic, solution and hypothesis trees, with examples.',
  ogKind: 'concept',
  eyebrow: 'Foundations',
  answer:
    'An issue tree is a diagram that breaks one business question into smaller questions, level by level, so each branch can be analyzed on its own. Every level should be MECE: no overlaps and no gaps. Diagnostic trees ask why something happened. Solution trees ask how to fix it or reach a goal.',
  takeaways: [
    '**Start from one precise question,** not a topic. "Why did revenue fall 12% this year?" beats "revenue".',
    '**Diagnostic trees find causes; solution trees generate options.** Know which one you are drawing.',
    '**Each level is MECE.** Three or four branches per level is plenty.',
    '**Stop splitting when a leaf is testable** with data you could actually get.',
    '**Lead with a hypothesis** and test the most likely branch first.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is an issue tree?',
      blocks: [
        {
          t: 'p',
          md: 'An issue tree starts with one question on the left (or top) and splits it into sub-questions that together fully answer it. Each sub-question splits again until the ends of the branches are things you can check. Consultants draw one at the start of almost every problem, because it turns a vague worry into a work plan.',
        },
        {
          t: 'tree',
          root: 'Why did a meal-kit company\'s revenue fall 12%?',
          branches: [
            { label: 'Number of orders', leaves: ['Orders from new subscribers', 'Orders from existing subscribers (retention × order frequency)'] },
            { label: 'Revenue per order', leaves: ['List price', 'Discounts and promotions', 'Mix of meal plans'] },
          ],
          caption: 'A diagnostic tree built from an equation: revenue = orders × revenue per order. (Fictional company.)',
        },
      ],
    },
    {
      id: 'types',
      h: 'What is the difference between a diagnostic and a solution issue tree?',
      blocks: [
        {
          t: 'table',
          head: ['', 'Diagnostic tree', 'Solution tree'],
          rows: [
            ['Question type', 'Why? ("Why did margin fall?")', 'How? ("How can we raise margin 3 points?")'],
            ['Branches are', 'Possible causes', 'Possible actions'],
            ['Best first split', 'An equation or process that must explain the change', 'Levers the client controls'],
            ['You are done when', 'Data confirms or rules out each cause', 'Options are sized and ranked'],
          ],
        },
        {
          t: 'tree',
          root: 'How can a regional airline raise profit per flight?',
          branches: [
            { label: 'Raise revenue per flight', leaves: ['Fill more seats', 'Raise the average fare', 'Sell more extras (bags, seat selection)'] },
            { label: 'Cut cost per flight', leaves: ['Fuel', 'Crew', 'Airport fees and maintenance', 'Overhead'] },
          ],
          caption: 'A solution tree: every leaf is an action the airline could take. (Fictional airline.)',
        },
      ],
    },
    {
      id: 'build',
      h: 'How do you build an issue tree?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Write the key question', md: 'Make it specific and measurable: what, how much, by when. "How can the chain restore a 10% operating margin within two years?"' },
            { title: 'Pick the first split', md: 'Use an equation or a process if one exists. They are MECE by construction. Otherwise use opposites or a single segmentation dimension.' },
            { title: 'Split each branch again', md: 'Keep going until each leaf is something you can test with data you could realistically get.' },
            { title: 'Check every level', md: 'Run the overlap, gap and sum tests on each level. See [What is MECE](/us/learn/what-is-mece).' },
            { title: 'Prioritize with a hypothesis', md: 'Say which branch you think explains most of the problem, and why. Test it first.' },
            { title: 'Turn leaves into analyses', md: 'For each leaf, write the data you need and what result would prove or disprove it.' },
          ],
        },
      ],
    },
    {
      id: 'hypothesis',
      h: 'What is a hypothesis-driven issue tree?',
      blocks: [
        {
          t: 'p',
          md: 'A hypothesis tree starts from your best guess at the answer and lists what would have to be true for it to hold. It is faster than exploring every branch, because you only test the conditions that matter. If one condition fails, you revise the hypothesis.',
        },
        {
          t: 'tree',
          root: 'Hypothesis: the meal-kit company should stop its 60%-off first box',
          branches: [
            { label: 'Discount customers churn much faster', leaves: ['Compare 90-day retention of discount vs. full-price cohorts'] },
            { label: 'Sign-ups will not fall more than churn savings', leaves: ['Test a smaller discount in two markets'] },
            { label: 'Competitors will not use it against us', leaves: ['Check rivals\' offers and how customers compare them'] },
          ],
          caption: 'Each branch is a condition that must be true. Each leaf is the test.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes make issue trees fail?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**A topic instead of a question** at the root, which gives you branches that describe rather than answer.',
            '**Mixing causes and actions** in the same tree.',
            '**Too many branches** at one level. Group seven ideas into three buckets.',
            '**Branches that overlap,** so the same cost or customer shows up twice.',
            '**Stopping too early.** "Operations" is not testable; "pick rate per worker-hour" is.',
          ],
        },
      ],
    },
    {
      id: 'at-work',
      h: 'When should you use an issue tree outside interviews?',
      blocks: [
        {
          t: 'p',
          md: 'Any time a problem is fuzzy or a team disagrees about where to look. Issue trees scope projects, split work across people without overlap, structure root-cause reviews after an incident, and organize a memo before you write it. A tree on one page is also a fast way to get a manager to agree on what you will and will not analyze.',
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between an issue tree, a logic tree and a driver tree?',
      a: 'They are close cousins. Logic tree is the general term. A driver tree is a numeric version where branches add or multiply (revenue = price × volume). An issue tree is the question-based version consultants use to plan an analysis.',
    },
    {
      q: 'How many levels should an issue tree have?',
      a: 'Two or three levels in an interview. In a real project, keep going until each leaf is a specific analysis you can run.',
    },
    {
      q: 'Is an issue tree the same as a case framework?',
      a: 'A framework is a reusable starting tree, such as the profitability framework. An issue tree is the version you build for a specific question, often starting from a framework and then tailoring it.',
    },
  ],
  practice: { caseCodes: ['US-C-41', 'US-C-26', 'US-C-16'] },
  related: ['what-is-mece', 'profitability-framework', 'pyramid-principle', 'case-interview'],
  keywords: ['issue tree', 'issue tree example', 'logic tree', 'hypothesis tree', 'how to structure a problem', 'diagnostic issue tree'],
  published: D,
  modified: D,
};

const anchorRows = US_ANCHORS.map((a) => [
  a.label,
  a.value,
  a.derived ? `Derived: ${a.source.replace(/^Derived:\s*/, '')}` : `[${a.source}](${a.url}), ${a.asOf}`,
]);

export const MARKET_SIZING: LearnPage = {
  slug: 'market-sizing',
  cluster: 'foundations',
  nav: 'Market sizing',
  title: 'Market sizing questions: the method, US numbers and a worked example',
  metaTitle: 'Market Sizing Questions: Method, Example and US Numbers',
  description:
    'How to answer market sizing (guesstimate) questions: top-down vs bottom-up, a worked US example, sanity checks, and sourced US numbers to anchor your estimates.',
  ogKind: 'toolkit',
  eyebrow: 'Foundations',
  answer:
    'A market sizing question asks you to estimate a number you cannot look up, like how many coffee shops operate in the US. Clarify exactly what is being counted, pick a structure (top-down from population, or bottom-up from supply), put a number on every assumption, multiply through, then sanity-check the result against something you know.',
  takeaways: [
    '**Define the unit first:** units or dollars, per day or per year, which geography.',
    '**Top-down starts from people or households; bottom-up starts from supply** such as stores or capacity.',
    '**Say every assumption out loud** and round aggressively.',
    '**Always sanity-check** with a second method or a per-person figure.',
    '**Anchor on a few real numbers:** about 342 million people and 135 million households in the US.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is a market sizing question?',
      blocks: [
        {
          t: 'p',
          md: 'A market sizing question, also called a guesstimate or estimation question, asks for a number with no data given: how many, how much, how often. Consulting, product management, strategy and some finance interviews use them because they show, in five minutes, whether you can structure a problem, make reasonable assumptions and do clean math under pressure. The interviewer cares about your logic far more than the exact number.',
        },
      ],
    },
    {
      id: 'approaches',
      h: 'Should you use a top-down or bottom-up approach?',
      blocks: [
        {
          t: 'table',
          head: ['Approach', 'Starts from', 'Best for', 'Example'],
          rows: [
            ['Top-down (demand side)', 'Population or households, then narrow by segment and usage', 'Consumer products bought by many people', 'Pairs of jeans sold: people × share who buy × pairs per year'],
            ['Bottom-up (supply side)', 'Number of outlets or capacity × output per outlet', 'Services limited by capacity', 'Haircuts: salons × chairs × cuts per chair per day × days'],
          ],
        },
        {
          t: 'p',
          md: 'Choose the side where you have better anchors. Use the other side, briefly, as your sanity check.',
        },
      ],
    },
    {
      id: 'method',
      h: 'How do you answer a market sizing question step by step?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Clarify the scope', md: 'Units or revenue? New sales or the installed base? Which geography and time period? Write the definition down.' },
            { title: 'Lay out the structure', md: 'Say the equation before any numbers: "Market = adults × share who buy × purchases per year." Segment the biggest driver (by age, income or region).' },
            { title: 'Assume, out loud', md: 'Give each assumption a number and a one-line reason. Round to one or two significant figures.' },
            { title: 'Calculate', md: 'Multiply through step by step, keeping units attached. Say intermediate results.' },
            { title: 'Sanity-check', md: 'Compare against a per-person figure, a second method or a number you know.' },
            { title: 'Conclude', md: 'State the answer, the one or two assumptions that move it most, and what it means for the client.' },
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: how many pairs of jeans are sold in the US each year?',
      blocks: [
        {
          t: 'p',
          md: 'Scope: new pairs bought by US consumers in a year, all channels, all ages. We go top-down and segment by age, because children outgrow clothes and adults replace them. **Every assumption below is illustrative, chosen to show the method, not taken from industry data.**',
        },
        {
          t: 'math',
          title: 'Top-down estimate',
          lines: [
            'Adults: 342M people − 73M under 18 ≈ 269M adults',
            'Adults who buy jeans (assume 80%): 269M × 0.8 ≈ 215M',
            'Adult pairs (assume 1.5 a year): 215M × 1.5 ≈ 323M',
            'Children who wear jeans (assume 90%), buying 2 pairs a year as they outgrow them: 73M × 0.9 × 2 ≈ 131M',
            'Total: 323M + 131M ≈ 454M → about 450 million pairs a year',
          ],
        },
        {
          t: 'math',
          title: 'Sanity check',
          lines: [
            'Per person: 450M ÷ 342M ≈ 1.3 pairs per American per year',
            'In dollars (assume $45 average): 450M × $45 ≈ $20 billion a year',
          ],
        },
        {
          t: 'p',
          md: 'About one new pair a year for most people, and a bit more for growing children, feels right. The answer is most sensitive to the adult replacement rate: at one pair a year instead of 1.5, the total falls to about 346 million. Say that out loud. It shows the interviewer you know which assumption matters.',
        },
      ],
    },
    {
      id: 'us-numbers',
      h: 'Which US numbers should you know for market sizing?',
      blocks: [
        {
          t: 'p',
          md: 'You do not need many. These cover most US questions. Each is from a government or research source, with the date it describes.',
        },
        { t: 'table', head: ['Anchor', 'Value', 'Source'], rows: anchorRows },
        {
          t: 'callout',
          tone: 'tip',
          title: 'Round them for interviews',
          md: '340 million people. 135 million households. 2.5 people per household. Roughly 4 million people per year of age for most ages under 65 (about 3.6 million births a year, plus immigration). About 170 million people in the labor force. Median household income near $87,000.',
        },
      ],
    },
    {
      id: 'sanity',
      h: 'How do you sanity-check a market sizing answer?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Per person or per household.** Divide your total by 342 million people or 135 million households. Does the result feel plausible for one person?',
            '**Share of wallet.** If your estimate implies a household spends $5,000 a year on coffee, something is off: that is about 6% of median household income.',
            '**A second method.** Rebuild the number from the supply side: stores × sales per store.',
            '**A known anchor.** Compare with a figure you know, such as the number of licensed drivers (240 million) for anything car-related.',
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What are the most common market sizing mistakes?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Starting the math before defining the unit,** then answering a different question.',
            '**Assuming without saying why.** Every number needs a one-line reason.',
            '**Not segmenting the biggest driver.** Usage differs by age, income and region; one average hides that.',
            '**False precision.** "453,712,000" signals you do not understand estimation. Say "about 450 million".',
            '**Skipping the sanity check,** which is where most arithmetic slips are caught.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between a guesstimate and market sizing?',
      a: 'They are the same kind of question. "Market sizing" usually means estimating a market in units or dollars. "Guesstimate" is the broader term for any estimate built from assumptions.',
    },
    {
      q: 'Do I need to get close to the real number?',
      a: 'Being within a reasonable range helps, but interviewers mainly score the structure, the assumptions and the arithmetic. A clean method with a slightly off number beats a lucky guess.',
    },
    {
      q: 'Can I ask the interviewer for data in a market sizing question?',
      a: 'You can ask to confirm the scope, and some interviewers will give you a number if you ask for it. Most expect you to assume, so propose an assumption and ask if it is reasonable.',
    },
    {
      q: 'Where can I practice US market sizing questions?',
      a: 'MECE has 50 US market sizing questions, from warm-up to final-round difficulty, and a free daily question scored by an AI interviewer.',
    },
  ],
  practice: { sizing: 6 },
  related: ['case-interview-math', 'case-interview', 'product-manager-case-interview', 'issue-trees'],
  sources: US_ANCHORS.filter((a) => !a.derived).map((a) => ({ label: a.source, url: a.url, note: `${a.label}: ${a.value} (${a.asOf})` })),
  keywords: ['market sizing', 'market sizing questions', 'guesstimate', 'guesstimate questions', 'how to answer market sizing questions', 'US population for market sizing', 'estimation questions'],
  published: D,
  modified: D,
};

export const CASE_MATH: LearnPage = {
  slug: 'case-interview-math',
  cluster: 'foundations',
  nav: 'Case interview math',
  title: 'Case interview math: the formulas and shortcuts you need',
  metaTitle: 'Case Interview Math: Formulas, Shortcuts and Examples',
  description:
    'The business math behind case interviews: margins, break-even, growth rates, payback and NPV, with worked examples and mental-math shortcuts.',
  ogKind: 'toolkit',
  eyebrow: 'Foundations',
  answer:
    'Case interview math is business arithmetic done out loud, usually without a calculator: percentages, margins, break-even, growth rates, and simple payback or NPV. You need about ten formulas, clean rounding, and the habit of saying what each result means for the client. Speed comes from daily practice, not advanced math.',
  takeaways: [
    '**About ten formulas cover most cases.** Learn them until they are automatic.',
    '**Round early, and say that you are rounding.** Precision is rarely the point.',
    '**Keep units attached** to every number: thousands vs. millions is the most common slip.',
    '**Percent change is not percentage points.** 10% to 12% is +2 points, or +20%.',
    '**Every result needs a "so what".**',
  ],
  sections: [
    {
      id: 'formulas',
      h: 'Which formulas come up most in case interviews?',
      blocks: [
        {
          t: 'table',
          head: ['Concept', 'Formula', 'Example'],
          rows: [
            ['Profit', 'Revenue − costs', '$12M − $10M = $2M'],
            ['Revenue', 'Price × volume', '$4 × 500,000 = $2M'],
            ['Gross margin', '(Revenue − cost of goods) ÷ revenue', '($10 − $6) ÷ $10 = 40%'],
            ['Contribution per unit', 'Price − variable cost per unit', '$10 − $6 = $4'],
            ['Break-even volume', 'Fixed costs ÷ contribution per unit', '$200,000 ÷ $4 = 50,000 units'],
            ['Growth rate', '(New − old) ÷ old', '(120 − 100) ÷ 100 = 20%'],
            ['CAGR', '(End ÷ start)^(1 ÷ years) − 1', '$100M → $150M in 3 years ≈ 14.5% a year'],
            ['Payback period', 'Up-front investment ÷ annual cash flow', '$2M ÷ $0.5M = 4 years'],
            ['Value of a perpetuity', 'Annual cash flow ÷ discount rate', '$1M ÷ 10% = $10M'],
            ['Simple customer lifetime value', 'Annual margin per customer ÷ annual churn rate', '$120 ÷ 25% = $480'],
          ],
        },
      ],
    },
    {
      id: 'break-even',
      h: 'How do you calculate break-even in a case?',
      blocks: [
        {
          t: 'p',
          md: 'Break-even is the volume at which contribution covers fixed costs. Here it is for a fictional coffee cart in Denver.',
        },
        {
          t: 'math',
          title: 'Coffee cart break-even (illustrative numbers)',
          lines: [
            'Price per drink $5.00 − variable cost $1.50 = $3.50 contribution per drink',
            'Fixed costs (permit, cart lease, wages): $7,000 a month',
            'Break-even: $7,000 ÷ $3.50 = 2,000 drinks a month',
            'Per day, over 30 days: 2,000 ÷ 30 ≈ 67 drinks',
            'Over a 10-hour day: 67 ÷ 10 ≈ 7 drinks an hour',
          ],
        },
        {
          t: 'p',
          md: 'So what: about seven drinks an hour is achievable in a busy spot and hard on a quiet corner. Location decides this business, which is the insight to say out loud.',
        },
      ],
    },
    {
      id: 'shortcuts',
      h: 'What mental math shortcuts help in case interviews?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Build percentages from 10% and 5%.** 15% of 240 = 24 + 12 = 36.',
            '**Flip percentages.** 8% of 25 is the same as 25% of 8, which is 2.',
            '**Rule of 72.** Years to double ≈ 72 ÷ growth rate. At 8% a year, about 9 years.',
            '**Count the zeros separately.** 3 million × 40 thousand: 3 × 4 = 12, and 6 + 4 = 10 zeros, so 12 followed by 10 zeros = 120 billion.',
            '**Round the divisor to a friendly number.** 1,960 ÷ 49 is about 2,000 ÷ 50 = 40.',
            '**Margin is not markup.** Cost $6, price $10: margin is 40% of price, markup is 67% of cost.',
          ],
        },
      ],
    },
    {
      id: 'npv',
      h: 'How do NPV and payback show up in case interviews?',
      blocks: [
        {
          t: 'p',
          md: 'Investment questions ("should the plant buy this robot?") come down to whether the money you get back is worth more than the money you put in. Payback is the quick version; net present value (NPV) accounts for the time value of money. In live interviews you will more often use payback or the perpetuity shortcut than a full NPV table.',
        },
        {
          t: 'math',
          title: 'A Midwest manufacturer\'s automation project (illustrative)',
          lines: [
            'Cost today: $4M. Savings: $1M a year for 6 years.',
            'Payback: $4M ÷ $1M = 4 years',
            'NPV at 8%: $1M × annuity factor (6 years, 8%) − $4M',
            'Annuity factor = (1 − 1.08^−6) ÷ 0.08 ≈ 4.62',
            'NPV ≈ $4.62M − $4M ≈ +$0.6M, so the project creates value at an 8% cost of capital',
          ],
        },
      ],
    },
    {
      id: 'charts',
      h: 'How should you read a chart or table in a case?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Read the frame first', md: 'Title, units, axes, time period, and whether numbers are absolute or percentages.' },
            { title: 'Find the biggest mover', md: 'Which bar, line or row changed most, or differs most from the others?' },
            { title: 'Compute one ratio', md: 'Growth, share or per-unit figures turn raw numbers into a comparison.' },
            { title: 'Say the so-what', md: 'Tie it back to the question: "This segment explains two-thirds of the decline."' },
          ],
        },
      ],
    },
    {
      id: 'out-loud',
      h: 'How do you do math out loud without losing the interviewer?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Announce the approach first:** "I\'ll take revenue per store times stores, then subtract costs."',
            '**Say when you round:** "Call it 340 million to keep it simple."',
            '**Write units next to every number** on your paper.',
            '**Check the order of magnitude** before you announce a result.',
            '**Finish with the implication,** not the number.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Is case interview math hard?',
      a: 'The math itself is middle-school arithmetic: multiplication, division and percentages. What makes it hard is doing it quickly, out loud and under pressure, which is why daily practice matters more than learning new formulas.',
    },
    {
      q: 'Do I need to know NPV for a case interview?',
      a: 'Know the idea and the shortcuts: payback period, and the perpetuity formula (cash flow ÷ discount rate). Full NPV calculations come up more in finance and corporate development interviews.',
    },
    {
      q: 'How do I get faster at mental math?',
      a: 'Ten minutes a day of drills (percentages, large-number multiplication, division) for two to three weeks, plus doing every case\'s math by hand rather than on a calculator.',
    },
  ],
  practice: { caseCodes: ['US-C-28', 'US-C-15', 'US-C-48'] },
  related: ['market-sizing', 'profitability-framework', 'pricing-strategy-framework', 'finance-case-interview'],
  keywords: ['case interview math', 'consulting math', 'break-even analysis', 'mental math for case interviews', 'CAGR formula', 'payback period', 'NPV case interview'],
  published: D,
  modified: D,
};

export const PYRAMID_PRINCIPLE: LearnPage = {
  slug: 'pyramid-principle',
  cluster: 'foundations',
  nav: 'Pyramid principle',
  title: 'The Pyramid Principle: how to give a clear recommendation',
  metaTitle: 'The Pyramid Principle: Answer First, Then Support',
  description:
    'The Pyramid Principle means leading with your answer, then grouping the supporting reasons MECE beneath it. How to use it to close a case interview and at work.',
  ogKind: 'concept',
  eyebrow: 'Foundations',
  answer:
    'The Pyramid Principle structures communication with the answer at the top, a few grouped reasons beneath it, and data beneath each reason. Barbara Minto developed it at McKinsey. In a case interview it shapes your final recommendation: say what the client should do first, then why, then the risks and next steps.',
  takeaways: [
    '**Answer first.** Your first sentence is the recommendation.',
    '**Two to four reasons,** grouped MECE, each backed by a number from the case.',
    '**SCQA sets up the answer:** situation, complication, question, answer.',
    '**End with risks and next steps,** not a recap.',
  ],
  sections: [
    {
      id: 'what',
      h: 'What is the Pyramid Principle?',
      blocks: [
        {
          t: 'p',
          md: 'The Pyramid Principle says that ideas should be presented as a pyramid: one governing thought at the top, supported by a small set of arguments, each supported by facts. Readers and listeners understand faster when they know the conclusion first, because every detail that follows has a place to go. Barbara Minto set it out in **The Pyramid Principle**, and it remains a standard in consulting writing.',
        },
        {
          t: 'tree',
          root: 'Recommendation: a Minneapolis bike-share operator should raise its annual pass from $99 to $120',
          branches: [
            { label: 'Riders will mostly stay', leaves: ['Annual members ride far more often than casual riders, so the pass is still cheap per ride'] },
            { label: 'The math works', leaves: ['The increase pays off unless more than about 1 in 6 members leave'] },
            { label: 'Competitors are not cheaper', leaves: ['Comparable city passes cost the same or more'] },
          ],
          caption: 'A pyramid: answer on top, three reasons, evidence under each. (Fictional operator and illustrative figures.)',
        },
        {
          t: 'math',
          title: 'Where "about 1 in 6" comes from',
          lines: [
            'Revenue per 100 members today: 100 × $99 = $9,900',
            'Members needed at $120 to match it: $9,900 ÷ $120 = 82.5',
            'So up to 17.5 of every 100 members can leave, about 1 in 6, before pass revenue falls',
          ],
        },
      ],
    },
    {
      id: 'scqa',
      h: 'What is SCQA?',
      blocks: [
        {
          t: 'p',
          md: 'SCQA extends Minto\'s structure for introductions: **Situation** (what the audience already knows), **Complication** (what changed) and **Question** (what it raises), followed by your **Answer**. It gets the audience to the answer in a few sentences.',
        },
        {
          t: 'table',
          head: ['Part', 'Example'],
          rows: [
            ['Situation', 'Our grocery chain has been profitable in the Midwest for 20 years.'],
            ['Complication', 'Two discount chains opened near a fifth of our stores, and margins there fell by half.'],
            ['Question', 'How should we respond?'],
            ['Answer', 'Differentiate on fresh food and service in those stores rather than match prices, because matching costs more than the sales it saves.'],
          ],
        },
      ],
    },
    {
      id: 'close',
      h: 'How do you use the Pyramid Principle to close a case interview?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Answer', md: 'One sentence with the decision. "The client should enter the Texas market through an acquisition."' },
            { title: 'Reasons', md: 'Two or three, each with a number from the case. Group them MECE: market, economics, feasibility.' },
            { title: 'Risks', md: 'The one or two things that could make you wrong, and how to reduce them.' },
            { title: 'Next steps', md: 'What you would do in the next two to four weeks to confirm the decision.' },
          ],
        },
        {
          t: 'dialogue',
          turns: [
            { who: 'Interviewer', md: 'The CEO just walked in. What should she do?' },
            {
              who: 'Candidate',
              md: 'She should close the 12 lowest-performing stores and move that capital into delivery. Three reasons. Those stores lose about $4 million a year between them. Delivery orders in our remaining markets are growing fast and already profitable per order. And the leases on 9 of the 12 expire within 18 months, so exit costs are low. The main risk is losing loyal customers near the closed stores, so I would offer them free delivery for six months. Next, I would confirm the lease terms and test delivery pricing in two markets.',
            },
          ],
        },
        {
          t: 'p',
          md: 'Notice what is missing: no recap of every analysis, no "it depends", and no new analysis at the end. (The chain and its numbers are fictional.)',
        },
      ],
    },
    {
      id: 'grouping',
      h: 'How do you group the reasons under your answer?',
      blocks: [
        {
          t: 'p',
          md: 'Reasons at the same level should be the same kind of idea and MECE, so they add up to the answer without overlapping. Minto describes two ways to link them. **Inductive** grouping lists parallel reasons ("the market is growing, we can win share, the economics work"). **Deductive** reasoning chains them ("costs rose; prices cannot rise; therefore we must cut costs"). In interviews, inductive groups of three are easier to follow.',
        },
      ],
    },
    {
      id: 'at-work',
      h: 'How do you use the Pyramid Principle at work?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Email:** put the ask or conclusion in the subject line and first sentence. Detail goes below.',
            '**Status updates:** lead with whether you are on track, then the one or two things that need a decision.',
            '**Slides:** make each slide title a full-sentence conclusion, with the chart below as evidence.',
            '**Meetings:** open with the decision you need, not the background.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Who created the Pyramid Principle?',
      a: 'Barbara Minto, who developed it while working at McKinsey and published it in her book The Pyramid Principle. She also named the MECE principle.',
    },
    {
      q: 'Is answer-first always right?',
      a: 'For busy decision-makers, almost always. With a skeptical audience or bad news, you may add one line of context first, but the answer should still come within the first few sentences.',
    },
    {
      q: 'How long should a case recommendation be?',
      a: 'About 60 to 90 seconds: the answer, two or three supported reasons, the main risk and the next steps.',
    },
  ],
  practice: { caseCodes: ['US-C-10', 'US-C-18', 'US-C-22'] },
  related: ['what-is-mece', 'issue-trees', 'case-interview', 'competitive-response-framework'],
  sources: [
    {
      label: 'Barbara Minto (official site)',
      url: 'https://www.barbaraminto.com/',
      note: 'Author of The Pyramid Principle; the situation-complication-question introduction.',
    },
    {
      label: 'Barbara Minto on MECE (McKinsey Alumni Center)',
      url: 'https://www.mckinsey.com/alumni/news-and-insights/global-news/alumni-news/barbara-minto-mece-i-invented-it-so-i-get-to-say-how-to-pronounce-it',
      note: 'Background on Minto\'s work editing reports at McKinsey.',
    },
  ],
  keywords: ['pyramid principle', 'Barbara Minto', 'SCQA', 'answer first', 'case interview recommendation', 'how to synthesize a case'],
  published: D,
  modified: D,
};

export const FOUNDATIONS: LearnPage[] = [WHAT_IS_MECE, CASE_INTERVIEW, ISSUE_TREES, MARKET_SIZING, CASE_MATH, PYRAMID_PRINCIPLE];
