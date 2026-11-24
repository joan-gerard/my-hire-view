-- F40: allow draft applications without a CV yet.
-- Empty-string cv_url collides on applications_user_id_tailored_cv_url_key
-- for multiple tailored drafts; NULL does not (Postgres UNIQUE allows many NULLs).

ALTER TABLE applications
  ALTER COLUMN cv_url DROP NOT NULL;

COMMENT ON COLUMN applications.cv_url IS
  'Public CV URL. NULL while a draft has no résumé yet; required before publish.';
