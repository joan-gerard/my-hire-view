/**
 * Creates or updates the profiles row for a user with first/last name from
 * signup. Used after signUp when a session exists, and after email confirmation
 * in /auth/callback (names come from auth user_metadata).
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

/**
 * Upserts a profiles row with the given names. Other profile columns are left
 * alone on conflict (only these fields are in the payload).
 */
export async function ensureProfileWithNames(
  // PostgREST builders are thenable; keep the client surface loose for SSR clients.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: { from: (table: string) => any },
  userId: string,
  names: ProfileNames,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      first_name: names.first_name,
      last_name: names.last_name,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
