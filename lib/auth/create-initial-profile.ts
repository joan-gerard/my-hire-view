import { createAdminClient } from "@/lib/supabase/admin";

export type InitialProfileInput = {
  userId: string;
  first_name: string;
  last_name: string;
  public_id: string;
};

/**
 * Idempotently creates a profiles row for a newly signed-up user.
 * Uses the service-role client so it works when email confirmation is ON
 * (no session / RLS insert yet) and when a session is issued immediately.
 *
 * Does not overwrite an existing row (safe to call from signup and auth callback).
 */
export async function createInitialProfile(
  input: InitialProfileInput,
): Promise<{ error: string | null }> {
  const admin = createAdminClient();

  const { data: existing, error: selectError } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (selectError) {
    console.error("createInitialProfile select failed:", selectError.message);
    return { error: selectError.message };
  }

  if (existing) {
    return { error: null };
  }

  const { error: insertError } = await admin.from("profiles").insert({
    user_id: input.userId,
    public_id: input.public_id,
    first_name: input.first_name,
    last_name: input.last_name,
    location: null,
    portfolio_url: null,
    linkedin_url: null,
    profile_picture_url: null,
  });

  if (insertError) {
    // Concurrent signup/callback race: unique violation is fine.
    if (insertError.code === "23505") {
      return { error: null };
    }
    console.error("createInitialProfile insert failed:", insertError.message);
    return { error: insertError.message };
  }

  return { error: null };
}
