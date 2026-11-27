export type AboutYouSummaryFieldKey =
  | "first_name"
  | "last_name"
  | "email"
  | "phone"
  | "location"
  | "portfolio_url"
  | "linkedin_url";

const OPTIONAL_SUMMARY_FIELDS: {
  key: Extract<
    AboutYouSummaryFieldKey,
    "email" | "phone" | "location" | "linkedin_url" | "portfolio_url"
  >;
  label: string;
}[] = [
  { key: "email", label: "email" },
  { key: "phone", label: "phone" },
  { key: "location", label: "location" },
  { key: "linkedin_url", label: "LinkedIn" },
  { key: "portfolio_url", label: "portfolio" },
];

export type AboutYouSummaryInput = {
  hasProfilePicture: boolean;
  showProfilePicture: boolean;
  firstName: string;
  lastName: string;
  values: Record<AboutYouSummaryFieldKey, string>;
  include: Record<AboutYouSummaryFieldKey, boolean>;
};

/**
 * One-line summary of what this application will show recruiters.
 * Example: "Showing photo, name, portfolio"
 */
export function buildAboutYouSummary(input: AboutYouSummaryInput): string {
  const parts: string[] = [];

  if (input.hasProfilePicture && input.showProfilePicture) {
    parts.push("photo");
  }

  if (input.firstName.trim() || input.lastName.trim()) {
    parts.push("name");
  }

  for (const field of OPTIONAL_SUMMARY_FIELDS) {
    const value = input.values[field.key]?.trim() ?? "";
    if (value && input.include[field.key]) {
      parts.push(field.label);
    }
  }

  if (parts.length === 0) {
    return "Nothing shown yet";
  }

  return `Showing ${parts.join(", ")}`;
}

/**
 * Collapse About you when the profile preference is on and the account has
 * at least one live (active) application. Drafts alone do not count; turning
 * the preference off keeps About you fully expanded.
 */
export function shouldCollapseAboutYouByDefault(options: {
  liveApplicationCount: number | null;
  /** Profile preference; default true when omitted. */
  collapseAboutYou?: boolean;
}): boolean {
  if (options.collapseAboutYou === false) return false;
  if (options.liveApplicationCount === null) return false;
  return options.liveApplicationCount >= 1;
}
