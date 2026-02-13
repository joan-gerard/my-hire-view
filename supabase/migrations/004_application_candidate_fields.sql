-- Add candidate snapshot fields to applications (filled from profile on create/update)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

COMMENT ON COLUMN applications.first_name IS 'Snapshot from profile at create/update; shown to recruiters.';
COMMENT ON COLUMN applications.last_name IS 'Snapshot from profile at create/update; shown to recruiters.';
COMMENT ON COLUMN applications.location IS 'Snapshot from profile at create/update; shown to recruiters.';
COMMENT ON COLUMN applications.portfolio_url IS 'Snapshot from profile at create/update; link shown to recruiters.';
COMMENT ON COLUMN applications.linkedin_url IS 'Snapshot from profile at create/update; link shown to recruiters.';
