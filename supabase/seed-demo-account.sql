-- =====================================================================
-- seed-demo-account.sql — the influencer / press demo account.
-- 2026-08-06
--
-- Produces a REAL, fully working Pro account whose dashboard is computed
-- from real rows, not mocked: skill constellation ~77% mastered, a points
-- total that is the exact sum of its first-attempt scores, a 12-week
-- heatmap, badges, a stocked cheat sheet, and guesstimate skills.
--
-- ── RUN ORDER ────────────────────────────────────────────────────────
--   0. Run migration 0044_growth_kit.sql   (adds users.is_demo)
--   1. Sign the demo account up NORMALLY at mece.in/signup and finish
--      onboarding. Auth identities cannot be minted safely from SQL.
--   2. Run supabase/seed-skill-graph.sql        (22 nodes + edges)
--   3. Run supabase/seed-cases-constellation.sql (tags cases onto nodes)
--   4. Set v_email below, then run THIS file.
--
--   Steps 2 and 3 are idempotent and already in the repo. Step 2 is what
--   switches the constellation from its built-in mock to live data — the
--   reader (lib/dashboard/skill-graph.ts) already prefers live rows and
--   falls back to the mock only when skill_nodes is empty. Rollback is
--   `delete from public.skill_edges; delete from public.skill_nodes;`
--
-- ── IDEMPOTENT ───────────────────────────────────────────────────────
-- Every row this writes is stamped `feedback_json->>'seed' = 'demo'` (or
-- source 'MECE demo brief'), and the script deletes its own previous rows
-- before re-inserting. Re-run it as often as you like. It NEVER touches a
-- row it did not create, and never touches another user.
-- =====================================================================

do $$
declare
  -- ── EDIT THIS ──────────────────────────────────────────────────────
  v_email    text := 'demo@mece.in';
  -- Only applied when the account has no name yet (e.g. created from the
  -- Supabase dashboard rather than /signup). An existing name is never overwritten.
  v_name     text := 'Ananya Rao';
  -- Nodes to show as MASTERED. 17 of 22 = 77% of the constellation lit.
  -- Drop one for 16/22 = 73%. Mastery rule (lib/dashboard/skill-graph.ts):
  -- best score >= 75 AND at least 2 scored attempts on that node.
  v_done     text[] := array['p1','p2','p3','p4','c1','c2','c3',
                             's1','s2','s3','r1','r2',
                             'e1','e2','e3','m1','o1'];
  -- Nodes shown as IN PROGRESS: attempted, best score below the 75 bar.
  v_partial  text[] := array['s4','r3','m2'];
  -- ───────────────────────────────────────────────────────────────────

  v_user     uuid;
  v_node     text;
  v_case     uuid;
  v_cases    uuid[];
  v_sub      uuid;
  v_score    int;
  v_scores   int[];
  v_i        int;
  v_idx      int := 0;
  v_first    boolean;
  v_attempt  int;
  v_when     timestamptz;
  v_points   int;
  v_missing  text[] := '{}';
  v_made     int := 0;
  v_hint     text;
