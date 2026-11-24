import {
  SLUG_SEGMENT_ORDER_VALUES,
  validateSlugFormat,
} from "@/lib/utils/slug-generate";
import {
  PROFILE_CONTACT_EMAIL_MAX_LENGTH,
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_PHONE_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/validation/profile";
import { z } from "zod";

/** Max length for company / role on application create/update. */
export const APPLICATION_COMPANY_ROLE_MAX_LENGTH = 200;

/** Max length for cv_filename on application create/update. */
export const APPLICATION_CV_FILENAME_MAX_LENGTH = 255;

const FIELD_LABELS: Record<string, string> = {
  id: "Application ID",
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
  email: "Email",
  phone: "Phone",
  slugSegmentOrder: "URL segment order",
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

function optionalTrimmedString(max: number, label: string) {
  return z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (typeof value !== "string") return value;
      return value.trim();
    },
    z
      .string({ error: `${label} must be a string` })
      .min(1, { error: `${label} is required` })
      .max(max, { error: `${label} must be at most ${max} characters` })
      .optional(),
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

const requiredSlugSchema = z.preprocess(
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

const optionalSlugSchema = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (typeof value !== "string") return value;
    return value.trim();
  },
  z
    .string({ error: "Slug must be a string" })
    .min(1, { error: "Slug is required" })
    .superRefine((slug, ctx) => {
      const format = validateSlugFormat(slug);
      if (!format.ok) {
        ctx.addIssue({ code: "custom", message: format.error });
      }
    })
    .optional(),
);

const candidateFields = {
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
  email: optionalNullableEmail(FIELD_LABELS.email),
  phone: optionalNullableString(
    PROFILE_PHONE_MAX_LENGTH,
    FIELD_LABELS.phone,
  ),
  slugSegmentOrder: z
    .enum(SLUG_SEGMENT_ORDER_VALUES, {
      error: "URL segment order must be company_role or role_company",
    })
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
} as const;

/**
 * Draft create may omit a CV (`null` / empty → null). Active create still needs one.
 */
const createCvUrlSchema = optionalNullableHttpUrl(FIELD_LABELS.cv_url);

/**
 * Draft create may omit a video (`""`). Active create still needs a valid URL.
 */
const createVideoUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.union([
  z.literal(""),
  z
    .httpUrl({ error: `${FIELD_LABELS.video_url}: Please enter a valid URL` })
    .max(PROFILE_URL_MAX_LENGTH, {
      error: `${FIELD_LABELS.video_url} must be at most ${PROFILE_URL_MAX_LENGTH} characters`,
    }),
]));

/**
 * Body schema for POST /api/applications.
 * Draft saves require company, role, and slug; CV and video may be empty.
 * Creating with `status: "active"` must pass the publish completeness gate
 * (enforced in the route via `getApplicationPublishBlockers`).
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
    slug: requiredSlugSchema,
    cv_url: createCvUrlSchema.optional(),
    video_url: createVideoUrlSchema.optional(),
    ...candidateFields,
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

/**
 * Strict body schema for PUT /api/applications.
 * Requires UUID `id`; all other fields optional (partial update).
 * `cv_url: null` clears a draft résumé; empty `video_url` clears the pitch.
 */
export const applicationUpdateSchema = z
  .object({
    id: z.uuid({ error: "Application ID must be a valid UUID" }),
    company: optionalTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.company,
    ),
    role: optionalTrimmedString(
      APPLICATION_COMPANY_ROLE_MAX_LENGTH,
      FIELD_LABELS.role,
    ),
    slug: optionalSlugSchema,
    cv_url: optionalNullableHttpUrl(FIELD_LABELS.cv_url),
    video_url: createVideoUrlSchema.optional(),
    ...candidateFields,
  })
  .strict()
  .superRefine((data, ctx) => {
    // Omitting primary_cv_id is allowed on update — the route falls back to the
    // row's existing id (B2-006). Explicit null with cv_type primary is invalid.
    if (data.cv_type === "primary" && data.primary_cv_id === null) {
      ctx.addIssue({
        code: "custom",
        path: ["primary_cv_id"],
        message: "primary_cv_id is required when cv_type is primary",
      });
    }
  });

export type ApplicationUpdateSchemaInput = z.infer<
  typeof applicationUpdateSchema
>;

function formatApplicationZodError(error: z.ZodError): string {
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
    issue.message.startsWith("primary_cv_id") ||
    issue.message.startsWith("Application ID")
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}

/** First Zod issue as a client-facing `{ error }` message (POST create). */
export function formatApplicationCreateZodError(error: z.ZodError): string {
  return formatApplicationZodError(error);
}

/** First Zod issue as a client-facing `{ error }` message (PUT update). */
export function formatApplicationUpdateZodError(error: z.ZodError): string {
  return formatApplicationZodError(error);
}

/** Fields checked before `status → active` (publish or create-as-active). */
export type ApplicationCompletenessFields = {
  company?: string | null;
  role?: string | null;
  slug?: string | null;
  cv_url?: string | null;
  video_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  cv_type?: string | null;
  primary_cv_id?: string | null;
};

/**
 * Missing pieces that block publish / go-live.
 * Draft saves only need company, role, and slug (enforced by create schema + form).
 */
export function getApplicationPublishBlockers(
  app: ApplicationCompletenessFields,
): string[] {
  const blockers: string[] = [];
  if (!app.company?.trim()) blockers.push("Company");
  if (!app.role?.trim()) blockers.push("Role");
  const slug = app.slug?.trim() ?? "";
  if (!slug) {
    blockers.push("Your application link");
  } else {
    const format = validateSlugFormat(slug);
    if (!format.ok) blockers.push("Your application link");
  }
  if (!app.first_name?.trim()) blockers.push("First name");
  if (!app.last_name?.trim()) blockers.push("Last name");
  const cvType = app.cv_type === "primary" ? "primary" : "tailored";
  if (cvType === "primary") {
    if (!app.primary_cv_id || !app.cv_url?.trim()) blockers.push("Your Résumé");
  } else if (!app.cv_url?.trim()) {
    blockers.push("Your Résumé");
  }
  if (!app.video_url?.trim()) blockers.push("YouTube intro");
  return blockers;
}

export function formatPublishBlockersError(blockers: string[]): string {
  if (blockers.length === 0) return "Application is not ready to publish";
  return `Required before publishing: ${blockers.join(", ")}`;
}

/**
 * Publish blockers for a dashboard list row. Treats a confirmed-missing CV file
 * (`cv_exists === false`) as no usable résumé even when `cv_url` is still set.
 */
export function getListItemPublishBlockers(
  app: ApplicationCompletenessFields & { cv_exists?: boolean },
): string[] {
  return getApplicationPublishBlockers({
    ...app,
    cv_url: app.cv_exists === false ? null : app.cv_url,
  });
}
