import { createAdminClient } from "@/lib/supabase/admin";
import {
  generatePublicId,
  isValidPublicId,
} from "@/lib/utils/public-id";

export type InitialProfileInput = {
  userId: string;
  first_name: string;
  last_name: string;
  public_id: string;
};

/** Max insert attempts when `public_id` collides with another user’s row. */
const MAX_PUBLIC_ID_ATTEMPTS = 3;

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Merges `public_id` into Auth `user_metadata` when the profiles row used a
 * different id than the caller requested (invalid format or uniqueness retry).
 */
async function syncPublicIdToAuthMetadata(
  admin: AdminClient,
  userId: string,
  publicId: string,
): Promise<void> {
  const { data, error: getError } = await admin.auth.admin.getUserById(userId);
  if (getError || !data.user) {
    console.error(
      "createInitialProfile: failed to load Auth user for public_id sync:",
      getError?.message ?? "user missing",
    );
    return;
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...(data.user.user_metadata ?? {}),
      public_id: publicId,
    },
  });
  if (updateError) {
    console.error(
      "createInitialProfile: failed to sync public_id to Auth metadata:",
      updateError.message,
    );
  }
}

/**
 * Idempotently creates a profiles row for a newly signed-up user.
 * Uses the service-role client so it works when email confirmation is ON
 * (no session / RLS insert yet) and when a session is issued immediately.
 *
 * Does not overwrite an existing row (safe to call from signup, auth callback,
 * and login bootstrap).
 *
 * Unique violations (`23505`): re-select by `user_id` before claiming success.
 * If this user still has no row, treat it as a `public_id` collision and retry
 * with a new id (C1-010). Invalid `public_id` values are replaced (C1-038).
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

  let publicId = isValidPublicId(input.public_id)
    ? input.public_id
    : generatePublicId();

  for (let attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt++) {
    const { error: insertError } = await admin.from("profiles").insert({
      user_id: input.userId,
      public_id: publicId,
      first_name: input.first_name,
      last_name: input.last_name,
      location: null,
      portfolio_url: null,
      linkedin_url: null,
      profile_picture_url: null,
    });

    if (!insertError) {
      if (publicId !== input.public_id) {
        await syncPublicIdToAuthMetadata(admin, input.userId, publicId);
      }
      return { error: null };
    }

    if (insertError.code !== "23505") {
      console.error("createInitialProfile insert failed:", insertError.message);
      return { error: insertError.message };
    }

    // Unique violation: either concurrent insert for this user_id, or public_id taken.
    const { data: afterConflict, error: reselectError } = await admin
      .from("profiles")
      .select("user_id")
      .eq("user_id", input.userId)
      .maybeSingle();

    if (reselectError) {
      console.error(
        "createInitialProfile re-select after 23505 failed:",
        reselectError.message,
      );
      return { error: reselectError.message };
    }

    if (afterConflict) {
      return { error: null };
    }

    // public_id collision for another user — retry with a fresh id.
    publicId = generatePublicId();
  }

  console.error(
    "createInitialProfile: exhausted public_id retries after unique violations",
  );
  return { error: "Could not assign a unique public_id" };
}
