-- =====================================================================
-- Constellation case seed — owner directive 2026-06-07
--
-- Makes the constellation actually navigable end-to-end:
--   1. Round-robin existing cases across skill_nodes within their cluster
--      so every node that already has data backing it ends up tagged.
--   2. Insert starter cases for the four clusters that had no case_type
--      match (pri / ma / ops / soft) so users clicking those nodes don't
--      land on an empty practice list.
--
-- Idempotent: re-runnable safely.
--   - Backfill only touches rows where skill_node IS NULL.
--   - Starter inserts use ON CONFLICT (code) DO NOTHING so a second run
--     is a no-op.
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- Step 1: round-robin existing cases across nodes within their cluster.
-- ─────────────────────────────────────────────────────────────────────
-- Each case_type (profitability, market_sizing, growth) maps to one
-- cluster; within that cluster we spread cases across the cluster's
-- nodes using a deterministic modulo on row_number.

with ranked as (
  select
    c.id,
    c.type,
    row_number() over (partition by c.type order by c.created_at, c.id) - 1 as rn
  from public.cases c
  where c.skill_node is null
    and c.is_active = true
    and c.type in ('profitability', 'market_sizing', 'growth')
),
node_lookup as (
  -- Distinct nodes per cluster, with a stable index per node for the
  -- modulo step below.
  select
    cluster,
    id as node_id,
    row_number() over (partition by cluster order by id) - 1 as idx,
    count(*) over (partition by cluster) as cluster_size
  from public.skill_nodes
),
case_to_cluster as (
  select
    r.id,
    case
      when r.type = 'profitability' then 'prof'
      when r.type = 'market_sizing' then 'size'
      when r.type = 'growth'        then 'ent'
    end as cluster,
    r.rn
  from ranked r
),
assignments as (
  select
    c.id,
    nl.node_id,
    c.cluster
  from case_to_cluster c
  join node_lookup nl
    on nl.cluster = c.cluster
   and nl.idx = (c.rn % nl.cluster_size)
)
update public.cases
   set skill_node    = a.node_id,
       skill_cluster = coalesce(public.cases.skill_cluster, a.cluster)
  from assignments a
 where public.cases.id = a.id
   and public.cases.skill_node is null;

-- ─────────────────────────────────────────────────────────────────────
-- Step 2: starter cases for clusters with no matching case_type.
-- ─────────────────────────────────────────────────────────────────────
-- These four clusters (pricing, M&A, operations, foundations) have no
-- corresponding `case_type` in the CHECK constraint, so we author cases
-- under the closest existing type and tag them with the real cluster.
-- Each insert has a stable `code` so the upsert is idempotent and the
-- cases are easy to find / replace later.

