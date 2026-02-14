-- View count increment via SECURITY DEFINER so it works for anonymous and non-owner viewers.
-- RLS blocks direct UPDATE on applications for non-owners; this function runs with definer rights
-- and updates only view_count and last_viewed_at. Execution is restricted to service_role so
-- only the backend (using SUPABASE_SERVICE_ROLE_KEY) can call it; anon/authenticated cannot.

CREATE OR REPLACE FUNCTION increment_application_view_count(p_slug text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE applications
  SET
    view_count = COALESCE(view_count, 0) + 1,
    last_viewed_at = now()
  WHERE slug = p_slug;
END;
$$;

COMMENT ON FUNCTION increment_application_view_count(text) IS
  'Increments view_count and sets last_viewed_at for the given slug. Called only from the API with service_role. Owner check is done in the application layer before calling.';

-- Restrict execution to service_role only (backend). Prevents anon/authenticated from calling.
REVOKE EXECUTE ON FUNCTION increment_application_view_count(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION increment_application_view_count(text) FROM anon;
REVOKE EXECUTE ON FUNCTION increment_application_view_count(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION increment_application_view_count(text) TO service_role;
