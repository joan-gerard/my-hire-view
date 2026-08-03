export type ApplicationStatus = "active" | "draft" | "archived";

export type ApplicationCvType = "primary" | "tailored";

export interface Application {
  id: string;
  slug: string;
  company: string;
  role: string;
  cv_url: string;
  video_url: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  /** Number of times the CV was downloaded from the public view page (owner downloads not counted). */
  download_count: number;
  /** Last time the application page was viewed by someone other than the owner (null if never viewed). */
  last_viewed_at: string | null;
  user_id: string;
  /** active = live on public URL; draft/archived = public GET returns unavailable stub. */
  status: ApplicationStatus;
  /** Set when status becomes archived; cleared on restore. Re-archiving resets retention clock. */
  archived_at: string | null;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  /** Name position in slug: null = not included, 'start' = name-company-role, 'end' = company-role-name */
  include_name_in_slug: "start" | "end" | null;
  /** Original filename of the uploaded CV (e.g. My Resume.pdf). Used for download when use_original_cv_filename is true. Omitted before migration 011. */
  cv_filename?: string | null;
  /** When true, public download uses cv_filename; when false, uses generated name CV-{Slug}.pdf. Default true. Omitted before migration 011. */
  use_original_cv_filename?: boolean;
  /** Set by GET by-id / public slug when `cv_url` is checked: true if the CV file exists (e.g. in R2), false if missing. Omitted when not checked. */
  cv_exists?: boolean;
  /**
   * Display-only avatar URL resolved at read time from `profiles.profile_picture_url`
   * when `show_profile_picture` is true. Not stored on `applications`.
   */
  profile_picture_url?: string | null;
  /** User chose to show the live profile picture on this application. */
  show_profile_picture?: boolean;
  /** primary = profile library CV (do not delete R2 on app delete); tailored = app-owned upload. */
  cv_type?: ApplicationCvType;
  /** When cv_type is primary, the library row id (may be null if primary was deleted). */
  primary_cv_id?: string | null;
}

/**
 * Fields returned by `GET /api/applications/[publicId]/[slug]` when the
 * application is publicly visible (`status = active`). Omits owner-only /
 * internal fields (`user_id`, analytics, storage FKs, etc.).
 */
export type PublicApplication = Pick<
  Application,
  | "company"
  | "role"
  | "first_name"
  | "last_name"
  | "location"
  | "portfolio_url"
  | "linkedin_url"
  | "cv_url"
  | "video_url"
> & {
  status: "active";
  /** Display-only avatar URL resolved at read time (may be null when hidden). */
  profile_picture_url: string | null;
  cv_filename?: string | null;
  use_original_cv_filename?: boolean;
  /** Set when `cv_url` is checked against R2; omitted when there is no `cv_url`. */
  cv_exists?: boolean;
};

/**
 * Minimal public DTO when the application must not expose content (archived,
 * draft, etc.). Same recruiter-facing empty state as a deleted/missing link.
 */
export type UnavailablePublicApplication = {
  status: "unavailable";
};

/** Success payload for `GET /api/applications/[publicId]/[slug]`. */
export type PublicApplicationResponse =
  | PublicApplication
  | UnavailablePublicApplication;

/** True when recruiters may see CV/video and candidate details. */
export function isApplicationPubliclyVisible(
  status: ApplicationStatus,
): boolean {
  return status === "active";
}

export function isUnavailablePublicApplication(
  data: PublicApplicationResponse,
): data is UnavailablePublicApplication {
  return data.status === "unavailable";
}

export function toUnavailablePublicApplication(): UnavailablePublicApplication {
  return { status: "unavailable" };
}

/**
 * Maps a full application row (plus optional `cv_exists`) to the public share DTO.
 * Non-active statuses return the unavailable stub (no media or PII).
 */
