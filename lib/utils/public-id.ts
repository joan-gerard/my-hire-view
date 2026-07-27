import { randomBytes } from "crypto";

/** URL-safe lowercase alphanumeric characters for opaque public ids. */
const PUBLIC_ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Default length for new public ids (e.g. k7x2m9ab). */
export const PUBLIC_ID_LENGTH = 8;

const PUBLIC_ID_PATTERN = /^[a-z0-9]{6,12}$/;

/**
 * Generates a cryptographically random opaque public id.
 * Not derived from user name or email.
 */
export function generatePublicId(
  length: number = PUBLIC_ID_LENGTH,
): string {
  const bytes = randomBytes(length);
  let id = "";
  for (let i = 0; i < length; i++) {
    id += PUBLIC_ID_ALPHABET[bytes[i]! % PUBLIC_ID_ALPHABET.length];
  }
  return id;
}

/** Validates format for route params and stored public ids. */
export function isValidPublicId(value: string): boolean {
  return PUBLIC_ID_PATTERN.test(value);
}
