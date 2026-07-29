const BUCKET = "profile-pictures";

/** Canonical object basename (extension varies by MIME). */
export const PROFILE_PICTURE_BASENAME = "avatar";

const AVATAR_EXT_RE = /^(jpe?g|png|webp)$/i;

/**
 * Extracts the storage object path from a Supabase Storage public URL.
 * Returns null if the URL is not a profile-pictures bucket URL.
 * Example: …/profile-pictures/user-id/avatar.jpg -> user-id/avatar.jpg
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

/** `{userId}/avatar.{ext}` — one logical picture per user. */
export function canonicalProfilePicturePath(
  userId: string,
  ext: string,
): string {
  const normalized = ext.toLowerCase() === "jpeg" ? "jpg" : ext.toLowerCase();
  return `${userId}/${PROFILE_PICTURE_BASENAME}.${normalized}`;
}

/**
 * True when `url` is a public profile-pictures object under this user's folder
 * (`{userId}/…`). Accepts canonical `avatar.*` and legacy UUID filenames.
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

/** True when path is `{userId}/avatar.{jpg|png|webp}`. */
export function isCanonicalProfilePicturePath(
  path: string,
  userId: string,
): boolean {
  const prefix = `${userId}/${PROFILE_PICTURE_BASENAME}.`;
  if (!path.startsWith(prefix)) return false;
  const ext = path.slice(prefix.length);
  return AVATAR_EXT_RE.test(ext);
}

type StorageBucket = {
  remove: (paths: string[]) => Promise<{ error: unknown }>;
  list: (
    path?: string,
  ) => Promise<{ data: { name: string }[] | null; error: unknown }>;
};

/**
 * Deletes every object in the user's folder except `keepPath` (full object path).
 * Used after canonical upload so only one avatar file remains.
 */
export async function removeOtherProfilePicturesInFolder(
  supabase: { storage: { from: (bucket: string) => StorageBucket } },
  userId: string,
  keepPath: string,
): Promise<{ ok: boolean }> {
  try {
    const { data, error } = await supabase.storage.from(BUCKET).list(userId);
    if (error) {
      console.error("Failed to list profile pictures:", userId, error);
      return { ok: false };
    }
    const toRemove = (data ?? [])
      .map((f) => `${userId}/${f.name}`)
      .filter((p) => p !== keepPath);
    if (toRemove.length === 0) return { ok: true };
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove(toRemove);
    if (removeError) {
      console.error(
        "Failed to remove extra profile pictures:",
        toRemove,
        removeError,
      );
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to purge profile picture folder:", userId, err);
    return { ok: false };
  }
}

/**
 * Deletes the object at the given profile picture URL if it is from our
 * profile-pictures bucket. Returns whether delete succeeded (or was a no-op).
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
): Promise<{ ok: boolean }> {
  const path = getProfilePictureStoragePath(url);
  if (!path) return { ok: true };
  try {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      console.error(
        "Failed to delete profile picture from storage:",
        path,
        error,
      );
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.error("Failed to delete profile picture:", url, err);
    return { ok: false };
  }
}

export { BUCKET as PROFILE_PICTURES_BUCKET };
