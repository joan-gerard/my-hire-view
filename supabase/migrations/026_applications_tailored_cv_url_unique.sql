-- B1-003: one tailored CV object URL per user (primary library URLs may be shared).
-- Partial unique index so cv_type = 'primary' rows can share the same cv_url.
-- App code still canonicalizes to the decoded object-key URL before write so
-- percent-encoded equivalents collide on this index.

CREATE UNIQUE INDEX IF NOT EXISTS applications_user_id_tailored_cv_url_key
  ON applications (user_id, cv_url)
  WHERE cv_type = 'tailored';

COMMENT ON INDEX applications_user_id_tailored_cv_url_key IS
  'Tailored applications: at most one row per (user_id, cv_url). Primary CVs are excluded so library URLs remain shareable.';
