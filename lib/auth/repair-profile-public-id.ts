import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generatePublicId,
  isValidPublicId,
} from "@/lib/utils/public-id";

/** Shared bound for conditional public_id repair / collision retries. */
export const PUBLIC_ID_REPAIR_MAX_ATTEMPTS = 3;

export type RepairProfilePublicIdOptions = {
  userId: string;
  /** Value currently on the row (may be invalid); used as the conditional update filter. */
  stalePublicId: string | null;
  /** Preferred new id when valid and not owned by another user; otherwise generated. */
  preferredPublicId: string;
};

export type RepairProfilePublicIdResult = {
  publicId: string | null;
  error: string | null;
};

/**
 * Returns `candidate` when it is format-valid and not already owned by a
 * different user; otherwise generates a fresh id.
 */
export async function choosePreferredPublicId(
  client: SupabaseClient,
  userId: string,
  candidate: string | null | undefined,
): Promise<string> {
  if (!candidate || !isValidPublicId(candidate)) {
    return generatePublicId();
  }

  const { data } = await client
    .from("profiles")
    .select("user_id")
    .eq("public_id", candidate)
    .maybeSingle();

  if (!data || data.user_id === userId) {
    return candidate;
  }

  return generatePublicId();
}

/**
 * Conditionally replaces a stale/invalid `public_id` on an existing profiles row.
 * Only updates `public_id` (never names or other columns). Only updates when the
 * row still has `stalePublicId`; otherwise re-reads the canonical value
 * (concurrent repair). Retries on unique collisions.
 *
 * Shared by signup bootstrap (`createInitialProfile`) and application-create
 * safety net (`ensureProfilePublicId`).
 */
export async function repairProfilePublicId(
  client: SupabaseClient,
  options: RepairProfilePublicIdOptions,
): Promise<RepairProfilePublicIdResult> {
  const { userId } = options;
  let publicId = await choosePreferredPublicId(
    client,
    userId,
    options.preferredPublicId,
  );
  let expectedStale = options.stalePublicId;

  for (let attempt = 0; attempt < PUBLIC_ID_REPAIR_MAX_ATTEMPTS; attempt++) {
    let query = client
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
      return { publicId: null, error: error.message };
    }

    if (data?.public_id && isValidPublicId(data.public_id)) {
      return { publicId: data.public_id, error: null };
    }

    // No row matched — another request likely repaired; re-read canonical.
    const { data: current, error: readError } = await client
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
