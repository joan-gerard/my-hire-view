# Profile pictures

Profile pictures are stored in **Supabase Storage** (CV PDFs use Cloudflare R2). **One picture per user** at a canonical path; it can be shown or hidden per application via a preference flag.

## Storage bucket

1. In Supabase Dashboard: **Storage** → **New bucket**.
2. **Name / ID:** `profile-pictures`
3. **Public bucket:** Yes (so the public application view can show the image via URL).
4. **File size limit:** 5 MB (or 5242880 bytes).
5. **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`.

RLS policies for this bucket are in migration `014_storage_profile_pictures_policies.sql`. They allow:

- **INSERT / UPDATE / DELETE:** Authenticated users only under their `auth.uid()` folder.
- **SELECT:** Public read so the view page can load the image.

### Canonical object path

Uploads write `{user_id}/avatar.{jpg|png|webp}` with `upsert: true`, then remove any other objects in that folder so only one file remains.

## Data model

- **profiles:** `profile_picture_url` (Supabase Storage public URL). Source of truth for the avatar.
- **applications:** `show_profile_picture` (boolean) only — whether this application should show the live profile picture. There is **no** `applications.profile_picture_url` column (dropped in migration `023`).

Public and enriched reads set a display-only `profile_picture_url` on the application payload when `show_profile_picture` is true, taken from `profiles.profile_picture_url`.

## Behaviour

- **admin/profile (upload-on-save):** Choosing a file shows a local preview only. On **Save profile**, the client uploads to the canonical path, then `PUT /api/profile` with the new URL (or `null` to remove). After a successful profile write, the previous Storage object is deleted when the URL changed. Side-effect failures (Storage delete, Auth metadata sync) are returned as `warnings` while still returning **200** + `data`.
- **admin/new and admin/edit:** “Show profile picture for this application” Yes/No (enabled when the live profile has a picture). Users can **Add / Change picture** via a shared `ProfilePictureModal` (upload-on-save → `PUT` picture URL only — works because names already exist from signup). Server stores only `show_profile_picture` on the application.
- **view/[publicId]/[slug]:** Resolves the application and, when `show_profile_picture` is true, attaches the current `profiles.profile_picture_url` for the avatar. Changing the profile picture updates all such applications immediately (no fan-out sync).

### Display cache-busting

Canonical uploads overwrite the same Storage path, so the public URL string often does not change. UI and public views render with `cacheBustProfilePictureUrl(url, profiles.updated_at)` (query `?v=…`) so browsers fetch the new bytes. The value stored in `profiles.profile_picture_url` stays the clean Storage URL (no query string).

## Ownership on profile PUT

Non-null `profile_picture_url` must be a `profile-pictures` public URL under the caller’s `{user_id}/…` folder (canonical `avatar.*` or legacy UUID filenames).

## Cleanup

Replacing or clearing the picture deletes the previous Storage object after a successful profile upsert. Upload also purges non-canonical leftovers in the user’s folder.
