-- 0077_case_expectations.sql
-- What a case EXPECTS, and what candidates reliably get WRONG on it.
-- Additive + idempotent. Deploy-safe in either order: services/case_expectations.py
-- swallows every failure, so a backend running before this migration simply behaves as it
-- did yesterday.
--
-- WHY THIS EXISTS
-- The interviewer classifies the CANDIDATE: intent, frustration, stuckness. That set is
-- infinite, so the deterministic layer is always one unseen phrasing away from a wrong
-- read, and every fix is a patch on a tail that never ends. Matching against the CASE
-- inverts it: one case has perhaps eight things a good answer contains and a dozen things
-- people reliably get wrong. That set is finite and knowable, so a three-word fragment, a
-- typo, hinglish or something nobody predicted all resolve the same way -- which
-- expectation does this touch, which misconception does it look like, what is still
-- missing. (Expectation-misconception tailored dialogue; Graesser et al., AutoTutor.)
--
-- AND IT IMPROVES WITH USE. Every attempt updates the counters below: which misconceptions
-- actually fire, how often, and whether the move the interviewer made unstuck the
-- candidate. The next person on the same case meets an interviewer that knows where people
-- fall over. Nothing is retrained; the evidence simply accumulates.
--
-- TWO LAYERS, so it works on day one AND gets sharper:
--   case_id IS NULL + case_type set -> GENERIC. Applies to every case of that type. Seeded
--                                      below from errors seen in real sessions, so a case
--                                      authored tomorrow inherits them with no setup.
--   case_id set                     -> SPECIFIC to that case. Bootstrapped from its model
--                                      solution, then grown from what candidates do.

create table if not exists public.case_expectations (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references public.cases(id) on delete cascade,   -- null = generic
  case_type   text,                                                 -- used when case_id is null
  kind        text not null check (kind in ('expectation', 'misconception')),

  -- `label` is what the interviewer is shown ("splits revenue into price x volume").
  -- Short, concrete, in the candidate's terms, never a lecture.
  label       text not null,
  -- `cue` is what it LOOKS like in a candidate turn - the words or shapes that indicate
  -- it. Used to match, never shown.
  cue         text,
  -- For a misconception: the cross-question that exposes it without naming the answer.
  probe       text,

  -- Where it came from, and whether it is allowed to influence a live conversation.
  -- 'observed' rows start as 'candidate' and need a human before they count: an
  -- automatic loop that promotes its own guesses drifts, and drift here is invisible.
  source      text not null default 'authored'
              check (source in ('authored', 'solution', 'observed')),
  status      text not null default 'active'
              check (status in ('active', 'candidate', 'retired')),

  -- The loop. Updated at submit from the attempt's own record of the conversation.
  seen_count  integer not null default 0,   -- attempts that reached the relevant ground
  hit_count   integer not null default 0,   -- expectation met / misconception fallen into
  helped_count integer not null default 0,  -- the interviewer's move unstuck them
  last_seen_at timestamptz,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A case's own rows, then the generic ones for its type. Partial so the hot read (active
-- rows only) stays small as retired and candidate rows accumulate.
create index if not exists idx_case_expectations_case
  on public.case_expectations (case_id) where status = 'active';
create index if not exists idx_case_expectations_generic
  on public.case_expectations (case_type) where case_id is null and status = 'active';
-- The review queue.
create index if not exists idx_case_expectations_pending
  on public.case_expectations (created_at desc) where status = 'candidate';

-- Exactly one row per (case, kind, label): the loop UPSERTS counters, and without this a
-- popular misconception would fan out into near-duplicate rows and its counts would be
-- split across them, which is the same as having no counts at all.
create unique index if not exists uq_case_expectations_case_label
  on public.case_expectations (case_id, kind, lower(label)) where case_id is not null;
create unique index if not exists uq_case_expectations_generic_label
  on public.case_expectations (case_type, kind, lower(label)) where case_id is null;

