import { z } from "zod";

/** Max length for first_name / last_name on profile update. */
export const PROFILE_NAME_MAX_LENGTH = 100;

/** Max length for location on profile update. */
export const PROFILE_LOCATION_MAX_LENGTH = 200;

/** Max length for portfolio / LinkedIn / profile picture URLs. */
export const PROFILE_URL_MAX_LENGTH = 2048;

/** Max length for optional phone numbers on profile / applications. */
export const PROFILE_PHONE_MAX_LENGTH = 40;

/**
 * Max length for contact / application email (RFC 5321 practical max).
 * Kept here (not imported from auth) to avoid a profile ↔ auth cycle —
 * auth already imports PROFILE_NAME_MAX_LENGTH from this module.
 */
export const PROFILE_CONTACT_EMAIL_MAX_LENGTH = 254;

const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  location: "Location",
  portfolio_url: "Portfolio URL",
  linkedin_url: "LinkedIn URL",
  profile_picture_url: "Profile picture URL",
  contact_email: "Email",
  phone: "Phone",
  default_show_email: "Show email by default",
  default_show_phone: "Show phone by default",
  default_show_profile_picture: "Show picture by default",
  default_show_location: "Show location by default",
  default_show_linkedin: "Show LinkedIn by default",
  default_show_portfolio: "Show portfolio by default",
  collapse_about_you: "Collapse About you on applications",
};

function optionalNullableString(max: number, label: string) {
  return z
    .string()
    .max(max, { error: `${label} must be at most ${max} characters` })
    .nullable()
    .optional();
}

/** Empty / whitespace-only strings become null; otherwise trim and require http(s). */
function optionalNullableHttpUrl(label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    },
    z
      .httpUrl({ error: `${label}: Please enter a valid URL` })
      .max(PROFILE_URL_MAX_LENGTH, {
        error: `${label} must be at most ${PROFILE_URL_MAX_LENGTH} characters`,
      })
      .nullable()
      .optional(),
  );
}

/** Empty / whitespace become null; otherwise a trimmed email. */
function optionalNullableEmail(label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    },
    z
      .email({ error: `${label}: Please enter a valid email` })
      .max(PROFILE_CONTACT_EMAIL_MAX_LENGTH, {
        error: `${label} must be at most ${PROFILE_CONTACT_EMAIL_MAX_LENGTH} characters`,
      })
      .nullable()
      .optional(),
  );
}

/**
 * Strict body schema for PUT /api/profile.
 * Rejects unexpected keys; enforces types, max lengths, and http(s) URLs.
 */
export const profileUpdateSchema = z
  .object({
    first_name: optionalNullableString(
      PROFILE_NAME_MAX_LENGTH,
      FIELD_LABELS.first_name,
    ),
    last_name: optionalNullableString(
      PROFILE_NAME_MAX_LENGTH,
      FIELD_LABELS.last_name,
    ),
    location: optionalNullableString(
      PROFILE_LOCATION_MAX_LENGTH,
      FIELD_LABELS.location,
    ),
    portfolio_url: optionalNullableHttpUrl(FIELD_LABELS.portfolio_url),
    linkedin_url: optionalNullableHttpUrl(FIELD_LABELS.linkedin_url),
    profile_picture_url: optionalNullableHttpUrl(
      FIELD_LABELS.profile_picture_url,
    ),
    contact_email: optionalNullableEmail(FIELD_LABELS.contact_email),
    phone: optionalNullableString(
      PROFILE_PHONE_MAX_LENGTH,
      FIELD_LABELS.phone,
    ),
    default_show_email: z.boolean().optional(),
    default_show_phone: z.boolean().optional(),
    default_show_profile_picture: z.boolean().optional(),
    default_show_location: z.boolean().optional(),
    default_show_linkedin: z.boolean().optional(),
    default_show_portfolio: z.boolean().optional(),
    collapse_about_you: z.boolean().optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** First Zod issue as a client-facing `{ error }` message. */
export function formatProfileUpdateZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request body";

  if (issue.code === "unrecognized_keys") {
    return issue.message;
  }

  const key = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[key];
  if (!label) return issue.message;

  // Messages that already include the label (e.g. httpUrl custom errors).
  if (issue.message.startsWith(`${label}:`) || issue.message.startsWith(label)) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}
