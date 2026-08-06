-- B3-042: applications.primary_cv_id must belong to the same user as the row.
--
-- The existing FK only checks that primary_cv_id exists in primary_cvs(id)
-- (ON DELETE SET NULL). A composite FK (primary_cv_id, user_id) → (id, user_id)
-- cannot use ON DELETE SET NULL safely: Postgres would null *both* FK columns,
-- including applications.user_id.
--
-- Keep the id-only FK; enforce same-user ownership with a BEFORE trigger.
-- API still checks ownership; this is the DB backstop.

-- Defensive: clear any cross-user links before enforcing (should be none).
UPDATE applications AS a
SET primary_cv_id = NULL
WHERE a.primary_cv_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM primary_cvs AS pc
    WHERE pc.id = a.primary_cv_id
      AND pc.user_id = a.user_id
  );

CREATE OR REPLACE FUNCTION enforce_application_primary_cv_same_user()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.primary_cv_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM primary_cvs AS pc
    WHERE pc.id = NEW.primary_cv_id
      AND pc.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION
      'primary_cv_id % does not belong to application user %',
      NEW.primary_cv_id,
      NEW.user_id
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION enforce_application_primary_cv_same_user() IS
  'B3-042: Reject application inserts/updates where primary_cv_id is not owned by the same user_id. Complements the id-only FK (ON DELETE SET NULL).';

DROP TRIGGER IF EXISTS applications_primary_cv_same_user ON applications;

CREATE TRIGGER applications_primary_cv_same_user
  BEFORE INSERT OR UPDATE OF primary_cv_id, user_id
  ON applications
  FOR EACH ROW
  EXECUTE FUNCTION enforce_application_primary_cv_same_user();
