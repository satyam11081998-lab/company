-- =====================================================================
-- Migration 0022: stage 3 real-profile testimonials as PENDING drafts.
--
-- These are DRAFT quotes written from each person's public background. They are
-- inserted as status='pending' so they DO NOT appear publicly (public RLS reads
-- only 'published'). Each person must confirm/edit their quote, then an admin
-- publishes it in /admin/testimonials. Idempotent: fixed UUID PKs + on conflict
-- do nothing. NOT a CONTRACTS surface.
-- =====================================================================
insert into public.testimonials (id, name, school, placement, quote, avatar_url, linkedin_url, status, source, position) values
  ('00000000-0000-0000-0000-0000000000a3',
   'Mitiksha Jain', 'TISS HRM & LR ''27',
   'Summer Intern @ Nestle | Batch Rep',
   'As an HR student, GDs decide a lot, and abstract topics used to throw me off completely. Practising the method on MECE taught me to open up a few angles fast and stay calm. By my Nestle process I was the one giving the discussion its structure instead of just adding one more point.',
   null, 'https://www.linkedin.com/in/mitikshajain/', 'pending', 'admin', 10),
  ('00000000-0000-0000-0000-0000000000a4',
   'Srijita Sengupta', 'PGDM, IMI Delhi ''27',
   'Summer Intern @ ITC | 5x National Case Comp Winner',
   'I have done plenty of case competitions, but MECE is what tightened my actual thinking. The scoring kept pointing out where my structure leaked, and fixing that showed up directly in my ITC interviews. It is honest in a way mock rounds with friends never are.',
   null, 'https://www.linkedin.com/in/srijita-sengupta-57a382202/', 'pending', 'admin', 11),
  ('00000000-0000-0000-0000-0000000000a5',
   'Advika Gupta', 'PGDM, IMI Delhi ''27',
   'Summer Intern @ GEP Worldwide | Ex-TCS',
   'Coming from a tech background, I was not confident with cases at all. Doing one case and one guesstimate a day slowly rewired how I break a problem down. By summers I could structure a case without panicking, and that is what carried me through the GEP process.',
   null, 'https://www.linkedin.com/in/advika20gupta/', 'pending', 'admin', 12)
on conflict (id) do nothing;
