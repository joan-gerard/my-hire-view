/**
 * Client-side CV upload idempotency key policy (F8-063).
 *
 * Reuse the same key across retries (network / 5xx) for the same selected file.
 * Mint a new key only when the file identity changes (or there is no key yet).
 * Identity is content-based (SHA-256), not name/size/lastModified alone.
 */

/** Hex SHA-256 of file bytes (Web Crypto — browser + Node test env). */
export async function getFileContentDigest(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Stable identity for a browser File selection.
 * Uses content digest so copied PDFs with identical name/size/mtime do not
 * collide with a different file’s upload cache / idempotency key.
 */
export async function getFileSignature(file: File): Promise<string> {
  const digest = await getFileContentDigest(file);
  return `${file.size}:${digest}`;
}

/**
 * Returns the key to send on the next upload attempt.
 * When `fileChanged` is true, always mints a new UUID (caller must treat the
 * previous upload cache as invalid).
 */
export function resolveCvUploadIdempotencyKey(
  currentKey: string | null,
  fileChanged: boolean,
  createKey: () => string = () => crypto.randomUUID(),
): string {
  if (fileChanged || !currentKey) {
    return createKey();
  }
  return currentKey;
}
