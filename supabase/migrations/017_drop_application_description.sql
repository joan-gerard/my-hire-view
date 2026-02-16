-- Drop the description column from applications (no longer used by candidates)
ALTER TABLE applications DROP COLUMN IF EXISTS description;
