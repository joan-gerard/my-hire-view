import { z } from "zod";

/** Max length for first_name / last_name on profile update. */
export const PROFILE_NAME_MAX_LENGTH = 100;

/** Max length for location on profile update. */
export const PROFILE_LOCATION_MAX_LENGTH = 200;

/** Max length for portfolio / LinkedIn / profile picture URLs. */
export const PROFILE_URL_MAX_LENGTH = 2048;

const FIELD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  location: "Location",
  portfolio_url: "Portfolio URL",
  linkedin_url: "LinkedIn URL",
  profile_picture_url: "Profile picture URL",
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
