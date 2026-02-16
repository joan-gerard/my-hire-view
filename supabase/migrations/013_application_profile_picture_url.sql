-- Copy of profile picture URL at save time; view page reads from application only
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

COMMENT ON COLUMN applications.profile_picture_url IS 'Profile picture URL copied from profiles at create/update when user chose to show picture for this application. Source of truth is profiles.profile_picture_url.';
