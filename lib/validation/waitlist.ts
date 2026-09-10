import {
  requiredTrimmedName,
  trimmedEmailSchema,
} from "@/lib/validation/auth";
import { z } from "zod";

/** Soft cap for waitlist JSON bodies (email, name, enums, honeypot). */
export const WAITLIST_REQUEST_BODY_MAX_BYTES = 4_096;

/**
 * Honeypot field name — looks like a real field to bots; humans never see it.
 * Must stay empty for a signup to be inserted (F3-039 light).
 */
export const WAITLIST_HONEYPOT_FIELD = "website" as const;

export const WAITLIST_JOB_SEARCH_STATUSES = [
  "Actively searching",
  "Casually looking",
  "Career planning",
  "Other",
] as const;

export const WAITLIST_PRIMARY_GOALS = [
  "Get more interviews",
  "Track my applications",
  "Stand out to recruiters",
  "Network with recruiters",
  "Other",
] as const;

export const WAITLIST_CAREER_STAGES = [
  "Entry-level",
  "Junior (1–3 years)",
  "Mid-level (3–7 years)",
  "Senior (7+ years)",
  "Other",
] as const;

const FIELD_LABELS: Record<string, string> = {
  email: "Email",
  first_name: "First name",
  job_search_status: "Job search status",
  primary_goal: "Primary goal",
  career_stage: "Career stage",
  [WAITLIST_HONEYPOT_FIELD]: "Website",
};

/** Optional enum: omit / empty → undefined; invalid value → Zod error. */
function optionalEnumField<T extends string>(
  values: readonly T[],
  label: string,
) {
  return z.preprocess(
    (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z
      .enum(values as [T, ...T[]], {
        error: `Please select a valid ${label.toLowerCase()}`,
      })
      .optional(),
  );
}

/**
 * Waitlist signup body (F3-064 + F3-039 honeypot).
 * Unexpected keys are rejected. Honeypot may be present but must be empty
 * after trim for a real insert (checked by the route before/after parse).
 */
export const waitlistBodySchema = z
  .object({
    email: trimmedEmailSchema(),
    first_name: requiredTrimmedName("First name"),
    job_search_status: z.enum(WAITLIST_JOB_SEARCH_STATUSES, {
      error: "Please select your job search status",
    }),
    primary_goal: optionalEnumField(
      WAITLIST_PRIMARY_GOALS,
      FIELD_LABELS.primary_goal,
    ),
    career_stage: optionalEnumField(
      WAITLIST_CAREER_STAGES,
      FIELD_LABELS.career_stage,
    ),
    [WAITLIST_HONEYPOT_FIELD]: z.preprocess(
      (value) => {
        if (value === undefined || value === null) return "";
        if (typeof value !== "string") return value;
        return value;
      },
      z.string({ error: "Invalid request body" }),
    ),
  })
  .strict();

export type WaitlistBody = z.infer<typeof waitlistBodySchema>;

export function formatWaitlistZodError(error: z.ZodError): string {
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
    issue.message.toLowerCase().startsWith("please")
  ) {
    return issue.message;
  }

  return `${label}: ${issue.message}`;
}

/**
 * Raw-body honeypot check (before Zod) so bots that also send invalid fields
 * still get a silent 200 and cannot probe validation.
 */
export function isRawWaitlistHoneypotTriggered(raw: unknown): boolean {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return false;
  }
  const value = (raw as Record<string, unknown>)[WAITLIST_HONEYPOT_FIELD];
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  // Non-string honeypot values are not human form input — treat as tripped.
  return true;
}

/** True when the parsed honeypot was filled — treat as a bot (do not insert). */
export function isWaitlistHoneypotTriggered(body: WaitlistBody): boolean {
  return body[WAITLIST_HONEYPOT_FIELD].trim() !== "";
}
