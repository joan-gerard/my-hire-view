const BUCKET = "profile-pictures";

/**
 * Extracts the storage object path from a Supabase Storage public URL.
 * Returns null if the URL is not a profile-pictures bucket URL.
 * Example: https://xxx.supabase.co/storage/v1/object/public/profile-pictures/user-id/file.jpg -> user-id/file.jpg
 */
export function getProfilePictureStoragePath(
  url: string | null | undefined,
): string | null {
  if (!url || typeof url !== "string" || !url.startsWith("https://"))
    return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(
      /\/storage\/v1\/object\/public\/profile-pictures\/(.+)$/,
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * True when `url` is a public profile-pictures object under this user's folder
 * (`{userId}/…`). Used to reject arbitrary or other users' URLs on profile PUT.
 */
export function isOwnedProfilePictureUrl(
  url: string,
  userId: string,
): boolean {
  if (!userId) return false;
  const path = getProfilePictureStoragePath(url);
  if (!path) return false;
  const prefix = `${userId}/`;
  return path.startsWith(prefix) && path.length > prefix.length;
}

/**
 * Deletes the object at the given profile picture URL if it is from our Supabase profile-pictures bucket.
 * Logs and swallows errors so callers can continue (e.g. profile update still succeeds).
 */
export async function deleteProfilePictureIfOurs(
  supabase: {
    storage: {
      from: (bucket: string) => {
        remove: (paths: string[]) => Promise<{ error: unknown }>;
      };
    };
  },
  url: string | null | undefined,
): Promise<void> {
  const path = getProfilePictureStoragePath(url);
  if (!path) return;
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error)
      console.error(
        "Failed to delete profile picture from storage:",
        path,
        error,
      );
  } catch (err) {
    console.error("Failed to delete profile picture:", url, err);
  }
}
