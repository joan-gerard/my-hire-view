-- RLS policies for profile pictures bucket.
-- Create the bucket first (Dashboard: Storage > New bucket > id: profile-pictures, public: true,
-- file size limit: 5MB, allowed MIME: image/jpeg, image/png, image/webp).

-- Authenticated users can upload only to their own folder: path must be {user_id}/...
CREATE POLICY "Users can upload own profile picture"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Public read (bucket is public so anyone can view profile pictures via URL)
CREATE POLICY "Public read profile pictures"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-pictures');

-- Users can delete only their own files (same folder rule)
CREATE POLICY "Users can delete own profile picture"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Allow update (e.g. upsert) for own folder so upload can replace existing file
CREATE POLICY "Users can update own profile picture"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'profile-pictures'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
