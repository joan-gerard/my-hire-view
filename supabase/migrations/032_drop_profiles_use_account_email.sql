-- Product change after 031: contact email is a single editable profile field
-- (prefilled from the Auth account email), so the use_account_email toggle is unused.
ALTER TABLE profiles
  DROP COLUMN IF EXISTS use_account_email;
