import type { Profile } from "@/lib/types/profile";

/** Identity fields the application form can write back to the profile. */
export type ProfileIdentityFields = {
  first_name: string;
  last_name: string;
  location: string;
  portfolio_url: string;
  linkedin_url: string;
};

/** Merge identity just saved on the profile into the in-memory profile. */
export function profileWithSavedIdentity(
  prev: Profile | null,
  identity: ProfileIdentityFields,
  fallback?: Partial<Profile>,
): Profile {
  return {
    user_id: prev?.user_id ?? fallback?.user_id ?? "",
    public_id: prev?.public_id ?? fallback?.public_id,
    first_name: identity.first_name,
    last_name: identity.last_name,
    location: identity.location.trim() ? identity.location.trim() : null,
    portfolio_url: identity.portfolio_url.trim()
      ? identity.portfolio_url.trim()
      : null,
    linkedin_url: identity.linkedin_url.trim()
      ? identity.linkedin_url.trim()
      : null,
    profile_picture_url:
      prev?.profile_picture_url ?? fallback?.profile_picture_url ?? null,
    updated_at: prev?.updated_at ?? new Date().toISOString(),
  };
}
