-- Store the user's choice to show profile picture on each application separately from the URL.
-- When the user removes their profile picture, we clear profile_picture_url but keep show_profile_picture
-- so the choice is preserved when they add a new picture later.

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS show_profile_picture BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN applications.show_profile_picture IS 'User chose to show profile picture on this application. When true, profile_picture_url is synced from profile on save or when profile picture changes; when user has no picture, profile_picture_url stays null and view page shows no avatar.';

-- Backfill: applications that currently have a profile picture URL were showing it
UPDATE applications
SET show_profile_picture = (profile_picture_url IS NOT NULL AND profile_picture_url != '')
WHERE show_profile_picture = false;
