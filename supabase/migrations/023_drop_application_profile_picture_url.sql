-- Drop denormalized application avatar URL.
-- Avatar is read from profiles.profile_picture_url when applications.show_profile_picture is true.

ALTER TABLE applications
  DROP COLUMN IF EXISTS profile_picture_url;

COMMENT ON COLUMN applications.show_profile_picture IS
  'User chose to show profile picture on this application. When true, public/admin views use profiles.profile_picture_url (live); when false or profile has no picture, no avatar is shown.';
