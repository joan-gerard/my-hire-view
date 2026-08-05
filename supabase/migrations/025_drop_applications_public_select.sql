-- A2-016: Remove open public SELECT on applications.
-- USING (true) let anon PostgREST clients enumerate every row, not only the
-- intended public URL path. Public pages resolve via the service-role client
-- in resolvePublicApplication (same pattern as profiles.public_id lookup).
-- Owners still SELECT their own rows via "Users can view their own applications".

DROP POLICY IF EXISTS "Public can view applications by slug" ON applications;
