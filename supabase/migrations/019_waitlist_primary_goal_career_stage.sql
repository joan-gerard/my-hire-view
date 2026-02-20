-- Optional waitlist fields: primary goal and career stage (for segmentation).
ALTER TABLE waitlist_signups
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS career_stage TEXT;
