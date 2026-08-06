-- =====================================================================
-- Seed: Skill Constellation Graph — 22 nodes + their edges.
--
-- SCHEMA-ADAPTIVE ON PURPOSE.
-- Two column namings for this table exist in the wild:
--   · live / production → display_x / display_y
--   · migration 0004    → x_pos / y_pos
-- The previous version hardcoded x_pos and hard-failed against the live
-- schema with `column "x_pos" does not exist`. It now detects the real
-- column names at runtime and builds the INSERT to match, so it works on
-- either and cannot rot when one of them changes.
--
-- Idempotent: upserts by id, and edges use ON CONFLICT DO NOTHING.
-- =====================================================================

do $$
declare
  v_x     text;
  v_y     text;
  v_boss  text;
  v_src   text;
  v_dst   text;
  v_sql   text;
  n       jsonb;
  e       jsonb;
  v_nodes int := 0;
  v_edges int := 0;

  -- [id, cluster, label, x, y, is_boss]
  c_nodes jsonb := $j$[
    ["p1","prof","P&L drivers",14,22,false],
    ["p2","prof","Cost structure",22,14,false],
    ["p3","prof","Margin defense",30,26,false],
    ["p4","prof","Combined ratio",18,34,true],
    ["s1","size","Top-down",60,14,false],
    ["s2","size","Bottom-up",70,20,false],
    ["s3","size","Sanity checks",78,12,false],
    ["s4","size","Cross-validation",84,26,false],
    ["r1","pri","Value-based",76,46,false],
    ["r2","pri","Bundle pricing",86,54,false],
    ["r3","pri","Elasticity",70,60,false],
    ["e1","ent","Market attractive",22,56,false],
    ["e2","ent","Mode of entry",14,64,false],
    ["e3","ent","Competitive resp.",28,70,false],
    ["m1","ma","Synergies",44,78,false],
    ["m2","ma","Valuation",56,80,false],
    ["m3","ma","Integration",38,86,false],
    ["o1","ops","Throughput",8,80,false],
    ["o2","ops","Bottleneck",4,70,false],
    ["c1","soft","Structuring",44,22,false],
    ["c2","soft","Communication",50,12,false],
    ["c3","soft","Hypothesis-led",38,14,false]
  ]$j$::jsonb;

  c_edges jsonb := $j$[
    ["p1","p2"],["p1","p3"],["p3","p4"],["p2","c3"],["c3","c1"],["c1","c2"],
    ["s1","s2"],["s2","s3"],["s2","s4"],["c1","s1"],
    ["s4","r1"],["r1","r2"],["r2","r3"],
    ["p4","e1"],["e1","e2"],["e1","e3"],["e3","m1"],
    ["m1","m2"],["m1","m3"],
    ["e2","o1"],["o1","o2"]
  ]$j$::jsonb;
begin
  if to_regclass('public.skill_nodes') is null then
    raise exception 'public.skill_nodes does not exist — run migration 0004 first.';
  end if;

  ------------------------------------------------------------------
  -- Detect the real column names
  ------------------------------------------------------------------
  select c.column_name into v_x
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = any (array['display_x', 'x_pos', 'x'])
   order by array_position(array['display_x','x_pos','x'], c.column_name)
   limit 1;

  select c.column_name into v_y
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = any (array['display_y', 'y_pos', 'y'])
   order by array_position(array['display_y','y_pos','y'], c.column_name)
   limit 1;

  select c.column_name into v_boss
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_nodes'
     and c.column_name = 'is_boss'
   limit 1;

  select c.column_name into v_src
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_edges'
     and c.column_name = any (array['source_id', 'src', 'from_id'])
   order by array_position(array['source_id','src','from_id'], c.column_name)
   limit 1;

  select c.column_name into v_dst
    from information_schema.columns c
   where c.table_schema = 'public' and c.table_name = 'skill_edges'
     and c.column_name = any (array['target_id', 'dst', 'to_id'])
   order by array_position(array['target_id','dst','to_id'], c.column_name)
   limit 1;

  if v_x is null or v_y is null then
    raise exception 'skill_nodes has no recognised position columns.'
      using hint = 'Looked for display_x/x_pos/x and display_y/y_pos/y. Inspect with: '
                || 'select column_name from information_schema.columns where table_name = ''skill_nodes'';';
  end if;

  raise notice 'skill_nodes positions: % / %  ·  skill_edges: % -> %', v_x, v_y, v_src, v_dst;

  ------------------------------------------------------------------
  -- Nodes
  ------------------------------------------------------------------
  v_sql := format(
    'insert into public.skill_nodes (id, cluster, label, %I, %I%s) values ($1, $2, $3, $4, $5%s)
       on conflict (id) do update set cluster = excluded.cluster, label = excluded.label,
         %I = excluded.%I, %I = excluded.%I%s',
    v_x, v_y,
    case when v_boss is null then '' else ', ' || quote_ident(v_boss) end,
    case when v_boss is null then '' else ', $6' end,
    v_x, v_x, v_y, v_y,
    case when v_boss is null then '' else format(', %I = excluded.%I', v_boss, v_boss) end
  );

  for n in select * from jsonb_array_elements(c_nodes) loop
    if v_boss is null then
      execute v_sql using n->>0, n->>1, n->>2, (n->>3)::int, (n->>4)::int;
    else
      execute v_sql using n->>0, n->>1, n->>2, (n->>3)::int, (n->>4)::int, (n->>5)::boolean;
    end if;
    v_nodes := v_nodes + 1;
  end loop;

  ------------------------------------------------------------------
  -- Edges
  ------------------------------------------------------------------
  if to_regclass('public.skill_edges') is not null and v_src is not null and v_dst is not null then
    v_sql := format(
      'insert into public.skill_edges (%I, %I) values ($1, $2) on conflict do nothing',
      v_src, v_dst
    );
    for e in select * from jsonb_array_elements(c_edges) loop
      execute v_sql using e->>0, e->>1;
      v_edges := v_edges + 1;
    end loop;
  else
    raise notice 'skill_edges missing or column names unrecognised — edges skipped.';
  end if;

  raise notice 'Seeded % nodes, % edges.', v_nodes, v_edges;
end $$;
