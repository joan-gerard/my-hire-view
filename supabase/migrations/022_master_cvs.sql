-- Master CV library (max 5 per user, enforced in API) + per-application CV kind.
-- See docs/CV_REUSE_AND_STORAGE.md

CREATE TABLE IF NOT EXISTS master_cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  label TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS master_cvs_user_id_created_at_idx
  ON master_cvs (user_id, created_at DESC);

COMMENT ON TABLE master_cvs IS
  'Profile-owned CV library (max 5 per user). Applications may reference these without owning the R2 object.';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_kind TEXT NOT NULL DEFAULT 'custom'
    CHECK (cv_kind IN ('master', 'custom'));

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS master_cv_id UUID NULL
    REFERENCES master_cvs (id) ON DELETE SET NULL;

COMMENT ON COLUMN applications.cv_kind IS
  'master = URL from profile library (do not delete R2 on app delete); custom = app-owned upload.';
COMMENT ON COLUMN applications.master_cv_id IS
  'When cv_kind = master, the library row used. Null if master was deleted or URL was set without id.';

-- RLS: users manage only their own master CVs
ALTER TABLE master_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own master_cvs"
  ON master_cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own master_cvs"
  ON master_cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own master_cvs"
  ON master_cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own master_cvs"
  ON master_cvs FOR DELETE
  USING (auth.uid() = user_id);
