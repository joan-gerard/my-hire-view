/**
 * Profile-owned primary CV (library entry). Free/Pro max 5 per user
 * (`PRIMARY_CV_MAX_PER_USER`); DB enforces via `primary_cv_library_max_for_user`
 * + trigger `primary_cvs_library_cap` (F13-032). See docs/PDF_AND_R2.md.
 */
import type { ApplicationStatus } from "@/lib/types/application";

/** Compact application row for primary-CV delete confirm previews. */
export type PrimaryCvApplicationPreview = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
};

export interface PrimaryCv {
  id: string;
  user_id: string;
  url: string;
  filename: string;
  label: string | null;
  created_at: string;
  /** Applications currently referencing this row via `primary_cv_id`. */
  applications_count: number;
  /**
   * Applications using this primary CV (from list API). May be truncated;
   * see `applications_count` for the full total.
   */
  used_by: PrimaryCvApplicationPreview[];
}

export interface PrimaryCvCreateResult {
  data: PrimaryCv;
}

/**
 * Free/Pro primary library max (UI + early API check).
 * Must stay aligned with `primary_cv_library_max_for_user()` until E2 makes
 * the DB function plan-aware (Premium planned max 15).
 */
export const PRIMARY_CV_MAX_PER_USER = 5;

/** Stable marker from trigger `primary_cvs_library_cap` (migration 028). */
export const PRIMARY_CV_LIBRARY_CAP_ERROR_MARKER =
  "primary_cvs_library_cap_exceeded";

/** User-facing copy when the primary library is at capacity. */
export function primaryCvLibraryCapMessage(
  max: number = PRIMARY_CV_MAX_PER_USER,
): string {
  const n = Math.max(1, Math.floor(max));
  return `You can store up to ${n} primary CVs. Delete one to upload another.`;
}

/**
 * True when a PostgREST/Postgres error is the F13 library-cap trigger.
 * Optionally parses `:max=N` from the exception so Premium can raise later.
 */
export function isPrimaryCvLibraryCapError(
  error: { message?: string | null; code?: string | null } | null | undefined,
): boolean {
  const message = error?.message;
  return typeof message === "string" && message.includes(PRIMARY_CV_LIBRARY_CAP_ERROR_MARKER);
}

/** Parses `:max=N` from a cap exception message; null if absent/invalid. */
export function primaryCvLibraryCapMaxFromDbError(
  error: { message?: string | null } | null | undefined,
): number | null {
  const message = error?.message;
  if (typeof message !== "string") return null;
  const match = message.match(/:max=(\d+)\b/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Max application rows shown in the delete-confirm preview list. */
export const PRIMARY_CV_DELETE_PREVIEW_LIMIT = 10;

/** Confirm copy when deleting a primary CV that is still attached to applications. */
export function primaryCvDeleteConfirmMessage(applicationsCount: number): string {
  const n = Math.max(0, Math.floor(applicationsCount));
  if (n === 1) {
    return "1 application currently uses this CV. Deleting it removes the file from storage. That application will show “CV missing” on the dashboard until you pick another CV. This cannot be undone.";
  }
  return `${n} applications currently use this CV. Deleting it removes the file from storage. Those applications will show “CV missing” on the dashboard until you pick another CV. This cannot be undone.`;
}

/**
 * Post-delete warning when applications still pointed at the removed primary CV.
 * Shown after the library list refreshes so `load()` cannot wipe it (F18-053).
 */
export function primaryCvDeletedStillReferencedMessage(
  applicationsAffected: number,
): string | null {
  const n = Math.max(0, Math.floor(applicationsAffected));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `Primary CV deleted. ${n} application${n === 1 ? "" : "s"} still referenced it and will show “CV missing” until updated.`;
}

/**
 * Status after a successful primary-CV delete + follow-up list refresh.
 * Keeps the still-referenced warning even when the refresh fails.
 */
export function primaryCvPostDeleteStatusMessage(args: {
  applicationsAffected: number;
  refreshed: boolean;
}): string | null {
  const warning = primaryCvDeletedStillReferencedMessage(
    args.applicationsAffected,
  );
  if (!warning) return null;
  if (args.refreshed) return warning;
  return `${warning} The library list could not be refreshed — try again.`;
}

/** Label for one application in the delete preview (company — role). */
export function primaryCvApplicationPreviewLabel(
  app: Pick<PrimaryCvApplicationPreview, "company" | "role">,
): string {
  const company = app.company.trim() || "Untitled company";
  const role = app.role.trim() || "Untitled role";
  return `${company} — ${role}`;
}
