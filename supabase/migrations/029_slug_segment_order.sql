-- J5-128: replace Name in URL (include_name_in_slug) with company/role segment order.
-- Existing application.slug values are left unchanged (name-based and custom links keep resolving).

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS slug_segment_order TEXT NOT NULL DEFAULT 'company_role';

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_slug_segment_order_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_slug_segment_order_check
  CHECK (slug_segment_order IN ('company_role', 'role_company'));

COMMENT ON COLUMN applications.slug_segment_order IS
  'Order of company vs role in auto-derived slugs: company_role (default) or role_company.';

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_include_name_in_slug_check;

ALTER TABLE applications
  DROP COLUMN IF EXISTS include_name_in_slug;
