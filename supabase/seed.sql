-- MECE seed data
-- Run this against your Supabase project AFTER the tables are created.
-- Safe to re-run (uses ON CONFLICT DO NOTHING on primary keys).

-- ============================================================
-- 1) cases (5 dummy cases across all 4 types, Indian context)
-- ============================================================
INSERT INTO public.cases (id, title, type, difficulty, content, hint, is_active) VALUES
('11111111-1111-1111-1111-111111111101',
 'Estimate the market size for online MBA prep in India',
 'market_sizing',
 'medium',
 'Estimate the annual market size (in INR crore) for online MBA / CAT preparation in India. State your assumptions clearly. Walk through the funnel from total college-going population to actually-paying online learners. Conclude with a single point estimate and a sensitivity range.',
 'Start with India''s graduating population each year (~9-10 mn). Funnel down: % aspiring to MBA, % using paid prep, % choosing online over offline, average annual spend (Rs 8k-30k tiers).',
 true),

('11111111-1111-1111-1111-111111111102',
 'Number of dosas sold in Bengaluru on a weekday',
 'guesstimate',
 'easy',
 'How many dosas are sold across Bengaluru on a typical Tuesday? Break the city into segments (households, office canteens, darshinis, restaurants, food delivery). Build up the number and stress-test it.',
 'Bengaluru has ~13 mn people, ~3 mn households. Think about breakfast vs dinner consumption. Don''t forget Swiggy/Zomato dosa orders.',
 true),

('11111111-1111-1111-1111-111111111103',
 'Zomato''s profitability puzzle',
 'profitability',
 'hard',
 'A food-delivery platform like Zomato is reporting shrinking losses but still negative contribution margin in tier-2 cities. As a strategy consultant, diagnose the root cause and recommend 3 concrete levers to push tier-2 contribution margin positive within 18 months.',
 'Use the Profit = Revenue – Cost framework. On revenue: AOV, take-rate, ads. On cost: delivery cost per order, discounts, customer-acquisition cost. Look at density / orders per rider per hour.',
 true),

('11111111-1111-1111-1111-111111111104',
 'Growth strategy for a D2C ayurvedic skincare brand',
 'growth',
 'medium',
 'A 2-year-old D2C ayurvedic skincare brand is at Rs 50 cr ARR, growing 8% MoM. The founder wants to hit Rs 250 cr ARR in 18 months. Recommend the top 3 growth levers across acquisition, retention and category expansion. Quantify expected contribution from each lever.',
 'Think Ansoff matrix. Existing customers (retention / repeat) vs new customers (paid + organic) vs new products (haircare, mens, wellness). Include marketplace strategy (Amazon, Nykaa, Quick-commerce).',
 true),

('11111111-1111-1111-1111-111111111105',
 'Estimate annual electricity consumption of all Mumbai locals',
 'guesstimate',
 'hard',
 'Estimate the annual electricity consumption (in kWh) of the entire Mumbai suburban railway network. Cover both Western and Central lines, including AC trains. Show your structure clearly.',
 'Per train per km consumption (~3-4 kWh/km), number of trains, daily km per train, working days per year. Don''t forget station overheads (lighting, escalators, AC).',
 true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2) gd_briefs (1 sample brief)
