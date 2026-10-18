-- Seed sample applications for local / staging dashboard testing.
-- Run in the Supabase SQL Editor (service role / postgres), not via the app API.
--
-- Before running, set BOTH values in the cfg subquery below (they start as NULL
-- so a careless run inserts nothing and cannot overwrite a real account):
--   1) user_id — must exist in auth.users
--   2) cv_url  — real primary library object under your R2_PUBLIC_BASE_URL
-- A matching primary_cvs row (same user_id + url) must already exist; primary_cv_id
-- is resolved from that row. If either is NULL or none matches, the INSERT selects
-- zero rows (fail closed). The upsert still updates on (user_id, slug) once set —
-- only run against an account you intend to seed.
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
--   SELECT id, url FROM primary_cvs WHERE user_id = '<user_id>';

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
  NOW() - (ord || ' days')::interval,
  NOW() - (ord || ' days')::interval,
  (ord - 1) * 2,
  params.user_id,
  CASE WHEN ord % 2 = 1 THEN 'active' ELSE 'archived' END,
  CASE WHEN ord % 2 = 0 THEN NOW() - (ord || ' days')::interval ELSE NULL END,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL, -- company-role slug only (matches generated slug; edit form stays consistent)
  ord - 1,
  CASE WHEN ord % 3 = 0 THEN NOW() - (ord || ' hours')::interval ELSE NULL END,
  'Joan_Gerard_Full_Stack_DevOps_CV.pdf',
  true,
  false,
  'primary',
  params.primary_cv_id
FROM (
  VALUES
    (1,  'Spotify',           'Backend Engineer'),
    (2,  'Spotify',           'Platform Engineer'),
    (3,  'Klarna',            'Full Stack Developer'),
    (4,  'Klarna',            'Engineering Manager'),
    (5,  'Volvo Cars',        'DevOps Engineer'),
    (6,  'IKEA',              'Software Engineer'),
    (7,  'IKEA',              'Cloud Architect'),
    (8,  'Ericsson',          'Site Reliability Engineer'),
    (9,  'Northvolt',         'Frontend Engineer'),
    (10, 'Truecaller',        'Mobile Engineer'),
    (11, 'King',              'Game Server Engineer'),
    (12, 'King',              'Tools Engineer'),
    (13, 'Skyscanner',        'Senior Software Engineer'),
    (14, 'Revolut',           'Backend Engineer'),
    (15, 'Revolut',           'Security Engineer'),
    (16, 'Wise',              'Payments Engineer'),
    (17, 'Monzo',             'Platform Engineer'),
    (18, 'Deliveroo',         'Full Stack Engineer'),
    (19, 'Deliveroo',         'Data Engineer'),
    (20, 'Notion',            'Product Engineer'),
    (21, 'Figma',             'Infrastructure Engineer'),
    (22, 'Linear',            'Frontend Engineer'),
    (23, 'Vercel',            'Developer Experience Engineer'),
    (24, 'Stripe',            'API Engineer'),
    (25, 'Stripe',            'Reliability Engineer'),
    (26, 'Shopify',           'Staff Engineer'),
    (27, 'GitHub',            'Systems Engineer'),
    (28, 'Datadog',           'Observability Engineer'),
    (29, 'HashiCorp',         'Terraform Engineer'),
    (30, 'Cloudflare',        'Network Engineer')
) AS seed(ord, company, role)
CROSS JOIN LATERAL (
  -- Fail closed until both are set. primary_cv_id is resolved from primary_cvs.
  SELECT
    NULL::uuid AS user_id,
    NULL::text AS cv_url
) AS cfg
INNER JOIN LATERAL (
  SELECT p.id AS primary_cv_id, cfg.user_id, cfg.cv_url
  FROM primary_cvs p
  WHERE cfg.user_id IS NOT NULL
    AND cfg.cv_url IS NOT NULL
    AND p.user_id = cfg.user_id
    AND p.url = cfg.cv_url
  LIMIT 1
) AS params ON true
ON CONFLICT (user_id, slug) DO UPDATE SET
  company = EXCLUDED.company,
  role = EXCLUDED.role,
  cv_url = EXCLUDED.cv_url,
  video_url = EXCLUDED.video_url,
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
