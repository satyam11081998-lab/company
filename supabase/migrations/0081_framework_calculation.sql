-- 0081_framework_calculation.sql
-- The half of a guesstimate that is not a tree.
--
-- A profitability case decomposes and stops: Profit = Revenue - Cost, and the worked
-- answer is the tree plus what it told you. A guesstimate decomposes AND THEN COMPUTES,
-- and the computation is the part candidates get wrong. On the casebook pages this is
-- modelled on, it is a separate boxed block under the tree:
--
--   # votes per EVM per phase  =  600 mins  ÷  4 mins       =  150 votes
--   # votes per EVM            =  150 votes ×  5 phases     =  750 votes
--   # EVMs required            =  ~800 Mn   ÷  750          =  1.07 Mn
--
-- It is an ordered list of named steps, each one feeding the next -- not a tree, because
-- the same quantity appears as a result and then as a term, which a tree cannot express
-- without duplicating it.
--
-- Storing it as STRUCTURE rather than prose is what makes it checkable: with terms, an
-- operator and a stated result, the arithmetic of a GENERATED framework can be recomputed
-- before a human ever reviews it. A worked answer whose own numbers do not multiply is
-- wrong with certainty, and certainty is worth more than a reviewer's attention.

alter table public.case_frameworks
  add column if not exists calculation jsonb not null default '[]'::jsonb;

comment on column public.case_frameworks.calculation is
  'Ordered guesstimate steps: [{label, terms:[{label,value}], op, result}]. Each step '
  'feeds the next. Recomputed at generation time -- a draft whose own arithmetic does '
  'not close is refused rather than queued for review.';

-- Segmentation nodes on a guesstimate carry a share AND an absolute ("Rural (65%) ~900
-- Mn"). The share lives on the node rather than being baked into the label so the
-- renderer can set it quietly beside the figure, and so it stays a number.
comment on column public.case_frameworks.tree is
  'The approach tree, in the node shape services/structure_tree.py emits: '
  '{id,label,value,share,op,role,formula,kind,children}. kind=driver marks the branch '
  'that explained the case; on a guesstimate it marks the spine that carries the answer.';

notify pgrst, 'reload schema';
