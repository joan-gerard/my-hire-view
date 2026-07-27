/**
 * Helpers for reading signup names from Auth user_metadata.
 * Profiles rows are created on first PUT /api/profile, not at signup/login.
 */

type ProfileNames = {
  first_name: string;
  last_name: string;
};

type AuthUserLike = {
  id: string;
  user_metadata?: Record<string, unknown> | null;
};

/** Reads trimmed first/last name from Supabase Auth user_metadata. */
export function namesFromUserMetadata(
  user: AuthUserLike,
): ProfileNames | null {
  const meta = user.user_metadata ?? {};
  const first =
    typeof meta.first_name === "string" ? meta.first_name.trim() : "";
  const last =
    typeof meta.last_name === "string" ? meta.last_name.trim() : "";
  if (!first || !last) return null;
  return { first_name: first, last_name: last };
}
