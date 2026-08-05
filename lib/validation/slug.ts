import {
  APPLICATION_COMPANY_ROLE_MAX_LENGTH,
} from "@/lib/validation/application";
import {
  PROFILE_NAME_MAX_LENGTH,
} from "@/lib/validation/profile";
import { SLUG_MAX_LENGTH } from "@/lib/utils/slug-generate";
import { z } from "zod";

const FIELD_LABELS: Record<string, string> = {
  company: "Company",
  role: "Role",
  slug: "Slug",
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
  z.uuid({ error: "excludeId must be a valid UUID" }).optional(),
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

/**
 * Strict body schema for POST /api/slug/validate.
 * Requires a string `slug` (may be empty — format feedback stays on the 200 UX path).
 */
export const slugValidateSchema = z
  .object({
    slug: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value;
        return value.trim();
      },
      z
        .string({ error: "Slug is required" })
        .max(SLUG_MAX_LENGTH, {
          error: `Slug must be at most ${SLUG_MAX_LENGTH} characters`,
        }),
    ),
    excludeId: optionalExcludeIdSchema,
  })
  .strict();

export type SlugValidateInput = z.infer<typeof slugValidateSchema>;

function formatSlugZodError(
  error: z.ZodError,
  fallback = "Invalid request body",
): string {
  const issue = error.issues[0];
  if (!issue) return fallback;

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

/** First Zod issue as a client-facing `{ error }` message (POST /api/slug). */
export function formatSlugReserveZodError(error: z.ZodError): string {
  return formatSlugZodError(error);
}

/** First Zod issue as a client-facing `{ error }` message (POST /api/slug/validate). */
export function formatSlugValidateZodError(error: z.ZodError): string {
  return formatSlugZodError(error);
}
