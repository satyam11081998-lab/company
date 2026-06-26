-- =====================================================================
-- Migration 0020: Colleges refresh — rename to official names, add missing,
-- and re-tier by RESEARCH (not by NIRF score).
--
-- TIERING METHODOLOGY (per owner directive — do NOT use the NIRF rank/score):
-- tier reflects selectivity + placement reputation + brand pull in the MBA
-- community, synthesised from B-school tier lists (cracku, IMS, Careers360,
-- bschoolbuzz, 2025-26):
--   tier 1 = elite / hardest to get / top placements: IIM A,B,C,L,K,I, FMS,
--            XLRI, SPJIMR, MDI, IIFT, JBIMS, IIM Mumbai (ex-NITIE), ISB, and the
--            top IIT B-schools (Bombay/Delhi/KGP/Madras).
--   tier 2 = strong, established, good placements: newer IIMs, NMIMS, SIBM,
--            IMT-G, IMI, Great Lakes, TAPMI, MICA, KJ Somaiya, GIM, XIM, FORE,
--            BIMTECH, IRMA, LIBA, Welingkar, Nirma, Christ, BIM Trichy, NIBM,
--            Univ. of Hyderabad, Jamia Millia, Amrita, BHU-FMS, etc.
--   tier 3 = the rest: most private universities + regional/state institutes.
--
-- ADDITIVE + IDEMPOTENT. Single `on conflict (slug) do update` so re-runs are a
-- no-op. NOTHING is deleted — colleges already present but absent from these
-- lists are left untouched. NOT a CONTRACTS surface (standalone table).
-- =====================================================================

