/**
 * Resolve the recruiter-facing email from profile contact_email + Auth account email.
 * Applications snapshot this string (or null when hidden / unavailable).
 */

export type ProfileContactEmailSource = {
  contact_email?: string | null;
};

/**
 * Effective contact email for applications / About you display.
 * Prefers the saved profile `contact_email`; falls back to the Auth account email.
 */
export function resolveApplicationContactEmail(
  profile: ProfileContactEmailSource | null | undefined,
  accountEmail: string | null | undefined,
): string | null {
  const contact = profile?.contact_email?.trim() ?? "";
  if (contact) return contact;
  const account = accountEmail?.trim() ?? "";
  return account || null;
}

/** True when a non-empty string is present. */
export function hasContactValue(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}