-- ============================================================
INSERT INTO public.gd_briefs (
  id, topic, summary, points_for, points_against, smart_angles, data_points,
  how_to_open, how_to_close, source_url
) VALUES (
  '22222222-2222-2222-2222-222222222201',
  'Should India phase out petrol & diesel two-wheelers by 2035?',
  'Two-wheelers make up roughly 75% of India''s vehicle population and are a major contributor to urban air pollution. The government''s FAME-II push and state-level EV incentives have accelerated EV two-wheeler adoption, but range anxiety, charging infrastructure and battery cost remain real blockers for tier-2/3 buyers.',
  ARRAY[
    'Two-wheelers contribute ~30% of vehicular PM2.5 in major Indian cities.',
    'A 2035 deadline gives the industry a clear long-term planning horizon, just like the EU mandate did.',
    'Lower lifetime cost of ownership for EVs once charging density crosses a threshold.'
  ],
  ARRAY[
    '~80% of India''s two-wheeler buyers are first-time motorised mobility owners — raising prices hurts mobility equity.',
    'Charging infrastructure in tier-3 towns and villages is still under 10% of what''s needed.',
    'Battery raw materials (lithium, nickel, cobalt) are heavily import-dependent — just trading one dependency for another.'
  ],
  ARRAY[
    'Frame it as a phased transition (urban-first, then rural) rather than a single 2035 cutoff.',
    'Tie it to India''s 2070 net-zero pledge — transportation is one of the hardest sectors to decarbonise.',
    'Push the swap-not-charge model (Bounce, Sun Mobility) as the India-specific play.'
  ],
  ARRAY[
    'India sold ~9.5 lakh electric two-wheelers in FY24 (~5.4% of total 2W sales).',
    'Average petrol 2W lifetime CO2 emissions: ~10 tonnes; EV equivalent on Indian grid: ~4 tonnes.',
    'FAME-II outlay: Rs 10,000 crore; PLI for ACC batteries: Rs 18,100 crore.'
  ],
  'India''s transition to EV two-wheelers isn''t a question of if — it''s a question of how fast, and at whose cost. A 2035 cutoff sounds bold, but the real test is whether we can build the charging spine for Bharat, not just for metros.',
  'A blanket 2035 ban will only succeed if it''s paired with cheap financing, swap stations in tier-3 towns and a clear plan for petrol-2W workers in service ecosystems. Otherwise it risks being a climate policy that hurts the bottom of the pyramid.',
  'https://www.example.com/india-ev-2w-policy'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3) learn_content (one entry per case type, ~200 words each)
-- ============================================================
INSERT INTO public.learn_content (id, case_type, title, body, display_order) VALUES
('33333333-3333-3333-3333-333333333301',
 'guesstimate',
 'How to crack any guesstimate',
 'A guesstimate is not about getting the "right" number. It''s about showing the interviewer a clean, layered thinking structure that any reasonable person can follow. Always start by clarifying the question: are we estimating per day, per year, in volume or in value? Once the scope is clear, pick a top-down or bottom-up approach. Top-down works when you have a clean macro number to start from (e.g. India''s population, total smartphone users). Bottom-up works when the unit of analysis is well defined (e.g. dosas per household). Break the problem into 3-4 layers max — more than that and you''ll lose the interviewer. State every assumption explicitly: "I''m assuming average household size is 4 in urban India." Use round, easy numbers — you''re testing logic, not arithmetic. At the end, give a single point estimate and a sanity check: "Does this number feel right given what we know about the market?" Bonus points if you flag the most sensitive assumption and how the answer changes if it''s off by 20%.',
 1),

('33333333-3333-3333-3333-333333333302',
 'profitability',
 'The profitability case framework',
 'Profitability cases follow a deceptively simple equation: Profit = Revenue – Cost. Almost every profitability case is about figuring out which side of that equation broke, and why. Step one: ask whether the issue is industry-wide or company-specific. If competitors are also losing money, it''s a structural issue. Step two: break Revenue into Price × Volume, and Volume into segments (geography, customer type, product line). Most real-world profit issues hide inside a single segment dragging the average down. Step three: split Costs into fixed and variable. Variable costs (raw material, last-mile delivery, payment gateway) scale with orders; fixed costs (rent, head office salaries) don''t. A growing company with rising losses often has a variable cost problem — a contribution-margin problem. Step four: triangulate with industry benchmarks. Once you''ve found the root cause, recommend 2-3 levers, each tied back to a P&L line. Always close with a 30/60/90-day implementation view. Interviewers love candidates who connect frameworks to operating reality.',
 1),

('33333333-3333-3333-3333-333333333303',
 'market_sizing',
 'Market sizing: top-down vs bottom-up',
 'Market sizing is the cousin of guesstimation, but with a sharper commercial purpose: you''re sizing a real business opportunity. There are two clean approaches. Top-down: start with a macro number (population, GDP, total category spend) and progressively narrow down using % filters. Use this when reliable macro data exists. Bottom-up: identify your unit of demand (a household, a college, a hospital) and multiply by number of units and frequency. Use this when category-level data is thin, like for early-stage products. The best answers triangulate both. Always size three layers: TAM (Total Addressable Market — if everyone bought), SAM (Serviceable Addressable Market — in your geography / segment), and SOM (Serviceable Obtainable Market — realistically capturable in 3-5 years). State your time horizon. Convert volume to value using a defensible average price point. End with a sensitivity statement: "If online penetration grows from 15% to 25%, the SAM jumps from Rs X to Rs Y." Interviewers want to see you think like an investor, not a calculator.',
 1),

