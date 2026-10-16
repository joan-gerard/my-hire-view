-- Seed sample applications for local / staging dashboard testing.
-- Run in the Supabase SQL Editor (service role / postgres), not via the app API.
--
-- Before running, replace:
--   1) user_id          — must exist in auth.users
--   2) cv_url           — real object under your current R2_PUBLIC_BASE_URL
--   3) primary_cv_id    — optional; set to a primary_cvs.id owned by that user
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
  'https://pub-87b38b8cc8f5460dbc5e6d79e952bd83.r2.dev/cvs/17305170-d4a6-4313-b73f-e56cdd1590c2/primary/399f52e5-427f-4239-8c3e-efc77d6abd0d.pdf', -- TODO: replace
  'https://youtu.be/1cImNJ3bNH4',
  NOW() - (ord || ' days')::interval,
  NOW() - (ord || ' days')::interval,
  (ord - 1) * 2,
  '17305170-d4a6-4313-b73f-e56cdd1590c2', -- TODO: confirm user still exists
  CASE WHEN ord % 2 = 1 THEN 'active' ELSE 'archived' END,
  CASE WHEN ord % 2 = 0 THEN NOW() - (ord || ' days')::interval ELSE NULL END,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  'start',
  ord - 1,
  CASE WHEN ord % 3 = 0 THEN NOW() - (ord || ' hours')::interval ELSE NULL END,
  'Joan_Gerard_Full_Stack_DevOps_CV.pdf',
  true,
  false,
  'primary', -- required when all rows share one cv_url
  NULL -- TODO: optional primary_cvs.id for this user
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
) AS seed(ord, company, role);