insert into public.colleges (slug, name, short_name, type, tier, city, state_code) values
  -- ── RENAMES / re-tier of existing rows (reuse existing slug) ──────────
  ('nitie-mumbai',       'Indian Institute of Management Mumbai',                    'IIM Mumbai',      'iim',         1, 'Mumbai',          'MH'),
  ('nmims-mumbai',       'SVKM''s Narsee Monjee Institute of Management Studies',    'NMIMS Mumbai',    'mba',         2, 'Mumbai',          'MH'),
  ('xlri-jamshedpur',    'XLRI - Xavier School of Management',                       'XLRI Jamshedpur', 'mba',         1, 'Jamshedpur',      'JH'),
  ('spjimr-mumbai',      'S. P. Jain Institute of Management and Research',          'SPJIMR',          'mba',         1, 'Mumbai',          'MH'),
  ('imt-ghaziabad',      'Institute of Management Technology, Ghaziabad',            'IMT Ghaziabad',   'mba',         2, 'Ghaziabad',       'UP'),
  ('iim-mip',            'MICA',                                                     'MICA',            'mba',         2, 'Ahmedabad',       'GJ'),
  ('iim-ip',             'Guru Gobind Singh Indraprastha University',                'GGSIPU Delhi',    'other',       3, 'New Delhi',       'DL'),
  ('iim-amity',          'Amity University, Noida',                                  'Amity Noida',     'mba',         3, 'Noida',           'UP'),
  ('great-lakes-chennai','Great Lakes Institute of Management',                      'Great Lakes Chennai', 'mba',     2, 'Chennai',         'TN'),

  -- ── NEW — Tier 1 ─────────────────────────────────────────────────────
  -- (the elite management options already seeded; nothing new at tier 1 here)

  -- ── NEW — Tier 2 ─────────────────────────────────────────────────────
  ('tapmi-manipal',      'T. A. Pai Management Institute',                           'TAPMI Manipal',   'mba',         2, 'Manipal',         'KA'),
  ('kj-somaiya',         'K. J. Somaiya Institute of Management',                    'KJ Somaiya',      'mba',         2, 'Mumbai',          'MH'),
  ('gim-goa',            'Goa Institute of Management',                              'GIM Goa',         'mba',         2, 'Sanquelim',       'GA'),
  ('fore-delhi',         'FORE School of Management',                                'FORE Delhi',      'mba',         2, 'New Delhi',       'DL'),
  ('bimtech-gnoida',     'Birla Institute of Management Technology',                 'BIMTECH',         'mba',         2, 'Greater Noida',   'UP'),
  ('irma-anand',         'Institute of Rural Management Anand',                      'IRMA',            'mba',         2, 'Anand',           'GJ'),
  ('liba-chennai',       'Loyola Institute of Business Administration',              'LIBA Chennai',    'mba',         2, 'Chennai',         'TN'),
  ('welingkar-mumbai',   'Prin. L. N. Welingkar Institute of Management Development and Research', 'Welingkar Mumbai', 'mba', 2, 'Mumbai',     'MH'),
  ('imi-kolkata',        'International Management Institute, Kolkata',              'IMI Kolkata',     'mba',         2, 'Kolkata',         'WB'),
  ('imi-bhubaneswar',    'International Management Institute, Bhubaneswar',          'IMI Bhubaneswar', 'mba',         2, 'Bhubaneswar',     'OR'),
  ('imt-hyderabad',      'Institute of Management Technology, Hyderabad',            'IMT Hyderabad',   'mba',         2, 'Hyderabad',       'TG'),
  ('great-lakes-gurgaon','Great Lakes Institute of Management, Gurgaon',             'Great Lakes Gurgaon', 'mba',     2, 'Gurgaon',         'HR'),
  ('bim-trichy',         'Bharathidasan Institute of Management',                    'BIM Trichy',      'mba',         2, 'Tiruchirappalli', 'TN'),
  ('nibm-pune',          'National Institute of Bank Management',                    'NIBM Pune',       'mba',         2, 'Pune',            'MH'),
  ('christ-university',   'Christ University',                                        'Christ Bangalore','other',       2, 'Bengaluru',       'KA'),
  ('amrita-coimbatore',  'Amrita Vishwa Vidyapeetham',                               'Amrita',          'other',       2, 'Coimbatore',      'TN'),
  ('jamia-millia',       'Jamia Millia Islamia',                                     'Jamia Millia',    'other',       2, 'New Delhi',       'DL'),
  ('bhu-fms',            'Banaras Hindu University (Faculty of Management Studies)', 'FMS BHU',         'other',       2, 'Varanasi',        'UP'),
  ('hyderabad-university','University of Hyderabad (School of Management Studies)',   'UoH Hyderabad',   'other',       2, 'Hyderabad',       'TG'),
  ('iit-dhanbad-ism',    'Indian Institute of Technology (ISM) Dhanbad',             'IIT (ISM) Dhanbad','engineering', 2, 'Dhanbad',         'JH'),
  ('iit-jodhpur',        'Indian Institute of Technology Jodhpur',                   'IIT Jodhpur',     'engineering', 2, 'Jodhpur',         'RJ'),

  -- ── NEW — Tier 3 ─────────────────────────────────────────────────────
  ('chandigarh-university','Chandigarh University',                                  'CU Mohali',       'mba',         3, 'Mohali',          'PB'),
  ('upes-dehradun',      'UPES',                                                     'UPES Dehradun',   'mba',         3, 'Dehradun',        'UK'),
  ('graphic-era',        'Graphic Era University',                                   'Graphic Era',     'mba',         3, 'Dehradun',        'UK'),
  ('ifhe-hyderabad',     'ICFAI Foundation for Higher Education (IBS Hyderabad)',    'IBS Hyderabad',   'mba',         3, 'Hyderabad',       'TG'),
  ('thapar-lmt',         'Thapar Institute of Engineering and Technology (LM Thapar School of Management)', 'Thapar LMT', 'engineering', 3, 'Patiala', 'PB'),
  ('srm-chennai',        'SRM Institute of Science and Technology',                  'SRM Chennai',     'engineering', 3, 'Chennai',         'TN'),
  ('mnit-jaipur',        'Malaviya National Institute of Technology',                'MNIT Jaipur',     'engineering', 3, 'Jaipur',          'RJ'),
  ('saveetha-chennai',   'Saveetha Institute of Medical and Technical Sciences',     'Saveetha',        'other',       3, 'Chennai',         'TN'),
  ('soa-bhubaneswar',    'Siksha O Anusandhan',                                      'SOA',             'other',       3, 'Bhubaneswar',     'OR'),
  ('kiit-bhubaneswar',   'Kalinga Institute of Industrial Technology (KSOM)',        'KIIT KSOM',       'mba',         3, 'Bhubaneswar',     'OR'),
  ('amu-aligarh',        'Aligarh Muslim University',                                'AMU Aligarh',     'other',       3, 'Aligarh',         'UP'),
  ('kl-university',      'Koneru Lakshmaiah Education Foundation',                   'KL University',   'engineering', 3, 'Vaddeswaram',     'AP'),
  ('alliance-bangalore', 'Alliance University',                                      'Alliance',        'mba',         3, 'Bengaluru',       'KA'),
  ('jain-bangalore',     'Jain (Deemed-to-be University)',                           'Jain Bangalore',  'other',       3, 'Bengaluru',       'KA'),
  ('bml-munjal',         'BML Munjal University',                                    'BML Munjal',      'mba',         3, 'Gurgaon',         'HR'),
  ('bbau-lucknow',       'Babasaheb Bhimrao Ambedkar University',                    'BBAU Lucknow',    'other',       3, 'Lucknow',         'UP'),
  ('tsm-madurai',        'Thiagarajar School of Management',                         'TSM Madurai',     'mba',         3, 'Madurai',         'TN'),
  ('manipal-jaipur',     'Manipal University Jaipur',                                'Manipal Jaipur',  'other',       3, 'Jaipur',          'RJ'),
  ('cusat-cochin',       'Cochin University of Science and Technology',              'CUSAT',           'other',       3, 'Cochin',          'KL'),
  ('mmmut-gorakhpur',    'Madan Mohan Malaviya University of Technology',            'MMMUT',           'engineering', 3, 'Gorakhpur',       'UP'),
  ('psg-coimbatore',     'PSG College of Technology',                               'PSG Tech',        'engineering', 3, 'Coimbatore',      'TN'),
  ('nit-calicut',        'National Institute of Technology Calicut',                 'NIT Calicut',     'engineering', 3, 'Kozhikode',       'KL'),
  ('jamia-hamdard',      'Jamia Hamdard',                                            'Jamia Hamdard',   'other',       3, 'New Delhi',       'DL'),
  ('anna-university',    'Anna University',                                          'Anna University', 'engineering', 3, 'Chennai',         'TN'),
  ('pdeu-gandhinagar',   'Pandit Deendayal Energy University',                       'PDEU',            'mba',         3, 'Gandhinagar',     'GJ'),
  ('jims-delhi',         'Jagan Institute of Management Studies',                    'JIMS Delhi',      'mba',         3, 'Delhi',           'DL'),
  ('rajagiri-cochin',    'Rajagiri Business School',                                 'Rajagiri Cochin', 'mba',         3, 'Cochin',          'KL'),
  ('panjab-university',  'Panjab University (University Business School)',            'PU UBS',          'other',       3, 'Chandigarh',      'CH'),
  ('abv-iiitm-gwalior',  'Atal Bihari Vajpayee Indian Institute of Information Technology and Management', 'ABV-IIITM Gwalior', 'engineering', 3, 'Gwalior', 'MP'),
  ('manage-hyderabad',   'National Institute of Agricultural Extension Management (MANAGE)', 'MANAGE',  'other',       3, 'Hyderabad',       'TG'),
  ('bit-mesra',          'Birla Institute of Technology, Mesra',                     'BIT Mesra',       'engineering', 3, 'Ranchi',          'JH'),
  ('imt-nagpur',         'Institute of Management Technology, Nagpur',               'IMT Nagpur',      'mba',         3, 'Nagpur',          'MH'),
  ('lucknow-university',  'University of Lucknow',                                    'Lucknow University','other',     3, 'Lucknow',         'UP'),
  ('jaipuria-noida',     'Jaipuria Institute of Management, Noida',                  'Jaipuria Noida',  'mba',         3, 'Noida',           'UP'),
  ('jaipuria-lucknow',   'Jaipuria Institute of Management, Lucknow',                'Jaipuria Lucknow','mba',         3, 'Lucknow',         'UP'),
  ('jaipuria-jaipur',    'Jaipuria Institute of Management, Jaipur',                 'Jaipuria Jaipur', 'mba',         3, 'Jaipur',          'RJ'),
  ('jaipuria-indore',    'Jaipuria Institute of Management, Indore',                 'Jaipuria Indore', 'mba',         3, 'Indore',          'MP'),
  -- second list (additional)
  ('amity-kolkata',      'Amity University, Kolkata',                                'Amity Kolkata',   'mba',         3, 'Kolkata',         'WB'),
  ('amity-haryana',      'Amity University Haryana',                                 'Amity Haryana',   'mba',         3, 'Gurugram',        'HR'),
  ('amity-patna',        'Amity University Patna',                                   'Amity Patna',     'mba',         3, 'Patna',           'BR'),
  ('bvimed-pune',        'Bharati Vidyapeeth Institute of Management and Entrepreneurship Development', 'BV-IMED Pune', 'mba', 3, 'Pune',     'MH'),
  ('cbsa-landran',       'Chandigarh Business School of Administration, Landran',    'CBSA Landran',    'mba',         3, 'Mohali',          'PB'),
  ('gla-mathura',        'GLA University',                                           'GLA Mathura',     'other',       3, 'Mathura',         'UP'),
  ('gitam-vizag',        'GITAM (Gandhi Institute of Technology and Management)',    'GITAM',           'other',       3, 'Visakhapatnam',   'AP'),
  ('gju-hisar',          'Guru Jambheshwar University of Science and Technology',    'GJU Hisar',       'other',       3, 'Hisar',           'HR'),
  ('hits-chennai',       'Hindustan Institute of Technology and Science',            'HITS Chennai',    'engineering', 3, 'Chennai',         'TN'),
  ('naarm-hyderabad',    'ICAR-National Academy of Agricultural Research Management','NAARM',           'other',       3, 'Hyderabad',       'TG'),
  ('iihmr-jaipur',       'IIHMR University',                                         'IIHMR Jaipur',    'mba',         3, 'Jaipur',          'RJ'),
  ('opju-raigarh',       'OP Jindal University, Raigarh',                            'OPJU Raigarh',    'mba',         3, 'Raigarh',         'CG'),
  ('presidency-bangalore','Presidency University, Bengaluru',                        'Presidency Blr',  'mba',         3, 'Bengaluru',       'KA'),
  ('pibm-pune',          'Pune Institute of Business Management',                    'PIBM Pune',       'mba',         3, 'Pune',            'MH'),
  ('sharda-university',  'Sharda University',                                        'Sharda',          'mba',         3, 'Greater Noida',   'UP'),
  ('sri-balaji-pune',    'Sri Balaji University, Pune',                              'SBUP Pune',       'mba',         3, 'Pune',            'MH'),
  ('tezpur-university',  'Tezpur University',                                        'Tezpur Univ',     'other',       3, 'Tezpur',          'AS'),
  ('allahabad-university','University of Allahabad',                                 'Allahabad Univ',  'other',       3, 'Prayagraj',       'UP'),
  ('vignan-guntur',      'Vignan''s Foundation for Science, Technology and Research','VFSTR',           'other',       3, 'Guntur',          'AP')
on conflict (slug) do update set
  name        = excluded.name,
  short_name  = excluded.short_name,
  type        = excluded.type,
  tier        = excluded.tier,
  city        = excluded.city,
  state_code  = excluded.state_code;
