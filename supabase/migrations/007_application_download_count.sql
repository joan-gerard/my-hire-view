-- Add download_count to track how many times the CV has been downloaded (excluding owner).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN applications.download_count IS 'Number of times the CV was downloaded from the public view page (owner downloads are not counted).';
