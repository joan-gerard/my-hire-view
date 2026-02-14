export interface Application {
  id: string;
  slug: string;
  company: string;
  role: string;
  cv_url: string;
  video_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  /** Number of times the CV was downloaded from the public view page (owner downloads not counted). */
  download_count: number;
  user_id: string;
  is_active: boolean;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  /** Name position in slug: null = not included, 'start' = name-company-role, 'end' = company-role-name */
  include_name_in_slug: 'start' | 'end' | null;
  /** Set by GET by-id when cv_url is a Blob URL: true if file exists, false if missing. Omitted when not checked. */
  cv_exists?: boolean;
}

export interface ApplicationFormData {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  description?: string;
  /** Candidate fields shown to recruiters; null = do not show. Set from form toggles. */
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  /** Name in slug: null = not included, 'start' = name at start, 'end' = name at end. Stored in DB as include_name_in_slug. */
  slugNamePosition?: 'start' | 'end' | null;
}

export interface ApplicationCreateInput {
  company: string;
  role: string;
  slug: string;
  cv_url: string;
  video_url: string;
  description?: string;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  slugNamePosition?: 'start' | 'end' | null;
}

export interface ApplicationUpdateInput {
  company?: string;
  role?: string;
  slug?: string;
  cv_url?: string;
  video_url?: string;
  description?: string;
  is_active?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  slugNamePosition?: 'start' | 'end' | null;
}
