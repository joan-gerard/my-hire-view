-- Remove profile_picture_include_preference; feature simplified to per-application checkbox only
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_profile_picture_include_preference_check,
  DROP COLUMN IF EXISTS profile_picture_include_preference;
