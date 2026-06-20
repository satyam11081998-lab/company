-- 0016_backfill_cheatsheet.sql
-- Backfill existing cheat sheet items into the new cheatsheet_points table
-- Safe, idempotent

insert into public.cheatsheet_points (user_id, point_text, source, headline_id, tag)
select 
  user_id, 
  content as point_text, 
  source_topic as source, 
  case 
    when source_headline_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then source_headline_id::uuid 
    else null 
  end as headline_id,
  coalesce(domain, 'untagged') as tag
from public.cheat_sheet_items
on conflict (user_id, tag_norm, md5(point_text)) do nothing;