export function toPublicApplication(
  application: Application,
  cv_exists?: boolean,
): PublicApplication {
  const dto: PublicApplication = {
    company: application.company,
    role: application.role,
    first_name: application.first_name,
    last_name: application.last_name,
    location: application.location,
    portfolio_url: application.portfolio_url,
    linkedin_url: application.linkedin_url,
    profile_picture_url: application.profile_picture_url ?? null,
    cv_url: application.cv_url,
    video_url: application.video_url,
    status: "active",
  };
  if (application.cv_filename !== undefined) {
    dto.cv_filename = application.cv_filename;
  }
  if (application.use_original_cv_filename !== undefined) {
    dto.use_original_cv_filename = application.use_original_cv_filename;
  }
  if (cv_exists !== undefined) {
    dto.cv_exists = cv_exists;
  }
  return dto;
}

/**
 * Public GET mapper: active → full DTO; archived/draft → unavailable stub.
 */
export function toPublicApplicationResponse(
  application: Application,
  cv_exists?: boolean,
): PublicApplicationResponse {
  if (!isApplicationPubliclyVisible(application.status)) {
    return toUnavailablePublicApplication();
  }
  return toPublicApplication(application, cv_exists);
}

/**
 * Fields returned by `GET /api/applications` for the admin dashboard list.
 * Omits candidate/CV/video/profile fields that the list UI does not use.
 */
export type ApplicationListItem = Pick<
  Application,
  | "id"
  | "slug"
  | "company"
  | "role"
  | "status"
  | "archived_at"
  | "view_count"
  | "download_count"
  | "created_at"
  | "last_viewed_at"
  | "cv_url"
> & {
  /** Opaque candidate id for public share URLs. */
  public_id: string;
  /** True when cv_url points at an existing R2 object (checked on list). */
  cv_exists: boolean;
};

/** Supabase `.select()` projection for `ApplicationListItem` (before attaching public_id / cv_exists). */
export const APPLICATION_LIST_SELECT =
  "id, slug, company, role, status, archived_at, view_count, download_count, created_at, last_viewed_at, cv_url" as const;

/** Default page size for `GET /api/applications`. */
export const APPLICATION_LIST_DEFAULT_LIMIT = 20;

/** Maximum allowed `limit` for `GET /api/applications`. */
export const APPLICATION_LIST_MAX_LIMIT = 50;

export interface ApplicationListMeta {
  limit: number;
  offset: number;
  total: number;
}

export interface ApplicationListResponse {
  data: ApplicationListItem[];
  meta: ApplicationListMeta;
}

export interface ApplicationListParams {
  limit?: number;
  offset?: number;
  /** Case-insensitive match on company, role, or slug. */
  q?: string;
}

export interface ApplicationFormData {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  /** Candidate fields shown to recruiters; null = do not show. Set from form toggles. */
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  /** Name in slug: null = not included, 'start' = name at start, 'end' = name at end. Stored in DB as include_name_in_slug. */
  slugNamePosition?: "start" | "end" | null;
  /** Original CV filename (set when file selected or from server). Used for download when use_original_cv_filename is true. */
  cv_filename?: string | null;
  /** When true, download uses cv_filename; when false, uses generated name CV-{Slug}.pdf. */
  use_original_cv_filename?: boolean;
  /** When true, public view shows the live profile picture from profiles. */
  show_profile_picture?: boolean;
  /**
   * Set by ApplicationForm on submit. When true, create flow may keep the typed slug if it passes format + availability checks.
   */
  slugManuallyEdited?: boolean;
  /** primary = selected from library; tailored = uploaded for this application. */
  cv_type?: ApplicationCvType;
  /** When cv_type is primary, the selected library id. */
  primary_cv_id?: string | null;
}

export interface ApplicationCreateInput {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  slugNamePosition?: "start" | "end" | null;
  cv_filename?: string | null;
  use_original_cv_filename?: boolean;
  /** When true, public view shows the live profile picture from profiles. */
  show_profile_picture?: boolean;
  cv_type?: ApplicationCvType;
  primary_cv_id?: string | null;
  /** Optional; defaults to active. */
  status?: ApplicationStatus;
}

export interface ApplicationUpdateInput {
  company?: string;
  role?: string;
  slug?: string;
  cv_url?: string;
  video_url?: string;
  status?: ApplicationStatus;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  slugNamePosition?: "start" | "end" | null;
  cv_filename?: string | null;
  use_original_cv_filename?: boolean;
  show_profile_picture?: boolean;
  cv_type?: ApplicationCvType;
  primary_cv_id?: string | null;
}
