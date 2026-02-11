-- Add is_active column for archiving applications (soft hide from active use)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN applications.is_active IS 'When false, application is archived; link still works but shows a warning to recruiters.';
