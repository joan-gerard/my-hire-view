-- Persist user choice to include first/last name in the shareable URL slug
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS include_name_in_slug BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN applications.include_name_in_slug IS 'When true, slug was generated with first and last name (e.g. john-doe-company-role). Used to show correct checkbox state when editing.';
