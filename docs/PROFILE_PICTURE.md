# Profile pictures

Profile pictures are stored in **Supabase Storage** (not Vercel Blob). One picture per user; it can be included or hidden per application.

## Storage bucket

1. In Supabase Dashboard: **Storage** → **New bucket**.
2. **Name / ID:** `profile-pictures`
3. **Public bucket:** Yes (so the public application view can show the image via URL).
4. **File size limit:** 5 MB (or 5242880 bytes).
5. **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`.

RLS policies for this bucket are in migration `014_storage_profile_pictures_policies.sql`. They allow:

- **INSERT:** Authenticated users can upload only to a path whose first folder is their `auth.uid()` (e.g. `{user_id}/avatar.jpg`).
- **SELECT:** Public read so the view page can load the image.
- **UPDATE / DELETE:** Users can update or delete only files in their own folder.

## Data model

- **profiles:** `profile_picture_url` (Supabase Storage public URL). One picture per user.
- **applications:** `show_profile_picture` (boolean): User’s choice to show their profile picture on this application. Preserved when they remove their profile picture so the choice stays “Yes” when they add a new picture later. `profile_picture_url` (nullable): Copied from the profile when the user has a picture and `show_profile_picture` is true. When the user changes or removes their profile picture, the API updates this for all applications where `show_profile_picture` is true (new URL or null). View page only uses this URL for display; if null, no avatar is shown and the page does not break.

## Behaviour

- **admin/profile:** User can upload, change, or remove profile picture. When the profile picture URL changes, the API updates `applications.profile_picture_url` for all applications where `show_profile_picture` is true, so they show the new image (or no image if removed). The preference `show_profile_picture` is not changed when removing the picture. No preference setting; choice is made per application.
- **admin/new and admin/edit:** One checkbox: "Show profile picture for this application". If the user has no profile picture, the checkbox is **unchecked and disabled** (with a note to upload a picture in Profile). If they have a picture, the checkbox is enabled; default is **checked** for new applications. On edit, the checkbox reflects `application.show_profile_picture` (or, if not set, falls back to whether `profile_picture_url` was set). On save, the server sets `show_profile_picture` from the checkbox and sets `profile_picture_url` from the profile when checked and the user has a picture, otherwise null.
- **view/[slug]:** Renders an avatar only when `application.profile_picture_url` is set (non-null, non-empty). If the user chose to show the picture but has no profile picture (or removed it), the URL is null and no avatar is shown; the page does not break.

## Cleanup

When the user removes or replaces their profile picture in admin/profile, the API should delete the previous object from the `profile-pictures` bucket (derive path from the old URL) to avoid orphan files. Application rows: `profile_picture_url` is set to null (or the new URL) for applications with `show_profile_picture` true; `show_profile_picture` is left unchanged. No Storage delete when clearing `profile_picture_url` on an application.
