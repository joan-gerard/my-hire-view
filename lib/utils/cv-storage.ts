import {
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import {
  getR2Bucket,
  getR2PublicBaseUrl,
  getR2S3Client,
} from "@/lib/storage/r2-client";
import type { ApplicationCvType } from "@/lib/types/application";

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

function keyHasPrefix(key: string, prefix: string): boolean {
  return key.startsWith(prefix) && key.length > prefix.length;
}

/**
 * True when the R2 object key is a tailored (per-application) upload for `userId`:
 * `cvs/{userId}/tailored/…`
 */
export function isOwnedTailoredCvObjectKey(
  key: string | null | undefined,
  userId: string,
): boolean {
  if (!key || !userId || userId.includes("/")) return false;
  return keyHasPrefix(key, `cvs/${userId}/tailored/`);
}

/**
 * True when the R2 object key is a primary (library) CV for `userId`:
 * `cvs/{userId}/primary/…`
 */
export function isOwnedPrimaryCvObjectKey(
  key: string | null | undefined,
  userId: string,
): boolean {
  if (!key || !userId || userId.includes("/")) return false;
  return keyHasPrefix(key, `cvs/${userId}/primary/`);
}

/**
 * True when the R2 object key is under this user's primary or tailored CV prefixes.
 */
export function isOwnedCvObjectKey(
  key: string | null | undefined,
  userId: string,
): boolean {
  return (
    isOwnedTailoredCvObjectKey(key, userId) ||
    isOwnedPrimaryCvObjectKey(key, userId)
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
 * True when `url` is a tailored (per-application) upload owned by `userId`.
 * Primary library URLs return false — attach those via `cv_type: "primary"`.
 */
export function isOwnedTailoredCvUrl(
  url: string | null | undefined,
  userId: string,
): boolean {
  return isOwnedTailoredCvObjectKey(getCvObjectKeyFromPublicUrl(url), userId);
}

/**
 * Returns true if the URL is served from our R2 public base (safe host check only).
 * Prefer {@link isOwnedCvUrl} before mutating (delete) or attaching a CV URL.
 */
export function isCvStorageUrl(url: string | null | undefined): boolean {
  return getCvObjectKeyFromPublicUrl(url) !== null;
}

/**
 * How to handle R2 DeleteObject failures.
 * - `throw` (default): fail closed — caller should not continue with DB deletes.
 * - `log`: best-effort — log and continue (e.g. after a successful DB update when
 *   removing a replaced tailored object).
 */
export type DeleteCvErrorMode = "throw" | "log";

/**
 * Deletes the CV object at the given URL only when it is under our R2 public base
 * **and** the object key belongs to `userId`.
 * By default, R2 errors are logged and rethrown (fail closed). Pass
 * `{ onError: "log" }` only when the caller intentionally continues (e.g. PUT
 * after a successful row update).
 */
export async function deleteCvIfOurs(
  url: string | null | undefined,
  userId: string,
  options?: { onError?: DeleteCvErrorMode },
): Promise<void> {
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!isOwnedCvObjectKey(key, userId) || !key) return;
  const onError = options?.onError ?? "throw";
  try {
    const client = getR2S3Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }),
    );
  } catch (err) {
    console.error("Failed to delete CV object from R2:", url, err);
    if (onError === "throw") throw err;
  }
}

/**
 * Deletes an application CV from R2 only when it is app-owned (`tailored`)
 * and the object belongs to `userId`.
 * Primary library CVs stay in R2 until removed from the profile.
 */
export async function deleteApplicationCvIfTailored(
  url: string | null | undefined,
  cvType: ApplicationCvType | null | undefined,
  userId: string,
  options?: { onError?: DeleteCvErrorMode },
): Promise<void> {
  if (cvType === "primary") return;
  await deleteCvIfOurs(url, userId, options);
}

/**
 * R2 HeadObject check for a CV public URL.
 * - `true` — URL is under our R2 public base and the object exists
 * - `false` — URL is under our R2 public base but the object is missing
 * - `undefined` — URL is outside our R2 public base; existence is unknown
 *
 * Callers should treat `undefined` as “unchecked”: omit `cv_exists` from
 * detail/public payloads, or default list badges to present (not missing).
 */
export async function checkCvObjectExists(
  url: string | null | undefined,
): Promise<boolean | undefined> {
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!key) return undefined;
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
