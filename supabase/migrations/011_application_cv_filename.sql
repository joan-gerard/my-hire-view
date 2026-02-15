-- Store original CV filename and preference for download name
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cv_filename TEXT,
  ADD COLUMN IF NOT EXISTS use_original_cv_filename BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN applications.cv_filename IS 'Original filename of the uploaded CV (e.g. My Resume.pdf). Used for download when use_original_cv_filename is true.';
COMMENT ON COLUMN applications.use_original_cv_filename IS 'When true, public download uses cv_filename; when false, uses generated name CV-{Slug}.pdf.';
