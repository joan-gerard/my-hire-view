-- Contact email / phone on profiles + application snapshots, and default
-- show preferences for new applications (About you fields + picture).

-- Profiles: optional contact email (when not using account email), phone,
-- and per-field defaults for create-application include toggles.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS use_account_email BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS default_show_email BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_show_phone BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_show_profile_picture BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_show_location BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_show_linkedin BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS default_show_portfolio BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN profiles.contact_email IS
  'Optional recruiter-facing email when use_account_email is false.';
COMMENT ON COLUMN profiles.use_account_email IS
  'When true, applications use the Auth account email; when false, contact_email.';
COMMENT ON COLUMN profiles.phone IS
  'Optional recruiter-facing phone; snapshotted onto applications when shown.';
COMMENT ON COLUMN profiles.default_show_email IS
  'Default include for email on new applications when an email is available.';
COMMENT ON COLUMN profiles.default_show_phone IS
  'Default include for phone on new applications when phone is set.';
COMMENT ON COLUMN profiles.default_show_profile_picture IS
  'Default show_profile_picture on new applications when a picture exists.';
COMMENT ON COLUMN profiles.default_show_location IS
  'Default include for location on new applications when location is set.';
COMMENT ON COLUMN profiles.default_show_linkedin IS
  'Default include for LinkedIn on new applications when LinkedIn is set.';
COMMENT ON COLUMN profiles.default_show_portfolio IS
  'Default include for portfolio on new applications when portfolio is set.';

-- Applications: snapshot of contact email / phone shown on /view (null = hidden).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

COMMENT ON COLUMN applications.email IS
  'Snapshot of contact email for recruiters; null = hidden on this application.';
COMMENT ON COLUMN applications.phone IS
  'Snapshot of phone for recruiters; null = hidden on this application.';