comment on table public.case_expectations is
  'Expectation-misconception tailored dialogue. Matching a turn against the CASE rather '
  'than classifying the CANDIDATE is what makes the interviewer robust to turns nobody '
  'enumerated. Counters accumulate per attempt so the next candidate on the same case '
  'meets a sharper interviewer. See services/case_expectations.py.';

alter table public.case_expectations enable row level security;
-- No policy: service role only. A candidate must never be able to read the list of things
-- they are about to be tested on, and `probe` is the interviewer's hand.

-- ---------------------------------------------------------------- generic seed
-- Every one of these was observed in a real session or is pinned by a scenario in
-- tools/eval_interviewer_behavior.py. They are the errors that actually happen to Indian
-- MBA candidates, not a textbook list: unit and denominator slips dominate, because the
-- work is done in lakh/crore and millions in the same breath.
insert into public.case_expectations (case_id, case_type, kind, label, cue, probe, source, status) values
  (null, 'guesstimate', 'misconception', 'crore and million used interchangeably',
   'a figure restated in the other unit without a factor of 10',
   'Crore or million?', 'authored', 'active'),
  (null, 'guesstimate', 'misconception', 'unit conversion dropped (ml to litres, bottles to litres)',
   'a count carried straight into a volume with no conversion factor',
   'What do you multiply by to get from one unit to the other?', 'authored', 'active'),
  (null, 'guesstimate', 'misconception', 'monthly and annual mixed in one chain',
   'a per-month figure used where the answer is per year, or the reverse',
   'Is that per month or per year?', 'authored', 'active'),
  (null, 'guesstimate', 'misconception', 'segments overlap, so people are counted twice',
   'a total added on top of the parts that already compose it',
   'Is anyone in two of those buckets at once?', 'authored', 'active'),
  (null, 'guesstimate', 'misconception', 'penetration set at or near 100%',
   'everyone / all of India / obviously everybody',
   'Who is in that number who would not actually buy it?', 'authored', 'active'),
  (null, 'guesstimate', 'misconception', 'no sanity check on the final figure',
   'a final answer with no per-person or per-day implication tested',
   'What does that come to per person per day?', 'authored', 'active'),
  (null, 'guesstimate', 'expectation', 'states the decomposition before computing',
   'population -> share -> frequency, or an equivalent chain', null, 'authored', 'active'),
  (null, 'guesstimate', 'expectation', 'anchors on a defensible population or base figure',
   'a named starting number with a reason', null, 'authored', 'active'),

  (null, 'profitability', 'misconception', 'market share computed on the wrong denominator',
   'own revenue divided by own sales rather than by the market',
   'What is the denominator there?', 'authored', 'active'),
  (null, 'profitability', 'misconception', 'a cause asserted that contradicts a given fact',
   'volume blamed when volumes were stated flat',
   'Does that sit with what you already know about volumes?', 'authored', 'active'),
  (null, 'profitability', 'misconception', 'cause named without separating price from volume',
   'revenue fell, treated as one number',
   'Which of the two moved - price or volume?', 'authored', 'active'),
  (null, 'profitability', 'misconception', 'vague market or competition blamed with no driver',
   'the market is bad / competition, with nothing under it',
   'What would you look at to tell whether that is true?', 'authored', 'active'),
  (null, 'profitability', 'expectation', 'splits profit into revenue and cost before drilling',
   'profit = revenue - cost, stated', null, 'authored', 'active'),
  (null, 'profitability', 'expectation', 'splits revenue into price and volume',
   'price x volume, stated', null, 'authored', 'active'),
  (null, 'profitability', 'expectation', 'separates fixed from variable on the cost side',
   'fixed / variable named', null, 'authored', 'active'),
  (null, 'profitability', 'expectation', 'ends on a recommendation, not a number',
   'a so-what tied to the figure', null, 'authored', 'active')
on conflict do nothing;

notify pgrst, 'reload schema';
