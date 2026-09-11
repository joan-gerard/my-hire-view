import { createHash } from "crypto";

/** User-defined R2/S3 metadata key for the CV body SHA-256 (hex). */
export const CV_CONTENT_SHA256_METADATA_KEY = "sha256";

export function sha256Hex(body: Uint8Array | Buffer): string {
  return createHash("sha256").update(body).digest("hex");
}

function normalizeContentType(value: string | undefined): string {
  return (value ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
}

function storedContentSha256(
  metadata: Record<string, string> | undefined,
): string | undefined {
  if (!metadata) return undefined;
  const direct = metadata[CV_CONTENT_SHA256_METADATA_KEY];
  if (direct?.trim()) return direct.trim().toLowerCase();
  // S3 lowercases keys; stay defensive if a client/SDK differs.
  for (const [key, value] of Object.entries(metadata)) {
    if (key.toLowerCase() === CV_CONTENT_SHA256_METADATA_KEY && value?.trim()) {
      return value.trim().toLowerCase();
    }
  }
  return undefined;
}

/**
 * True when an existing R2 object matches this request's size, PDF content type,
 * and SHA-256 content digest (stored in object metadata on PutObject).
 *
 * Objects without a stored digest are treated as a mismatch so size/MIME-only
 * replay cannot accept a different or non-PDF body under the same key.
 */
export function existingObjectMatchesUpload(
  head: {
    ContentLength?: number;
    ContentType?: string;
    Metadata?: Record<string, string>;
  },
  file: { size: number; type: string },
  contentSha256: string,
  expectedContentType = "application/pdf",
): boolean {
  if (head.ContentLength == null || head.ContentLength !== file.size) {
    return false;
  }
  const existingType = normalizeContentType(head.ContentType);
  const requestType = normalizeContentType(file.type || expectedContentType);
  if (
    existingType !== expectedContentType ||
    requestType !== expectedContentType
  ) {
    return false;
  }
  const stored = storedContentSha256(head.Metadata);
  if (!stored) {
    return false;
  }
  return stored === contentSha256.toLowerCase();
}
