-- Replace is_active boolean with status enum + archived_at for retention clock.
-- See docs/CV_REUSE_AND_STORAGE.md

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'draft', 'archived'));

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Backfill from legacy is_active
UPDATE applications
SET
  status = CASE WHEN is_active = false THEN 'archived' ELSE 'active' END,
  archived_at = CASE
    WHEN is_active = false THEN COALESCE(updated_at, created_at, now())
    ELSE NULL
  END;

ALTER TABLE applications DROP COLUMN IF EXISTS is_active;

COMMENT ON COLUMN applications.status IS
  'active = live share link; draft = unpublished (preview flow); archived = soft-hidden on public view.';
COMMENT ON COLUMN applications.archived_at IS
  'Set when status becomes archived; cleared on restore. Re-archiving resets the 90-day retention clock.';

CREATE INDEX IF NOT EXISTS applications_user_id_status_idx
  ON applications (user_id, status);
