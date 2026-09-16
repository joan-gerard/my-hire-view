/**
 * Shared UX copy for Public id + share URL explanation (F19-046).
 * Keep profile and create/edit application wording in sync.
 */

export const PUBLIC_ID_LABEL = "Public id";

/** Short explanation of what Public id is and why it appears in share URLs. */
export const PUBLIC_ID_HELP =
  "This private id appears in every share link (between /view/ and the application slug). It is assigned to your account and is not your name, so links stay less identifying.";

/** Shown when Public id cannot be resolved yet. */
export const PUBLIC_ID_MISSING =
  "Not ready yet. Share and preview links will work once your Public id is available (usually after signup finishes or you save your profile / create an application).";

/** Intro above the live share URL on create/edit. */
export const SHARE_URL_PREVIEW_LABEL = "Share link preview";

export const SHARE_URL_PREVIEW_HELP =
  "This is the link recruiters will open after you publish. You can Preview drafts on the same path; they stay private until you publish.";

export const SHARE_URL_PREVIEW_PLACEHOLDER = "…";

/** Path-only example for profile (no absolute origin). */
export function formatPublicPathExample(
  publicId: string,
  slugExample = "company-role",
): string {
  return `/view/${publicId}/${slugExample}`;
}
