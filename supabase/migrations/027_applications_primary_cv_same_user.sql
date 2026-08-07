-- B3-042: applications.primary_cv_id must belong to the same user as the row.
--
-- The existing FK only checks that primary_cv_id exists in primary_cvs(id)
-- (ON DELETE SET NULL). A composite FK (primary_cv_id, user_id) → (id, user_id)
-- cannot use ON DELETE SET NULL safely: Postgres would null *both* FK columns,
-- including applications.user_id.
--
-- Keep the id-only FK; enforce same-user ownership with:
--   1) BEFORE trigger on applications (insert/update of primary_cv_id / user_id)
--   2) BEFORE trigger on primary_cvs making user_id immutable (parent-side hole:
--      reassigning ownership would silently break the child invariant)
-- API still checks ownership; this is the DB backstop.

-- Defensive: quarantine cross-user primary links before enforcing (should be none).
-- Public pages serve applications.cv_url (not primary_cv_id), so clearing only the
-- FK would leave an active app still exposing another user's PDF. Quarantine:
-- null the FK, hide from public (draft), and replace cv_url (column is NOT NULL).
-- Also catches rows whose cv_url matches another user's primary_cvs.url (e.g. after
-- an earlier FK-only cleanup left the stolen URL in place).
UPDATE applications AS a
SET
  primary_cv_id = NULL,
  status = 'draft',
  archived_at = NULL,
  cv_url = 'https://invalid.local/quarantined-cross-user-cv',
  updated_at = now()
WHERE
  (
    a.primary_cv_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM primary_cvs AS pc
      WHERE pc.id = a.primary_cv_id
        AND pc.user_id = a.user_id
    )
  )
  OR EXISTS (
    SELECT 1
    FROM primary_cvs AS pc
    WHERE pc.url = a.cv_url
      AND pc.user_id <> a.user_id
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

-- Parent-side: primary_cvs.user_id must never change (no ownership transfer).
-- Without this, a privileged UPDATE of primary_cvs.user_id could leave
-- applications pointing at a CV owned by another user until a later app write.

CREATE OR REPLACE FUNCTION enforce_primary_cv_user_id_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION
      'primary_cvs.user_id is immutable (id %)',
      OLD.id
      USING ERRCODE = '23514'; -- check_violation
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION enforce_primary_cv_user_id_immutable() IS
  'B3-042: Reject any change to primary_cvs.user_id. Complements applications_primary_cv_same_user; ownership never transfers.';

DROP TRIGGER IF EXISTS primary_cvs_user_id_immutable ON primary_cvs;

CREATE TRIGGER primary_cvs_user_id_immutable
  BEFORE UPDATE OF user_id
  ON primary_cvs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_cv_user_id_immutable();
