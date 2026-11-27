/**
 * Snapshot helpers for edit-form dirty detection (disable Save when unchanged).
 */

import type { ApplicationCvType } from "@/lib/types/application";
import type { SlugSegmentOrder } from "@/lib/utils/slug-generate";

export type ApplicationFormDirtyInput = {
  company: string;
  role: string;
  slug: string;
  video_url: string;
  first_name: string;
  last_name: string;
  location: string;
  portfolio_url: string;
  linkedin_url: string;
  email: string;
  phone: string;
  includeEmail: boolean;
  includePhone: boolean;
  includeLocation: boolean;
  includePortfolio: boolean;
  includeLinkedin: boolean;
  slugSegmentOrder: SlugSegmentOrder;
  showProfilePicture: boolean;
  cvMode: ApplicationCvType;
  selectedPrimaryId: string | null;
  cv_url: string;
  cv_filename: string | null;
  use_original_cv_filename: boolean;
  hasPendingCvFile: boolean;
};

function norm(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/**
 * Stable JSON snapshot of the values that make an edit form worth saving.
 * Pending tailored files always count as a change.
 */
export function applicationFormDirtySnapshot(
  input: ApplicationFormDirtyInput,
): string {
  return JSON.stringify({
    company: norm(input.company),
    role: norm(input.role),
    slug: norm(input.slug),
    video_url: norm(input.video_url),
    first_name: norm(input.first_name),
    last_name: norm(input.last_name),
    location: norm(input.location),
    portfolio_url: norm(input.portfolio_url),
    linkedin_url: norm(input.linkedin_url),
    email: norm(input.email),
    phone: norm(input.phone),
    includeEmail: input.includeEmail,
    includePhone: input.includePhone,
    includeLocation: input.includeLocation,
    includePortfolio: input.includePortfolio,
    includeLinkedin: input.includeLinkedin,
    slugSegmentOrder: input.slugSegmentOrder,
    showProfilePicture: input.showProfilePicture,
    cvMode: input.cvMode,
    selectedPrimaryId: input.selectedPrimaryId,
    cv_url: norm(input.cv_url),
    cv_filename: input.cv_filename?.trim() || null,
    use_original_cv_filename: input.use_original_cv_filename,
    hasPendingCvFile: input.hasPendingCvFile,
  });
}

export function hasApplicationFormDirtyChanges(
  baseline: string,
  current: ApplicationFormDirtyInput,
): boolean {
  return baseline !== applicationFormDirtySnapshot(current);
}
