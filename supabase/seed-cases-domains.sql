-- =====================================================================
-- Practice domains expansion — 2026-06-21
--
-- The /practice "All domains" dropdown is built from distinct cases.type.
-- Until now only `profitability`, `market_sizing`, `growth` existed, so the
-- dropdown showed 3 domains. This seed adds four more domains as first-class
-- case TYPES — market entry, pricing, m&a, operations — each with 5 cases of
-- mixed difficulty, plus 6 mixed-difficulty guesstimates. Every domain now
-- resolves to >= 5 attemptable practice questions.
--
-- Structure mirrors seed-cases-constellation.sql exactly:
--   columns (code, title, type, difficulty, content, is_active,
--            skill_node, skill_cluster, interview_meta)
--   content = a real ~15-minute markdown prompt; difficulty in easy|medium|hard.
--   skill_node left NULL (constellation backfill only touches the 3 legacy
--   types); skill_cluster tagged for future linking.
--
-- Idempotent: ON CONFLICT (code) DO NOTHING — safe to re-run.
-- REQUIRES: run migrations/0017_cases_type_expand.sql FIRST (it widens the
-- cases.type CHECK to allow these new domains; otherwise inserts fail 23514).
-- Scenarios are wholly invented for practice; no resemblance to real deals.
-- =====================================================================

