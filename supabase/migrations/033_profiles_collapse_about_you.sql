-- Preference: collapse About you on create/edit after the first live application.
-- Default true — photo, name, contact, location, and links rarely change per role.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS collapse_about_you BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.collapse_about_you IS
  'When true, About you on applications starts collapsed after the first live application. When false, About you stays fully expanded.';
