-- 0015_drop_case_tags.sql
-- Safely drop the case_tags table (superseded by cheatsheet_points)

drop table if exists public.case_tags cascade;
