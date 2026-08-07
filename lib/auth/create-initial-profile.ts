import { createAdminClient } from "@/lib/supabase/admin";
import {
  generatePublicId,
  isValidPublicId,
} from "@/lib/utils/public-id";

export type InitialProfileInput = {
  userId: string;
  first_name: string;
  last_name: string;
  /** May be empty or invalid — regenerated before insert (C1-038). */
  public_id: string;
};

/** Max insert attempts when `public_id` collides with another user’s row. */
const MAX_PUBLIC_ID_ATTEMPTS = 3;

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Ensures Auth `user_metadata.public_id` matches the profiles row value.
 * No-ops when already equal. Returns an error if get/update fails so callers
 * do not treat a divergent metadata state as success.
 */
async function syncPublicIdToAuthMetadata(
  admin: AdminClient,
  userId: string,
  publicId: string,
): Promise<{ error: string | null }> {
  const { data, error: getError } = await admin.auth.admin.getUserById(userId);
  if (getError || !data.user) {
    const message = getError?.message ?? "user missing";
    console.error(
      "createInitialProfile: failed to load Auth user for public_id sync:",
      message,
    );
    return { error: message };
  }

  const current = data.user.user_metadata?.public_id;
  if (typeof current === "string" && current === publicId) {
    return { error: null };
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
    return { error: updateError.message };
  }

  return { error: null };
}

/**
 * Idempotently creates a profiles row for a newly signed-up user.
 * Uses the service-role client so it works when email confirmation is ON
 * (no session / RLS insert yet) and when a session is issued immediately.
 *
 * Does not overwrite an existing row (safe to call from signup, auth callback,
 * and login bootstrap). Always reconciles Auth `public_id` to the profiles value
 * when a row exists or is created.
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
    .select("user_id, public_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (selectError) {
    console.error("createInitialProfile select failed:", selectError.message);
    return { error: selectError.message };
  }

  if (existing) {
    if (
      typeof existing.public_id === "string" &&
      isValidPublicId(existing.public_id)
    ) {
      return syncPublicIdToAuthMetadata(admin, input.userId, existing.public_id);
    }
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
      const sync = await syncPublicIdToAuthMetadata(
        admin,
        input.userId,
        publicId,
      );
      if (sync.error) {
        return {
          error: `Auth public_id sync failed: ${sync.error}`,
        };
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
      .select("user_id, public_id")
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
      if (
        typeof afterConflict.public_id === "string" &&
        isValidPublicId(afterConflict.public_id)
      ) {
        return syncPublicIdToAuthMetadata(
          admin,
          input.userId,
          afterConflict.public_id,
        );
      }
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
