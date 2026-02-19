-- Waitlist signups for pre-launch landing page (LANDING_PAGE_BRIEF).
-- Only server (service role) can insert/select; no public access.
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  job_search_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_email ON waitlist_signups (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at ON waitlist_signups (created_at DESC);

ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- No policies: only service role (API using admin client) can read/write.
-- This keeps the table private and avoids exposing signup data to anon users.
