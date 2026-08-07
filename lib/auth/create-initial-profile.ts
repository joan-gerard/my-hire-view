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

/** Max insert/update attempts when `public_id` collides with another user’s row. */
const MAX_PUBLIC_ID_ATTEMPTS = 3;

type AdminClient = ReturnType<typeof createAdminClient>;

type ProfileRow = {
  user_id: string;
  public_id: string | null;
};

/**
 * Ensures Auth `user_metadata.public_id` matches the profiles row value.
 * No-ops when already equal (after reading Auth). Errors are always prefixed.
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
    return { error: `Auth public_id sync failed: ${message}` };
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
    return { error: `Auth public_id sync failed: ${updateError.message}` };
  }

  return { error: null };
}

/**
 * Conditionally replaces a stale/invalid `public_id` on an existing profiles row.
 * Only updates when the row still has `stalePublicId`; otherwise re-reads the
 * canonical value (concurrent repair). Retries on unique collisions.
 */
async function repairProfilePublicId(
  admin: AdminClient,
  userId: string,
  stalePublicId: string | null,
  preferredPublicId: string,
): Promise<{ publicId: string | null; error: string | null }> {
  let publicId = isValidPublicId(preferredPublicId)
    ? preferredPublicId
    : generatePublicId();
  let expectedStale = stalePublicId;

  for (let attempt = 0; attempt < MAX_PUBLIC_ID_ATTEMPTS; attempt++) {
    let query = admin
      .from("profiles")
      .update({ public_id: publicId })
      .eq("user_id", userId);

    if (expectedStale === null) {
      query = query.is("public_id", null);
    } else {
      query = query.eq("public_id", expectedStale);
    }

    const { data, error } = await query.select("public_id").maybeSingle();

    if (error) {
      if (error.code === "23505") {
        publicId = generatePublicId();
        continue;
      }
      console.error(
        "createInitialProfile: failed to repair public_id:",
        error.message,
      );
      return { publicId: null, error: error.message };
    }

    if (data?.public_id && isValidPublicId(data.public_id)) {
      return { publicId: data.public_id, error: null };
    }

    // No row matched — another request likely repaired; re-read canonical.
    const { data: current, error: readError } = await admin
      .from("profiles")
      .select("public_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (readError) {
      return { publicId: null, error: readError.message };
    }

    if (current?.public_id && isValidPublicId(current.public_id)) {
      return { publicId: current.public_id, error: null };
    }

    expectedStale =
      typeof current?.public_id === "string" ? current.public_id : null;
    publicId = generatePublicId();
  }

  return {
    publicId: null,
    error: "Could not assign a unique public_id",
  };
}

/**
 * Existing-row path: repair invalid `public_id` if needed, then always
 * reconcile Auth via sync (exact-value no-op when already matching).
 */
async function reconcileExistingProfile(
  admin: AdminClient,
  input: InitialProfileInput,
  existing: ProfileRow,
): Promise<{ error: string | null }> {
  let publicId =
    typeof existing.public_id === "string" ? existing.public_id : "";

  if (!isValidPublicId(publicId)) {
    const repaired = await repairProfilePublicId(
      admin,
      input.userId,
      typeof existing.public_id === "string" ? existing.public_id : null,
      input.public_id,
    );
    if (repaired.error || !repaired.publicId) {
      return {
        error: repaired.error ?? "Could not repair invalid public_id",
      };
    }
    publicId = repaired.publicId;
  }

  return syncPublicIdToAuthMetadata(admin, input.userId, publicId);
}

/**
 * Idempotently creates a profiles row for a newly signed-up user.
 * Uses the service-role client so it works when email confirmation is ON
 * (no session / RLS insert yet) and when a session is issued immediately.
 *
 * Does not overwrite an existing row’s names (safe to call from signup, auth
 * callback, and login bootstrap). Ensures a valid `public_id` on the row and
 * reconciles Auth metadata when needed.
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
    return reconcileExistingProfile(admin, input, existing);
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
      return syncPublicIdToAuthMetadata(admin, input.userId, publicId);
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
      return reconcileExistingProfile(admin, input, afterConflict);
    }

    // public_id collision for another user — retry with a fresh id.
    publicId = generatePublicId();
  }

  console.error(
    "createInitialProfile: exhausted public_id retries after unique violations",
  );
  return { error: "Could not assign a unique public_id" };
}
