import type { LearnPage } from '../types';

/**
 * Role guides: how business roles beyond consulting use case questions.
 * Companies in examples are fictional; example numbers are illustrative.
 */

const D = '2026-09-27';

export const PRODUCT_MANAGER: LearnPage = {
  slug: 'product-manager-case-interview',
  cluster: 'roles',
  nav: 'Product manager',
  title: 'Product manager case interviews: estimation, metrics and product sense',
  metaTitle: 'Product Manager Case Interview: Estimation, Metrics, Design',
  description:
    'How PM interviews use cases: estimation questions, "a metric dropped" diagnosis, product design and strategy, with structures and a worked example.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'Product manager interviews use cases to test how you think about users, products and numbers. Expect estimation questions, metric diagnosis ("a key metric dropped 8%, why?"), product design ("improve this product for a user group") and strategy ("should we build X?"). The same structured, MECE approach consultants use works for each.',
  takeaways: [
    '**Four question types:** estimation, metrics, product design, strategy.',
    '**For a metric drop, rule out data problems first,** then segment, then look for internal and external causes.',
    '**For design questions, start from the user and the goal,** not features.',
    '**Always end with how you would measure success.**',
  ],
  sections: [
    {
      id: 'types',
      h: 'What types of case questions do PM interviews ask?',
      blocks: [
        {
          t: 'table',
          head: ['Question type', 'Example', 'Structure to use'],
          rows: [
            ['Estimation', 'How many rideshare trips happen in New York City on a weekday?', '[Market sizing](/us/learn/market-sizing): top-down or bottom-up'],
            ['Metric diagnosis', 'Weekly active users fell 8% last week. Why?', 'Data check → segment → internal vs. external causes'],
            ['Product design', 'Design a feature to help first-time home buyers', 'Goal → users → pain points → solutions → metrics'],
            ['Product strategy', 'Should a fitness app launch a paid tier?', 'Market, users, economics, risks'],
            ['Execution and trade-offs', 'Two teams need the same engineers. How do you decide?', 'Impact vs. effort, tied to company goals'],
          ],
        },
      ],
    },
    {
      id: 'metric-drop',
      h: 'How do you answer a "metric dropped" question?',
      blocks: [
        {
          t: 'tree',
          root: 'Why did weekly active users fall 8%?',
          branches: [
            { label: 'Is the drop real?', leaves: ['Tracking or logging change', 'Definition change', 'Seasonality or holidays'] },
            { label: 'Where is it concentrated?', leaves: ['Platform (iOS, Android, web)', 'Geography', 'New vs. returning users'] },
            { label: 'Internal causes', leaves: ['A release or bug', 'Pricing or policy change', 'Marketing spend cut'] },
            { label: 'External causes', leaves: ['Competitor launch', 'App store or OS change', 'News or outage'] },
          ],
        },
        {
          t: 'p',
          md: 'Say the order out loud: first confirm the drop is real, then find where it is concentrated, then check internal changes before external ones, because internal changes are more common and easier to verify. If the drop is only on Android and began on the day of a release, you have your lead.',
        },
      ],
    },
    {
      id: 'design',
      h: 'How do you structure a product design question?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Clarify the goal', md: 'Engagement, revenue, retention, or a new market? For which company and platform?' },
            { title: 'Pick a user segment', md: 'List two or three segments and choose one, with a reason.' },
            { title: 'List their pain points', md: 'Walk through their journey and name where it breaks.' },
            { title: 'Prioritize', md: 'Pick the pain point with the most impact for the goal.' },
            { title: 'Propose solutions', md: 'Two or three options, then pick one and describe it concretely.' },
            { title: 'Define metrics and risks', md: 'One primary success metric, guardrail metrics, and what could go wrong.' },
          ],
        },
        {
          t: 'p',
          md: 'Structured templates such as the CIRCLES method follow a similar path. Use whichever you like, but make the user and the goal drive the answer.',
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: should a fitness app launch a paid tier?',
      blocks: [
        {
          t: 'p',
          md: 'A fictional fitness app has 2 million monthly active users and earns from ads. All figures are illustrative.',
        },
        {
          t: 'math',
          title: 'First-year revenue estimate',
          lines: [
            'Conversion to paid (assumption): 4% × 2M = 80,000 subscribers',
            'Subscription revenue: 80,000 × $9.99 × 12 ≈ $9.6M a year',
            'Ad revenue lost (paid users see no ads; assume $1.50 per user a year): 80,000 × $1.50 = $120,000',
            'Net revenue gain ≈ $9.6M − $0.1M ≈ $9.5M, before the cost of building paid features',
          ],
        },
        {
          t: 'p',
          md: 'The paid tier clearly wins on revenue. The real question is the product one: will putting features behind a paywall shrink the free base that makes the app valuable? Recommend a test in one market with a guardrail metric on free-user retention.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes do PM candidates make in case questions?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Jumping to features** before defining the user and the goal.',
            '**Diagnosing a metric drop without first checking the data.**',
            '**No success metric,** or a vanity metric like downloads.',
            '**Ignoring trade-offs** such as cannibalization, cost or complexity.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Do product manager interviews include case questions?',
      a: 'Many do, though the names vary: estimation, product sense, analytical or execution questions. They test the same structured thinking as consulting cases, applied to products and users.',
    },
    {
      q: 'How is a PM estimation question different from consulting market sizing?',
      a: 'The method is the same. PM questions tend to connect the estimate to a product decision, such as server capacity or the size of a feature\'s audience.',
    },
    {
      q: 'What is the CIRCLES method?',
      a: 'A product design framework popularized by Lewis C. Lin: comprehend the situation, identify the customer, report needs, cut through prioritization, list solutions, evaluate trade-offs and summarize.',
    },
  ],
  practice: { sizing: 3, caseCodes: ['US-C-04', 'US-C-24', 'US-C-49'] },
  related: ['market-sizing', 'go-to-market-framework', 'pricing-strategy-framework', 'issue-trees'],
  keywords: ['product manager case interview', 'PM interview questions', 'PM estimation questions', 'product sense interview', 'metric dropped interview question'],
  published: D,
  modified: D,
};

