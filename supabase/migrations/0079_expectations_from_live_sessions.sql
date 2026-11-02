-- 0079_expectations_from_live_sessions.sql
-- Two generic guesstimate misconceptions, both observed in a live Whiteboard session on
-- "Estimate the number of pre-owned cars sold annually in Chennai" (2026-11-03).
-- Additive + idempotent; `on conflict do nothing` makes a re-run a no-op.
--
-- WHAT HAPPENED, AND WHY IT IS HERE RATHER THAN IN THE PROMPT
--
-- The candidate took a 1.2 crore metro population, said "upper middle class would be 1/3,
-- that is 40 lakh", and called that 40 lakh CAR OWNERS. That is one car for every three
-- people in Chennai -- roughly five times the real rate, because ownership is a household
-- fact and they applied it per person. The interviewer answered "Great!" and moved on to
-- replacement cycles, so the whole estimate was built on a base that was five times too
-- big and nobody looked at it again.
--
-- Nothing in the engine was broken. 0077's seed simply had no row for this error, so there
-- was nothing for the turn to match against: the interviewer was reading a list that did
-- not contain the mistake in front of it. The fix is a row, not a prompt rewrite -- which
-- is the whole argument for the expectations table. A prompt edit to catch this would have
-- been a paragraph of English competing with every other paragraph on every other turn;
-- a row is two sentences that only load on guesstimates and carry their own counters, so
-- in a month the data says whether this actually fires.
--
-- Both are `authored`/`active` because a human read the transcript. Rows the system
-- proposes for itself land as `candidate` and wait for exactly this kind of read.

insert into public.case_expectations (case_id, case_type, kind, label, cue, probe, source, status) values
  (null, 'guesstimate', 'misconception',
   'ownership counted per person when it belongs to a household',
   'a share of POPULATION used directly as the number of owners, cars, phones or homes -- a per-person rate standing in for a per-household one',
   'Is that one per person, or one per household?',
   'authored', 'active'),

  (null, 'guesstimate', 'misconception',
   'a split fraction asserted with no basis',
   'one-third / half / 20% produced for a segment with no reason attached, then carried through the rest of the chain unexamined',
   'Where does that fraction come from?',
   'authored', 'active')
on conflict do nothing;

notify pgrst, 'reload schema';
