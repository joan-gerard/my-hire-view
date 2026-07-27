-- Option B public URLs: /view/{public_id}/{slug}
-- public_id: opaque per-candidate identifier on profiles
-- slug: unique per user (not globally)

ALTER TABLE profiles
  ADD COLUMN public_id TEXT NOT NULL UNIQUE;

CREATE INDEX idx_profiles_public_id ON profiles(public_id);

COMMENT ON COLUMN profiles.public_id IS
  'Short random opaque id for public share URLs. Assigned at signup; not derived from name.';

-- Replace global slug uniqueness with per-user uniqueness
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_slug_key;

CREATE UNIQUE INDEX applications_user_id_slug_key ON applications (user_id, slug);

-- View count RPC: resolve by public_id + slug
DROP FUNCTION IF EXISTS increment_application_view_count(text);

CREATE OR REPLACE FUNCTION increment_application_view_count(
  p_public_id text,
  p_slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE applications a
  SET
    view_count = COALESCE(a.view_count, 0) + 1,
    last_viewed_at = now()
  FROM profiles p
  WHERE a.user_id = p.user_id
    AND p.public_id = p_public_id
    AND a.slug = p_slug;
END;
$$;

COMMENT ON FUNCTION increment_application_view_count(text, text) IS
  'Increments view_count for the application matching public_id and slug. Called only from the API with service_role.';

REVOKE EXECUTE ON FUNCTION increment_application_view_count(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_application_view_count(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_application_view_count(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_application_view_count(text, text) TO service_role;

-- Download count RPC: resolve by public_id + slug
DROP FUNCTION IF EXISTS increment_application_download_count(text);

CREATE OR REPLACE FUNCTION increment_application_download_count(
  p_public_id text,
  p_slug text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE applications a
  SET download_count = COALESCE(a.download_count, 0) + 1
  FROM profiles p
  WHERE a.user_id = p.user_id
    AND p.public_id = p_public_id
    AND a.slug = p_slug;
END;
$$;

COMMENT ON FUNCTION increment_application_download_count(text, text) IS
  'Increments download_count for the application matching public_id and slug. Called only from the API with service_role.';

REVOKE EXECUTE ON FUNCTION increment_application_download_count(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_application_download_count(text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_application_download_count(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_application_download_count(text, text) TO service_role;
