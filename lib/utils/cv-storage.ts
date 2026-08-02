import {
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";

/**
 * Returns the object key for our CV bucket if `url` is under our public R2 base URL.
 */
function getCvObjectKeyFromPublicUrl(
  url: string | null | undefined,
): string | null {
  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    return null;
  }
  let base: string;
  try {
    base = getR2PublicBaseUrl();
  } catch {
    return null;
  }
  if (!url.startsWith(`${base}/`)) return null;
  const encodedKey = url.slice(base.length + 1);
  if (!encodedKey) return null;
  try {
    const key = decodeURIComponent(encodedKey);
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

/**
 * True when the R2 object key is under this user's custom or master CV prefix:
 * - `cvs/{userId}/…` (custom / idempotent uploads)
 * - `cvs/masters/{userId}/…` (master library)
 */
export function isOwnedCvObjectKey(
  key: string | null | undefined,
  userId: string,
): boolean {
  if (!key || !userId || userId.includes("/")) return false;
  const customPrefix = `cvs/${userId}/`;
  const masterPrefix = `cvs/masters/${userId}/`;
  return (
    (key.startsWith(customPrefix) && key.length > customPrefix.length) ||
    (key.startsWith(masterPrefix) && key.length > masterPrefix.length)
  );
}

/**
 * True when `url` is under our R2 public base and the object key belongs to `userId`.
 */
export function isOwnedCvUrl(
  url: string | null | undefined,
  userId: string,
): boolean {
  return isOwnedCvObjectKey(getCvObjectKeyFromPublicUrl(url), userId);
}

/**
 * Returns true if the URL is served from our R2 public base (safe host check only).
 * Prefer {@link isOwnedCvUrl} before mutating (delete) or attaching a CV URL.
 */
export function isCvStorageUrl(url: string | null | undefined): boolean {
  return getCvObjectKeyFromPublicUrl(url) !== null;
}

/**
 * Deletes the CV object at the given URL only when it is under our R2 public base
 * **and** the object key belongs to `userId`.
 * Logs and swallows errors so callers can continue (e.g. DB delete still succeeds).
 */
export async function deleteCvIfOurs(
  url: string | null | undefined,
  userId: string,
): Promise<void> {
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!isOwnedCvObjectKey(key, userId) || !key) return;
  try {
    const client = getR2S3Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }),
    );
  } catch (err) {
    console.error("Failed to delete CV object from R2:", url, err);
  }
}

/**
 * Deletes an application CV from R2 only when it is app-owned (`custom`)
 * and the object belongs to `userId`.
 * Master library CVs stay in R2 until removed from the profile.
 */
export async function deleteApplicationCvIfCustom(
  url: string | null | undefined,
  cvKind: "master" | "custom" | null | undefined,
  userId: string,
): Promise<void> {
  if (cvKind === "master") return;
  await deleteCvIfOurs(url, userId);
}

/**
 * Returns true if the URL is ours and HeadObject succeeds.
 * Returns false for non-storage URLs or missing objects.
 */
export async function checkCvObjectExists(
  url: string | null | undefined,
): Promise<boolean> {
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!key) return false;
  try {
    const client = getR2S3Client();
    await client.send(
      new HeadObjectCommand({ Bucket: getR2Bucket(), Key: key }),
    );
    return true;
  } catch {
    return false;
  }
}
