-- Seed sample applications for local / staging dashboard testing.
-- Run in the Supabase SQL Editor (service role / postgres), not via the app API.
--
-- Configured for one account (edit cfg below before running elsewhere):
--   user_id       — must exist in auth.users
--   primary_cv_id — must exist in primary_cvs for that user
--   cv_url        — must match primary_cvs.url for that id + user
-- If the join matches nothing, the INSERT selects zero rows (fail closed).
-- The upsert still updates on (user_id, slug) once set — only run against an
-- account you intend to seed.
--
-- Coverage goals (admin dashboard / day groups / insights):
--   - status mix: active (published), draft, archived
--   - active: both unviewed (0 views) and viewed (views + last_viewed_at)
--   - created_at: several calendar days + varied times of day
--   - insights: view_count, download_count, last_viewed_at (drafts stay quiet)
--
-- Idempotent: re-run upserts on (user_id, slug). Deterministic company-role slugs.
-- include_name_in_slug is NULL (company-role slugs only — no name in URL).
--
-- Schema notes (vs older seeds):
--   - is_active → status ('active' | 'draft' | 'archived') + archived_at
--   - applications.profile_picture_url was dropped (use show_profile_picture only)
--   - Reusing one cv_url across rows requires cv_type = 'primary'
--     (partial unique index on tailored (user_id, cv_url))
--
-- Lookup helpers:
--   SELECT id FROM auth.users WHERE email = 'you@example.com';
--   SELECT id, url, filename FROM primary_cvs WHERE user_id = '<user_id>';

INSERT INTO "public"."applications" (
  "id",
  "slug",
  "company",
  "role",
  "cv_url",
  "video_url",
  "created_at",
  "updated_at",
  "view_count",
  "user_id",
  "status",
  "archived_at",
  "first_name",
  "last_name",
  "location",
  "portfolio_url",
  "linkedin_url",
  "include_name_in_slug",
  "download_count",
  "last_viewed_at",
  "cv_filename",
  "use_original_cv_filename",
  "show_profile_picture",
  "cv_type",
  "primary_cv_id"
)
SELECT
  gen_random_uuid(),
  lower(regexp_replace(company || '-' || role, '[^a-zA-Z0-9]+', '-', 'g')),
  company,
  role,
  params.cv_url,
  'https://youtu.be/1cImNJ3bNH4',
  date_trunc('day', NOW())
    - (days_ago || ' days')::interval
    + make_interval(hours => hour_of_day, mins => minute_of_day),
  date_trunc('day', NOW())
    - (days_ago || ' days')::interval
    + make_interval(hours => hour_of_day, mins => minute_of_day)
    + CASE WHEN status = 'draft' THEN interval '0' ELSE interval '2 hours' END,
  view_count,
  params.user_id,
  status,
  CASE
    WHEN status = 'archived' THEN
      date_trunc('day', NOW())
        - (coalesce(archived_days_ago, days_ago) || ' days')::interval
        + make_interval(hours => hour_of_day, mins => minute_of_day)
    ELSE NULL
  END,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL, -- company-role slug only (matches generated slug; edit form stays consistent)
  download_count,
  CASE
    WHEN last_viewed_hours_ago IS NULL THEN NULL
    ELSE NOW() - (last_viewed_hours_ago || ' hours')::interval
  END,
  params.cv_filename,
  true,
  false,
  'primary',
  params.primary_cv_id
