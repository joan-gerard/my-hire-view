import { z } from "zod";

/** Max length for optional `label` on POST /api/profile/primary-cvs. */
export const PRIMARY_CV_LABEL_MAX_LENGTH = 120;

const FIELD_LABELS: Record<string, string> = {
  id: "Primary CV id",
  label: "Label",
};

/**
 * Optional library label from multipart form fields.
 * Empty / whitespace → `null`. Over-length → validation error (no silent truncate).
 * Non-string values (e.g. a File) are rejected.
 */
export const primaryCvLabelSchema = z.preprocess((value) => {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}, z
  .string({ error: "Label must be a string" })
  .max(PRIMARY_CV_LABEL_MAX_LENGTH, {
    error: `Label must be at most ${PRIMARY_CV_LABEL_MAX_LENGTH} characters`,
  })
  .nullable());

export type PrimaryCvLabel = string | null;

/**
 * Query schema for DELETE /api/profile/primary-cvs?id=…
 * Requires a non-empty UUID (after trim).
 */
export const primaryCvDeleteQuerySchema = z.object({
  id: z.preprocess(
    (value) => {
      if (value == null) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .string({ error: "Primary CV id is required" })
      .min(1, { error: "Primary CV id is required" })
      .pipe(z.uuid({ error: "Primary CV id must be a valid UUID" })),
  ),
});

export type PrimaryCvDeleteQuery = { id: string };

/** First Zod issue as a client-facing `{ error }` message. */
export function formatPrimaryCvZodError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid request";

  if (issue.code === "unrecognized_keys") {
    return issue.message;
  }

  const key = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[key];
  if (!label) return issue.message;

  if (
    issue.message.startsWith(`${label}:`) ||
    issue.message.startsWith(label) ||
    issue.message.startsWith("Primary CV id") ||
    issue.message.startsWith("Label")
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}
