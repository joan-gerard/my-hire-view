-- Download count increment via SECURITY DEFINER so it works for anonymous and non-owner viewers.
-- RLS blocks direct UPDATE on applications for non-owners; this function runs with definer rights
-- and updates only download_count. Execution is restricted to service_role so only the backend
-- (using SUPABASE_SERVICE_ROLE_KEY) can call it; anon/authenticated cannot.

CREATE OR REPLACE FUNCTION increment_application_download_count(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE applications
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE slug = p_slug;
END;
$$;

COMMENT ON FUNCTION increment_application_download_count(text) IS
  'Increments download_count for the given slug. Called only from the API with service_role. Owner check is done in the application layer before calling.';

-- Restrict execution to service_role only (backend). Prevents anon/authenticated from calling.
REVOKE EXECUTE ON FUNCTION increment_application_download_count(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_application_download_count(text) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_application_download_count(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_application_download_count(text) TO service_role;
