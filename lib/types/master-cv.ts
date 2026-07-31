/**
 * Profile-owned master CV (library entry). Max 5 per user.
 * See docs/CV_REUSE_AND_STORAGE.md
 */
import type { ApplicationStatus } from "@/lib/types/application";

/** Compact application row for master-CV delete confirm previews. */
export type MasterCvApplicationPreview = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
};

export interface MasterCv {
  id: string;
  user_id: string;
  url: string;
  filename: string;
  label: string | null;
  created_at: string;
  /** Applications currently referencing this row via `master_cv_id`. */
  applications_count: number;
  /**
   * Applications using this master (from list API). May be truncated;
   * see `applications_count` for the full total.
   */
  used_by: MasterCvApplicationPreview[];
}

export interface MasterCvCreateResult {
  data: MasterCv;
}

export const MASTER_CV_MAX_PER_USER = 5;

/** Max application rows shown in the delete-confirm preview list. */
export const MASTER_CV_DELETE_PREVIEW_LIMIT = 10;

/** Confirm copy when deleting a master CV that is still attached to applications. */
export function masterCvDeleteConfirmMessage(applicationsCount: number): string {
  const n = Math.max(0, Math.floor(applicationsCount));
  if (n === 1) {
    return "1 application currently uses this CV. Deleting it removes the file from storage. That application will show “CV missing” on the dashboard until you pick another CV. This cannot be undone.";
  }
  return `${n} applications currently use this CV. Deleting it removes the file from storage. Those applications will show “CV missing” on the dashboard until you pick another CV. This cannot be undone.`;
}

/** Label for one application in the delete preview (company — role). */
export function masterCvApplicationPreviewLabel(
  app: Pick<MasterCvApplicationPreview, "company" | "role">,
): string {
  const company = app.company.trim() || "Untitled company";
  const role = app.role.trim() || "Untitled role";
  return `${company} — ${role}`;
}
