import type { PublicApplication } from "@/lib/types/application";

/**
 * Form-state inputs for the in-form recruiter preview (F41-127).
 * Hidden About you fields should already be null here.
 */
export type ApplicationFormPreviewInput = {
  company: string;
  role: string;
  first_name: string;
  last_name: string;
  location: string | null;
  email: string | null;
  phone: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  profile_picture_url: string | null;
  cv_url: string | null;
  cv_filename: string | null;
  use_original_cv_filename: boolean;
  /** When known: false only if the saved file is missing from storage. */
  cv_exists?: boolean;
  video_url: string;
};

function trimOrNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Builds the public share DTO shape from the current create/edit form so the
 * preview dialog can reuse `ApplicationPageHeader` / `ApplicationPageContent`
 * without saving first.
 */
export function buildApplicationFormPreview(
  input: ApplicationFormPreviewInput,
): PublicApplication {
  const cvUrl = trimOrNull(input.cv_url);
  const dto: PublicApplication = {
    status: "active",
    company: input.company.trim(),
    role: input.role.trim(),
    first_name: trimOrNull(input.first_name),
    last_name: trimOrNull(input.last_name),
    location: trimOrNull(input.location),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    portfolio_url: trimOrNull(input.portfolio_url),
    linkedin_url: trimOrNull(input.linkedin_url),
    profile_picture_url: trimOrNull(input.profile_picture_url),
    cv_url: cvUrl,
    video_url: input.video_url.trim(),
    cv_filename: trimOrNull(input.cv_filename),
    use_original_cv_filename: input.use_original_cv_filename,
  };
  if (cvUrl && input.cv_exists !== undefined) {
    dto.cv_exists = input.cv_exists;
  }
  return dto;
}
