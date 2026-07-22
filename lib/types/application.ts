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
  is_active: boolean;
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
  /** Profile picture URL copied from profile at save when user chose to show picture for this application. Null when user has no picture or removed it; view page only shows avatar when this is set. */
  profile_picture_url?: string | null;
  /** User chose to show profile picture on this application. When true, profile_picture_url is synced from profile; when user has no picture, URL stays null and view shows no avatar. */
  show_profile_picture?: boolean;
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
  | "is_active"
  | "view_count"
  | "download_count"
  | "created_at"
  | "last_viewed_at"
>;

/** Supabase `.select()` projection for `ApplicationListItem`. */
export const APPLICATION_LIST_SELECT =
  "id, slug, company, role, is_active, view_count, download_count, created_at, last_viewed_at" as const;

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
  /** When preference is per_application: whether to show profile picture for this application. Server copies profile URL when true. */
  show_profile_picture?: boolean;
  /**
   * Set by ApplicationForm on submit. When true, create flow may keep the typed slug if it passes format + availability checks.
   */
  slugManuallyEdited?: boolean;
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
  /** When preference is per_application: whether to show profile picture. Server copies profile URL when true. */
  show_profile_picture?: boolean;
}

export interface ApplicationUpdateInput {
  company?: string;
  role?: string;
  slug?: string;
  cv_url?: string;
  video_url?: string;
  is_active?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  slugNamePosition?: "start" | "end" | null;
  cv_filename?: string | null;
  use_original_cv_filename?: boolean;
  show_profile_picture?: boolean;
}