-- Helper: list of starter cases. Title is short; content is a real
-- 15-minute prompt so the user can actually solve it.
insert into public.cases (code, title, type, difficulty, content, is_active, skill_node, skill_cluster, interview_meta)
values
  -- ── Pricing (pri) ───────────────────────────────────────────────
  (
    'PRI-001',
    'Bundle pricing for a 4G+OTT telco combo',
    'profitability',
    'medium',
    E'# Bundle pricing for a 4G+OTT telco combo\n\n**Client situation.** A national telco operator is launching a bundle: 4G data + 3 OTT subscriptions (1 video, 1 music, 1 sports). The marketing team has proposed three price points (₹399 / ₹499 / ₹699 a month) and wants a recommendation.\n\n## Your task (≈ 15 min)\n\n1. **What does the bundle cost the telco?** Decompose the unit economics — data, OTT rev-share, customer-acquisition cost.\n2. **What''s the right willingness-to-pay anchor?** Estimate it. State your assumptions.\n3. **Which of the three price points wins?** Defend with a margin / volume tradeoff.\n4. **What''s the one risk you''d flag to the CFO?**',
    true,
    'r2',
    'pri',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'PRI-002',
    'Value-based pricing for an enterprise SaaS upgrade',
    'profitability',
    'hard',
    E'# Value-based pricing for an enterprise SaaS upgrade\n\n**Client situation.** A B2B analytics SaaS is releasing a Pro tier (real-time dashboards, custom alerts). Current Standard tier is $49/seat/mo. The CRO wants a defensible Pro price and a migration plan.\n\n## Your task (≈ 15 min)\n\n1. **Quantify the value gap.** What does the Pro tier save / earn for a typical customer? Pick a representative segment.\n2. **What''s the upper bound on price?** Use a value-based framework — not cost-plus.\n3. **Recommend the price and the migration nudge.** How aggressive should the upsell be?\n4. **What metric do you track in week 4 to know it''s working?**',
    true,
    'r1',
    'pri',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'PRI-003',
    'Demand elasticity for a quick-commerce category',
    'profitability',
    'medium',
    E'# Demand elasticity for a quick-commerce category\n\n**Client situation.** A 10-minute grocery delivery app is testing price elasticity on packaged snacks (₹50 SKUs). A/B tests show a 10% price drop lifts units 18%.\n\n## Your task (≈ 15 min)\n\n1. **What''s the implied elasticity?** Is the category elastic or inelastic at this margin?\n2. **Should they drop the price permanently?** Consider basket effects, not just per-SKU revenue.\n3. **What''s the second-order risk?** Competitor response, supplier reaction, customer expectation.\n4. **One sentence to the founder.**',
    true,
    'r3',
    'pri',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── M&A (ma) ────────────────────────────────────────────────────
  (
    'MA-001',
    'Synergy case: acquiring a niche cybersecurity firm',
    'profitability',
    'hard',
    E'# Synergy case: acquiring a niche cybersecurity firm\n\n**Client situation.** A large enterprise software vendor is bidding for a 200-person cybersecurity startup with $40M ARR. The thesis is cross-sell to existing enterprise accounts.\n\n## Your task (≈ 15 min)\n\n1. **Size the cross-sell synergy.** How many accounts? What attach rate? What ASP?\n2. **What synergies are hard, what''s soft?** Separate cost from revenue, defendable from speculative.\n3. **What''s the breakeven multiple?** If they paid 10x ARR, when does it pay back?\n4. **What''s the deal-killer you''d raise in DD?**',
    true,
    'm1',
    'ma',
    '{"firm":"BCG","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MA-002',
    'Valuation: a regional retail chain takeover',
    'profitability',
    'medium',
    E'# Valuation: a regional retail chain takeover\n\n**Client situation.** A PE firm is bidding for a 60-store regional supermarket chain. Standalone EBITDA is ₹240 cr. Asking price is ₹2,400 cr (10x).\n\n## Your task (≈ 15 min)\n\n1. **Is 10x EBITDA reasonable for this category?** What''s the comp set?\n2. **Where''s the value-creation lever?** Same-store growth, new stores, margin expansion, or exit multiple?\n3. **What''s your bid?** Justify with one or two of the levers above.\n4. **What''s the single biggest assumption that could be wrong?**',
    true,
    'm2',
    'ma',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MA-003',
    'Post-merger integration of two consumer brands',
    'growth',
    'medium',
    E'# Post-merger integration of two consumer brands\n\n**Client situation.** Two mid-size FMCG brands (skincare + haircare) just merged. CEO wants a 100-day integration plan that protects revenue and unlocks ₹80 cr of cost synergy.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the ₹80 cr coming from?** Decompose by function (procurement, supply chain, headcount, marketing).\n2. **What do you NOT touch in the first 100 days?** Revenue-protecting decisions.\n3. **Who owns each workstream?** One sentence on governance.\n4. **What''s the one early signal that integration is going off the rails?**',
    true,
    'm3',
    'ma',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── Operations (ops) ────────────────────────────────────────────
  (
    'OPS-001',
    'Throughput at a regional dairy processing plant',
    'profitability',
    'medium',
    E'# Throughput at a regional dairy processing plant\n\n**Client situation.** A cooperative dairy''s flagship plant processes 4 lakh litres/day. Demand has grown 25% YoY; the plant is at 92% utilisation. CEO wants more throughput without a greenfield expansion.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the bottleneck?** Walk through receiving → pasteurisation → packaging → dispatch.\n2. **What''s the quickest 15% capacity gain?** Process change, shift change, capex — rank by ROI and time.\n3. **What breaks if you push past 100% utilisation?** Quality, maintenance, staffing.\n4. **What do you tell the CEO in one line?**',
    true,
    'o1',
    'ops',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'OPS-002',
    'Identifying the bottleneck in an e-commerce warehouse',
    'profitability',
    'medium',
    E'# Identifying the bottleneck in an e-commerce warehouse\n\n**Client situation.** A pure-play e-commerce warehouse ships 12k orders/day but promises 24-hour delivery. SLA breaches have climbed from 2% to 9% in three months.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the breach happening?** Pick → pack → ship → last-mile.\n2. **Diagnose the cause.** Volume, layout, staffing, software, or carrier?\n3. **What''s the fix this week vs the fix this quarter?**\n4. **One metric you''d watch daily to know it''s working.**',
    true,
    'o2',
    'ops',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),

  -- ── Foundations (soft) ──────────────────────────────────────────
  (
    'SOFT-001',
    'Structure a profitability case from a one-line brief',
    'profitability',
    'easy',
    E'# Structure a profitability case from a one-line brief\n\n**Client situation.** "Our profits are down. Fix it."\n\nThat''s the entire brief from the CEO of a mid-size insurance company. No data, no context.\n\n## Your task (≈ 15 min)\n\n1. **What are your first three clarifying questions?** Order them — most important first.\n2. **Lay out a MECE structure for diagnosing this.** Revenue side and cost side.\n3. **Where would you dig first, and why?** Use industry priors.\n4. **How would you know in one hour whether your hypothesis is right?**',
    true,
    'c1',
    'soft',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'SOFT-002',
    'Communicate a tough recommendation in 60 seconds',
    'profitability',
    'easy',
    E'# Communicate a tough recommendation in 60 seconds\n\n**Client situation.** You''ve concluded that a client''s pet project (a new flagship store) should be killed. You have 60 seconds with their CEO at the end of an unrelated meeting.\n\n## Your task (≈ 15 min)\n\n1. **What''s your opening sentence?** One line, no fluff.\n2. **What are the two pieces of evidence you lead with?** Numbers, not adjectives.\n3. **What''s the alternative you propose so the conversation doesn''t end at "no"?**\n4. **What objection do you pre-empt before the CEO can raise it?**',
    true,
    'c2',
    'soft',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'SOFT-003',
    'Hypothesis-led: a SaaS company''s churn just spiked',
    'profitability',
    'medium',
    E'# Hypothesis-led: a SaaS company''s churn just spiked\n\n**Client situation.** Monthly churn jumped from 2.1% to 3.4% over Q3. CRO wants a diagnosis by Friday.\n\n## Your task (≈ 15 min)\n\n1. **State your top-three hypotheses.** Be specific: not "churn went up", but a mechanism.\n2. **For each, what''s the one data cut that proves or kills it?**\n3. **Which do you investigate first, and why?**\n4. **If all three are wrong, what would you look at next?**',
    true,
    'c3',
    'soft',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  )
on conflict (code) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Sanity counts — uncomment to verify after running.
-- ─────────────────────────────────────────────────────────────────────
-- select skill_cluster, count(*) from public.cases where is_active = true group by skill_cluster order by 1;
-- select skill_node, count(*) from public.cases where is_active = true and skill_node is not null group by skill_node order by 1;
