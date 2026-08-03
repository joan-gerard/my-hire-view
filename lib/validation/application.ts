import { validateSlugFormat } from "@/lib/utils/slug-generate";
import {
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/validation/profile";
import { z } from "zod";

/** Max length for company / role on application create. */
export const APPLICATION_COMPANY_ROLE_MAX_LENGTH = 200;

/** Max length for cv_filename on application create. */
export const APPLICATION_CV_FILENAME_MAX_LENGTH = 255;

const FIELD_LABELS: Record<string, string> = {
  company: "Company",
  role: "Role",
  slug: "Slug",
  cv_url: "CV URL",
  video_url: "Video URL",
  first_name: "First name",
  last_name: "Last name",
  location: "Location",
  portfolio_url: "Portfolio URL",
  linkedin_url: "LinkedIn URL",
  slugNamePosition: "Slug name position",
  cv_filename: "CV filename",
  use_original_cv_filename: "Use original CV filename",
  show_profile_picture: "Show profile picture",
  cv_type: "CV type",
  primary_cv_id: "Primary CV id",
  status: "Status",
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

function requiredHttpUrl(label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z
      .httpUrl({ error: `${label}: Please enter a valid URL` })
      .max(PROFILE_URL_MAX_LENGTH, {
        error: `${label} must be at most ${PROFILE_URL_MAX_LENGTH} characters`,
      }),
  );
}

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

const slugSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return value.trim();
  },
  z
    .string({ error: "Slug is required" })
    .min(1, { error: "Slug is required" })
    .superRefine((slug, ctx) => {
      const format = validateSlugFormat(slug);
      if (!format.ok) {
        ctx.addIssue({ code: "custom", message: format.error });
      }
    }),
);

/**
 * Strict body schema for POST /api/applications.
 * Rejects unexpected keys; enforces required fields, URL formats, and slug format.
 */
export const applicationCreateSchema = z
  .object({
    company: requiredTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.company,
    ),
    role: requiredTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.role,
    ),
    slug: slugSchema,
    cv_url: requiredHttpUrl(FIELD_LABELS.cv_url),
    video_url: requiredHttpUrl(FIELD_LABELS.video_url),
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
    slugNamePosition: z
      .enum(["start", "end"], {
        error: "Slug name position must be start, end, or null",
      })
      .nullable()
      .optional(),
    cv_filename: optionalNullableString(
      APPLICATION_CV_FILENAME_MAX_LENGTH,
      FIELD_LABELS.cv_filename,
    ),
    use_original_cv_filename: z.boolean().optional(),
    show_profile_picture: z.boolean().optional(),
    cv_type: z.enum(["primary", "tailored"]).optional(),
    primary_cv_id: z
      .uuid({ error: "Primary CV id must be a valid UUID" })
      .nullable()
      .optional(),
    status: z.enum(["active", "draft", "archived"]).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.cv_type === "primary" && !data.primary_cv_id) {
      ctx.addIssue({
        code: "custom",
        path: ["primary_cv_id"],
        message: "primary_cv_id is required when cv_type is primary",
      });
    }
  });

export type ApplicationCreateSchemaInput = z.infer<
  typeof applicationCreateSchema
>;

/** First Zod issue as a client-facing `{ error }` message. */
export function formatApplicationCreateZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request body";

  if (issue.code === "unrecognized_keys") {
    return issue.message;
  }

  const key = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[key];
  if (!label) return issue.message;

  // Messages that already include the label (e.g. httpUrl / required custom errors).
  if (
    issue.message.startsWith(`${label}:`) ||
    issue.message.startsWith(label) ||
    issue.message.startsWith("primary_cv_id")
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}
