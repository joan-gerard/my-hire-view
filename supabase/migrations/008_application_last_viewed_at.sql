-- Record the last date and time the application was viewed (by a non-owner).
-- Updated whenever view_count is incremented (i.e. when a recruiter/visitor views the page).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMPTZ NULL;

COMMENT ON COLUMN applications.last_viewed_at IS 'Last time the application page was viewed by someone other than the owner (set when view_count is incremented).';