export const SALES: LearnPage = {
  slug: 'sales-case-interview',
  cluster: 'roles',
  nav: 'Sales',
  title: 'Sales case interviews: quota, pipeline and territory problems',
  metaTitle: 'Sales Case Interview: Quota, Pipeline and Territory Guide',
  description:
    'How sales manager and account executive interviews use business cases: diagnose a missed quota, plan a territory, and read sales metrics, with a worked example.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'Sales interviews, especially for managers, often include a business case or a role-play: diagnose a missed quota, plan a territory, prioritize accounts or handle a pricing objection. Break bookings into opportunities × win rate × average deal size, find the weak driver, and recommend actions with numbers, just as you would in a consulting case.',
  takeaways: [
    '**Bookings = opportunities × win rate × average deal size.** Find which one moved.',
    '**Discounting shows up as a smaller deal size,** and it is a common hidden cause.',
    '**Plan territories on account potential and workload,** not just geography.',
    '**Pipeline coverage** (pipeline ÷ quota) is the early warning metric.',
  ],
  sections: [
    {
      id: 'tree',
      h: 'How do you break down a sales problem?',
      blocks: [
        {
          t: 'tree',
          root: 'Why did the team miss quota?',
          branches: [
            { label: 'Opportunities worked', leaves: ['Lead volume and quality', 'Rep capacity (ramped reps, turnover)'] },
            { label: 'Win rate', leaves: ['By stage of the funnel', 'By competitor or segment'] },
            { label: 'Average deal size', leaves: ['Discounting', 'Product mix'] },
            { label: 'Timing', leaves: ['Deals slipping into the next quarter'] },
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: a team missed quota by 20%',
      blocks: [
        {
          t: 'p',
          md: 'A fictional software sales team had a $10M quarterly quota and closed $8M. All numbers are illustrative.',
        },
        {
          t: 'math',
          title: 'Plan vs. actual',
          lines: [
            'Plan: 250 opportunities × 25% win rate × $160,000 average deal = $10M',
            'Actual: 240 opportunities × 25% win rate = 60 deals; $8M ÷ 60 ≈ $133,000 average deal',
            'Opportunities: −4%. Win rate: flat. Average deal size: −17% ($160,000 → $133,000)',
            'List price $178,000: a 10% discount gives $160,000; a 25% discount gives $133,500',
          ],
        },
        {
          t: 'p',
          md: 'The team did not lose on volume or win rate. It lost on price: average discounts rose from about 10% to about 25%. Recommend a deal-desk approval for discounts above 15%, coaching on value selling, and a check on whether one competitor is driving the discounting.',
        },
      ],
    },
    {
      id: 'territory',
      h: 'How do you plan a sales territory?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Segment accounts by potential', md: 'Estimate what each account could buy, not just what it buys today.' },
            { title: 'Estimate workload', md: 'Hours needed per account per year, by segment. For example, 40 hours per strategic account against 1,200 selling hours per rep covers about 30 accounts.' },
            { title: 'Balance territories', md: 'Similar potential and workload per rep, so quotas are fair.' },
            { title: 'Set quotas from potential', md: 'Tie each quota to its territory\'s potential and history, not an even split of the company target.' },
          ],
        },
      ],
    },
    {
      id: 'metrics',
      h: 'Which sales metrics should you know?',
      blocks: [
        {
          t: 'table',
          head: ['Metric', 'Definition', 'Why it matters'],
          rows: [
            ['Pipeline coverage', 'Open pipeline ÷ quota', 'An early warning; a common rule of thumb is about 3×'],
            ['Win rate', 'Deals won ÷ deals decided', 'Sales effectiveness'],
            ['Average deal size', 'Bookings ÷ deals won', 'Pricing discipline and product mix'],
            ['Sales cycle length', 'Days from opportunity to close', 'Forecast accuracy and capacity'],
            ['Quota attainment', 'Bookings ÷ quota, by rep', 'Whether quotas are realistic'],
            ['CAC payback', 'Sales and marketing cost to win a customer ÷ monthly gross margin per customer', 'Whether growth pays for itself'],
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes do candidates make in sales cases?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Blaming the reps first.** Check lead quality, pricing and territory design before concluding it is a people problem.',
            '**Ignoring discounting,** which hides inside a smaller average deal size.',
            '**Treating every account the same** instead of prioritizing by potential.',
            '**Recommending "more leads" without the math** on whether reps have capacity to work them.',
          ],
        },
      ],
    },
    {
      id: 'roleplay',
      h: 'How do you handle a sales role-play or pitch case?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Ask discovery questions first:** the buyer\'s goals, current process, decision-makers and timeline.',
            '**Quantify the value** in the buyer\'s terms, as you would in a value-based pricing case.',
            '**Handle objections** by clarifying the real concern before answering it.',
            '**Close on a next step** with a date, not a vague "let\'s stay in touch".',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a sales case study interview?',
      a: 'A business problem set in a sales context, such as a missed quota, a territory plan or a pricing negotiation, which you solve out loud to show structured thinking and commercial judgment.',
    },
    {
      q: 'How do you calculate pipeline coverage?',
      a: 'Divide the value of open, qualified pipeline for the period by the quota. Many teams aim for about three times coverage, adjusted for their own win rates.',
    },
  ],
  practice: { caseCodes: ['US-C-34', 'US-C-09', 'US-C-11'] },
  related: ['pricing-strategy-framework', 'go-to-market-framework', 'marketing-case-interview', 'case-interview-math'],
  keywords: ['sales case interview', 'sales manager interview case study', 'territory planning', 'sales quota analysis', 'pipeline coverage', 'account executive interview'],
  published: D,
  modified: D,
};

