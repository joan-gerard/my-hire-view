/**
 * Friendly Save/upload copy for CV and profile-picture uploads (F8-051).
 * Prefer clear, non-technical messages; keep safe server 400 text when present.
 */

export type UploadFormKind = "cv" | "profile-picture";

const DEFAULT_400: Record<UploadFormKind, string> = {
  cv: "That CV couldn’t be uploaded. Check it’s a PDF under 3MB and try again.",
  "profile-picture":
    "That picture couldn’t be uploaded. Use a JPEG, PNG, or WebP under 5MB.",
};

const DEFAULT_429 =
  "Too many uploads. Please wait a moment and try again.";

const DEFAULT_500: Record<UploadFormKind, string> = {
  cv: "We couldn’t upload your CV. Please try again in a moment.",
  "profile-picture":
    "We couldn’t upload your picture. Please try again in a moment.",
};

const NETWORK: Record<UploadFormKind, string> = {
  cv: "Network error while uploading your CV. Check your connection and try again.",
  "profile-picture":
    "Network error while uploading your picture. Check your connection and try again.",
};

/**
 * Map an upload HTTP failure to Save-form copy.
 * Status-specific overrides win over raw server text for 401/409/429/5xx.
 */
export function messageForUploadFailure(
  kind: UploadFormKind,
  status: number,
  serverError?: string | null,
): string {
  const trimmed = typeof serverError === "string" ? serverError.trim() : "";

  if (status === 400) {
    return trimmed || DEFAULT_400[kind];
  }
  if (status === 401) {
    return "Your session expired. Sign in again and try again.";
  }
  if (status === 409) {
    return kind === "cv"
      ? "This upload conflicted with a previous attempt. Please try saving again."
      : "This picture couldn’t be saved because of a conflict. Please try again.";
  }
  if (status === 429) {
    // Always use fixed copy — never surface endpoint-specific rate-limit text.
    return DEFAULT_429;
  }
  if (status >= 500) {
    return DEFAULT_500[kind];
  }
  // Other 4xx (403/404/413/422/…) — actionable client copy, not "try again" 5xx wording.
  return trimmed || DEFAULT_400[kind];
}

export function messageForUploadNetworkError(kind: UploadFormKind): string {
  return NETWORK[kind];
}