FROM (
  VALUES
    -- ord | company | role | status | days_ago | hour | min | views | downloads | last_viewed_hours_ago | archived_days_ago
    -- Today (cluster for day-group UI) — mix of status + times
    (1,  'Spotify',    'Backend Engineer',              'active',   0,  9, 12,  0,  0, NULL::int, NULL::int),
    (2,  'Spotify',    'Platform Engineer',             'draft',    0, 11,  5,  0,  0, NULL::int, NULL::int),
    (3,  'Klarna',     'Full Stack Developer',          'active',   0, 14, 30,  7,  2,         3, NULL::int),
    (4,  'Klarna',     'Engineering Manager',           'archived', 0, 16, 45, 14,  4,        20,         0),
    -- Yesterday
    (5,  'Volvo Cars', 'DevOps Engineer',               'active',   1,  8, 20,  0,  0, NULL::int, NULL::int),
    (6,  'IKEA',       'Software Engineer',             'active',   1, 13, 10,  3,  1,        18, NULL::int),
    (7,  'IKEA',       'Cloud Architect',               'draft',    1, 19, 40,  0,  0, NULL::int, NULL::int),
    -- 2–4 days ago
    (8,  'Ericsson',   'Site Reliability Engineer',     'active',   2, 10,  0, 22,  6,         6, NULL::int),
    (9,  'Northvolt',  'Frontend Engineer',             'draft',    2, 15, 25,  0,  0, NULL::int, NULL::int),
    (10, 'Truecaller', 'Mobile Engineer',               'archived', 3, 11, 50,  9,  3,        50,         1),
    (11, 'King',       'Game Server Engineer',          'active',   3, 17, 15,  1,  0,        28, NULL::int),
    (12, 'King',       'Tools Engineer',                'draft',    4,  9, 35,  0,  0, NULL::int, NULL::int),
    -- ~1 week
    (13, 'Skyscanner', 'Senior Software Engineer',      'active',   6, 12,  5, 31,  8,         4, NULL::int),
    (14, 'Revolut',    'Backend Engineer',              'archived', 7, 14, 55, 18,  5,        72,         2),
    (15, 'Revolut',    'Security Engineer',             'active',   7, 18, 20,  0,  0, NULL::int, NULL::int),
    (16, 'Wise',       'Payments Engineer',             'draft',    8, 10, 45,  0,  0, NULL::int, NULL::int),
    -- ~2 weeks
    (17, 'Monzo',      'Platform Engineer',             'active',  12,  9,  0, 45, 12,         9, NULL::int),
    (18, 'Deliveroo',  'Full Stack Engineer',           'archived',13, 13, 30, 27,  7,       120,         5),
    (19, 'Deliveroo',  'Data Engineer',                 'active',  14, 16, 10,  5,  1,        36, NULL::int),
    (20, 'Notion',     'Product Engineer',              'draft',   14, 20,  0,  0,  0, NULL::int, NULL::int),
    -- ~3–5 weeks (older archived + long-lived active)
    (21, 'Figma',      'Infrastructure Engineer',       'active',  21, 11, 25, 62, 15,         2, NULL::int),
    (22, 'Linear',     'Frontend Engineer',             'archived',22, 15, 40, 11,  2,       200,        10),
    (23, 'Vercel',     'Developer Experience Engineer', 'draft',   25,  8, 50,  0,  0, NULL::int, NULL::int),
    (24, 'Stripe',     'API Engineer',                  'active',  28, 14, 15,  0,  0, NULL::int, NULL::int),
    (25, 'Stripe',     'Reliability Engineer',          'archived',30, 10,  5, 40, 10,       240,        14),
    (26, 'Shopify',    'Staff Engineer',                'active',  35, 17, 35, 19,  4,        48, NULL::int),
    (27, 'GitHub',     'Systems Engineer',              'draft',   40, 12, 20,  0,  0, NULL::int, NULL::int),
    (28, 'Datadog',    'Observability Engineer',        'archived',45,  9, 55,  6,  1,       300,        20),
    (29, 'HashiCorp',  'Terraform Engineer',            'active',  50, 13,  0, 88, 21,         1, NULL::int),
    (30, 'Cloudflare', 'Network Engineer',              'archived',55, 16, 30, 33,  9,       400,        30)
) AS seed(
  ord,
  company,
  role,
  status,
  days_ago,
  hour_of_day,
  minute_of_day,
  view_count,
  download_count,
  last_viewed_hours_ago,
  archived_days_ago
)
CROSS JOIN LATERAL (
  -- Edit these for another account. Fail closed if primary_cvs row missing/mismatched.
  SELECT
    '17305170-d4a6-4313-b73f-e56cdd1590c2'::uuid AS user_id,
    'cb01733a-df28-4b72-88e6-85de5ba8c311'::uuid AS primary_cv_id,
    'https://pub-87b38b8cc8f5460dbc5e6d79e952bd83.r2.dev/cvs/17305170-d4a6-4313-b73f-e56cdd1590c2/primary/b882be89-4db3-4b0e-ae46-f54ba73e6cc7.pdf'::text AS cv_url
) AS cfg
INNER JOIN LATERAL (
  SELECT
    p.id AS primary_cv_id,
    p.url AS cv_url,
    p.filename AS cv_filename,
    cfg.user_id
  FROM primary_cvs p
  WHERE p.id = cfg.primary_cv_id
    AND p.user_id = cfg.user_id
    AND p.url = cfg.cv_url
  LIMIT 1
) AS params ON true
ON CONFLICT (user_id, slug) DO UPDATE SET
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  cv_url = EXCLUDED.cv_url,
  video_url = EXCLUDED.video_url,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at,
  view_count = EXCLUDED.view_count,
  status = EXCLUDED.status,
  archived_at = EXCLUDED.archived_at,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  location = EXCLUDED.location,
  portfolio_url = EXCLUDED.portfolio_url,
  linkedin_url = EXCLUDED.linkedin_url,
  include_name_in_slug = EXCLUDED.include_name_in_slug,
  download_count = EXCLUDED.download_count,
  last_viewed_at = EXCLUDED.last_viewed_at,
  cv_filename = EXCLUDED.cv_filename,
  use_original_cv_filename = EXCLUDED.use_original_cv_filename,
  show_profile_picture = EXCLUDED.show_profile_picture,
  cv_type = EXCLUDED.cv_type,
  primary_cv_id = EXCLUDED.primary_cv_id;