begin
  ------------------------------------------------------------------
  -- 0. Resolve the account
  ------------------------------------------------------------------
  select id into v_user from public.users where lower(email) = lower(v_email);
  if v_user is null then
    -- Show the most recent accounts so you can point v_email at an existing
    -- one instead of creating a new account, if that is what you meant.
    select string_agg(email, ', ') into v_hint
      from (select email from public.users order by created_at desc limit 6) t;
    raise exception 'No user with email %.', v_email
      using hint =
        'Sign that account up at /signup and finish onboarding, then re-run. '
        || 'Or set v_email (line 34) to an existing account. Most recent signups: '
        || coalesce(v_hint, '(no users in this database yet)');
  end if;

  if not exists (select 1 from public.skill_nodes limit 1) then
    raise exception
      'public.skill_nodes is empty — run supabase/seed-skill-graph.sql first, or the constellation will render its built-in mock and ignore this seed.';
  end if;

  ------------------------------------------------------------------
  -- 1. Wipe only what a previous run of THIS script created
  ------------------------------------------------------------------
  -- case_attempts cascade off submissions (ON DELETE CASCADE).
  delete from public.submissions
   where user_id = v_user and feedback_json->>'seed' = 'demo';
  delete from public.cheatsheet_points
   where user_id = v_user and source = 'MECE demo brief';

  ------------------------------------------------------------------
  -- 2. Profile — Pro, flagged as a demo account, onboarding complete
  ------------------------------------------------------------------
  -- is_demo keeps this account off the public leaderboard, out of the
  -- "N aspirants" headcount, out of the cohort benchmark and out of the
  -- live activity tape. It stays a completely normal account to use.
  update public.users
     set is_demo                  = true,
         name                     = coalesce(nullif(btrim(name), ''), v_name),
         subscription_tier        = 'pro',
         subscription_started_at  = now() - interval '84 days',
         subscription_expires_at  = now() + interval '365 days',
         streak_count             = 31,
         streak_last_date         = (now() at time zone 'Asia/Kolkata')::date,
         onboarding_completed_at  = coalesce(onboarding_completed_at, now() - interval '90 days'),
         placement_focus          = coalesce(placement_focus, 'final'),
         batch_year               = coalesce(batch_year, extract(year from now())::int + 1),
         weekly_hours_target      = coalesce(weekly_hours_target, 10),
         goal_text                = coalesce(nullif(goal_text, ''), 'Convert a Day 1 consulting offer'),
         show_linkedin            = coalesce(show_linkedin, false)
   where id = v_user;

  ------------------------------------------------------------------
  -- 3. Mastered nodes — 3 scored attempts each, best comfortably >= 75
  ------------------------------------------------------------------
  foreach v_node in array v_done loop
    select array_agg(id) into v_cases
      from (select id from public.cases
             where skill_node = v_node and is_active = true
             order by created_at, id limit 3) t;

    if v_cases is null then
      v_missing := v_missing || v_node;
      continue;
    end if;

    v_scores := array[78, 86, 91];

    for v_i in 1..3 loop
      -- Reuse cases round-robin when a node has fewer than 3 authored.
      v_case  := v_cases[((v_i - 1) % array_length(v_cases, 1)) + 1];
      v_score := v_scores[v_i];

      select count(*) + 1 into v_attempt
        from public.case_attempts where user_id = v_user and case_id = v_case;
      v_first := (v_attempt = 1);

      -- Spread across the last 12 weeks, most recent first, so the
      -- activity heatmap fills in densely instead of one hot day.
      v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
      v_idx  := v_idx + 1;

      insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
      values (
        v_user, v_case,
        'Demo submission. Structured the problem into revenue and cost branches, sized the '
        || 'addressable pool bottom-up, pressure-tested the two assumptions the answer actually '
        || 'turns on, and closed with a recommendation plus the one risk worth flagging.',
        v_score,
        jsonb_build_object(
          'seed', 'demo',
          'rubric', 'case',
          'breakdown', jsonb_build_object(
            'structure',         round(25 * v_score / 100.0),
            'quantitative',      round(20 * v_score / 100.0),
            'synthesis',         round(20 * v_score / 100.0),
            'business_judgment', round(15 * v_score / 100.0),
            'creativity',        round(10 * v_score / 100.0),
            'presence',          round(10 * v_score / 100.0)
          ),
          'strengths', jsonb_build_array(
            'Clean MECE break before touching any number',
            'Quantified the recommendation instead of asserting it'),
          'improvements', jsonb_build_array(
            'State the hypothesis earlier so the analysis has a spine'),
          'summary', 'Structured, numerate and decisive. Lead with the answer next time.'
        ),
        v_when
      )
      returning id into v_sub;

      insert into public.case_attempts
        (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
      values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

      v_made := v_made + 1;
    end loop;
  end loop;

  ------------------------------------------------------------------
  -- 4. In-progress nodes — attempted, best below the mastery bar
  ------------------------------------------------------------------
  foreach v_node in array v_partial loop
    select id into v_case
      from public.cases
     where skill_node = v_node and is_active = true
     order by created_at, id limit 1;

    if v_case is null then
      v_missing := v_missing || v_node;
      continue;
    end if;

    v_scores := array[59, 68];

    for v_i in 1..2 loop
      v_score := v_scores[v_i];

      select count(*) + 1 into v_attempt
        from public.case_attempts where user_id = v_user and case_id = v_case;
      v_first := (v_attempt = 1);

      v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
      v_idx  := v_idx + 1;

      insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
      values (
        v_user, v_case,
        'Demo submission. Got to a defensible number but the structure leaked — two branches '
        || 'overlapped and the sanity check came after the recommendation rather than before it.',
        v_score,
        jsonb_build_object(
          'seed', 'demo',
          'rubric', 'case',
          'breakdown', jsonb_build_object(
            'structure',         round(25 * v_score / 100.0),
            'quantitative',      round(20 * v_score / 100.0),
            'synthesis',         round(20 * v_score / 100.0),
            'business_judgment', round(15 * v_score / 100.0),
            'creativity',        round(10 * v_score / 100.0),
            'presence',          round(10 * v_score / 100.0)
          ),
          'strengths', jsonb_build_array('Arithmetic held up end to end'),
          'improvements', jsonb_build_array(
            'Branches were not mutually exclusive',
            'Sanity-check the number before you recommend on it'),
          'summary', 'Right ballpark, loose structure. This is the cluster to drill next.'
        ),
        v_when
      )
      returning id into v_sub;

      insert into public.case_attempts
        (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
      values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

      v_made := v_made + 1;
    end loop;
  end loop;

  ------------------------------------------------------------------
  -- 5. Guesstimates — the second radar on the dashboard (5 dims, 1..5)
  ------------------------------------------------------------------
  for v_i in 1..6 loop
    select id into v_case
      from public.cases
     where type = 'guesstimate' and is_active = true
     order by created_at, id
     offset (v_i - 1) limit 1;
    exit when v_case is null;

    v_score := 72 + (v_i * 3);

    select count(*) + 1 into v_attempt
      from public.case_attempts where user_id = v_user and case_id = v_case;
    v_first := (v_attempt = 1);

    v_when := now() - make_interval(days => (v_idx % 84), hours => (v_idx % 9) + 9);
    v_idx  := v_idx + 1;

    insert into public.submissions (user_id, case_id, answer_text, score, feedback_json, created_at)
    values (
      v_user, v_case,
      'Demo guesstimate. Scoped the question, built a bottom-up tree, stated every assumption '
      || 'with a source or a rationale, carried units through, and closed with a sanity check '
      || 'against a known benchmark.',
      v_score,
      jsonb_build_object(
        'seed', 'demo',
        'rubric', 'guesstimate',
        'breakdown', jsonb_build_object(
          'scoping',      4,
          'structure',    5,
          'segmentation', 4,
          'arithmetic',   5,
          'sanity',       4
        ),
        'summary', 'Tight tree, clean units, benchmark check at the end.'
      ),
      v_when
    )
    returning id into v_sub;

    insert into public.case_attempts
      (user_id, case_id, submission_id, attempt_number, is_first_attempt, created_at)
    values (v_user, v_case, v_sub, v_attempt, v_first, v_when);

    v_made := v_made + 1;
  end loop;

  ------------------------------------------------------------------
  -- 6. Points — the exact sum of first-attempt scores
  ------------------------------------------------------------------
  -- This is precisely how backend routes/submit.py awards points (first
  -- attempt only, re-attempts award nothing), so the number on the nav
  -- bar reconciles against the submission log rather than being invented.
  select coalesce(sum(s.score), 0) into v_points
    from public.submissions s
    join public.case_attempts a on a.submission_id = s.id
   where s.user_id = v_user and a.is_first_attempt = true;

  update public.users set points = v_points where id = v_user;

  ------------------------------------------------------------------
  -- 7. Badges — only ones that exist in this environment
  ------------------------------------------------------------------
  insert into public.user_badges (user_id, badge_id, earned_at)
  select v_user, b.id, now() - interval '20 days'
    from public.badges b
   where b.id = any (array[
     'first-case','five-cases','fifteen-cases','thirty-cases','all-types',
     'streak-3','streak-7','streak-14','streak-30',
     'first-80','first-90','perfect-structure','perfect-quant'
   ])
  on conflict (user_id, badge_id) do nothing;

  ------------------------------------------------------------------
  -- 8. Cheat sheet — stocked so the PDF export has something to show
  ------------------------------------------------------------------
  insert into public.cheatsheet_points (user_id, point_text, source, tag, created_at)
  values
    (v_user, 'India''s quick-commerce GMV crossed $6bn in FY25, growing ~2.5x year on year, with roughly 70% concentrated in the top 8 cities.', 'MECE demo brief', 'Quick commerce', now() - interval '18 days'),
    (v_user, 'Average order value in 10-minute delivery sits near Rs 430; contribution margin turns positive above roughly Rs 550 per order.', 'MECE demo brief', 'Quick commerce', now() - interval '17 days'),
    (v_user, 'UPI processes over 16bn transactions a month, about 80% of India''s retail digital payment volume but a far smaller share of value.', 'MECE demo brief', 'Fintech', now() - interval '15 days'),
    (v_user, 'Credit card penetration in India is still under 6% of adults, versus roughly 30% in Brazil, which is the standard comparison in any lending case.', 'MECE demo brief', 'Fintech', now() - interval '15 days'),
    (v_user, 'India''s EV two-wheeler share crossed 5% of new registrations; battery is 35 to 40% of bill of materials, which is where the cost curve argument lives.', 'MECE demo brief', 'Mobility', now() - interval '12 days'),
    (v_user, 'Charging infrastructure ratio in India is roughly 1 public charger per 135 EVs, against a widely cited healthy benchmark near 1 per 20.', 'MECE demo brief', 'Mobility', now() - interval '11 days'),
    (v_user, 'FMCG rural volume growth overtook urban for the first time in eight quarters, which flips the usual "urban premiumisation" opening.', 'MECE demo brief', 'FMCG', now() - interval '9 days'),
    (v_user, 'Modern trade is about 12% of Indian FMCG sales but contributes a disproportionate share of premium SKU volume.', 'MECE demo brief', 'FMCG', now() - interval '8 days'),
    (v_user, 'Indian IT services attrition normalised to the low teens from a 20%+ peak, so the cost-per-employee argument no longer carries a wage-spiral assumption.', 'MECE demo brief', 'IT services', now() - interval '6 days'),
    (v_user, 'SaaS rule of 40: growth rate plus free cash flow margin should exceed 40. Below 30 the valuation conversation changes entirely.', 'MECE demo brief', 'SaaS', now() - interval '4 days'),
    (v_user, 'Net revenue retention above 120% is the line that separates a land-and-expand story from a pure new-logo story.', 'MECE demo brief', 'SaaS', now() - interval '3 days'),
    (v_user, 'D2C brands typically hit a CAC wall around Rs 900 to 1,100 per order; past that, retention economics have to carry the model.', 'MECE demo brief', 'D2C', now() - interval '2 days')
  on conflict do nothing;

  ------------------------------------------------------------------
  -- 9. Report
  ------------------------------------------------------------------
  raise notice 'Demo account % seeded: % submissions, % points, % of 22 nodes mastered.',
    v_email, v_made, v_points, array_length(v_done, 1) - coalesce(array_length(v_missing, 1), 0);
  if array_length(v_missing, 1) > 0 then
    raise notice 'No active case tagged to these nodes (they will show as locked): %. Run supabase/seed-cases-constellation.sql to author them.',
      array_to_string(v_missing, ', ');
  end if;
end $$;

-- ── Verify ───────────────────────────────────────────────────────────
-- select points, streak_count, subscription_tier, is_demo
--   from public.users where lower(email) = lower('demo@mece.in');
--
-- select c.skill_node, count(*) attempts, max(s.score) best,
--        (max(s.score) >= 75 and count(*) >= 2) as mastered
--   from public.submissions s join public.cases c on c.id = s.case_id
--  where s.user_id = (select id from public.users where lower(email) = lower('demo@mece.in'))
--    and c.skill_node is not null
--  group by c.skill_node order by 1;
