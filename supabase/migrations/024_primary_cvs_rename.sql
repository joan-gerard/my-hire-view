-- Rename master CV library → primary CVs; cv_kind → cv_type (primary | tailored).
-- See docs/PDF_AND_R2.md

-- 1) Table + index
ALTER TABLE master_cvs RENAME TO primary_cvs;

ALTER INDEX IF EXISTS master_cvs_user_id_created_at_idx
  RENAME TO primary_cvs_user_id_created_at_idx;

COMMENT ON TABLE primary_cvs IS
  'Profile-owned CV library (max 5 per user). Applications may reference these without owning the R2 object.';

-- 2) RLS policies (recreate with new names)
DROP POLICY IF EXISTS "Users can select own master_cvs" ON primary_cvs;
DROP POLICY IF EXISTS "Users can insert own master_cvs" ON primary_cvs;
DROP POLICY IF EXISTS "Users can update own master_cvs" ON primary_cvs;
DROP POLICY IF EXISTS "Users can delete own master_cvs" ON primary_cvs;

CREATE POLICY "Users can select own primary_cvs"
  ON primary_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own primary_cvs"
  ON primary_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own primary_cvs"
  ON primary_cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own primary_cvs"
  ON primary_cvs FOR DELETE
  USING (auth.uid() = user_id);

-- 3) applications.cv_kind → cv_type with new values
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_cv_kind_check;

ALTER TABLE applications RENAME COLUMN cv_kind TO cv_type;

UPDATE applications SET cv_type = 'primary' WHERE cv_type = 'master';
UPDATE applications SET cv_type = 'tailored' WHERE cv_type = 'custom';

ALTER TABLE applications
  ALTER COLUMN cv_type SET DEFAULT 'tailored';

ALTER TABLE applications
  ADD CONSTRAINT applications_cv_type_check
  CHECK (cv_type IN ('primary', 'tailored'));

COMMENT ON COLUMN applications.cv_type IS
  'primary = URL from profile library (do not delete R2 on app delete); tailored = app-owned upload.';

-- 4) master_cv_id → primary_cv_id (FK to primary_cvs follows table rename)
ALTER TABLE applications RENAME COLUMN master_cv_id TO primary_cv_id;

COMMENT ON COLUMN applications.primary_cv_id IS
  'When cv_type = primary, the library row used. Null if primary was deleted or URL was set without id.';
