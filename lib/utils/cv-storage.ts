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

function stripTrailingSlash(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * Decode a single path segment and reject traversal / empty segments.
 * Returns null when the segment is unsafe or not decodable.
 */
function decodePathSegment(raw: string): string | null {
  if (raw === "") return null;
  let segment: string;
  try {
    segment = decodeURIComponent(raw);
  } catch {
    return null;
  }
  if (segment === "." || segment === "..") return null;
  if (segment.includes("\0")) return null;
  return segment;
}

/**
 * Returns the object key for our CV bucket if `url` is under our public R2 base URL.
 *
 * - Uses the URL pathname only (search and hash are ignored).
 * - Decodes percent-encoded path segments so equivalent URLs map to the same key.
 * - Rejects empty segments and `.` / `..` so prefix allow-lists cannot be bypassed
 *   via path traversal that browsers/CDNs may normalize on fetch.
 */
export function getCvObjectKeyFromPublicUrl(
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

  let parsed: URL;
  let baseParsed: URL;
  try {
    parsed = new URL(url);
    baseParsed = new URL(base);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== baseParsed.protocol ||
    parsed.host !== baseParsed.host
  ) {
    return null;
  }

  const basePath = stripTrailingSlash(baseParsed.pathname);
  const urlPath = parsed.pathname;

  let relative: string;
  if (basePath === "" || basePath === "/") {
    relative = urlPath.replace(/^\//, "");
  } else if (urlPath === basePath) {
    return null;
  } else if (urlPath.startsWith(`${basePath}/`)) {
    relative = urlPath.slice(basePath.length + 1);
  } else {
    return null;
  }

  if (!relative) return null;

  const segments: string[] = [];
  for (const raw of relative.split("/")) {
    const segment = decodePathSegment(raw);
    if (segment === null) return null;
    // `%2F` in a segment becomes `/` after decode — treat as path separators so
    // the object key matches how public URLs and S3 keys nest.
    for (const part of segment.split("/")) {
      if (part === "" || part === "." || part === "..") return null;
      segments.push(part);
    }
  }

  return segments.length > 0 ? segments.join("/") : null;
}

/**
 * Rebuilds a public CV URL from the decoded object key so equivalent encodings,
 * query strings, and fragments store as one canonical string.
 * Each path segment is percent-encoded so reserved characters (`?`, `#`, `%`, …)
 * remain part of the object key rather than changing URL structure.
 * Returns null when the URL is not under our R2 public base.
 */
export function toCanonicalCvPublicUrl(
  url: string | null | undefined,
): string | null {
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!key) return null;
  const encodedPath = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${getR2PublicBaseUrl()}/${encodedPath}`;
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

async function deleteObjectKey(
  key: string,
  urlForLog: string | null | undefined,
  options?: { onError?: DeleteCvErrorMode },
): Promise<void> {
  const onError = options?.onError ?? "throw";
  try {
    const client = getR2S3Client();
    await client.send(
      new DeleteObjectCommand({ Bucket: getR2Bucket(), Key: key }),
    );
  } catch (err) {
    console.error("Failed to delete CV object from R2:", urlForLog, err);
    if (onError === "throw") throw err;
  }
}

/**
 * Deletes the CV object at the given URL only when it is under our R2 public base
 * **and** the object key belongs to `userId`.
 * By default, R2 errors are logged and rethrown (fail closed). Pass
 * `{ onError: "log" }` only when the caller intentionally continues (e.g. PUT
 * after a successful row update).
 *
 * When `url` is non-empty and `R2_PUBLIC_BASE_URL` is unset, throws (fail closed)
 * instead of no-opping.
 */
export async function deleteCvIfOurs(
  url: string | null | undefined,
  userId: string,
  options?: { onError?: DeleteCvErrorMode },
): Promise<void> {
  if (!url) return;
  // Fail closed: missing base must not skip cleanup while callers delete DB rows.
  getR2PublicBaseUrl();
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!isOwnedCvObjectKey(key, userId) || !key) return;
  await deleteObjectKey(key, url, options);
}

/**
 * Deletes an application CV from R2 only when it is explicitly `cv_type = tailored`
 * **and** the object key is under `cvs/{userId}/tailored/…`.
 * Primary library CVs stay in R2 until removed from the profile.
 *
 * When `cv_type` is tailored and `url` is non-empty, missing `R2_PUBLIC_BASE_URL`
 * throws (fail closed) so callers do not delete the applications row and leave
 * an orphan PDF.
 */
export async function deleteApplicationCvIfTailored(
  url: string | null | undefined,
  cvType: ApplicationCvType | null | undefined,
  userId: string,
  options?: { onError?: DeleteCvErrorMode },
): Promise<void> {
  if (cvType !== "tailored") return;
  if (!url) return;
  // Fail closed: missing base must not skip cleanup while callers delete DB rows.
  getR2PublicBaseUrl();
  const key = getCvObjectKeyFromPublicUrl(url);
  if (!key || !isOwnedTailoredCvObjectKey(key, userId)) return;
  await deleteObjectKey(key, url, options);
}

/**
 * R2 HeadObject check for a CV public URL.
 * - `true` — URL is under our R2 public base and the object exists
 * - `false` — URL is under our R2 public base but the object is missing (NotFound)
 * - `undefined` — URL is outside our R2 public base, or HeadObject failed for
 *   infrastructure reasons; existence is unknown
 *
 * Callers should treat `undefined` as “unchecked”: omit `cv_exists` from
 * detail/public payloads, or default list badges to present (not missing).
 */
function isHeadObjectNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as {
    name?: string;
    $metadata?: { httpStatusCode?: number };
  };
  return e.name === "NotFound" || e.$metadata?.httpStatusCode === 404;
}

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
  } catch (error) {
    if (isHeadObjectNotFound(error)) {
      return false;
    }
    return undefined;
  }
}
