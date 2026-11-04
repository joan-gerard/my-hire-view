/**
 * Soft checks so portfolio and LinkedIn fields get the right kind of URL.
 * Warnings do not block save; they only guide the candidate.
 */

export const PORTFOLIO_LOOKS_LIKE_LINKEDIN_WARNING =
  "This looks like a LinkedIn URL. Put it in the LinkedIn field instead.";

export const LINKEDIN_DOES_NOT_LOOK_LIKE_LINKEDIN_WARNING =
  "This does not look like a LinkedIn URL. Check that it is your LinkedIn profile link.";

export const PROFILE_URL_FORMAT_WARNING =
  "Enter a valid URL starting with https:// or http://";

/** True when the value's host is LinkedIn (or the lnkd.in shortener). */
export function looksLikeLinkedInUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const host = new URL(withProtocol).hostname.toLowerCase();
    return (
      host === "linkedin.com" ||
      host.endsWith(".linkedin.com") ||
      host === "lnkd.in" ||
      host.endsWith(".lnkd.in")
    );
  } catch {
    return /(?:^|\/\/|\.)linkedin\.com(?:[/:?]|$)|(?:^|\/\/|\.)lnkd\.in(?:[/:?]|$)/i.test(
      trimmed,
    );
  }
}

/** Enough shape to judge (avoids warning on a few early keystrokes). */
export function hasUrlShapeForLinkWarning(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (looksLikeLinkedInUrl(trimmed)) return true;
  return /:\/\//.test(trimmed) || trimmed.includes(".");
}

/**
 * Soft format check matching profile save rules (http/https URL as typed).
 * Shown under the field instead of the browser’s native `type="url"` bubble.
 */
export function profileHttpUrlFormatWarning(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!hasUrlShapeForLinkWarning(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return PROFILE_URL_FORMAT_WARNING;
    }
    return null;
  } catch {
    return PROFILE_URL_FORMAT_WARNING;
  }
}

/** Portfolio field: LinkedIn mix-up first, then URL format. */
export function portfolioUrlFieldWarning(value: string): string | null {
  if (!hasUrlShapeForLinkWarning(value)) return null;
  if (looksLikeLinkedInUrl(value)) {
    return PORTFOLIO_LOOKS_LIKE_LINKEDIN_WARNING;
  }
  return profileHttpUrlFormatWarning(value);
}

/** LinkedIn field: wrong-site mix-up first, then URL format. */
export function linkedInUrlFieldWarning(value: string): string | null {
  if (!hasUrlShapeForLinkWarning(value)) return null;
  if (!looksLikeLinkedInUrl(value)) {
    return LINKEDIN_DOES_NOT_LOOK_LIKE_LINKEDIN_WARNING;
  }
  return profileHttpUrlFormatWarning(value);
}

/** Warning for the create/edit profile-link dialog, by field. */
export function profileLinkFieldWarning(
  field: "portfolio_url" | "linkedin_url" | "location",
  value: string,
): string | null {
  if (field === "portfolio_url") return portfolioUrlFieldWarning(value);
  if (field === "linkedin_url") return linkedInUrlFieldWarning(value);
  return null;
}