export const MARKETING: LearnPage = {
  slug: 'marketing-case-interview',
  cluster: 'roles',
  nav: 'Marketing',
  title: 'Marketing case interviews: segmentation, funnels and ROI',
  metaTitle: 'Marketing Case Interview: Segmentation, Funnel and ROI',
  description:
    'How marketing interviews use cases: segmentation, targeting and positioning, funnel diagnosis, and judging whether marketing spend pays back, with worked math.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'Marketing case interviews test how you grow demand profitably: which customers to target, what to say to them, which channels to use, and whether the spend pays back. Structure answers around segmentation, targeting and positioning, the funnel from awareness to repeat purchase, and unit economics such as customer acquisition cost and lifetime value.',
  takeaways: [
    '**Segment, target, position:** choose who before deciding what to say.',
    '**Diagnose the funnel stage by stage** to find where customers drop out.',
    '**The cheapest customers are not always the best.** Compare LTV ÷ CAC by channel.',
    '**Tie every idea to a metric.**',
  ],
  sections: [
    {
      id: 'stp',
      h: 'What is segmentation, targeting and positioning?',
      blocks: [
        {
          t: 'table',
          head: ['Step', 'Question', 'Example (fictional oat-milk brand)'],
          rows: [
            ['Segmentation', 'How do customers differ in needs and behavior?', 'Health-focused, dairy-free by necessity, coffee-shop drinkers, price-driven shoppers'],
            ['Targeting', 'Which segments can we win profitably?', 'Coffee-shop drinkers: high frequency, brand-loyal once they switch'],
            ['Positioning', 'Why should that segment choose us?', 'The oat milk that foams like dairy for your morning latte'],
          ],
        },
      ],
    },
    {
      id: 'funnel',
      h: 'How do you diagnose a marketing funnel?',
      blocks: [
        {
          t: 'tree',
          root: 'Why did new customers fall about 17%?',
          branches: [
            { label: 'Awareness', leaves: ['Reach and impressions', 'Share of voice vs. competitors'] },
            { label: 'Consideration', leaves: ['Site visits', 'Click-through rates'] },
            { label: 'Conversion', leaves: ['Sign-up or checkout rate', 'Price and offer'] },
            { label: 'Retention', leaves: ['Repeat purchase', 'Churn'] },
          ],
        },
        {
          t: 'math',
          title: 'Find the leaking stage (illustrative)',
          lines: [
            'Last year: 1,000,000 visitors × 3.0% conversion = 30,000 new customers',
            'This year: visitors flat, conversion 2.5% → 25,000, a 16.7% drop',
            'Traffic held, so the problem sits at conversion: check pricing, checkout changes and offers',
          ],
        },
      ],
    },
    {
      id: 'roi',
      h: 'How do you judge whether marketing spend pays back?',
      blocks: [
        {
          t: 'math',
          title: 'Two channels, $50,000 each (illustrative)',
          lines: [
            'Channel A: 500 customers → CAC $100; $60 margin a year for 2 years → LTV $120; LTV ÷ CAC = 1.2',
            'Channel B: 250 customers → CAC $200; $60 margin a year for 5 years → LTV $300; LTV ÷ CAC = 1.5',
          ],
        },
        {
          t: 'p',
          md: 'Channel A looks cheaper, but Channel B brings customers who stay longer and are worth more per dollar spent. Neither clears a healthy ratio of about 3, so the bigger question is whether retention or margin can improve.',
        },
      ],
    },
    {
      id: 'four-ps',
      h: 'How do the 4Ps show up in a marketing case?',
      blocks: [
        {
          t: 'p',
          md: 'When sales are weak, the 4Ps give you a MECE checklist of what the company controls. Ask one diagnostic question per P before proposing fixes.',
        },
        {
          t: 'table',
          head: ['P', 'Diagnostic question', 'Example (fictional regional ice-cream brand)'],
          rows: [
            ['Product', 'Does it meet the target segment\'s need better than alternatives?', 'Flavors skew to kids while buyers are health-conscious adults'],
            ['Price', 'Is the price right for the value and the shelf next to it?', 'Priced 30% above the national premium brand with no clear reason why'],
            ['Place', 'Is it where the target customer shops, and visible there?', 'In 40% of local grocery stores, often on a bottom shelf'],
            ['Promotion', 'Does the target customer know it exists and why to choose it?', 'Spend goes to local radio; buyers find brands on social media'],
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'What does a strong answer to a marketing case sound like?',
      blocks: [
        {
          t: 'dialogue',
          turns: [
            { who: 'Interviewer', md: 'A regional ice-cream brand\'s grocery sales have been flat for two years while the category grew. What would you look at?' },
            {
              who: 'Candidate',
              md: 'Flat sales in a growing category means we are losing share, so I want to know where. I would split sales into distribution (how many stores carry us), velocity (units sold per store) and price. If distribution held but velocity fell, the problem is on the shelf or in demand, so I would check pricing against competitors and whether our buyers have changed. Can we start with distribution and velocity by retailer?',
            },
          ],
        },
        {
          t: 'p',
          md: 'The candidate turned a vague marketing question into an equation (sales = stores × units per store × price), located the problem before brainstorming, and asked for the data that would separate the causes.',
        },
      ],
    },
    {
      id: 'brand',
      h: 'How do you answer a brand or positioning question?',
      blocks: [
        {
          t: 'p',
          md: 'Start with the customer and the competitive set, not the logo. Ask what customers believe about the brand today, what the brand needs them to believe, and what proof could change their minds. Then pick the few channels where that audience pays attention, and define how you will measure a shift: awareness, consideration, share of search or repeat rate.',
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes do candidates make in marketing cases?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Jumping to a campaign idea** before finding where the funnel leaks.',
            '**Targeting everyone.** A positioning that fits all segments usually fits none.',
            '**Judging channels on cost per customer alone,** ignoring how long customers stay.',
            '**No measurement plan.** Every recommendation needs a metric and a target.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'How do I prepare for a marketing case interview?',
      a: 'Learn the funnel, segmentation-targeting-positioning, the 4Ps and basic unit economics, then practice turning vague questions ("sales are flat") into equations you can test, such as stores × units per store × price.',
    },
    {
      q: 'What frameworks are used in marketing case interviews?',
      a: 'Segmentation, targeting and positioning; the marketing funnel; the 4Ps; customer lifetime value and acquisition cost; and go-to-market plans for launches.',
    },
    {
      q: 'What is a good customer acquisition cost?',
      a: 'It depends on what a customer is worth. A common guide is lifetime value at least three times acquisition cost, with the cost earned back within about a year.',
    },
  ],
  practice: { caseCodes: ['US-C-49', 'US-C-22', 'US-C-38'] },
  related: ['go-to-market-framework', 'growth-strategy-framework', 'pricing-strategy-framework', 'business-frameworks'],
  keywords: ['marketing case interview', 'marketing case study questions', 'segmentation targeting positioning', 'marketing funnel analysis', 'CAC LTV', 'marketing ROI'],
  published: D,
  modified: D,
};

export const HR: LearnPage = {
  slug: 'hr-case-interview',
  cluster: 'roles',
  nav: 'HR and people',
  title: 'HR case interviews: attrition, workforce planning and org design',
  metaTitle: 'HR Case Interview: Attrition, Workforce Planning, Org Design',
  description:
    'How HR and people-leader interviews use cases: diagnosing attrition, costing turnover, workforce planning, org design and pay, with worked examples.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'HR and people case interviews test whether you can solve workforce problems with the same rigor as business ones: why attrition rose, how many people to hire, how to design an organization, or how to structure pay. Break the problem down MECE, put numbers on it (the cost of turnover, the headcount gap), find the root cause and recommend targeted fixes.',
  takeaways: [
    '**Split attrition into voluntary and involuntary,** then segment by team, tenure and performance.',
    '**Build the cost of turnover from its parts:** recruiting, training and lost productivity.',
    '**Workforce plans start from the work:** demand, productivity, coverage and time off.',
    '**Org design follows strategy,** then sets structure, spans and layers.',
  ],
  sections: [
    {
      id: 'types',
      h: 'What types of HR case questions are there?',
      blocks: [
        {
          t: 'table',
          head: ['Case type', 'Example question'],
          rows: [
            ['Attrition and retention', 'Voluntary turnover in our support centers rose from 15% to 22%. Why, and what should we do?'],
            ['Workforce planning', 'How many nurses do we need to staff a new hospital unit?'],
            ['Org design', 'We are reorganizing from regions to product lines. How should the structure look?'],
            ['Compensation', 'Our offer-acceptance rate fell. Is pay the problem?'],
            ['Recruiting funnel', 'Time to fill engineering roles doubled. Where is the bottleneck?'],
            ['Change management', 'How should we roll out a new return-to-office policy?'],
          ],
        },
      ],
    },
    {
      id: 'attrition',
      h: 'How do you diagnose rising employee attrition?',
      blocks: [
        {
          t: 'tree',
          root: 'Why did annual attrition rise from 15% to 22%?',
          branches: [
            { label: 'Voluntary exits', leaves: ['Pay below market', 'Manager and team', 'Career growth', 'Workload and flexibility', 'Other'] },
            { label: 'Involuntary exits', leaves: ['Performance', 'Restructuring and layoffs'] },
          ],
          caption: 'Then segment each branch by team, tenure, location and performance rating to see where it is concentrated.',
        },
        {
          t: 'p',
          md: 'Look for concentration. If the increase is mostly first-year employees in two sites under new managers, the cause is probably onboarding or management, not company-wide pay. Exit interviews help, but compare them with what the data shows, since people leaving often give the easiest reason.',
        },
      ],
    },
    {
      id: 'cost',
      h: 'How do you calculate the cost of employee turnover?',
      blocks: [
        {
          t: 'p',
          md: 'Build it from components rather than quoting a rule of thumb, since estimates vary widely by role. A fictional 2,000-person customer support organization, with illustrative costs:',
        },
        {
          t: 'math',
          title: 'Cost of the attrition increase',
          lines: [
            'Extra exits: 2,000 × (22% − 15%) = 140 more a year',
            'Cost per exit: recruiting $4,000 + training 6 weeks × $1,000 = $6,000 + lost productivity while ramping $5,000 = $15,000',
            'Annual cost of the increase: 140 × $15,000 = $2.1M',
          ],
        },
        {
          t: 'p',
          md: 'Now fixes have a budget. A $1,500 retention bonus for 600 at-risk employees costs $0.9M. If it prevents half the extra exits (70 × $15,000 = $1.05M saved), it roughly pays for itself, but fixing the underlying management or onboarding issue is the durable answer.',
        },
      ],
    },
    {
      id: 'workforce',
      h: 'How do you answer a workforce planning question?',
      blocks: [
        {
          t: 'math',
          title: 'Nurses for a new 60-bed unit (illustrative)',
          lines: [
            'Patients: 60 beds × 85% occupancy = 51 patients',
            'Nurses per shift at 1 nurse to 4 patients: 51 ÷ 4 = 12.75, round up to 13',
            'Shifts: two 12-hour shifts a day × 7 days = 14 shifts a week → 13 × 14 = 182 nurse-shifts a week',
            'Full-time nurses at 3 shifts a week each: 182 ÷ 3 ≈ 61',
            'Add about 15% for vacation, sick days and training: 61 × 1.15 ≈ 70 full-time nurses',
          ],
        },
        {
          t: 'p',
          md: 'The staffing ratio here is illustrative: real ratios vary by type of unit, and some states set minimum ratios in law. In an interview, state the ratio as an assumption and show how the answer changes if it moves.',
        },
      ],
    },
    {
      id: 'org-design',
      h: 'How do you approach an org design case?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Start from strategy', md: 'What must the organization be great at? Speed, cost, customer intimacy, innovation?' },
            { title: 'Map the work', md: 'Which activities, decisions and handoffs does that require?' },
            { title: 'Choose the structure', md: 'Functional, divisional (by product, customer or region) or matrix, each with clear trade-offs.' },
            { title: 'Set spans and layers', md: 'With 1,000 front-line employees, a span of 5 needs 200 first-line managers; a span of 8 needs 125.' },
            { title: 'Plan the transition', md: 'Roles, communication, and how to keep performance steady during the change.' },
          ],
        },
      ],
    },
    {
      id: 'compensation',
      h: 'How do you structure a compensation question?',
      blocks: [
        {
          t: 'p',
          md: 'Check three things. **External competitiveness:** where pay sits against market data for the role and location (for example the 50th or 75th percentile). **Internal equity:** whether similar roles are paid similarly. **Pay mix:** base, bonus, equity and benefits. Remember that several US states and cities now require pay ranges in job postings, so pay decisions are more visible to candidates and current employees than they used to be.',
        },
      ],
    },
    {
      id: 'metrics',
      h: 'Which HR metrics should you know?',
      blocks: [
        {
          t: 'table',
          head: ['Metric', 'Definition'],
          rows: [
            ['Attrition (turnover) rate', 'Exits in a period ÷ average headcount'],
            ['Regretted attrition', 'Exits of employees the company wanted to keep ÷ average headcount'],
            ['Time to fill', 'Days from opening a role to an accepted offer'],
            ['Offer-acceptance rate', 'Offers accepted ÷ offers made'],
            ['Span of control', 'Direct reports per manager'],
            ['Revenue per employee', 'Revenue ÷ average headcount'],
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'Do HR interviews include case studies?',
      a: 'Many HR business partner, people analytics and HR leadership interviews include a case or a scenario, such as an attrition spike, a reorganization or a hiring plan. They test structured thinking and business judgment, not just HR policy.',
    },
    {
      q: 'How do you calculate attrition rate?',
      a: 'Divide the number of employees who left during the period by the average headcount in that period. Report voluntary and involuntary exits separately.',
    },
    {
      q: 'What is a good span of control?',
      a: 'There is no single right number. It depends on how similar and routine the work is: wider spans suit standardized work, narrower spans suit complex or fast-changing work.',
    },
  ],
  practice: { caseCodes: ['US-C-25', 'US-C-23', 'US-C-19'] },
  related: ['operations-case-framework', 'cost-reduction-framework', 'strategy-and-operations-interview', 'issue-trees'],
  keywords: ['HR case interview', 'HR case study interview questions', 'employee attrition analysis', 'workforce planning', 'org design case', 'HR business partner interview'],
  published: D,
  modified: D,
};

export const STRATEGY_OPS: LearnPage = {
  slug: 'strategy-and-operations-interview',
  cluster: 'roles',
  nav: 'Strategy and operations',
  title: 'Strategy and operations (BizOps) interviews: cases and how to prepare',
  metaTitle: 'Strategy & Operations (BizOps) Interview: Case Guide',
  description:
    'How strategy and operations (BizOps) interviews work: live cases, metric deep-dives, take-home analyses and prioritization, with a worked example.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'Strategy and operations roles, also called BizOps or chief of staff roles, hire people who can diagnose a business problem, size it and drive the fix across teams. Interviews mix live cases (why did a metric move, should we launch X), take-home analyses with real data, and questions about prioritizing and running projects. Structured thinking and clean math matter most.',
  takeaways: [
    '**Expect a live case and often a take-home analysis.**',
    '**Decompose metrics into their drivers,** as in any consulting case.',
    '**Prioritize with impact versus effort,** and say what you would not do.',
    '**Show you can make the answer happen,** not just find it.',
  ],
  sections: [
    {
      id: 'formats',
      h: 'What formats do strategy and operations interviews use?',
      blocks: [
        {
          t: 'table',
          head: ['Format', 'What it tests', 'How to prepare'],
          rows: [
            ['Live case', 'Structure, math, judgment', 'Practice consulting-style cases out loud'],
            ['Metric deep-dive', 'Decomposing a metric and finding the driver', 'Drill driver trees for common business metrics'],
            ['Take-home analysis', 'Working with messy data in a spreadsheet or SQL, then presenting', 'Practice turning a dataset into three slides with a recommendation'],
            ['Prioritization', 'Choosing between projects with limited resources', 'Use impact vs. effort, tied to company goals'],
            ['Behavioral', 'Leading without authority, handling ambiguity', 'Prepare stories with numbers and outcomes'],
          ],
        },
      ],
    },
    {
      id: 'example',
      h: 'Worked example: revenue per order fell 6%',
      blocks: [
        {
          t: 'p',
          md: 'A fictional food-delivery marketplace earns a commission (the take rate) on each order. Revenue per order fell 6%. Decompose it:',
        },
        {
          t: 'math',
          title: 'Revenue per order = average order value × take rate',
          lines: [
            'Last quarter: $35.00 × 15.0% = $5.25',
            'This quarter: $34.00 × 14.5% = $4.93',
            'Change: $4.93 ÷ $5.25 − 1 ≈ −6.1%',
            'Order value fell about 2.9% ($35 → $34); take rate fell about 3.3% (15.0% → 14.5%)',
          ],
        },
        {
          t: 'p',
          md: 'Both drivers moved about equally, so look for a cause behind each: smaller baskets could be a shift to lunch orders or a promotion on single items; a lower take rate could be new restaurant contracts at reduced commission. The next step is to split both by restaurant cohort and order type.',
        },
      ],
    },
    {
      id: 'prioritize',
      h: 'How do you prioritize projects in a BizOps interview?',
      blocks: [
        {
          t: 'p',
          md: 'Score each project on impact (tied to a company goal, in dollars or a key metric) and effort (people, time, dependencies). Scoring models such as RICE (reach, impact, confidence, effort) make the reasoning explicit. Then say what you would **not** do and why. Choosing what to drop is the part interviewers remember.',
        },
      ],
    },
    {
      id: 'skills',
      h: 'What do strategy and operations interviewers look for?',
      blocks: [
        {
          t: 'table',
          head: ['Skill', 'What strong looks like'],
          rows: [
            ['Structured problem solving', 'Breaks a vague question into a MECE set of drivers and tests the likeliest first'],
            ['Quantitative fluency', 'Comfortable with spreadsheets, SQL or quick mental math; sanity-checks every number'],
            ['Business judgment', 'Knows which metrics matter for this business model, and why'],
            ['Execution', 'Turns an answer into owners, milestones and a way to measure progress'],
            ['Influence without authority', 'Gets other teams to act on the analysis'],
          ],
        },
      ],
    },
    {
      id: 'take-home',
      h: 'How should you approach a take-home case?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Restate the question', md: 'Write the decision the analysis must support at the top of your notes.' },
            { title: 'Check the data', md: 'Missing values, duplicates, odd outliers, and what each field really means. State the assumptions you make.' },
            { title: 'Build a driver tree', md: 'Decompose the metric in question before making charts.' },
            { title: 'Find the story', md: 'Two or three findings that answer the question, each with a number.' },
            { title: 'Recommend', md: 'Lead with the answer, then the evidence, risks and next steps. Keep it to a few slides.' },
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes do candidates make in BizOps interviews?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Charts without a conclusion.** Every slide title should state a finding.',
            '**Trusting the data blindly.** Check for duplicates, gaps and odd values before analyzing; noticing them is part of the job.',
            '**Recommending everything.** Prioritize, and say what you would drop.',
            '**Stopping at the answer.** Say who owns the fix and how you would track it.',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a BizOps interview?',
      a: 'An interview for business operations or strategy and operations roles. It usually combines case questions, a metric or data exercise, and behavioral questions about driving cross-functional projects.',
    },
    {
      q: 'Is a strategy and operations case the same as a consulting case?',
      a: 'The thinking is the same. S&O cases lean more on the company\'s own metrics and data, and on how you would get the solution implemented.',
    },
  ],
  practice: { caseCodes: ['US-C-06', 'US-C-17', 'US-C-16'] },
  related: ['operations-case-framework', 'issue-trees', 'case-interview-math', 'product-manager-case-interview'],
  keywords: ['strategy and operations interview', 'BizOps interview', 'chief of staff interview case', 'business operations case study', 'take-home case study'],
  published: D,
  modified: D,
};

export const FINANCE: LearnPage = {
  slug: 'finance-case-interview',
  cluster: 'roles',
  nav: 'Finance',
  title: 'Finance case interviews: variance analysis, business cases and valuation',
  metaTitle: 'Finance Case Interview: FP&A, Business Case and Valuation',
  description:
    'How FP&A, corporate finance and corporate development interviews use cases: price-volume variance, investment business cases with NPV, and key finance metrics.',
  ogKind: 'toolkit',
  eyebrow: 'Role guides',
  answer:
    'Finance case interviews for FP&A, corporate finance and corporate development roles test whether you can turn numbers into a business decision: explain a budget variance, build the business case for an investment, or judge whether an acquisition creates value. Expect margin math, NPV and payback, variance analysis, and a clear recommendation.',
  takeaways: [
    '**Split revenue variance into price, volume and mix effects.**',
    '**A business case compares incremental cash flows** with the investment, at the cost of capital.',
    '**Know the core metrics:** EBITDA, free cash flow, working capital, ROIC.',
    '**Finish with the decision,** not the spreadsheet.',
  ],
  sections: [
    {
      id: 'variance',
      h: 'How do you explain a budget variance?',
      blocks: [
        {
          t: 'p',
          md: 'Split the gap into what came from selling a different volume and what came from selling at a different price. A fictional single-product example:',
        },
        {
          t: 'math',
          title: 'Price-volume variance (illustrative)',
          lines: [
            'Budget: 100,000 units × $50 = $5.00M. Actual: 90,000 units × $54 = $4.86M. Variance: −$0.14M',
            'Volume effect: (90,000 − 100,000) × $50 budget price = −$0.50M',
            'Price effect: ($54 − $50) × 90,000 actual units = +$0.36M',
            'Total: −$0.50M + $0.36M = −$0.14M, matching the variance',
          ],
        },
        {
          t: 'p',
          md: 'The story: a price increase held, but it cost more volume than planned. The question for management is whether the 10% volume loss is temporary or a sign that customers are switching.',
        },
      ],
    },
    {
      id: 'business-case',
      h: 'How do you build a business case for an investment?',
      blocks: [
        {
          t: 'math',
          title: 'A new finance system (illustrative)',
          lines: [
            'Up-front cost $3.0M; running cost $0.4M a year; labor savings $1.2M a year → net $0.8M a year',
            'Payback: $3.0M ÷ $0.8M = 3.75 years',
            'NPV over 7 years at 9%: annuity factor (1 − 1.09^−7) ÷ 0.09 ≈ 5.03',
            'NPV ≈ $0.8M × 5.03 − $3.0M ≈ +$1.0M',
          ],
        },
        {
          t: 'p',
          md: 'Positive NPV, but the case rests on the labor savings. A strong answer tests the downside: if savings come in at $0.9M instead of $1.2M, the net benefit falls to $0.5M a year and the NPV becomes negative (about $0.5M × 5.03 − $3.0M ≈ −$0.5M).',
        },
      ],
    },
    {
      id: 'metrics',
      h: 'Which finance metrics should you know for a case interview?',
      blocks: [
        {
          t: 'table',
          head: ['Metric', 'Definition'],
          rows: [
            ['EBITDA', 'Earnings before interest, taxes, depreciation and amortization'],
            ['Free cash flow', 'Operating cash flow − capital expenditures'],
            ['Working capital', 'Current assets − current liabilities'],
            ['Days sales outstanding', 'Accounts receivable ÷ revenue × 365'],
            ['Return on invested capital (ROIC)', 'After-tax operating profit ÷ invested capital'],
            ['Payback period', 'Up-front investment ÷ annual net cash flow'],
          ],
        },
      ],
    },
    {
      id: 'present',
      h: 'How do you present a finance case recommendation?',
      blocks: [
        {
          t: 'steps',
          items: [
            { title: 'Lead with the decision', md: '"Approve the investment" or "the variance is mostly volume, and it is likely to persist."' },
            { title: 'Give the key number', md: 'NPV, payback, or the size of each variance component.' },
            { title: 'Show the sensitivity', md: 'Which assumption flips the answer, and how far it would have to move.' },
            { title: 'Name the next step', md: 'What to verify before committing money, and who should own it.' },
          ],
        },
      ],
    },
    {
      id: 'mistakes',
      h: 'What mistakes do candidates make in finance cases?',
      blocks: [
        {
          t: 'ul',
          items: [
            '**Mixing up profit and cash.** Depreciation, working capital and capital spending separate them.',
            '**Forgetting the time value of money** when comparing costs today with savings later.',
            '**Presenting a single-point estimate** without a downside case.',
            '**Explaining variances without a cause.** "Volume was down" needs a why.',
          ],
        },
      ],
    },
    {
      id: 'corp-dev',
      h: 'What do corporate development interviews add?',
      blocks: [
        {
          t: 'p',
          md: 'Corporate development roles add deal questions: is this target worth the price, what synergies are realistic, and how would the deal change earnings? The [M&A case guide](/us/learn/mergers-and-acquisitions-case) covers the framework, valuation by multiples and a simple private equity returns calculation.',
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'What is an FP&A case study interview?',
      a: 'A problem such as explaining a budget variance, building a forecast or evaluating an investment, usually with a small dataset. It tests accounting fluency, analytical structure and the ability to explain what the numbers mean.',
    },
    {
      q: 'What is the difference between price, volume and mix variance?',
      a: 'Volume variance comes from selling more or fewer units, price variance from selling at a different price, and mix variance from selling a different combination of products with different prices or margins.',
    },
  ],
  practice: { caseCodes: ['US-C-50', 'US-C-40', 'US-C-41'] },
  related: ['mergers-and-acquisitions-case', 'case-interview-math', 'profitability-framework', 'cost-reduction-framework'],
  keywords: ['finance case interview', 'FP&A case study', 'variance analysis', 'business case NPV', 'corporate development interview', 'finance interview questions'],
  published: D,
  modified: D,
};

export const ROLES: LearnPage[] = [PRODUCT_MANAGER, SALES, MARKETING, HR, STRATEGY_OPS, FINANCE];
