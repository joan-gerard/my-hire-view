/**
 * Profile row as stored in the database. One row per user; editable on the profile page.
 * A snapshot of these fields is copied to each application on create/update.
 */
export interface Profile {
  user_id: string;
  /** Opaque id for public share URLs (/view/{public_id}/{slug}). */
  public_id?: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  updated_at: string;
  /** Profile picture URL (Supabase Storage). One picture per user. */
  profile_picture_url?: string | null;
  /**
   * Recruiter-facing email. UI prefills from the Auth account email when empty;
   * applications snapshot the resolved value when shown.
   */
  contact_email?: string | null;
  /** Optional recruiter-facing phone. */
  phone?: string | null;
  /** Default include for email on new applications. */
  default_show_email?: boolean;
  /** Default include for phone on new applications. */
  default_show_phone?: boolean;
  /** Default show_profile_picture on new applications. */
  default_show_profile_picture?: boolean;
  /** Default include for location on new applications. */
  default_show_location?: boolean;
  /** Default include for LinkedIn on new applications. */
  default_show_linkedin?: boolean;
  /** Default include for portfolio on new applications. */
  default_show_portfolio?: boolean;
  /**
   * When true (default), About you on create/edit starts collapsed after the
   * first live application. When false, About you stays fully expanded.
   */
  collapse_about_you?: boolean;
}

export type { ProfileUpdateInput } from "@/lib/validation/profile";
export {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
  PROFILE_PHONE_MAX_LENGTH,
  PROFILE_CONTACT_EMAIL_MAX_LENGTH,
} from "@/lib/validation/profile";
