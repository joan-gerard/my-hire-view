-- Change include_name_in_slug from boolean to TEXT: null (no name), 'start' (name at start), 'end' (name at end)
ALTER TABLE applications
  ALTER COLUMN include_name_in_slug DROP DEFAULT,
  ALTER COLUMN include_name_in_slug DROP NOT NULL;

ALTER TABLE applications
  ALTER COLUMN include_name_in_slug TYPE TEXT
  USING (CASE WHEN include_name_in_slug = true THEN 'start' ELSE NULL END);

ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_include_name_in_slug_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_include_name_in_slug_check
  CHECK (include_name_in_slug IS NULL OR include_name_in_slug IN ('start', 'end'));

COMMENT ON COLUMN applications.include_name_in_slug IS 'Name position in slug: null = not included, start = name-company-role, end = company-role-name.';
