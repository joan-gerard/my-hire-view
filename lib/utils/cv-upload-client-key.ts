/**
 * Client-side CV upload idempotency key policy (F8-063).
 *
 * Reuse the same key across retries (network / 5xx) for the same selected file.
 * Mint a new key only when the file identity changes (or there is no key yet).
 */

/** Stable identity for a browser File selection. */
export function getFileSignature(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
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