insert into public.cases (code, title, type, difficulty, content, is_active, skill_node, skill_cluster, interview_meta)
values
  -- ── Market Entry (ent) ──────────────────────────────────────────
  (
    'ME-101',
    'Should a Korean instant-ramen brand enter India?',
    'market entry',
    'easy',
    E'# Should a Korean instant-ramen brand enter India?\n\n**Client situation.** A leading Korean instant-noodle maker is considering an India launch. India already has strong incumbents (Maggi, Yippee) at ₹12–15 a pack; the Korean product would land closer to ₹40.\n\n## Your task (≈ 15 min)\n\n1. **Is the market attractive?** Size the relevant instant-noodle opportunity and the premium sub-segment.\n2. **Can they win?** What right-to-win do they have versus entrenched ₹12 incumbents?\n3. **How should they enter?** Channel, pricing tier, and where to start geographically.\n4. **Go / no-go in one line.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'ME-102',
    'A European EV-charging firm eyeing Indian metros',
    'market entry',
    'medium',
    E'# A European EV-charging firm eyeing Indian metros\n\n**Client situation.** A European fast-charging network operator wants to enter India, starting with two metros. India''s public-charging market is nascent, fragmented, and policy-driven.\n\n## Your task (≈ 15 min)\n\n1. **Size the near-term demand.** Build from the EV park and realistic public-charging behaviour.\n2. **What''s the unit economics of one charger?** Utilisation, tariff, payback.\n3. **Build vs partner.** Should they own sites or partner with malls/fuel retailers?\n4. **The single biggest risk to the thesis?**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'ME-103',
    'A US fitness app expanding into tier-2 India',
    'market entry',
    'medium',
    E'# A US fitness app expanding into tier-2 India\n\n**Client situation.** A US subscription fitness app (₹999/mo equivalent) is strong in Indian metros but flat. The board wants tier-2 expansion. Smartphone penetration is high; willingness to pay for fitness is unproven.\n\n## Your task (≈ 15 min)\n\n1. **Is tier-2 a real market or a vanity goal?** What evidence would convince you?\n2. **What has to change to win there?** Price, content, language, payment.\n3. **What''s the cheapest test before a full launch?**\n4. **Recommend: enter, pilot, or hold — and why.**',
    true, null, 'ent',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'ME-104',
    'A Japanese convenience-store chain enters India',
    'market entry',
    'hard',
    E'# A Japanese convenience-store chain enters India\n\n**Client situation.** A Japanese konbini giant (think 24x7 ready-meals, bill payments, ATMs) is evaluating India. The format has no clean Indian analogue; kiranas and modern convenience both exist.\n\n## Your task (≈ 15 min)\n\n1. **What job would the format do for an Indian customer?** Define the wedge.\n2. **Size a single-store P&L.** Footfall, basket, margin, rent — does one store work?\n3. **What localisation is non-negotiable?** Assortment, fresh-food supply chain, payments.\n4. **Where do they open the first 20 stores, and what''s the kill criterion?**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'ME-105',
    'Fast-fashion brand: own stores, marketplace, or franchise?',
    'market entry',
    'hard',
    E'# Fast-fashion brand: own stores, marketplace, or franchise?\n\n**Client situation.** A global fast-fashion label is committed to entering India. The open question is the mode: company-owned stores, online marketplaces (Myntra/Ajio), or a franchise partner.\n\n## Your task (≈ 15 min)\n\n1. **Compare the three modes** on speed, control, capital, and margin.\n2. **Quantify the trade-off.** What does each mode imply for break-even and 3-year reach?\n3. **What does the brand''s positioning demand** of the channel?\n4. **Recommend a mode (or sequence) and defend it.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),

  -- ── Pricing (pri) ───────────────────────────────────────────────
  (
    'PRC-101',
    'Pricing a new premium loose-leaf tea SKU',
    'pricing',
    'easy',
    E'# Pricing a new premium loose-leaf tea SKU\n\n**Client situation.** A packaged-foods company is launching a premium single-origin tea. Its mass tea sells at ₹120/250g; the new SKU costs ~2.2x to make.\n\n## Your task (≈ 15 min)\n\n1. **Set the pricing floor.** What''s the cost-plus minimum?\n2. **Find the ceiling.** What reference points cap willingness to pay (cafe tea, imported brands)?\n3. **Pick a price and pack size.** Justify on margin and shelf positioning.\n4. **One launch risk to watch.**',
    true, null, 'pri',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'PRC-102',
    'Dynamic pricing for an intercity bus operator',
    'pricing',
    'medium',
    E'# Dynamic pricing for an intercity bus operator\n\n**Client situation.** A premium intercity bus operator prices every seat flat. Fridays sell out with a waitlist; Tuesdays run ~55% full. The CEO suspects money is being left on the table.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the leak?** Peak underpricing, off-peak overpricing, or thin demand?\n2. **Design a dynamic-pricing rule.** What variables drive the fare?\n3. **Estimate the revenue upside** from peak capture alone.\n4. **What execution risks (fairness, channel) would you flag?**',
    true, null, 'pri',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'PRC-103',
    'Freemium-to-paid pricing for a vernacular ed-tech app',
    'pricing',
    'medium',
    E'# Freemium-to-paid pricing for a vernacular ed-tech app\n\n**Client situation.** A vernacular exam-prep app has 4M free users but only 1.2% convert to its single ₹999/year plan. Growth wants a pricing/packaging rethink.\n\n## Your task (≈ 15 min)\n\n1. **Diagnose the conversion problem.** Is it price, packaging, or value perception?\n2. **Design a tiered structure.** What goes free, what goes paid, what is premium?\n3. **Where do you set the entry paid tier**, and why might a lower price raise total revenue?\n4. **The one metric you''d track weekly.**',
    true, null, 'pri',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'PRC-104',
    'Value-based pricing for an industrial IoT sensor',
    'pricing',
    'hard',
    E'# Value-based pricing for an industrial IoT sensor\n\n**Client situation.** A startup sells a predictive-maintenance sensor for textile looms. There is no reference price. One hour of unplanned loom downtime costs a mill dearly; the sensor prevents most of it.\n\n## Your task (≈ 15 min)\n\n1. **Build the value pool.** What does downtime cost a typical mill per year?\n2. **Apply the prevention rate** and decide the customer''s share of the surplus.\n3. **Choose the pricing metric** — per sensor, per loom, per outcome, subscription?\n4. **Defend your number to a skeptical plant head.**',
    true, null, 'pri',
    '{"firm":"BCG","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'PRC-105',
    'Razor-and-blades vs flat pricing for water purifiers',
    'pricing',
    'hard',
    E'# Razor-and-blades vs flat pricing for water purifiers\n\n**Client situation.** A home water-purifier company can price the device low and earn on filter replacements (razor-and-blades), or price the device high with cheap filters. Both are on the table.\n\n## Your task (≈ 15 min)\n\n1. **Model lifetime value** under both pricing architectures for a typical household.\n2. **Which model is more defensible** against cheaper third-party filters?\n3. **What does each model demand** of distribution and service?\n4. **Recommend an architecture and the headline price.**',
    true, null, 'pri',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),

  -- ── M&A (ma) ────────────────────────────────────────────────────
  (
    'MNA-101',
    'Should a logistics major buy a regional cold-chain startup?',
    'm&a',
    'easy',
    E'# Should a logistics major buy a regional cold-chain startup?\n\n**Client situation.** A national logistics firm wants cold-chain capability. It can build greenfield over ~4 years or acquire a profitable regional cold-chain player now for ₹450 cr.\n\n## Your task (≈ 15 min)\n\n1. **Frame the strategic intent.** Growth, capability, or defence?\n2. **Buy vs build.** Compare cost, time, and risk of each path.\n3. **Is the asset healthy?** What three things would you check first?\n4. **Your initial recommendation in one line.**',
    true, null, 'ma',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'MNA-102',
    'A PE firm valuing a 40-clinic dental chain',
    'm&a',
    'medium',
    E'# A PE firm valuing a 40-clinic dental chain\n\n**Client situation.** A PE fund is bidding for a 40-clinic dental chain. Standalone EBITDA is ₹70 cr; the ask implies ~12x. The thesis is a 3x return in five years via a buy-and-build roll-up.\n\n## Your task (≈ 15 min)\n\n1. **Reverse-engineer the return.** What exit EBITDA does 3x demand at a sensible exit multiple and leverage?\n2. **Is that growth plausible** from same-clinic growth + new clinics?\n3. **What''s the biggest value-creation lever** — and the biggest risk?\n4. **Bid or pass?**',
    true, null, 'ma',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'MNA-103',
    'Synergy sizing: an FMCG major acquires a D2C oats brand',
    'm&a',
    'medium',
    E'# Synergy sizing: an FMCG major acquires a D2C oats brand\n\n**Client situation.** A large FMCG company is acquiring a fast-growing D2C oats/breakfast brand. The thesis: push the brand through the acquirer''s 1M+ retail outlets.\n\n## Your task (≈ 15 min)\n\n1. **Size the distribution synergy.** Outlets reached x attach rate x ASP.\n2. **Separate hard from soft synergies** — cost vs revenue, defendable vs speculative.\n3. **What could destroy value** (brand dilution, channel conflict)?\n4. **What''s the one diligence question you must answer before signing?**',
    true, null, 'ma',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'MNA-104',
    'Cement major''s southern acquisition: triage the DD findings',
    'm&a',
    'hard',
    E'# Cement major''s southern acquisition: triage the DD findings\n\n**Client situation.** A North-India cement major has signed a non-binding term sheet for a southern producer (4 MTPA, 62% utilisation, chronic regional overcapacity). Commercial DD surfaced four findings.\n\n## Your task (≈ 15 min)\n\n1. **State the deal thesis first** — capacity-entry or current cash flows? It decides everything.\n2. **Triage four findings:** a mining-lease expiry in 7 years; an optimistic utilisation ramp; a below-market power contract expiring in 14 months; a ₹90 cr competition-law matter provisioned at ₹15 cr.\n3. **Which reprice the deal, which kill it, which are noise?**\n4. **Your revised stance on the bid.**',
    true, null, 'ma',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MNA-105',
    'A bank acquiring a fintech lender: integration + regulatory risk',
    'm&a',
    'hard',
    E'# A bank acquiring a fintech lender: integration + regulatory risk\n\n**Client situation.** A mid-size private bank is acquiring a digital consumer-lending fintech to get its origination engine and young customer base. Regulators are watchful; the fintech''s underwriting model is unproven through a full cycle.\n\n## Your task (≈ 15 min)\n\n1. **What''s the bank really buying** — tech, book, team, or customers?\n2. **Stress the asset.** How would the loan book behave in a downturn?\n3. **Integration plan:** what to integrate fast, what to leave alone.\n4. **The regulatory/risk deal-breaker you''d escalate.**',
    true, null, 'ma',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),

  -- ── Operations (ops) ────────────────────────────────────────────
  (
    'OP-101',
    'Queue times at a fast-growing QSR chain',
    'operations',
    'easy',
    E'# Queue times at a fast-growing QSR chain\n\n**Client situation.** A burger QSR chain is getting complaints about long queues at peak lunch hours in its busiest mall outlets, hurting repeat visits.\n\n## Your task (≈ 15 min)\n\n1. **Where''s the wait created?** Walk order → pay → assemble → handover.\n2. **What''s the cheapest fix** that removes the most wait (process, staffing, tech)?\n3. **What would you change for the next new outlet''s layout?**\n4. **One metric to monitor daily.**',
    true, null, 'ops',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'OP-102',
    'Cutting stockouts for a B2B kirana-distribution startup',
    'operations',
    'medium',
    E'# Cutting stockouts for a B2B kirana-distribution startup\n\n**Client situation.** A B2B distribution startup supplies 8,000 kiranas. Fill rate has slipped to 88%; stockouts are driving stores back to traditional distributors.\n\n## Your task (≈ 15 min)\n\n1. **Decompose the 12% miss** — forecasting, warehouse, or last-mile?\n2. **Which SKUs matter most?** How would you prioritise availability?\n3. **What''s the fix this week vs this quarter?**\n4. **The one number you''d put on the founder''s dashboard.**',
    true, null, 'ops',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'OP-103',
    'Improving on-time performance for a regional airline',
    'operations',
    'medium',
    E'# Improving on-time performance for a regional airline\n\n**Client situation.** A regional airline''s on-time performance has fallen to 71%. Delays cascade through the day across its hub-and-spoke network.\n\n## Your task (≈ 15 min)\n\n1. **Where do delays originate** and how do they propagate?\n2. **What''s the highest-leverage intervention** — turnaround time, schedule buffer, or fleet assignment?\n3. **What trade-off does each fix carry** (utilisation vs reliability)?\n4. **Your one-line recommendation to the COO.**',
    true, null, 'ops',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'OP-104',
    'Cutting operating-theatre turnaround at a hospital',
    'operations',
    'hard',
    E'# Cutting operating-theatre turnaround at a hospital\n\n**Client situation.** A multi-specialty hospital runs 8 operating theatres at ~60% utilisation. Surgeons complain of long gaps between cases; management wants more surgeries without new theatres.\n\n## Your task (≈ 15 min)\n\n1. **Map the turnaround** between two surgeries and find the bottleneck.\n2. **Where''s the quickest utilisation gain** — scheduling, cleaning, staffing, or instrument sets?\n3. **What breaks if you push utilisation past ~80%?**\n4. **What do you tell the medical director in one line?**',
    true, null, 'ops',
    '{"firm":"BCG","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'OP-105',
    'Warehouse network design for a quick-commerce scale-up',
    'operations',
    'hard',
    E'# Warehouse network design for a quick-commerce scale-up\n\n**Client situation.** A quick-commerce player promises 10-minute delivery and is scaling from 1 to 5 cities. It must decide how many dark stores per city and where, trading delivery speed against fixed cost.\n\n## Your task (≈ 15 min)\n\n1. **What drives the number of dark stores** per city (coverage radius, demand density)?\n2. **Model the trade-off** — more stores cut delivery time but spread fixed cost thinner.\n3. **What''s the break-even orders/store/day** that justifies a new store?\n4. **Your rollout principle for a new city.**',
    true, null, 'ops',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),

  -- ── Guesstimates (size) ─────────────────────────────────────────
  (
    'GST-101',
    'Office chairs in Bengaluru''s tech parks',
    'guesstimate',
    'easy',
    E'# Office chairs in Bengaluru''s tech parks\n\nEstimate the number of office chairs across Bengaluru''s organised tech parks.\n\n## How to approach (≈ 10 min)\n\n1. Anchor on the IT/ITeS workforce in organised parks.\n2. Chairs per employee (desk + meeting-room + spares).\n3. Build the number, then sanity-check against seats-per-sq-ft norms.',
    true, null, 'size',
    '{"firm":"Bain","round":"associate","est_minutes":10,"points_reward":70,"source":"seed"}'::jsonb
  ),
  (
    'GST-102',
    'Cups of filter coffee sold in Chennai per day',
    'guesstimate',
    'easy',
    E'# Cups of filter coffee sold in Chennai per day\n\nEstimate the cups of filter coffee sold commercially in Chennai on a typical day.\n\n## How to approach (≈ 10 min)\n\n1. Segment: home (exclude), darshinis/hotels, offices, street vendors.\n2. Eating-out coffee occasions per person per day.\n3. Build up and stress-test against the city''s population.',
    true, null, 'size',
    '{"firm":"BCG","round":"associate","est_minutes":10,"points_reward":70,"source":"seed"}'::jsonb
  ),
  (
    'GST-103',
    'Leather cricket balls sold in India per year',
    'guesstimate',
    'medium',
    E'# Leather cricket balls sold in India per year\n\nEstimate annual sales of leather (season) cricket balls in India — exclude tennis/rubber balls.\n\n## How to approach (≈ 12 min)\n\n1. Segment players by seriousness; only the serious tier uses leather balls.\n2. Balls consumed per player/team per season (they wear out fast).\n3. Add club/academy/professional demand; sum and sanity-check.',
    true, null, 'size',
    '{"firm":"McKinsey","round":"associate","est_minutes":12,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'GST-104',
    'EVs chargeable per day at a metro''s public chargers',
    'guesstimate',
    'medium',
    E'# EVs chargeable per day at a metro''s public chargers\n\nEstimate how many EVs can be charged per day at all public chargers in a 10-million metro.\n\n## How to approach (≈ 12 min)\n\n1. Estimate public charge points (connectors) in the metro.\n2. Sessions per point per day from realistic throughput and operating hours.\n3. Multiply; then compare against the metro''s EV park as a sanity check.',
    true, null, 'size',
    '{"firm":"BCG","round":"associate","est_minutes":12,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'GST-105',
    'Annual diaper market size in India (units)',
    'guesstimate',
    'hard',
    E'# Annual diaper market size in India (units)\n\nEstimate annual baby-diaper consumption in India in units.\n\n## How to approach (≈ 15 min)\n\n1. Cohort: births per year and the 0–2 age population.\n2. Penetration of disposable diapers (skewed by income/urban-rural).\n3. Diapers per day per user x days; build a segmented estimate, then sanity-check value.',
    true, null, 'size',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":105,"source":"seed"}'::jsonb
  ),
  (
    'GST-106',
    'Food-delivery orders in a tier-1 city at dinner peak',
    'guesstimate',
    'hard',
    E'# Food-delivery orders in a tier-1 city at dinner peak\n\nEstimate the number of app food-delivery orders placed during the dinner peak (≈ 7–10pm) in a tier-1 city.\n\n## How to approach (≈ 15 min)\n\n1. Build the ordering user base from the city''s population and smartphone/affluence funnel.\n2. Order frequency, and the share of daily orders that fall in the dinner peak.\n3. Reconcile against plausible rider supply for the window.',
    true, null, 'size',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":105,"source":"seed"}'::jsonb
  ),

  -- ── Cost Reduction / Go-to-Market / Competitive Strategy / Market Sizing top-up ──
  (
    'CR-101',
    'A mid-size hotel chain''s rising operating costs',
    'cost reduction',
    'easy',
    E'# A mid-size hotel chain''s rising operating costs\n\n**Client situation.** A 25-property mid-market hotel chain has seen operating costs climb 14% in a year while occupancy is flat. The CEO wants costs back in line without hurting guest ratings.\n\n## Your task (≈ 15 min)\n\n1. **Decompose the cost base.** Where does a hotel''s operating cost actually sit?\n2. **Which costs are controllable vs structural?** Separate quick wins from hard ones.\n3. **What must you NOT cut** to protect ratings and repeat stays?\n4. **Your first move in one line.**',
    true, null, 'prof',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'CR-102',
    'SG&A bloat at a scaling D2C brand',
    'cost reduction',
    'medium',
    E'# SG&A bloat at a scaling D2C brand\n\n**Client situation.** A D2C brand tripled revenue in two years, but SG&A grew faster and margins fell. The board wants SG&A as a % of revenue back to plan without stalling growth.\n\n## Your task (≈ 15 min)\n\n1. **Break SG&A into buckets** — marketing, people, tech, fulfilment overhead.\n2. **Which grew faster than revenue, and why?**\n3. **Where''s the fat vs the muscle?** What cut would hurt growth least?\n4. **One target metric for the next two quarters.**',
    true, null, 'prof',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'CR-103',
    'Procurement savings for a multi-plant auto-components maker',
    'cost reduction',
    'medium',
    E'# Procurement savings for a multi-plant auto-components maker\n\n**Client situation.** An auto-components manufacturer runs six plants that each buy raw materials (steel, plastics, electronics) independently. The CFO suspects fragmented procurement is leaving savings on the table.\n\n## Your task (≈ 15 min)\n\n1. **Where do procurement savings come from** — consolidation, terms, specs, or supplier mix?\n2. **Size the prize** from centralising spend across plants.\n3. **What''s the implementation risk** (plant autonomy, supplier concentration)?\n4. **Your recommendation to the CFO.**',
    true, null, 'prof',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'CR-104',
    'Zero-based budgeting for a conglomerate''s shared services',
    'cost reduction',
    'hard',
    E'# Zero-based budgeting for a conglomerate''s shared services\n\n**Client situation.** A diversified conglomerate''s shared-services functions (IT, HR, finance, admin) have grown unchecked. The chairman wants a zero-based review — justify every rupee from zero, not last year''s budget.\n\n## Your task (≈ 15 min)\n\n1. **How would you structure a ZBB exercise** across functions?\n2. **What''s genuinely value-adding vs legacy spend?**\n3. **How do you avoid cutting into capability** the business units actually need?\n4. **The governance you''d put in place to make savings stick.**',
    true, null, 'prof',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'CR-105',
    'Cost-to-serve reduction for a low-margin e-grocery',
    'cost reduction',
    'hard',
    E'# Cost-to-serve reduction for a low-margin e-grocery\n\n**Client situation.** An online grocery delivers at a thin contribution margin. Management wants to cut cost-to-serve per order by 20% in a year without raising basket prices.\n\n## Your task (≈ 15 min)\n\n1. **Build the cost-to-serve per order** — picking, packing, last-mile, returns.\n2. **Where''s the biggest lever** and what enables it (density, batching, automation)?\n3. **What second-order effects** (delivery time, NPS) must you guard?\n4. **Your one-line plan to the COO.**',
    true, null, 'prof',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'GTM-101',
    'Launch plan for a regional snack brand going national',
    'go to market',
    'easy',
    E'# Launch plan for a regional snack brand going national\n\n**Client situation.** A snack brand that''s strong in two southern states wants to go national. It has limited capital and no national distribution.\n\n## Your task (≈ 15 min)\n\n1. **Sequence the rollout.** Which geographies/channels first, and why?\n2. **Own vs partner distribution** for a capital-light launch.\n3. **What proves product-market fit** in a new region before scaling spend?\n4. **Your first 90-day priority.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'GTM-102',
    'Channel strategy for a B2B SaaS entering mid-market',
    'go to market',
    'medium',
    E'# Channel strategy for a B2B SaaS entering mid-market\n\n**Client situation.** A B2B SaaS that sells top-down to enterprises wants the mid-market. Enterprise sales cycles are long and high-touch; mid-market needs a cheaper motion.\n\n## Your task (≈ 15 min)\n\n1. **What sales motion fits mid-market** — inside sales, PLG, partners?\n2. **What has to change** in pricing, packaging, and onboarding?\n3. **What''s the CAC-payback math** that makes the motion viable?\n4. **Pilot design before a full build-out.**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'GTM-103',
    'Distribution for a rural-focused solar lighting product',
    'go to market',
    'medium',
    E'# Distribution for a rural-focused solar lighting product\n\n**Client situation.** A company sells affordable solar lanterns aimed at off-grid rural households. The product is good; reaching and financing customers is the hard part.\n\n## Your task (≈ 15 min)\n\n1. **How do you reach rural buyers** cost-effectively (SHGs, NGOs, retailers, agents)?\n2. **What''s the financing/affordability unlock** (EMI, pay-as-you-go)?\n3. **What''s the unit economics** of one distribution channel?\n4. **Where you''d start and the kill criterion.**',
    true, null, 'ent',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'GTM-104',
    'GTM for a premium EV two-wheeler across India',
    'go to market',
    'hard',
    E'# GTM for a premium EV two-wheeler across India\n\n**Client situation.** A premium electric two-wheeler maker, strong in metros, must design a national go-to-market. Charging, service, and financing all shape adoption.\n\n## Your task (≈ 15 min)\n\n1. **Which city tiers, in what order,** and what gates progression?\n2. **What''s the store + service + charging model** per market?\n3. **Size a city-level launch P&L** — does it clear?\n4. **The biggest GTM risk and your mitigation.**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'GTM-105',
    'Re-launch GTM for a stalled vernacular fintech app',
    'go to market',
    'hard',
    E'# Re-launch GTM for a stalled vernacular fintech app\n\n**Client situation.** A vernacular fintech app grew fast on incentives, then stalled when incentives stopped. The board wants a sustainable re-launch GTM, not another burn-fuelled spike.\n\n## Your task (≈ 15 min)\n\n1. **Diagnose why growth stalled** — acquisition, activation, or retention?\n2. **Design an incentive-light GTM** that compounds.\n3. **Which channels and which user segment** to win first?\n4. **The leading indicator you''d watch weekly.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'CS-101',
    'A low-cost entrant is undercutting your paints brand',
    'competitive strategy',
    'easy',
    E'# A low-cost entrant is undercutting your paints brand\n\n**Client situation.** A new low-cost paint brand is undercutting your client (a premium incumbent) by ~20% and taking share in value segments.\n\n## Your task (≈ 15 min)\n\n1. **Should the incumbent respond on price** — or hold and differentiate?\n2. **What''s the entrant''s likely weakness** (distribution, quality, durability)?\n3. **What moves protect share** without a margin-destroying price war?\n4. **Your recommendation in one line.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'CS-102',
    'Quick-commerce price war: how should a grocery chain respond?',
    'competitive strategy',
    'medium',
    E'# Quick-commerce price war: how should a grocery chain respond?\n\n**Client situation.** A modern-trade grocery chain is losing urban customers to quick-commerce apps discounting heavily. The CEO is tempted to match prices.\n\n## Your task (≈ 15 min)\n\n1. **Is matching prices winnable** given the cost structures involved?\n2. **Where does the chain have an edge** (range, freshness, experience, loyalty)?\n3. **What''s a response that plays to strengths** rather than the rival''s game?\n4. **The metric that tells you it''s working.**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'CS-103',
    'An incumbent telco facing an aggressive new 5G entrant',
    'competitive strategy',
    'medium',
    E'# An incumbent telco facing an aggressive new 5G entrant\n\n**Client situation.** A profitable telco incumbent faces a well-funded new entrant launching cheap 5G plans to grab share, echoing a past disruption.\n\n## Your task (≈ 15 min)\n\n1. **What''s the entrant''s playbook** and where does it hurt most?\n2. **Defend or differentiate?** Which segments to protect at all costs.\n3. **What''s the cost of a price response** vs investing in network/experience?\n4. **Your stance for the board.**',
    true, null, 'ent',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'CS-104',
    'Defending share against a deep-pocketed global e-tailer',
    'competitive strategy',
    'hard',
    E'# Defending share against a deep-pocketed global e-tailer\n\n**Client situation.** A domestic e-commerce player faces a global giant willing to burn cash for share. Out-spending is not an option for the client.\n\n## Your task (≈ 15 min)\n\n1. **Where can a focused player win** against a generalist giant?\n2. **What moats are buildable** (categories, logistics, seller relationships, trust)?\n3. **What would you deliberately NOT contest?**\n4. **The 12-month strategic priority.**',
    true, null, 'ent',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'CS-105',
    'A legacy bank vs neobanks for young customers',
    'competitive strategy',
    'hard',
    E'# A legacy bank vs neobanks for young customers\n\n**Client situation.** A legacy private bank is losing under-30 customers to slick neobanks. Its assets are trust, branches, and a full product suite; its weakness is digital experience.\n\n## Your task (≈ 15 min)\n\n1. **What do young customers actually value** that neobanks deliver?\n2. **Build, buy, or partner** to close the experience gap?\n3. **How does the bank turn its assets into an advantage?**\n4. **Your recommended play and the first proof point.**',
    true, null, 'ent',
    '{"firm":"Bain","round":"partner","est_minutes":15,"points_reward":110,"source":"seed"}'::jsonb
  ),
  (
    'MS-101',
    'Market size for online tutoring in India (revenue)',
    'market_sizing',
    'easy',
    E'# Market size for online tutoring in India (revenue)\n\nEstimate the annual revenue (₹) of the online one-on-one/small-group tutoring market in India.\n\n## How to approach (≈ 12 min)\n\n1. Funnel from school/college population to those using paid online tutoring.\n2. Average annual spend by tier.\n3. Build a point estimate and a sensitivity range.',
    true, null, 'size',
    '{"firm":"Bain","round":"associate","est_minutes":15,"points_reward":75,"source":"seed"}'::jsonb
  ),
  (
    'MS-102',
    'Annual market for premium pet food in urban India',
    'market_sizing',
    'medium',
    E'# Annual market for premium pet food in urban India\n\nEstimate the annual market size (₹) for packaged premium pet food in urban India.\n\n## How to approach (≈ 12 min)\n\n1. Urban pet-owning households and the share feeding packaged food.\n2. Premium share, monthly spend per pet.\n3. Build up and sanity-check against pet-care growth.',
    true, null, 'size',
    '{"firm":"McKinsey","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'MS-103',
    'TAM for rooftop solar for Indian homes',
    'market_sizing',
    'medium',
    E'# TAM for rooftop solar for Indian homes\n\nEstimate the addressable market (₹) for residential rooftop solar installations in India.\n\n## How to approach (≈ 12 min)\n\n1. Households with suitable roofs + ability to pay.\n2. System size and price per installation.\n3. Annual installable flow vs total stock; state assumptions.',
    true, null, 'size',
    '{"firm":"BCG","round":"associate","est_minutes":15,"points_reward":85,"source":"seed"}'::jsonb
  ),
  (
    'MS-104',
    'Market size for EV charging services in India by 2030',
    'market_sizing',
    'hard',
    E'# Market size for EV charging services in India by 2030\n\nEstimate the annual revenue (₹) of public EV-charging services in India around 2030.\n\n## How to approach (≈ 15 min)\n\n1. Project the EV park and share relying on public charging.\n2. Energy per vehicle per year through public chargers, and tariff.\n3. Build the estimate; flag the biggest swing assumption.',
    true, null, 'size',
    '{"firm":"McKinsey","round":"partner","est_minutes":15,"points_reward":105,"source":"seed"}'::jsonb
  )
on conflict (code) do nothing;
