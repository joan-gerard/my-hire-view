import {
  APPLICATION_COMPANY_ROLE_MAX_LENGTH,
} from "@/lib/validation/application";
import {
  PROFILE_NAME_MAX_LENGTH,
} from "@/lib/validation/profile";
import { z } from "zod";

const FIELD_LABELS: Record<string, string> = {
  company: "Company",
  role: "Role",
  first_name: "First name",
  last_name: "Last name",
  slugNamePosition: "Slug name position",
  excludeId: "excludeId",
};

function requiredTrimmedString(max: number, label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z
      .string({ error: `${label} is required` })
      .min(1, { error: `${label} is required` })
      .max(max, { error: `${label} must be at most ${max} characters` }),
  );
}

function optionalNullableString(max: number, label: string) {
  return z
    .string()
    .max(max, { error: `${label} must be at most ${max} characters` })
    .nullable()
    .optional();
}

/** Empty / whitespace → undefined; otherwise require a UUID. */
export const optionalExcludeIdSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z
    .uuid({ error: "excludeId must be a valid UUID" })
    .optional(),
);

/**
 * Strict body schema for POST /api/slug.
 * Rejects unexpected keys; enforces required company/role, enums, and UUID excludeId.
 */
export const slugReserveSchema = z
  .object({
    company: requiredTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.company,
    ),
    role: requiredTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.role,
    ),
    excludeId: optionalExcludeIdSchema,
    first_name: optionalNullableString(
      PROFILE_NAME_MAX_LENGTH,
      FIELD_LABELS.first_name,
    ),
    last_name: optionalNullableString(
      PROFILE_NAME_MAX_LENGTH,
      FIELD_LABELS.last_name,
    ),
    slugNamePosition: z
      .enum(["start", "end"], {
        error: "Slug name position must be start, end, or null",
      })
      .nullable()
      .optional(),
  })
  .strict();

export type SlugReserveInput = z.infer<typeof slugReserveSchema>;

/** First Zod issue as a client-facing `{ error }` message. */
export function formatSlugReserveZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request body";

  if (issue.code === "unrecognized_keys") {
    return issue.message;
  }

  const key = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[key];
  if (!label) return issue.message;

  if (
    issue.message.startsWith(`${label}:`) ||
    issue.message.startsWith(label) ||
    issue.message.startsWith("excludeId")
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}