('33333333-3333-3333-3333-333333333304',
 'growth',
 'Growth strategy: the 3 levers that actually move the needle',
 'Growth cases reward candidates who think in second-order effects. The classic Ansoff matrix — existing vs new products on one axis, existing vs new markets on the other — still holds. But in modern Indian consumer / SaaS contexts, three lever clusters dominate. First, retention and frequency: cheaper than acquisition, compounds over time. Look at cohort retention curves; if month-6 retention is under 30%, fix the product before pouring money into ads. Second, channel and acquisition mix: Meta and Google CAC has risen 3-4x in the last three years. Look for under-priced channels — quick-commerce, vernacular YouTube, regional influencer pods, ONDC. Third, category expansion: adjacent products to existing customers. Boat went from earphones to smartwatches; Mamaearth from babycare to mens. Tag every recommendation with three numbers: expected lift, investment required, payback period. Avoid "do everything" answers — the interviewer wants 2-3 sharp, prioritised bets with reasoning. The best growth answers feel like an exec memo, not a brainstorm.',
 1)
ON CONFLICT (id) DO NOTHING;
-- =====================================================================
-- Seed: Skill Constellation Graph
-- Inserts the 22 core nodes and their edges.
-- =====================================================================

insert into public.skill_nodes (id, cluster, label, x_pos, y_pos, is_boss) values
  ('p1', 'prof', 'P&L drivers', 14, 22, false),
  ('p2', 'prof', 'Cost structure', 22, 14, false),
  ('p3', 'prof', 'Margin defense', 30, 26, false),
  ('p4', 'prof', 'Combined ratio', 18, 34, true),

  ('s1', 'size', 'Top-down', 60, 14, false),
  ('s2', 'size', 'Bottom-up', 70, 20, false),
  ('s3', 'size', 'Sanity checks', 78, 12, false),
  ('s4', 'size', 'Cross-validation', 84, 26, false),

  ('r1', 'pri', 'Value-based', 76, 46, false),
  ('r2', 'pri', 'Bundle pricing', 86, 54, false),
  ('r3', 'pri', 'Elasticity', 70, 60, false),

  ('e1', 'ent', 'Market attractive', 22, 56, false),
  ('e2', 'ent', 'Mode of entry', 14, 64, false),
  ('e3', 'ent', 'Competitive resp.', 28, 70, false),

  ('m1', 'ma', 'Synergies', 44, 78, false),
  ('m2', 'ma', 'Valuation', 56, 80, false),
  ('m3', 'ma', 'Integration', 38, 86, false),

  ('o1', 'ops', 'Throughput', 8, 80, false),
  ('o2', 'ops', 'Bottleneck', 4, 70, false),

  ('c1', 'soft', 'Structuring', 44, 22, false),
  ('c2', 'soft', 'Communication', 50, 12, false),
  ('c3', 'soft', 'Hypothesis-led', 38, 14, false)
on conflict (id) do update set
  cluster = excluded.cluster,
  label = excluded.label,
  x_pos = excluded.x_pos,
  y_pos = excluded.y_pos,
  is_boss = excluded.is_boss;

insert into public.skill_edges (source_id, target_id) values
  ('p1', 'p2'), ('p1', 'p3'), ('p3', 'p4'), ('p2', 'c3'), ('c3', 'c1'), ('c1', 'c2'),
  ('s1', 's2'), ('s2', 's3'), ('s2', 's4'), ('c1', 's1'),
  ('s4', 'r1'), ('r1', 'r2'), ('r2', 'r3'),
  ('p4', 'e1'), ('e1', 'e2'), ('e1', 'e3'), ('e3', 'm1'),
  ('m1', 'm2'), ('m1', 'm3'),
  ('e2', 'o1'), ('o1', 'o2')
on conflict (source_id, target_id) do nothing;
