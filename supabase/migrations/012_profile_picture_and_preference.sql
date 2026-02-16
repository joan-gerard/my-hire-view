-- Profile picture URL (Supabase Storage) and preference for including it in applications
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_include_preference TEXT;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_profile_picture_include_preference_check
  CHECK (profile_picture_include_preference IS NULL OR profile_picture_include_preference IN ('always', 'per_application'));

COMMENT ON COLUMN profiles.profile_picture_url IS 'Public URL of the user profile picture (Supabase Storage). One picture per user; shown on applications when preference allows.';
COMMENT ON COLUMN profiles.profile_picture_include_preference IS 'When to include profile picture: always = include on every application; per_application = user chooses show/hide when creating each application. Only relevant when profile_picture_url is set.';
