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
}

export type { ProfileUpdateInput } from "@/lib/validation/profile";
export {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_LOCATION_MAX_LENGTH,
  PROFILE_URL_MAX_LENGTH,
} from "@/lib/validation/profile";
