const MIN_LEN = 8;
const MAX_LEN = 128;

/**
 * Normalizes an idempotency key for safe use in object paths.
 * Accepts typical UUIDs and opaque strings of alphanumerics, hyphens, underscores.
 */
export function normalizeUploadIdempotencyKey(
  raw: string | null | undefined,
): { ok: true; key: string } | { ok: false; error: string } {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, error: "Idempotency-Key is required" };
  }
  const trimmed = raw.trim();
  if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) {
    return {
      ok: false,
      error: `Idempotency-Key must be between ${MIN_LEN} and ${MAX_LEN} characters`,
    };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      ok: false,
      error:
        "Idempotency-Key may only contain letters, digits, hyphens, and underscores",
    };
  }
  return { ok: true, key: trimmed };
}
