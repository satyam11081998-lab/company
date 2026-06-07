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
