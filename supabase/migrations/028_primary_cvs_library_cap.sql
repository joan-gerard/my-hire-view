-- F13-032: Atomic primary CV library cap (concurrency-safe).
--
-- API count-then-insert can race under concurrent POSTs and exceed the max.
-- Enforce at insert time with a transaction-scoped advisory lock + count.
--
-- Cap value lives in primary_cv_library_max_for_user() — not hard-coded in the
-- trigger — so Premium (planned max 15) can raise the limit without rewriting
-- the lock/count logic. Today everyone gets Free/Pro default (5).

CREATE OR REPLACE FUNCTION primary_cv_library_max_for_user(p_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  -- Single DB source for the per-user primary library max.
  -- Today: Free/Pro default (5). When membership gating ships (E2), replace the
  -- body with a plan-aware lookup (e.g. profiles / subscriptions → 5 or 15)
  -- without changing enforce_primary_cv_library_cap().
  SELECT 5;
$$;

COMMENT ON FUNCTION primary_cv_library_max_for_user(uuid) IS
  'F13-032: Returns the max primary_cvs rows allowed for a user. Default 5 (Free/Pro); raise via this function when Premium gating ships.';

CREATE OR REPLACE FUNCTION enforce_primary_cv_library_cap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_count integer;
  max_allowed integer;
BEGIN
  -- Serialize concurrent inserts for the same user within this transaction.
  -- Namespace 81345001 keeps this lock class distinct from other advisory locks.
  PERFORM pg_advisory_xact_lock(81345001, hashtext(NEW.user_id::text));

  max_allowed := primary_cv_library_max_for_user(NEW.user_id);

  SELECT COUNT(*)::integer
  INTO current_count
  FROM primary_cvs
  WHERE user_id = NEW.user_id;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION
      'primary_cvs_library_cap_exceeded:user=%:max=%',
      NEW.user_id,
      max_allowed
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION enforce_primary_cv_library_cap() IS
  'F13-032: Reject primary_cvs inserts that would exceed primary_cv_library_max_for_user (advisory lock + count).';

DROP TRIGGER IF EXISTS primary_cvs_library_cap ON primary_cvs;

CREATE TRIGGER primary_cvs_library_cap
  BEFORE INSERT
  ON primary_cvs
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_cv_library_cap();

COMMENT ON TABLE primary_cvs IS
  'Profile-owned CV library. Max per user from primary_cv_library_max_for_user() (default 5); enforced by trigger primary_cvs_library_cap (F13-032). Applications may reference these without owning the R2 object.';
